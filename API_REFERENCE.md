# API Reference

Complete API documentation for the Netflix-style Course Platform.

---

## Authentication

### POST `/api/auth`

Authenticate user with password and set session cookie.

**Request Body:**
```json
{
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Sets Cookie:**
- Name: `site_auth`
- Value: `authenticated`
- HttpOnly: `true`
- Secure: `true` (production only)
- SameSite: `lax`
- Max-Age: `604800` (7 days)
- Path: `/`

**Error Response (401):**
```json
{
  "error": "Invalid password"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ password: 'mypassword' }),
});

const data = await response.json();
if (response.ok) {
  // Cookie is set, redirect to home
  window.location.href = '/';
}
```

---

## Folder Structure

### GET `/api/structure`

Fetch the complete Google Drive folder structure with all videos and folders.

**Authentication:** Required (`site_auth` cookie)

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "id": "1a2b3c4d5e6f7g8h9i0j",
    "name": "Course Module 1",
    "type": "folder",
    "mimeType": "application/vnd.google-apps.folder",
    "children": [
      {
        "id": "file123",
        "name": "Introduction.mp4",
        "type": "file",
        "mimeType": "video/mp4",
        "size": "52428800",
        "thumbnailLink": "https://..."
      },
      {
        "id": "file456",
        "name": "Lesson 1.mp4",
        "type": "file",
        "mimeType": "video/mp4",
        "size": "104857600"
      }
    ]
  },
  {
    "id": "file789",
    "name": "Standalone Video.mp4",
    "type": "file",
    "mimeType": "video/mp4",
    "size": "78643200"
  }
]
```

**DriveItem Type:**
```typescript
interface DriveItem {
  id: string;                    // Google Drive file/folder ID
  name: string;                  // Display name
  type: 'folder' | 'file';       // Item type
  mimeType: string;              // MIME type from Drive
  size?: string;                 // File size in bytes (files only)
  thumbnailLink?: string;        // Thumbnail URL (if available)
  children?: DriveItem[];        // Nested items (folders only)
}
```

**Error Response (500):**
```json
{
  "error": "Root folder ID not configured"
}
```

```json
{
  "error": "Failed to fetch folder structure"
}
```

**Caching:**
- Results are cached for 1 hour (3600 seconds)
- Cache key: `drive-structure`
- Revalidation: Automatic after cache expires

**Example Usage:**
```javascript
const response = await fetch('/api/structure');
const structure = await response.json();

// Find all videos
const allVideos = flattenFiles(structure);
console.log(`Found ${allVideos.length} videos`);
```

---

## Video Streaming

### GET `/api/stream`

Stream video file from Google Drive with support for Range requests (HTTP 206).

**Authentication:** Required (`site_auth` cookie)

**Query Parameters:**
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `fileId`  | string | Yes      | Google Drive file ID to stream |

**Request Headers:**
| Header  | Type   | Required | Description                           |
|---------|--------|----------|---------------------------------------|
| `Range` | string | No       | Byte range (e.g., `bytes=0-1023`)     |

**Success Response (200 - Full Content):**
```
Status: 200 OK
Content-Type: video/mp4
Content-Length: 52428800
Accept-Ranges: bytes

[Binary video data]
```

**Success Response (206 - Partial Content):**
```
Status: 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 0-1023/52428800
Content-Length: 1024
Accept-Ranges: bytes
Cache-Control: public, max-age=3600

[Binary video chunk]
```

**Headers Explained:**
- `Content-Type`: Video MIME type from Google Drive
- `Content-Length`: Size of the chunk being sent
- `Content-Range`: Byte range in format `bytes start-end/total`
- `Accept-Ranges`: Indicates server supports range requests
- `Cache-Control`: Browser caching policy

**Error Response (400):**
```json
{
  "error": "Missing fileId parameter"
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (403):**
```json
{
  "error": "Access denied to file"
}
```

**Error Response (404):**
```json
{
  "error": "File not found"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error",
  "details": "Error message details"
}
```

**Example Usage (HTML Video Tag):**
```html
<video src="/api/stream?fileId=abc123" controls></video>
```

**Example Usage (Range Request):**
```javascript
const response = await fetch('/api/stream?fileId=abc123', {
  headers: {
    'Range': 'bytes=0-1023',
  },
});

