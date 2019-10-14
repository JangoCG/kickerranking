const express = require('express');
const bodyParser = require("body-parser");

const app = express();
var mongoose = require("mongoose");

// //für double in mongoose
// require('mongoose-double')(mongoose);
// var schemaTypes = mongoose.Schema.Types;

//Für EJS engine
app.set('view engine', 'ejs');
//Für die CSS Files
app.use(express.static("public"));

//Body Parser um Infos aus Post zu parsen
app.use(express.urlencoded({
    extended: true
}));

//Connecte und erstelle Rating DB

mongoose.connect("mongodb+srv://admin-cengiz:jangoadminasdf@cluster0-5vxjv.mongodb.net/kickerLiga", {
    useNewUrlParser: true
});

//Erstelle Blueprint für Rating Tabelle. Immer in Plural
const ratingsSchema = {
    name: String,
    rating: Number,
    games: Number,
    wins: Number,
    winrate: Number
};

//Blueprint für History Schema
const historySchema = {
    team1Player1: String,
    team1Player2: String,
    team2Player1: String,
    team2Player2: String,
    scoreTeam1: String,
    scoreTeam2: String
};


const Rating = mongoose.model("Rating", ratingsSchema);
const History = mongoose.model("History", historySchema);


const player1 = new Rating({
    name: "Cengiz Gürtusgil",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const player2 = new Rating({
    name: "David Schmitt",
    rating: 1050,
    games: 0,
    wins: 0,
    winrate: 0
});


const player3 = new Rating({
    name: "Florian Hergenröder",
    rating: 977,
    games: 0,
    wins: 0,
    winrate: 0
});

const player4 = new Rating({
    name: "Jean-Paul Kindl",
    rating: 1110,
    games: 0,
    wins: 0,
    winrate: 0
});

const player5 = new Rating({
    name: "Alan Jaffery",
    rating: 1080,
    games: 0,
    wins: 0,
    winrate: 0
});

const player6 = new Rating({
    name: "Youssef Azbakh",
    rating: 1021,
    games: 0,
    wins: 0,
    winrate: 0
});

const player7 = new Rating({
    name: "Farhad Mohtashemi",
    rating: 998,
    games: 0,
    wins: 0,
    winrate: 0
});

const player8 = new Rating({
    name: "Lars Frerking",
    rating: 998,
    games: 0,
    wins: 0,
    winrate: 0
});

const player9 = new Rating({
    name: "Alexander Müller",
    rating: 983,
    games: 0,
    wins: 0,
    winrate: 0
});

const player10 = new Rating({
    name: "Daniele Brunetti",
    rating: 980,
    games: 0,
    wins: 0,
    winrate: 0
});

const player11 = new Rating({
    name: "Maike Patt",
    rating: 970,
    games: 0,
    wins: 0,
    winrate: 0
});

const player12 = new Rating({
    name: "Jahn Lossmann",
    rating: 941,
    games: 0,
    wins: 0,
    winrate: 0
});

const player13 = new Rating({
    name: "Kevin Mass",
    rating: 905,
    games: 0,
    wins: 0,
    winrate: 0
});

const player14 = new Rating({
    name: "Imanuel",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const player15 = new Rating({
    name: "Michel",
    rating: 1000,
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
    //Das ist der erhaltene body der hTTP request
    //Durch die . Notation kann ich dann auf die Attribute zugreifen
    //Die Zahlen werden als Stringe geparsed durch das Number
    //wird der string in zahlen convertiert.

    const {winner1, winner2, looser1, looser2} = req.body;

    function retrieveUser(playerName, callback) {
        //https://stackoverflow.com/a/40169645/10781526
        return Rating.findOne({name: playerName}).exec();
    }


    let a, b, c, d;

    try {
        a = await retrieveUser(winner1);
        b = await retrieveUser(winner2);
        c = await retrieveUser(looser1);
        d = await retrieveUser(looser2);

        //get new rating
        //let change = Math.round(calculateElo(a.rating, b.rating, c.rating, d.rating));
        let changeA =  Math.round(calculateEloA(a.rating,c.rating, d.rating));
        let changeB =  Math.round(calculateEloB(b.rating,c.rating, d.rating));
        let changeC = Math.round(calculateEloC(a.rating,b.rating, c.rating));
        let changeD =  Math.round(calculateEloD(a.rating,b.rating, d.rating));

        await Rating.updateOne({name: a.name}, {rating: a.rating + changeA});
        await Rating.updateOne({name: b.name}, {rating: b.rating + changeB});
        await Rating.updateOne({name: c.name}, {rating: c.rating - changeC});
        await Rating.updateOne({name: d.name}, {rating: d.rating - changeD});
        //update the games
        await Rating.updateOne({name: a.name}, {games: a.games + 1});
        await Rating.updateOne({name: b.name}, {games: b.games + 1});
        await Rating.updateOne({name: c.name}, {games: c.games + 1});
        await Rating.updateOne({name: d.name}, {games: d.games + 1});
        //update number of wins. a & b are always the winners
        await Rating.updateOne({name: a.name}, {wins: a.wins + 1});
        await Rating.updateOne({name: b.name}, {wins: b.wins + 1});
        //update winrate. +1 because we are always 1 dataset behind.
        await Rating.updateOne({name: a.name}, {winrate: Math.round(((a.wins + 1) / (a.games + 1)) * 100)});
        await Rating.updateOne({name: b.name}, {winrate: Math.round(((b.wins + 1) / (b.games + 1)) * 100)});
        await Rating.updateOne({name: c.name}, {winrate: Math.round((c.wins / (c.games + 1)) * 100)});
        await Rating.updateOne({name: d.name}, {winrate: Math.round((d.wins / (d.games + 1)) * 100)});


        await History.create({team1Player1: a.name}, {scoreTeam1: "Sieg"});
        await History.create({team1Player2: b.name});
        await History.create({team2Player1: c.name}, {scoreTeam2: "Niederlage"});
        await History.create({team2Player2: d.name});


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
    res.render("history");
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


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started on port" + port);
});



// function calculateElo(a, b, c, d) {
//     let eloTeamA = a + b;
//     let eloTeamB = c + d;
//
//     let chanceOfTeamAToWin = 1 / (1 + Math.pow(10, (eloTeamB - eloTeamA) / 400));
//     return (10 * (1 - chanceOfTeamAToWin));
// }

function calculateEloA(a, c, d) {
    let eloTeamB = (c + d)/2;

    let chanceToWin = 1 / (1 + Math.pow(10, (eloTeamB - a) / 400));
    return (10 * (1 - chanceToWin));
}
function calculateEloB(b, c, d) {
    let eloTeamB = (c + d)/2;

    let chanceToWin = 1 / (1 + Math.pow(10, (eloTeamB - b) / 400));
    return (10 * (1 - chanceToWin));
}

//those are the loosers.
function calculateEloC(a,b, c) {
    let eloTeamA = (a + b) /2;

    let chanceToWin = 1 / (1 + Math.pow(10, (c - eloTeamA )/ 400));
    return (10 * (1-chanceToWin));
}

function calculateEloD(a,b, d) {
    let eloTeamA = (a + b) /2;

    let chanceToWin = 1 / (1 + Math.pow(10, (d - eloTeamA)/ 400));
    return (10 * (1 - chanceToWin));
}


