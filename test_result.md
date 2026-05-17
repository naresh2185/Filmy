#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Build a clone of BookMyShow (renamed to Filmy) — a movie/event ticket booking platform. Frontend (React) is complete with TMDB integration. Now adding FastAPI+MongoDB backend for auth, bookings, and catalog data."

backend:
  - task: "Auth — send OTP + verify OTP (mock) + JWT issuance"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/auth/send-otp accepts {phone} (must be 10+ digits). POST /api/auth/verify-otp accepts any 6-digit numeric OTP, creates/finds user, returns JWT + UserOut. GET /api/auth/me returns current user from Bearer token."
      - working: true
        agent: "testing"
        comment: "✅ ALL AUTH TESTS PASSED (8/8). Tested: send-otp with valid/invalid phone (10+ digit validation working), verify-otp with valid 6-digit/invalid non-numeric/5-digit OTP (all validations working), GET /auth/me with valid/no/invalid Bearer token (JWT validation working correctly, returns 401 on missing/invalid token). User creation working, JWT token generation and validation working perfectly."

  - task: "Catalog endpoints — events, plays, sports, cinemas (seeded)"
    implemented: true
    working: true
    file: "backend/server.py, backend/seed_data.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "On startup, seeds 6 events, 4 plays, 4 sports, 5 cinemas idempotently. Endpoints: GET /api/events, /api/plays, /api/sports, /api/cinemas?city=Mumbai."
      - working: true
        agent: "testing"
        comment: "✅ ALL CATALOG TESTS PASSED (5/5). Tested: GET /events (6 events with all required fields: id, title, category, venue, price, image), GET /plays (4 plays), GET /sports (4 sports events), GET /cinemas (5 cinemas), GET /cinemas?city=Mumbai (correctly filtered 5 Mumbai cinemas). Seed data loaded correctly, all endpoints returning proper data structure."

  - task: "Show booked seats lookup + Booking creation with atomic seat lock"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/shows/booked-seats?movie_id=&cinema_id=&date=&time= returns booked_seats list. POST /api/bookings (auth required) checks conflict, uses $addToSet to atomically reserve seats, creates booking with booking_ref FLM+timestamp. On conflict returns 409 with conflict_seats list. GET /api/bookings/me returns user's bookings."
      - working: true
        agent: "testing"
        comment: "✅ ALL BOOKING TESTS PASSED (7/7). Tested: GET /shows/booked-seats returns empty list initially, POST /bookings with valid data creates booking with booking_ref starting with 'FLM' and UUID format ID, POST /bookings without auth returns 401, POST /bookings with empty seats returns 400, POST /bookings to same show/seats returns 409 with conflict_seats list, GET /shows/booked-seats after booking correctly shows booked seats, GET /bookings/me returns user's bookings. Atomic seat locking with $addToSet working perfectly, conflict detection working correctly."

  - task: "Auth middleware — Bearer JWT validation"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "get_current_user dependency parses Authorization header, decodes JWT (HS256), looks up user. Returns 401 on missing/expired/invalid token or missing user."
      - working: true
        agent: "testing"
        comment: "✅ AUTH MIDDLEWARE TESTS PASSED. Tested via protected endpoints: POST /bookings without auth returns 401, GET /bookings/me requires valid token, GET /auth/me with no/invalid token returns 401. Bearer token validation working correctly, proper 401 responses on missing/invalid tokens."

frontend:
  - task: "Frontend integration with backend APIs"
    implemented: true
    working: "NA"
    file: "frontend/src/lib/api.js, AuthModal.jsx, SeatSelection.jsx, Checkout.jsx, Home.jsx, ListingPage.jsx, AppContext.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "AuthModal calls /auth/send-otp + /auth/verify-otp and persists JWT; SeatSelection fetches booked seats from backend; Checkout calls POST /bookings; Home + ListingPage fetch events/plays/sports from backend."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Backend implemented for Filmy. Mocked OTP (any 6 digits accepted), JWT auth, atomic seat locking via $addToSet with conflict detection. Seed data auto-loads on startup. Please test all backend endpoints — happy paths and edge cases (invalid OTP, missing token, seat conflict, auth-required endpoints)."
  - agent: "testing"
    message: "🎉 ALL BACKEND TESTS PASSED (20/20)! Comprehensive testing completed covering: Auth flow (send-otp, verify-otp, /auth/me with various token scenarios), Catalog endpoints (events, plays, sports, cinemas with city filter), Bookings flow (booked-seats lookup, booking creation with auth, conflict detection, empty seats validation). All validations working correctly: phone validation (10+ digits), OTP validation (6-digit numeric), JWT auth (proper 401 on missing/invalid tokens), atomic seat locking with $addToSet, conflict detection returning 409 with conflict_seats, booking_ref starting with 'FLM', UUID format booking IDs. Backend is production-ready. NOTE: OTP is MOCKED - any 6-digit numeric OTP is accepted for testing purposes."
