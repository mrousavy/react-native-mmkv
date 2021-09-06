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

MmkvHostObject::MmkvHostObject(NSString* instanceId, NSString* path, NSString* cryptKey) {
  NSData* cryptData = cryptKey == nil ? nil : [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
  instance = [MMKV mmkvWithID:instanceId cryptKey:cryptData rootPath:path];
  if (instance == nil) {
    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

MmkvHostObject::~MmkvHostObject() {
  [instance close];
}

std::vector<jsi::PropNameID> MmkvHostObject::getPropertyNames(jsi::Runtime& rt) {
  std::vector<jsi::PropNameID> result;
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("set")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getBoolean")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getString")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getNumber")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("delete")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("getAllKeys")));
  result.push_back(jsi::PropNameID::forUtf8(rt, std::string("deleteAll")));
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
      if (!arguments[0].isString()) throw jsi::JSError(runtime, "MMKV::set: First argument ('key') has to be of type string!");
      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));

      if (arguments[1].isBool()) {
        [instance setBool:arguments[1].getBool() forKey:keyName];
      } else if (arguments[1].isNumber()) {
        [instance setDouble:arguments[1].getNumber() forKey:keyName];
      } else if (arguments[1].isString()) {
        auto stringValue = convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
        [instance setString:stringValue forKey:keyName];
      } else {
        throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number or string!");
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
      if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      auto value = [instance getBoolForKey:keyName];
      return jsi::Value(value);
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
      if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      auto value = [instance getStringForKey:keyName];
      if (value != nil)
        return convertNSStringToJSIString(runtime, value);
      else
        return jsi::Value::undefined();
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
      if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

      auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
      auto value = [instance getDoubleForKey:keyName];
      return jsi::Value(value);
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
      if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

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

  return jsi::Value::undefined();
}
