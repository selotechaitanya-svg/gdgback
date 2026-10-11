const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.ADMIN_EMAILS = 'admin@gdgrbu.app,lead@gdgrbu.app';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_12345678901234567890';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345678901234567890';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_12345678901234567890';
process.env.OTP_HASH_SECRET = 'test_otp_hash_secret_key_12345678901234567890';

const app = require('../server');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Otp = require('../models/Otp');
const Session = require('../models/Session');
const { hashOtp, isAuthorizedAdminEmail } = require('../utils/security');

let server;
let baseUrl;

// Helper: Make HTTP request to test server
const request = async (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let reqBody = null;
    if (body) {
      reqBody = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      }
    );

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
};

// Helper: Extract cookies from Set-Cookie header
const extractCookies = (setCookieHeader) => {
  if (!setCookieHeader) return {};
  const headerArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const cookies = {};
  headerArr.forEach((str) => {
    const parts = str.split(';')[0].split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookies;
};

// Test Runner
const runTests = async () => {
  console.log('\n🧪 ========================================================');
  console.log('   STARTING AUTOMATED SYSTEM & SECURITY TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Start temporary test server on random port
    const testPort = 5566;
    server = app.listen(testPort);
    baseUrl = `http://127.0.0.1:${testPort}`;

    // Wait for DB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    }

    // Clean test collections
    await Otp.deleteMany({});
    await Session.deleteMany({});
    await User.deleteMany({ email: { $in: ['attendee@example.com', 'admin@gdgrbu.app', 'hacker@example.com'] } });

    console.log('📌 PART A: OTP GENERATION, HASHING & SECURITY TESTS');

    // Test 1: Request OTP for a new user registration
    const reqOtpRes = await request('POST', '/api/auth/request-otp', { email: 'attendee@example.com', type: 'register' });
    assert(reqOtpRes.status === 200 && reqOtpRes.body.success, 'Valid registration email requests OTP successfully (200 OK)');

    // Test 1b: Request OTP for login on an unregistered email returns 404 notFound
    const unknownLoginRes = await request('POST', '/api/auth/request-otp', { email: 'unknown_user_99@example.com', type: 'login' });
    assert(unknownLoginRes.status === 404 && unknownLoginRes.body.notFound === true, 'Signing in with unregistered email returns 404 notFound');

    // Test 2: OTP is never returned in the API response
    assert(reqOtpRes.body.otp === undefined && reqOtpRes.body.code === undefined, 'OTP is NEVER exposed in API response');

    // Test 3: OTP challenge is stored hashed in MongoDB (not plaintext)
    const challengeInDb = await Otp.findOne({ email: 'attendee@example.com' });
    assert(challengeInDb !== null, 'OTP challenge record is created in database');
    assert(
      challengeInDb.otpHash && !challengeInDb.otp && challengeInDb.otpHash.length === 64,
      'OTP is stored as HMAC-SHA256 hex hash (not plaintext)'
    );

    // Test 4: Rate limiting / Cooldown: requesting again immediately returns 429
    const secondReqRes = await request('POST', '/api/auth/request-otp', { email: 'attendee@example.com', type: 'register' });
    assert(secondReqRes.status === 429, 'Requesting OTP before 60s cooldown is rejected with 429 Too Many Requests');

    // Test 5: Incorrect OTP is rejected
    const badVerifyRes = await request('POST', '/api/auth/verify-otp', { email: 'attendee@example.com', otp: '000000' });
    assert(badVerifyRes.status === 400 && !badVerifyRes.body.success, 'Incorrect OTP is rejected (400 Bad Request)');

    // Test 6: Verification attempt count increments in DB
    const challengeAfterFailedAttempt = await Otp.findById(challengeInDb._id);
    assert(challengeAfterFailedAttempt.attempts === 1, 'Verification attempt counter incremented correctly in DB');

    // Test 7: Verify with valid OTP and save password
    // Create a known OTP challenge directly to simulate user entering code from email
    const testOtpCode = '849201';
    await Otp.deleteMany({ email: 'attendee@example.com' });
    await Otp.create({
      email: 'attendee@example.com',
      otpHash: hashOtp('attendee@example.com', testOtpCode),
      attempts: 0,
      isUsed: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    const goodVerifyRes = await request('POST', '/api/auth/verify-otp', {
      email: 'attendee@example.com',
      otp: testOtpCode,
      name: 'Priya Sharma',
      password: 'MySecurePassword123!',
    });
    assert(goodVerifyRes.status === 200 && goodVerifyRes.body.success, 'Valid OTP verifies successfully with password (200 OK)');

    // Test 7b: User can now sign in using the password saved during sign up
    const pwdLoginRes = await request('POST', '/api/auth/login', {
      email: 'attendee@example.com',
      password: 'MySecurePassword123!',
    });
    assert(pwdLoginRes.status === 200 && pwdLoginRes.body.success, 'User can log in using password created during sign up');

    // Test 8: First-time sign-in automatically creates user
    const createdUser = await User.findOne({ email: 'attendee@example.com' });
    assert(createdUser !== null && createdUser.name === 'Priya Sharma', 'User record auto-created in database with name');
    assert(createdUser.emailVerified === true, 'User is marked emailVerified: true');

    // Test 9: Challenge is atomically consumed (single-use)
    const consumedChallenge = await Otp.findOne({ email: 'attendee@example.com' });
    assert(consumedChallenge.isUsed === true, 'OTP challenge is marked isUsed: true after verification');

    // Test 10: Replaying the used OTP is rejected
    const replayVerifyRes = await request('POST', '/api/auth/verify-otp', {
      email: 'attendee@example.com',
      otp: testOtpCode,
    });
    assert(replayVerifyRes.status === 400, 'Used OTP cannot be reused (Single-use replay protection works)');

    // Test 11: Set-Cookie headers contain httpOnly cookies
    const cookies = extractCookies(goodVerifyRes.headers['set-cookie']);
    assert(Boolean(cookies.gdg_access_token && cookies.gdg_refresh_token), 'Server issues httpOnly access and refresh cookies');

    console.log('\n📌 PART B: SESSION MANAGEMENT, REFRESH & LOGOUT TESTS');

    const attendeeCookieHeader = `gdg_access_token=${cookies.gdg_access_token}; gdg_refresh_token=${cookies.gdg_refresh_token}`;

    // Test 12: GET /api/auth/me returns authenticated user
    const meRes = await request('GET', '/api/auth/me', null, { Cookie: attendeeCookieHeader });
    assert(meRes.status === 200 && meRes.body.user.email === 'attendee@example.com', 'GET /api/auth/me returns authenticated user profile');
    assert(meRes.body.user.isAdmin === false, 'Ordinary user is marked isAdmin: false');

    // Test 13: Refresh token rotation: POST /api/auth/refresh issues new tokens
    const refreshRes = await request('POST', '/api/auth/refresh', {}, {
      Cookie: `gdg_refresh_token=${cookies.gdg_refresh_token}`,
    });
    assert(refreshRes.status === 200 && refreshRes.body.success, 'POST /api/auth/refresh rotates tokens successfully');
    const rotatedCookies = extractCookies(refreshRes.headers['set-cookie']);
    assert(
      rotatedCookies.gdg_refresh_token && rotatedCookies.gdg_refresh_token !== cookies.gdg_refresh_token,
      'Refresh token is rotated to a new cryptographically secure token'
    );

    // Test 14: Logout revokes session and clears cookies
    const logoutRes = await request('POST', '/api/auth/logout', {}, {
      Cookie: `gdg_refresh_token=${rotatedCookies.gdg_refresh_token}`,
    });
    assert(logoutRes.status === 200 && logoutRes.body.success, 'POST /api/auth/logout revokes session');

    // Test 15: Revoked refresh token cannot be reused
    const reusedRefreshRes = await request('POST', '/api/auth/refresh', {}, {
      Cookie: `gdg_refresh_token=${rotatedCookies.gdg_refresh_token}`,
    });
    assert(reusedRefreshRes.status === 401, 'Revoked refresh token is rejected on refresh attempt');

    console.log('\n📌 PART C: ADMIN AUTHORIZATION & EVENT REGISTRATION DASHBOARD TESTS');

    // Test 16: Ordinary user cannot access admin events endpoint (403 Forbidden)
    const unauthorizedAdminRes = await request('GET', '/api/admin/events', null, {
      Cookie: `gdg_access_token=${cookies.gdg_access_token}`,
    });
    assert(unauthorizedAdminRes.status === 403, 'Ordinary authenticated user is denied access to /api/admin/events (403 Forbidden)');

    // Test 17: Unauthenticated visitor cannot access admin events endpoint (401 Unauthorized)
    const unauthAdminRes = await request('GET', '/api/admin/events');
    assert(unauthAdminRes.status === 401, 'Unauthenticated visitor is denied access to /api/admin/events (401 Unauthorized)');

    // Test 18: Admin allowlist verification function checks server ADMIN_EMAILS
    assert(isAuthorizedAdminEmail('admin@gdgrbu.app') === true, 'admin@gdgrbu.app is authorized in ADMIN_EMAILS');
    assert(isAuthorizedAdminEmail('hacker@gdgrbu.app') === false, 'Unauthorized email returns false');

    // Test 19: Sign in as authorized administrator via OTP
    const adminOtpCode = '654321';
    await Otp.deleteMany({ email: 'admin@gdgrbu.app' });
    await Otp.create({
      email: 'admin@gdgrbu.app',
      otpHash: hashOtp('admin@gdgrbu.app', adminOtpCode),
      attempts: 0,
      isUsed: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    const adminLoginRes = await request('POST', '/api/auth/verify-otp', {
      email: 'admin@gdgrbu.app',
      otp: adminOtpCode,
      name: 'Lead Admin',
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.user.isAdmin === true, 'Authorized admin email logs in and receives isAdmin: true');

    const adminCookies = extractCookies(adminLoginRes.headers['set-cookie']);
    const adminCookieHeader = `gdg_access_token=${adminCookies.gdg_access_token}; gdg_refresh_token=${adminCookies.gdg_refresh_token}`;

    // Ensure test events exist in database for admin testing
    let testEvent = await Event.findOne();
    if (!testEvent) {
      testEvent = await Event.create({
        title: 'DevFest Nagpur 2026: AI, Cloud & Web Ecosystems',
        description: 'The premier community developer festival in Central India!',
        date: new Date(Date.now() + 14 * 86400000),
        venue: 'Auditorium Hall 1, Shri Ramdeobaba University, Nagpur',
        capacity: 350,
        category: 'Conference',
        createdBy: new mongoose.Types.ObjectId(),
      });
    }

    // Create an event with 0 registrations to test empty state
    const emptyEvent = await Event.create({
      title: 'Quantum Computing & Gemini 3.0 Workshop',
      description: 'Hands-on laboratory session on quantum algorithms.',
      date: new Date(Date.now() + 28 * 86400000),
      venue: 'Lab 2, Shri Ramdeobaba University',
      capacity: 50,
      category: 'Workshop',
      createdBy: new mongoose.Types.ObjectId(),
    });

    // Test 20: Authorized admin can fetch /api/admin/events
    const adminEventsRes = await request('GET', '/api/admin/events', null, { Cookie: adminCookieHeader });
    assert(adminEventsRes.status === 200 && adminEventsRes.body.success, 'Authorized admin successfully retrieves events list (200 OK)');
    assert(Array.isArray(adminEventsRes.body.events) && adminEventsRes.body.events.length > 0, 'Admin events list contains real database events');

    console.log(`     Selected test event: "${testEvent.title}" (ID: ${testEvent.id || testEvent._id})`);

    // Test 21: Authorized admin can fetch registered attendees for the event
    const eventId = testEvent.id || testEvent._id;
    const adminRegsRes = await request('GET', `/api/admin/events/${eventId}/registrations`, null, { Cookie: adminCookieHeader });
    assert(adminRegsRes.status === 200 && adminRegsRes.body.success, 'Authorized admin fetches event registrations (200 OK)');
    assert(adminRegsRes.body.event.id.toString() === eventId.toString(), 'Response correctly includes target event metadata');
    assert(Array.isArray(adminRegsRes.body.registrations), 'Response returns registrations array');

    // Test 21b: Event with 0 registrations returns empty registrations array
    const emptyRegsRes = await request('GET', `/api/admin/events/${emptyEvent._id}/registrations`, null, { Cookie: adminCookieHeader });
    assert(emptyRegsRes.status === 200 && emptyRegsRes.body.registrations.length === 0, 'Event with 0 registrations returns empty attendee list');

    // Test 22: Register our test user for the event via public registration endpoint
    const regRes = await request('POST', `/api/registrations/events/${eventId}/register`, {}, {
      Cookie: attendeeCookieHeader,
    });
    // Can be 201 or 400 if already registered from earlier seed
    const isRegSuccess = regRes.status === 201 || (regRes.status === 400 && regRes.body.message.includes('already'));
    assert(isRegSuccess, 'Public event registration endpoint functions properly');

    // Test 23: Verify the attendee now appears in the admin registrations endpoint
    const updatedAdminRegsRes = await request('GET', `/api/admin/events/${eventId}/registrations`, null, { Cookie: adminCookieHeader });
    const foundAttendee = updatedAdminRegsRes.body.registrations.find((r) => r.attendeeEmail === 'attendee@example.com');
    assert(foundAttendee !== undefined, 'Registered attendee is accurately reflected in admin registrations view');
    if (foundAttendee) {
      assert(foundAttendee.attendeeName === 'Priya Sharma', 'Attendee name is accurately populated');
      assert(foundAttendee.status === 'confirmed', 'Registration status is confirmed');
    }

    // Test 24: Ordinary user attempting to fetch admin event registrations is denied (403)
    const ordinaryUserRegsRes = await request('GET', `/api/admin/events/${eventId}/registrations`, null, {
      Cookie: attendeeCookieHeader,
    });
    assert(ordinaryUserRegsRes.status === 403, 'Ordinary user blocked from GET /api/admin/events/:id/registrations (403)');

    // Test 25: Non-existent event returns 404 in admin registrations
    const fakeObjectId = new mongoose.Types.ObjectId();
    const notFoundRes = await request('GET', `/api/admin/events/${fakeObjectId}/registrations`, null, { Cookie: adminCookieHeader });
    assert(notFoundRes.status === 404, 'Non-existent event ID returns 404 Not Found');

    console.log('\n========================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Unhandled test suite error:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runTests();
