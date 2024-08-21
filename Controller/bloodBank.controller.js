const { ObjectId } = require("mongodb");
const { getBloodBankCollection } = require("../utils/AllDB_Collections/BloodBankCollection");
const { addNotification } = require("./notification.controller");
const { query } = require("express");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");


const bloodBankCollection = getBloodBankCollection()
const notificationCollection= getNotificationCollection()


const addBloodDonor = async (req, res) => {
    const data = req.body;
    const result = await bloodBankCollection.insertOne(data)
    res.send(result)
}
//    get all Blood Bank Data 

const getAllBloodBankData = async (req, res) => {
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const pipeline = [
            {
                $addFields: {
                    priority: {
                        $cond: [{ $eq: ["$status", "Requested"] }, 1, 2]
                    }
                }
            },
            {
                $sort: {
                    priority: 1,
                    timestamp: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            }
        ];


        const response = await bloodBankCollection.aggregate(pipeline).toArray();

        const total = await bloodBankCollection.countDocuments();

        return res.send({
            data: response,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
   
        return res.status(500).send('Server Error',error);
    }
};

//  get user blood bank data 

const getUserBloodBankRequest = async (req, res) => {
    const email = req.params.email;

    const result = await bloodBankCollection.find({
        "requester": {
            $elemMatch: { "requesterEmail": email }
        }
    }).toArray();

    res.send(result);
}



const getBloodGroupSummary = async (req, res) => {
    try {
        const result = await bloodBankCollection.aggregate([
            {
                $match: {
                    status: { $ne: 'Complete' }
                }
            },

            {
                $group: {
                    _id: "$bloodGroup",
                    totalDonors: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "donor"] }, 1, 0]
                        }
                    },
                    totalBloodBags: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "blood"] }, 1, 0]
                        }
                    }
                }
            },

            {
                $addFields: {
                    totalAvailable: {
                        $add: ["$totalDonors", "$totalBloodBags"]
                    }
                }
            },


            {
                $project: {
                    bloodGroup: "$_id",
                    totalDonors: 1,
                    totalBloodBags: 1,
                    totalAvailable: 1,
                    _id: 0
                }
            }
        ]).toArray();

        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching blood group summary', error });
    }
}



const getBloodGroupData = async (req, res) => {
    const group = req.params.group;
    const result = await bloodBankCollection.find({
         bloodGroup:group ,
         status:{$ne:"completed"}
        
        }).toArray()


    return res.send(result)
}



const updateBloodBankDataState = async (req, res) => {
    const id = req.params.id;
    const { notificationData, status } = req.body;

    const requesterData = {
        requesterEmail: notificationData?.requesterEmail,
        requesterPhone: notificationData?.requesterPhone,
    };
   

    try {
        const query = { _id: new ObjectId(id) };

       
        const existingDocument = await bloodBankCollection.findOne(query);
        if (existingDocument && existingDocument.requester.some(r => r.requesterEmail === requesterData.requesterEmail)) {
            return res.send({ status: false, message: 'Requester Exist' });
        }

        // Update the status
        const updateData = {
            $set: {
                status: status,
            },
            $push: {
                requester: requesterData 
            }
        };

        const updateResponse = await bloodBankCollection.updateOne(query, updateData);

        if (updateResponse.modifiedCount > 0) {
            const notificationResponse = await addNotification(notificationData);
            return res.send({ status: true, message: 'Status updated and notification added successfully' });
        }

        return res.send({ status: false, message: 'Status update failed' });

    } catch (error) {
        res.status(500).send('Internal Server Error',error);
    }
};



// delete Blood Request 

const deleteBloodBankData = async (req, res) => {
    const id = req.params.id;
    try {
        const query = { _id: new ObjectId(id) }
        const response = await bloodBankCollection.deleteOne(query)
  
        return res.send(response)
    }



    catch (error) {
    res.status(500).send('Internal Server Error');
}
}


// reject Request 

