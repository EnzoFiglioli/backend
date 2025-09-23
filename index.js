const express = require("express");
const app = express();
const morgan = require("morgan");
const port = process.env.PORT || 8080;
const cors = require("cors");
const {join} = require("path");

let phoneNumbers = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
];

const unknownRequest = (request,response,next)=>{
    response.status(404).send({error: 'unknown endpoint'})
}

const generetedId = function(){
    const random = Math.floor(Math.random() * (1000 - 1)) + 1;

    if (phoneNumbers.length >= 5) throw new Error("No hay más IDs disponibles");

    const inArray = phoneNumbers.some(p => p.id === random);
    console.log(inArray)
    if(inArray) return generetedId();
    return random;
}

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));
app.use(cors());

morgan.token('body',(req,res)=>{
    return JSON.stringify(req.body);
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body "));

//REST
//GET all phone numbers

app.get("/",(request,response)=>{
    response.send("<h1>Hola mundo</h1>")
})

app.get("/info",(request,response)=>{
    const date = new Date();
    const template = 
    `
    <p>Phone book has info ${phoneNumbers.length} people</p>
    <p>${date}</p>
    `;
    response.send(template);
})

app.get("/api/persons",(request,response)=>{
    response.json(phoneNumbers)
});

app.get("/api/persons/:id",(request,response)=>{
    const id = Number(request.params.id);
    const person = phoneNumbers.find(phone => phone.id === id);
    
    if(!person){
        return response.status(400).json({
            error:"404 error not found resource"
        })
    }
    response.json(person)
});

app.delete("/api/persons/:id",(request,response)=>{
    const id = Number(request.params.id);
    phoneNumbers = phoneNumbers.filter(phone => phone.id != id);
    response.status(204).json(phoneNumbers)
});

app.post("/api/persons", (request, response)=>{
    const body = request.body;

    if(!body.name) return response.status(400).json({error:"The name is necessary"});
    const findName = phoneNumbers.find(p => p.name === body.name);
    if(findName) return response.status(400).json({error:"The name is exists in the database"});

    if(!body.number) return response.status(400).json({erro:"The number is the most important"});

    const person = {
        id: generetedId(),
        name: String(body.name),
        number: String(body.number)
    }

    phoneNumbers = phoneNumbers.concat(person);

    response.json(person);
})

app.use(unknownRequest)

app.listen(port,()=>{
    console.clear();
    console.log("App initial in a port " + port)
})