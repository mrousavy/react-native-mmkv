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

FastString FastString::from_jsi_string(jsi::Runtime& runtime, const jsi::String& str) {
  FastString result;

  // Use a small vector optimization for parts
  // Most strings will be single-part, so avoid heap allocation
  static constexpr size_t INLINE_PARTS = 4;
  std::array<std::string, INLINE_PARTS> inline_parts;
  std::vector<std::string> heap_parts;
  size_t part_count = 0;

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

    // Need to store this part
    if (part_count < INLINE_PARTS) {
      if (ascii) {
        inline_parts[part_count].assign(static_cast<const char*>(data), num);
      } else {
        // Convert UTF16 to UTF8
        const char16_t* utf16_data = static_cast<const char16_t*>(data);
        inline_parts[part_count] = utf::utf16_to_utf8(utf16_data, num);
      }
    } else {
      // Switch to heap storage if we exceed inline capacity
      if (part_count == INLINE_PARTS) {
        heap_parts.reserve(8); // Reasonable guess for max parts
        heap_parts.insert(heap_parts.end(), std::make_move_iterator(inline_parts.begin()),
                          std::make_move_iterator(inline_parts.end()));
      }

      if (ascii) {
        heap_parts.emplace_back(static_cast<const char*>(data), num);
      } else {
        const char16_t* utf16_data = static_cast<const char16_t*>(data);
        heap_parts.push_back(utf::utf16_to_utf8(utf16_data, num));
      }
    }
    part_count++;
    first_callback = false;
  };

  str.getStringData(runtime, callback);

  if (first_data != nullptr && part_count == 0) {
    // Zero-copy case - single ASCII part
    result.data.reset(new Data(first_data, first_length), Deleter(true));
    result.is_view = true;
  } else {
    // Need to concatenate
    std::string concatenated;
    size_t total_size = 0;

    // Calculate total size
    if (first_data)
      total_size += first_length;
    if (part_count <= INLINE_PARTS) {
      for (size_t i = 0; i < part_count; i++) {
        total_size += inline_parts[i].size();
      }
    } else {
      for (const auto& part : heap_parts) {
        total_size += part.size();
      }
    }

    concatenated.reserve(total_size);

    // Build final string
    if (first_data) {
      concatenated.append(first_data, first_length);
    }
    if (part_count <= INLINE_PARTS) {
      for (size_t i = 0; i < part_count; i++) {
        concatenated += inline_parts[i];
      }
    } else {
      for (const auto& part : heap_parts) {
        concatenated += part;
      }
    }

    result.data.reset(new Data(std::move(concatenated)), Deleter(false));
    result.is_view = false;
  }

  return result;
}