const rejectBloodBankRequest = async (req, res) => {
    const id = req.params.id;
    const notificationData  = req.body;
    const requesterEmail=notificationData?.requesterEmail;

    try {
        const query = { _id: new ObjectId(id) };
        const bloodBankData = await bloodBankCollection.findOne(query);

        if (!bloodBankData) {
            return res.status(404).send('Blood request not found');
        }

        const updatedRequesters = bloodBankData.requester.filter(
            requester => requester.requesterEmail !== requesterEmail
        );

        let updateFields = {
            requester: updatedRequesters
        };

        if (updatedRequesters.length === 0) {
            updateFields.status = 'Available';
        }

        const updateResult = await bloodBankCollection.updateOne(query, { $set: updateFields });

        if (updateResult.modifiedCount === 0) {
            return res.status(500).send('Failed to update blood bank data');
        }

        const notificationResult = await notificationCollection.insertOne(notificationData);

        if (!notificationResult.insertedId) {
            return res.status(500).send('Failed to insert notification');
        }

        return res.status(200).send({
            status:true,
            message: 'Blood request updated and notification sent successfully',
            updateResult,
            notificationResult
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};

// accept  request 


const acceptBloodBankRequest = async (req, res) => {
    const id = req.params.id;
    const { requesterEmail } = req.body;

    try {
        const query = { _id: new ObjectId(id) };
        const bloodBankData = await bloodBankCollection.findOne(query);

        if (!bloodBankData) {
            return res.status(404).send('Blood bank data not found');
        }

        bloodBankData.status = 'Accepted';
        const requester = bloodBankData.requester.find(
            req => req.requesterEmail === requesterEmail
        );

        if (requester) {
            requester.status = 'selected';
        }

        const updateResult = await bloodBankCollection.replaceOne(query, bloodBankData);

        return res.status(200).send({
            status: true,
            message: 'Blood request accepted and status updated successfully',
            updateResult
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};


// cancel user blood bank request 

const cancelUserBloodBankRequest = async (req, res) => {
    const id = req.params.id; 
    const { requesterEmail } = req.body; 
    const query = { _id: new ObjectId(id) };

    try {
        
        const bloodBankData = await bloodBankCollection.findOne(query);

        if (!bloodBankData) {
            return res.status(404).send('Blood bank data not found');
        }

        const selectedRequester = bloodBankData.requester.find(
            req => req.requesterEmail === requesterEmail && req.status === 'selected'
        );

        if (selectedRequester) {
            bloodBankData.status = 'Requested';
        }

        bloodBankData.requester = bloodBankData.requester.filter(
            req => req.requesterEmail !== requesterEmail
        );

        if (bloodBankData.requester.length === 0) {
            bloodBankData.status = 'Available';
        }

        const result = await bloodBankCollection.replaceOne(query, bloodBankData);

        return res.send({
            status: true,
            message: 'Request Cancelled',
            result
        });

    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};


// complete donation 


const completeUserBloodBankRequest = async (req, res) => {
    const id = req.params.id;
    const { requesterEmail } = req.body;

    try {
        const query = { _id: new ObjectId(id) };
        const update = {
            $set: {
                "requester.$[elem].status": "completed", 
                status: "completed" 
            }
        };
        const arrayFilters = [{ "elem.requesterEmail": requesterEmail }]; 

    
        const result = await bloodBankCollection.updateOne(
            query,
            update,
            { arrayFilters } 
        );


        if (result.modifiedCount > 0) {
            res.status(200).send({status:true,message:'Request completed successfully'});
        } else {
            res.status(404).send('No matching request found');
        }
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).send('Internal Server Error');
    }
}





module.exports = {
    getAllBloodBankData,
    getUserBloodBankRequest,
    addBloodDonor,
    getBloodGroupSummary,
    getBloodGroupData,
    updateBloodBankDataState,
    deleteBloodBankData,
    rejectBloodBankRequest,
    acceptBloodBankRequest,
    cancelUserBloodBankRequest,
    completeUserBloodBankRequest,
}