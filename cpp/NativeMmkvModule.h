//
//  NativeMmkvModule.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#pragma once

#if __has_include(<React-Codegen/RNMmkvSpecJSI.h>)
// CocoaPods include (iOS)
#include <React-Codegen/RNMmkvSpecJSI.h>
#elif __has_include("RNMmkvSpecJSI.h")
// CMake include on Android
#include "RNMmkvSpecJSI.h"
#else
#error Cannot find react-native-mmkv spec! Try cleaning your cache and re-running CodeGen!
#endif

#include "MmkvConfig.h"

namespace facebook::react {

class NativeMmkvModule : public NativeMmkvCxxSpec<NativeMmkvModule> {
public:
  NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker);

  bool initialize(jsi::Runtime& runtime, std::optional<std::string> basePath);
  jsi::Object createMMKV(jsi::Runtime& runtime, MmkvConfiguration config);
};

} // namespace facebook::react
