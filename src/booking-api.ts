import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, sendEmailVerification, signOut, type User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
const app = initializeApp({ apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID }, 'hotel-public-website');
const auth = getAuth(app), functions = getFunctions(app, 'europe-west1');
const emulators = import.meta.env.VITE_USE_EMULATORS === 'true';
if (emulators) { connectAuthEmulator(auth, 'http://127.0.0.1:9198', { disableWarnings: true }); connectFunctionsEmulator(functions, '127.0.0.1', 5101); }
// Debug attestation is development-only; never embed debug tokens in production builds.
if (import.meta.env.DEV && import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
 (self as unknown as {FIREBASE_APPCHECK_DEBUG_TOKEN:string|boolean}).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN === 'true' ? true : import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
}
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

export const watchCustomer = (callback:(user:User|null)=>void) => onAuthStateChanged(auth,callback);
export async function loginCustomer(email:string,password:string){return signInWithEmailAndPassword(auth,email,password);}
export async function registerCustomer(name:string,email:string,password:string){
 const result=await createUserWithEmailAndPassword(auth,email,password);
 await updateProfile(result.user,{displayName:name});
 await syncCustomerProfile();
 return result;
}
export async function resetCustomerPassword(email:string){await sendPasswordResetEmail(auth,email);}
export async function verifyCustomerEmail(){if(auth.currentUser)await sendEmailVerification(auth.currentUser);}
export async function logoutCustomer(){await signOut(auth);}
export async function currentCustomer(){await auth.authStateReady();return auth.currentUser;}
export function customerError(error:unknown):string{
 const code=(error as {code?:string})?.code||'';
 if(code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request')return 'Google sign-in was cancelled. You can try again.';
 if(code==='auth/popup-blocked')return 'Please allow the Google sign-in popup, then try again.';
 if(code==='auth/operation-not-allowed')return 'This sign-in option is not enabled yet. Please use email and password.';
 if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(code))return 'The email or password is incorrect.';
 if(code==='auth/email-already-in-use')return 'An account already uses this email. Please sign in or reset your password.';
 if(code==='auth/weak-password')return 'Please choose a stronger password.';
 if(code==='auth/too-many-requests'||code==='functions/resource-exhausted')return 'Too many attempts. Please wait a moment before trying again.';
 if(code==='functions/already-exists')return 'That room is no longer available for these dates. Please check availability again.';
 if(code==='functions/failed-precondition')return 'This action is not available for this booking yet. Please contact the lodge before making a payment.';
 if(code.startsWith('appCheck/')||code==='functions/unauthenticated'||code==='functions/permission-denied')return 'We could not securely complete this request. Please sign in again or contact the lodge.';
 return 'We could not complete this request. Please try again shortly.';
}

export async function loginWithGoogle(){
 const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
 return signInWithPopup(auth,provider);
}
export async function syncCustomerProfile(){return call<{id:string}>('syncCustomerProfile',{},true);}
