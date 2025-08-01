const supabase = require("../../supabaseClient");
const DEFAULT_CONTEXT = "Speak easy English with this user";
const signUpUser = async ({ name, email, password }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  console.log("authERRO", authError)
  if (authError) {
    console.log("Auth signup error:", authError);
    return { error: authError?.message || "Unknown signup error" };
  }

  if (!authData?.user?.id) {
    console.log("Signup succeeded but no user ID returned:", authData);
    return { error: "Signup succeeded, but no user ID returned." };
  }

  const userId = authData.user.id;

  const { error: insertError } = await supabase
    .from("users")
    .insert([{ id: userId, name, email,  context: DEFAULT_CONTEXT }]);
  console.log("insertError", insertError)
  if (insertError) {
    console.log("Error inserting into users table:", insertError);
    return { error: insertError?.message || "Failed to insert user profile." };
  }

  return { userId, name, email };
};

const signInUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };

  const accessToken = data?.session?.access_token;
  const user = data?.user;

  if (!accessToken || !user)
    return { error: "Login successful, but no token returned." };

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("context")
    .eq("id", user.id)
    .single();

  if (profileError) return { error: profileError.message };
  
  return {
    token: accessToken,
    user: {
      ...user,
      context: profileData.context || {},
    },
  };
};

module.exports = { signUpUser, signInUser };
