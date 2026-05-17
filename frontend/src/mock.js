// Mock data for events, plays, sports - movies will come from TMDB

export const CITIES = [
  'Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chandigarh',
  'Chennai', 'Pune', 'Kolkata', 'Kochi', 'Jaipur', 'Lucknow', 'Indore', 'Nagpur'
];

export const PROMO_BANNERS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80', title: 'Premiere Nights' },
  { id: 2, image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1600&q=80', title: 'Live Concerts' },
  { id: 3, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80', title: 'Theatre Plays' }
];

export const EVENTS = [
  { id: 'e1', title: 'Arijit Singh Live in Concert', category: 'Music Shows', date: '15 Aug onwards', venue: 'MMRDA Grounds, Mumbai', price: 1499, image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80' },
  { id: 'e2', title: 'Sunburn Arena ft. DJ Snake', category: 'Music Shows', date: '22 Aug', venue: 'NSCI Dome, Mumbai', price: 2500, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
  { id: 'e3', title: 'Zakir Khan Standup', category: 'Comedy Shows', date: '30 Aug', venue: 'Jio World Garden', price: 999, image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80' },
  { id: 'e4', title: 'Vir Das: Mind Fool Tour', category: 'Comedy Shows', date: '05 Sep', venue: 'St. Andrews, Bandra', price: 1299, image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&q=80' },
  { id: 'e5', title: 'Coldplay Music Of The Spheres', category: 'Music Shows', date: '18 Sep', venue: 'DY Patil Stadium', price: 3500, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80' },
  { id: 'e6', title: 'Comicstaan Live', category: 'Comedy Shows', date: '12 Sep', venue: 'Phoenix Marketcity', price: 799, image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80' }
];

export const PLAYS = [
  { id: 'p1', title: 'Mughal-E-Azam The Musical', category: 'Drama', date: '20 Aug', venue: 'NCPA, Mumbai', price: 1500, image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80' },
  { id: 'p2', title: 'A Streetcar Named Desire', category: 'Drama', date: '25 Aug', venue: 'Prithvi Theatre', price: 800, image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80' },
  { id: 'p3', title: 'Hamlet - The Clown Prince', category: 'Comedy', date: '02 Sep', venue: 'Royal Opera House', price: 1200, image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80' },
  { id: 'p4', title: 'The Glass Menagerie', category: 'Drama', date: '10 Sep', venue: 'NCPA Experimental', price: 1000, image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=600&q=80' }
];

export const SPORTS = [
  { id: 's1', title: 'India vs Australia ODI', category: 'Cricket', date: '24 Aug', venue: 'Wankhede Stadium', price: 1200, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80' },
  { id: 's2', title: 'ISL: Mumbai City FC vs FC Goa', category: 'Football', date: '01 Sep', venue: 'Mumbai Football Arena', price: 500, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80' },
  { id: 's3', title: 'Pro Kabaddi League', category: 'Kabaddi', date: '08 Sep', venue: 'NSCI Dome', price: 300, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80' },
  { id: 's4', title: 'Indian Open Tennis', category: 'Tennis', date: '15 Sep', venue: 'MSLTA Stadium', price: 800, image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80' }
];

export const CINEMAS = [
  { id: 'c1', name: 'PVR: Phoenix Marketcity, Kurla', address: 'LBS Marg, Kurla West', distance: '4.2 km' },
  { id: 'c2', name: 'INOX: R-City, Ghatkopar', address: 'R-City Mall, Ghatkopar West', distance: '6.1 km' },
  { id: 'c3', name: 'Cinepolis: Viviana Mall, Thane', address: 'Eastern Express Highway', distance: '12.5 km' },
  { id: 'c4', name: 'PVR ICON: Infiniti Mall, Andheri', address: 'New Link Road, Andheri West', distance: '8.3 km' },
  { id: 'c5', name: 'INOX: Atria Mall, Worli', address: 'Dr. Annie Besant Road, Worli', distance: '10.7 km' }
];

export const SHOWTIMES = ['10:15 AM', '12:30 PM', '03:45 PM', '06:50 PM', '09:30 PM', '11:45 PM'];

export const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];
export const FORMATS = ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'];
export const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror', 'Sci-Fi'];

// Seat layout configuration
export const SEAT_CATEGORIES = [
  { name: 'EXECUTIVE', price: 220, rows: ['A', 'B', 'C'], cols: 14 },
  { name: 'PREMIUM', price: 320, rows: ['D', 'E', 'F', 'G', 'H'], cols: 14 },
  { name: 'RECLINER', price: 450, rows: ['I', 'J'], cols: 12 }
];

// Random booked seats for realism
export const BOOKED_SEATS = [
  'A3', 'A4', 'B7', 'C2', 'C3', 'D5', 'D6', 'E10', 'F8', 'F9', 'F10',
  'G2', 'G3', 'H11', 'H12', 'I4', 'I5', 'J6'
];
