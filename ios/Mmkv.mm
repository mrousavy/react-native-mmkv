#import "Mmkv.h"
#import "YeetJSIUtils.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>

#import <MMKV/MMKV.h>

using namespace facebook;

@implementation Mmkv
@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}


static void install(jsi::Runtime & jsiRuntime)
{
    // MMKV.set(value: string | number | bool, key: string)
    auto mmkvSet = jsi::Function::createFromHostFunction(jsiRuntime,
                                                         jsi::PropNameID::forAscii(jsiRuntime, "mmkvSet"),
                                                         2,  // value, key
                                                         [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[1].isString()) throw jsi::JSError(runtime, "Second argument ('key') has to be of type string!");
        auto keyName = convertJSIStringToNSString(runtime, arguments[1].getString(runtime));

        if (arguments[0].isBool()) {
            [MMKV.defaultMMKV setBool:arguments[0].getBool() forKey:keyName];
        } else if (arguments[0].isNumber()) {
            [MMKV.defaultMMKV setDouble:arguments[0].getNumber() forKey:keyName];
        } else if (arguments[0].isString()) {
            auto stringValue = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
            [MMKV.defaultMMKV setString:stringValue forKey:keyName];
        } else if (arguments[0].isObject()) {
            id object = convertJSIValueToObjCObject(runtime, arguments[0]);
            [MMKV.defaultMMKV setObject:object forKey:keyName];
        } else {
            throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number or string!");
        }
        return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvSet", std::move(mmkvSet));


    // MMKV.getBoolean(key: string)
    auto mmkvGetBoolean = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetBoolean"),
                                                                1,  // key
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

        auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        auto value = [MMKV.defaultMMKV getBoolForKey:keyName];
        return jsi::Value(value);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetBoolean", std::move(mmkvGetBoolean));


    // MMKV.getString(key: string)
    auto mmkvGetString = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetString"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

        auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        auto value = [MMKV.defaultMMKV getStringForKey:keyName];
        if (value != nil)
            return jsi::String::createFromUtf8(runtime, value.UTF8String);
        else
            return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetString", std::move(mmkvGetString));
    
    
    // MMKV.getNumber(key: string)
    auto mmkvGetNumber = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetNumber"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        
        auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        auto value = [MMKV.defaultMMKV getDoubleForKey:keyName];
        return jsi::Value(value);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetNumber", std::move(mmkvGetNumber));
    
    
    // MMKV.getObject(key: string)
    auto mmkvGetObject = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetObject"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        
        auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        id value = [MMKV.defaultMMKV getObjectOfClass:[NSObject class] forKey:keyName];
        return convertObjCObjectToJSIValue(runtime, value);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetObject", std::move(mmkvGetObject));


    // MMKV.delete(key: string)
    auto mmkvDelete = jsi::Function::createFromHostFunction(jsiRuntime,
                                                            jsi::PropNameID::forAscii(jsiRuntime, "mmkvDelete"),
                                                            1,  // key
                                                            [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");

        auto keyName = convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
        [MMKV.defaultMMKV removeValueForKey:keyName];
        return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvDelete", std::move(mmkvDelete));


    // MMKV.getAllKeys()
    auto mmkvGetAllKeys = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetAllKeys"),
                                                                0,
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        auto keys = [MMKV.defaultMMKV allKeys];
        return jsi::Value(convertNSArrayToJSIArray(runtime, keys));
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetAllKeys", std::move(mmkvGetAllKeys));
}

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
    _setBridgeOnMainQueue = RCTIsMainQueue();

    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)self.bridge;
    if (!cxxBridge.runtime) {
        return;
    }

    [MMKV initializeMMKV:nil];
    install(*(jsi::Runtime *)cxxBridge.runtime);
}

- (void)invalidate {
    [MMKV.defaultMMKV close];
}

@end
