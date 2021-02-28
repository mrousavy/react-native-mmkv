require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-mmkv"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/mrousavy/react-native-mmkv.git", :tag => "#{s.version}" }

  # All source files that should be publicly visible
  # Note how this does not include headers, since those can nameclash.
  s.source_files = [
    "ios/**/*.{m,mm}",
    "MMKV/Core/*.cpp",
    "MMKV/iOS/MMKV/**/*.{m,mm}",
    "ios/RNMMKV.h",
    'MMKV/Core/MMKVPredef.h',
    'MMKV/iOS/MMKV/MMKV/MMKV.h'
  ]
  # Any private headers that are not globally unique should be mentioned here.
  # Otherwise there will be a nameclash, since CocoaPods flattens out any header directories
  # See https://github.com/firebase/firebase-ios-sdk/issues/4035 for more details.
  s.preserve_paths = [
    'ios/**/*.h',
    'MMKV/**/*.h'
  ]

  s.compiler_flags = '-x objective-c++'

  s.requires_arc = [
    'Core/MemoryFile.cpp',
    'Core/ThreadLock.cpp',
    'Core/InterProcessLock.cpp',
    'Core/MMKVLog.cpp',
    'Core/PBUtility.cpp',
    'Core/MemoryFile_OSX.cpp',
    'aes/openssl/openssl_cfb128.cpp',
    'aes/openssl/openssl_aes_core.cpp',
    'aes/openssl/openssl_md5_one.cpp',
    'aes/openssl/openssl_md5_dgst.cpp',
    'aes/AESCrypt.cpp',
    'ios/**/*.mm'
  ]

  s.framework    = "CoreFoundation"
  s.ios.frameworks = "UIKit"
  s.libraries    = "z", "c++"
  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "gnu++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
  }

  s.dependency "React-Core"
end
