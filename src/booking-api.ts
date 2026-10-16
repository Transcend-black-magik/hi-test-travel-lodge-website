import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, connectAuthEmulator } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
const app = initializeApp({ apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID }, 'hotel-public-website');
const auth = getAuth(app), functions = getFunctions(app, 'europe-west1');
const emulators = import.meta.env.VITE_USE_EMULATORS === 'true';
if (emulators) { connectAuthEmulator(auth, 'http://127.0.0.1:9198', { disableWarnings: true }); connectFunctionsEmulator(functions, '127.0.0.1', 5101); }
const appCheck = !emulators && import.meta.env.VITE_APPCHECK_SITE_KEY ? initializeAppCheck(app, { provider: import.meta.env.VITE_APPCHECK_PROVIDER === 'v3' ? new ReCaptchaV3Provider(import.meta.env.VITE_APPCHECK_SITE_KEY) : new ReCaptchaEnterpriseProvider(import.meta.env.VITE_APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true }) : null;
const hotelId = import.meta.env.VITE_HOTEL_ID || 'grand-valley';
export const liveConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY) && (emulators || Boolean(import.meta.env.VITE_APPCHECK_SITE_KEY));
export async function call<T>(name: string, payload: Record<string, unknown> = {}, guest = false): Promise<T> {
  if (!liveConfigured) throw new Error('Online reservations are not available yet.');
  if (appCheck) await getToken(appCheck);
  if (guest) { await auth.authStateReady(); if (!auth.currentUser) await signInAnonymously(auth); }
  const response = await httpsCallable(functions, name)({ hotelId, ...payload });
  return response.data as T;
}
