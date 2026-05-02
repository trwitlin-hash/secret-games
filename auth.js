// auth.js — key validation using SHA-256 hashing
// Keys are never stored in plain text — only their hashes are compared.
// Uses sessionStorage so the key is required again each new browser session.
//
// Any valid key works on any domain.
// tier "free"  → sees free games only
// tier "pro"   → sees all games

const AUTH_KEY  = "sgUnlockedSession";
const AUTH_TIER = "sgUnlockedTier";

async function hashKey(raw) {
  const encoded = new TextEncoder().encode(raw.trim().toUpperCase());
  const buffer  = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function isUnlocked() {
  const saved = sessionStorage.getItem(AUTH_KEY);
  if (!saved) return false;
  if (!(saved in KEYS)) return false;
  const { expiry } = KEYS[saved];
  if (expiry !== null && Date.now() > expiry) {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIER);
    return false;
  }
  return true;
}

function getTier() {
  return sessionStorage.getItem(AUTH_TIER) || "free";
}

async function tryUnlock(inputKey) {
  const hash = await hashKey(inputKey);
  if (!(hash in KEYS)) return false;
  const { tier, expiry } = KEYS[hash];
  if (expiry !== null && Date.now() > expiry) return false;
  sessionStorage.setItem(AUTH_KEY, hash);
  sessionStorage.setItem(AUTH_TIER, tier);
  return true;
}

const MASTER_HASH = "5e8ce5c5d088bc25b8308dba4c873ef24003cb42ffab8adcf7035eeee0bff5d4"; // OGSTUMPS
const DEV_HASH    = "3c24a22bee85ee04968579c51f996bfe2e53b218a2bc1028e76492b417da4a83"; // KEY_748291047362

function isMaster() {
  return sessionStorage.getItem(AUTH_KEY) === MASTER_HASH;
}

// Dev/tester key — can see requests panel + reports panel
function isDev() {
  return sessionStorage.getItem(AUTH_KEY) === DEV_HASH;
}

function lock() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_TIER);
}
