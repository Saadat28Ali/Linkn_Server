// Module imports -------------------------------
import express, { Request, Response } from "express";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import bodyParser from "body-parser";
// ----------------------------------------------

const DB_URI = (process.env.DB_URI) ? process.env.DB_URI : "";
const DB_NAME = (process.env.DB_NAME) ? process.env.DB_NAME : "";
const COLLECTION_NAME = (process.env.COLLECTION_NAME) ? process.env.COLLECTION_NAME : "";

const mongoClient = new MongoClient(DB_URI , {
    serverApi: {
        version: ServerApiVersion.v1, 
        strict: true, 
        deprecationErrors: true
    }
});

const RESPONSES = {
    INVALID_ACTION: "Invalid action: The action specified is invalid, it must be a CRUD operaiton.", 
    USER_NOT_FOUND: "Action could not be completed, user with provided details was not found.", 
    ACTION_COMPLETED: "Action completed successfully.", 
    USER_FOUND: "Action could not be completed, user with provided details already present.", 
    NULL_PARAMS: "Action could not be completed, null or undefined parameters were found.", 
    UNKNOWN_ERROR: "We have run into an unknown error.", 
}

async function writeUserData(username: string, password: string, data: string) {
    // Returns ----------------------------------
    // 0: new user data added
    // 1: null params found
    // 2: user already exists

    if (username === undefined || username === null) return 1;
    if (password === undefined || password === null) return 1;
    if (data === undefined || data === null) return 1;

    if (await readUserData(username) === 1) {
        try {
            await mongoClient.connect();

            await mongoClient.db(process.env.DB_NAME).collection(COLLECTION_NAME).insertOne(
                {
                    username: username, 
                    password: password, 
                    data: data
                }
            );
        } finally {
            return 0;
        }
    } else {
        return 2;
    }
}

async function readUserData(username: string) {
    // Returns ----------------------------------
    // Document if found
    // 1 if not found

    try {
        await mongoClient.connect();

        const foundDocument = await mongoClient.db(process.env.DB_NAME).collection(COLLECTION_NAME).findOne({ username: username }, { projection: { _id: 0} });
        return ((foundDocument !== null) ? foundDocument : 1);
    } finally {
        await mongoClient.close();
    }
}

async function updateUserData(username: string, password: string, data: string) {
    // Returns ----------------------------------
    // 0: if updated successfully
    // 1: if null params are passed
    // 2: user does not exist
    
    if (username === undefined || username === null) return 1;
    if (password === undefined || password === null) return 1;
    if (data === undefined || data === null) return 1;

    if (await readUserData(username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(COLLECTION_NAME).updateOne({ username: username }, { $set: { password: password, data: data } });
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else return 2;
}

async function deleteUserData(username: string) {
    // Return -----------------------------------
    // 0: if user is successfully deleted
    // 1: if user does not exist

    if (await readUserData(username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(COLLECTION_NAME).deleteOne({ username: username });
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else {
        return 1;
    }
}

const app = express();

app.post("/", bodyParser.json(), (request: Request, response: Response) => {

    const action = request.body.action;
    const username = request.body.uname;
    const password = request.body.pwd;
    const data = request.body.data;

    if (action === "read") {
        readUserData(username).then((
            foundDocument
        ) => {
            if (foundDocument === 1) response.status(200).send(RESPONSES.USER_NOT_FOUND);
            else {
                response.status(200).json(foundDocument);
            }
        });
    } else if (action === "write") {
        writeUserData(username, password, data).then((
            writtenResult            
        ) => {
            switch (writtenResult) {
                case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                case 1: response.status(200).send(RESPONSES.NULL_PARAMS); break;
                case 2: response.status(200).send(RESPONSES.USER_FOUND); break;
                default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
            }
        });
    } else if (action === "update") {
        updateUserData(username, password, data).then((
            updateResult
        ) => {
            switch (updateResult) {
                case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                case 1: response.status(200).send(RESPONSES.NULL_PARAMS); break;
                case 2: response.status(200).send(RESPONSES.USER_NOT_FOUND); break;
                default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
            }
        });
    } else if (action === "delete") {
        deleteUserData(username).then((
            deleteResult
        ) => {
            switch (deleteResult) {
                case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                case 1: response.status(200).send(RESPONSES.USER_NOT_FOUND); break;
                default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
            }
        })
    }
    else response.status(200).send(RESPONSES.INVALID_ACTION);
});

app.get("/", (request, response) => {

    response.send("The server is working");
})

app.listen(process.env.LISTENING_PORT, () => {
    console.log("Server started. Listening on port: ", process.env.LISTENING_PORT);
});

export default app;