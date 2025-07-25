const supabase = require("../../supabaseClient"); 

const saveConversation = async ({ userId, inputText, responseText, source }) => {
    const { data, error } = await supabase
        .rpc('save_conversation_rpc', {
            uid: userId,
            input: inputText,
            response: responseText,
            source: source
        });

    if (error) {
        console.error("❌ Error saving conversation via RPC:", error.message);
        return { error: error.message };
    }

    return { data };
};
module.exports = {saveConversation};