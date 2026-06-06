export const getEmulatorProjectId = () =>
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "revere-admin-test";

export const clearFirestoreEmulator = async () => {
  const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "127.0.0.1";
  const port = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080";
  const projectId = getEmulatorProjectId();
  const response = await fetch(
    `http://${host}:${port}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Falha ao limpar Firestore Emulator (${response.status} ${response.statusText}).`,
    );
  }
};
