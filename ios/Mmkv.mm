#import "Mmkv.h"
#import "YeetJSIUtils.h"
#import "MmkvBinding.h"

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
    auto mmkvWithID = jsi::Function::createFromHostFunction(jsiRuntime,
                                                            jsi::PropNameID::forAscii(jsiRuntime, "mmkvWithID"),
                                                            1,  // id
                                                            [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString() && !arguments[0].isNull()) throw jsi::JSError(runtime, "mmkvWithID: First argument ('id') has to be of type string or null.");
        auto mmkv = arguments[0].isNull()
          ? MMKV.defaultMMKV
          : [MMKV mmkvWithID:convertJSIStringToNSString(runtime, arguments[0].getString(runtime))];
        auto mmkvJsi = std::make_shared<react::mmkv::MmkvBinding>(std::move(mmkv));
        return jsi::Object::createFromHostObject(runtime, mmkvJsi);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvWithID", std::move(mmkvWithID));
}

- (void)setup
{
    RCTCxxBridge *cxxBridge = (RCTCxxBridge *)self.bridge;
    if (!cxxBridge.runtime) {
        // retry 10ms later - THIS IS A WACK WORKAROUND. wait for TurboModules to land.
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 0.001 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
            [self setup];
        });
        return;
    }

    [MMKV initializeMMKV:nil];
    install(*(jsi::Runtime *)cxxBridge.runtime);
}

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
    _setBridgeOnMainQueue = RCTIsMainQueue();
    [self setup];
}

@end
