//
//  MmkvHostObject.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#include <MMKV.h>
#include <jsi/jsi.h>

using namespace facebook;

class JSI_EXPORT MmkvHostObject : public jsi::HostObject {
public:
  MmkvHostObject(const std::string& instanceId, std::string path, std::string cryptKey, MMKVMode mmkvMode);

public:
  jsi::Value get(jsi::Runtime&, const jsi::PropNameID& name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;

private:
  MMKV* instance;
};
