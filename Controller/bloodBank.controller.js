const { getBloodBankCollection } = require("../utils/AllDB_Collections/BloodBankCollection");


const bloodBankCollection=getBloodBankCollection()


const addBloodDonor =async (req,res)=>{
    const data=req.body;
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





module.exports={

    addBloodDonor,
    getBloodGroupSummary,
}