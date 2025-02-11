require "json"

# Define a minimum iOS version if not already defined.
min_ios_version_supported = '11.0'

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

  # Set the supported platforms
  s.platforms    = { :ios => min_ios_version_supported, :tvos => "12.0", :osx => "10.14" }
  
  # Source points to the official repository (you might update this if your fork is published elsewhere)
  s.source       = { :git => "https://github.com/mrousavy/react-native-mmkv.git", :tag => "#{s.version}" }
  
  # Force the dependency to use MMKV version 2.12.2,
  # which is the version that supports App Group functionality.
  s.dependency 'MMKV', '2.12.2'
  
  # Configure the pod target's build settings.
  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
    # Use FORCE_POSIX to ensure C++ types are used for MMKV.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FORCE_POSIX",
    # Expose headers properly so they’re accessible in both the main app and extension.
    "DEFINES_MODULE" => "YES",
    "HEADER_SEARCH_PATHS" => "$(inherited) $(PODS_ROOT)/Headers/Public/**"
  }

  # Ensure source files compile as Objective-C++
  s.compiler_flags = '-x objective-c++'

  # Specify the source files to be included.
  s.source_files = [
    "ios/**/*.{h,m,mm}",
    "cpp/**/*.{hpp,cpp,c,h}",
    "MMKV/Core/**/*.{h,cpp,hpp,S}"
  ]

  # Install any module dependencies if defined (this method should be available in the repo's tooling)
  install_modules_dependencies(s)
end
