const express = require("express");
const app = express();

const Pokemon = require("./models/pokemon.model");

app.use(express.json())

app.get("/", (req, res) => {
    res.send({
        "0": "GET    /",
        "1": "GET   /pokemons",
        "2": "GET   /pokemons?name=pokemonNameNotExact",
        "3": "POST    /pokemons",
        "4": "GET /pokemons/:id",
        "5": "PUT /pokemons/:id",
        "6": "PATCH /pokemons/:id",
        "7": "DELETE /pokemons/:id"
    });
});


const findAll = async () => {
    const foundPokemons = await Pokemon.find();
    return foundPokemons;
};

const findPokemonsByName = async (pokemonName) => {
    const regex = new RegExp(pokemonName, "gi");
    const pokemons = await Pokemon.find({ name: regex })
    return pokemons;
}

app.get("/pokemons", async (req, res) => {
    if (req.query.name) {
        const pokemons = await findPokemonsByName(req.query.name)
        res.send(pokemons)
    } else {
        const pokemons = await findAll()
        res.send(pokemons);
    }
});


const requireJsonContent = (req, res, next) => {
    if (req.headers["content-type"] !== "application/json") {
        res.status(400).send("Server wants application/json!");
    } else {
        next();
    }
};

app.post("/pokemons", requireJsonContent, async (req, res) => {
    const pokemon = new Pokemon(req.body)
    await Pokemon.init() //make sure the index are done building
    const newPokemon = await pokemon.save()
    res.status(200).send(newPokemon)
})


app.get("/pokemons/:id", async (req, res) => {
    const findByPokemonId = await Pokemon.find({ id: req.params.id })
    res.status(200).json(findByPokemonId)
})

app.put("/pokemons/:id", async (req, res) => {
    const pokemonIdToReplace = String(req.params.id)
    const pokemonToReplace = req.body
    const replacePokemon = await Pokemon.findOneAndReplace({ id: pokemonIdToReplace }, pokemonToReplace, { new: true })
    res.status(200).json(replacePokemon)
})

app.patch("/pokemons/:id", async (req, res) => {
    const pokmonIdToUpdate = { id: String(req.params.id) }
    const pokemonStatsToUpdate = req.body
    const patchPokemon = await Pokemon.findOneAndUpdate(pokmonIdToUpdate, pokemonStatsToUpdate, { new: true })
    res.status(200).json(patchPokemon)
})

app.delete("/pokemons/:id", async (req, res) => {
    const pokemonIdToDelete = { id: String(req.params.id) }
    const pokemonToDelete = await Pokemon.findOneAndDelete(pokemonIdToDelete)
    res.status(200).send(pokemonToDelete)
})












// findAll().then(data => console.log(data))

module.exports = app