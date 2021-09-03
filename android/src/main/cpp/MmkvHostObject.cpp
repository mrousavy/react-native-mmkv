//
//  MmkvHostObject.cpp
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#include "MmkvHostObject.h"
#include <MMKV.h>

MmkvHostObject::MmkvHostObject(const std::string& instanceId, std::string path, std::string cryptKey) {
  auto mmkv = MMKV::mmkvWithID(instanceId, mmkv::DEFAULT_MMAP_SIZE, MMKV_SINGLE_PROCESS, &cryptKey, &path);
  instance = std::unique_ptr<MMKV>(mmkv);
}

MmkvHostObject::~MmkvHostObject() {
  instance->close();
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

  auto value = functionCache.find(propName);
  if (value != functionCache.end()) {
    return value->second.getFunction(runtime);
  }

  jsi::Value newValue = getFunction(runtime, propName);
  if (newValue.isUndefined()) {
    return jsi::Value::undefined();
  }
  jsi::Function newFunction = newValue.asObject(runtime).asFunction(runtime);
  functionCache.insert({ propName, newFunction.getFunction(runtime) });
  return newFunction;
}

jsi::Value MmkvHostObject::getFunction(jsi::Runtime& runtime, const std::string& propName) {
  auto funcName = "MMKV." + propName;

  if (propName == "set") {
    // MMKV.set(key: string, value: string | number | bool)
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forAscii(runtime, funcName.c_str()),
                                                 2,  // key, value
                                                 [this](jsi::Runtime& runtime,
                                                        const jsi::Value& thisValue,
                                                        const jsi::Value* arguments,
                                                        size_t count) -> jsi::Value {
                                                   if (!arguments[0].isString()) throw jsi::JSError(runtime, "MMKV::set: First argument ('key') has to be of type string!");
                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                   if (arguments[1].isBool()) {
                                                     instance->set(arguments[1].getBool(), keyName);
                                                   } else if (arguments[1].isNumber()) {
                                                     instance->set(arguments[1].getNumber(), keyName);
                                                   } else if (arguments[1].isString()) {
                                                     auto stringValue = arguments[1].getString(runtime).utf8(runtime);
                                                     instance->set(stringValue, keyName);
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
                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);
                                                   auto value = instance->getBool(keyName);
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

                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                   std::string result;
                                                   bool hasValue = instance->getString(keyName, result);
                                                   if (hasValue)
                                                     return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
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
                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                   auto value = instance->getDouble(keyName);
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
                                                   auto x = jsi::Array::createWithElements(runtime, keys);
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

  return jsi::Value::undefined();
}
