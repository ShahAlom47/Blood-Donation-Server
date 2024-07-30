const { getBloodBankCollection } = require("../utils/AllDB_Collections/BloodBankCollection");


const bloodBankCollection=getBloodBankCollection()


const addBloodDonor =async (req,res)=>{
    const data=req.body;
    const result = await bloodBankCollection.insertOne(data)
    res.send(result)
}


module.exports={

    addBloodDonor,
}