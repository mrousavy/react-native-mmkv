//
//  AppleMmkvLogger.m
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#import "MmkvLogger.h"
#import <Foundation/Foundation.h>

void MmkvLogger::log(const std::string& tag, const std::string& message) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-security"
  NSLog(@"[%s]: %s", tag.c_str(), message.c_str());
#pragma clang diagnostic pop
}
