#include <jni.h>
#include <android/log.h>
#include "MMKV/Core/MMKV.h"
#include <jsi/jsi.h>

using namespace facebook;

void install(jsi::Runtime& runtime) {

}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativemmkv_MmkvModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsiPtr) {
    __android_log_print(ANDROID_LOG_VERBOSE, "react-native-leveldb", "Initializing react-native-mmkv");
    MMKV::initializeMMKV(nullptr);

    auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
    install(*runtime);
}
