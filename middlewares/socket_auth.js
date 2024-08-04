const  jwt = require("jsonwebtoken");
// const config = require ("../config/config.js");

exports.check_socket_auth = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
        //   logger.error("Socket unauthorised");
          return next(new Error("Authentication error"));
        }
        socket.decoded = decoded;
        socket.userId =  decoded.id
        next();
      }
    );
  } else {
    // logger.error("Socket unauthorised");
    next(new Error("Authentication error"));
  }
};
