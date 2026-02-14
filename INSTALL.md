# Installation Guide

## Quick Start

Follow these steps to get your Netflix-style course platform up and running.

## 1. Install Dependencies

```bash
npm install googleapis lucide-react clsx tailwind-merge
```

Or if you prefer yarn:

```bash
yarn add googleapis lucide-react clsx tailwind-merge
```

Or with pnpm:

```bash
pnpm add googleapis lucide-react clsx tailwind-merge
```

## 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Google Drive Configuration
NEXT_PUBLIC_DRIVE_ROOT_ID="your-folder-id-here"
GOOGLE_CLIENT_EMAIL="your-service-account@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

# Site Authentication
SITE_PASSWORD="your-secure-password"
```

## 3. Google Cloud Setup

### Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to "APIs & Services" → "Library"
4. Search for "Google Drive API"
5. Click "Enable"

### Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name it (e.g., "course-platform")
4. Click "Create and Continue"
5. Skip optional steps, click "Done"

### Generate JSON Key

1. Click on the newly created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. A JSON file will download automatically

### Extract Credentials from JSON

Open the downloaded JSON file and copy:
- `client_email` → Goes to `GOOGLE_CLIENT_EMAIL`
- `private_key` → Goes to `GOOGLE_PRIVATE_KEY`

**Important:** Keep the `\n` characters in the private key as-is.

### Share Your Drive Folder

1. Open Google Drive and navigate to your course folder
2. Right-click → "Share"
3. Paste the service account email (from `client_email`)
4. Set permission to "Viewer"
5. Click "Send"

## 4. Get Your Drive Folder ID

1. Open your course folder in Google Drive
2. Look at the URL: `https://drive.google.com/drive/folders/XXXXXXXXXXXXX`
3. Copy the `XXXXXXXXXXXXX` part
4. Use it for `NEXT_PUBLIC_DRIVE_ROOT_ID`

## 5. Set Site Password

Choose a strong password for accessing your platform. Use it for `SITE_PASSWORD`.

## 6. Verify Your Setup

Your `.env.local` should look like this:

```env
NEXT_PUBLIC_DRIVE_ROOT_ID="1a2b3c4d5e6f7g8h9i0j"
GOOGLE_CLIENT_EMAIL="course-platform@my-project-123456.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
SITE_PASSWORD="MySecurePassword123!"
```

## 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 8. First Login

1. You'll be redirected to `/login`
2. Enter the password you set in `SITE_PASSWORD`
3. Click "Sign In"
4. You'll be redirected to the main platform

## Troubleshooting

### Common Issues

**"Unauthorized" when accessing videos:**
- Clear browser cookies
- Log in again
- Check `SITE_PASSWORD` is correct

**"Failed to fetch folder structure":**
- Verify service account email is correct
- Check that Drive folder is shared with service account
- Ensure Google Drive API is enabled
- Verify private key format (keep `\n` characters)

**Videos not loading:**
- Check files are video format (mp4, webm, mov, etc.)
- Verify service account has access to files
- Open browser console to see detailed errors

**Build errors:**
- Run `npm install` again
- Delete `node_modules` and `.next` folders
- Run `npm install` fresh
- Run `npm run dev`

## File Structure Should Look Like This

```
jiu-web/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── stream/
│   │   │   └── route.ts
│   │   └── structure/
│   │       └── route.ts
│   ├── login/
│   │   └── page.tsx
│   └── page.tsx
├── components/
│   ├── Sidebar.tsx
│   └── VideoPlayer.tsx
├── lib/
│   ├── google.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── middleware.ts
├── .env.local (create this)
└── package.json
```

## Next Steps

Once installed:
1. Add your course videos to the Google Drive folder
2. Organize in folders/subfolders as needed
3. Videos will appear automatically in the sidebar
4. Click any video to start watching
5. Progress is saved automatically

## Production Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_DRIVE_ROOT_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `SITE_PASSWORD`
4. Deploy

### Other Platforms

Ensure these environment variables are set:
- All four variables from `.env.local`
- `NODE_ENV=production`

## Security Reminders

✅ Never commit `.env.local` to git
✅ Use strong passwords
✅ Rotate service account keys periodically
✅ Use HTTPS in production
✅ Limit service account to read-only access

## Support

If you encounter issues:
1. Check this guide again
2. Verify all environment variables
3. Check Google Cloud Console for API errors
4. Look at browser console for client errors
5. Check server logs for API errors

Enjoy your course platform! 🎉