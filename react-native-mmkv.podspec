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
    "ios/RNMMKV.h",
  ]
  # Any private headers that are not globally unique should be mentioned here.
  # Otherwise there will be a nameclash, since CocoaPods flattens out any header directories
  # See https://github.com/firebase/firebase-ios-sdk/issues/4035 for more details.
  s.preserve_paths = [
    'ios/**/*.h',
    'MMKV/**/*.h'
  ]

  s.requires_arc = [
    'ios/**/*.mm'
  ]

  s.compiler_flags = '-x objective-c++'
  s.framework    = "CoreFoundation"
  s.ios.frameworks = "UIKit"
  s.libraries    = "z", "c++"
  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "gnu++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
    'ALWAYS_SEARCH_USER_PATHS' => 'NO'
  }

  # MMKVCore
  s.subspec 'MMKVCore' do |spec|
    spec.name = 'MMKVCore'
    spec.module_name = 'MMKVCore'
    spec.source_files = [
      "MMKV/Core/**/*.{h,cpp}",
    ]

    spec.requires_arc = [
      'MMKV/Core/MemoryFile.cpp',
      'MMKV/Core/ThreadLock.cpp',
      'MMKV/Core/InterProcessLock.cpp',
      'MMKV/Core/MMKVLog.cpp',
      'MMKV/Core/PBUtility.cpp',
      'MMKV/Core/MemoryFile_OSX.cpp',
      'MMKV/aes/openssl/openssl_cfb128.cpp',
      'MMKV/aes/openssl/openssl_aes_core.cpp',
      'MMKV/aes/openssl/openssl_md5_one.cpp',
      'MMKV/aes/openssl/openssl_md5_dgst.cpp',
      'MMKV/aes/AESCrypt.cpp',
    ]
  end

  # MMKV-iOS
  s.subspec 'MMKVIOS' do |spec|
    spec.name = 'MMKVIOS'
    spec.module_name = 'MMKVIOS'
    spec.source_files = [
      "MMKV/iOS/MMKV/**/*.{h,m,mm}"
    ]
  end

  s.dependency "React-Core"
end
