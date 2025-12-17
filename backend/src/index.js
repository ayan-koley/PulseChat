import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDb from "./db/index.js";
import app from "./app.js";
import http from 'http';
import initSocket from './socket/index.js';

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

connectDb()
  .then(() => {
    // init socket 
    initSocket(server); 
    // listing server
    server.listen(PORT, () => {
      console.log(`Server in http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection error ", err);
    process.exit(1);
  });
