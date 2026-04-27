import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import app from "./client"

export const auth = getAuth(app)

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const token = await credential.user.getIdToken()
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  return credential
}

export async function signUp(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const token = await credential.user.getIdToken()
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  return credential
}

export async function signOut() {
  await firebaseSignOut(auth)
  await fetch("/api/auth/session", { method: "DELETE" })
}
