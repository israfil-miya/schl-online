import mongoose from "mongoose";


let NoticeSchema = new mongoose.Schema({
    channel: {
        type: String,
        required: true
    },
    notice_no: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    file_name: {
        type: String,
        required: true
    }
}, { timestamps: true, __v: false });

module.exports = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);