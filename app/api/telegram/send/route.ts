import { NextRequest, NextResponse } from 'next/server'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'

// Initialize client outside request handler for connection reuse
const apiId = parseInt(process.env.TELEGRAM_API_ID || '')
const apiHash = process.env.TELEGRAM_API_HASH || ''
const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION || '')

let client: TelegramClient | null = null
let clientPromise: Promise<TelegramClient> | null = null

async function getClient() {
  if (clientPromise) return clientPromise
  
  clientPromise = (async () => {
    if (!client) {
      client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        useWSS: true, // Use WebSocket for faster connection
        maxConcurrentDownloads: 10,
      })
      await client.connect()
    }
    return client
  })()

  return clientPromise
}

export async function POST(request: NextRequest) {
  try {
    const { username, fileUrl } = await request.json()
    
    if (!username || !fileUrl) {
      return NextResponse.json(
        { error: 'Username and file URL are required' },
        { status: 400 }
      )
    }

    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username

    const message = `📎 Here's your file link: ${fileUrl}\n\n🕛 This file will be automatically deleted at midnight.`
    
    const client = await getClient()
    
    try {
      // Find the user
      const result = await client.sendMessage(cleanUsername, { message })
      
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error('Message send error:', err)
      return NextResponse.json(
        { error: 'Could not send message. Please check the username and try again.' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Telegram error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please check the username and try again.' },
      { status: 500 }
    )
  }
} 