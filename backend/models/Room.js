const mongoose=require("mongoose");

const participantSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    name: String,
    role: {
        type: String,
        enum: ["creator", "editor", "viewer"],
        default: "editor"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
},
{ _id: false }
);

const roomSchema = new mongoose.Schema(
{
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    participants: [participantSchema],

    language: {
        type: String,
        enum: ["java","python","cpp","javascript"],
        default: "java"
    },

    currentCode: {
        type: String,
        default: ""
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastActive: {
        type: Date,
        default: Date.now
    }

},
{ timestamps: true }
);

module.exports=mongoose.model("Room", roomSchema);