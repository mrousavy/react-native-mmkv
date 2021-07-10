#import "MmkvBinding.h"
#import "YeetJSIUtils.h"

#import <MMKV/MMKV.h>

using namespace facebook;

namespace react {
namespace mmkv {

MmkvBinding::MmkvBinding(MMKV *mmkv) : mmkv_(mmkv) {}

jsi::Value MmkvBinding::get(jsi::Runtime &runtime, jsi::PropNameID const &name) {
    auto methodName = name.utf8(runtime);
    auto mmkv = mmkv_;

    if (methodName == "getString") {
        // MMKV.getString(key: string)
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     1,  // key
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

            auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
            auto value = [mmkv getStringForKey:keyName];
            if (value != nil)
                return convertNSStringToJSIString(runtime, value);
            else
                return jsi::Value::undefined();
        });
    }
    if (methodName == "set") {
        // MMKV.set(key: string, value: string | number | bool)
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     2,  // key, value
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isString()) throw jsi::JSError(runtime, "MMKV::set: First argument ('key') has to be of type string!");
            auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));

            if (arguments[1].isBool()) {
                [mmkv setBool:arguments[1].getBool() forKey:keyName];
            } else if (arguments[1].isNumber()) {
                [mmkv setDouble:arguments[1].getNumber() forKey:keyName];
            } else if (arguments[1].isString()) {
                auto stringValue = convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
                [mmkv setString:stringValue forKey:keyName];
            } else {
                throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number or string!");
            }
            return jsi::Value::undefined();
        });
    }
    if (methodName == "getNumber") {
        // MMKV.getNumber(key: string)
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     1,  // key
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

            auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
            auto value = [mmkv getDoubleForKey:keyName];
            return jsi::Value(value);
        });
    }
    if (methodName == "getBoolean") {
        // MMKV.getBoolean(key: string)
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     1,  // key
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

            auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
            auto value = [mmkv getBoolForKey:keyName];
            return jsi::Value(value);
        });
    }
    if (methodName == "delete") {
        // MMKV.delete(key: string)
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     1,  // key
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

            auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
            [mmkv removeValueForKey:keyName];
            return jsi::Value::undefined();
        });
    }
    if (methodName == "getAllKeys") {
        // MMKV.getAllKeys()
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     0,
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            auto keys = [mmkv allKeys];
            return convertNSArrayToJSIArray(runtime, keys);
        });
    }
    if (methodName == "clearAll") {
        // MMKV.clearAll()
        return jsi::Function::createFromHostFunction(runtime,
                                                     name,
                                                     0,
                                                     [mmkv](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
            [mmkv clearAll];
            return jsi::Value::undefined();
        });
    }
    return jsi::Value::undefined();
}

} // namespace mmkv
} // namespace react
