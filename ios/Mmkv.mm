#import "Mmkv.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <MMKV/MMKV.h>
#import <jsi/jsi.h>

using namespace facebook;

@implementation Mmkv
@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

static NSString *convertJSIStringToNSString(jsi::Runtime &runtime, const jsi::String &value)
{
    return [NSString stringWithUTF8String:value.utf8(runtime).c_str()];
}

- (void)install:(jsi::Runtime &)jsiRuntime
{
    auto mmkvSet = jsi::Function::createFromHostFunction(jsiRuntime,
                                                         jsi::PropNameID::forAscii(jsiRuntime, "mmkvSet"),
                                                         2,  // value, key
                                                         [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[1].isString()) {
            return jsi::JSError(runtime, "Second argument ('key') has to be of type string!");
            return jsi::Value(-1);
        }
        auto keyName = convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
        
        [MMKV setValue:0 forKey:keyName];
        
        return jsi::Value::undefined();
    });
    
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvSet", std::move(mmkvSet));
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
    
    
    [self install:*(jsi::Runtime *)cxxBridge.runtime];
}

- (void)invalidate {
    //[MMKV ]
}

/*
// Example method for C++
// See the implementation of the example module in the `cpp` folder
RCT_EXPORT_METHOD(multiply:(nonnull NSNumber*)a withB:(nonnull NSNumber*)b
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withReject:(RCTPromiseRejectBlock)reject)
{
    NSNumber *result = @(example::multiply([a floatValue], [b floatValue]));

    resolve(result);
}
*/
 
@end
