const express=require("express");
const router=express.Router();
const { executeJava }=require("../services/executionService");

router.post("/", async(req,res) => {
    const { code }=req.body;
    console.log(code);
    const result=await executeJava(code);
    res.json(result);
});

router.get("/", async (req,res) => {
    res.json("hi");
})

module.exports=router;