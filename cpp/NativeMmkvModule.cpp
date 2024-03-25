//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "MmkvHostObject.h"

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker): NativeMmkvCxxSpec(jsInvoker) {
}

jsi::Object NativeMmkvModule::createMMKV(jsi::Runtime& runtime, jsi::Object config) {
  std::string instanceId = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "id"), jsInvoker_);
  std::string path = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "path"), jsInvoker_);
  std::string encryptionKey = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "encryptionKey"), jsInvoker_);

  auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey);
  return jsi::Object::createFromHostObject(runtime, instance);
}

}
