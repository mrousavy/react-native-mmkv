//
//  MmkvHostObject.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#import <Foundation/Foundation.h>
#import <jsi/jsi.h>
#import <MMKV/MMKV.h>

using namespace facebook;

class JSI_EXPORT MmkvHostObject: public jsi::HostObject {
public:
  MmkvHostObject(NSString* instanceId, NSString* path, NSString* cryptKey);
  ~MmkvHostObject();

public:
  jsi::Value get(jsi::Runtime&, const jsi::PropNameID& name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime& rt) override;

private:
  MMKV* instance;
};
