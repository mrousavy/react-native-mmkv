//
//  MmkvLogger.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

#include <string>

class MmkvLogger {
private:
  MmkvLogger() = delete;


public:
  static void log(const std::string& tag, const std::string& formatString, Args... args);

  template <typename... Args>
  inline static void log(const std::string& tag, const std::string& formatString, Args&&... args) {
    log(tag, formatString, std::forward<Args>(args)...);
  }
};
