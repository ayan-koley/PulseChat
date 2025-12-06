import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDb from "./db/index.js";

import app from "./app.js";

const PORT = process.env.PORT || 3000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server in http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection error ", err);
    process.exit(1);
  });
