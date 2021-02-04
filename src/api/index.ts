import express from "express";
import summoner from "./summoner";

const router = express.Router();

router.use("/summoner", summoner);

export default router;
