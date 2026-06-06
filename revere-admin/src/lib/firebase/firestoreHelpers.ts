import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getDb } from "./client";

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return new Date(0);
};

export const readDate = (value: unknown): Date => toDate(value);

export const readNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const readStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const readBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

export const readNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const getDocumentById = async <T>(
  collectionName: string,
  id: string,
  mapper: (snapshot: QueryDocumentSnapshot) => T,
): Promise<T | undefined> => {
  const snapshot = await getDoc(doc(getDb(), collectionName, id));
  if (!snapshot.exists()) return undefined;
  return mapper(snapshot as QueryDocumentSnapshot);
};

export const getCollectionDocuments = async <T>(
  collectionName: string,
  mapper: (snapshot: QueryDocumentSnapshot) => T,
): Promise<T[]> => {
  const snapshot = await getDocs(collection(getDb(), collectionName));
  return snapshot.docs.map(mapper);
};

export const fieldValueExists = async (
  collectionName: string,
  field: string,
  value: string,
  excludeId?: string,
): Promise<boolean> => {
  const snapshot = await getDocs(
    query(collection(getDb(), collectionName), where(field, "==", value)),
  );

  return snapshot.docs.some((item) => item.id !== excludeId);
};
