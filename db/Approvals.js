import mongoose from "mongoose";


const ApprovalSchema = new mongoose.Schema({
    req_type: {
        type: String,
    },
    req_approved: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
    },
    client_code: {
        type: String,
    },
    client_name: {
        type: String,
    },
    folder: {
        type: String,
    },
    quantity: {
        type: Number,
    },

    download_date: {
        type: String,
    },
    delivery_date: {
        type: String,
    },
    delivery_bd_time: {
        type: String,
    },
    task: {
        type: String,
    },
    et: {
        type: Number,
    },
    production: {
        type: String,
    },
    qc1: {
        type: Number,
    },
    comment: {
        type: String,
    },
    status: {
        type: String,
    },
});

module.exports = mongoose.models.Approval || mongoose.model("Approval", ApprovalSchema);
