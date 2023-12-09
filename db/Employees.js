import mongoose from "mongoose";
const EmployeeSchema = new mongoose.Schema({
    e_id: {
        type: String,
    },
    real_name: {
        type: String,
    },
    joining_date: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },

    birth_date: {
        type: String,
    },
    nid: {
        type: Number,
    },
    blood_group: {
        type: String,
    },
    designation: {
        type: String,
    },
    department: {
        type: String,
    },
    base_salary: {
        type: Number,
    },
    bonus_eid_ul_fitr: {
        type: String,
        default: function () {
            return this.base_salary / 2;
        }
    },
    bonus_eid_ul_adha: {
        type: String,
        default: function () {
            return this.base_salary / 2;
        }
    },
    note: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
