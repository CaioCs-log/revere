import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??= "local-test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??= "localhost";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "revere-admin-test";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??= "localhost";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??= "local-test-sender";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??= "local-test-app-id";
process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR ??= "true";
process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ??= "127.0.0.1";
process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ??= "8080";
