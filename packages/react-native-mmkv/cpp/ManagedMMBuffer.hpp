//
//  ManagedMMBuffer.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#pragma once

#include "MMKVTypes.hpp"
#include <NitroModules/ArrayBuffer.hpp>

namespace margelo::nitro::mmkv {

/**
 An ArrayBuffer subclass that manages MMBuffer memory (by ownership).
 */
class ManagedMMBuffer : public ArrayBuffer {
public:
  explicit ManagedMMBuffer(MMBuffer&& buffer) : _buffer(std::move(buffer)) {}

public:
  bool isOwner() const noexcept override {
    return true;
  }

public:
  uint8_t* data() override {
    return static_cast<uint8_t*>(_buffer.getPtr());
  }

  size_t size() const override {
    return _buffer.length();
  }

private:
  MMBuffer _buffer;
};

} // namespace margelo::nitro::mmkv
