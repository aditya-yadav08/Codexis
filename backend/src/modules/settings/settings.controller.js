const supabase = require("../../lib/supabase");

exports.getSettings = async (request, reply) => {
  try {
    const { user_id } = request.user;
    
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Get Settings Error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.updateSettings = async (request, reply) => {
  try {
    const { user_id } = request.user;
    const updates = request.body;

    // Filter allowed fields
    const allowedFields = ["full_name", "bio", "workspace_name", "default_branch", "avatar", "notifications", "theme", "accent_color"];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return reply.code(400).send({ error: "No valid fields to update" });
    }

    const { data, error } = await supabase
      .from("users")
      .update(filteredUpdates)
      .eq("id", user_id)
      .select()
      .single();

    if (error) throw error;

    return { message: "Settings updated successfully", user: data };
  } catch (error) {
    console.error("Update Settings Error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.deleteAccount = async (request, reply) => {
  try {
    const { user_id } = request.user;

    // 1. Delete user's repos (this should ideally cascade, but let's be safe)
    await supabase.from("repos").delete().eq("user_id", user_id);
    
    // 2. Delete tokens
    await supabase.from("github_tokens").delete().eq("user_id", user_id);
    
    // 3. Delete stats (if keyed by user_id)
    // Stats are currently in Redis for usage, but we might have DB stats too.
    
    // 4. Delete user record
    const { error } = await supabase.from("users").delete().eq("id", user_id);

    if (error) throw error;

    return { message: "Account deleted successfully" };
  } catch (error) {
    console.error("Delete Account Error:", error);
    reply.code(500).send({ error: error.message });
  }
};
