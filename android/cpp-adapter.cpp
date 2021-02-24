#include <jni.h>
#include <jsi/jsi.h>
#include "MMKV.h"

using namespace facebook;

void install(jsi::Runtime& jsiRuntime) {
    // MMKV.set(value: string | number | bool, key: string)
    auto mmkvSet = jsi::Function::createFromHostFunction(jsiRuntime,
                                                         jsi::PropNameID::forAscii(jsiRuntime, "mmkvSet"),
                                                         2,  // value, key
                                                         [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                             if (!arguments[1].isString()) throw jsi::JSError(runtime, "Second argument ('key') has to be of type string!");
                                                             auto keyName = arguments[1].getString(runtime).utf8(runtime);

                                                             if (arguments[0].isBool()) {
                                                                 MMKV::defaultMMKV()->set(arguments[0].getBool(), keyName);
                                                             } else if (arguments[0].isNumber()) {
                                                                 MMKV::defaultMMKV()->set(arguments[0].getNumber(), keyName);
                                                             } else if (arguments[0].isString()) {
                                                                 auto stringValue = arguments[0].getString(runtime).utf8(runtime);
                                                                 MMKV::defaultMMKV()->set(stringValue, keyName);
                                                             } else {
                                                                 throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number or string!");
                                                             }
                                                             return jsi::Value::undefined();
                                                         });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvSet", std::move(mmkvSet));


    // MMKV.getBoolean(key: string)
    auto mmkvGetBoolean = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetBoolean"),
                                                                1,  // key
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                                    if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
                                                                    auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                                    auto value = MMKV::defaultMMKV()->getBool(keyName);
                                                                    return jsi::Value(value);
                                                                });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetBoolean", std::move(mmkvGetBoolean));


    // MMKV.getString(key: string)
    auto mmkvGetString = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetString"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                                   if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
                                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                                   std::string result;
                                                                   MMKV::defaultMMKV()->getString(keyName, result);
                                                                   return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
                                                               });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetString", std::move(mmkvGetString));


    // MMKV.getNumber(key: string)
    auto mmkvGetNumber = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetNumber"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                                   if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
                                                                   auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                                   auto value = MMKV::defaultMMKV()->getDouble(keyName);
                                                                   return jsi::Value(value);
                                                               });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetNumber", std::move(mmkvGetNumber));


    // MMKV.delete(key: string)
    auto mmkvDelete = jsi::Function::createFromHostFunction(jsiRuntime,
                                                            jsi::PropNameID::forAscii(jsiRuntime, "mmkvDelete"),
                                                            1,  // key
                                                            [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                                if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
                                                                auto keyName = arguments[0].getString(runtime).utf8(runtime);

                                                                MMKV::defaultMMKV()->removeValueForKey(keyName);
                                                                return jsi::Value::undefined();
                                                            });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvDelete", std::move(mmkvDelete));


    // MMKV.getAllKeys()
    auto mmkvGetAllKeys = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetAllKeys"),
                                                                0,
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
                                                                    auto keys = MMKV::defaultMMKV()->allKeys();
                                                                    return jsi::Value(runtime, keys);
                                                                });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetAllKeys", std::move(mmkvGetAllKeys));
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
    MMKV::initializeMMKV(jstring2string(env, path));

    auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
    install(*runtime);
}
