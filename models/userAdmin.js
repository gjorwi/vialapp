const mongoose = require('mongoose');

const userAdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('UserAdmin', userAdminSchema);
