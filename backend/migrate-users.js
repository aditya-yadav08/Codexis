require("dotenv").config();
const supabase = require("./src/lib/supabase");

async function migrateUserIds() {
  console.log("Starting user ID migration...");

  try {
    // 1. Get all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, github_id, username");

    if (usersError) throw usersError;

    console.log(`Found ${users.length} users in public.users`);

    // Group users by github_id to find those with multiple IDs
    const usersByGithubId = {};
    users.forEach(u => {
      if (!usersByGithubId[u.github_id]) usersByGithubId[u.github_id] = [];
      usersByGithubId[u.github_id].push(u);
    });

    for (const githubId in usersByGithubId) {
      const accounts = usersByGithubId[githubId];
      if (accounts.length > 1) {
        console.log(`\nConflict for GitHub ID ${githubId} (${accounts[0].username}):`);
        
        // Usually, the one with data is the OLD one. 
        // The one created by Supabase Auth is the NEW one (likely has a different UUID).
        // Let's find out which one has repos.
        
        for (const acc of accounts) {
          const { count } = await supabase
            .from("repos")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", acc.id);
          
          console.log(`- ID ${acc.id}: ${count} repos`);
          acc.repoCount = count || 0;
        }

        // We want to move repos from the account WITH repos to the account WITHOUT repos (the new one)
        // OR simply link the old repositories to the new ID.
        // Usually, the NEW ID is the one currently in the session.
        
        // Let's assume the one with 0 repos is the new one, and the one with > 0 is the old one.
        const oldAcc = accounts.find(a => a.repoCount > 0);
        const newAcc = accounts.find(a => a.repoCount === 0);

        if (oldAcc && newAcc) {
          console.log(`Relinking repos from ${oldAcc.id} to ${newAcc.id}...`);
          
          const { error: updateError } = await supabase
            .from("repos")
            .update({ user_id: newAcc.id })
            .eq("user_id", oldAcc.id);

          if (updateError) console.error("Update error:", updateError);
          else console.log("Success!");
          
          // Also link tokens
           await supabase
            .from("github_tokens")
            .update({ user_id: newAcc.id })
            .eq("user_id", oldAcc.id);
            
          // optionally delete the old user row
          // await supabase.from("users").delete().eq("id", oldAcc.id);
        }
      }
    }

    console.log("\nMigration finished.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrateUserIds();
