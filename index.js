const app = require("./app")
const PORT = 3000;
require('./utils/db')
require("dotenv").config() //read the env file

const server = app.listen(process.env.PORT || PORT, () => {
    console.log(`Express app started on http://localhost:${PORT}`);
});