const { getChatCollection } = require("./AllDB_Collections/ChatCollection");

const chatCollection= getChatCollection()


const getChatUserList=async()=>{
    try {
      
        // Fetch all chats
        const allChats = await chatCollection.find({}).toArray();

        // Sort chats by the lastMessage date
        const sortedChats = allChats.sort((a, b) => {
            const dateA = new Date(a.lastMessage);
            const dateB = new Date(b.lastMessage);
            return dateB - dateA;  // Sort in descending order
        });

        // Process chats for unread messages
        const processedChats = sortedChats.map(chat => {
            const unreadCount = chat.messages.reduce((count, message) => {
                if (message.senderRole === 'user' && !message.isRead) {
                    return count + 1;
                }
                return count;
            }, 0);

            // Return chat data without messages, adding unread count
            const { messages, ...chatDataWithoutMessages } = chat;
            return {
                ...chatDataWithoutMessages,
                unread: unreadCount
            };
        });

         return processedChats;
    } catch (error) {
        console.error('Error fetching chats:', error);
    }

}

module.exports= getChatUserList