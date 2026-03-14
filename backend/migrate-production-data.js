require('dotenv').config();
const supabase = require('./src/lib/supabase');
const { encrypt } = require('./src/utils/crypto');

async function migrate() {
    console.log('--- Starting Production Data Migration ---');

    // 1. Encrypt existing tokens
    console.log('\nStep 1: Encrypting GitHub Tokens...');
    const { data: tokens, error: tokenError } = await supabase
        .from('github_tokens')
        .select('*');

    if (tokenError) {
        console.error('Error fetching tokens:', tokenError);
        return;
    }

    console.log(`Found ${tokens.length} tokens.`);

    for (const token of tokens) {
        // Simple check: if it doesn't have a ':', it's likely plain text
        if (token.access_token && !token.access_token.includes(':')) {
            console.log(`Encrypting token for user ${token.user_id}...`);
            const encrypted = encrypt(token.access_token);
            const { error: updateError } = await supabase
                .from('github_tokens')
                .update({ access_token: encrypted })
                .eq('user_id', token.user_id);
            
            if (updateError) {
                console.error(`Failed to update token for user ${token.user_id}:`, updateError);
            }
        } else {
            console.log(`Token for user ${token.user_id} is already encrypted or invalid. Skipping.`);
        }
    }

    // 2. Fix repository user_id links (if any are missing)
    console.log('\nStep 2: Auditing repository ownership...');
    
    const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle();

    if (userFetchError || !userData) {
        console.error('Error fetching a primary user for reconciliation:', userFetchError);
        return;
    }

    const primaryUserId = userData.id;
    console.log(`Reconciling orphaned repos to primary user: ${primaryUserId}`);

    const { data: repos, error: repoError } = await supabase
        .from('repos')
        .select('*');

    if (repoError) {
        console.error('Error fetching repos:', repoError);
    } else {
        const missingUser = repos.filter(r => !r.user_id);
        if (missingUser.length > 0) {
            console.log(`Fixing ${missingUser.length} repositories without a user_id...`);
            for (const repo of missingUser) {
                const { error: patchError } = await supabase
                    .from('repos')
                    .update({ user_id: primaryUserId })
                    .eq('id', repo.id);
                
                if (patchError) console.error(`Failed to link repo ${repo.repo}:`, patchError);
                else console.log(`Linked ${repo.repo} to ${primaryUserId}`);
            }
        } else {
            console.log('All repositories have valid user_id associations.');
        }
    }

    console.log('\n--- Migration Complete ---');
}

migrate().catch(console.error);
