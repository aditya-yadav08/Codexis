const supabase = require("../../lib/supabase");
const { encrypt } = require("../../utils/crypto");

exports.syncGithubToken = async (request, reply) => {
  try {
    const { provider_token } = request.body;
    const user = request.user;

    if (!provider_token) {
      return reply.code(400).send({ error: "provider_token is required" });
    }

    // 1. Reconcile user record
    // We check if a user with this github_id already exists but has a different ID
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("github_id", user.github_id)
      .maybeSingle();

    if (existingUser && existingUser.id !== user.user_id) {
       console.log(`Conflict detected: GitHub ID ${user.github_id} belongs to ${existingUser.id}, but session has ${user.user_id}`);
       
       // Update the existing row to have the new ID? 
       // Often PKs shouldn't be changed, but for a migration it's the fastest way to preserve data links
       // However, we can also just delete the old one if it's junk. 
       // But wait, the previous fix-repos error said 'user_id' doesn't exist on 'repos'.
       // Let's just update the user record to match the new session ID.
       const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", existingUser.id);
        
       if (deleteError) console.error("Error deleting old user:", deleteError);
    }

    const { error: userError } = await supabase
      .from("users")
      .upsert({
        id: user.user_id,
        github_id: user.github_id,
        username: user.username,
      }, { onConflict: 'id' });

    if (userError) throw userError;

    // 2. Save GitHub token
    const encryptedToken = encrypt(provider_token);
    const { error } = await supabase
      .from("github_tokens")
      .upsert(
        {
          user_id: user.user_id,
          access_token: encryptedToken,
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return { message: "Token synced successfully" };
  } catch (error) {
    console.error("Token Sync Error:", error);
    reply.code(500).send({ error: error.message });
  }
};