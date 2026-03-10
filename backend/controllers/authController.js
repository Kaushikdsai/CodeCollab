const bcrypt=require("bcrypt");
const jwt=require('jsonwebtoken');
const User=require("../models/User");

exports.register=async (req,res) => {
    const { name,email,password }=req.body;

    const existing=await User.findOne({ email: email });
    if(existing){
        return res.status(400).json({ message:"User exists" });
    }

    const hashedPassword=await bcrypt.hash(password,10);
    
    const user=await User.create({
        name,email,passwordHash
    });

    res.json({ message:"User created" });
};


exports.login=async (req,res) => {
    const { email,password }=req.body;

    const user=await User.findOne({ email: email });
    if(!user){
        res.status(401).json({ message:"Invalid credentials"});
    }

    const isMatch=bcrypt.compare(password,User.passwordHash);
    if(!isMatch){
        res.status(401).json({ message:"Invalid credentials" });
    }

    const token=jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};