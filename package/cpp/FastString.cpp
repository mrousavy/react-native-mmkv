//
//  FastString.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 16.02.25.
//

#include "FastString.h"

using namespace facebook;

// UTF16 to UTF8 conversion helper functions
namespace utf {
inline bool is_high_surrogate(char16_t c) {
  return (c & 0xFC00) == 0xD800;
}

inline bool is_low_surrogate(char16_t c) {
  return (c & 0xFC00) == 0xDC00;
}

inline char32_t combine_surrogates(char16_t high, char16_t low) {
  return (((high & 0x3FF) << 10) | (low & 0x3FF)) + 0x10000;
}

// Appends UTF8 encoded bytes to string
inline void append_utf8(std::string& str, char32_t codepoint) {
  if (codepoint <= 0x7F) {
    str += static_cast<char>(codepoint);
  } else if (codepoint <= 0x7FF) {
    str += static_cast<char>(0xC0 | ((codepoint >> 6) & 0x1F));
    str += static_cast<char>(0x80 | (codepoint & 0x3F));
  } else if (codepoint <= 0xFFFF) {
    str += static_cast<char>(0xE0 | ((codepoint >> 12) & 0x0F));
    str += static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F));
    str += static_cast<char>(0x80 | (codepoint & 0x3F));
  } else if (codepoint <= 0x10FFFF) {
    str += static_cast<char>(0xF0 | ((codepoint >> 18) & 0x07));
    str += static_cast<char>(0x80 | ((codepoint >> 12) & 0x3F));
    str += static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F));
    str += static_cast<char>(0x80 | (codepoint & 0x3F));
  }
}

// Converts UTF16 to UTF8, returning string
inline std::string utf16_to_utf8(const char16_t* data, size_t length) {
  std::string result;
  result.reserve(length * 3); // Worst case: each UTF16 char becomes 3 UTF8 bytes

  for (size_t i = 0; i < length;) {
    char16_t c = data[i++];

    if (is_high_surrogate(c) && i < length && is_low_surrogate(data[i])) {
      // Surrogate pair
      char32_t codepoint = combine_surrogates(c, data[i++]);
      append_utf8(result, codepoint);
    } else if (!is_high_surrogate(c) && !is_low_surrogate(c)) {
      // Regular UTF16 character
      append_utf8(result, c);
    } else {
      // Invalid surrogate - replace with replacement character
      append_utf8(result, 0xFFFD);
    }
  }

  return result;
}
} // namespace utf

FastString FastString::makeFromJsiString(jsi::Runtime& runtime, const jsi::String& str) {
  FastString result;

  bool first_callback = true;
  const char* first_data = nullptr;
  size_t first_length = 0;

  auto callback = [&](bool ascii, const void* data, size_t num) {
    if (first_callback && ascii) {
      // Opportunity for zero-copy
      first_data = static_cast<const char*>(data);
      first_length = num;
      first_callback = false;
      return;
    }
  };

  str.getStringData(runtime, callback);

  if (first_data != nullptr) [[likely]] {
    // Zero-copy case - single ASCII part
    result.setData(first_data, first_length);
  } else {
    throw "not imp";
  }

  return result;
}
