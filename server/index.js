const http = require("http");
const express = require("express");
const app = express();
const io = require('socket.io');

const httpServer  = http.createServer(app);


const socketServer = io(httpServer,{
    cors:{
        origin:"*",
        methods:['GET',"POST"],
    }
})