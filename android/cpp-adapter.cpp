#include <jni.h>
#include "react-native-mmkv.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_mmkv_MmkvModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return mmkv::multiply(a, b);
}
