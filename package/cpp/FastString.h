//
//  FastString.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 16.02.25.
//

#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <string_view>
#include <vector>

using namespace facebook;

// Set this to true to optimize for zero-copy view path, false to optimize for copy std::string
// path.
#define OPTIMIZE_FOR_VIEW true

#if OPTIMIZE_FOR_VIEW
#define VIEW_PATH [[likely]]
#define OWNED_PATH
#else
#define VIEW_PATH
#define OWNED_PATH [[likely]]
#endif

/**
 * A String holder that is optimized for zero-copy access (`std::string_view`),
 * but can still operate on normal `std::string`s as fallback.
 *
 * If used with JSI, the resulting string may hold a reference to the underlying `char*`
 * of the `jsi::String` which is only guaranteed to be safely accessible as long
 * as no other operations have been made on the Runtime, and the function has not
 * returned yet.
 */
class FastString {
private:
  /**
   * Stores the underlying string - it's either a View (`char*`) or an Owned `std::string`.
   */
  union Data {
    struct View {
      const char* data;
      size_t length;

      View(const char* d, size_t len) : data(d), length(len) {}

      inline std::string copyToString() const {
        return std::string(data, length);
      }
    } view;

    struct Owned {
      std::string string;

      Owned(std::string&& s) : string(std::move(s)) {}
      Owned(const std::string& s) : string(s) {}
      Owned(const char* data, size_t len) : string(data, len) {}
    } owned;

    // Construct View
    Data(const char* d, size_t len) : view(d, len) {}
    // Construct Owned
    Data(std::string&& s) : owned(std::move(s)) {}
    Data(const std::string& s) : owned(s) {}

    // No copy
    Data(const Data&) = delete;
    // Allow move
    Data(Data&&) = delete;

    static Data copyFrom(const FastString& string) {
      if (string._isView)
        VIEW_PATH {
          return Data(string._data.view.data, string._data.view.length);
        }
      else
        OWNED_PATH {
          return Data(string._data.owned.string);
        }
    }
    static Data moveFrom(FastString& string) {
      if (string._isView)
        VIEW_PATH {
          return Data(string._data.view.data, string._data.view.length);
        }
      else
        OWNED_PATH {
          return Data(std::move(string._data.owned.string));
        }
    }

    ~Data() { /* caller is responsible for cleaning up View/Owned */ }
  };

  mutable Data _data;
  bool _isView;
  friend Data;

private:
  void setData(const char* data, size_t length) {
    if (!_isView)
      OWNED_PATH {
        _data.owned.~Owned();
      }
    _data.view = Data::View(data, length);
    _isView = true;
  }
  void setData(std::string&& string) {
    if (_isView)
      VIEW_PATH {
        _data.view.~View();
      }
    _data.owned = Data::Owned(std::move(string));
    _isView = false;
  }
  void setData(const std::string& string) {
    if (_isView)
      VIEW_PATH {
        _data.view.~View();
      }
    _data.owned = Data::Owned(string);
    _isView = false;
  }

public:
  // Default constructor creates empty string view
  FastString() : _data(Data(nullptr, 0)), _isView(true) {}
  ~FastString() {
    if (_isView)
      VIEW_PATH {
        _data.view.~View();
      }
    else
      OWNED_PATH {
        _data.owned.~Owned();
      }
  }

  FastString(const FastString& other) : _data(Data::copyFrom(other)), _isView(other._isView) {}
  FastString(FastString&& other) : _data(Data::moveFrom(other)), _isView(other._isView) {}

  void operator=(const FastString& other) {
    // Copy assignment
    if (other._isView)
      VIEW_PATH {
        setData(other._data.view.data, other._data.view.length);
      }
    else
      OWNED_PATH {
        setData(other._data.owned.string);
      }
  }
  void operator=(FastString&& other) {
    // Move assignment
    if (other._isView)
      VIEW_PATH {
        setData(other._data.view.data, other._data.view.length);
      }
    else
      OWNED_PATH {
        // When moving an owned data, we transfer the std::string.
        setData(std::move(other._data.owned.string));
      }
  }

  /**
   * Returns a `FastString` for the given `jsi::String`.
   * - If the `jsi::String` holds a single partitioned piece of UTF8 data, the returned `FastString`
   *   is a zero-copy pointer to the same buffer.
   *   In this case `isView()` is `true`, and the `FastString` can only safely be used as long as
   *   no other operations on the `jsi::Runtime` have been made.
   * - If `isView()` is `false`, the returned `FastString` is actually the owner of the string and can
   *   safely be accessed from any Thread, as long as the value exists.
   *
   * Calling `.view()` on a `FastString` allows read-only access.
   * Calling `.string()` on a `FastString` converts it to an owned string if necessary (`isView() == false`).
   */
  static FastString makeFromJsiString(jsi::Runtime& runtime, const jsi::String& str);

  // Access methods
  inline bool isView() const noexcept {
    return _isView;
  }

  /**
   * Returns a read-only `std::string_view` that points to this `FastString`'s data.
   * If this `FastString` is a zero-copy string (`isView() == true`), this points to that `char*` buffer.
   * If this `FastString` is an owned string (`isView() == false`), this points to the `std::string`
   */
  std::string_view view() const {
    if (_isView)
      VIEW_PATH {
        return std::string_view(_data.view.data, _data.view.length);
      }
    else
      OWNED_PATH {
        return std::string_view(_data.owned.string);
      }
  }

  /**
   * Returns an `std::string` for this `FastString`.
   * If this `FastString` is a zero-copy string (`isView() == true`), a copy will be made to convert it to an owned string.
   * If this `FastString` already is an owned string (`isView() == false`), this points to that `std::string`.
   */
  std::string& string() const& {
    if (_isView)
      VIEW_PATH {
        // Copy view data into an owned string now and change it's type to owned.
        const_cast<FastString*>(this)->setData(_data.view.copyToString());
        return _data.owned.string;
      }
    else
      OWNED_PATH {
        return _data.owned.string;
      }
  }

  // Move overload for string()
  std::string string() && {
    if (_isView)
      VIEW_PATH {
        // Create a new string and don't bother switching `this` type to owned because we're moving
        // anyways.
        return std::string(_data.view.data, _data.view.length);
      }
    else
      OWNED_PATH {
        // Move our owned string away.
        return std::move(_data.owned.string);
      }
  }

  // Common string operations
  size_t size() const noexcept {
    if (_isView)
      VIEW_PATH {
        return _data.view.length;
      }
    else
      OWNED_PATH {
        return _data.owned.string.size();
      }
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
