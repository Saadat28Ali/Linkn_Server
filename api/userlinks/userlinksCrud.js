import "dotenv/config";

async function readUserlinks(mongoClient, username) {
    try {
        await mongoClient.connect();

        const userlinks = await mongoClient.db(process.env.DB_NAME).collection(process.env.USERLINKS_COLLECTION_NAME).findOne({ username: username }, { projection: { _id: 0 } });
        return ((userlinks !== null) ? userlinks : 1);
    } finally {
        await mongoClient.close();
    }
}

async function writeUserlinks(mongoClient, username) {
    // Returns ----------------------------------
    // 0: new userlinks added
    // 1: null params found
    // 2: userlinks exists

    if (username === undefined || username === null) return 1;
    const socialLinks = {};
    const links = [];

    if (await readUserlinks(mongoClient, username) === 1) {
        try {
            await mongoClient.connect();

            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERLINKS_COLLECTION_NAME).insertOne(
                {
                    username: username, 
                    socialLinks: socialLinks, 
                    links: links
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

async function deleteUserlinks(mongoClient, username) {
    // Return -----------------------------------
    // 0: if user is successfully deleted
    // 1: if user does not exist

    if (await readUserlinks(mongoClient, username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERLINKS_COLLECTION_NAME).deleteOne({ username: username });
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else {
        return 1;
    }
}

async function updateUserlinks(mongoClient, username, socialLinks, links) {
    
    // Returns ----------------------------------
    // 0: if updated successfully
    // 1: if null params are passed
    // 2: user does not exist
    
    if (username === undefined || username === null) return 1;
    if (socialLinks === undefined || socialLinks === null) return 1;
    if (links === undefined || links === null) return 1;

    if (await readUserlinks(mongoClient, username) !== 1) {
        try {
            await mongoClient.connect();
            await mongoClient.db(process.env.DB_NAME).collection(process.env.USERLINKS_COLLECTION_NAME).updateOne(
                { username: username }, 
                { $set: 
                    { 
                        socialLinks: socialLinks, 
                        links: links
                    } 
                }
            );
            return 0;
        } finally {
            await mongoClient.close();
        }
    } else return 2;
}

export { readUserlinks, writeUserlinks, updateUserlinks, deleteUserlinks };