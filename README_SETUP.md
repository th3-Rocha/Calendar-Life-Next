# Netflix-Style Course Platform

A beautiful, Netflix-inspired course platform built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Stream video courses directly from Google Drive with progress tracking, auto-next functionality, and password protection.

## Features

### 🔒 Security
- **Password Protection**: Entire site protected with middleware-based authentication
- **Secure Streaming**: Video streaming endpoint validates authentication cookies
- **HTTP-Only Cookies**: Session management with secure, HTTP-only cookies

### 📺 Video Player
- **Custom Controls**: Play/pause, volume, seek, fullscreen
- **Range Request Support**: Efficient HTTP 206 partial content streaming
- **Keyboard Shortcuts**: 
  - `Space/K` - Play/Pause
  - `F` - Fullscreen
  - `M` - Mute/Unmute
  - `←/→` - Seek ±10 seconds
  - `↑/↓` - Volume control
- **Progress Tracking**: Auto-save playback position every 5 seconds
- **Auto-Resume**: Pick up where you left off
- **Auto-Next**: Automatically play the next video when current video ends
- **Completion Tracking**: Mark videos as watched (95% threshold)

### 🗂️ Content Organization
- **Recursive Folder Structure**: Supports nested folders and direct video files
- **Smart Sidebar**: Accordion-style navigation with collapsible folders
- **Visual Indicators**: 
  - ✓ Green checkmark for completed videos
  - Red highlight for active video
  - File/folder icons
- **Auto-Select**: Automatically loads first video on startup

### ⚡ Performance
- **Smart Caching**: Folder structure cached for 1 hour to minimize API calls
- **Efficient Streaming**: Range request support for smooth video playback
- **Lazy Loading**: Only loads visible content

### 🎨 Design
- **Dark Theme**: Netflix-inspired dark UI
- **Responsive Layout**: Sidebar + main content area
- **Clean Interface**: Modern, minimal design with Lucide icons
- **Smooth Animations**: Hover effects and transitions

## Prerequisites

1. **Google Cloud Project** with Drive API enabled
2. **Service Account** with access to your Google Drive folder
3. **Node.js** 18+ and npm/yarn/pnpm

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google Drive Configuration
NEXT_PUBLIC_DRIVE_ROOT_ID="your-google-drive-folder-id"
GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Site Authentication
SITE_PASSWORD="your-secure-password"
```

### How to Get These Values

#### 1. Google Drive Root Folder ID
- Open your Google Drive folder in browser
- The URL looks like: `https://drive.google.com/drive/folders/XXXXXXXXXXXXX`
- Copy the `XXXXXXXXXXXXX` part - that's your folder ID

#### 2. Google Service Account Setup

**Step 1: Create a Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

**Step 2: Create Service Account**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - Service account name: `course-platform`
   - Description: `Service account for course platform`
4. Click "Create and Continue"
5. Skip optional steps, click "Done"

**Step 3: Generate Key**
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Click "Create" - a JSON file will download

**Step 4: Extract Credentials**
Open the downloaded JSON file and find:
- `client_email` → Use for `GOOGLE_CLIENT_EMAIL`
- `private_key` → Use for `GOOGLE_PRIVATE_KEY`

