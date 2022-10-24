//
//  MmkvHostObject.mm
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MmkvHostObject.h"
#import "JSIUtils.h"
#import "../cpp/TypedArray.h"
#import <vector>

MmkvHostObject::MmkvHostObject(NSString* instanceId, NSString* path, NSString* cryptKey)
{
  NSData* cryptData = cryptKey == nil ? nil : [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
  instance = [MMKV mmkvWithID:instanceId cryptKey:cryptData rootPath:path];

  if (instance == nil) {
    // Check if instanceId is invalid
    if ([instanceId length] == 0) {
      throw std::runtime_error("Failed to create MMKV instance! `id` cannot be empty!");
    }

    // Check if encryptionKey is invalid
    if (cryptData != nil && [cryptData length] > 16) {
      throw std::runtime_error("Failed to create MMKV instance! `encryptionKey` cannot be longer than 16 bytes!");
    }

    // Check if path is invalid
    NSFileManager* fileManager = [[NSFileManager alloc] init];
    bool pathExists = [fileManager fileExistsAtPath:path isDirectory:nil];
    if (!pathExists) {
      throw std::runtime_error("Failed to create MMKV instance! The given Storage Path does not exist!");
    }

    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

std::vector<jsi::PropNameID> MmkvHostObject::getPropertyNames(jsi::Runtime& rt)
{
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

jsi::Value MmkvHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propNameId)
{
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      if (arguments[1].isBool()) {
        // Set as boolean
        [instance setBool:arguments[1].getBool() forKey:keyName];
      } else if (arguments[1].isNumber()) {
        // Set as number (double in JS)
        [instance setDouble:arguments[1].getNumber() forKey:keyName];
      } else if (arguments[1].isString()) {
        // Set as UTF-8 string
        auto stringValue = convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
        [instance setString:stringValue forKey:keyName];
      } else if (arguments[1].isObject()) {
        // object
        auto object = arguments[1].asObject(runtime);
        if (isTypedArray(runtime, object)) {
          // Uint8Array
          auto typedArray = getTypedArray(runtime, object);
          auto bufferValue = typedArray.getBuffer(runtime);
          auto data = [[NSData alloc] initWithBytes:bufferValue.data(runtime)
                                             length:bufferValue.length(runtime)];
          [instance setData:data forKey:keyName];
        } else {
          // unknown object
          throw jsi::JSError(runtime, "MMKV::set: 'value' argument is an object, but not of type Uint8Array!");
        }
      } else {
        // Invalid type
        throw jsi::JSError(runtime, "Second argument ('value') has to be of type bool, number or string!");
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      BOOL hasValue;
      auto value = [instance getBoolForKey:keyName defaultValue:false hasValue:&hasValue];
      if (hasValue) {
        return jsi::Value(value == true);
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      auto value = [instance getStringForKey:keyName];
      if (value != nil) {
        return convertNSStringToJSIString(runtime, value);
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      BOOL hasValue;
      auto value = [instance getDoubleForKey:keyName defaultValue:0.0 hasValue:&hasValue];
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      auto data = [instance getDataForKey:keyName];
      if (data != nil) {
        TypedArray<TypedArrayKind::Uint8Array> array(runtime, data.length);
        auto charArray = static_cast<const unsigned char*>([data bytes]);
        std::vector<unsigned char> vector(data.length);
        vector.assign(charArray, charArray + data.length);
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      bool containsKey = [instance containsKey:keyName];
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

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      [instance removeValueForKey:keyName];
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
      auto keys = [instance allKeys];
      return convertNSArrayToJSIArray(runtime, keys);
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
      [instance clearAll];
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
        [instance reKey:nil];
      } else if (arguments[0].isString()) {
        // reKey(..) with new encryption-key
        NSString* encryptionKey = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        NSData* encryptionKeyBytes = [encryptionKey dataUsingEncoding:NSUTF8StringEncoding];
        [instance reKey:encryptionKeyBytes];
      } else {
        throw jsi::JSError(runtime, "First argument ('encryptionKey') has to be of type string (or undefined)!");
      }
      return jsi::Value::undefined();
    });
  }

  return jsi::Value::undefined();
}
