#!/usr/bin/env node

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testDriveAccess() {
  console.log('🔍 Testing Google Drive Access...\n');

  const folderId = process.env.NEXT_PUBLIC_DRIVE_ROOT_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  console.log('Folder ID:', folderId);
  console.log('Service Account:', clientEmail);
  console.log('Private Key Length:', privateKey ? privateKey.length : 'NOT SET');
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('📂 Fetching files from folder...\n');

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 100,
      orderBy: 'name',
    });

    const files = response.data.files || [];

    console.log(`Found ${files.length} items in the folder:\n`);

    if (files.length === 0) {
      console.log('⚠️  The folder is empty or the service account cannot access it.\n');
      console.log('Make sure you:');
      console.log('1. Shared the folder with:', clientEmail);
      console.log('2. The folder actually contains files');
      console.log('3. Wait a few minutes after sharing for permissions to propagate');
      return;
    }

    let videoCount = 0;
    let folderCount = 0;
    let otherCount = 0;

    files.forEach((file, index) => {
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      const isVideo = file.mimeType && file.mimeType.startsWith('video/');

      let icon = '📄';
      if (isFolder) {
        icon = '📁';
        folderCount++;
      } else if (isVideo) {
        icon = '🎬';
        videoCount++;
      } else {
        otherCount++;
      }

      const size = file.size ? `(${Math.round(file.size / 1024 / 1024)}MB)` : '';
      console.log(`${icon} ${file.name} ${size}`);
      console.log(`   Type: ${file.mimeType}`);
      console.log(`   ID: ${file.id}\n`);
    });

    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Videos: ${videoCount}`);
    console.log(`   Folders: ${folderCount}`);
    console.log(`   Other files: ${otherCount}`);
    console.log(`   Total: ${files.length}`);

    if (videoCount === 0 && folderCount === 0) {
      console.log('\n⚠️  No videos or folders found!');
      console.log('The platform only displays video files and folders.');
      console.log('Please add some .mp4, .webm, or other video files to your Drive folder.');
    } else if (videoCount === 0 && folderCount > 0) {
      console.log('\n✅ Folders found! Checking subfolders for videos...\n');

      for (const folder of files.filter(f => f.mimeType === 'application/vnd.google-apps.folder')) {
        console.log(`\n📁 Checking folder: ${folder.name}`);
        const subResponse = await drive.files.list({
          q: `'${folder.id}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType)',
          pageSize: 10,
        });

        const subFiles = subResponse.data.files || [];
        const subVideos = subFiles.filter(f => f.mimeType && f.mimeType.startsWith('video/'));

        console.log(`   Found ${subFiles.length} items (${subVideos.length} videos)`);
        subVideos.forEach(v => console.log(`   🎬 ${v.name}`));
      }
    } else {
      console.log('\n✅ Videos found! Your platform should work correctly.');
    }

    console.log('\n✅ SUCCESS: Service account has access to the folder!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.code === 404) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check that the folder ID is correct');
      console.log('2. Make sure the folder exists and is not deleted');
    } else if (error.code === 403) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Share the folder with:', clientEmail);
      console.log('2. Make sure you clicked "Send" after adding the email');
      console.log('3. Wait 1-2 minutes for permissions to propagate');
      console.log('4. Check that Google Drive API is enabled in Cloud Console');
    } else {
      console.log('\n💡 Error details:', error);
    }
  }
}

testDriveAccess();
