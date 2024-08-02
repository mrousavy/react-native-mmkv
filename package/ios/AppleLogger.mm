//
//  AppleMmkvLogger.m
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#import "MmkvLogger.h"
#import <Foundation/Foundation.h>

void MmkvLogger::log(const std::string& tag, const std::string& formatString, Args... args) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-security"
if (NSDebugEnabled) {
  NSLog(@"[%s]: " + formatString.c_str(), tag.c_str(), args);
}
#pragma clang diagnostic pop
}
