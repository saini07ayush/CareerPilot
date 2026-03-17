import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

export async function saveSession(userId, sessionData) {
  try {
    const ref = await addDoc(collection(db, 'sessions'), {
      userId,
      ...sessionData,
      createdAt: serverTimestamp(),
    })
    console.log('Session saved:', ref.id)
    return ref.id
  } catch (err) {
    console.error('saveSession error:', err)
    return null
  }
}

export async function getUserSessions(userId) {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    // If index error, fallback without orderBy
    console.warn('Trying without orderBy:', err.message)
    try {
      const q2 = query(
        collection(db, 'sessions'),
        where('userId', '==', userId)
      )
      const snap2 = await getDocs(q2)
      return snap2.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    } catch (err2) {
      console.error('getUserSessions error:', err2)
      return []
    }
  }
}