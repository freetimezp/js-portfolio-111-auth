import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

//cors
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); //allow us to parse incoming requests:req.body
app.use(cookieParser()); //allow us parse incoming cookies

app.use("/api/auth", authRoutes);

let deploy = process.env.NODE_ENV.split(" ")[0];
//console.log("catch deploy:", deploy);

if (deploy === 'production') {
    console.log("production build success");

    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    //console.log(deploy);
    console.log("Server is running on port: ", PORT);
    connectDB();
});









