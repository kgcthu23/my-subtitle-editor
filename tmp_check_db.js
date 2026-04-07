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
    console.error('Error fetching data:', await res.text());
    return;
  }

  const data = await res.json();
  console.log('Latest 3 rows:', data.length);
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    console.log(`\nRow ${i+1}:`);
    console.log(`- id: ${row.id}`);
    console.log(`- created_at: ${row.created_at}`);
    
    try {
      const parsed = JSON.parse(row.content);
      console.log(`- content keys:`, Object.keys(parsed));
      console.log(`- parsed successfully`);
    } catch (e) {
      console.log(`- content (failed to parse):`, String(row.content).substring(0, 500) + '...');
    }
  }
}

checkDb();
