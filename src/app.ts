import express from "express";
import dotenv from "dotenv";
import api from "./api";
import mongoose from "mongoose";

dotenv.config();

const mongoDB = `${process.env.DB_CONN}`;

mongoose.connect(
  mongoDB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connected to DB")
);

const app = express();

app.use("/api", api);

export default app;
