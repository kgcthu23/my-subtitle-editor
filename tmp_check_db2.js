const fs = require('fs');

const SUPABASE_URL = 'https://bnzfqmuxzmjlrinkujoc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuemZxbXV4em1qbHJpbmt1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzY5MjcsImV4cCI6MjA5MDYxMjkyN30.T5MWNGeRCUeaW3aRjmYoZBwsakzFJpu5o0bArHn1SxY';

async function checkDb() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/project_notes?select=*&order=created_at.desc&limit=3`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!res.ok) {
    fs.writeFileSync('tmp_out.txt', 'Error fetching data: ' + await res.text());
    return;
  }

  const data = await res.json();
  let out = `Latest 3 rows: ${data.length}\n`;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    out += `\nRow ${i+1}:\n`;
    out += `- id: ${row.id}\n`;
    out += `- created_at: ${row.created_at}\n`;
    
    try {
      const parsed = JSON.parse(row.content);
      out += `- content keys: ${Object.keys(parsed).join(', ')}\n`;
      out += `- parsed successfully\n`;
      out += `- content payload summary: \n`;
      for (const k of Object.keys(parsed)) {
          out += `  - ${k}: ${String(parsed[k]).substring(0, 50)}...\n`;
      }
    } catch (e) {
      out += `- content (failed to parse): ${String(row.content)}\n`;
    }
  }
  fs.writeFileSync('tmp_out.txt', out);
}

checkDb();
