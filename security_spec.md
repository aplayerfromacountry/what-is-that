# Security Specification & Threat Model for Firestore Security Rules

## Phase 0: Data Invariants & Authorization Boundaries

1. **User Profile Invariant**:
   - A user profile document at `/users/{userId}` can only be created or written by an authenticated user whose `request.auth.uid == userId`.
   - The user cannot elevate their own role to 'admin' or tamper with `isAdmin`.
   - Immutable fields: `createdAt` cannot be modified after creation.

2. **Reading/History Invariant**:
   - A reading document at `/users/{userId}/readings/{readingId}` strictly belongs to the authenticated user (`request.auth.uid == userId`).
   - The reading type must be one of: `"tu-vi"`, `"natal-chart"`, `"tarot"`, `"kinh-dich"`.
   - Title, question, and resultMarkdown must be bounded in length to prevent DoS/storage exhaustion.

3. **Plant Garden Invariant**:
   - The plant garden document at `/users/{userId}/plantGarden/{gardenId}` strictly belongs to the owner (`request.auth.uid == userId`).
   - EXP and Level must be non-negative integers. Level cannot exceed max level 5.
   - Selected tree ID must be one of the recognized 4 sacred tree IDs.

4. **Drive Backup Invariant**:
   - Documents at `/users/{userId}/driveBackups/{backupId}` record Drive metadata for the owner only.
   - `driveFileId` must be a valid alphanumeric string.

---

## The "Dirty Dozen" Payloads (Must be rejected with PERMISSION_DENIED)

1. **Unauthenticated Read of User Profile**: Anonymous or unauthenticated request to `/users/user123`. (Rejected by `isSignedIn()` check).
2. **Cross-User Profile Hijack**: User A (`auth.uid == "userA"`) attempting to write to `/users/userB`. (Rejected by `request.auth.uid == userId`).
3. **Privilege Escalation via Role**: Normal user attempting to set `isAdmin: true` or `role: "admin"` during profile create/update. (Rejected by `isNotSelfPromotingAdmin()`).
4. **Immutable Field Tampering**: User attempting to alter `createdAt` on an existing profile. (Rejected by `incoming().createdAt == existing().createdAt`).
5. **ID Poisoning / Oversized ID**: Attempting to create a reading with a 2048-byte key containing path traversal chars. (Rejected by `isValidId(docId)` regex & length limit).
6. **Malicious Reading Payload with Excessive Size**: Injecting a 20MB `resultMarkdown` into a reading. (Rejected by `incoming().resultMarkdown.size() <= 200000`).
7. **Invalid Reading Type**: Attempting to insert a reading with `type: "crypto-scam"`. (Rejected by enum validation `['tu-vi', 'natal-chart', 'tarot', 'kinh-dich']`).
8. **Cross-User Reading Query**: User A querying readings belonging to User B (`/users/userB/readings`). (Rejected by `resource.data.userId == request.auth.uid`).
9. **Blanket Query Scraping**: Attempting to list all users without auth or UID match. (Rejected by collection-level query restriction).
10. **Plant Garden Negative EXP**: Attempting to update `currentExp: -9999` or `level: 99`. (Rejected by integer boundary check).
11. **Drive Backup Spoofing**: User attempting to log a drive backup under another user's account. (Rejected by `userId == request.auth.uid`).
12. **Shadow Field Injection**: Attempting to add unexpected executable or administrative attributes like `__proto__` or `evalPayload`. (Rejected by strict key checks).
