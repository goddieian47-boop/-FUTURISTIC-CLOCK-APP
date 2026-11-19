# Orbit Clock

Orbit is a mobile-first clock app wrapped with Capacitor for Android. It includes a live 24-hour clock, world clocks, daily alarms, reminders, a countdown timer, stopwatch, three generated alarm tones, BLE pairing, Pong, and saved theme/font/wallpaper preferences.

## Build an APK with GitHub Actions

1. Create a GitHub repository and upload/push the contents of this folder.
2. In GitHub, open **Actions** and enable workflows if prompted.
3. Run **Build Android APK** from the Actions tab, or push to `main`/`master`.
4. Open the finished workflow run and download **orbit-clock-debug-apk** from its Artifacts section.
5. Install `app-debug.apk` on an Android device. Android may ask you to allow installation from the browser or file manager.

The workflow builds the Capacitor Android project, creates the ringtone audio resources and launcher icon resources, and uploads a debug APK. No Android Studio is needed for the GitHub build.

## Build locally

Requires Node.js 20, Python 3, Java 17, and the Android SDK:

```sh
npm install
npm run build
npx cap add android
python3 scripts/prepare_android.py
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

Android alarm delivery uses local notifications. Allow notifications and exact alarms when Android requests them. Alarm/ringtone delivery can still be affected by device battery policies, Do Not Disturb, and user notification-channel settings.

Bluetooth supports BLE discovery and connection. Sending time to a remote clock requires that clock's specific GATT service and characteristic protocol; those vary by device.
