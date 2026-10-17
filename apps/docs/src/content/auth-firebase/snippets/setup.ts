import { createAuthClient } from '@glyphui/auth'
import { firebaseAdapter } from '@glyphui/auth/firebase'
import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'acme.firebaseapp.com',
  projectId: 'acme',
})

export const auth = createAuthClient(
  firebaseAdapter(getAuth(app), {
    providers: { google: new GoogleAuthProvider() },
    actionCodeSettings: { url: 'https://acme.com/sign-in' },
  }),
)
