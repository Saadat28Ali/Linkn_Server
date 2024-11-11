// Module imports
import hash from "object-hash";
import "dotenv/config";

// Custom module imports
import {
    getCurrentTime, 
    getTimestamp, 
    getLaterTime, 
    getTimeDifference, 
    getTimeSum, 
    isLeapYear, 
    getValidTime
} from "../time/time.js";

// async function dehashToken(mongoClient, token) {

//     if (token === null) return 1;

//     try {
//         await mongoClient.connect();

//         const foundToken = await mongoClient.db(process.env.DB_NAME).collection(process.env.SESSIONTOKENS_COLLECTION_NAME).findOne({ key: token }, { projection: { _id: 0, key: 0 } });
//         return ((foundToken !== null) ? foundToken.value : 2);
//     } finally {
//         await mongoClient.close();
//     }
// }

async function findToken(mongoClient, username) {
    
    // Returns 1 if null params
    // found token if a token with given username
    // is found
    // 2 if no such token is found
    
    if (username === null) return 1;

    try {
        await mongoClient.connect();

        const foundToken = await mongoClient.db(process.env.DB_NAME).collection(process.env.SESSIONTOKENS_COLLECTION_NAME).findOne({ username: username }, { projection: { _id: 0 } });
        return ((foundToken === null) ? 2 : foundToken);
    } finally {
        await mongoClient.close();
    }
}

async function createToken(mongoClient, username, ip) {

    // Returns 1 if null params are found
    // Returns hashed token if successfully added
    // Returns 2 if token already exists for user

    if (username === null) return 1;
    if (ip === null) return 1;

    if (findToken(mongoClient, username) !== 2) return 2;

    const currentTime = getCurrentTime();
    const token = {
        username: username, 
        ip: ip, 
        creationTime: currentTime, 
        expiryTime: getValidTime(getTimeSum(currentTime, {year: 0, month: 0, date: 28, hours: 0, minutes: 0, seconds: 0, milliseconds: 0})), 
    };
    const hashedToken = hash(token);

    try {
        await mongoClient.connect();
        await mongoClient.db(process.env.DB_NAME).collection(process.env.SESSIONTOKENS_COLLECTION_NAME).insertOne({ username: username, hashed: hashedToken, token: token });
        return hashedToken;
    } finally {
        await mongoClient.close();
    }

}

async function updateToken(mongoClient, username, ip) {
    // Returns 1 if null params
    // Returns 2 if user does not exist
    // Returns 0 if successful updation
    

    if (username === null) return 1;

    const foundToken = await findToken(mongoClient, username);
    if (foundToken === 2) return 2;
    let token = {...foundToken.token};
    token.username = username;
    token.ip = ip;
    token.creationTime = getCurrentTime();
    token.expiryTime = getValidTime(getTimeSum(token.creationTime, {year: 0, month: 0, date: 28, hours: 0, minutes: 0, seconds: 0, milliseconds: 0}));
    const hashed = hash(token);

    try {
        await mongoClient.connect();
        const updateResult = await mongoClient.db(process.env.DB_NAME).collection(process.env.SESSIONTOKENS_COLLECTION_NAME).updateOne({ username: username }, { $set: { token: token, hashed: hashed } });
        return 0;
    } finally {
        await mongoClient.close();
    }
}

export { 
    createToken, 
    findToken, 
    updateToken
};
