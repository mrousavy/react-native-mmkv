#include <jni.h>
#include <jsi/jsi.h>

std::string jstringToStdString(JNIEnv *env, jstring jStr) {
    if (!jStr) return "";

    const auto stringClass = env->GetObjectClass(jStr);
    const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const auto stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes, env->NewStringUTF("UTF-8"));

    auto length = (size_t) env->GetArrayLength(stringJbytes);
    auto pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

    std::string ret = std::string((char *)pBytes, length);
    env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

    env->DeleteLocalRef(stringJbytes);
    env->DeleteLocalRef(stringClass);
    return ret;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_reactnativemmkv_MmkvModule_nativeInstall(JNIEnv *env, jobject clazz, jlong jsiPtr, jstring path) {
    auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
    if (runtime) {
        MmkvSetup::setupMmkv(runtime, jstringToStdString(env, path));
    }
    // if runtime was nullptr, MMKV will not be installed. This should only happen while Remote Debugging (Chrome), but will be weird either way.
}
