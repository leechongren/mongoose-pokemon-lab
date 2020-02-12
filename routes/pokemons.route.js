const express = require("express")
const router = express.Router()
const Pokemon = require("../models/pokemon.model");
const { protectRoute } = require("../middlewares/auth")

const findPokemonsByName = async (pokemonName) => {
    const regex = new RegExp(pokemonName, "gi");
    const pokemons = await Pokemon.find({ name: regex })
    return pokemons;
}

router.get("/", async (req, res) => {
    if (req.query.name) {
        const pokemons = await findPokemonsByName(req.query.name)
        res.send(pokemons)
    } else {
        const pokemons = await Pokemon.find()
        res.send(pokemons);
    }
});

router.get("/:id", protectRoute, async (req, res) => {
    const findByPokemonId = await Pokemon.find({ id: req.params.id })
    res.status(200).json(findByPokemonId)
})

const requireJsonContent = (req, res, next) => {
    if (req.headers["content-type"] !== "application/json") {
        res.status(400).send("Server wants application/json!");
    } else {
        next();
    }
};

router.post("/", requireJsonContent, async (req, res) => {
    const pokemon = new Pokemon(req.body)
    await Pokemon.init() //make sure the index are done building
    const newPokemon = await pokemon.save()
    res.status(200).send(newPokemon)
})

router.put("/:id", async (req, res) => {
    const pokemonIdToReplace = String(req.params.id)
    const pokemonToReplace = req.body
    const replacePokemon = await Pokemon.findOneAndReplace({ id: pokemonIdToReplace }, pokemonToReplace, { new: true })
    res.status(200).json(replacePokemon)
})

router.patch("/:id", async (req, res) => {
    const pokmonIdToUpdate = { id: String(req.params.id) }
    const pokemonStatsToUpdate = req.body
    const patchPokemon = await Pokemon.findOneAndUpdate(pokmonIdToUpdate, pokemonStatsToUpdate, { new: true })
    res.status(200).json(patchPokemon)
})

router.delete("/:id", async (req, res) => {
    const pokemonIdToDelete = { id: String(req.params.id) }
    const pokemonToDelete = await Pokemon.findOneAndDelete(pokemonIdToDelete)
    res.status(200).send(pokemonToDelete)
})


router.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        err.code = 400;
    } else if (err.name === "MongoError") {
        err.code = 422;
    }
    next(err)
})

module.exports = router