#include <jni.h>
#include <jsi/jsi.h>
//#include "MMKV.h"

using namespace facebook;

void install(jsi::Runtime& runtime) {

}

std::string jstring2string(JNIEnv *env, jstring jStr) {
    if (!jStr)
        return "";

    const jclass stringClass = env->GetObjectClass(jStr);
    const jmethodID getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const jbyteArray stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes, env->NewStringUTF("UTF-8"));

    size_t length = (size_t) env->GetArrayLength(stringJbytes);
    jbyte* pBytes = env->GetByteArrayElements(stringJbytes, NULL);

    std::string ret = std::string((char *)pBytes, length);
    env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

    env->DeleteLocalRef(stringJbytes);
    env->DeleteLocalRef(stringClass);
    return ret;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativemmkv_MmkvModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsiPtr, jstring path) {
    //MMKV::initializeMMKV(jstring2string(env, path));

    auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
    install(*runtime);
}
