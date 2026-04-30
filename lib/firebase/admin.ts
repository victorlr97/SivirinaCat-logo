import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function init() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/\r/g, ""),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const storage = new Proxy({} as ReturnType<typeof getStorage>, {
  get(_, prop: string) { init(); return (getStorage() as any)[prop]; },
});

export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_, prop: string) { init(); return (getAuth() as any)[prop]; },
});

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop: string) { init(); return (getFirestore() as any)[prop]; },
});
