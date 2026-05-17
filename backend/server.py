from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import jwt

from seed_data import EVENTS_SEED, PLAYS_SEED, SPORTS_SEED, CINEMAS_SEED

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET') or secrets.token_urlsafe(32)
JWT_ALG = 'HS256'
JWT_EXP_DAYS = 7

app = FastAPI()
api = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

# ---------- Models ----------
class UserOut(BaseModel):
    id: str
    phone: str
    name: str

class SendOtpReq(BaseModel):
    phone: str

class VerifyOtpReq(BaseModel):
    phone: str
    otp: str

class BookingCreateReq(BaseModel):
    movie_id: str
    movie_title: str
    poster_path: Optional[str] = None
    cinema_id: str
    cinema_name: str
    show_date: str
    show_time: str
    seats: List[str]
    subtotal: int
    fee: int
    total: int

class BookingOut(BaseModel):
    id: str
    user_id: str
    movie_id: str
    movie_title: str
    poster_path: Optional[str] = None
    cinema_id: str
    cinema_name: str
    show_date: str
    show_time: str
    seats: List[str]
    subtotal: int
    fee: int
    total: int
    status: str
    booking_ref: str
    created_at: str

# ---------- Auth Helpers ----------
def create_token(user_id: str, phone: str) -> str:
    payload = {
        'sub': user_id,
        'phone': phone,
        'exp': datetime.utcnow() + timedelta(days=JWT_EXP_DAYS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing token')
    token = authorization.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
    user = await db.users.find_one({'id': payload['sub']})
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user

def clean_doc(d: dict) -> dict:
    if not d:
        return d
    d.pop('_id', None)
    return d

# ---------- Routes ----------
@api.get("/")
async def root():
    return {"message": "Filmy API"}

# Auth
@api.post("/auth/send-otp")
async def send_otp(req: SendOtpReq):
    if not req.phone or len(req.phone) < 10:
        raise HTTPException(status_code=400, detail='Invalid phone')
    logger.info(f"[mock] Sending OTP to {req.phone}")
    return {"ok": True, "message": "OTP sent (use any 6 digits)"}

@api.post("/auth/verify-otp")
async def verify_otp(req: VerifyOtpReq):
    if not req.otp or len(req.otp) != 6 or not req.otp.isdigit():
        raise HTTPException(status_code=400, detail='OTP must be 6 digits')
    phone_clean = req.phone.replace(' ', '').replace('+91', '').strip()
    user = await db.users.find_one({'phone': phone_clean})
    if not user:
        user = {
            'id': str(uuid.uuid4()),
            'phone': phone_clean,
            'name': f"User{phone_clean[-4:]}",
            'created_at': datetime.utcnow().isoformat()
        }
        await db.users.insert_one(user)
    user = clean_doc(user)
    token = create_token(user['id'], user['phone'])
    return {"token": token, "user": UserOut(**user)}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return {"user": UserOut(**clean_doc(user))}

# Catalog
@api.get("/events")
async def get_events():
    docs = await db.events.find().to_list(200)
    return [clean_doc(d) for d in docs]

@api.get("/plays")
async def get_plays():
    docs = await db.plays.find().to_list(200)
    return [clean_doc(d) for d in docs]

@api.get("/sports")
async def get_sports():
    docs = await db.sports.find().to_list(200)
    return [clean_doc(d) for d in docs]

@api.get("/cinemas")
async def get_cinemas(city: Optional[str] = None):
    q = {'city': city} if city else {}
    docs = await db.cinemas.find(q).to_list(200)
    return [clean_doc(d) for d in docs]

# Shows / Bookings
@api.get("/shows/booked-seats")
async def get_booked_seats(movie_id: str, cinema_id: str, date: str, time: str):
    doc = await db.show_seats.find_one({
        'movie_id': movie_id, 'cinema_id': cinema_id, 'show_date': date, 'show_time': time
    })
    return {"booked_seats": (doc or {}).get('booked_seats', [])}

def _build_show_key(req: BookingCreateReq) -> dict:
    return {
        'movie_id': req.movie_id,
        'cinema_id': req.cinema_id,
        'show_date': req.show_date,
        'show_time': req.show_time,
    }


async def _check_seat_conflict(show_key: dict, requested_seats: List[str]) -> List[str]:
    existing = await db.show_seats.find_one(show_key)
    booked_now = set((existing or {}).get('booked_seats', []))
    return [s for s in requested_seats if s in booked_now]


async def _reserve_seats(show_key: dict, seats: List[str]) -> None:
    """Atomically add seats to the show document; raise 409 if race detected."""
    await db.show_seats.update_one(
        show_key,
        {'$addToSet': {'booked_seats': {'$each': seats}}},
        upsert=True,
    )
    after = await db.show_seats.find_one(show_key)
    after_booked = set(after.get('booked_seats', []))
    if not set(seats).issubset(after_booked):
        raise HTTPException(status_code=409, detail={
            'message': 'Seat lock failed',
            'conflict_seats': seats,
        })


def _build_booking_doc(req: BookingCreateReq, user_id: str) -> dict:
    return {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'movie_id': req.movie_id,
        'movie_title': req.movie_title,
        'poster_path': req.poster_path,
        'cinema_id': req.cinema_id,
        'cinema_name': req.cinema_name,
        'show_date': req.show_date,
        'show_time': req.show_time,
        'seats': req.seats,
        'subtotal': req.subtotal,
        'fee': req.fee,
        'total': req.total,
        'status': 'confirmed',
        'booking_ref': 'FLM' + str(int(datetime.utcnow().timestamp()))[-8:],
        'created_at': datetime.utcnow().isoformat(),
    }


@api.post("/bookings")
async def create_booking(req: BookingCreateReq, user=Depends(get_current_user)):
    if not req.seats:
        raise HTTPException(status_code=400, detail='No seats selected')

    show_key = _build_show_key(req)
    conflict = await _check_seat_conflict(show_key, req.seats)
    if conflict:
        raise HTTPException(status_code=409, detail={
            'message': 'Seats already booked',
            'conflict_seats': conflict,
        })

    await _reserve_seats(show_key, req.seats)

    booking = _build_booking_doc(req, user['id'])
    await db.bookings.insert_one(booking)
    return {"booking": BookingOut(**clean_doc(booking))}

@api.get("/bookings/me")
async def my_bookings(user=Depends(get_current_user)):
    docs = await db.bookings.find({'user_id': user['id']}).sort('created_at', -1).to_list(100)
    return [BookingOut(**clean_doc(d)) for d in docs]

# Seed data on startup
async def seed_collection(name: str, items: list):
    coll = db[name]
    count = await coll.count_documents({})
    if count == 0 and items:
        await coll.insert_many([dict(it) for it in items])
        logger.info(f"Seeded {len(items)} into {name}")

@app.on_event("startup")
async def on_startup():
    await seed_collection('events', EVENTS_SEED)
    await seed_collection('plays', PLAYS_SEED)
    await seed_collection('sports', SPORTS_SEED)
    await seed_collection('cinemas', CINEMAS_SEED)
    await db.show_seats.create_index([('movie_id', 1), ('cinema_id', 1), ('show_date', 1), ('show_time', 1)], unique=True)
    await db.users.create_index('phone', unique=True)

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
