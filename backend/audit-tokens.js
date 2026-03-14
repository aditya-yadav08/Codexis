require('dotenv').config();
const supabase = require('./src/lib/supabase');
const { decrypt } = require('./src/utils/crypto');

async function testAllTokens() {
    const { data: tokens, error } = await supabase
        .from('github_tokens')
        .select('*');

    if (error) {
        console.error('Error fetching tokens:', error);
        return;
    }

    console.log(`Auditing ${tokens.length} tokens...`);
    for (const t of tokens) {
        try {
            if (!t.access_token) {
                console.log(`User ${t.user_id}: MISSING TOKEN`);
                continue;
            }
            const decrypted = decrypt(t.access_token);
            console.log(`User ${t.user_id}: SUCCESS (Length ${decrypted.length})`);
        } catch (e) {
            console.log(`User ${t.user_id}: FAILURE - ${e.message}`);
        }
    }
}

testAllTokens();
