process.loadEnvFile();
const mongoose = require("mongoose");
const url = process.env.MONGO_URI;

function dbConnection(){
    mongoose.set('strictQuery',false);
    return mongoose.connect(url)
        .then(()=>console.log("Connected to MongoDB"))
        .catch((err)=>console.log(err))
}

module.exports = {dbConnection}