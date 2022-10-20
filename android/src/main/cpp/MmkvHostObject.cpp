//
//  MmkvHostObject.cpp
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#include "MmkvHostObject.h"
#include "TypedArray.h"
#include <MMKV.h>
#include <android/log.h>
#include <string>
#include <vector>

MmkvHostObject::MmkvHostObject(const std::string& instanceId, std::string path, std::string cryptKey) {
  __android_log_print(ANDROID_LOG_INFO, "RNMMKV", "Creating MMKV instance \"%s\"... (Path: %s, Encryption-Key: %s)",
                      instanceId.c_str(), path.c_str(), cryptKey.c_str());
  std::string* pathPtr = path.size() > 0 ? &path : nullptr;
  std::string* cryptKeyPtr = cryptKey.size() > 0 ? &cryptKey : nullptr;
  instance = MMKV::mmkvWithID(instanceId, mmkv::DEFAULT_MMAP_SIZE, MMKV_SINGLE_PROCESS, cryptKeyPtr, pathPtr);

  if (instance == nullptr) {
    // Check if instanceId is invalid
    if (instanceId.empty()) {
      throw std::runtime_error("Failed to create MMKV instance! `id` cannot be empty!");
    }

    // Check if encryptionKey is invalid
    if (cryptKey.size() > 16) {
      throw std::runtime_error("Failed to create MMKV instance! `encryptionKey` cannot be longer than 16 bytes!");
    }

    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

std::vector<jsi::PropNameID> MmkvHostObject::getPropertyNames(jsi::Runtime& rt) {
  std::vector<jsi::PropNameID> result;
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("set")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getBoolean")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getString")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getNumber")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("contains")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("delete")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getAllKeys")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("deleteAll")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("recrypt")));
  return result;
}

jsi::Value MmkvHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propNameId) {
  auto propName = propNameId.utf8(runtime);
  auto funcName = "MMKV." + propName;

  if (propName == "set") {
    // MMKV.set(key: string, value: string | number | bool)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 2,  // key, value
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "MMKV::set: First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);

      if (arguments[1].isBool()) {
        // bool
        instance->set(arguments[1].getBool(), keyName);
      } else if (arguments[1].isNumber()) {
        // number
        instance->set(arguments[1].getNumber(), keyName);
      } else if (arguments[1].isString()) {
        // string
        auto stringValue = arguments[1].getString(runtime).utf8(runtime);
        instance->set(stringValue, keyName);
      } else if (arguments[1].isObject()) {
        // object
        auto object = arguments[1].asObject(runtime);
        if (isTypedArray(runtime, object)) {
          // Uint8Array
          auto typedArray = getTypedArray(runtime, object);
          auto bufferValue = typedArray.getBuffer(runtime);
          mmkv::MMBuffer buffer(bufferValue.data(runtime),
                                bufferValue.size(runtime),
                                mmkv::MMBufferCopyFlag::MMBufferNoCopy);
          instance->set(buffer, keyName);
        } else {
          // unknown object
          throw jsi::JSError(runtime, "MMKV::set: 'value' argument is an object, but not of type Uint8Array!");
        }
      } else {
        // unknown type
        throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number, string or buffer!");
      }

      return jsi::Value::undefined();
    });
  }

  if (propName == "getBoolean") {
    // MMKV.getBoolean(key: string)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1,  // key
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);
      bool hasValue;
      auto value = instance->getBool(keyName, false, &hasValue);
      if (hasValue) {
        return jsi::Value(value);
      } else {
        return jsi::Value::undefined();
      }
    });
  }

  if (propName == "getString") {
    // MMKV.getString(key: string)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1,  // key
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);
      std::string result;
      bool hasValue = instance->getString(keyName, result);
      if (hasValue) {
        return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
      } else {
        return jsi::Value::undefined();
      }
    });
  }

  if (propName == "getNumber") {
    // MMKV.getNumber(key: string)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1,  // key
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);
      bool hasValue;
      auto value = instance->getDouble(keyName, 0.0, &hasValue);
      if (hasValue) {
        return jsi::Value(value);
      } else {
        return jsi::Value::undefined();
      }
    });
  }


    if (propName == "getBuffer") {
        // MMKV.getBuffer(key: string)
        return jsi::Function::createFromHostFunction(runtime,
                                                     jsi::PropNameID::forAscii(runtime, funcName),
                                                     1,  // key
                                                     [this](jsi::Runtime& runtime,
                                                            const jsi::Value& thisValue,
                                                            const jsi::Value* arguments,
                                                            size_t count) -> jsi::Value {
        if (!arguments[0].isString()) {
          throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        }

        auto keyName = arguments[0].getString(runtime).utf8(runtime);
        mmkv::MMBuffer buffer;
        bool hasValue = instance->getBytes(keyName, buffer);
        if (hasValue) {
          auto length = buffer.length();
          TypedArray<TypedArrayKind::Uint8Array> array(runtime, length);
          auto data = static_cast<const unsigned char*>(buffer.getPtr());
          std::vector<unsigned char> vector(length);
          vector.assign(data, data + length);
          array.update(runtime, vector);
          return array;
        } else {
          return jsi::Value::undefined();
        }
      });
    }

  if (propName == "contains") {
    // MMKV.contains(key: string)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1,  // key
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);
      bool containsKey = instance->containsKey(keyName);
      return jsi::Value(containsKey);
    });
  }

  if (propName == "delete") {
    // MMKV.delete(key: string)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1,  // key
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (!arguments[0].isString()) {
        throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
      }

      auto keyName = arguments[0].getString(runtime).utf8(runtime);
      instance->removeValueForKey(keyName);
      return jsi::Value::undefined();
    });
  }

  if (propName == "getAllKeys") {
    // MMKV.getAllKeys()
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 0,
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      auto keys = instance->allKeys();
      auto array = jsi::Array(runtime, keys.size());
      for (int i = 0; i < keys.size(); i++) {
        array.setValueAtIndex(runtime, i, keys[i]);
      }
      return array;
    });
  }

  if (propName == "clearAll") {
    // MMKV.clearAll()
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 0,
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      instance->clearAll();
      return jsi::Value::undefined();
    });
  }

  if (propName == "recrypt") {
    // MMKV.recrypt(encryptionKey)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName),
                                                 1, // encryptionKey
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
      if (arguments[0].isUndefined()) {
        // reset encryption key to "no encryption"
        instance->reKey(std::string());
      } else if (arguments[0].isString()) {
        // reKey(..) with new encryption-key
        auto encryptionKey = arguments[0].getString(runtime).utf8(runtime);
        instance->reKey(encryptionKey);
      } else {
        throw jsi::JSError(runtime, "First argument ('encryptionKey') has to be of type string (or undefined)!");
      }
      return jsi::Value::undefined();
    });
  }

  return jsi::Value::undefined();
}