// Response will be 206 Partial Content
console.log(response.status); // 206
console.log(response.headers.get('Content-Range')); // bytes 0-1023/52428800
```

**How Range Requests Work:**

1. **Initial Request (No Range):**
   - Browser requests full video
   - Server responds with 200 OK and full file
   - Or browser can request small chunk first

2. **Seek Operation:**
   - User seeks to 50% in video
   - Browser calculates byte position (e.g., byte 26214400)
   - Browser requests: `Range: bytes=26214400-`
   - Server responds with 206 and remaining data

3. **Adaptive Streaming:**
   - Browser requests small chunks as needed
   - Reduces bandwidth usage
   - Enables instant seeking

**Security:**
- Validates `site_auth` cookie before streaming
- Prevents direct link sharing without authentication
- Service account permissions limit access scope

---

## Middleware

The application uses Next.js Middleware for global authentication.

**Protected Routes:**
- All routes except:
  - `/login`
  - `/api/auth`
  - Static files (`_next/static`, images, favicon)

**Flow:**

1. Request comes in
2. Middleware checks for `site_auth` cookie
3. If missing → Redirect to `/login?from=/original/path`
4. If present and valid → Allow access
5. If invalid → Redirect to `/login`

**Implementation Location:** `middleware.ts` (root)

**Matcher Configuration:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Data Models

### DriveItem

Represents a file or folder from Google Drive.

```typescript
interface DriveItem {
  id: string;                // Unique identifier
  name: string;              // Display name
  type: 'folder' | 'file';   // Item type
  mimeType?: string;         // MIME type (e.g., "video/mp4")
  size?: string;             // File size in bytes (string)
  thumbnailLink?: string;    // Thumbnail URL
  children?: DriveItem[];    // Child items (folders only)
}
```

### VideoProgress

Stored in localStorage for tracking playback progress.

```typescript
// Key format: video_progress_${fileId}
// Value: string (seconds as decimal)

localStorage.setItem('video_progress_abc123', '245.5');
const progress = localStorage.getItem('video_progress_abc123'); // "245.5"
```

### VideoCompletion

Stored in localStorage for tracking watched status.

```typescript
// Key format: video_watched_${fileId}
// Value: "true" | null

localStorage.setItem('video_watched_abc123', 'true');
const watched = localStorage.getItem('video_watched_abc123') === 'true';
```

---

## Client-Side APIs

### Storage Utilities (`lib/utils.ts`)

**Get Video Progress:**
```typescript
import { storage } from '@/lib/utils';

const progress = storage.getProgress('file123');
// Returns: number (seconds)
```

**Set Video Progress:**
```typescript
storage.setProgress('file123', 123.45);
// Saves to localStorage
```

**Check if Completed:**
```typescript
const isCompleted = storage.isCompleted('file123');
// Returns: boolean
```

**Mark as Completed:**
```typescript
storage.setCompleted('file123', true);
// Saves to localStorage
```

**Clear Progress:**
```typescript
storage.clearProgress('file123');
// Removes both progress and completion data
```

### Navigation Utilities

**Get Next Video:**
```typescript
import { getNextVideo } from '@/lib/utils';

const nextVideo = getNextVideo('currentFileId', structure);
// Returns: DriveItem | null
```

**Get Previous Video:**
```typescript
import { getPreviousVideo } from '@/lib/utils';

const prevVideo = getPreviousVideo('currentFileId', structure);
// Returns: DriveItem | null
```

**Flatten Files:**
```typescript
import { flattenFiles } from '@/lib/utils';

const allFiles = flattenFiles(structure);
// Returns: DriveItem[] (only files, no folders)
```

---

## Environment Variables

### Required Variables

**`NEXT_PUBLIC_DRIVE_ROOT_ID`**
- Type: `string`
- Description: Google Drive folder ID containing course content
- Example: `"1a2b3c4d5e6f7g8h9i0j"`
- Public: Yes (accessible client-side)

**`GOOGLE_CLIENT_EMAIL`**
- Type: `string`
- Description: Service account email from JSON key
- Example: `"course-platform@project-123456.iam.gserviceaccount.com"`
- Public: No (server-side only)

**`GOOGLE_PRIVATE_KEY`**
- Type: `string`
- Description: Private key from service account JSON
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`
- Public: No (server-side only)
- Important: Keep `\n` characters as literal text

**`SITE_PASSWORD`**
- Type: `string`
- Description: Password for site authentication
- Example: `"MySecurePassword123!"`
- Public: No (server-side only)

---

## Rate Limits

### Google Drive API Quotas

**Default Limits:**
- 20,000 queries per 100 seconds per user
- 12,000 queries per 100 seconds per project

**Mitigation Strategies:**

1. **Caching** (Implemented)
   - Folder structure cached for 1 hour
   - Reduces API calls significantly

2. **Batch Requests** (Optional)
   - Can batch multiple file requests
   - Not currently implemented

