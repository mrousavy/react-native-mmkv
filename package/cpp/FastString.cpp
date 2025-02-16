//
//  FastString.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 16.02.25.
//

#include "FastString.h"
#include "UTFConversion.h"

using namespace facebook;

FastString FastString::makeFromJsiString(jsi::Runtime& runtime, const jsi::String& str) {
  FastString result;
  
  bool isFirstRun = true;

  auto callback = [&result, &isFirstRun](bool isAscii, const void* data, size_t length) {
      if (isAscii) [[likely]] {
        // UTF8 (fast path, no conversion)
        auto utf8Data = static_cast<const char*>(data);
        if (isFirstRun) [[likely]] {
          // FAST: Set the initial data to simply wrap this buffer
          result.setData(utf8Data, length);
          isFirstRun = false;
        } else {
          // SLOW: Append data to the existing string
          result.string().append(utf8Data, length);
        }
      } else {
        // UTF16 (slow path, conversion to UTF8 happens)
        auto utf16Data = static_cast<const char16_t*>(data);
        std::string utf8String = utf16_to_utf8(utf16Data, length);
        
        if (isFirstRun) [[likely]] {
          result.setData(std::move(utf8String));
          isFirstRun = false;
        } else {
          result.string().append(std::move(utf8String));
        }
      }
  };

  str.getStringData(runtime, callback);

  return result;
}
