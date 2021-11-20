// Enable strict-mode JavaScript which catches more errors
"use strict";

// Import express
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json()); // enable handling JSON requests
app.use(cors()); // enable cross-origin requests, so clients from a different "origin" can make POST requests to the server

// Create an endpoint that handles GET requests to /joke
app.get("/joke", (request, response) => {
    response.setHeader("Content-Type", "text/plain");
    response.send("What happens to a frog's car when it breaks down? It gets toad away.");
});

app.listen(3001); // set server to listen on port 3001

console.log("Listening on http://localhost:3001");
console.log("Press Ctrl-C to quit");

// In console, type: node index.js
// Go to browser: http://localhost:3001/joke

// Create public/joke.html
// After modifying file, make sure to restart server

// After `const app`, write:
// Serve static files from the folder "public"
app.use(express.static("public"));
// Go to http://localhost:3001/joke.html in browser

// Then add:
const jokes = ["What happens to a frog's car when it breaks down? It gets toad away.",
               "Why was six scared of seven? Because seven 'ate' nine.",
               "Why don't calculus students throw house parties? Because you should never drink and derive."
            ];

app.get("/all", (request, response) => {
    const jokesRes = [];
    for (let i = 0; i < jokes.length; i++) {
        jokesRes.push({
            id: i,
            text: jokes[i]
        });
    }
    // Send JSON response
    response.json(jokesRes);
});

// In browser, go to http://localhost:3001/all
// Or send request in Postman

// What if we only want to get a joke with a certain ID?
// colon for route parameter
app.get("/joke/:id", (request, response) => {
    // Notice that in the previous endpoints we wrote, we never had 
    const jokeID = request.params.id; // the id route parameter from the URL
    console.log(jokeID);
    if (isNaN(jokeID) || jokeID < 0 || jokeID >= jokes.length) { // if joke id is not a number or is out of bounds
        response.setHeader("Content-Type", "text/plain");
        response.status(404);
        response.send("Joke not found!");
        return; // so the function ends
        // Go to http://localhost:3000/joke/facade; it will say "Joke not found!"
    } else {
        response.json({
            id: jokeID,
            text: jokes[jokeID]
        })
    }
})

// express.json() decodes the JSON that the user will send
app.post("/joke", express.json(), (request, response) => {
    if (!request.body || !request.body.text) {
        response.setHeader("Content-Type", "text/plain");
        response.status(400);
        response.send("Invalid request body");
        return;
    } else {
        const id = jokes.length;
        jokes.push(request.body.text);
        response.json({
            status: "We have added your joke",
            id: id,
            text: request.body.text,
        })
    }
})

let likes = 15;

app.get("/likes", (request, response) => {
    response.json({
        likes: likes
    });
});

app.post("/likes", express.json(), (request, response) => {
    likes = request.body.likes;
    response.json({
        status: "success",
        likes: likes
    });
})

// Use Postman to send a POST request. Go to the POST tab. 

/* MONGODB time */

// Set up a database in MongoDB Atlas
// In console, run: npm install mongodb

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:<password>@cluster0.f7klw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    console.log("connected to db")
    // perform actions on the collection object
    // client.close();
});

app.post('/user', express.json(), async (request, response) => {
    const name = request.body.name;
    const age = request.body.age;

    await client.db("test").collection("users").insertOne({
        name: name,
        age: age
    });

    // Status code 201 means successfully created
    return response.status(201).send({
        message: "User created successfully."
    });
});

app.get('/user', async (request, response) => {
    let { name, age } = request.query;
    age = parseInt(age, 10); // query params are strings so we have to explicitly convert it ot a number

    const usersCursor = await client.db("test").collection("users").find({ name, age });
    const users = await usersCursor.toArray();
    response.json(users);
})

// See also https://kb.objectrocket.com/mongo-db/the-mongoose-cheat-sheet-225 

// Update age of all users with a certain name
app.put('/user', async (request, response) => {
    const { name, age } = request.body;
    console.log(name);

    const updateInfo = await client.db("test").collection("users").updateMany({ name }, { $set: { age: age } });

    return response.send({
        message: "Updated successfully",
        updated: updateInfo
    })
});

// Delete all users younger than a certain age
app.delete('/user', async (request, response) => {
    const deleteInfo = await client.db("test").collection("users").deleteMany({ age: { $lt: request.body.age } });

    return response.send({
        message: "Deleted successfully",
        deleted: deleteInfo
    })
});