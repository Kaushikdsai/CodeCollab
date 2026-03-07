const mongoose=require("mongoose");

const participantSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
        unique: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    participants: [participantSchema],

    language: {
        type: String,
        enum: ["java","python","cpp"],
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