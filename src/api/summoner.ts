import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const BASE_URL =
  "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/";

router.get("/:name", async (req, res) => {
  try {
    const summoner = req.params.name;
    const apiKey = process.env.RIOT_API_KEY;

    const response = await fetch(`${BASE_URL}${summoner}?api_key=${apiKey}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.send("error");
  }
});

export default router;