3. **Service Account** (Implemented)
   - Uses service account quotas
   - Separate from user quotas

**Monitor Usage:**
- Google Cloud Console
- APIs & Services → Dashboard
- View API usage graphs

---

## Error Handling

### Client-Side Errors

**Authentication Errors:**
```typescript
try {
  const response = await fetch('/api/auth', { ... });
  if (!response.ok) {
    const error = await response.json();
    console.error('Auth failed:', error.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

**Structure Loading Errors:**
```typescript
try {
  const response = await fetch('/api/structure');
  if (!response.ok) {
    throw new Error('Failed to load structure');
  }
  const data = await response.json();
} catch (error) {
  // Show error UI to user
  setError(error.message);
}
```

### Server-Side Errors

**Google Drive API Errors:**
```typescript
try {
  const response = await drive.files.list({ ... });
} catch (error: any) {
  if (error.code === 404) {
    // File not found
  } else if (error.code === 403) {
    // Permission denied
  } else if (error.code === 429) {
    // Rate limit exceeded
  }
}
```

---

## Performance Optimization

### Caching Strategy

**1. Server-Side Cache (Next.js)**
```typescript
export const getFolderStructure = unstable_cache(
  async (rootFolderId: string) => { ... },
  ['drive-structure'],
  { revalidate: 3600 }
);
```

**2. Browser Cache (HTTP Headers)**
```typescript
'Cache-Control': 'public, max-age=3600'
```

**3. Client-Side Cache (localStorage)**
- Video progress stored locally
- No server round-trips needed

### Streaming Optimization

**Range Requests:**
- Browser only downloads needed chunks
- Instant seeking without buffering entire file
- Reduces bandwidth usage

**Chunk Size:**
- Browser determines optimal chunk size
- Typically 1-5 MB per request
- Adapts to connection speed

---

## Security Best Practices

### Authentication

- ✅ HTTP-only cookies prevent XSS access
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=lax prevents CSRF
- ✅ 7-day expiration

### API Security

- ✅ All streaming endpoints validate auth cookie
- ✅ Service account with minimal permissions
- ✅ No sensitive data in client code
- ✅ Private keys never exposed to client

### Content Protection

- ✅ Videos proxy through API (not direct Drive links)
- ✅ Auth required for all video access
- ✅ Direct link sharing prevented

---

## Testing

### Test Authentication
```bash
# Should redirect to login
curl -I http://localhost:3000/

# Login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'

# Should work with cookie
curl -b "site_auth=authenticated" http://localhost:3000/
```

### Test Structure API
```bash
curl -b "site_auth=authenticated" \
  http://localhost:3000/api/structure
```

### Test Streaming
```bash
# Full file
curl -b "site_auth=authenticated" \
  http://localhost:3000/api/stream?fileId=abc123 \
  -o video.mp4

# Range request
curl -b "site_auth=authenticated" \
  -H "Range: bytes=0-1023" \
  http://localhost:3000/api/stream?fileId=abc123
```

---

## Troubleshooting

### Common API Errors

**401 Unauthorized:**
- Cause: Missing or invalid auth cookie
- Solution: Log in again, clear cookies

**403 Access Denied:**
- Cause: Service account lacks permission
- Solution: Share Drive folder with service account

**404 Not Found:**
- Cause: File doesn't exist or was deleted
- Solution: Verify file ID, check Drive folder

**429 Rate Limited:**
- Cause: Too many API requests
- Solution: Increase cache duration, implement backoff

**500 Internal Error:**
- Cause: Various server errors
- Solution: Check logs, verify env variables

### Debug Tips

**Enable Verbose Logging:**
```typescript
// In lib/google.ts
console.log('Fetching folder structure from Google Drive...');
```

**Check Browser Console:**
```javascript
// Network tab → XHR/Fetch
// Console tab → Error messages
```

**Check Server Logs:**
```bash
npm run dev
# Watch console output for errors
```

---

## Migration Guide

### From v1 to v2 (Breaking Changes)

If you're updating from an older version:

1. **Update environment variables:**
   - Rename `DRIVE_ROOT_ID` → `NEXT_PUBLIC_DRIVE_ROOT_ID`
   
2. **Update imports:**
   - `@/lib/drive` → `@/lib/google`
   
3. **Update API calls:**
   - `/api/videos` → `/api/structure`

4. **Clear browser cache:**
   - Old localStorage keys may conflict

---

## License

MIT License - See LICENSE file for details.

## Support

For issues or questions:
1. Check this API reference
2. Review README_SETUP.md
3. Check browser console
4. Check server logs
5. Verify environment variables

---

**Last Updated:** 2024
**API Version:** 1.0.0