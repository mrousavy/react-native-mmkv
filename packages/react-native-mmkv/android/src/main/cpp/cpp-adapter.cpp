#include "NitroMmkvOnLoad.hpp"
#include <jni.h>
#include <fbjni/fbjni.h>

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::mmkv::registerAllNatives();
  });
}
