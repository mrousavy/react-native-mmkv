# Copyright (c) Marc Rousavy.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

add_compile_options(
        -fexceptions
        -frtti
        -std=c++20
        -Wall
        -Wpedantic
        -DFOLLY_NO_CONFIG=1
        -DLOG_TAG=\"ReactNative\")

file(GLOB RNMMKV_SOURCES CONFIGURE_DEPENDS *.cpp)
add_library(react_native_mmkv_core STATIC ${RNMMKV_SOURCES})

target_include_directories(react_native_mmkv_core PUBLIC .)

target_link_libraries(react_native_mmkv_core
        fbjni
        jsi
        react_nativemodule_core
)


target_include_directories(react_codegen_RNMmkvSpec PUBLIC .)
target_link_libraries(react_native_mmkv_core react_codegen_RNMmkvSpec)
