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
    // Get files created before today
    const response = await drive.files.list({
      q: `createdTime < '${new Date().toISOString().split('T')[0]}'`,
      fields: 'files(id)',
    })

    const files = response.data.files
    if (files?.length) {
      for (const file of files) {
        await drive.files.delete({
          fileId: file.id!,
        })
      }
      console.log(`Deleted ${files.length} files`)
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

cleanupFiles() 