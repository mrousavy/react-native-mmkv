require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-mmkv"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/mrousavy/react-native-mmkv.git", :tag => "#{s.version}" }

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FORCE_POSIX",
  }
  s.compiler_flags = '-x objective-c++'
  s.framework    = "CoreFoundation"
  s.libraries    = "z", "c++"

  s.source_files = [
    # react-native-mmkv
    "ios/**/*.{h,m,mm}",
    "cpp/**/*.{hpp,cpp,c,h}",
    # MMKV/Core
    "MMKV/Core/**/*.{h,cpp,hpp,S}",
  ]
  s.compiler_flags = '-x objective-c++'

  s.requires_arc = [
    'MMKV/Core/MemoryFile.cpp',
    'MMKV/Core/ThreadLock.cpp',
    'MMKV/Core/InterProcessLock.cpp',
    'MMKV/Core/MMKVLog.cpp',
    'MMKV/Core/PBUtility.cpp',
    'MMKV/Core/MemoryFile_OSX.cpp',
    'MMKV/Core/aes/openssl/openssl_cfb128.cpp',
    'MMKV/Core/aes/openssl/openssl_aes_core.cpp',
    'MMKV/Core/aes/openssl/openssl_md5_one.cpp',
    'MMKV/Core/aes/openssl/openssl_md5_dgst.cpp',
    'MMKV/Core/aes/AESCrypt.cpp'
  ]

  install_modules_dependencies(s)
end
