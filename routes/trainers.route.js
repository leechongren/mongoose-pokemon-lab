const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const Trainer = require("../models/trainer.model")
const bcrypt = require("bcryptjs");
const { protectRoute } = require("../middlewares/auth")

router.post("/register", async (req, res, next) => {
    try {
        const trainer = new Trainer(req.body);
        await Trainer.init();
        const newTrainer = await trainer.save();
        res.status(201).send(newTrainer);
    } catch (err) {
        next(err);
    }
});



router.get("/:username", protectRoute, async (req, res, next) => {
    const INCORRECT_USER_MSG = "Incorrect user!"
    try {
        const username = req.params.username;
        if (req.user.name !== username) {
            throw new Error(INCORRECT_USER_MSG)
        }

        const trainers = await Trainer.find({ username });
        res.send(trainers);
    } catch (err) {
        if (err.message === INCORRECT_USER_MSG) {
            err.statusCode = 403;
        }

        next(err);
    }
});

const createJWToken = (username) => {
    const payload = { name: username };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    return token
}

router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const trainer = await Trainer.findOne({ username });
        const result = await bcrypt.compare(password, trainer.password);

        if (!result) {
            throw new Error("Login failed");
        }

        const token = createJWToken(trainer.username)

        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = oneDay * 7;
        const expiryDate = new Date(Date.now() + oneWeek);

        res.cookie("token", token, {
            expires: expiryDate,
            httpOnly: true,
        });

        // why can't we have secure: true? Because localhost not secured

        res.send("You are now logged in!");
    } catch (err) {
        if (err.message === "Login failed") {
            err.statusCode = 400;
        }
        next(err);
    }

})

router.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        err.statusCode = 400;
    } else if (err.name === "MongoError") {
        err.statusCode = 422;
    }
    next(err)
})

module.exports = router