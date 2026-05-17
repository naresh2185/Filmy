# Here are your Instructions

## Technologies Used to Build Filmy

### Frontend
- **React 19** – UI library
- **React Router v7** – Client-side routing (Home, Movie Details, Seat Selection, Checkout, Confirmation)
- **Tailwind CSS** + **shadcn/ui** – Styling and pre-built components (Dialog, Button, Toaster)
- **lucide-react** – Icon library (Film, Star, MapPin, etc.)
- **Axios** – HTTP client for TMDB API calls
- **Context API** – Global state (user, city, booking, modals)
- **localStorage / sessionStorage** – Persisting user session, city, and booking flow

### External APIs
- **TMDB (The Movie Database) API** – Real movie data: posters, ratings, cast, trailers, runtime, genres
- **YouTube embed** – In-app trailer playback

### Backend (Template only – not yet activated)
- **FastAPI** (Python) – API server scaffold
- **MongoDB** + **Motor** – Async database driver
- **Pydantic** – Data validation

### Dev/Infra
- **CRACO** – Custom CRA config
- **Supervisor** – Process management
- **Yarn** – Package manager

### Currently Mocked (frontend-only)
- OTP authentication (any 6 digits work)
- Events/Plays/Sports data (in `mock.js`)
- Cinemas, showtimes, seat layout, booked seats
- Payment processing (simulated 1.5s delay)

Want me to wire up the **real backend** next (MongoDB persistence for bookings + user accounts)?
