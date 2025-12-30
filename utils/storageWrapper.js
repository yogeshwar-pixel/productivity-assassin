// app/utils/storageWrapper.js
export async function getItem(key) {
  if (typeof window !== "undefined" && window.localStorage) {
    return Promise.resolve(window.localStorage.getItem(key));
  }
  // dynamic import so Metro on web doesn't try to require AsyncStorage at build-time
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  return AsyncStorage.getItem(key);
}

export async function setItem(key, value) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  }
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  return AsyncStorage.setItem(key, value);
}
