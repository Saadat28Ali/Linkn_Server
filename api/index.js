// Module imports -------------------------------
import express from "express";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import bodyParser from "body-parser";

// Custom module imports ------------------------
import { readUserData, writeUserData, updateUserData, deleteUserData } from "./users/usersCrud.js";
import { readUserlinks, writeUserlinks, updateUserlinks, deleteUserlinks } from "./userlinks/userlinksCrud.js";
import { createToken, findToken, updateToken } from "./sessiontokens/sessiontokens.js";
import { writeImage, readImage } from "./images/images.js";

// ----------------------------------------------

const mongoClient = new MongoClient(process.env.DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1, 
        strict: true, 
        deprecationErrors: true
    }
});

const RESPONSES = {
    INVALID_COLLECTION: "Invalid collection: The collection specified does not exist in the database.", 
    INVALID_ACTION: "Invalid action: The action specified is invalid, it must be one of { read, write, update, delete }.", 
    USER_NOT_FOUND: "Action could not be completed, user with provided details was not found.", 
    ACTION_COMPLETED: "Action completed successfully.", 
    USER_FOUND: "Action could not be completed, user with provided details already present.", 
    NULL_PARAMS: "Action could not be completed, null or undefined parameters were found.", 
    UNKNOWN_ERROR: "We have run into an unknown error.", 
};

const ICONS = {
    instagram: "./assets/instagram.png", 
    twitter: "./assets/twitter.png", 
    youtube: "./assets/youtube.png", 
};

const app = express();

app.use(express.static("public"));

app.post("/", bodyParser.json({limit: "50mb"}), (request, response) => {

    const action = request.body.action;
    const collection = request.body.collection;

    const username = request.body.username;
    const password = request.body.password;

    const lightMode = request.body.lightMode;
    
    const socialLinks = request.body.socialLinks;
    const links = request.body.links;
    
    const ip = request.ip;

    const image = request.body.image;
    const descriptor = request.body.descriptor;
    
    const sessiontoken = request.body.token;

    console.log("Request received with action: " + action);

    if (action === "requesttoken") {
        createToken(mongoClient, username, ip).then(
            (tokenCreatedResult) => {
                console.log(tokenCreatedResult);
                if (tokenCreatedResult === 1) response.status(200).send(RESPONSES.NULL_PARAMS);
                else if (tokenCreatedResult === 2) response.status(200).send(RESPONSES.USER_FOUND);
                else response.status(200).send(tokenCreatedResult);
            }
        );
    } else if (action === "findtoken") {
        findToken(mongoClient, sessiontoken).then(
            (tokenFoundResult) => {
                    if (tokenFoundResult === 1) response.status(200).send(RESPONSES.NULL_PARAMS);
                    else if (tokenFoundResult === 2) response.status(200).send(RESPONSES.USER_NOT_FOUND);
                    else {
                        response.status(200).send(tokenFoundResult);
                    }
            }
        );
    } else if (action === "updatetoken") {
        updateToken(mongoClient, username, ip).then(
            (tokenUpdatedResult) => {
                if (tokenUpdatedResult === 1) response.status(200).send(RESPONSES.NULL_PARAMS);
                else if (tokenUpdatedResult === 2) response.status(200).send(RESPONSES.USER_NOT_FOUND);
                else response.status(200).send(RESPONSES.ACTION_COMPLETED);
            }
        );
    } 
    
    else if (action === "uploadimage") {

        writeImage(mongoClient, username, descriptor, image).then((
            writeImageResult
        ) => {

            if (writeImageResult === 1) response.send(RESPONSES.NULL_PARAMS);
            else if (writeImageResult === 0) response.send(RESPONSES.ACTION_COMPLETED);
            else response.send(RESPONSES.UNKNOWN_ERROR);

        });

    } else if (action === "downloadimage") {
        
        readImage(mongoClient, username, descriptor).then((
            readImageResult
        ) => {

            if (readImageResult === 1) response.status(200).send(RESPONSES.NULL_PARAMS);
            else if (readImageResult === 2) response.status(200).send(RESPONSES.USER_NOT_FOUND);
            else response.status(200).send(readImageResult);

        });

    } else {
        if (collection === "users") {

            if (action === "read") {
    
                readUserData(mongoClient, username).then((
                    foundDocument
                ) => {
    
                    if (foundDocument === 1) response.status(200).send(RESPONSES.USER_NOT_FOUND);
                    else response.status(200).json(foundDocument);
    
                });
    
            } else if (action === "write") {
    
                writeUserData(mongoClient, username, password, lightMode).then((
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
    
                updateUserData(mongoClient, username, password, lightMode).then((
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
    
                deleteUserData(mongoClient, username).then((
                    deleteResult
                ) => {
    
                    switch (deleteResult) {
                        case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                        case 1: response.status(200).send(RESPONSES.USER_NOT_FOUND); break;
                        default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
                    }
    
                });
    
            }
            else response.status(200).send(RESPONSES.INVALID_ACTION);
    
        } else if (collection === "userlinks") {
    
            if (action === "read") {
    
                readUserlinks(mongoClient, username).then((
                    foundLinks
                ) => {
    
                    if (foundLinks === 1) response.status(200).send(RESPONSES.USER_NOT_FOUND);
                    else response.status(200).json(foundLinks);
    
                });
    
            } else if (action === "write") {
    
                writeUserlinks(mongoClient, username).then((
                    writtenLinksResult
                ) => {
    
                    switch (writtenLinksResult) {
                        case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                        case 1: response.status(200).send(RESPONSES.NULL_PARAMS); break;
                        case 2: response.status(200).send(RESPONSES.USER_FOUND); break;
                        default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
                    }
    
                });
            
            } else if (action === "update") {
    
                updateUserlinks(mongoClient, username, socialLinks, links).then((
                    updateLinksResult
                ) => {
    
                    switch (updateLinksResult) {
                        case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                        case 1: response.status(200).send(RESPONSES.NULL_PARAMS); break;
                        case 2: response.status(200).send(RESPONSES.USER_NOT_FOUND); break;
                        default: response.status(200).send(RESPONSES.UNKNOWN_ERROR); break;
                    }
    
                });
    
            } else if (action === "delete") {
                deleteUserlinks(mongoClient, username).then((
                    deleteLinksResult
                ) => {
                    switch (deleteLinksResult) {
                        case 0: response.status(200).send(RESPONSES.ACTION_COMPLETED); break;
                        case 1: response.status(200).send(RESPONSES.USER_NOT_FOUND); break;
                    }
                })
            }
            else response.status(200).send(RESPONSES.INVALID_ACTION);
    
        } else response.status(200).send(RESPONSES.INVALID_COLLECTION);
    }


});

app.get("/", (request, response) => {
    response.send("The server is working");
});


app.listen(process.env.LISTENING_PORT, () => {
    console.log("Server started. Listening on port: ", process.env.LISTENING_PORT);
});

export default app;