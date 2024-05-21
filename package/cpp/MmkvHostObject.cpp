//
//  MmkvHostObject.cpp
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#include "MmkvHostObject.h"
#include "MMKVManagedBuffer.h"
#include "MmkvLogger.h"
#include <MMKV.h>
#include <string>
#include <vector>

using namespace mmkv;
using namespace facebook;

MmkvHostObject::MmkvHostObject(const facebook::react::MMKVConfig& config) {
  std::string path = config.path.has_value() ? config.path.value() : "";
  std::string encryptionKey = config.encryptionKey.has_value() ? config.encryptionKey.value() : "";
  bool hasEncryptionKey = encryptionKey.size() > 0;
  MmkvLogger::log("RNMMKV", "Creating MMKV instance \"%s\"... (Path: %s, Encrypted: %s)",
                  config.id.c_str(), path.c_str(), hasEncryptionKey ? "true" : "false");

  std::string* pathPtr = path.size() > 0 ? &path : nullptr;
  std::string* encryptionKeyPtr = encryptionKey.size() > 0 ? &encryptionKey : nullptr;
  MMKVMode mode = getMMKVMode(config);

#ifdef __APPLE__
  instance = MMKV::mmkvWithID(config.id, mode, encryptionKeyPtr, pathPtr);
#else
  instance = MMKV::mmkvWithID(config.id, DEFAULT_MMAP_SIZE, mode, encryptionKeyPtr, pathPtr);
#endif

  if (instance == nullptr) {
    // Check if instanceId is invalid
    if (config.id.empty()) {
      throw std::runtime_error("Failed to create MMKV instance! `id` cannot be empty!");
    }

    // Check if encryptionKey is invalid
    if (encryptionKey.size() > 16) {
      throw std::runtime_error(
          "Failed to create MMKV instance! `encryptionKey` cannot be longer than 16 bytes!");
    }

    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

MmkvHostObject::~MmkvHostObject() {
  if (instance != nullptr) {
    std::string instanceId = instance->mmapID();
    MmkvLogger::log("RNMMKV", "Destroying MMKV instance \"%s\"...", instanceId.c_str());
    instance->sync();
    instance->clearMemoryCache();
  }
  instance = nullptr;
}

std::vector<jsi::PropNameID> MmkvHostObject::getPropertyNames(jsi::Runtime& rt) {
  return jsi::PropNameID::names(rt, "set", "getBoolean", "getBuffer", "getString", "getNumber",
                                "contains", "delete", "getAllKeys", "deleteAll", "recrypt", "trim",
                                "size");
}

MMKVMode MmkvHostObject::getMMKVMode(const facebook::react::MMKVConfig& config) {
  if (!config.mode.has_value()) {
    return MMKVMode::MMKV_SINGLE_PROCESS;
  }
  react::MmkvCxxMode mode = config.mode.value();
  switch (mode) {
    case react::MmkvCxxMode::SINGLE_PROCESS:
      return MMKVMode::MMKV_SINGLE_PROCESS;
    case react::MmkvCxxMode::MULTI_PROCESS:
      return MMKVMode::MMKV_MULTI_PROCESS;
    default:
      throw std::runtime_error("Invalid MMKV Mode value!");
  }
}

jsi::Value MmkvHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propNameId) {
  std::string propName = propNameId.utf8(runtime);

  if (propName == "set") {
    // MMKV.set(key: string, value: string | number | bool | ArrayBuffer)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        2, // key, value
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 2 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime,
                               "MMKV::set: First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);

          if (arguments[1].isBool()) {
            // bool
            instance->set(arguments[1].getBool(), keyName);
          } else if (arguments[1].isNumber()) {
            // number
            instance->set(arguments[1].getNumber(), keyName);
          } else if (arguments[1].isString()) {
            // string
            std::string stringValue = arguments[1].asString(runtime).utf8(runtime);
            instance->set(stringValue, keyName);
          } else if (arguments[1].isObject()) {
            // object
            jsi::Object object = arguments[1].asObject(runtime);
            if (object.isArrayBuffer(runtime)) {
              // ArrayBuffer
              jsi::ArrayBuffer arrayBuffer = object.getArrayBuffer(runtime);
              MMBuffer data(arrayBuffer.data(runtime), arrayBuffer.size(runtime), MMBufferNoCopy);
              instance->set(data, keyName);
            } else {
              // unknown object
              throw jsi::JSError(
                  runtime,
                  "MMKV::set: 'value' argument is an object, but not of type ArrayBuffer!");
            }
          } else {
            // unknown type
            throw jsi::JSError(
                runtime,
                "MMKV::set: 'value' argument is not of type bool, number, string or buffer!");
          }

          return jsi::Value::undefined();
        });
  }

  if (propName == "getBoolean") {
    // MMKV.getBoolean(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          bool hasValue;
          bool value = instance->getBool(keyName, false, &hasValue);
          if (!hasValue) {
            [[unlikely]];
            return jsi::Value::undefined();
          }
          return jsi::Value(value);
        });
  }

  if (propName == "getNumber") {
    // MMKV.getNumber(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          bool hasValue;
          double value = instance->getDouble(keyName, 0.0, &hasValue);
          if (!hasValue) {
            [[unlikely]];
            return jsi::Value::undefined();
          }
          return jsi::Value(value);
        });
  }

  if (propName == "getString") {
    // MMKV.getString(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          std::string result;
          bool hasValue = instance->getString(keyName, result);
          if (!hasValue) {
            [[unlikely]];
            return jsi::Value::undefined();
          }
          return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
        });
  }

  if (propName == "getBuffer") {
    // MMKV.getBuffer(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          mmkv::MMBuffer buffer;
          bool hasValue = instance->getBytes(keyName, buffer);
          if (!hasValue) {
            [[unlikely]];
            return jsi::Value::undefined();
          }
          auto mutableData = std::make_shared<MMKVManagedBuffer>(std::move(buffer));
          return jsi::ArrayBuffer(runtime, mutableData);
        });
  }

  if (propName == "contains") {
    // MMKV.contains(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          bool containsKey = instance->containsKey(keyName);
          return jsi::Value(containsKey);
        });
  }

  if (propName == "delete") {
    // MMKV.delete(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1 || !arguments[0].isString()) {
            [[unlikely]];
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          std::string keyName = arguments[0].asString(runtime).utf8(runtime);
          instance->removeValueForKey(keyName);
          return jsi::Value::undefined();
        });
  }

  if (propName == "getAllKeys") {
    // MMKV.getAllKeys()
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          std::vector<std::string> keys = instance->allKeys();
          jsi::Array array(runtime, keys.size());
          for (int i = 0; i < keys.size(); i++) {
            array.setValueAtIndex(runtime, i, keys[i]);
          }
          return array;
        });
  }

  if (propName == "clearAll") {
    // MMKV.clearAll()
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          instance->clearAll();
          return jsi::Value::undefined();
        });
  }

  if (propName == "recrypt") {
    // MMKV.recrypt(encryptionKey)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName),
        1, // encryptionKey
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (count != 1) {
            [[unlikely]];
            throw jsi::JSError(runtime, "Expected 1 argument (encryptionKey), but received " +
                                            std::to_string(count) + "!");
          }

          if (arguments[0].isUndefined()) {
            // reset encryption key to "no encryption"
            instance->reKey(std::string());
          } else if (arguments[0].isString()) {
            // reKey(..) with new encryption-key
            std::string encryptionKey = arguments[0].getString(runtime).utf8(runtime);
            instance->reKey(encryptionKey);
          } else {
            // Invalid argument (maybe object?)
            throw jsi::JSError(
                runtime,
                "First argument ('encryptionKey') has to be of type string (or undefined)!");
          }

          return jsi::Value::undefined();
        });
  }

  if (propName == "trim") {
    // MMKV.trim()
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, propName), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          instance->clearMemoryCache();
          instance->trim();

          return jsi::Value::undefined();
        });
  }

  if (propName == "size") {
    // MMKV.size
    size_t size = instance->actualSize();
    return jsi::Value(static_cast<int>(size));
  }

  return jsi::Value::undefined();
}
