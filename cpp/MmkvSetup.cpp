//
//  MmkvSetup.cpp
//  Mmkv
//
//  Created by Marc Rousavy on 03.09.21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#include <jsi/jsi.h>
#include <MMKV.h>
#include "MmkvHostObject.h"

using namespace facebook;
using namespace mmkv;

std::string getPropertyAsStringOrEmptyFromObject(jsi::Object& object, const std::string& propertyName, jsi::Runtime& runtime) {
    jsi::Value value = object.getProperty(runtime, propertyName.c_str());
    return value.isString() ? value.asString(runtime).utf8(runtime) : "";
}

namespace MmkvSetup {

  void setupMmkv(facebook::jsi::Runtime& runtime, std::string& path) {
    MMKV::initializeMMKV(path);

    // MMKV.createNewInstance()
    auto mmkvCreateNewInstance = jsi::Function::createFromHostFunction(runtime,
                                                                       jsi::PropNameID::forAscii(runtime, "mmkvCreateNewInstance"),
                                                                       0,
                                                                       [](jsi::Runtime& runtime,
                                                                          const jsi::Value& thisValue,
                                                                          const jsi::Value* arguments,
                                                                          size_t count) -> jsi::Value {
                                                                         if (count != 1) {
                                                                             throw jsi::JSError(runtime, "MMKV.createNewInstance(..) expects one argument (object)!");
                                                                         }
                                                                         jsi::Object config = arguments[0].asObject(runtime);

                                                                         std::string instanceId = getPropertyAsStringOrEmptyFromObject(config, "id", runtime);
                                                                         std::string path = getPropertyAsStringOrEmptyFromObject(config, "path", runtime);
                                                                         std::string encryptionKey = getPropertyAsStringOrEmptyFromObject(config, "encryptionKey", runtime);

                                                                         auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey);
                                                                         return jsi::Object::createFromHostObject(runtime, instance);
                                                                       });
    runtime.global().setProperty(runtime, "mmkvCreateNewInstance", std::move(mmkvCreateNewInstance));
  }
}
