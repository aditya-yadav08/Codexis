require("dotenv").config();
const supabase = require("./src/lib/supabase");

async function debugSchema() {
  const { data: repos, error } = await supabase.from("repos").select("*").limit(1);
  if (error) {
    console.error(error);
    return;
  }
  if (repos && repos.length > 0) {
    console.log("Keys in 'repos' table:", Object.keys(repos[0]));
  } else {
    console.log("No repos found to inspect keys.");
  }
}

debugSchema();
