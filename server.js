const http = require("node:http");
const express = require("express");
const path = require("path");
const socket_io = require("socket.io");
const credentials = require("./middleware/credentials");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const session = require("express-session");

const app = express();


const hostname = "127.0.0.1";
const PORT = 5000;

const sessionMiddleware = session({
    secret: "SOMETHINGTOCHANGE",
    resave: true,
    saveUninitialized: true,
});

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

io.engine.use(sessionMiddleware);

const gameRooms = new Map();
const characters = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const charactersLength = characters.length;

const makeRoomId = (length) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

io.on("connection", (socket) => {

    const sessionId = socket.request.session.id;
    socket.join(sessionId);
    let joinedRoom = null;
    console.log("new user has connected");


    //use socket for on comments
    socket.emit("test");

    socket.on("disconnect", (reason) => {
        // We were in a room
        //console.log(socket.rooms);
        if(joinedRoom != null) {
            if(gameRooms.get(joinedRoom) == sessionId) {
                // Need to close the entire room
                console.log(`Closing room ${joinedRoom}`);
                io.to(joinedRoom).emit("CloseEntireRoom");
                gameRooms.delete(joinedRoom);
            }
            // Otherwise, we were just a guest/player, so don't delete the room
            else {
                console.log("Normal person left");
            }
        }
        console.log("User disconnected");
    });

    socket.on("make-new-room", () => {
        // Make random room ID
        let newRoomId = makeRoomId(4);
        while(gameRooms.get(newRoomId) != null) {
            newRoomId = makeRoomId(4);
        }
        console.log("Settled on an ID");
        gameRooms.set(newRoomId, sessionId);
        joinedRoom = newRoomId;
        socket.join(newRoomId);
        io.to(newRoomId).emit("GetGameRoomId", newRoomId);
    });

    socket.on("does-room-exist", (givenRoom) => {
        io.to(sessionId).emit("RoomExistence", gameRooms.get(givenRoom) != null,
            sessionId == gameRooms.get(givenRoom));
    });


});

server.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`);
});

