require('dotenv').config();
const supabase = require('./src/lib/supabase');

async function debugTokens() {
    const { data: tokens, error } = await supabase
        .from('github_tokens')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching tokens:', error);
        return;
    }

    console.log('--- github_tokens Sample ---');
    tokens.forEach(t => {
        console.log(`User ID: ${t.user_id}`);
        console.log(`Token Length: ${t.access_token?.length}`);
        console.log(`Token Start: ${t.access_token?.substring(0, 10)}...`);
        console.log('---');
    });
}

debugTokens();
