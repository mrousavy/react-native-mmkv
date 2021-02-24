#include <jni.h>
#include <android/log.h>

extern "C"
JNIEXPORT jobject JNICALL
Java_com_reactnativemmkv_MmkvModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsiPtr) {
    __android_log_print(ANDROID_LOG_VERBOSE, "react-native-leveldb", "Initializing react-native-mmkv");

    return nullptr;
}
