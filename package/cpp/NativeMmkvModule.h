//
//  NativeMmkvModule.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#pragma once

#include <RNMmkvSpecJSI.h>
#include <string>

namespace facebook::react {

// The MMKVConfiguration type from JS
using MMKVConfig =
    NativeMmkvConfiguration<std::string, std::optional<std::string>, std::optional<std::string>,
                            std::optional<NativeMmkvMode>, std::optional<bool>>;
template <> struct Bridging<MMKVConfig> : NativeMmkvConfigurationBridging<MMKVConfig> {};

// The TurboModule itself
class NativeMmkvModule : public NativeMmkvCxxSpec<NativeMmkvModule> {
public:
  NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker);
  ~NativeMmkvModule();

  bool initialize(jsi::Runtime& runtime, std::string basePath);
  jsi::Object createMMKV(jsi::Runtime& runtime, MMKVConfig config);
};

} // namespace facebook::react
