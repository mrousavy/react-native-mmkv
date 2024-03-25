//
//  MmkvHostObject.cpp
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#include "MmkvHostObject.h"
#include "ManagedBuffer.h"
#include <MMKV.h>
#include <string>
#include <vector>
#include "Logger.h"

using namespace mmkv;

MmkvHostObject::MmkvHostObject(const MmkvConfiguration& config) {
  std::string path = config.path.has_value() ? config.path.value() : "";
  std::string encryptionKey = config.encryptionKey.has_value() ? config.encryptionKey.value() : "";
  bool hasEncryptionKey = encryptionKey.size() > 0;
  Logger::log("RNMMKV", "Creating MMKV instance \"%s\"... (Path: %s, Encrypted: %s)",
              config.instanceId.c_str(), path.c_str(), hasEncryptionKey ? "true" : "false");
  
  std::string* pathPtr = path.size() > 0 ? &path : nullptr;
  std::string* encryptionKeyPtr = encryptionKey.size() > 0 ? &encryptionKey : nullptr;
  
#ifdef __APPLE__
  instance = MMKV::mmkvWithID(config.instanceId, MMKV_SINGLE_PROCESS, encryptionKeyPtr, pathPtr);
#else
  instance = MMKV::mmkvWithID(config.instanceId, DEFAULT_MMAP_SIZE, MMKV_SINGLE_PROCESS, encryptionKeyPtr,
                              pathPtr);
#endif

  if (instance == nullptr) {
    // Check if instanceId is invalid
    if (config.instanceId.empty()) {
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

std::vector<jsi::PropNameID> MmkvHostObject::getPropertyNames(jsi::Runtime& rt) {
  std::vector<jsi::PropNameID> result;
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("set")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getBoolean")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getBuffer")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getString")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getNumber")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("contains")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("delete")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getAllKeys")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("deleteAll")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("recrypt")));
  return result;
}

MmkvHostObject::mmkv_string_t MmkvHostObject::getStringFromJSValue(jsi::Runtime& runtime, const jsi::Value& value) {
#ifdef __APPLE__
  std::string str = value.getString(runtime).utf8(runtime);
  NSString* string = [NSString stringWithUTF8String:str.c_str()];
  return [string dataUsingEncoding:NSUTF8StringEncoding];
#else
  return value.getString(runtime).utf8(runtime);
#endif
}

MmkvHostObject::mmkv_key_t MmkvHostObject::getKeyFromJSValue(jsi::Runtime& runtime, const jsi::Value& value) {
#ifdef __APPLE__
  std::string str = value.getString(runtime).utf8(runtime);
  return [NSString stringWithUTF8String:str.c_str()];
#else
  return value.getString(runtime).utf8(runtime);
#endif
}

MmkvHostObject::mmkv_data_t MmkvHostObject::getDataFromJSValue(jsi::Runtime &runtime, const jsi::ArrayBuffer& arrayBuffer) {
#ifdef __APPLE__
  NSData* data = [[NSData alloc] initWithBytes:arrayBuffer.data(runtime)
                                        length:arrayBuffer.length(runtime)];
  return data;
#else
  return mmkv::MMBuffer buffer(arrayBuffer.data(runtime), arrayBuffer.size(runtime),
                               mmkv::MMBufferCopyFlag::MMBufferNoCopy);
#endif
}

jsi::Value MmkvHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propNameId) {
  auto propName = propNameId.utf8(runtime);
  auto funcName = "MMKV." + propName;

  if (propName == "set") {
    // MMKV.set(key: string, value: string | number | bool | Uint8Array)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        2, // key, value
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime,
                               "MMKV::set: First argument ('key') has to be of type string!");
          }

          auto keyName = getKeyFromJSValue(runtime, arguments[0]);

          if (arguments[1].isBool()) {
            // bool
            instance->set(arguments[1].getBool(), keyName);
          } else if (arguments[1].isNumber()) {
            // number
            instance->set(arguments[1].getNumber(), keyName);
          } else if (arguments[1].isString()) {
            // string
            auto stringValue = getStringFromJSValue(runtime, arguments[1]);
            instance->set(stringValue, keyName);
          } else if (arguments[1].isObject()) {
            // object
            auto object = arguments[1].asObject(runtime);
            if (object.isArrayBuffer(runtime)) {
              // ArrayBuffer
              auto arrayBuffer = object.getArrayBuffer(runtime);
              auto data = getDataFromJSValue(runtime, arrayBuffer);
              instance->set(data, keyName);
            } else {
              // unknown object
              throw jsi::JSError(
                  runtime, "MMKV::set: 'value' argument is an object, but not of type Uint8Array!");
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
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

          auto keyName = getKeyFromJSValue(runtime, arguments[0]);
          bool hasValue;
          auto value = instance->getBool(keyName, false, &hasValue);
          if (hasValue) {
            return jsi::Value(value);
          } else {
            return jsi::Value::undefined();
          }
        });
  }
  
  if (propName == "getNumber") {
    // MMKV.getNumber(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

                 auto keyName = getKeyFromJSValue(runtime, arguments[0]);
          bool hasValue;
          auto value = instance->getDouble(keyName, 0.0, &hasValue);
          if (hasValue) {
            return jsi::Value(value);
          } else {
            return jsi::Value::undefined();
          }
        });
  }

  if (propName == "getString") {
    // MMKV.getString(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

         auto keyName = getKeyFromJSValue(runtime, arguments[0]);
#ifdef __APPLE__
        NSString* result = (NSString*) instance->getObject(keyName, NSString.class);
         if (result == nil) {
           return jsi::Value::undefined();
         }
         return jsi::String::createFromAscii(runtime, [result UTF8String]);
#else
          std::string result;
          bool hasValue = instance->getString(keyName, result);
         if (!hasValue) {
           return jsi::Value::undefined();
         }
          return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
#endif
        });
  }

  if (propName == "getBuffer") {
    // MMKV.getBuffer(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

            auto keyName = getKeyFromJSValue(runtime, arguments[0]);
#ifdef __APPLE__
           NSData* data = (NSData*) instance->getObject(keyName, NSData.class);
           if (data == nil) {
             return jsi::Value::undefined();
           }
           auto mutableData = std::make_shared<NSDataMutableBuffer>(data);
           return jsi::ArrayBuffer(runtime, mutableData);
#else
          mmkv::MMBuffer buffer;
          bool hasValue = instance->getBytes(keyName, buffer);
         if (!hasValue) {
           return jsi::Value::undefined();
         }
         uint8_t* data = static_cast<uint8_t*>(buffer.getPtr());
         auto mutableData = std::make_shared<ManagedBuffer>(data, buffer.length());
         return jsi::ArrayBuffer(runtime, mutableData);
#endif
        });
  }

  if (propName == "contains") {
    // MMKV.contains(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

                 auto keyName = getKeyFromJSValue(runtime, arguments[0]);
          bool containsKey = instance->containsKey(keyName);
          return jsi::Value(containsKey);
        });
  }

  if (propName == "delete") {
    // MMKV.delete(key: string)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // key
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (!arguments[0].isString()) {
            throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
          }

                 auto keyName = getKeyFromJSValue(runtime, arguments[0]);
          instance->removeValueForKey(keyName);
          return jsi::Value::undefined();
        });
  }

  if (propName == "getAllKeys") {
    // MMKV.getAllKeys()
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          auto keys = instance->allKeys();
                 
#ifdef __APPLE__
          auto array = jsi::Array(runtime, keys.count);
          for (int i = 0; i < keys.count; i++) {
            NSString* key = (NSString*) keys[i];
            if (key == nil) {
              throw jsi::JSError(runtime, "Invalid key type!");
            }
            jsi::String string = jsi::String::createFromAscii(runtime, [key UTF8String]);
            array.setValueAtIndex(runtime, i, std::move(string));
          }
#else
         auto array = jsi::Array(runtime, keys.size());
         for (int i = 0; i < keys.size(); i++) {
           array.setValueAtIndex(runtime, i, keys[i]);
         }
#endif
                 
          return array;
        });
  }

  if (propName == "clearAll") {
    // MMKV.clearAll()
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName), 0,
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          instance->clearAll();
          return jsi::Value::undefined();
        });
  }

  if (propName == "recrypt") {
    // MMKV.recrypt(encryptionKey)
    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forAscii(runtime, funcName),
        1, // encryptionKey
        [this](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
               size_t count) -> jsi::Value {
          if (arguments[0].isUndefined()) {
            // reset encryption key to "no encryption"
            instance->reKey(std::string());
          } else if (arguments[0].isString()) {
            // reKey(..) with new encryption-key
            auto encryptionKey = arguments[0].getString(runtime).utf8(runtime);
            instance->reKey(encryptionKey);
          } else {
            throw jsi::JSError(
                runtime,
                "First argument ('encryptionKey') has to be of type string (or undefined)!");
          }
          return jsi::Value::undefined();
        });
  }

  return jsi::Value::undefined();
}
