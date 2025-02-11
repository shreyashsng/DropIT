import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

const getGoogleAuth = () => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKey) {
    throw new Error('Google credentials not properly configured')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
}

export async function POST(request: NextRequest) {
  try {
    // Debug log
    console.log('Credentials check:', {
      hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length,
      privateKeyStart: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50),
      privateKeyEnd: process.env.GOOGLE_PRIVATE_KEY?.substring(-50),
    })

    const auth = getGoogleAuth()
    const drive = google.drive({ version: 'v3', auth })

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Google Drive
    const fileMetadata = {
      name: file.name,
      // Optional: Store in a specific folder
      // parents: ['YOUR_FOLDER_ID'],
    }

    const media = {
      mimeType: file.type,
      body: Readable.from(buffer),
    }

    try {
      const driveResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      })

      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: driveResponse.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })

      return NextResponse.json({
        url: driveResponse.data.webViewLink,
      })
    } catch (uploadError) {
      console.error('Drive API Error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload to Google Drive' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }
} 