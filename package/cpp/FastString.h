//
//  FastString.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 16.02.25.
//

#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <string_view>
#include <vector>

using namespace facebook;

/**
 * A String holder that is optimized for zero-copy access (`std::string_view`),
 * but can still operate on normal `std::string`s as fallback.
 */
class FastString {
private:
  // Use union to avoid wasting memory - we only need one of these at a time
  union Data {
    struct View {
      const char* data;
      size_t length;

      View(const char* d, size_t len) : data(d), length(len) {}
    } view;

    struct Owned {
      std::string str;

      Owned(std::string&& s) : str(std::move(s)) {}
      Owned(const char* data, size_t len) : str(data, len) {}
    } owned;

    // Union constructors
    Data(const char* d, size_t len) : view(d, len) {}
    Data(std::string&& s) : owned(std::move(s)) {}

    // Destructor must be called manually since we're using a union
    ~Data() {}
  };

  mutable std::shared_ptr<Data> data;
  mutable bool is_view;

  // Helper to properly destroy union data
  static void destroy_data(Data* d, bool is_view) {
    if (is_view) {
      d->view.~View();
    } else {
      d->owned.~Owned();
    }
  }

  // Custom deleter for shared_ptr to properly handle union cleanup
  struct Deleter {
    bool is_view;
    Deleter(bool v) : is_view(v) {}

    void operator()(Data* d) {
      destroy_data(d, is_view);
      delete d;
    }
  };

public:
  // Default constructor creates empty owned string
  FastString() : data(new Data(std::string())), is_view(false) {}

  static FastString from_jsi_string(jsi::Runtime& runtime, const jsi::String& str);

  // Access methods
  std::string_view view() const {
    if (is_view) {
      printf("IT IS AN OPTIMIZED STRING VIEW!");
      return std::string_view(data->view.data, data->view.length);
    }
    printf("IT IS NOT AN OPTMIZED STRING VIEW!!!");
    return std::string_view(data->owned.str);
  }

  const std::string& string() const& {
    if (!is_view) {
      return data->owned.str;
    }
    // Convert view to owned string
    auto new_data = new Data(std::string(data->view.data, data->view.length));
    data.reset(new_data, Deleter(false));
    is_view = false;
    return data->owned.str;
  }

  // Move overload for string()
  std::string string() && {
    if (!is_view) {
      return std::move(data->owned.str);
    }
    return std::string(data->view.data, data->view.length);
  }

  // Common string operations
  size_t size() const noexcept {
    return is_view ? data->view.length : data->owned.str.size();
  }

  bool empty() const noexcept {
    return size() == 0;
  }

  // Comparison operators
  bool operator==(const FastString& other) const {
    return view() == other.view();
  }

  bool operator!=(const FastString& other) const {
    return !(*this == other);
  }
};
