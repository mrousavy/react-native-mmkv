//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "MmkvHostObject.h"
#include "MmkvConfig.h"

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker): NativeMmkvCxxSpec(jsInvoker) {
}

jsi::Object NativeMmkvModule::createMMKV(jsi::Runtime& runtime, MmkvConfiguration config) {
  auto instance = std::make_shared<MmkvHostObject>(config);
  return jsi::Object::createFromHostObject(runtime, instance);
}

}
