#import <React/RCTBridgeModule.h>

#ifdef __cplusplus

#import "mmkv-wrapper.h"

#endif

@interface Mmkv : NSObject <RCTBridgeModule>

@property (nonatomic, assign) BOOL setBridgeOnMainQueue;

@end
