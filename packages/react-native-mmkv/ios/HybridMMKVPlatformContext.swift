//
//  HybridMMKVPlatformContext.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.24.
//

import NitroModules

class HybridMMKVPlatformContext: HybridMMKVPlatformContextSpec {
  static var directory: FileManager.SearchPathDirectory {
#if os(tvOS)
    return .cachesDirectory
#else
    return .documentDirectory
#endif
  }
  
  func getBaseDirectory() throws -> String {
    let paths = NSSearchPathForDirectoriesInDomains(Self.directory, .userDomainMask, true)
    if let documentPath = paths.first {
      let basePath = documentPath + "/mmkv"
      return basePath
    } else {
      throw RuntimeError.error(withMessage: "Cannot find base-path to store MMKV files!")
    }
  }
  
  func getAppGroupDirectory() -> String {
    return ""
  }
}
