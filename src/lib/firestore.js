// src/lib/firestore.js
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

export async function saveSession(userId, sessionData) {
  const ref = await addDoc(collection(db, "sessions"), {
    userId,
    ...sessionData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserSessions(userId) {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSession(sessionId) {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
