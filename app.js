const express = require('express');
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
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
mongoose.connect("mongodb://localhost:27017/ratingDB", {
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

const Rating = mongoose.model("Rating", ratingsSchema);

const player1 = new Rating({
    name: "cengiz",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const player2 = new Rating({
    name: "david",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});


const player3 = new Rating({
    name: "flo",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const player4 = new Rating({
    name: "andi",
    rating: 1000,
    games: 0,
    wins: 0,
    winrate: 0
});

const defaultPlayers = [player1, player2, player3, player4];


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


        // let sortedPlayers = []
        // foundRecords.forEach(function (item) {
        //     item.rating
        //
        // });


        foundRecords.sort((player1, player2) => player2.rating - player1.rating);

        res.render("ranking", {
            ratingArray: foundRecords,
            nameArray: foundRecords
        });
    });
});


app.post("/register", function (req, res) {
    const newEntry = new Rating({
        name: req.body.playername,
        rating: 1000.0,
        games: 0
    });

    newEntry.save();
    res.redirect("/");


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
        let change = Math.round(calculateElo(a.rating, b.rating, c.rating, d.rating));

        await Rating.updateOne({name: a.name}, {rating: a.rating + change});
        await Rating.updateOne({name: b.name}, {rating: a.rating + change});
        await Rating.updateOne({name: c.name}, {rating: c.rating - change});
        await Rating.updateOne({name: d.name}, {rating: d.rating - change});

        //update the games
        await Rating.updateOne({name: a.name}, {games: a.games + 1});
        await Rating.updateOne({name: b.name}, {games: b.games + 1});
        await Rating.updateOne({name: c.name}, {games: c.games + 1});
        await Rating.updateOne({name: d.name}, {games: d.games + 1});
        //update number of wins. a & b are always the winners
        await Rating.updateOne({name: a.name}, {wins: a.wins + 1});
        await Rating.updateOne({name: b.name}, {wins: b.wins + 1});

        //update winrate. This is probably wrong. IDK how to divide in a db query
        await Rating.updateOne({name: a.name}, {winrate: Math.round((a.wins / a.games) * 100)});
        await Rating.updateOne({name: b.name}, {winrate: Math.round((b.wins / b.games) * 100)});
        await Rating.updateOne({name: c.name}, {winrate: Math.round((c.wins / c.games) * 100)});
        await Rating.updateOne({name: d.name}, {winrate: Math.round((d.wins / d.games) * 100)});


    } catch (e) {
        console.log(e);
    }

    res.redirect("/");


});

app.listen(port, function () {
    console.log("Server started on port" + port);
});


function calculateElo(a, b, c, d) {
    var eloTeamA = a + b;
    var eloTeamB = c + d;

    let chanceVonTeamAzuGewinnen = 1 / (1 + Math.pow(10, (eloTeamB - eloTeamA) / 400));
    return (10 * (1 - chanceVonTeamAzuGewinnen));
}