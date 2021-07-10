#include <jni.h>
#include <jsi/jsi.h>
#include "MMKV.h"
#include "MmkvBinding.h"

using namespace facebook;

void install(jsi::Runtime& jsiRuntime) {
    auto mmkvWithID = jsi::Function::createFromHostFunction(jsiRuntime,
                                                            jsi::PropNameID::forAscii(jsiRuntime, "mmkvWithID"),
                                                            1,  // id
                                                            [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString() && !arguments[0].isNull()) throw jsi::JSError(runtime, "mmkvWithID: First argument ('id') has to be of type string or null.");
        auto mmkv = arguments[0].isNull()
          ? MMKV::defaultMMKV()
          : MMKV::mmkvWithID(arguments[0].getString(runtime).utf8(runtime));
        auto mmkvJsi = std::make_shared<react::mmkv::MmkvBinding>(std::move(mmkv));
        return jsi::Object::createFromHostObject(runtime, mmkvJsi);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvWithID", std::move(mmkvWithID));
}

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
    MMKV::initializeMMKV(jstringToStdString(env, path));

    auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
    if (runtime) {
        install(*runtime);
    }
    // if runtime was nullptr, MMKV will not be installed. This should only happen while Remote Debugging (Chrome), but will be weird either way.
}
