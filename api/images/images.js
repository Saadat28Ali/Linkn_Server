// Module imports -------------------------------
import "dotenv/config";

// Custom module imports ------------------------
import { getCurrentTime } from "../time/time.js";

async function writeImage(mongoClient, username, descriptor, data) {

    console.log("Writing image");

    // Returns 1 if null params, 0 if successful image write

    if (username === null || username === undefined) return 1;
    if (data === null || data === undefined) return 1;
    if (descriptor === null || descriptor === undefined) return 1;

    const dateCreated = getCurrentTime();

    try {
        await mongoClient.connect();

        await mongoClient.db(process.env.DB_NAME).collection(process.env.IMAGES_COLLECTION_NAME).insertOne(
            {
                createdBy: username, 
                dateCreated: dateCreated, 
                data: data, 
                descriptor: descriptor
            }
        );
        return 0;
    } finally {
        await mongoClient.close();
    }
}

async function readImage(mongoClient, username, descriptor) {
    // Return 1 if null params, 2 if user not found,
    // image as base 64 if found

    if (username === null || username === undefined) return 1;
    if (descriptor === null || descriptor === undefined) return 1;

    try {
        await mongoClient.connect();
        const readResult = await mongoClient.db(process.env.DB_NAME).collection(process.env.IMAGES_COLLECTION_NAME).findOne({ createdBy: username, descriptor: descriptor }, { projection: { _id: 0 } });
        if (readResult !== null) {
            return readResult.data;
        }
        else return 2;
    } finally {
        await mongoClient.close();
    }

}

export { writeImage, readImage };