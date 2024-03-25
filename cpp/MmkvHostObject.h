//
//  MmkvHostObject.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#include "NativeMmkvModule.h"
#include <MMKVCore/MMKV.h>
#include <jsi/jsi.h>

using namespace facebook;
using namespace mmkv;

class MmkvHostObject : public jsi::HostObject {
public:
  MmkvHostObject(const facebook::react::MMKVConfig& config);
  ~MmkvHostObject();

public:
  jsi::Value get(jsi::Runtime&, const jsi::PropNameID& name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;

private:
#ifdef __APPLE__
  using mmkv_key_t = NSString*;
  using mmkv_string_t = NSObject<NSCoding>*;
  using mmkv_data_t = NSObject<NSCoding>*;
#else
#ifdef ANDROID
  using mmkv_string_t = const std::string&;
  using mmkv_key_t = const std::string&;
  using mmkv_data_t = mmkv::MMBuffer;
#else
#error MMKVHostObject is compiled for an unknown platform!
#endif
#endif

  static mmkv_string_t getStringFromJSValue(jsi::Runtime& runtime, const jsi::Value& value);
  static mmkv_key_t getKeyFromJSValue(jsi::Runtime& runtime, const jsi::Value& value);
  static mmkv_data_t getDataFromJSValue(jsi::Runtime& runtime, const jsi::ArrayBuffer& value);

  static MMKVMode getMMKVMode(const facebook::react::MMKVConfig& config);

private:
  MMKV* instance;
};
