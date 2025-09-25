const mongoose = require("mongoose"); 
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        match: [/^\d{2,3}-\d+$/, "Formato de teléfono inválido. Ej: 09-1234556 o 040-22334455"],
        required: [true, 'User phone number required']
    },
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