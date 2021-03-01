#pragma once

#include "JSValue.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeMmkv
{

REACT_MODULE(ReactNativeModule, L"ReactNativeMmkv")
struct ReactNativeModule
{
    void installMmkv();

    REACT_INIT(Initialize)
    void Initialize(ReactContext const &reactContext) noexcept
    {
        m_reactContext = reactContext;
        installMmkv();
    }
    
    REACT_METHOD(sampleMethod)
    void sampleMethod(std::string stringArgument, int numberArgument, std::function<void(std::string)> &&callback) noexcept
    {
        // TODO: Implement some actually useful functionality
        callback("Received numberArgument: " + std::to_string(numberArgument) + " stringArgument: " + stringArgument);
    }

    private:
        ReactContext m_reactContext{nullptr};
};

} // namespace winrt::ReactNativeMmkv
