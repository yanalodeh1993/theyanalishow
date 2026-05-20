import OBSWebSocket from 'obs-websocket-js'
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual values before running
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY'
const OBS_WS_URL = 'ws://localhost:4455'
const OBS_WS_PASSWORD = ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const obs = new OBSWebSocket()

async function setLiveStatus(isLive, viewerCount = 0) {
  const { error } = await supabase
    .from('stream_status')
    .update({ is_live: isLive, viewer_count: viewerCount, updated_at: new Date().toISOString() })
    .eq('platform', 'twitch')

  if (error) console.error('Supabase update error:', error)
  else console.log(`Stream status updated: is_live=${isLive}`)
}

obs.on('StreamStateChanged', ({ outputActive }) => {
  setLiveStatus(outputActive).catch((err) => console.error('Stream status update failed:', err))
})

async function connect() {
  try {
    await obs.connect(OBS_WS_URL, OBS_WS_PASSWORD)
    console.log('Connected to OBS WebSocket — watching for stream events...')
  } catch (err) {
    console.error('Failed to connect to OBS:', err)
    console.log('Retrying in 5 seconds...')
    setTimeout(connect, 5000)
  }
}

connect()
