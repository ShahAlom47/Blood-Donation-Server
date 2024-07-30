
const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");



const donationCollection = db.collection('donation')
const notificationCollection=getNotificationCollection()


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

        // Emit notification to the requester
        req.io.to(notificationData.requesterEmail).emit('notification', notification);

        console.log(data);
        return res.send({ success: true, message: 'Thank you for volunteering to donate blood!', data: data });
    } catch (error) {
        console.error('Error updating donation request:', error);
        return res.status(500).send({ success: false, error: 'Failed to update donation request' });
    }
};



module.exports = {
    addBloodRequest,
    getBloodRequest,
    updateDonationRequest,

}