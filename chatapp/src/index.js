"use strict";

const { default: axios } = require("axios");
// import { Server } from 'socket.io';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */

  bootstrap(/* { strapi } */) {
    // const io = new Server(strapi.server.httpServer);
    const { Server } = require('socket.io')
    var io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    io.on("connection", function (socket) {
      socket.on("join", async ({ username }) => {
        console.log("user connected");
        console.log("username is ", username);
        if (username) {
          socket.join("group");
          socket.emit("welcome", {
            user: "bot",
            text: `${username}, Welcome to the chat`,
            userData: username,
          });
          // let strapiData = {
          //   data: {
          //     users: username,
          //     socketid: socket.id,
          //   },
          // };
          // await axios
          //   .post("http://localhost:1337/api/active-users", strapiData)
          //   .then(async (e) => {
          //     socket.emit("roomData", { done: "true" });
          //   })
          //   .catch((e) => {
          //     if (e.message == "Request failed with status code 400") {
          //       socket.emit("roomData", { done: "existing" });
          //     }
          //   });
        } else {
          console.log("e no work");
        }
      });
      socket.on("sendMessage", async(data) => {
        let strapiData = {
          data: {
            user: data.user,
            message: data.message,
          },
        };
        console.log('user message', strapiData.data)

        var axios = require("axios");
        await axios
        .post("http://localhost:1337/api/messages", strapiData)
        .then((e) => {
          console.log('user message stored ', data.message)
          socket.broadcast.to("group").emit("message", strapiData.data);
        })
        .catch((e) => console.log("error", e.message));
        
        let botData = {
          data: {
            user: 'bot',
            message: data.message,
          },
        };

        await axios
        .post("http://localhost:1337/api/messages", botData)
        .then((e) => {
          console.log('Broadcasting bot message')
          socket.broadcast.to('group').emit("message", botData.data);
        })
        .catch((e) => console.log("error", e.message));
      });
      socket.on("kick", (data) => {
        io.sockets.sockets.forEach((socket) => {
          if (socket.id === data.socketid) {
            socket.disconnect();
            socket.removeAllListeners();
            return console.log("kicked", socket.id, data.socketid);
          } else {
            console.log("Couldn't kick", socket.id, data.socketid);
          }
        });
      });
    });
  },
};
