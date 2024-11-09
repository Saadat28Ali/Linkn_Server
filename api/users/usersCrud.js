async function writeUserData(mongoClient, username, password, data) {
    // Returns ----------------------------------
    // 0: new user data added
    // 1: null params found
    // 2: user already exists

    if (username === undefined || username === null) return 1;
    if (password === undefined || password === null) return 1;
    if (data === undefined || data === null) return 1;

    if (await readUserData(mongoClient, username) === 1) {
        try {
            await mongoClient.connect();

            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERS_COLLECTION_NAME).insertOne(
                {
                    username: username, 
                    password: password, 
                    data: data
                }
            );
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else {
        return 2;
    }
}

async function readUserData(mongoClient, username) {
    // Returns ----------------------------------
    // Document if found
    // 1 if not found

    try {
        await mongoClient.connect();

        const foundDocument = await mongoClient.db(process.env.DB_NAME).collection(process.env.USERS_COLLECTION_NAME).findOne({ username: username }, { projection: { _id: 0 } });
        return ((foundDocument !== null) ? foundDocument : 1);
    } finally {
        await mongoClient.close();
    }
}

async function updateUserData(mongoClient, username, password, data) {
    // Returns ----------------------------------
    // 0: if updated successfully
    // 1: if null params are passed
    // 2: user does not exist
    
    if (username === undefined || username === null) return 1;
    if (password === undefined || password === null) return 1;
    if (data === undefined || data === null) return 1;

    if (await readUserData(mongoClient, username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERS_COLLECTION_NAME).updateOne({ username: username }, { $set: { password: password, data: data } });
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else return 2;
}

async function deleteUserData(mongoClient, username) {
    // Return -----------------------------------
    // 0: if user is successfully deleted
    // 1: if user does not exist

    if (await readUserData(mongoClient, username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERS_COLLECTION_NAME).deleteOne({ username: username });
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else {
        return 1;
    }
}

export { writeUserData, readUserData, updateUserData, deleteUserData };