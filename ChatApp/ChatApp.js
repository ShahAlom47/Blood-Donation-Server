const { Admin } = require('mongodb');
const { getChatCollection } = require('../utils/AllDB_Collections/ChatCollection');
const chatCollection = getChatCollection();

const socketHandler = (io) => {
    io.on('connection', (socket) => {

        // Join event handle
        socket.on('join', async ({userEmail,userRole}) => {
            const userChat = await chatCollection.findOne({ userEmail: userEmail });
            if (userChat) {
                userRole==='admin'?
                socket.emit('adminMessage', userChat.messages || [])
                :
                socket.emit('userMessage', userChat.messages || [])
            }
        });


        // for Admin msg 


        socket.on('sendAdminMessage', async (msgData) => {
            const { userEmail,userName, userRole,receiverEmail, newMessage } = msgData;

            const adminNewMsg = {
                senderEmail: userEmail,
                senderName:userName,
                timestamp: new Date(),
                isRead: false,
                message: newMessage
            }


            const findReceiverUser = await chatCollection.findOne({ userEmail: receiverEmail });
            if(findReceiverUser){
                await chatCollection.updateOne(
                    { userEmail: receiverEmail },
                    { $push: { messages: adminNewMsg } }
                );
            }
            const sendReceiverUserMsg = await chatCollection.findOne({ userEmail: receiverEmail });
                io.emit('adminMessage', sendReceiverUserMsg?.messages)
                io.emit('userMessage', sendReceiverUserMsg?.messages)
        });

        // for user msh 
        socket.on('message', async (msgData) => {
            const { userEmail,userName, userRole, message } = msgData;

            const newMsg = {
                senderEmail: userEmail,
                senderName:userName,
                timestamp: new Date(),
                isRead: false,
                message: message
            }

            if (userRole === 'user') {
                const existingUser = await chatCollection.findOne({ userEmail: userEmail });

                if (!existingUser) {
                    await chatCollection.insertOne({
                        userEmail: userEmail,
                        userName:userName,
                        lastMessage: new Date(),
                        messages: [newMsg]
                    });
                    const newUserMsg = await chatCollection.findOne({ userEmail: userEmail });
                    socket.emit('adminMessage', newUserMsg?.messages || []);
                    return;
                }

                await chatCollection.updateOne(
                    { userEmail: userEmail },
                    { $push: { messages: newMsg } }
                );
                const existingUserMsg = await chatCollection.findOne({ userEmail: userEmail });
                io.emit('adminMessage', existingUserMsg?.messages || []); // Emit to all connected clients
            }
        });




        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;


module.exports = socketHandler;
