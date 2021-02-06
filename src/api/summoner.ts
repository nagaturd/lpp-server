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

  let summoner = await Summoner.findOne(query);

  // Had to do a weird workaround to access property of 'summoner'
  const summonerJSON = JSON.parse(JSON.stringify(summoner?.toObject()));

  console.log(
    "Time since last update (in seconds): ",
    moment().diff(moment(summonerJSON.lastUpdated), "s")
  );

  // If the summoner data is not older than 30 seconds, grab existing
  if (moment().diff(moment(summonerJSON.lastUpdated), "s") < 30) {
    return await Summoner.findOne(query);
  }

  // If summoner data is older than 30 seconds, refresh DB
  console.log("DB out of date, redirecting to API");
  return requestSummonerFromAPI(name);
};

const requestSummonerFromAPI = async (name: string) => {
  const apiKey = process.env.RIOT_API_KEY;

  const response = await fetch(`${BASE_URL}${name}?api_key=${apiKey}`);
  const data = await response.json();

  return createSummoner(data);
};

const createSummoner = async (data: ISummonerAPI) => {
  const query = { accountId: data.accountId };
  const ifExists = await Summoner.exists(query);

  // If the summoner doesn't exist, create a new one in the DB
  if (!ifExists) {
    const summoner = new Summoner({
      id: data.id,
      accountId: data.accountId,
      puuid: data.puuid,
      name: data.name,
      name_lower: data.name?.toLowerCase().trim(),
      profileIconId: data.profileIconId,
      revisionDate: data.revisionDate,
      summonerLevel: data.summonerLevel,
      lastUpdated: moment(),
    });

    summoner.save(function (err) {
      if (err) return console.log(err);
    });

    return summoner;
  }

  // If the summoner accountId exists but other data changed
  //    e.g. 'name', 'summonerLevel'
  // or if the data is out of date, find and update existing document
  return await Summoner.findOneAndUpdate(
    query,
    {
      id: data.id,
      accountId: data.accountId,
      puuid: data.puuid,
      name: data.name,
      name_lower: data.name?.toLowerCase().trim(),
      profileIconId: data.profileIconId,
      revisionDate: data.revisionDate,
      summonerLevel: data.summonerLevel,
      lastUpdated: moment(),
    },
    { new: true, upsert: true }
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
