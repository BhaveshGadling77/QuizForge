import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const GOOGLE_POPUP_TIMEOUT_MS = 30000;

googleProvider.setCustomParameters({
  prompt: "select_account",
});

function withPopupTimeout(popupPromise) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      const error = new Error("Google sign-in was cancelled or timed out.");
      error.code = "auth/popup-timeout";
      reject(error);
    }, GOOGLE_POPUP_TIMEOUT_MS);
  });

  return Promise.race([popupPromise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

export function getGoogleAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    case "auth/popup-timeout":
      return "Google sign-in timed out. Please try again.";
    default:
      return error?.message || "Google sign-in failed.";
  }
}

export async function signInWithGoogle() {
  const result = await withPopupTimeout(signInWithPopup(auth, googleProvider));
  return result.user.getIdToken();
}
