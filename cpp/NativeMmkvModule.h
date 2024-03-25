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

namespace facebook::react {

// The MMKVConfiguration type from JS
using MMKVConfig = MmkvConfiguration<std::string, std::optional<std::string>,
                                     std::optional<std::string>, std::optional<MmkvMode>>;
template <> struct Bridging<MMKVConfig> : MmkvConfigurationBridging<MMKVConfig> {};

// The TurboModule itself
class NativeMmkvModule : public NativeMmkvCxxSpec<NativeMmkvModule> {
public:
  NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker);

  bool initialize(jsi::Runtime& runtime, std::optional<std::string> basePath);
  jsi::Object createMMKV(jsi::Runtime& runtime, MMKVConfig config);
};

} // namespace facebook::react
