#include "mmkv-wrapper.h"
//#include <MMKVCore/MMKV.h>

using namespace facebook;

namespace mmkv {
    void setup(jsi::Runtime& jsiRuntime) {
        //MMKV::initializeMMKV(nullptr);
        
        auto mmkvSetBool = jsi::Function::createFromHostFunction(jsiRuntime,
                                                             jsi::PropNameID::forAscii(jsiRuntime, "mmkvSetBool"),
                                                             2,  // value, key
                                                             [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isBool() || !arguments[1].isString()) {
                return jsi::Value(-1);
            }
            auto value = arguments[0].getBool();
            auto keyName = arguments[1].getString(runtime);
            
            //MMKV::defaultMMKV()->set(value, keyName);
            
            return jsi::Value(0);
        });
        
        jsiRuntime.global().setProperty(jsiRuntime, "mmkvSetBool", std::move(mmkvSetBool));

    }

    void teardown() {
        //MMKV::defaultMMKV()->close();
    }
}
