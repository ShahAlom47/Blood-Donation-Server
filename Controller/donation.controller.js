
const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");
const { getUserCollection } = require("../utils/AllDB_Collections/userCollection");



const donationCollection = db.collection('donation')
const notificationCollection = getNotificationCollection()
const usersCollection= getUserCollection()


// Blood request 

const addBloodRequest = async (req, res) => {
    const data = req.body;
    const response = await donationCollection.insertOne(data)
    return res.send(response)

}

// get blood request data 

const getBloodRequest = async (req, res) => {
    const { page = 1, limit = 8 } = req.query;

    try {
        const response = await donationCollection.find()
            .sort({ requireDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .toArray();

        const total = await donationCollection.countDocuments();

        return res.send({
            data: response,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
};


const updateDonationRequest = async (req, res) => {
    const data = req.body;
    const id = data.id;
    const donorInfo = {
        donorName: data.donorName,
        donorEmail: data.donorEmail,
    };
    const status = data.status;
    const notificationData = data.notificationData;

    try {
        const donationRequest = await donationCollection.findOne({ _id: new ObjectId(id) });

        if (!donationRequest) {
            return res.send({ success: false, message: 'Donation request not found' });
        }

        const donorExists = donationRequest.donors.some(donor => donor.donorEmail === donorInfo.donorEmail);

        if (donorExists) {
            return res.send({ success: false, message: 'You Already Accept this Request' });
        }

        const updateFields = {
            $push: { donors: donorInfo },
            $set: { status: status }
        };

        const updateRequest = await donationCollection.updateOne(
            { _id: new ObjectId(id) },
            updateFields
        );

        const notification = {
            ...notificationData,
            timestamp: new Date(),
        };

        await notificationCollection.insertOne(notification);

      
        req.io.to(notificationData.requesterEmail).emit('notification', notification);

        console.log(data);
        return res.send({ success: true, message: 'Thank you for volunteering to donate blood!', data: data });
    } catch (error) {
        console.error('Error updating donation request:', error);
        return res.status(500).send({ success: false, error: 'Failed to update donation request' });
    }
};

//  get all user request 
const getUserAllRequest = async (req, res) => {
    const email = req.params.email
    const query = { userEmail: email }
    const result = await donationCollection.find(query).toArray()
    return res.send(result)
}

// confirm request 
const updateRequestConfirm = async (req, res) => {
    const id = req.params.id;
    const ConfirmedDonorData = req.body;
    const donorEmail = ConfirmedDonorData.donorEmail;

    const query = { _id: new ObjectId(id) };
    const update = {
        $set: {
            status: 'Complete',
            ConfirmedDonorData: ConfirmedDonorData
        }
    };

    try {
        const result = await donationCollection.updateOne(query, update);
        if (result.modifiedCount > 0) {
            const userQuery = { email: donorEmail };
            const dateUpdate = {
                $set: {
                    lastDonate: new Date().toLocaleDateString()
                }
            };
            
            const userDonateDateUpdate = await usersCollection.updateOne(userQuery, dateUpdate);
            
            if (userDonateDateUpdate.modifiedCount > 0) {
                res.send({ status: true, message: 'Request and user donation date updated successfully', id });
            } else {
                res.send({ status: true, message: 'Request updated successfully, but user donation date not found', id });
            }
        } else {
            res.send({ message: 'Request not found' });
        }
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).send({ message: 'Error updating request' });
    }
};


//   all user request 
const getAdminAllRequest = async (req, res) => {

    const { page = 1, limit = 8 } = req.query;

    try {
        const response = await donationCollection.find()
            .sort({ requestDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .toArray();

        const total = await donationCollection.countDocuments();

        return res.send({
            data: response,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
};



// delete blood request 
const deleteBloodRequest = async (req, res) => {
    const id = req.params.id;
    const result =await donationCollection.deleteOne({_id: new ObjectId(id)})
    return res.send(result)
}



module.exports = {
    addBloodRequest,
    getBloodRequest,
    updateDonationRequest,
    getUserAllRequest,
    updateRequestConfirm,
    getAdminAllRequest,
    deleteBloodRequest,

}