export const hotel = {
  name: 'Hi Test Travel Lodge',
  staffUrl: 'https://hms-hi-test-travel-lodge.vercel.app/',
  email: import.meta.env.VITE_CONTACT_EMAIL || '',
  phone: import.meta.env.VITE_CONTACT_PHONE || '',
  address: import.meta.env.VITE_HOTEL_ADDRESS || '',
};
export const scenes = [
  { image: '/images/hero-house.jpg', eyebrow: 'A WARM WELCOME, ALWAYS', title: ['A good stay.', 'A little more', 'like home.'], description: 'Settle in, share a meal, and make time for yourself. Your next stay begins at Hi Test Travel Lodge.', label: 'Welcome to the lodge' },
  { image: '/images/interior.jpg', eyebrow: 'MAKE ROOM FOR A LITTLE REST', title: ['Arrive. Unpack.', 'Make yourself', 'comfortable.'], description: 'With 39 rooms and 3 suites, there is space to make your stay your own. Explore our rooms and plan your visit.', label: 'Rooms & suites' },
  { image: '/images/lounge.jpg', eyebrow: 'MORE THAN A PLACE TO STAY', title: ['Good food.', 'Easy company.', 'Your kind of day.'], description: 'From the restaurant to the lounge and garden bars, take a moment to enjoy the little things.', label: 'Life at the lodge' },
];
export type Room = { id: string; name: string; description: string; rate?: number; capacity?: number; facilities?: string; demo?: boolean; image: string };
export const previewRooms: Room[] = [
  { id: 'preview-room', name: 'A room to unwind', description: 'A first look at the room experience. Actual room categories and details will be published soon.', demo: true, image: '/images/room.jpg' },
  { id: 'preview-deluxe', name: 'A little more space', description: 'Space to settle in, take a breath, and enjoy your time away. Illustrative room preview.', demo: true, image: '/images/interior.jpg' },
  { id: 'preview-suite', name: 'The suite experience', description: 'Discover our three suites. Individual suite details and photographs are coming soon.', demo: true, image: '/images/suite.jpg' },
];
export const gallery = [
  { image: '/images/hero-house.jpg', label: 'A welcoming arrival', category: 'Spaces' },
  { image: '/images/room.jpg', label: 'Room to relax', category: 'Rooms' },
  { image: '/images/lounge.jpg', label: 'Time well spent', category: 'Spaces' },
  { image: '/images/restaurant.jpg', label: 'Around the table', category: 'Dining' },
  { image: '/images/suite.jpg', label: 'A slower morning', category: 'Rooms' },
  { image: '/images/interior.jpg', label: 'Make yourself comfortable', category: 'Rooms' },
];
