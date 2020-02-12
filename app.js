const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json())

const trainersRouter = require("./routes/trainers.route")
const pokemonsRouter = require("./routes/pokemons.route")

app.use("/trainers", trainersRouter)
app.use("/pokemons", pokemonsRouter)

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

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500)
    console.log(err)
    if (err.statusCode) {
        res.send({ error: err.message })
    } else {
        res.send({ error: "internal server error" })
    }
})




module.exports = app