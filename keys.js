// keys.js — Hashed key definitions (SHA-256)
// The actual key values are never stored here — only their hashes.
//
// Format: hash -> { tier: "free"|"pro", expiry: null|timestamp, sold?: true }
// tier "free"  = access to free games only
// tier "pro"   = access to all games
// sold: true   = key was sold — concurrent session detection is enforced
//                (if two devices use it at once, both are kicked and key is revoked)
//                Omit this field for friends/master keys to bypass detection.
//
// To revoke a key: delete its entry.
// Expiry null = permanent. Timestamp = Unix ms.

const KEYS = {
  // ── Permanent Pro (never expires) ─────────────────────────────────────
  // OGSTUMPS
  "5e8ce5c5d088bc25b8308dba4c873ef24003cb42ffab8adcf7035eeee0bff5d4":
    { tier: "pro", expiry: null },

  // ── Joke / troll keys → handled in index.html, NOT valid here ──────────
  // LEKIRKE  → "nuh uh cuh" + redirect to Google "i'm not doing my work"
  // ARCADE2026 → same

  // ── 30-day Pro keys (expire 2026-05-15) ───────────────────────────────
  "dba1f3996b2d1857f2ecdcf18a7441249e02f41a0aa52b07576e6af4292d69b0":
    { tier: "pro", expiry: 1778803200000, sold: true },
  "78e9130f5f27225cada4cc81e7cd3a6050e2f7851f1331a9caee88037f19d6db":
    { tier: "pro", expiry: 1778803200000, sold: true },
  "262f1b5118a9957027514e2949fd575ebdedc1b1e35e08dfde5609a8bb85d16a":
    { tier: "pro", expiry: 1778803200000, sold: true },
  "6407f2198afe6a6bfc885f16141030b55ff498d361d44a3f0ebb1a89080de80a":
    { tier: "pro", expiry: 1778803200000, sold: true },

  // ── TEST sold key: PROTEST99 (permanent, for testing session detection) ─
  "915c456bad4db80dac20d4f28d01a765d99ce9c3cb5590a7f15433ceff18c0d5":
    { tier: "pro", expiry: null, sold: true },

  // ── Easy free password: HOMEWORK (permanent) ───────────────────────
  "f550eb06d55581c0d1704f106d29873b7030a06a0a9265fbf5664d8bae6135d9":
    { tier: "free", expiry: null },

  // ── 30-day Free keys (expire 2026-05-15) ────────────────────────────────────────────
  "c343bc7be721ce2c313c566459385628547acee97fc46ea521cb98cff3caa411":
    { tier: "free", expiry: 1778803200000 },
  "1301f65c2eb1ea2dc4253ae0aa3773a90ba9c52be97e74e37b3bda5ea4f6c770":
    { tier: "free", expiry: 1778803200000 },
  "bd66a4478558dee6c7f7bd76de67ead4ae14a884bd5938025b4cbff1c714dcf4":
    { tier: "free", expiry: 1778803200000 },
  "df9f0062c02d2e4dfa8ed0b05d7b22bcfae8e54ced004bf559b4a60ff75958db":
    { tier: "free", expiry: 1778803200000 },
};
