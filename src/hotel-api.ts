export type PublishedRoom = { id:string; name:string; description?:string; capacity?:number; facilities?:string; rate?:number };
export type WebsiteRoom = PublishedRoom & { image:string; preview:boolean };
export type Availability = { available:number; total:number; deposit:number; currency:string; indicative:true };
export const backendConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_APP_ID && (import.meta.env.VITE_APPCHECK_SITE_KEY || import.meta.env.VITE_USE_EMULATORS === 'true'));
let client: Promise<typeof import('./booking-api')> | undefined;
const api = () => client ||= import('./booking-api');
export async function loadPublishedRooms():Promise<PublishedRoom[]> {
 const result=await (await api()).call<PublishedRoom[]>('publicRooms');
 if(!Array.isArray(result))throw new Error('Unexpected room response');
 return result.filter(room=>typeof room.id==='string'&&typeof room.name==='string');
}
export async function checkRoomAvailability(roomTypeId:string,checkIn:string,checkOut:string,guestCount:number):Promise<Availability>{
 return (await api()).call<Availability>('publicAvailability',{roomTypeId,checkIn,checkOut,guestCount});
}
export function formatStayPrice(value:number,currency:string){
 return new Intl.NumberFormat('en-NG',{style:'currency',currency:currency||'NGN',maximumFractionDigits:0}).format(value/100);
}
