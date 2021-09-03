#import "Mmkv.h"
#import "JSIUtils.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>

#import <MMKV/MMKV.h>
#import "MmkvHostObject.h"

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
    // MMKV.createNewInstance()
    auto mmkvCreateNewInstance = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                       jsi::PropNameID::forAscii(jsiRuntime, "mmkvCreateNewInstance"),
                                                                       0,
                                                                       [](jsi::Runtime& runtime,
                                                                          const jsi::Value& thisValue,
                                                                          const jsi::Value* arguments,
                                                                          size_t count) -> jsi::Value {
      if (count != 1) {
        throw jsi::JSError(runtime, "MMKV.createNewInstance(..) expects one argument (object)!");
      }
      jsi::Object config = arguments[0].asObject(runtime);
      
      NSString* instanceId = [Mmkv getPropertyAsStringOrNilFromObject:config propertyName:"id" runtime:runtime];
      NSString* path = [Mmkv getPropertyAsStringOrNilFromObject:config propertyName:"path" runtime:runtime];
      NSString* encryptionKey = [Mmkv getPropertyAsStringOrNilFromObject:config propertyName:"encryptionKey" runtime:runtime];
      
      auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey);
      return jsi::Object::createFromHostObject(runtime, instance);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvCreateNewInstance", std::move(mmkvCreateNewInstance));
}

+ (NSString*)getPropertyAsStringOrNilFromObject:(jsi::Object&)object propertyName:(std::string)propertyName runtime:(jsi::Runtime&)runtime {
  jsi::Value value = object.getProperty(runtime, propertyName.c_str());
  std::string string = value.isString() ? value.asString(runtime).utf8(runtime) : "";
  return string.length() > 0 ? [NSString stringWithUTF8String:string.c_str()] : nil;
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
