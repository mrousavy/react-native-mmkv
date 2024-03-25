//
//  AppleMmkvPlatformContext.m
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#import "MmkvPlatformContext.h"
#import <Foundation/Foundation.h>

std::string MmkvPlatformContext::getDefaultBasePath() {
#if TARGET_OS_TV
  NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
#else
  NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
#endif
  NSString* documentPath = (NSString*)[paths firstObject];
  if ([documentPath length] > 0) {
    NSString* basePath = [documentPath stringByAppendingPathComponent:@"mmkv"];
    std::string string = [basePath UTF8String];
    return string;
  } else {
    return "";
  }
}
