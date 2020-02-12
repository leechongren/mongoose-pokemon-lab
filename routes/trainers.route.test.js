const request = require("supertest")
const app = require("../app")
const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server");

const jwt = require("jsonwebtoken")
jest.mock("jsonwebtoken")

const Trainer = require("../models/trainer.model")

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

describe('/', () => {
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
        const trainerData = [
            {
                username: "ash1",
                password: "iWannaB3DVeryBest",
            },
            {
                username: "ash2",
                password: "iWannaB3DVeryBest",
            },
        ];
        await Trainer.create(trainerData);
    });

    afterEach(async () => {
        jest.resetAllMocks()
        await Trainer.deleteMany();
    });

    describe('/trainers', () => {
        test("POST should create a new trainer", async () => {
            const { body: trainer } = await request(app)
                .post("/trainers/register")
                .send({
                    username: "ash3",
                    password: "iWannaB3DVeryBest"
                })
                .expect(201)
            expect(trainer.username).toBe("ash3")
            expect(trainer.password).not.toBe("iWannaB3DVeryBest")
        })

        // it("POST should not add a new user when password is less than 8", async () => {
        //     const wrongTrainer = {
        //         username: "wrongTrainer",
        //         password: 1234567
        //     }
        //     const { body: error } = await request(app)
        //         .post("/trainers/register")
        //         .send(wrongTrainer)
        //         .expect(404)
        //     expect(error.error).toContain("")
        // })


        test("GET should respond with correct trainer details when correct trainer", async () => {
            const expectedTrainer = {
                username: "ash1"
            }
            jwt.verify.mockReturnValueOnce({ name: expectedTrainer.username })
            const { body: trainer } = await request(app)
                .get(`/trainers/${expectedTrainer.username}`)
                .set("Cookie", "token=valid-token")
                .expect(200)
            expect(jwt.verify).toHaveBeenCalledTimes(1)
            expect(trainer[0]).toMatchObject(expectedTrainer)

        })

        test("GET should respond with incorrect trainer message when wrong trainer log in", async () => {
            const wrongTrainer = {
                username: "ash1"
            }
            jwt.verify.mockReturnValueOnce({ name: wrongTrainer.username })
            const { body: error } = await request(app)
                .get("/trainers/ash2")
                .set("Cookie", "token=valid-token")
                .expect(403);
            expect(jwt.verify).toHaveBeenCalledTimes(1)
            expect(error).toEqual({ error: "Incorrect user!" })
        })

        it("GET should deny access when there are no token", async () => {
            const { body: error } = await request(app)
                .get("/trainers/ash2")
                .expect(401)
            expect(jwt.verify).not.toHaveBeenCalled()
            expect(error.error).toEqual("You are not authorized")
        })
    })
    describe('/trainers/login', () => {
        it("should login when password is correct", async () => {
            const correctTrainer = {
                username: "ash2",
                password: "iWannaB3DVeryBest"
            }

            const { text: message } = await request(app)
                .post("/trainers/login")
                .send(correctTrainer)
                .expect(200)
            expect(message).toEqual("You are now logged in!")
        })

        it("should not login when password is wrong", async () => {
            const wrongTrainer = {
                username: "ash2",
                password: "iWannaB3DVeryBst"
            }
            const { body: message } = await request(app)
                .post("/trainers/login")
                .send(wrongTrainer)
                .expect(400)
            expect(message.error).toEqual("Login failed")
        })

        it("GET should deny access when token is invalid", async () => {
            const errorMessage = "your token is invalid"
            jwt.verify.mockImplementationOnce(() => {
                throw new Error(errorMessage)
            })

            const { body: error } = await request(app)
                .get("/trainers/ash2")
                .set("Cookie", "token=wrong-token")
                .expect(401)

            expect(jwt.verify).toHaveBeenCalledTimes(1)
            expect(error.error).toEqual(errorMessage)
        })


    })
})
