#include "MmkvHostObject.h"
#include "TypedArray.h"
#include <MMKV.h>
#include <jni.h>
#include <jsi/jsi.h>

using namespace facebook;

std::string getPropertyAsStringOrEmptyFromObject(jsi::Object& object,
                                                 const std::string& propertyName,
                                                 jsi::Runtime& runtime) {
  jsi::Value value = object.getProperty(runtime, propertyName.c_str());
  return value.isString() ? value.asString(runtime).utf8(runtime) : "";
}

const std::string MMKV_MULTI_PROCESS_MODE = "multi-process";
MMKVMode getPropertyAsMMKVModeFromObject(jsi::Object& object,
                           const std::string& propertyName,
                           jsi::Runtime& runtime) {
  std::string value = getPropertyAsStringOrEmptyFromObject(object, propertyName, runtime);
  if (value == MMKV_MULTI_PROCESS_MODE) {
    return MMKV_MULTI_PROCESS;
  }

  // Use Single Process as default value
  return MMKV_SINGLE_PROCESS;
}

void install(jsi::Runtime& jsiRuntime) {
  // MMKV.createNewInstance()
  auto mmkvCreateNewInstance = jsi::Function::createFromHostFunction(
      jsiRuntime, jsi::PropNameID::forAscii(jsiRuntime, "mmkvCreateNewInstance"), 1,
      [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments,
         size_t count) -> jsi::Value {
        if (count != 1) {
          throw jsi::JSError(runtime, "MMKV.createNewInstance(..) expects one argument (object)!");
        }
        jsi::Object config = arguments[0].asObject(runtime);

        std::string instanceId = getPropertyAsStringOrEmptyFromObject(config, "id", runtime);
        std::string path = getPropertyAsStringOrEmptyFromObject(config, "path", runtime);
        std::string encryptionKey =
            getPropertyAsStringOrEmptyFromObject(config, "encryptionKey", runtime);
        MMKVMode mode = getPropertyAsMMKVModeFromObject(config, "mode", runtime);

        auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey, mode);
        return jsi::Object::createFromHostObject(runtime, instance);
      });
  jsiRuntime.global().setProperty(jsiRuntime, "mmkvCreateNewInstance",
                                  std::move(mmkvCreateNewInstance));

  // Adds the PropNameIDCache object to the Runtime. If the Runtime gets destroyed, the Object gets
  // destroyed and the cache gets invalidated.
  auto propNameIdCache = std::make_shared<InvalidateCacheOnDestroy>(jsiRuntime);
  jsiRuntime.global().setProperty(jsiRuntime, "mmkvArrayBufferPropNameIdCache",
                                  jsi::Object::createFromHostObject(jsiRuntime, propNameIdCache));
}

std::string jstringToStdString(JNIEnv* env, jstring jStr) {
  if (!jStr)
    return "";

  const auto stringClass = env->GetObjectClass(jStr);
  const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
  const auto stringJbytes =
      (jbyteArray)env->CallObjectMethod(jStr, getBytes, env->NewStringUTF("UTF-8"));

  auto length = (size_t)env->GetArrayLength(stringJbytes);
  auto pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

  std::string ret = std::string((char*)pBytes, length);
  env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

  env->DeleteLocalRef(stringJbytes);
  env->DeleteLocalRef(stringClass);
  return ret;
}

extern "C" JNIEXPORT void JNICALL Java_com_reactnativemmkv_MmkvModule_nativeInstall(JNIEnv* env,
                                                                                    jobject clazz,
                                                                                    jlong jsiPtr,
                                                                                    jstring path) {
#if DEBUG
  MMKVLogLevel logLevel = MMKVLogDebug;
#else
  MMKVLogLevel logLevel = MMKVLogError;
#endif
  std::string storageDirectory = jstringToStdString(env, path);
  MMKV::initializeMMKV(storageDirectory, logLevel);

  auto runtime = reinterpret_cast<jsi::Runtime*>(jsiPtr);
  if (runtime) {
    install(*runtime);
  }
  // if runtime was nullptr, MMKV will not be installed. This should only happen while Remote
  // Debugging (Chrome), but will be weird either way.
}
