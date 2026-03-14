require('dotenv').config();
const supabase = require('./src/lib/supabase');

async function debugUsers() {
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log('--- users Table ---');
    users.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, GitHub ID: ${u.github_id}`);
    });
}

debugUsers();
