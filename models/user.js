const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userShema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    rol: { type: String, required: true, default: "default" },
    password: { type: String, required: true }
});

const Users = module.exports = mongoose.model("Users", userShema);