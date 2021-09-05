#import "RNMmkv.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>

#import "../cpp/MmkvSetup.h"

using namespace facebook;

@implementation RNMmkv
@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
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

    jsi::Runtime* runtime = (jsi::Runtime *)cxxBridge.runtime;
    MmkvSetup::setupMmkv(*runtime, nullptr)
}

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
    _setBridgeOnMainQueue = RCTIsMainQueue();
    [self setup];
}

@end
