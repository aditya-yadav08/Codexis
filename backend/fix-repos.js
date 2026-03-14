require("dotenv").config();
const supabase = require("./src/lib/supabase");

async function fixRepos() {
  console.log("Fixing repos table...");

  const { data: repos, error } = await supabase
    .from("repos")
    .select("*");

  if (error) {
    console.error("Error:", error);
    return;
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, username");
  
  if (!users || users.length === 0) {
    console.error("No users found");
    return;
  }

  const targetUserId = users[0].id; // The new Supabase Auth ID
  console.log(`Target User ID: ${targetUserId} (${users[0].username})`);

  for (const repo of repos) {
    console.log(`- Found repo: ${repo.owner}/${repo.repo} with current user_id: ${repo.user_id}`);
    
    if (repo.user_id !== targetUserId) {
      console.log(`  Relinking to ${targetUserId}...`);
      const { error: updateError } = await supabase
        .from("repos")
        .update({ user_id: targetUserId })
        .eq("id", repo.id);
      
      if (updateError) console.error("  Update failed:", updateError);
      else console.log("  Success!");
    }
  }
}

fixRepos();
