#import "MmkvModule.h"
#import "JSIUtils.h"

#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>

#import "../cpp/TypedArray.h"
#import "MmkvHostObject.h"
#import <MMKV/MMKV.h>

using namespace facebook;

@implementation MmkvModule

@synthesize bridge=_bridge;

RCT_EXPORT_MODULE(MMKV)

- (void)setBridge:(RCTBridge *)bridge {
  _bridge = bridge;
}

+ (NSString*)getPropertyAsStringOrNilFromObject:(jsi::Object&)object
                                   propertyName:(std::string)propertyName
                                        runtime:(jsi::Runtime&)runtime {
  jsi::Value value = object.getProperty(runtime, propertyName.c_str());
  std::string string = value.isString() ? value.asString(runtime).utf8(runtime) : "";
  return string.length() > 0 ? [NSString stringWithUTF8String:string.c_str()] : nil;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install : (nullable NSString*)storageDirectory) {
  NSLog(@"Installing global.mmkvCreateNewInstance...");
  RCTCxxBridge* cxxBridge = (RCTCxxBridge*)_bridge;
  if (cxxBridge == nil) {
    return @false;
  }

  using namespace facebook;

  auto jsiRuntime = (jsi::Runtime*)cxxBridge.runtime;
  if (jsiRuntime == nil) {
    return @false;
  }
  auto& runtime = *jsiRuntime;
  
#if DEBUG
  MMKVLogLevel logLevel = MMKVLogDebug;
#else
  MMKVLogLevel logLevel = MMKVLogError;
#endif

  RCTUnsafeExecuteOnMainQueueSync(^{
    // Get appGroup value from info.plist using key "AppGroup"
    NSString* appGroup = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppGroup"];
    if (appGroup == nil) {
      [MMKV initializeMMKV:storageDirectory logLevel:logLevel];
    } else {
      NSString* groupDir = [[NSFileManager defaultManager]
                               containerURLForSecurityApplicationGroupIdentifier:appGroup]
                               .path;
      [MMKV initializeMMKV:nil groupDir:groupDir logLevel:logLevel];
    }
  });

  // MMKV.createNewInstance()
  auto mmkvCreateNewInstance = jsi::Function::createFromHostFunction(
      runtime, jsi::PropNameID::forAscii(runtime, "mmkvCreateNewInstance"), 1,
      [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
         size_t count) -> jsi::Value {
        if (count != 1) {
          throw jsi::JSError(runtime, "MMKV.createNewInstance(..) expects one argument (object)!");
        }
        jsi::Object config = arguments[0].asObject(runtime);

        NSString* instanceId = [MmkvModule getPropertyAsStringOrNilFromObject:config
                                                                 propertyName:"id"
                                                                      runtime:runtime];
        NSString* path = [MmkvModule getPropertyAsStringOrNilFromObject:config
                                                           propertyName:"path"
                                                                runtime:runtime];
        NSString* encryptionKey = [MmkvModule getPropertyAsStringOrNilFromObject:config
                                                                    propertyName:"encryptionKey"
                                                                         runtime:runtime];

        auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey);
        return jsi::Object::createFromHostObject(runtime, instance);
      });
  runtime.global().setProperty(runtime, "mmkvCreateNewInstance", std::move(mmkvCreateNewInstance));

  // Adds the PropNameIDCache object to the Runtime. If the Runtime gets destroyed, the Object gets
  // destroyed and the cache gets invalidated.
  auto propNameIdCache = std::make_shared<InvalidateCacheOnDestroy>(runtime);
  runtime.global().setProperty(runtime, "mmkvArrayBufferPropNameIdCache",
                               jsi::Object::createFromHostObject(runtime, propNameIdCache));

  NSLog(@"Installed global.mmkvCreateNewInstance!");
  return @true;
}

@end
