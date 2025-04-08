require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

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
  }

  s.source_files = [
    # react-native-mmkv
    "ios/**/*.{h,m,mm}",
    "cpp/**/*.{hpp,cpp,c,h}"
  ]

  s.dependency 'MMKVCore'
  install_modules_dependencies(s)
end
