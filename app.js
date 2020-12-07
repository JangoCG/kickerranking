const admin = require('./config').admin
const password = require('./config').password
const player1 = require('./config').player1
const player2 = require('./config').player2
const player3 = require('./config').player3
const player4 = require('./config').player4
const player5 = require('./config').player5
const player6 = require('./config').player6
const player7 = require('./config').player7
const player8 = require('./config').player8
const player9 = require('./config').player9
const player10 = require('./config').player10

const express = require('express');
const bodyParser = require("body-parser");

const app = express();
var mongoose = require("mongoose");

// //for double in mongoose
require('mongoose-double')(mongoose);
var schemaTypes = mongoose.Schema.Types;

//for EJS engine
app.set('view engine', 'ejs');
//Für die CSS Files
app.use(express.static("public"));

//for the body parser
app.use(express.urlencoded({
    extended: true
}));

//for local connection

/*
mongoose.connect("mongodb://localhost:27017/kickerLiga", {
    useNewUrlParser: true
});

*/

//for online connection

mongoose.connect(`mongodb+srv://${admin}:${password}@cluster0-5vxjv.mongodb.net/kickerLiga`, {
    useNewUrlParser: true
});


//For online Server. --->
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
//  <---
app.listen(port, function () {
    console.log("Server started on port 3000")
});


const ratingsSchema = {
    name: String,
    rating: Number,
    games: Number,
    wins: Number,
    winrate: schemaTypes.Double
};

//Blueprint for history schema
const historySchema = {
    games: Number,
    team1Player1: String,
    team1Player2: String,
    team2Player1: String,
    team2Player2: String,
    team1Player1Change: Number,
    team1Player2Change: Number,
    team2Player1Change: Number,
    team2Player2Change: Number
};


const Rating = mongoose.model("Rating", ratingsSchema);
const History = mongoose.model("History", historySchema);


