#ifndef RCT_NEW_ARCH_ENABLED
#error react-native-mmkv only works if the new architecture is enabled!
#endif

#import "RNMmkvSpec.h"

@interface Mmkv : NSObject <NativeMmkvSpec>

@end
