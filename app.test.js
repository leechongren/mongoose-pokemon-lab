const request = require("supertest");
const app = require("./app");
const Pokemon = require("./models/pokemon.model");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken")

jest.mock("jsonwebtoken")

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

describe("pokemons", () => {
    let mongoServer
    beforeAll(async () => {
        try {
            mongoServer = new MongoMemoryServer()
            const mongoUri = await mongoServer.getConnectionString();
            await mongoose.connect(mongoUri);
        } catch (err) {
            console.error(err);
        }
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        const pokemonData = [
            {
                id: 1,
                name: "Pikachu",
                japaneseName: "ピカチュウ",
                baseHP: 35,
                category: "Mouse Pokemon",
            },
            {
                id: 2,
                name: "Squirtle",
                japaneseName: "ゼニガメ",
                baseHP: 44,
                category: "Tiny Turtle Pokemon",
            },
        ];
        await Pokemon.create(pokemonData);
    });

    afterEach(async () => {
        jest.resetAllMocks();
        await Pokemon.deleteMany();
    });

    describe("/app", () => {
        test("GET should respond with all Pokemons", async () => {
            const expectedPokemonData = [
                {
                    id: 1,
                    name: "Pikachu",
                    japaneseName: "ピカチュウ",
                    baseHP: 35,
                    category: "Mouse Pokemon",
                },
                {
                    id: 2,
                    name: "Squirtle",
                    japaneseName: "ゼニガメ",
                    baseHP: 44,
                    category: "Tiny Turtle Pokemon",
                },
            ];
            const { body: actualPokemons } = await request(app)
                .get("/pokemons")
                .expect(200);
            actualPokemons.sort((a, b) => a.id > b.id)
            expect(actualPokemons).toMatchObject(expectedPokemonData);
        })

        test("GET should return the filtered pokemon name", async () => {
            const expectedPokemonData = [
                {
                    id: 2,
                    name: "Squirtle",
                    japaneseName: "ゼニガメ",
                    baseHP: 44,
                    category: "Tiny Turtle Pokemon",
                },
            ];

            const { body: actualPokemons } = await request(app)
                .get("/pokemons?name=Sq")
                .expect(200);
            expect(actualPokemons).toMatchObject(expectedPokemonData);
        })

        test("GET should return the pokemon id", async () => {
            jwt.verify.mockReturnValueOnce({})
            const expectedPokemonData = [
                {
                    id: 2,
                    name: "Squirtle",
                    japaneseName: "ゼニガメ",
                    baseHP: 44,
                    category: "Tiny Turtle Pokemon",
                },
            ];

            const { body: actualPokemons } = await request(app)
                .get("/pokemons/2")
                .set("Cookie", "token=valid-token")
                .expect(200)
            expect(actualPokemons).toMatchObject(expectedPokemonData)
        })

        // test("PUT should return with error 404 when reuired name was not given", async () => {
        //     const errorPokemon = {
        //         id: 2
        //     }
        //     const body = await request(app)
        //         .put(`/pokemons/${errorPokemon.id}`)
        //         .send(errorPokemon)
        //         .expect(400)
        // })
    })


})