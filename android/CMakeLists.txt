cmake_minimum_required(VERSION 3.9.0)

# Needed to locate double-conversion src correctly for folly includes
#execute_process (COMMAND ln "-s" "src" "../../react-native/third-party/double-conversion-1.1.6/double-conversion")

add_subdirectory(./MMKV/Core
        ./MMKV/Core
        EXCLUDE_FROM_ALL)

include_directories(
        ./MMKV/Core
        ../node_modules/react-native/React
        ../node_modules/react-native/React/Base
        ../node_modules/react-native/ReactCommon/jsi
)

add_definitions(
        -DFOLLY_USE_LIBCPP=1
        -DFOLLY_NO_CONFIG=1
        -DFOLLY_HAVE_MEMRCHR=1
)

add_library(cpp  # <-- Library name
        SHARED
        MMKV/Core # <-- EXCLUDE_FROM_ALL
        # Provides a relative path to your source file(s).
        ../node_modules/react-native/ReactCommon/jsi/jsi/jsi.cpp
        cpp-adapter.cpp
)

target_link_libraries(cpp
        MMKV/Core
        android)
