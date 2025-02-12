import { google } from 'googleapis'

async function cleanupFiles() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })

  const drive = google.drive({ version: 'v3', auth })

  try {
    // Get files from specific folder created before today
    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and createdTime < '${new Date().toISOString().split('T')[0]}'`,
      fields: 'files(id, name, createdTime)',
    })

    const files = response.data.files
    if (files?.length) {
      console.log(`Found ${files.length} files to delete`)
      for (const file of files) {
        await drive.files.delete({
          fileId: file.id!,
        })
        console.log(`Deleted file: ${file.name} (created: ${file.createdTime})`)
      }
      console.log(`Cleanup complete: deleted ${files.length} files`)
    } else {
      console.log('No files to delete')
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

cleanupFiles() 