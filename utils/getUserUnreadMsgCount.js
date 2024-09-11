const { getChatCollection } = require("./AllDB_Collections/ChatCollection");

const chatCollection = getChatCollection();

const getUserUnreadMsgCount = async (userEmail) => {
 
    try {
        // Fetch the chat document for the user
        const userChat = await chatCollection.findOne({ userEmail: userEmail });

        if (!userChat) {
            return 0; // Return 0 if no chat data found
        }

        // Calculate unread messages count
        const unreadCount = userChat.messages.reduce((total, message) => {
            if (message.senderEmail !== userEmail && !message.isRead) {
                return total + 1;
            }
            return total;
        }, 0);

        return unreadCount;
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        return 0; // Return 0 in case of error
    }
}

module.exports = getUserUnreadMsgCount;
