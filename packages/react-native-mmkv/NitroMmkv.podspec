require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NitroMmkv"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0, :tvos => "12.0", :osx => "10.14" }
  s.source       = { :git => "https://github.com/mrousavy/react-native-mmkv.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  # Add MMKV Core dependency
  s.compiler_flags = '-x objective-c++'
  s.dependency 'MMKVCore', '2.2.4'

  # Optionally configure MMKV log level via Podfile ($MMKVLogLevel) or env var (MMKV_LOG_LEVEL)
  mmkv_log_level = $MMKVLogLevel || ENV['MMKV_LOG_LEVEL']
  gcc_preprocessor_defs = "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES"
  if mmkv_log_level != nil && mmkv_log_level.to_s != ""
    gcc_preprocessor_defs += " MMKV_LOG_LEVEL=#{mmkv_log_level}"
  end

  # TODO: Remove when no one uses RN 0.79 anymore
  # Add support for React Native 0.79 or below
  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => ["${PODS_ROOT}/RCT-Folly"],
    "GCC_PREPROCESSOR_DEFINITIONS" => gcc_preprocessor_defs,
    "OTHER_CPLUSPLUSFLAGS" => "$(inherited) -DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1"
  }

  load 'nitrogen/generated/ios/NitroMmkv+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
