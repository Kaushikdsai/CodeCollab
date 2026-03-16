require("dotenv").config();
const mongoose=require("mongoose");
const express=require("express");
const http=require("http");
const { Server }=require("socket.io");
const cors=require("cors");
const runRoute=require("./routes/run");
const Room=require("./models/Room");
const authRoutes=require("./routes/auth");
const authMiddleware=require("./middleware/authMiddleware");
const rateLimitMiddleware=require("./middleware/rateLimitMiddleware");
const jwt=require("jsonwebtoken");
const redis=require("./config/redis");
require("./services/roomPersistence");

const app=express();
app.use(cors());
app.use(express.json());
app.use("/api",rateLimitMiddleware);
app.use("/api/auth",authRoutes);
app.use(authMiddleware);
app.use("/api/run",runRoute);

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
    },
});

redis.on("connect",()=>{
    console.log("Connected to Redis");
});

redis.on("error",(err)=>{
    console.error("Redis error:",err);
});

app.set("io",io);

io.use((socket,next)=>{
    const token=socket.handshake.auth.token;

    if(!token){
        return next(new Error("Unauthorized"));
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        socket.user=decoded;
        next();
    }
    catch(err){
        next(new Error("Unauthorized"));
    }
});

io.on("connection",(socket)=>{
    console.log("User connected: ",socket.id);

    socket.on("join-room",async({ roomId,name })=>{

        socket.join(roomId);
        socket.roomId=roomId;

        console.log(`User ${socket.id} joined room ${roomId}`);

        let code=await redis.get(`room:${roomId}:code`);
        let room=await Room.findOne({ roomId });

        if(!code){
            code=(room?.currentCode || "");
            await redis.set(`room:${roomId}:code`,code);
        }

        if(!room){
            room=await Room.create({
                roomId,
                currentCode:code
            });
        }

        socket.emit("code-update",code);

        const participant={
            socketId:socket.id,
            userId:socket.user.userId,
            name
        };

        const sockets=await io.in(roomId).fetchSockets();
        if(sockets.length===1){
            await redis.del(`room:${roomId}:participants`);
        }

        // prevent duplicate participants for same user
        const participantsRaw=await redis.smembers(`room:${roomId}:participants`);
        for(const p of participantsRaw){
            const parsed=JSON.parse(p);
            if(parsed.userId===socket.user.userId){
                await redis.srem(`room:${roomId}:participants`,p);
            }
        }

        await redis.sadd(`room:${roomId}:participants`,JSON.stringify(participant));

        await redis.expire(`room:${roomId}:participants`,3600);

        const updatedRaw=await redis.smembers(`room:${roomId}:participants`);
        const participants=updatedRaw.map(p=>JSON.parse(p));

        // store historical participants in MongoDB
        await Room.findOneAndUpdate(
            { roomId },
            {
                $addToSet:{
                    participants:{
                        userId:socket.user.userId,
                        name,
                        joinedAt:new Date()
                    }
                }
            }
        );

        io.to(roomId).emit("participants-update",participants);
    });

    socket.on("code-change",async({ roomId,code })=>{
        console.log("Code change received from:",socket.id);
        console.log("Room:",roomId);

        await redis.set(`room:${roomId}:code`,code,"EX",3600);

        const storedCode=await redis.get(`room:${roomId}:code`);
        console.log("Redis stored code:",storedCode);

        socket.to(roomId).emit("code-update",code);
    });

    socket.on("disconnect",async()=>{
        console.log("User disconnected: ",socket.id);

        const roomId=socket.roomId;
        if(!roomId) return;

        const participantsRaw=await redis.smembers(`room:${roomId}:participants`);

        for(const p of participantsRaw){
            const parsed=JSON.parse(p);

            if(parsed.socketId===socket.id){
                await redis.srem(`room:${roomId}:participants`,p);
            }
        }

        const updatedRaw=await redis.smembers(`room:${roomId}:participants`);
        const updatedParticipants=updatedRaw.map(p=>JSON.parse(p));

        io.to(roomId).emit("participants-update",updatedParticipants);
    });
});

mongoose.connect(process.env.MONGO_URI,{
    maxPoolSize:10,
    minPoolSize:2
})
.then(()=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.error("MongoDB connection error:",err);
});

server.listen(5000,()=>{
    console.log("Server running on port 5000");
});