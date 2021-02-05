import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SummonerSchema = new Schema({
  id: String,
  accountId: String,
  puuid: String,
  name: String,
  name_lower: String,
  previous_names: [String],
  profileIconId: Number,
  revisionDate: Number,
  summonerLevel: Number,
  lastUpdated: Date,
});

const Summoner = mongoose.model("Summoner", SummonerSchema);

export default Summoner;
