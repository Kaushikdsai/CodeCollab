const redis=require("../config/redis");
const Room=require("../models/Room");

async function persistRooms(){
    const keys=await redis.keys("room:*:code");
    for(const key of keys){
        const roomId=key.split(":")[1];
        const code=await redis.get(key);
        await Room.updateOne(
            { roomId },
            { currentCode: code, lastActive: new Date() }
        );
    }
}

setInterval(persistRooms, 5000);
