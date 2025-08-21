#include <jni.h>
#include "NitroMmkvOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::mmkv::initialize(vm);
}
