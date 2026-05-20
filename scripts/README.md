# OBS Stream Status Relay

Runs on your streaming PC. Updates Supabase when you go live or end a stream.

## Setup

1. Enable OBS WebSocket: OBS → Tools → WebSocket Server Settings → Enable
2. Set your password (optional) and update `OBS_WS_PASSWORD` in obs-relay.js
3. Get your Supabase Service Role key from: Supabase → Project Settings → API → service_role key
4. Update `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in obs-relay.js

## Run (before streaming)

```bash
cd scripts
npm install
node obs-relay.js
```

Keep this terminal open while you stream.
