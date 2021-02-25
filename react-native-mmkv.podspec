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

  s.source_files = "ios/**/*.{h,m,mm}", "MMKV/Core/**/*.{h,cpp}"
  s.compiler_flags = '-x objective-c++'

  s.framework    = "CoreFoundation"
  s.ios.frameworks = "UIKit"
  s.libraries    = "z", "c++"
  s.requires_arc = false
  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "gnu++17",
    "CLANG_CXX_LIBRARY" => "libc++",
    "CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF" => "NO",
  }

  s.dependency "React-Core"
end
