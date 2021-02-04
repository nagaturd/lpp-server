import express from "express";
import fetch from "node-fetch";
import Summoner from "../models/summoner";

interface ISummonerAPI {
  id?: string;
  accountId?: string;
  puuid?: string;
  name?: string;
  profileIconId?: number;
  revisionDate?: number;
  summonerLevel?: number;
  status?: {
    message?: string;
    status_code?: number;
  };
}

const createSummoner = (data: ISummonerAPI) => {
  const summoner = new Summoner({
    id: data.id,
    accountId: data.accountId,
    puuid: data.puuid,
    name: data.name,
    profileIconId: data.profileIconId,
    revisionDate: data.revisionDate,
    summonerLevel: data.summonerLevel,
  });

  summoner.save(function (err) {
    if (err) return console.log(err);
  });
  console.log(data);
};

const router = express.Router();

const BASE_URL =
  "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/";

router.get("/:name", async (req, res) => {
  const summoner = req.params.name;
  const apiKey = process.env.RIOT_API_KEY;

  const response = await fetch(`${BASE_URL}${summoner}?api_key=${apiKey}`);
  const data = await response.json();

  createSummoner(data);
  res.json(data);
});

export default router;
