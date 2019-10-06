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
app.use(express.static("public"))

//Body Parser um Infos aus Post zu parsen
app.use(express.urlencoded({
    extended: true
}));

//Connecte und erstelle Rating DB
mongoose.connect("mongodb://localhost:27017/ratingDB", {
    useNewUrlParser: true
})

//Erstelle Blueprint für Rating Tabelle. Immer in Plural
const ratingsSchema = {
    name: String,
    rating: Number
}

const Rating = mongoose.model("Rating", ratingsSchema);

const player1 = new Rating({
    name: "cengiz",
    rating: 1000
})

const player2 = new Rating({
    name: "david",
    rating: 1000
})


const player3 = new Rating({
    name: "flo",
    rating: 1000
})

const player4 = new Rating({
    name: "andi",
    rating: 1000
})

const defaultPlayers = [player1, player2, player3, player4];





app.get("/", function (req, res) {
    Rating.find({}, function (err, foundRecords) {
        if (err) {
            console.log(err);
        } else {
            if (foundRecords.length === 0) {
                Rating.insertMany(defaultPlayers, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully saved default players to DB");
                    }
                })
            } else {
                res.render("ranking", {
                    ratingArray: foundRecords
                });
            }
        }
    });
});


app.post("/", function (req, res) {
    //Das ist der erhaltene body der hTTP request
    //Durch die . Notation kann ich dann auf die Attribute zugreifen
    //Die Zahlen werden als Stringe geparsed durch das Number 
    //wird der string in zahlen convertiert.
    var winner1 = req.body.winner1;
    var winner2 = req.body.winner2;
    var looser1 = req.body.looser1;
    var looser2 = req.body.looser2;

    //uname = winner 1

    let a = String;
    function retrieveUser(winner1, callback) {
        Rating.find({name: winner1}, function(err, users) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, users[0]);
          }
        });
      };

      retrieveUser(winner1, function(err, user) {
        if (err) {
          console.log(err);
        }
         //Do Something with user here
         console.log(user.rating);
      });
         //Hier nicht mehr 
   
      
     
 
    // Rating.find({name:winner1},{_id: 0, rating:1}, function(err,foundEntryOfPlayer1){
    //     if(err){ 
    //         console.log(err)
    //     }else {
    //        console.log(foundEntryOfPlayer1);
    //     }
    // });

    


    // Rating.find({name:winner2},{_id: 0, name:1}, function(err,foundEntryOfPlayer2){
    //     if(err){ 
    //         console.log(err)
    //     }else {
    //        console.log(foundEntryOfPlayer2);
        
    //     }
    // });

    // Rating.find({name:looser1},{_id: 0, name:1}, function(err,foundEntryOfPlayer3){
    //     if(err){ 
    //         console.log(err)
    //     }else {
    //        console.log(foundEntryOfPlayer3);
        
    //     }
    // });

    // Rating.find({name:looser2},{_id: 0, name:1}, function(err,foundEntryOfPlayer4){
    //     if(err){ 
    //         console.log(err)
    //     }else {
    //        console.log(foundEntryOfPlayer4);
        
    //     }
    // });


    // const newEntry = new Rating({
    //     name: nameOfNewPlayer,
    //     rating: 1000.0
    // });

    // res.redirect("/");
});

app.listen(port, function () {
    console.log("Server started on port" + port);
});


function calculateElo(a, b, c, d) {
    var eloTeamA = a + b;
    var eloTeamB = c + d;

    let chanceVonTeamAzuGewinnen = 1 / (1 + Math.pow(10, (eloTeamB - eloTeamA) / 400));
    return (10 * (1- chanceVonTeamAzuGewinnen));
}