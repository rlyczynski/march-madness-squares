var key= /*API KEY HERE*/;

function getScores() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(sheet.getSheetByName("Game Results"));
  console.info(sheet.getName() + ' - Triggered');
  
  var now = new Date(); 
  for(i = 0; i < gameTimes.length; i++) {
    var gameTime = gameTimes[i];
    if(now > gameTime.start && now < gameTime.end) {
      console.info(sheet.getName() + ' - ' + gameTime.name + ' - pulling data' )
      var url = getUrl(gameTime.start)
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
      var tournamentGames = JSON.parse(response).games.filter(isTournamentGame).sort(sortGames);
      
      for(j = 0; j < tournamentGames.length; j++){
        var game = tournamentGames[j];
        
        var row = gameTime.row + j;
        var matchupCell = SpreadsheetApp.getActiveSheet().getRange(gameTime.gameCol + row);
        var winScoreCell = SpreadsheetApp.getActiveSheet().getRange(gameTime.winScoreCol + row);
        var loseScoreCell = SpreadsheetApp.getActiveSheet().getRange(gameTime.loseScoreCol + row);

        if(!matchupCell.getValue()){
          matchupCell.setValue(getMatchup(game));
        }

        if((game.status === 'closed' || game.status === 'complete') && (!winScoreCell.getValue() || !loseScoreCell.getValue())){
          console.info(getMatchup(game) + " " + game.home_points + "-" + game.away_points);
          winScoreCell.setValue(getWinScore(game));
          loseScoreCell.setValue(getLoseScore(game));
        }
      }
    }
  }
}


var gameTimes = [
{ name: "Round of 64 Day 1", start:new Date(2018,02,15,13,15), end:new Date(2018,02,16,1,30), gameCol:'A', winScoreCol:'B',   loseScoreCol:'C',   row:3  },
{ name: "Round of 64 Day 2", start:new Date(2018,02,16,13,15), end:new Date(2018,02,17,1,30), gameCol:'A', winScoreCol:'B',   loseScoreCol:'C',   row:19 },
{ name: "Round of 32 Day 1", start:new Date(2018,02,17,13,15), end:new Date(2018,02,18,1,30), gameCol:'G', winScoreCol:'H',   loseScoreCol:'I',   row:3  },
{ name: "Round of 32 Day 2", start:new Date(2018,02,18,13,15), end:new Date(2018,02,19,1,30), gameCol:'G', winScoreCol:'H',   loseScoreCol:'I',   row:11 },
{ name: "Sweet 16 Day 1",    start:new Date(2018,02,22,20,15), end:new Date(2018,02,23,1,30), gameCol:'M', winScoreCol:'N',   loseScoreCol:'O',   row:3  },
{ name: "Sweet 16 Day 2",    start:new Date(2018,02,23,20,15), end:new Date(2018,02,24,1,30), gameCol:'M', winScoreCol:'N',   loseScoreCol:'O',   row:7  },
{ name: "Elite 8 Day 1",     start:new Date(2018,02,24,20,15), end:new Date(2018,02,25,1,30), gameCol:'S', winScoreCol:'T',   loseScoreCol:'U',   row:3  },
{ name: "Elite 8 Day 2",     start:new Date(2018,02,25,14,15), end:new Date(2018,02,25,21,30), gameCol:'S', winScoreCol:'T',   loseScoreCol:'U',   row:5  },
{ name: "Final Four",        start:new Date(2018,02,31,20,15), end:new Date(2018,03,01,1,30), gameCol:'Y', winScoreCol:'Z',   loseScoreCol:'AA',  row:3  },
{ name: "Championship",      start:new Date(2018,03,02,20,15), end:new Date(2018,03,03,1,30), gameCol:'AE', winScoreCol:'AF', loseScoreCol:'AG',  row:3  },
]


function getDateString(date){
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getYear();
  
  return year + '/' + month + '/' + day;
}

function getUrl(date){
  return 'http://api.sportradar.us/ncaamb/trial/v4/en/games/' + getDateString(date) + '/schedule.json?api_key=' + key;
}

function isTournamentGame(game){
  var str = game.title;
  return str.indexOf('Midwest Regional') > -1
  || str.indexOf('West Regional') > -1
  || str.indexOf('South Regional') > -1
  || str.indexOf('East Regional') > -1
  || str.indexOf('Final Four') > -1
  || str.indexOf('National Championship') > -1;
}

function getMatchup(game){
  return game.home.alias + " v. " + game.away.alias;
}

function getWinScore(game){
  if(game.home_points > game.away_points)
  {
    return game.home_points;
  }

  return game.away_points
}

function getLoseScore(game){
  if(game.home_points < game.away_points){
    return game.home_points;
  }

  return game.away_points
}

function sortGames(a, b){
  if(a.title === b.title){
    return 0;
  } else {
    return a.title < b.title ? -1 : 1;
  }
}