
const supabase  = require("../../supabaseClient"); 

const saveConversation = async ({ userId, inputText, responseText }) => {
    const { data, error } = await supabase
        .from("conversations")
        .insert([
            {
                user_id: userId,
                input_text: inputText,
                response_text: responseText,
            },
        ]);

    if (error) {
        console.error("Error saving conversation:", error.message);
        return { error: error.message };
    }

    return { data };
};

module.exports = { saveConversation };
