const http = require("node:http");
const express = require("express");
const path = require("path");
const socket_io = require("socket.io");
const credentials = require("./middleware/credentials");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

const app = express();


const hostname = "127.0.0.1";
const PORT = 5000;

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/api/users", (req, res) => {
    res.json({"users": ["userOne", "userTwo"]});
});
/*
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!\n");
});*/



const server = http.createServer(app);

const io = socket_io(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("new user has connected");

    //use socket for on comments
    socket.emit("test");
});

server.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`);
});

