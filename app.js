var express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
var app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" },
});
var mysql = require("mysql");

var sockets = {};
console.log(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_HOST
);
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
con.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("Database connected");
});
io.on("connection", (socket) => {

    if (!socket.handshake.query || !socket.handshake.query.user_id) {
        socket.emit('error', 'No user_id provided');
    }
    if (!sockets[socket.handshake.query.user_id]) {
        sockets[socket.handshake.query.user_id] = [];
    }
    sockets[socket.handshake.query.user_id].push(socket);
    
    socket.on("disconnect", function (error) {
        console.log("User Disconnected",socket.handshake.query.user_id);
        })

    // socket.on("send_message",  (data)=> {

    //             for (var index in sockets[data.sender_id]) {
    //                 sockets[data.sender_id][index].emit("receive_message", data);
    //             }
    //             for (var index in sockets[data.receiver_id]) {
    //                 sockets[data.receiver_id][index].emit("receive_message", data);
    //             }
    //             console.log("data =>", data);
    //             console.log("Message sent ");
    //         }
        // );
        socket.on("send_message", (data) => {

            for (var index in sockets[data.sender_id]) {
              sockets[data.sender_id][index].emit("receive_message", data);
               }

            if (!Array.isArray(data.receiver_ids)) {
                data.receiver_ids = [data.receiver_ids]; // Ensure receiver_ids is an array
            }
            console.log(data.receiver_ids)
            // Send message to all specified receiver IDs
            for (let receiver_id of data.receiver_ids) {
                if (sockets[receiver_id]) {
                    for (let receiverSocket of sockets[receiver_id]) {
                        receiverSocket.emit("receive_message", data);
                    }
                }
            }
            console.log("data =>", data);
            console.log("Message sent");
        });
    });
    
    


// if(process.env.APP_HOST === 'local'){
    const port = 4000;
    httpServer.listen(port, function() {
        console.log('Server is running on : ', port);
    });

