import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "local-dev-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "revere-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "localhost",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "local-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "local-app-id",
};

let firestoreInstance: Firestore | null = null;
let emulatorConnected = false;

const shouldUseFirestoreEmulator = () =>
  (process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR || "true") !== "false";

const getEmulatorHost = () =>
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "127.0.0.1";

const getEmulatorPort = () =>
  Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080");

export const getFirebaseApp = (): FirebaseApp =>
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const getDb = (): Firestore => {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }

  if (shouldUseFirestoreEmulator() && !emulatorConnected) {
    connectFirestoreEmulator(
      firestoreInstance,
      getEmulatorHost(),
      getEmulatorPort(),
    );
    emulatorConnected = true;
  }

  return firestoreInstance;
};

export const getFirebaseProjectId = () => firebaseConfig.projectId;

export const isUsingFirestoreEmulator = () => shouldUseFirestoreEmulator();
