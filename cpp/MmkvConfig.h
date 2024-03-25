//
//  MmkvConfig.h
//  Pods
//
//  Created by Marc Rousavy on 25.03.24.
//

#pragma once

#include <optional>
#include <react/bridging/Bridging.h>
#include <string>

struct MmkvConfiguration {
  std::string instanceId;
  std::optional<std::string> path;
  std::optional<std::string> encryptionKey;
};

namespace facebook::react {

template <> struct Bridging<MmkvConfiguration> {
  static MmkvConfiguration fromJs(jsi::Runtime& rt, const jsi::Object& value,
                                  const std::shared_ptr<CallInvoker>& jsInvoker) {
    return MmkvConfiguration{
        .instanceId = bridging::fromJs<std::string>(rt, value.getProperty(rt, "id"), jsInvoker),
        .path = bridging::fromJs<std::optional<std::string>>(rt, value.getProperty(rt, "path"),
                                                             jsInvoker),
        .encryptionKey = bridging::fromJs<std::optional<std::string>>(
            rt, value.getProperty(rt, "encryptionKey"), jsInvoker),
    };
  }

  static jsi::Object toJs(jsi::Runtime& rt, const MmkvConfiguration& config) {
    auto result = facebook::jsi::Object(rt);
    result.setProperty(rt, "id", bridging::toJs(rt, config.instanceId));
    if (config.path.has_value()) {
      result.setProperty(rt, "path", bridging::toJs(rt, config.path.value()));
    }
    if (config.encryptionKey.has_value()) {
      result.setProperty(rt, "encryptionKey", bridging::toJs(rt, config.encryptionKey.value()));
    }
    return result;
  }
};

} // namespace facebook::react
