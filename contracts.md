# Filmy — Backend Contracts

## Scope
- Implement: Auth (mock OTP + JWT), Bookings (with atomic seat lock), Events/Plays/Sports/Cinemas listing, User profile, Booking history
- Keep using: TMDB API directly from frontend for movies (already works, cached client-side)

## Data Models (MongoDB)

### users
```
{ id (uuid str), phone, name, created_at }
```

### bookings
```
{ id (uuid str), user_id, movie_id (tmdb id str), movie_title, poster_path,
  cinema_id, cinema_name, show_date (ISO str), show_time (str),
  seats: [str], subtotal, fee, total, status: "confirmed",
  booking_ref: "FLM" + 8 digits, created_at }
```

### show_seats (per show slot, holds booked seats across users)
```
{ id (uuid str), movie_id, cinema_id, show_date, show_time, booked_seats: [str] }
Unique composite key: (movie_id, cinema_id, show_date, show_time)
```

### events / plays / sports (seeded once from mock data)
```
{ id (str), title, category, date, venue, price, image }
```

### cinemas (seeded once)
```
{ id, name, address, distance, city }
```

## REST API (all prefixed with /api)

### Auth
- `POST /api/auth/send-otp`         body: `{phone}` → `{ok: true}`
- `POST /api/auth/verify-otp`       body: `{phone, otp}` (any 6 digits accepted) → `{token, user}`
- `GET  /api/auth/me`               header: Authorization: Bearer <token> → `{user}`

### Catalog
- `GET /api/events`                 → list
- `GET /api/plays`                  → list
- `GET /api/sports`                 → list
- `GET /api/cinemas?city=Mumbai`    → list

### Showtimes / Bookings
- `GET  /api/shows/booked-seats?movie_id=&cinema_id=&date=&time=`  → `{booked_seats: [str]}`
- `POST /api/bookings`              auth required, body: `{movie_id, movie_title, poster_path, cinema_id, cinema_name, show_date, show_time, seats[], subtotal, fee, total}`
  → atomically adds seats to `show_seats.booked_seats` (only if no conflict); creates booking; returns `{booking}`
  → on seat conflict returns 409 `{detail: "Seats already booked", conflict_seats: [...]}`
- `GET  /api/bookings/me`           auth required → user's bookings (newest first)

## Auth Mechanism
- JWT (HS256), signed with `JWT_SECRET` env var (auto-generated if missing)
- Token payload: `{sub: user_id, phone, exp (7 days)}`

## Frontend Integration Changes
Replace in this order:
1. `AppContext` — `setUser` should now store `{user, token}`; persist token in localStorage. Add `apiClient` axios instance with bearer header interceptor.
2. `AuthModal` — call `/auth/send-otp` then `/auth/verify-otp`, save token+user from response
3. `SeatSelection` — on mount, fetch `GET /shows/booked-seats` and merge with mock BOOKED_SEATS for richer demo
4. `Checkout` — on Pay, call `POST /bookings`; on 409, navigate back to seats with error toast
5. `Confirmation` — read booking from sessionStorage (already set after successful booking response)
6. `ListingPage` — for `events/plays/sports`, fetch from backend instead of importing from mock.js
7. `Home` — fetch events/plays/sports from backend; keep TMDB calls

## Seeding
On backend startup, seed `events`, `plays`, `sports`, `cinemas` if empty (idempotent).

## Notes
- TMDB is left as direct frontend call (no proxy) to keep this MVP focused
- Movies (now playing / upcoming) continue to come from TMDB directly
- Seat-lock uses MongoDB `$addToSet` with pre-check; on collision returns 409
