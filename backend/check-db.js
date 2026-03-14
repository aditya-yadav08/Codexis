require("dotenv").config();
const supabase = require("./src/lib/supabase");

async function checkRepos() {
  console.log("Checking repos table...");

  const { data: repos, error } = await supabase
    .from("repos")
    .select("*");

  if (error) {
    console.error("Error fetching repos:", error);
    return;
  }

  console.log(`Found ${repos.length} repos:`);
  repos.forEach(r => {
    console.log(`- Repo: ${r.owner}/${r.repo}, UserID: ${r.user_id}`);
  });

  const { data: users } = await supabase
    .from("users")
    .select("id, username");
  
  console.log("\nCurrent users:");
  users.forEach(u => {
    console.log(`- User: ${u.username}, ID: ${u.id}`);
  });
}

checkRepos();
