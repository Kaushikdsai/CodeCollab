const express=require("express");
const router=express.Router();
const Room=require("../models/Room");

router.post("/save",async(req,res)=>{
    try{
        const { roomId,code }=req.body;

        await Room.findOneAndUpdate(
            { roomId },
            { currentCode:code },
            { upsert:true }
        );

        res.json({ success:true });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error:"Save failed" });
    }
});

router.get("/:roomId",async(req,res)=>{
    try{
        const room=await Room.findOne({ roomId });
        res.json({ code:room?.currentCode || "" });
    }
    catch(err){
        res.status(500).json({ error:"Fetch failed" });
    }
});

module.exports=router;