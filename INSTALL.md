# Install MMKV

MMKV uses JSI which has not been officially released. For now, you have to manually edit a Java file to correctly set up MMKV.

Since react-native-reanimated also uses JSI, there will be conflicts if you install both libraries at the same time. That's why the installation steps are different:

<details>
<summary>Without react-native-reanimated</summary>

To install MMKV without Reanimated, open your Android project (the `android` folder) in Android Studio. In `MainApplication.java` find the location where the `ReactNativeHost` is initialized. You have to override it's `getJSIModulePackage` method:


```java
import com.reactnativemmkv.MmkvModulePackage;
import com.facebook.react.bridge.JSIModulePackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          return new PackageList(this).getPackages();
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        // Add this method here!
        @Override
        protected JSIModulePackage getJSIModulePackage() {
          return new MmkvModulePackage();
        }
      };

  // ...
```

</details>

<details>
<summary>With react-native-reanimated</summary>

To install MMKV with Reanimated, open your Android project (the `android` folder) in Android Studio.

1. Find the folder where `MainActivity.java` and `MainApplication.java` live.
2. Right click, "New" > "Java class"
3. Call it whatever you prefer, in my case it's `ExampleJSIPackage` because my app is called "Example".
4. Add the following code:

```java
package com.example;

import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.swmansion.reanimated.ReanimatedJSIModulePackage;
import com.reactnativemmkv.MmkvModule;

import java.util.Collections;
import java.util.List;

// TODO: Remove all of this when MMKV and Reanimated can be autoinstalled (maybe RN 0.65)
public class ExampleJSIPackage extends ReanimatedJSIModulePackage {
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        MmkvModule.install(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
        return super.getJSIModules(reactApplicationContext, jsContext);
    }
}

```
5. Replace `com.example` with your package namespace

6. Open `MainApplication.java` and find the location where the `ReactNativeHost` is initialized. You have to override it's `getJSIModulePackage` method:

```java
import com.facebook.react.bridge.JSIModulePackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          return new PackageList(this).getPackages();
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        // Add this method here!
        @Override
        protected JSIModulePackage getJSIModulePackage() {
          return new ExampleJSIPackage(); // <-- your package's name
        }
      };

  // ...
```

</details>


## Notes

All of this is a temporary workaround. JSI and TurboModules are still actively in development and cannot be autolinked yet. All of this will change very soon and no extra configuration will be needed to use MMKV.
