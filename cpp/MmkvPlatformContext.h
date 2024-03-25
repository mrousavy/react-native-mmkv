//
//  MmkvPlatformContext.h
//  Pods
//
//  Created by Marc Rousavy on 25.03.24.
//

#pragma once

#include <string>

class MmkvPlatformContext {
public:
  MmkvPlatformContext() = delete;

  /**
   Get the default path for MMKV storage files.
   This usually is the documents directory of the current context.
   */
  static std::string getDefaultBasePath();
};
