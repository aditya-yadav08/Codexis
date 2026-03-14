require('dotenv').config();
const supabase = require('./src/lib/supabase');

async function debug() {
    console.log('--- Fetching Column Names for "repos" ---');
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'repos' });
    
    if (error) {
        // Fallback: try querying a single row
        console.log('RPC failed, trying direct select...');
        const { data: row, error: selectError } = await supabase.from('repos').select('*').limit(1);
        if (selectError) {
            console.error('Select error:', selectError);
        } else {
            console.log('Columns found in row:', Object.keys(row[0] || {}));
        }
    } else {
        console.log('Columns:', data);
    }
}

debug();
