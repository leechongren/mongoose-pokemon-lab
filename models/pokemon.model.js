const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pokemonSchema = Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    japaneseName: String,
    baseHP: Number,
    category: String,
})

const Pokemon = mongoose.model("Pokemon", pokemonSchema)

module.exports = Pokemon