**Important:** The private key in the JSON file already has `\n` characters. When copying to `.env.local`, keep them as literal `\n` (don't convert to actual line breaks).

**Step 5: Share Drive Folder**
1. Go to your Google Drive folder
2. Click "Share" button
3. Add the service account email (from `client_email`)
4. Give it **Viewer** or **Content Manager** permissions
5. Click "Send"

#### 3. Site Password
Choose any secure password for site authentication.

## Installation

1. **Clone and Install Dependencies**
```bash
cd jiu-web
npm install
# or
yarn install
# or
pnpm install
```

2. **Install Required Dependencies**
```bash
npm install googleapis lucide-react clsx tailwind-merge
npm install -D @types/node
```

3. **Configure Environment**
Create `.env.local` file with your credentials (see above)

4. **Run Development Server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open Browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
jiu-web/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # Login authentication endpoint
│   │   ├── stream/route.ts        # Protected video streaming with Range support
│   │   └── structure/route.ts     # Fetch Google Drive folder structure
│   ├── login/page.tsx             # Login page
│   └── page.tsx                   # Main application layout
├── components/
│   ├── Sidebar.tsx                # Recursive sidebar navigation
│   └── VideoPlayer.tsx            # Custom video player with controls
├── lib/
│   ├── google.ts                  # Google Drive API integration
│   └── utils.ts                   # Helper functions (navigation, storage)
├── types/
│   └── index.ts                   # TypeScript type definitions
├── middleware.ts                  # Site-wide authentication protection
└── .env.local                     # Environment variables (create this)
```

## How It Works

### Authentication Flow
1. User visits any page
2. Middleware checks for `site_auth` cookie
3. If missing → Redirect to `/login`
4. User enters password
5. API validates against `SITE_PASSWORD`
6. Sets secure HTTP-only cookie
7. Redirects to home page

### Content Loading
1. App fetches folder structure from `/api/structure`
2. API calls Google Drive API with Service Account
3. Recursively crawls folders and files
4. Filters for video files only
5. Returns nested JSON structure
6. Caches result for 1 hour

### Video Streaming
1. User clicks video in sidebar
2. Video player requests `/api/stream?fileId=XXX`
3. API validates authentication cookie
4. Handles Range requests (HTTP 206)
5. Proxies video chunks from Google Drive
6. Browser plays video with seek support

### Progress Tracking
1. Video player saves current time to localStorage every 5 seconds
2. Key format: `video_progress_${fileId}`
3. On video load, seeks to saved position
4. Marks as watched at 95% completion
5. Key format: `video_watched_${fileId}`

### Auto-Next Feature
1. Video player monitors `ended` event
2. Finds next video using utility function
3. Waits 2 seconds
4. Automatically loads and plays next video
5. Continues until playlist ends

## Customization

### Change Theme Colors
Edit `components/VideoPlayer.tsx` and `components/Sidebar.tsx`:
- Replace `red-600` with your preferred color (e.g., `blue-600`, `purple-600`)
- Update gradient colors in login page

### Adjust Cache Duration
Edit `lib/google.ts`:
```typescript
export const getFolderStructure = unstable_cache(
  // ...
  {
    revalidate: 3600, // Change to desired seconds
  }
);
```

### Modify Progress Save Interval
Edit `components/VideoPlayer.tsx`:
```typescript
progressSaveIntervalRef.current = setInterval(() => {
  // Save progress
}, 5000); // Change from 5000ms to desired interval
```

### Change Completion Threshold
Edit `components/VideoPlayer.tsx`:
```typescript
if (progress >= 0.95) { // Change 0.95 to desired threshold (0-1)
  // Mark as watched
}
```

## Troubleshooting

### "Unauthorized" Error
- Check that `site_auth` cookie is set
- Clear cookies and log in again
- Verify `SITE_PASSWORD` in `.env.local`

### "Failed to fetch folder structure"
- Verify `GOOGLE_CLIENT_EMAIL` is correct
- Check that `GOOGLE_PRIVATE_KEY` has proper `\n` characters
- Ensure Service Account has access to the Drive folder
- Verify Drive API is enabled in Google Cloud Console

### Videos Not Playing
- Check browser console for errors
- Verify `fileId` is correct
- Ensure Service Account has permission to view files
- Check that files are video format (mp4, webm, etc.)

### "Failed to stream file"
- Verify file exists in Google Drive
- Check file permissions (Service Account needs access)
- Ensure file is not corrupted
- Try downloading file manually to test

### Large Private Key Issues
If your private key has `\n` as literal text, replace with actual newlines:
```typescript
private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

### Rate Limiting
If hitting Google Drive API limits:
- Increase cache duration
- Reduce structure fetch frequency
- Consider implementing Redis cache for production

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables in Production
- Ensure all env vars are set
- Use secure `SITE_PASSWORD`
- Set `NODE_ENV=production`
- Consider using secrets manager

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use strong passwords** for `SITE_PASSWORD`
3. **Rotate Service Account keys** periodically
4. **Enable HTTPS** in production
5. **Set secure cookie flags** (already configured)
6. **Limit Service Account permissions** to read-only
7. **Monitor API usage** in Google Cloud Console
8. **Consider rate limiting** for production

## License

MIT

## Support

For issues or questions, please check:
1. Environment variables are correctly set
2. Google Drive API is enabled
3. Service Account has proper permissions
4. Files are in supported video formats

## Credits

Built with:
- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Drive API](https://developers.google.com/drive)
- [Lucide Icons](https://lucide.dev/)