const player1 = new Rating({
    name: player1,
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const player2 = new Rating({
    name: player2,
    rating: 1050,
    games: 0,
    wins: 0,
    winrate: 0
});


const player3 = new Rating({
    name: player3,
    rating: 977,
    games: 0,
    wins: 0,
    winrate: 0
});

const player4 = new Rating({
    name: player4,
    rating: 1110,
    games: 0,
    wins: 0,
    winrate: 0
});

const player5 = new Rating({
    name: player5,
    rating: 1080,
    games: 0,
    wins: 0,
    winrate: 0
});

const player6 = new Rating({
    name: player6,
    rating: 1021,
    games: 0,
    wins: 0,
    winrate: 0
});

const player7 = new Rating({
    name: player7,
    rating: 998,
    games: 0,
    wins: 0,
    winrate: 0
});

const player8 = new Rating({
    name: player8,
    rating: 998,
    games: 0,
    wins: 0,
    winrate: 0
});

const player9 = new Rating({
    name: 9,
    rating: 983,
    games: 0,
    wins: 0,
    winrate: 0
});

const player10 = new Rating({
    name: player10,
    rating: 980,
    games: 0,
    wins: 0,
    winrate: 0
});






const defaultPlayers =
    [player1, player2, player3, player4, player5, player6, player7, player8,
        player9, player10, player11, player12, player13, player14, player15];


app.get("/", function (req, res) {
    Rating.find({}, function (err, foundRecords) {
        if (err) {
            console.log(err);
            return;
        }
        if (foundRecords.length === 0) {
            Rating.insertMany(defaultPlayers, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Successfully saved default players to DB");
            });
            return;
        }


        foundRecords.sort((player1, player2) => player2.winrate - player1.winrate);
        res.render("ranking", {
            ratingArray: foundRecords,
            nameArray: foundRecords
        });
    });
});

app.post("/", async function (req, res) {

    const { winner1, winner2, looser1, looser2 } = req.body;

    function retrieveUser(playerName, callback) {
        //https://stackoverflow.com/a/40169645/10781526
        return Rating.findOne({ name: playerName }).exec();
    }

    let a, b, c, d;

    try {
        a = await retrieveUser(winner1);
        b = await retrieveUser(winner2);
        c = await retrieveUser(looser1);
        d = await retrieveUser(looser2);

        Math.round
        //get new rating
        //let change = Math.round(calculateElo(a.rating, b.rating, c.rating, d.rating));
        let changeA = Math.round(calculateEloA(a.rating, c.rating, d.rating));
        let changeB = Math.round(calculateEloB(b.rating, c.rating, d.rating));
        let changeC = Math.round(calculateEloC(a.rating, b.rating, c.rating));
        let changeD = Math.round(calculateEloD(a.rating, b.rating, d.rating));

        await Rating.updateOne({ name: a.name }, { rating: a.rating + changeA });
        await Rating.updateOne({ name: b.name }, { rating: b.rating + changeB });
        await Rating.updateOne({ name: c.name }, { rating: c.rating - changeC });
        await Rating.updateOne({ name: d.name }, { rating: d.rating - changeD });

        //update the games
        await Rating.updateOne({ name: a.name }, { games: a.games + 1 });
        await Rating.updateOne({ name: b.name }, { games: b.games + 1 });
        await Rating.updateOne({ name: c.name }, { games: c.games + 1 });
        await Rating.updateOne({ name: d.name }, { games: d.games + 1 });


        //update number of wins. a & b are always the winners
        await Rating.updateOne({ name: a.name }, { wins: a.wins + 1 });
        await Rating.updateOne({ name: b.name }, { wins: b.wins + 1 });
        //update winrate. +1 because we are always 1 dataset behind.
        await Rating.updateOne({ name: a.name }, { winrate: (((a.wins + 1) / (a.games + 1)) * 100).toFixed(2) });
        await Rating.updateOne({ name: b.name }, { winrate: (((b.wins + 1) / (b.games + 1)) * 100).toFixed(2) });
        await Rating.updateOne({ name: c.name }, { winrate: ((c.wins / (c.games + 1)) * 100).toFixed(2) });
        await Rating.updateOne({ name: d.name }, { winrate: ((d.wins / (d.games + 1)) * 100).toFixed(2) });

        const player15 = new Rating({
            name: "Michel",
            rating: 1000,
            games: 0,
            wins: 0,
            winrate: 0
        });


        const gameResult = new History({
            team1Player1: a.name,
            team1Player2: b.name,
            team2Player1: c.name,
            team2Player2: d.name,
            team1Player1Change: changeA,
            team1Player2Change: changeB,
            team2Player1Change: changeC,
            team2Player2Change: changeD
        });

        await gameResult.save();

    } catch (e) {
        console.log(e);
    }
    res.redirect("/");
});

// Register Page
app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/history", function (req, res) {
    History.find({}, function (err, foundRecords) {
        if (err) {
            console.log(err);
            return;
        }
        res.render("history", {
            historyArray: foundRecords
        })
    })
});


app.get("/regeln", function (req, res) {
    res.render("regeln");
});

app.get("/ranking", function (req, res) {
    res.redirect("/");
});


app.post("/register", async function (req, res) {
    const newEntry = new Rating({
        name: req.body.playerName,
        rating: req.body.playerRating,
        games: 0,
        wins: 0,
        winrate: 0
    });
    await newEntry.save();
    // res.redirect("/");
});

function calculateEloA(a, c, d) {
    let eloTeamB = (c + d) / 2;

    let chanceToWin = 1 / (1 + Math.pow(10, (eloTeamB - a) / 400));
    return (10 * (1 - chanceToWin));
}

function calculateEloB(b, c, d) {
    let eloTeamB = (c + d) / 2;

    let chanceToWin = 1 / (1 + Math.pow(10, (eloTeamB - b) / 400));
    return (10 * (1 - chanceToWin));
}

//those are the loosers.
function calculateEloC(a, b, c) {
    let eloTeamA = (a + b) / 2;

    let chanceToWin = 1 / (1 + Math.pow(10, (c - eloTeamA) / 400));
    return (10 * (1 - chanceToWin));
}

function calculateEloD(a, b, d) {
    let eloTeamA = (a + b) / 2;

    let chanceToWin = 1 / (1 + Math.pow(10, (d - eloTeamA) / 400));
    return (10 * (1 - chanceToWin));
}


