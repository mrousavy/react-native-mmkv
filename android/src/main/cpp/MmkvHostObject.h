//
//  MmkvHostObject.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#include <jsi/jsi.h>
#include <MMKV.h>
#include <unordered_map>

using namespace facebook;

class JSI_EXPORT MmkvHostObject: public jsi::HostObject {
public:
  MmkvHostObject(const std::string& instanceId, const std::string& path, const std::string& cryptKey);
  ~MmkvHostObject();

public:
  jsi::Value get(jsi::Runtime&, const jsi::PropNameID& name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;

private:
  jsi::Value getFunction(jsi::Runtime& runtime, const std::string& propName);
  std::unordered_map<std::string, jsi::Function> functionCache;
  MMKV* instance;
  std::string* path;
  std::string* encryptionKey;
};
