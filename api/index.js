import express from "express";
import "dotenv/config";

const app = express();

app.get("/", (request, response) => {
    response.status(200).send("Received GET at /, the server is working.");
})

app.listen(process.env.LISTENING_PORT, () => {
    console.log("Server started. Listening on port: ", process.env.LISTENING_PORT);
});

export default app;