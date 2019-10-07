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
    rating: Number
};
 
const Rating = mongoose.model("Rating", ratingsSchema);
 
const player1 = new Rating({
    name: "cengiz",
    rating: 1000
});
 
const player2 = new Rating({
    name: "david",
    rating: 1000
});
 
 
const player3 = new Rating({
    name: "flo",
    rating: 1000
});
 
const player4 = new Rating({
    name: "andi",
    rating: 1000
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
        res.render("ranking", {
            ratingArray: foundRecords
        });
    });
});
 
 
app.post("/", async function (req, res) {
    //Das ist der erhaltene body der hTTP request
    //Durch die . Notation kann ich dann auf die Attribute zugreifen
    //Die Zahlen werden als Stringe geparsed durch das Number
    //wird der string in zahlen convertiert.
    const {winner1, winner2, looser1, looser2} = req.body;
 
    //uname = winner 1
 
   
 
    function retrieveUser(playerName, callback) {
        //https://stackoverflow.com/a/40169645/10781526
        return Rating.findOne({name: playerName}).exec();
    }
    
 
    let a,b,c,d;
    
    try {
        a = await retrieveUser(winner1);
        b = await retrieveUser(winner2);
        c = await retrieveUser(looser1);
        d = await retrieveUser(looser2);
        
        let change =  Math.round (calculateElo(a.rating,b.rating,c.rating,d.rating));
        //hier gehts
        await Rating.updateOne({name: a.name},  {rating: a.rating + change });
        await Rating.updateOne({name: b.name},  {rating: a.rating + change });
        await Rating.updateOne({name: c.name},  {rating: c.rating - change });
        await Rating.updateOne({name: d.name},  {rating: d.rating - change });
        

    } catch (e) {
        console.log(e);
    }

    res.redirect("/");
    
   
    //hier nicht
    //await Rating.updateOne({name: "andi"},  {rating: 900});
 
 
   
   
   
//    console.log("neues a ist" + (a.rating + change));
//    console.log("neues b ist" + (b.rating + change));
//    console.log("neues c ist" + (c.rating - change));
//    console.log("neues d ist" + (b.rating - change));





   
  
  
 
    // const newEntry = new Rating({
    //     name: nameOfNewPlayer,
    //     rating: 1000.0
    // });
 
    
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