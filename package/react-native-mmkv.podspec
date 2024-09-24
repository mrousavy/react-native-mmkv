require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::UI.puts "[react-native-mmkv] Thank you for using react-native-mmkv ❤️"
Pod::UI.puts "[react-native-mmkv] If you enjoy using react-native-mmkv, please consider sponsoring this project: https://github.com/sponsors/mrousavy"

Pod::Spec.new do |s|
  s.name         = "react-native-mmkv"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :tvos => "12.0", :osx => "10.14" }
  s.source       = { :git => "https://github.com/mrousavy/react-native-mmkv.git", :tag => "#{s.version}" }

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
    # FORCE_POSIX ensures we are using C++ types instead of Objective-C types for MMKV.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FORCE_POSIX",
  }
  s.compiler_flags = '-x objective-c++'

  s.source_files = [
    # react-native-mmkv
    "ios/**/*.{h,m,mm}",
    "cpp/**/*.{hpp,cpp,c,h}",
    # MMKV/Core
    "MMKV/Core/**/*.{h,cpp,hpp,S}",
  ]

  install_modules_dependencies(s)
end
