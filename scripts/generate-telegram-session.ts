const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
require('dotenv').config()

const apiId = 21492744
const apiHash = 'd01c0a01c3fb2037a8c3f10cc271a8d8'

;(async () => {
  console.log('Initializing Telegram client...')
  
  const client = new TelegramClient(
    new StringSession(""), // empty string = new session
    apiId,
    apiHash,
    {
      connectionRetries: 5,
    }
  )

  try {
    console.log('Starting client...')
    await client.start({
      phoneNumber: async () => await input.text("Enter your phone number (international format): "),
      password: async () => await input.text("Enter your 2FA password (if enabled): "),
      phoneCode: async () => await input.text("Enter the code you received: "),
      onError: (err: Error) => console.log(err),
    })

    console.log('Client started successfully!')
    const sessionString = client.session.save()
    console.log('\nYour session string (save this to .env.local as TELEGRAM_STRING_SESSION):\n')
    console.log(sessionString)
    console.log('\nTesting connection by sending a message to yourself...')
    
    await client.sendMessage('me', { message: 'Test message from Dropit app' })
    console.log('Test message sent successfully!')
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err)
  } finally {
    await client.disconnect()
    console.log('Client disconnected')
  }
})() 