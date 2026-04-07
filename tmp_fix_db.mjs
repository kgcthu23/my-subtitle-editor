import fs from 'fs';

const SUPABASE_URL = 'https://bnzfqmuxzmjlrinkujoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuemZxbXV4em1qbHJpbmt1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzY5MjcsImV4cCI6MjA5MDYxMjkyN30.T5MWNGeRCUeaW3aRjmYoZBwsakzFJpu5o0bArHn1SxY';

async function fixDb() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/project_notes?select=*&order=created_at.desc&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!res.ok) {
    console.error('Error fetching data:', await res.text());
    return;
  }

  const data = await res.json();
  const latestRow = data[0];
  const parsed = JSON.parse(latestRow.content);
  
  if ("NaN" in parsed) {
    console.log("Found NaN key. Fixing...");
    const val = parsed["NaN"];
    delete parsed["NaN"];
    
    // Find next valid ID
    const keys = Object.keys(parsed)
        .filter(k => !k.startsWith('archived_') && !k.startsWith('canvas_') && !k.startsWith('photo_'))
        .map(Number)
        .filter(n => !isNaN(n));
    
    const nextId = String(keys.length > 0 ? Math.max(...keys) + 1 : 1);
    parsed[nextId] = val;
    
    // Insert new row
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/project_notes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            content: JSON.stringify(parsed)
        })
    });
    
    if (!insertRes.ok) {
        console.error('Error inserting data:', await insertRes.text());
    } else {
        console.log("Database fixed successfully! Re-inserted as key", nextId);
    }
  } else {
    console.log("No NaN key found in latest row.");
  }
}

fixDb();
