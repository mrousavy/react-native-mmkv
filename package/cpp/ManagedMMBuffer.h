//
//  ManagedMMBuffer.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#pragma once


#include "MmkvTypes.h" // IWYU pragma: keep
#include <jsi/jsi.h>

using namespace facebook;

/**
 A jsi::MutableBuffer that manages MMBuffer memory (by ownership).
 */
class ManagedMMBuffer : public jsi::MutableBuffer {
public:
  explicit ManagedMMBuffer(MMBuffer&& buffer) : _buffer(std::move(buffer)) {}

  uint8_t* data() override {
    return static_cast<uint8_t*>(_buffer.getPtr());
  }

  size_t size() const override {
    return _buffer.length();
  }

private:
  MMBuffer _buffer;
};
