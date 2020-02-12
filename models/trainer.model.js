const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const trainerSchema = Schema({
    username: {
        type: String,
        required: true,
        index: true, // helps us to find by username, note that this has a significant production impact
        unique: true,
        minlength: 3,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    firstName: String,
    lastName: String,
    salutation: {
        type: String,
        enum: ["Dr", "Mr", "Mrs", "Ms", "Miss", "Mdm"],
    },
})

trainerSchema.virtual("fullName").get(function () {
    return `${this.salutation} ${this.firstName} ${this.lastName}`;
});

trainerSchema.virtual("reverseName").get(function () {
    return `${this.lastName}, ${this.firstName}`;
});

trainerSchema.pre("save", async function (next) {
    const rounds = 10;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
});

const Trainer = mongoose.model("Trainer", trainerSchema);

module.exports = Trainer