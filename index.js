const express = require("express");
const app = express();
const morgan = require("morgan");
const port = process.env.PORT || 8080;
const cors = require("cors");
const {dbConnection} = require("./db/db")
const {Person} = require("./models/Person")

const unknownRequest = (request,response,next)=>{
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request,response,next)=>{
    console.log(error.message);

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }else if(error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  next(error)
}

app.use(express.json());
app.use(express.static('dist'));
app.use(cors());

morgan.token('body',(req,res)=>{
    return JSON.stringify(req.body);
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body "));

//REST
//GET all phone numbers

app.get("/info",async(request,response,next)=>{
    const date = new Date();
    const phoneNumbers = await Person.find({})
    const template = 
    `
    <p>Phone book has info ${phoneNumbers.length} people</p>
    <p>${date}</p>
    `;
    response.send(template);
})

app.get("/api/persons",(request,response,next)=>{
    Person.find()
        .then((people)=> response.json(people))
        .catch((error) => next(error));
});

app.get("/api/persons/:id",(request,response,next)=>{
    Person.findById(request.params.id)
        .then((people)=> response.json(people))
        .catch((error) => next(error));
});

app.delete("/api/persons/:id",(request,response,next)=>{
    Person.findByIdAndDelete(request.params.id)
        .then((people)=> response.json(people))
        .catch((err) => next(err));
});

app.put("/api/persons/:id", (request, response, next) => {
    const { id } = request.params;
    const body = request.body;

    const updatedPerson = {
        name: body.name,
        number: body.number
    };

    Person.findByIdAndUpdate(id, updatedPerson, {
        new: true,    
        runValidators: true,
        context: "query"
    })
    .then(result => {
        if (!result) {
            return response.status(404).json({ error: "Person not found" });
        }
        response.json(result);
    })
    .catch(error => next(error));
});

app.post("/api/persons", (request, response, next) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({ error: "The name is necessary" });
    }

    if (!body.number) {
        return response.status(400).json({ error: "The number is the most important" });
    }

    const person = {
        name: body.name,
        number: body.number
    };

    // Buscar si ya existe
    Person.findOne({ name: body.name })
        .then(result => {
            if (!result) {
                // No existe → crear
                return Person.create(person)
                    .then(savedPerson => response.json(savedPerson));
            } else {
                // Ya existe → actualizar
                return Person.updateOne(
                    { name: body.name },
                    { $set: { number: body.number } }
                ).then(() => response.json({ message: "Person updated" }));
            }
        })
        .catch(error => next(error));
});


app.use(unknownRequest);
app.use(errorHandler);

app.listen(port,()=>{
    console.clear();
    console.log("App initial in a port " + port);
    dbConnection();
}
)