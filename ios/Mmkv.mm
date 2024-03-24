#import "Mmkv.h"

#ifndef RCT_NEW_ARCH_ENABLED
#error react-native-mmkv only works if the new architecture is enabled!
#endif

@implementation Mmkv
RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeMmkvSpecJSI>(params);
}

- (NSDictionary *)createMMKV:(JS::NativeMmkv::Config &)configuration { 
  return @{};
}

@end
