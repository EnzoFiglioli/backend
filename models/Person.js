const mongoose = require("mongoose"); 
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: String,
})

const Person = mongoose.model('Person',personSchema);

personSchema.set('toJSON',{
    transform:function(document,returnedObject){
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject.__v;
        delete returnedObject._id; 
    }
})

module.exports = {Person}