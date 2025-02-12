import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3'
import { GaxiosResponse } from 'gaxios'
import { Readable } from 'stream'

const FOLDER_NAME = '0drop-bucket'

const getDrive = () => google.drive({ 
  version: 'v3', 
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
})

async function getOrCreateFolder(drive: drive_v3.Drive): Promise<string> {
  const response = (await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  })) as GaxiosResponse<drive_v3.Schema$FileList>

  if (response.data.files?.[0]?.id) {
    return response.data.files[0].id
  }

  const folder = (await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  })) as GaxiosResponse<drive_v3.Schema$File>

  const folderId = folder.data.id!
  await drive.permissions.create({
    fileId: folderId,
    requestBody: { role: 'writer', type: 'anyone' },
  })

  return folderId
}

export async function POST(request: NextRequest) {
  try {
    const drive = getDrive()
    const folderId = await getOrCreateFolder(drive)
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const driveResponse = (await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
        description: `Uploaded via DropIT on ${new Date().toLocaleString()}`
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: Readable.from(buffer),
      },
      fields: 'id, webViewLink, createdTime',
    })) as GaxiosResponse<drive_v3.Schema$File>

    const fileId = driveResponse.data.id
    if (!fileId) throw new Error('File upload failed')

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    })

    return NextResponse.json({
      url: driveResponse.data.webViewLink,
      fileId,
      createdTime: driveResponse.data.createdTime
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
} 