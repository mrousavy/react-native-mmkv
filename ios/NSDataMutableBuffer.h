//
//  NSDataMutableBuffer.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#pragma once

#include <jsi/jsi.h>

using namespace facebook;

/**
 A jsi::MutableBuffer that manages a NSData* instance.
 */
class NSDataMutableBuffer: public jsi::MutableBuffer {
public:
  explicit NSDataMutableBuffer(NSData* data): _data(data) { }

  uint8_t* data() override {
    return (uint8_t*)(_data.bytes);
  }

  size_t size() const override {
    return _data.length;
  }

private:
  NSData* _data;
};
