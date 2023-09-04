import mongoose from "mongoose";


const ApprovalSchema = new mongoose.Schema({
    req_type: {
        type: String,
    },
    req_by: {
        type: String,
    },
    checked_by: {
        type: String,
        default: "None"
    },
    is_rejected: {
        type: Boolean,
        default: false
    },
    



    name: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
    },


    
    id: {
        type: String,
    },
}, {
    timestamps: true
});

module.exports = mongoose.models.Approval || mongoose.model("Approval", ApprovalSchema);
