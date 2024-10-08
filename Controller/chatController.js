const { query } = require("express");
const { getChatCollection } = require("../utils/AllDB_Collections/ChatCollection");


const chatCollection=getChatCollection()

// const getAllChatUsers = async (req, res) => {
//     try {
//         const  userEmail  = req.params.email; 

//         if (!userEmail) {
//             return res.status(400).json({ error: 'User email is required' });
//         }

      
//         const allChats = await chatCollection.find({}).toArray();

        
//         const processedChats = allChats.map(chat => {
//           const unreadCount = chat.messages.reduce((count, message) => {
//                 if (message.senderEmail !== userEmail && !message.isRead) {
//                     return count + 1;
//                 }
//                 return count;
//             }, 0);

           
//             const { messages, ...chatDataWithoutMessages } = chat;
//             return {
//                 ...chatDataWithoutMessages,
//                 unread: unreadCount
//             };
//         });

       
//         res.json(processedChats);
//     } catch (error) {
//         console.error('Error fetching chats:', error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// };


const getAllChatUsers = async (req, res) => {
    try {
        const userEmail = req.params.email; 

        if (!userEmail) {
            return res.status(400).json({ error: 'User email is required' });
        }

        // Fetch all chats
        const allChats = await chatCollection.find({}).toArray();

        // Sort chats by the lastMessage date
        const sortedChats = allChats.sort((a, b) => {
            const dateA = new Date(a.lastMessage);
            const dateB = new Date(b.lastMessage);
            return dateB - dateA; 
        });

        // Process chats for unread messages
        const processedChats = sortedChats.map(chat => {
            const unreadCount = chat.messages.reduce((count, message) => {
                if (message.senderEmail !== userEmail && !message.isRead) {
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

        // Return the processed chats
        res.json(processedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

const changeUserReadMsgStatus = async (req, res) => {
  try {
    const { userEmail, userRole } = req.body;

    // Query to select the chat document where `userEmail` matches
    const query = { userEmail: userEmail };

    // Update query to set `isRead: true` for messages that do NOT match `senderEmail` and `senderRole`
    const updateResult = await chatCollection.updateMany(
      query,
      {
        $set: {
          "messages.$[elem].isRead": true
        }
      },
      {
        arrayFilters: [
          { "elem.senderEmail": { $ne: userEmail }, "elem.senderRole": { $ne: userRole } }
        ]
      }
    );

    if (updateResult.modifiedCount > 0) {
      res.send({success:true, message: 'Message read status updated successfully.' });
    } else {
      res.json({ message: 'No matching messages found.' });
    }

  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


const changeAdminReadMsgStatus = async (req, res) => {
  try {
    const { senderEmail, userEmail, userRole } = req.body;

    // Query to select the chat document where `userEmail` matches
    const query = { userEmail: senderEmail };

    // Update query to set `isRead: true` for messages that do NOT match `senderEmail` and `senderRole`
    const updateResult = await chatCollection.updateMany(
      query,
      {
        $set: {
          "messages.$[elem].isRead": true
        }
      },
      {
        arrayFilters: [
          { "elem.senderEmail": { $ne: userEmail }, "elem.senderRole": { $ne: userRole } }
        ]
      }
    );

    if (updateResult.modifiedCount > 0) {
      res.send({success:true, message: 'Message read status updated successfully.' });
    } else {
      res.json({ message: 'No matching messages found.' });
    }

  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



module.exports={
    getAllChatUsers,
    changeUserReadMsgStatus,
    changeAdminReadMsgStatus,
}