import express from "express";
import fetch from "node-fetch";
import Summoner from "../models/summoner";
import moment from "moment";

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

const checkSummoner = async (name: string) => {
  const ifExists = await Summoner.exists({
    name_lower: name.toLowerCase().trim(),
  });

  if (ifExists) {
    let summoner = requestSummonerFromDB(name);

    console.log("Retrieved from DB: ", await summoner);
    return await summoner;
  }
  let summoner = requestSummonerFromAPI(name);

  console.log("Retrieved from API: ", await summoner);
  return await summoner;
};

const requestSummonerFromDB = async (name: string) => {
  const query = { name_lower: name.toLowerCase().trim() };

  return await Summoner.findOneAndUpdate(
    query,
    { lastUpdate: moment() },
    {
      new: true,
      upsert: true,
    }
  );
};

const requestSummonerFromAPI = async (name: string) => {
  const apiKey = process.env.RIOT_API_KEY;

  const response = await fetch(`${BASE_URL}${name}?api_key=${apiKey}`);
  const data = await response.json();

  /*
  const testData = {
    id: "0bWq-E9HF_bKwWbYHaSpyZ23Uv7ESWF7YiTNZEedfyIkdiE",
    accountId: "FC4J_e8AJY_tszkZZxwVthekJRXAAuymBWcQLi0ALy2u-bU",
    puuid:
      "0-3YvmeugDdfzaehTcAALBulmdsv1Lt3pgUmgLfxoVNLQcmIvntIy3QCbg0nQnymzYMR-7M7ShNniQ",
    name: "nagaturd",
    profileIconId: 581,
    revisionDate: 1612046851000,
    summonerLevel: 202,
  };
  */

  return createSummoner(data);
};

const createSummoner = async (data: ISummonerAPI) => {
  const query = { accountId: data.accountId };
  const ifExists = await Summoner.exists(query);

  if (!ifExists) {
    const summoner = new Summoner({
      id: data.id,
      accountId: data.accountId,
      puuid: data.puuid,
      name: data.name,
      name_lower: data.name?.toLowerCase().trim(),
      previous_names: data.name,
      profileIconId: data.profileIconId,
      revisionDate: data.revisionDate,
      summonerLevel: data.summonerLevel,
      lastUpdated: moment(),
    });

    summoner.save(function (err) {
      if (err) return console.log(err);
    });

    console.log("Created from API: ", summoner);
    return summoner;
  }

  return await Summoner.findOneAndUpdate(
    query,
    {
      name: data.name,
      name_lower: data.name?.toLowerCase().trim(),
      $push: { previous_names: data.name },
    },
    { new: true }
  );
};

const router = express.Router();

const BASE_URL =
  "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/";

router.get("/:name", async (req, res) => {
  const name = req.params.name;

  const data = await checkSummoner(name);

  res.json(data);
});

export default router;
