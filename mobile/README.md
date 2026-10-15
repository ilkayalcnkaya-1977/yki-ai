# YKIA AI Mobile — clean baseline

This folder is a clean Expo SDK 57 starter for the iOS app. It is intentionally limited to a launch-screen UI until the native app is verified on a device.

## Local verification

```bash
npm install
npx expo install --check
npx tsc --noEmit
npx expo start --lan --clear
```

Use a compatible Expo Go version for SDK 57. Do not add backend secrets to this app. Authentication, credits, and generation must call the existing secured backend; do not expose engine keys in the client.
