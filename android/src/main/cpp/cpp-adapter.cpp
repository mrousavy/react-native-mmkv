#include <jni.h>

extern "C" JNIEXPORT jdouble JNICALL Java_com_mmkv_MmkvModule_nativeMultiply(JNIEnv* env,
                                                                             jclass type, jdouble a,
                                                                             jdouble b) {
  return 5.0;
}
