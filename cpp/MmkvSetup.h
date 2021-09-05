//
//  MmkvSetup.h
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#pragma once

#include <jsi/jsi.h>
#include <MMKV.h>

namespace MmkvSetup {
  void setupMmkv(facebook::jsi::Runtime& runtime);
}
