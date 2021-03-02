#pragma once

#include "JSValue.h"
#include "NativeModules.h"
#include <JSI/jsi.h>
#include <JSI/JsiApiContext.cpp>

using namespace winrt::Microsoft::ReactNative;
using namespace facebook;

namespace winrt::ReactNativeMmkv
{

REACT_MODULE(ReactNativeModule, L"ReactNativeMmkv")
struct ReactNativeModule
{
    void installMmkv(jsi::Runtime& runtime);

    REACT_INIT(Initialize)
    void Initialize(ReactContext const &reactContext) noexcept
    {
        m_reactContext = reactContext;
        auto& runtime = GetOrCreateContextRuntime(reactContext);
        installMmkv(runtime);
    }

    private:
        ReactContext m_reactContext{nullptr};
};

} // namespace winrt::ReactNativeMmkv
