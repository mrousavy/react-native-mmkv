//
//  MmkvOnLoad.mm
//  react-native-mmkv
//
//  Created by Marc Rousavy on 27.03.24.
//

#import "NativeMmkvModule.h"
#import <Foundation/Foundation.h>
#import <ReactCommon/CxxTurboModuleUtils.h>

@interface MMKVOnLoad : NSObject
@end

@implementation MMKVOnLoad

+ (void)load {
  facebook::react::registerCxxModuleToGlobalModuleMap(
      std::string(facebook::react::NativeMmkvModule::kModuleName),
      [&](std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
        return std::make_shared<facebook::react::NativeMmkvModule>(jsInvoker);
      });
}

@end
