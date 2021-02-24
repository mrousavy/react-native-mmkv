cmake_minimum_required(VERSION 3.4.1)

set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 11)

include_directories(
        MMKV/Core
        ../node_modules/react-native/ReactCommon/jsi
)

add_library(
        cpp
        SHARED
        cpp-adapter.cpp
        ../node_modules/react-native/ReactCommon/jsi/jsi/jsi.cpp
)

add_subdirectory(
        MMKV/Core
)
