#!/usr/bin/env python3
"""
Regression test for refactored create_booking endpoint
Tests the 4 helper functions: _build_show_key, _check_seat_conflict, _reserve_seats, _build_booking_doc
"""
import requests
import json
import sys

# Read backend URL from frontend/.env
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.split('=', 1)[1].strip()
            break

API_BASE = f"{BACKEND_URL}/api"
print(f"🔍 Regression Testing Backend at: {API_BASE}\n")
print("=" * 70)
print("REGRESSION TEST: Refactored create_booking endpoint")
print("=" * 70)

# Test state
passed = 0
failed = 0
errors = []

def log_result(test_num: str, name: str, success: bool, details: str = ""):
    """Log test result"""
    global passed, failed
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"\n{test_num}. {name}")
    print(f"   {status}")
    if details:
        print(f"   {details}")
    if success:
        passed += 1
    else:
        failed += 1
        errors.append(f"{test_num} {name}: {details}")

# Test 1: Verify OTP with specific credentials
print("\n" + "-" * 70)
print("TEST 1: POST /api/auth/verify-otp")
print("-" * 70)
auth_token = None
try:
    resp = requests.post(
        f"{API_BASE}/auth/verify-otp",
        json={"phone": "9988776655", "otp": "111111"},
        timeout=10
    )
    if resp.status_code == 200:
        data = resp.json()
        if 'token' in data and 'user' in data:
            auth_token = data['token']
            log_result("1", "Verify OTP (9988776655, 111111)", True, 
                      f"✓ Got token and user: {data['user']['name']}")
        else:
            log_result("1", "Verify OTP (9988776655, 111111)", False, 
                      f"Missing token or user in response: {data}")
    else:
        log_result("1", "Verify OTP (9988776655, 111111)", False, 
                  f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("1", "Verify OTP (9988776655, 111111)", False, f"Exception: {str(e)}")

if not auth_token:
    print("\n❌ FATAL: Cannot proceed without auth token")
    sys.exit(1)

headers = {"Authorization": f"Bearer {auth_token}"}

# Test 2: Create booking with specific test data
print("\n" + "-" * 70)
print("TEST 2: POST /api/bookings (first booking)")
print("-" * 70)
booking_data = {
    "movie_id": "999",
    "movie_title": "Test Movie",
    "poster_path": "/test.jpg",
    "cinema_id": "c1",
    "cinema_name": "Test Cinema",
    "show_date": "2025-12-01",
    "show_time": "10:15 AM",
    "seats": ["X1", "X2"],
    "subtotal": 600,
    "fee": 50,
    "total": 650
}

booking_id = None
try:
    resp = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if 'booking' in data:
            booking = data['booking']
            booking_id = booking.get('id')
            booking_ref = booking.get('booking_ref')
            seats = booking.get('seats')
            
            # Verify booking_ref starts with FLM
            ref_ok = booking_ref and booking_ref.startswith('FLM')
            # Verify booking_id is UUID format (36 chars with 4 dashes)
            id_ok = booking_id and len(booking_id) == 36 and booking_id.count('-') == 4
            # Verify seats are X1, X2
            seats_ok = seats == ["X1", "X2"]
            
            if ref_ok and id_ok and seats_ok:
                log_result("2", "Create booking (X1, X2)", True, 
                          f"✓ booking_ref={booking_ref}, id={booking_id}, seats={seats}")
            else:
                issues = []
                if not ref_ok: issues.append(f"booking_ref doesn't start with FLM: {booking_ref}")
                if not id_ok: issues.append(f"id not UUID format: {booking_id}")
                if not seats_ok: issues.append(f"seats mismatch: expected ['X1', 'X2'], got {seats}")
                log_result("2", "Create booking (X1, X2)", False, "; ".join(issues))
        else:
            log_result("2", "Create booking (X1, X2)", False, f"Missing 'booking' in response: {data}")
    else:
        log_result("2", "Create booking (X1, X2)", False, 
                  f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("2", "Create booking (X1, X2)", False, f"Exception: {str(e)}")

# Test 3: Try to book same seats again (full conflict)
print("\n" + "-" * 70)
print("TEST 3: POST /api/bookings (same seats - full conflict)")
print("-" * 70)
try:
    resp = requests.post(f"{API_BASE}/bookings", json=booking_data, headers=headers, timeout=10)
    if resp.status_code == 409:
        data = resp.json()
        if 'detail' in data and isinstance(data['detail'], dict):
            conflict_seats = data['detail'].get('conflict_seats', [])
            # Should have both X1 and X2 as conflicts
            if set(conflict_seats) == {"X1", "X2"}:
                log_result("3", "Full conflict (X1, X2)", True, 
                          f"✓ Got 409 with conflict_seats={conflict_seats}")
            else:
                log_result("3", "Full conflict (X1, X2)", False, 
                          f"Expected conflict_seats=['X1', 'X2'], got {conflict_seats}")
        else:
            log_result("3", "Full conflict (X1, X2)", False, 
                      f"Missing or invalid 'detail' in 409 response: {data}")
    else:
        log_result("3", "Full conflict (X1, X2)", False, 
                  f"Expected 409, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("3", "Full conflict (X1, X2)", False, f"Exception: {str(e)}")

# Test 4: Partial conflict (X1 already booked, X3 is free)
print("\n" + "-" * 70)
print("TEST 4: POST /api/bookings (partial conflict - X1 booked, X3 free)")
print("-" * 70)
partial_booking = booking_data.copy()
partial_booking['seats'] = ["X1", "X3"]
partial_booking['subtotal'] = 600
partial_booking['total'] = 650

try:
    resp = requests.post(f"{API_BASE}/bookings", json=partial_booking, headers=headers, timeout=10)
    if resp.status_code == 409:
        data = resp.json()
        if 'detail' in data and isinstance(data['detail'], dict):
            conflict_seats = data['detail'].get('conflict_seats', [])
            # Should only have X1 as conflict (X3 is free)
            if conflict_seats == ["X1"]:
                log_result("4", "Partial conflict (X1 only)", True, 
                          f"✓ Got 409 with conflict_seats=['X1'] (X3 correctly not in conflict)")
            else:
                log_result("4", "Partial conflict (X1 only)", False, 
                          f"Expected conflict_seats=['X1'], got {conflict_seats}")
        else:
            log_result("4", "Partial conflict (X1 only)", False, 
                      f"Missing or invalid 'detail' in 409 response: {data}")
    else:
        log_result("4", "Partial conflict (X1 only)", False, 
                  f"Expected 409, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("4", "Partial conflict (X1 only)", False, f"Exception: {str(e)}")

# Test 5: Empty seats list
print("\n" + "-" * 70)
print("TEST 5: POST /api/bookings (empty seats)")
print("-" * 70)
empty_booking = booking_data.copy()
empty_booking['seats'] = []
empty_booking['subtotal'] = 0
empty_booking['fee'] = 0
empty_booking['total'] = 0

try:
    resp = requests.post(f"{API_BASE}/bookings", json=empty_booking, headers=headers, timeout=10)
    if resp.status_code == 400:
        log_result("5", "Empty seats validation", True, 
                  f"✓ Got 400 for empty seats: {resp.json()}")
    else:
        log_result("5", "Empty seats validation", False, 
                  f"Expected 400, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("5", "Empty seats validation", False, f"Exception: {str(e)}")

# Test 6: Check booked seats
print("\n" + "-" * 70)
print("TEST 6: GET /api/shows/booked-seats")
print("-" * 70)
try:
    params = {
        "movie_id": "999",
        "cinema_id": "c1",
        "date": "2025-12-01",
        "time": "10:15 AM"
    }
    resp = requests.get(f"{API_BASE}/shows/booked-seats", params=params, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        if 'booked_seats' in data:
            booked = data['booked_seats']
            # Should include X1 and X2
            if "X1" in booked and "X2" in booked:
                log_result("6", "Get booked seats (X1, X2 present)", True, 
                          f"✓ booked_seats includes X1 and X2: {booked}")
            else:
                log_result("6", "Get booked seats (X1, X2 present)", False, 
                          f"Expected X1 and X2 in booked_seats, got: {booked}")
        else:
            log_result("6", "Get booked seats (X1, X2 present)", False, 
                      f"Missing 'booked_seats' in response: {data}")
    else:
        log_result("6", "Get booked seats (X1, X2 present)", False, 
                  f"Expected 200, got {resp.status_code}: {resp.text}")
except Exception as e:
    log_result("6", "Get booked seats (X1, X2 present)", False, f"Exception: {str(e)}")

# Summary
print("\n" + "=" * 70)
print("REGRESSION TEST SUMMARY")
print("=" * 70)
total = passed + failed
print(f"Total tests: {total}")
print(f"✅ Passed: {passed}")
print(f"❌ Failed: {failed}")

if errors:
    print("\n" + "=" * 70)
    print("FAILED TESTS")
    print("=" * 70)
    for error in errors:
        print(f"❌ {error}")

print("\n" + "=" * 70)
if failed == 0:
    print("🎉 ALL REGRESSION TESTS PASSED!")
    print("✓ Refactored create_booking endpoint working correctly")
    print("✓ All 4 helper functions (_build_show_key, _check_seat_conflict,")
    print("  _reserve_seats, _build_booking_doc) functioning as expected")
else:
    print(f"⚠️  {failed} REGRESSION TEST(S) FAILED")
    print("⚠️  Refactoring may have introduced issues")
print("=" * 70)

sys.exit(0 if failed == 0 else 1)
