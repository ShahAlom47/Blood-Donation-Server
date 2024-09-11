const { getChatCollection } = require('../utils/AllDB_Collections/ChatCollection');
const getChatUserList = require('../utils/getChatUserList');
const chatCollection = getChatCollection();

const socketHandler = (io) => {
    io.on('connection', (socket) => {

        // Join event handle
        socket.on('join', async ({ userEmail, userRole }) => {
            try {
                const userChat = await chatCollection.findOne({ userEmail: userEmail });
                if (userChat) {
                    socket.emit(userRole === 'admin' ? 'adminMessage' : 'userMessage', userChat.messages || []);
                }
            } catch (error) {
                console.error('Error handling join event:', error);
            }
        });

        // join user list for admin
        socket.on('joinChat', async ({ userEmail, userRole }) => {
            try {
                const listData = await getChatUserList();
                socket.emit('joinChatUser', listData || []);
            } catch (error) {
                console.error('Error fetching chat user list:', error);
            }
        });

        // for Admin msg
        socket.on('sendAdminMessage', async (msgData) => {
            const { userEmail, userName, userRole, receiverEmail, newMessage } = msgData;
            const adminNewMsg = {
                senderEmail: userEmail,
                senderRole: userRole,
                senderName: userName,
                timestamp: new Date(),
                isRead: false,
                message: newMessage
            };

            try {
                const findReceiverUser = await chatCollection.findOne({ userEmail: receiverEmail });
                if (findReceiverUser) {
                    await chatCollection.updateOne(
                        { userEmail: receiverEmail },
                        { 
                            $push: { messages: adminNewMsg },
                            $set: { lastMessage: new Date() } 
                        }
                    );
                    const sendReceiverUserMsg = await chatCollection.findOne({ userEmail: receiverEmail });
                    io.emit('adminMessage', sendReceiverUserMsg?.messages);
                    io.emit('userMessage', sendReceiverUserMsg?.messages);
                }
            } catch (error) {
                console.error('Error sending admin message:', error);
            }
        });

        // for user msg
        socket.on('message', async (msgData) => {
            const { userEmail, userName, userRole, message } = msgData;
            const newMsg = {
                senderEmail: userEmail,
                senderRole: userRole,
                senderName: userName,
                timestamp: new Date(),
                isRead: false,
                message: message
            };

            try {
                const existingUser = await chatCollection.findOne({ userEmail: userEmail });
                if (!existingUser) {
                    await chatCollection.insertOne({
                        userEmail: userEmail,
                        userName: userName,
                        lastMessage: new Date(),
                        messages: [newMsg]
                    });
                    const newUserMsg = await chatCollection.findOne({ userEmail: userEmail });
                    socket.emit('adminMessage', newUserMsg?.messages || []);
                } else {
                    await chatCollection.updateOne(
                        { userEmail: userEmail },
                        { 
                            $push: { messages: newMsg },
                            $set: { lastMessage: new Date() } 
                        }
                    );
                    const existingUserMsg = await chatCollection.findOne({ userEmail: userEmail });
                    io.emit('adminMessage', existingUserMsg?.messages || []); // Emit to all connected clients
                    const listData = await getChatUserList();
                    io.emit('joinChatUser', listData || []); // Update all clients
                }
            } catch (error) {
                console.error('Error handling user message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
