let x = 1000;


function calculateElo(a, b, c, d, winner) {
    var eloTeamA = a + b;
    var eloTeamB = c + d;

    let chanceVonTeamAzuGewinnen = 1 / (1 + Math.pow(10, (eloTeamB - eloTeamA) / 400));
    return (10 * (1- chanceVonTeamAzuGewinnen));
}

let change = calculateElo(x, 1000, 1100, 1100);

x = x + change;
console.log(Math.round(x));


