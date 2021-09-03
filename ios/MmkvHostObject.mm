//
//  MmkvHostObject.mm
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import "MmkvHostObject.h"
#import <Foundation/Foundation.h>

MmkvHostObject::MmkvHostObject(NSString* instanceId, NSString* path, NSString* cryptKey) {
  NSData* cryptData = cryptKey == nil ? nil : [cryptKey dataUsingEncoding:NSUTF8StringEncoding];
  instance = [MMKV mmkvWithID:instanceId cryptKey:cryptData rootPath:path];
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

jsi::Value MmkvHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& propName) {


  return jsi::Value::undefined();
}
