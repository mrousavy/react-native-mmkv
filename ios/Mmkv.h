#ifdef __cplusplus
#import "react-native-mmkv.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNMmkvSpec.h"

@interface Mmkv : NSObject <NativeMmkvSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Mmkv : NSObject <RCTBridgeModule>
#endif

@end
