//
//  MmkvHostObject.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#include "NativeMmkvModule.h"
#include "MmkvTypes.h"
#include <jsi/jsi.h>

using namespace facebook;

class MmkvHostObject : public jsi::HostObject {
public:
  MmkvHostObject(const facebook::react::MMKVConfig& config);
  ~MmkvHostObject();

public:
  jsi::Value get(jsi::Runtime&, const jsi::PropNameID& name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;

private:
  static MMKVModeType getMMKVMode(const facebook::react::MMKVConfig& config);

private:
  MMKVType* instance;
};
