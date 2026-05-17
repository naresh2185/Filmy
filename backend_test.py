#!/usr/bin/env python3
"""
Backend API tests for Filmy (BookMyShow clone)
Tests all endpoints: auth, catalog, bookings
"""
import requests
import json
import sys
from typing import Dict, Any

# Read backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.split('=', 1)[1].strip()
            break

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing backend at: {API_BASE}\n")

# Test state
test_results = {
    'passed': 0,
    'failed': 0,
    'errors': []
}

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")
    if passed:
        test_results['passed'] += 1
    else:
        test_results['failed'] += 1
        test_results['errors'].append(f"{name}: {details}")
    print()

def test_auth_flow():
    """Test complete auth flow"""
    print("=" * 60)
    print("TESTING AUTH FLOW")
    print("=" * 60)
    
    # Test 1: Send OTP with valid phone
    print("\n1. POST /auth/send-otp with valid phone")
    try:
        resp = requests.post(f"{API_BASE}/auth/send-otp", json={"phone": "9876543210"}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data.get('ok') and 'message' in data:
                log_test("Send OTP - valid phone", True, f"Response: {data}")
            else:
                log_test("Send OTP - valid phone", False, f"Missing 'ok' or 'message' in response: {data}")
        else:
            log_test("Send OTP - valid phone", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Send OTP - valid phone", False, f"Exception: {str(e)}")
    
    # Test 2: Send OTP with invalid phone
    print("2. POST /auth/send-otp with invalid phone")
    try:
        resp = requests.post(f"{API_BASE}/auth/send-otp", json={"phone": "123"}, timeout=10)
        if resp.status_code == 400:
            log_test("Send OTP - invalid phone", True, f"Correctly rejected with 400")
        else:
            log_test("Send OTP - invalid phone", False, f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Send OTP - invalid phone", False, f"Exception: {str(e)}")
    
    # Test 3: Verify OTP with valid 6-digit OTP
    print("3. POST /auth/verify-otp with valid OTP")
    global auth_token, user_id
    auth_token = None
    user_id = None
    try:
        resp = requests.post(f"{API_BASE}/auth/verify-otp", 
                           json={"phone": "9876543210", "otp": "123456"}, 
                           timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'token' in data and 'user' in data:
                auth_token = data['token']
                user_id = data['user']['id']
                user_phone = data['user']['phone']
                user_name = data['user']['name']
                log_test("Verify OTP - valid", True, 
                        f"Token received, User: {user_name} ({user_phone}), ID: {user_id}")
            else:
                log_test("Verify OTP - valid", False, f"Missing 'token' or 'user' in response: {data}")
        else:
            log_test("Verify OTP - valid", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Verify OTP - valid", False, f"Exception: {str(e)}")
    
    # Test 4: Verify OTP with invalid OTP (non-numeric)
    print("4. POST /auth/verify-otp with invalid OTP (non-numeric)")
    try:
        resp = requests.post(f"{API_BASE}/auth/verify-otp", 
                           json={"phone": "9876543210", "otp": "abc123"}, 
                           timeout=10)
        if resp.status_code == 400:
            log_test("Verify OTP - invalid (non-numeric)", True, f"Correctly rejected with 400")
        else:
            log_test("Verify OTP - invalid (non-numeric)", False, 
                    f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Verify OTP - invalid (non-numeric)", False, f"Exception: {str(e)}")
    
    # Test 5: Verify OTP with 5-digit OTP
    print("5. POST /auth/verify-otp with 5-digit OTP")
    try:
        resp = requests.post(f"{API_BASE}/auth/verify-otp", 
                           json={"phone": "9876543210", "otp": "12345"}, 
                           timeout=10)
        if resp.status_code == 400:
            log_test("Verify OTP - 5-digit", True, f"Correctly rejected with 400")
        else:
            log_test("Verify OTP - 5-digit", False, f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Verify OTP - 5-digit", False, f"Exception: {str(e)}")
    
    # Test 6: GET /auth/me with valid token
    print("6. GET /auth/me with valid Bearer token")
    if auth_token:
        try:
            headers = {"Authorization": f"Bearer {auth_token}"}
            resp = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if 'user' in data and data['user']['id'] == user_id:
                    log_test("Auth /me - valid token", True, f"User: {data['user']}")
                else:
                    log_test("Auth /me - valid token", False, f"User mismatch or missing: {data}")
            else:
                log_test("Auth /me - valid token", False, f"Status {resp.status_code}: {resp.text}")
        except Exception as e:
            log_test("Auth /me - valid token", False, f"Exception: {str(e)}")
    else:
        log_test("Auth /me - valid token", False, "No auth token available from previous test")
    
    # Test 7: GET /auth/me with no token
    print("7. GET /auth/me with no token")
    try:
        resp = requests.get(f"{API_BASE}/auth/me", timeout=10)
        if resp.status_code == 401:
            log_test("Auth /me - no token", True, f"Correctly rejected with 401")
        else:
            log_test("Auth /me - no token", False, f"Expected 401, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Auth /me - no token", False, f"Exception: {str(e)}")
    
    # Test 8: GET /auth/me with invalid token
    print("8. GET /auth/me with invalid token")
    try:
        headers = {"Authorization": "Bearer invalid_token_xyz"}
        resp = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
        if resp.status_code == 401:
            log_test("Auth /me - invalid token", True, f"Correctly rejected with 401")
        else:
            log_test("Auth /me - invalid token", False, f"Expected 401, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("Auth /me - invalid token", False, f"Exception: {str(e)}")

def test_catalog_endpoints():
    """Test catalog endpoints"""
    print("\n" + "=" * 60)
    print("TESTING CATALOG ENDPOINTS")
    print("=" * 60)
    
    # Test 1: GET /events
    print("\n1. GET /events")
    try:
        resp = requests.get(f"{API_BASE}/events", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                # Check first event has required fields
                event = data[0]
                required_fields = ['id', 'title', 'category', 'venue', 'price', 'image']
                missing = [f for f in required_fields if f not in event]
                if not missing:
                    log_test("GET /events", True, f"Found {len(data)} events with all required fields")
                else:
                    log_test("GET /events", False, f"Missing fields in event: {missing}")
            else:
                log_test("GET /events", False, f"Expected non-empty list, got: {data}")
        else:
            log_test("GET /events", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /events", False, f"Exception: {str(e)}")
    
    # Test 2: GET /plays
    print("2. GET /plays")
    try:
        resp = requests.get(f"{API_BASE}/plays", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /plays", True, f"Found {len(data)} plays")
            else:
                log_test("GET /plays", False, f"Expected non-empty list, got: {data}")
        else:
            log_test("GET /plays", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /plays", False, f"Exception: {str(e)}")
    
    # Test 3: GET /sports
    print("3. GET /sports")
    try:
        resp = requests.get(f"{API_BASE}/sports", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /sports", True, f"Found {len(data)} sports events")
            else:
                log_test("GET /sports", False, f"Expected non-empty list, got: {data}")
        else:
            log_test("GET /sports", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /sports", False, f"Exception: {str(e)}")
    
    # Test 4: GET /cinemas
    print("4. GET /cinemas")
    try:
        resp = requests.get(f"{API_BASE}/cinemas", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /cinemas", True, f"Found {len(data)} cinemas")
            else:
                log_test("GET /cinemas", False, f"Expected non-empty list, got: {data}")
        else:
            log_test("GET /cinemas", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /cinemas", False, f"Exception: {str(e)}")
    
    # Test 5: GET /cinemas?city=Mumbai
    print("5. GET /cinemas?city=Mumbai")
    try:
        resp = requests.get(f"{API_BASE}/cinemas?city=Mumbai", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                # Check all are Mumbai
                non_mumbai = [c for c in data if c.get('city') != 'Mumbai']
                if not non_mumbai:
                    log_test("GET /cinemas?city=Mumbai", True, 
                            f"Found {len(data)} Mumbai cinemas, all correctly filtered")
                else:
                    log_test("GET /cinemas?city=Mumbai", False, 
                            f"Found non-Mumbai cinemas: {non_mumbai}")
            else:
                log_test("GET /cinemas?city=Mumbai", False, f"Expected non-empty list, got: {data}")
        else:
            log_test("GET /cinemas?city=Mumbai", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /cinemas?city=Mumbai", False, f"Exception: {str(e)}")

def test_bookings_flow():
    """Test bookings flow"""
    print("\n" + "=" * 60)
    print("TESTING BOOKINGS FLOW")
    print("=" * 60)
    
    if not auth_token:
        print("⚠️  Skipping bookings tests - no auth token available")
        return
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test data
    movie_id = "550"  # Fight Club from TMDB
    cinema_id = "c1"
    show_date = "2025-08-20"
    show_time = "10:15 AM"
    seats = ["A1", "A2"]
    
    # Test 1: GET /shows/booked-seats (should be empty initially)
    print("\n1. GET /shows/booked-seats (initial check)")
    try:
        params = {
            "movie_id": movie_id,
            "cinema_id": cinema_id,
            "date": show_date,
            "time": show_time
        }
        resp = requests.get(f"{API_BASE}/shows/booked-seats", params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booked_seats' in data and isinstance(data['booked_seats'], list):
                log_test("GET /shows/booked-seats - initial", True, 
                        f"Booked seats: {data['booked_seats']}")
            else:
                log_test("GET /shows/booked-seats - initial", False, 
                        f"Expected 'booked_seats' list, got: {data}")
        else:
            log_test("GET /shows/booked-seats - initial", False, 
                    f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /shows/booked-seats - initial", False, f"Exception: {str(e)}")
    
    # Test 2: POST /bookings with valid data and auth
    print("2. POST /bookings with valid data and auth")
    global booking_id
    booking_id = None
    try:
        booking_data = {
            "movie_id": movie_id,
            "movie_title": "Fight Club",
            "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
            "cinema_id": cinema_id,
            "cinema_name": "PVR: Phoenix Marketcity, Kurla",
            "show_date": show_date,
            "show_time": show_time,
            "seats": seats,
            "subtotal": 500,
            "fee": 50,
            "total": 550
        }
        resp = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booking' in data:
                booking = data['booking']
                booking_id = booking.get('id')
                booking_ref = booking.get('booking_ref')
                
                # Verify booking_ref starts with FLM
                if booking_ref and booking_ref.startswith('FLM'):
                    # Verify booking_id is UUID format
                    if booking_id and len(booking_id) == 36 and booking_id.count('-') == 4:
                        log_test("POST /bookings - valid", True, 
                                f"Booking created: {booking_ref}, ID: {booking_id}")
                    else:
                        log_test("POST /bookings - valid", False, 
                                f"Booking ID not UUID format: {booking_id}")
                else:
                    log_test("POST /bookings - valid", False, 
                            f"Booking ref doesn't start with FLM: {booking_ref}")
            else:
                log_test("POST /bookings - valid", False, f"Missing 'booking' in response: {data}")
        else:
            log_test("POST /bookings - valid", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /bookings - valid", False, f"Exception: {str(e)}")
    
    # Test 3: POST /bookings WITHOUT auth header
    print("3. POST /bookings WITHOUT auth header")
    try:
        booking_data = {
            "movie_id": movie_id,
            "movie_title": "Fight Club",
            "cinema_id": cinema_id,
            "cinema_name": "PVR: Phoenix Marketcity, Kurla",
            "show_date": show_date,
            "show_time": show_time,
            "seats": ["B1", "B2"],
            "subtotal": 500,
            "fee": 50,
            "total": 550
        }
        resp = requests.post(f"{API_BASE}/bookings", json=booking_data, timeout=10)
        if resp.status_code == 401:
            log_test("POST /bookings - no auth", True, f"Correctly rejected with 401")
        else:
            log_test("POST /bookings - no auth", False, 
                    f"Expected 401, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /bookings - no auth", False, f"Exception: {str(e)}")
    
    # Test 4: POST /bookings with empty seats list
    print("4. POST /bookings with empty seats list")
    try:
        booking_data = {
            "movie_id": movie_id,
            "movie_title": "Fight Club",
            "cinema_id": cinema_id,
            "cinema_name": "PVR: Phoenix Marketcity, Kurla",
            "show_date": show_date,
            "show_time": show_time,
            "seats": [],
            "subtotal": 0,
            "fee": 0,
            "total": 0
        }
        resp = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers, timeout=10)
        if resp.status_code == 400:
            log_test("POST /bookings - empty seats", True, f"Correctly rejected with 400")
        else:
            log_test("POST /bookings - empty seats", False, 
                    f"Expected 400, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /bookings - empty seats", False, f"Exception: {str(e)}")
    
    # Test 5: POST /bookings to same show/seats (conflict)
    print("5. POST /bookings to same show/seats (conflict)")
    try:
        booking_data = {
            "movie_id": movie_id,
            "movie_title": "Fight Club",
            "cinema_id": cinema_id,
            "cinema_name": "PVR: Phoenix Marketcity, Kurla",
            "show_date": show_date,
            "show_time": show_time,
            "seats": seats,  # Same seats as first booking
            "subtotal": 500,
            "fee": 50,
            "total": 550
        }
        resp = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers, timeout=10)
        if resp.status_code == 409:
            data = resp.json()
            # Check for conflict_seats in detail
            if 'detail' in data:
                detail = data['detail']
                if isinstance(detail, dict) and 'conflict_seats' in detail:
                    log_test("POST /bookings - conflict", True, 
                            f"Correctly returned 409 with conflict_seats: {detail['conflict_seats']}")
                else:
                    log_test("POST /bookings - conflict", False, 
                            f"409 returned but missing conflict_seats in detail: {data}")
            else:
                log_test("POST /bookings - conflict", False, 
                        f"409 returned but no detail field: {data}")
        else:
            log_test("POST /bookings - conflict", False, 
                    f"Expected 409, got {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /bookings - conflict", False, f"Exception: {str(e)}")
    
    # Test 6: GET /shows/booked-seats (should now include booked seats)
    print("6. GET /shows/booked-seats (after booking)")
    try:
        params = {
            "movie_id": movie_id,
            "cinema_id": cinema_id,
            "date": show_date,
            "time": show_time
        }
        resp = requests.get(f"{API_BASE}/shows/booked-seats", params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if 'booked_seats' in data:
                booked = data['booked_seats']
                # Check if our seats are in the booked list
                if all(seat in booked for seat in seats):
                    log_test("GET /shows/booked-seats - after booking", True, 
                            f"Booked seats correctly includes {seats}: {booked}")
                else:
                    log_test("GET /shows/booked-seats - after booking", False, 
                            f"Expected {seats} in booked seats, got: {booked}")
            else:
                log_test("GET /shows/booked-seats - after booking", False, 
                        f"Missing 'booked_seats' in response: {data}")
        else:
            log_test("GET /shows/booked-seats - after booking", False, 
                    f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /shows/booked-seats - after booking", False, f"Exception: {str(e)}")
    
    # Test 7: GET /bookings/me
    print("7. GET /bookings/me")
    try:
        resp = requests.get(f"{API_BASE}/bookings/me", headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                # Check if our booking is in the list
                our_booking = [b for b in data if b.get('id') == booking_id]
                if our_booking:
                    log_test("GET /bookings/me", True, 
                            f"Found {len(data)} bookings, including our booking {booking_id}")
                else:
                    log_test("GET /bookings/me", False, 
                            f"Our booking {booking_id} not found in list of {len(data)} bookings")
            else:
                log_test("GET /bookings/me", False, f"Expected list, got: {data}")
        else:
            log_test("GET /bookings/me", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("GET /bookings/me", False, f"Exception: {str(e)}")

def print_summary():
    """Print test summary"""
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    total = test_results['passed'] + test_results['failed']
    print(f"Total tests: {total}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    if test_results['errors']:
        print("\n" + "=" * 60)
        print("FAILED TESTS DETAILS")
        print("=" * 60)
        for error in test_results['errors']:
            print(f"❌ {error}")
    
    print("\n" + "=" * 60)
    if test_results['failed'] == 0:
        print("🎉 ALL TESTS PASSED!")
    else:
        print(f"⚠️  {test_results['failed']} TEST(S) FAILED")
    print("=" * 60)
    
    return 0 if test_results['failed'] == 0 else 1

if __name__ == "__main__":
    try:
        test_auth_flow()
        test_catalog_endpoints()
        test_bookings_flow()
        exit_code = print_summary()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
