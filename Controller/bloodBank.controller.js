const { ObjectId } = require("mongodb");
const { getBloodBankCollection } = require("../utils/AllDB_Collections/BloodBankCollection");
const { addNotification } = require("./notification.controller");


const bloodBankCollection = getBloodBankCollection()


const addBloodDonor = async (req, res) => {
    const data = req.body;
    const result = await bloodBankCollection.insertOne(data)
    res.send(result)
}

const getBloodGroupSummary = async (req, res) => {
    try {
        const result = await bloodBankCollection.aggregate([
            { $match: { status: 'Available' } },
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
                    totalAvailable: { $sum: ["$totalDonors", "$totalBloodBags"] }
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
    const result = await bloodBankCollection.find({ bloodGroup: group }).toArray()


    return res.send(result)
}



const updateBloodBankDataState = async (req, res) => {
    const id = req.params.id;
    const { notificationData, status } = req.body;

    try {
        const query = { _id: new ObjectId(id) };
        const updateData = {
            $set: {
                status: status,
            }
        };

        const updateResponse = await bloodBankCollection.updateOne(query, updateData);

        if (updateResponse.modifiedCount > 0) {
            const notificationResponse = await addNotification(notificationData);
       
            
            return res.send({ status: true, message: 'Status updated and notification added successfully' });
        }

        return res.send({ status: false, message: 'Status update failed' });

    } catch (error) {
        console.error('Error updating blood bank data and adding notification:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {

    addBloodDonor,
    getBloodGroupSummary,
    getBloodGroupData,
    updateBloodBankDataState,
}