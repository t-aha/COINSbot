// EMAIL SCRAPER for COINS
// email me (taha19@vt.edu) if this breaks
// v1: March 2023

// add rebalance dates here so jarvis can ignore them when compiling previous trades
rebalanceDates = ["03-06-23", "03-13-23", "08-23-23"]
masterList = ['BAL','BNO','CANE','CORN','COW','CPER','IAU','JO','SLV','SOYB','UGA','UNG','USO','WEAT']

// returns daily table of portfolio positions
// checkcout is number of emails to check through (so you don't go through every email since 2013)
var checkcount = 5
// startcount is the index to start checking at (should be 0) 
var startcount = 0
// 
function getEmails_(q) {
    var emails = [];
    var threads = GmailApp.search(q, startcount, checkcount);
    for (var i in threads) {
      var filed = GmailApp.getUserLabelByName("Filed");
      var labels = threads[i].getLabels();
      //  
      if (labels.length == 0) {
        // if true, email has not been filed yet
        // threads[i].addLabel(filed)
        console.log("Digest email no. " + (i) + " of " + checkcount)
        var msgs = threads[i].getMessages();
        for (var j in msgs) {

            var arrStr = msgs[j].getBody()
              .replace(/<\/tr>/gm, '[/tr]')
              .replace(/<\/td>/gm, '[/td]')
              .replace(/<.*?>/g, '')
              .replace(/^\s*\n/gm, '')
              .replace(/^\s*\r/gm, '')
              .replace(/^\s*/gm, '')
              .replace(/\s*\n/gm, '')
              .replace(/\s*\r/gm, '')
              .replace(/\s/g, "") 
              .split("[/tr]");

            var line = [];

            for (var i = 0; i < arrStr.length - 1; i++) {

              line = arrStr[i].split("[/td]");
              line.length -= 1;
              if (ticksCheck(line)) {
                //console.log(line)
                emails.push(line);
              }
            }
        }
        
      }
    }
    return emails;
}

// returns array of trade executions
//
// checkcountTrades is the number of trade emails to scan through
var checkcountTrades = 25
//
function getTrades_(q) {
    var emails = [];
    var threads = GmailApp.search(q, 0, checkcountTrades);
    
    for (var i in threads) {
      var filed = GmailApp.getUserLabelByName("Filed");
      var labels = threads[i].getLabels();
      
      if (labels.length == 0) {
        // if true, email has not been filed yet
        threads[i].addLabel(filed)
        console.log("Trade email no. " + (i) + " of " + checkcountTrades)
        var msgs = threads[i].getMessages();
        for (var j in msgs) {
            
            var arrStr = msgs[j].getBody()
              .replace(/<\/tr>/gm, '[/tr]')
              .replace(/<\/td>/gm, '[/td]')
              .replace(/<.*?>/g, '\n')
              .replace(/^\s*\n/gm, '')
              .replace(/^\s*/gm, '')
              .replace(/\s*\n/gm, '\n')
              .split("[/tr]");

            var line = [];

            for (var i = 0; i < arrStr.length - 1; i++) {

              line = arrStr[i].split("[/td]");
              
              //line.length -= 1;
              if (line.length > 1 && line[1].startsWith("\nYour order below")) {
                line.push(Utilities.formatDate(msgs[j].getDate(), "EST", "MM/dd/yyyy HH:mm"))
                emails.push(line);
                
              }
            }
        }
      }
    }
    //console.log(emails)
    return emails;
}

// returns portfolio balances and dates checkcount times
function getQuotes_(q) {
    var emails = [];
    var threads = GmailApp.search(q, startcount, checkcount);
    for (var i in threads) {
      var filed = GmailApp.getUserLabelByName("Filed");
      var labels = threads[i].getLabels();
      // 
      if (labels.length == 0) {
        // if true, email has not been filed yet
        threads[i].addLabel(filed) // should not be commented out in production
        console.log("Digest no. " + i + " of " + checkcount)
        var msgs = threads[i].getMessages();
        for (var j in msgs) {

            var arrStr = msgs[j].getBody()
              .replace(/<\/tr>/gm, '[/tr]')
              .replace(/<\/td>/gm, '[/td]')
              .replace(/<.*?>/g, '\n')
              .replace(/^\s*\n/gm, '')
              .replace(/^\s*/gm, '')
              .replace(/\s*\n/gm, '\n')
              .split("[/tr]");

            var line = [];

            for (var i = 0; i < arrStr.length - 1; i++) {
              //
              line = arrStr[i].split("[/td]");
              line.length -= 1;
              //console.log(line)
              if (line.length > 1 && (line[0].startsWith("\r&nbsp; \rM") || line[0].startsWith("\r&nbsp;\nM"))) {
                //console.log(line);
                emails.push(line[0]);
              }
              if (line.length > 1 && line[1].startsWith("\nPortfolio Digest\nAs of")) {
                emails.push(line[1]);
              }
              
            }
        }
      }
    }
    return emails;
}

var monthtbl = {'Jan' : '01','Feb' :'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug': '08','Sep' : '09','Oct' : '10','Nov' : '11','Dec' : '12'}
function readableOptionTckr(t) {
  out = ""
  if (t.length == 21) {
    out += t.substring(0,t.indexOf("-"))
    out += t.substring(8,12)
    out += t.substring(6,8)
    out += t.substring(12,13)
    return out
  } else {
    tmp = t.split(" ")
    out += tmp[0]
    out += monthtbl[tmp[1]]
    out += tmp[2]
    out += tmp[3].substring(5,7)
    out += tmp[5].substring(0,1)
    //out += t.substring(t.indexOf(" ")[0], t.indexOf(" ")[1])
    return out
  }
}

// helper function for getEmails, contains ticker names that the scraper should look for
// corresponds to row titles on spreadsheet
function ticksCheck(line) {
  var out = true;

  if (line.length < 10)
    return false;
  
  if (line[0].length > 10){
    line[0] = readableOptionTckr(line[0])
  }
  return out;
}

// converts array to load on spreadsheet
function convert2Array_(array2d)
{
  // get max width
  var res = [];
  var w = 0;
  for (var i = 0; i < array2d.length; i++)
  {
    if (array2d[i].length > w) {w = array2d[i].length;}    
  }

  var row = [];
  for (var i = 0; i < array2d.length; i++)
  {
    row = array2d[i];
    if(array2d[i].length < w)
    {
      for (var ii = array2d[i].length; ii < w; ii++)
      {
        row.push('');
      }  
    }
    res.push(row);
  }
  return res;
}

// converts trades to load on spreadsheet
function convertColumn_(array2d)
{
  
  var out = [];
  for (var w = 0; w < array2d.length; w++) {
    out.push(array2d[w][1].split("\n"));
    out[w].push(array2d[w][4])
  }

  var tmp = [];
  var row = [];
  for (x of out) {
    if (x.length == 20)
    {
      // successfully executed trade
      tmp.push(x[5], x[7], "Successful", x[9], x[11], x[13], x[15], x[17], x[17], 0, x[19]);
    } else if (x.length == 18) {
      tmp.push(x[5], x[7], "Cancelled", x[9], x[11], x[13], 0, x[15], 0, x[15], x[17]);
    } else {
      // partially executed trade
      tmp.push(x[5], x[7], "Partial", x[9], x[11], x[13], x[15], x[17], x[19], x[21], x[23])
    }
    row.push(tmp);
    tmp = [];
  }
  for (r in row) {
    if (row[r][3].length > 5) {
      row[r][3] = readableOptionTckr(row[r][3])
    }
  }
  return row;
}

// converts portfolio values for spreadsheet
function convertQuotes_(array2d)
{
  var out = [];
  for (el of array2d) {
    out.push(el.split("\n"));
  }
  //console.log(out)
  var tmp = [];
  var res = [];
  var row = [];
  
  // lines on 252 and 255 are for newer emails
  for (var j = 0; j < out.length; j++) {
    if (j % 2 == 0) {
      tmp.push(out[j][2].substr(9,8) + out[j][2].substr(26,4)) 
      //tmp.push(out[j][2].substr(11,6) + " " + out[j][2].substr(27,4)) 
    } else {
      tmp.push(out[j][1].substr(14,13))
      //tmp.push(out[j][0].substr(23,13))
    }
    row.push(tmp)
    tmp = [];
  }
  
  for (var k = 0; k < row.length/2; k++) {
    res.push([row[2*k], row[2*k+1]])
  }
  return res;
}

function appendData_(sheet, array2d) {

    if (array2d.length == 0) {
      Logger.log("No unfiled portfolio digests detected, cheers!")
      return
    }
    var h = array2d.length;
    var l = array2d[0].length;

    var range = sheet.getRange(2, 1, h, l)
    range.insertCells(SpreadsheetApp.Dimension.ROWS);
    range.setValues(array2d);
} 

function appendCol_(sheet, array2d) {
  if (array2d.length == 0) {
    Logger.log("No unfiled trade emails detected, cheers!")
    return
  }
  var range = sheet.getRange(2, 1, array2d.length, array2d[0].length)
  range.insertCells(SpreadsheetApp.Dimension.ROWS);
  range.setValues(array2d);
} 

function appendQuo_(sheet, array2d) {
  if (array2d.length == 0) {
    Logger.log("No unfiled portfolio emails detected, cheers!")
    return
  }
  var range = sheet.getRange(2, 1, array2d.length, array2d[0].length)
  range.insertCells(SpreadsheetApp.Dimension.ROWS);
  range.setValues(array2d);
}

function getPortfolio() {
  // sheet 1, 
  var q = 'subject:"Your portfolio digest"';
  var array2d = getEmails_(q);  
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Holdings');
  appendData_(sheet, convert2Array_(array2d));
}

function getTrades() {
  var q = '"Your order below was"';
  var array2d = getTrades_(q);  
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Trades');
  appendCol_(sheet, convertColumn_(array2d));
  //console.log(array2d)
  if (array2d.length != 0)
  {
    //console.log("array non empty")
    autoResponder(sheet);
  }
}

function getBalances() {
  var q = 'subject:"Your portfolio digest"';  
  var array2d = getQuotes_(q);  
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Overall');
  appendQuo_(sheet, convertQuotes_(array2d));
}

function doEverything() {
  getPortfolio()
  getBalances()
}

function currPositions() {
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Holdings');
  h = sheet.getSheetValues(2, 1, 50, 7);
  out = []
  firstTick = h[0][0]
  for (var i in h) {
    if (i != 0 && h[i][0] == firstTick) {
      break
    }
    out.push(h[i])
  }
  return out
}

function getOptions(tckr) {
  h = currPositions()
  tlist = transpose(h)[0]
  out = []
  for (var t in tlist) {
    if (tlist[t].startsWith(tckr)) {
      out.push(tlist[t])
    }
  }

  return out
}

var botId = "f5e549c4c7034a30678fe4ba34";
function sendText(text){
  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", {"method":"post", "payload":'{"bot_id":"' + botId + '","text":"' + text + '"}'})
}

// ///////////////////////////////////////////////////////////////////////////////////////////
//               
//            BOT COMMANDS DEFINED HERE
//
//

//respond to messages sent to the group. Recieved as POST
//this method is automatically called whenever the Web App's (to be) URL is called
function doPost(e){
  var post = JSON.parse(e.postData.getDataAsString());
  var text = post.text;
  var name = post.name
  var output = ""
  var ht = false

  if (name == "HokieTerminal User") {ht = true}
  
  if(text.toLowerCase().substring(0, 3) == "!hi"){
    output = "How are you, " + name + "?"
  }

  if(text.toLowerCase().substring(0, 6) == "!value"){
    var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Overall');
    e = sheet.getSheetValues(2, 1, 1, 2)[0];
    output = "As of " + Utilities.formatDate(e[0], "GMT+1", "MM-dd-yyyy") + ", the COINS portfolio is worth $" + e[1].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }

  if(text.toLowerCase().substring(0, 5) == "!cash"){
    var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Overall');
    e = sheet.getSheetValues(2, 1, 1, 2)[0];

    h = currPositions()
    cash = 0

    for (var i in h) {
      cash += (h[i][2] * h[i][6])
    }

    tmp = e[1] - cash

    output = "As of " + Utilities.formatDate(e[0], "GMT+1", "MM-dd-yyyy") + ", the COINS cash position is $" + tmp.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }

  if(text.toLowerCase().substring(0,6) == "!trade") {
    if (text.substring(7) == "") {
      output = "Please specify a ticker."
    } else {
      output = tradething((text.substring(7).trim()).toUpperCase())
    }
  }

  if (text.toLowerCase().substring(0,5) == "!prev") {
    if (text.substring(6) == "") {
      output = "Please specify a ticker."
    } else {
      tck = (text.substring(6).trim()).toUpperCase()
      tmp = getOptions(tck)
     
      for (var o in tmp) {
        output += tradeHistory(tmp[o]) + "\\n"
      }
    }
  }

  if (text.toLowerCase().substring(0,6) == "!total") {
    if (text.substring(7) == "") {
      for (var m in masterList) {
        sum = 0
        tmp = getOptions(masterList[m])
        for (var o in tmp) {
          sum += tradeHistoryCalc(tmp[o])
        }
        output += masterList[m] + " ~ $" + sum.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + "\\n"
      }
      
    } else {
      sum = 0
      tmp = getOptions((text.substring(7).trim()).toUpperCase())
      for (var o in tmp) {
        sum += tradeHistoryCalc(tmp[o])
      }
      output = "💸 So far this semester, " + text.substring(7) + " has made $" + sum.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
    }
  }

  if (text.toLowerCase().substring(0,5) == "!lead") {
    output = leaderboard()
  }

  if (text.toLowerCase().substring(0,5) == "!help") {
    outs = "How to interact with the bot:" + "\\n" + "\\n"
    outs += "1) !calc [ticker] [# shares] [limit] = calculates $$ for potential trade" + "\\n"
    outs += "2) !cash = returns current cash position" + "\\n"
    outs += "3) !count [ticker] = returns # of trades made for that ticker so far" + "\\n"
    outs += "4) !lead = displays leaderboard based on efficiency per share" + "\\n"
    outs += "5) !open = displays list of tickers with open trades" + "\\n"
    outs += "6) !prev [ticker] = lists all trades made this semester" + "\\n"
    outs += "7) !trade [ticker] = shows status of last trade or any open trade" + "\\n"
    outs += "8) !value = returns COINS portfolio value" + "\\n"+"\\n"

    outs += "Please note that portfolio value and cash position only update at end of day. "
    outs += "If anything breaks let Taha know at 804-528-9318. Thanks!"
    output = outs
  }

  if (text.substring(0,4) == "bruh") {
    let tmp1 = Math.floor(Math.random()*100)
    if (tmp1 % 4 == 0) {
      output = "BRUH 😤"
    } else if (tmp1 % 4 == 1) {
      output = "BRUH 😂"
    } else if (tmp1 % 4 == 2) {
      output = "BRUH 😭"
    } else if (tmp1 % 4 == 3) {
      output = "BRUH 💀"
    }
  }

  if (text.toLowerCase().substring(0,5) == "!calc") {
    if (text.substring(6) == "") {
      output = "Try !calc [ticker] [# shares] [limit]"
      return
    }
    output = testtr(text.toLowerCase())
  }

  if (text.toLowerCase().substring(0,5) == "!open") {
    h = currPositions()
    tckrs = transpose(h)[0]
    outs = ""
    for (var t in tckrs) {
      if (opentr(tckrs[t])) {
        outs += tckrs[t] + "\\n"
      }
    }
    output = outs
  }

  if (text.toLowerCase().substring(0,6) == "!count") {
    if (text.substring(7) == "") {
      tckrs = masterList
      outs = ""
      for (var t in tckrs) {
        outs += tckrs[t]+": "+notr(tckrs[t]) + "\\n"
      }
      output = outs
    } else {
      output = text.substring(7).trim().toUpperCase() + " has made " + notr(text.substring(7).trim().toUpperCase()) + " trades this semester"
    }
  }

  if (ht) {
    return ContentService.createTextOutput(output)
  } else {
    sendText(output)
  }
}

// =======================================================================================

function autoResponder(e){
    
 var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Trades');
 e = sheet.getSheetValues(2, 1, 1, 11)[0];
 console.log(e)
 let type = e[1];
 let tick = e[3];
 let price = e[6];
 let quan = e[7];
 let frq = e[8];
 out = ""
 if (frq == quan) {
  out += ("‼️ " + type.toUpperCase() + " order for " + tick + " executed for " + quan + " shares at $" + price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " per share ‼️");
  if (!opentr(tick)) {
    out += "\\n"
    out += tradething(tick)
  }
 }
 UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", {"method":"post", "payload":'{"bot_id":"' + "1d4ebc08ad27293e670547d08c" + '","text":"' + out + '"}'})
}

function isRebalanceDate(dat) {
  
  for (var d in rebalanceDates) {
    //Logger.log(dat)
    if (dat == rebalanceDates[d]) {
      return true
    }
  }
  return false
}

// this function is for trades in the groupme chat
function tradething(tckr) {
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Trades');
  h = sheet.getSheetValues(2, 1, 250, 11);
  let profit = 0;

  let tradeClosed = !opentr(tckr) // check to see if trade has closed
  trds = retTrades(tckr)
  // Logger.log(trds)
  if (trds.length == 0) {
    return "No trades with ticker " + tckr + "."
  }
  
  let o = []
  let outs = ''
  let totalTradeVol = trds[0][7]

  if (tradeClosed) {
    // we want last trades that closed
    let i = 1
    let volsum = trds[0][7]
    totalTradeVol = volsum
    let p = trds[0][1]
    o.push(trds[0])
    while (volsum != 0) {
      o.push(trds[i])
      if (trds[i][1] == p) {
        volsum = volsum + trds[i][7]
      } else {
        volsum = volsum - trds[i][7]
      }
      if (volsum > totalTradeVol) { totalTradeVol = volsum }
      i = i+1
    }
  } else {
    o.push(trds[0])
  }
  //Logger.log(o)
  before = o[o.length - 1]
  outs += "Ticker " + before[3] + " had " + before[1].toUpperCase() +  " order on " + Utilities.formatDate(before[10], "GMT+1", "MM-dd") + " for total " + totalTradeVol + " contracts for $" + before[6].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " each" + "\\n"

  if (tradeClosed) {
    // CLOSED TRADE
    after = o[0]
    outs += "Ticker " + after[3] + " had " + after[1].toUpperCase() +  " order on " + Utilities.formatDate(after[10], "GMT+1", "MM-dd") + " for total " + totalTradeVol + " contracts for $" + after[6].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " each" + "\\n" + "\\n"

    if (before[1] == "Buy") {
      profit = totalTradeVol * (after[6] - before[6])
    } else {
      profit = totalTradeVol * (before[6] - after[6])
    }
    if (profit > 0) {
      outs += "This trade made $" + profit.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " 🔥📈🔥"
      return outs
    } else {
      outs += "This trade made $" + profit.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " 😔📉😩"
      return outs
    }

  } else {
    // OPEN TRADE
    h = currPositions();
    tmp = 0;
    for (var k in h) {
      if (h[k][0] == tckr) {
          tmp = k;
          break;
      }
    }
    curp = h[tmp][2]
    if (before[1] == "Buy") {
      ret = totalTradeVol * (curp - before[6])
    } else {
      ret = totalTradeVol * (-before[6] + curp)
    }
    outs += "The current price of " + before[3] + " is $" + curp.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ". This trade is currently making $" + ret.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " at " + (0.01 * ret / (curp)).toFixed(2) + "% return"
    return outs
  }
}

function retTrades(tckr) {
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Trades');
  h = sheet.getSheetValues(2, 1, 250, 11);
  // fix this so it changes every semester
  var date02 = new Date(2023, 1, 10);
  arr = []

  for (var k in h) {
    if (h[k][3] == tckr && h[k][7] == h[k][8] && h[k][10].valueOf() > date02.valueOf()) 
    {
      
      if (!isRebalanceDate(Utilities.formatDate(h[k][10], "GMT+1", "MM-dd-YY"))) {
        //console.log(k)
        arr.push(h[k])
      }
    }
  }
  //console.log(arr)
  return arr
}

function tradeHistory(tckr) {
  let arr = retTrades(tckr)
  let outs = "\\n"
  if (arr.length == 0) {
    return "No trades made this semester!"
  }
  outs += "📖 Previous trades for " + tckr +" 📖"+"\\n" + "\\n"
  for (var i in arr) {
    outs = outs + "["+Utilities.formatDate(arr[i][10], "GMT+1", "MM-dd")+"] "+arr[i][1]+" "+arr[i][7]+" shares at $"+arr[i][6].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
    outs = outs + "\\n"
  }
  return outs
}

function compareRets(a, b) {
  if(a[1] < b[1])
    return 1;
  if(a[1] > b[1])
    return -1;
  return 0;
}

function tradeHistoryCalc(tckr) {
  let arr = retTrades(tckr)
  if (arr.length == 0 || arr.length == 1){
    return 0
  }
  parity = 0;
  tshare = 0;
  for (p in arr) {
    if (arr[p][1] == "Buy") {
      parity++;
      tshare += arr[p][7]
    } else {
      parity--
      tshare -= arr[p][7]
    }
  }
  //console.log(parity)
  //console.log(tshare)
  let sum = 0
  let start = 0
  if (parity != 0 && tshare != 0){
    // open trade
    start = 1
  }
  for (var j = start; j < arr.length; j = j + 1) {
    if (arr[j][1] == "Buy") {
      sum = sum - arr[j][7]*arr[j][6] 
    } else {
      sum = sum + arr[j][7]*arr[j][6]
    }
  }
  return sum
}

function transpose(a) {
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}

const average = array => array.reduce((a, b) => a + b) / array.length;

function leaderboard() {
  tckrs = masterList
  arr0 = []
  
  for (var t in tckrs) {
    //console.log(tckrs[t])
    
    tmp = []
    tmp.push(tckrs[t])
    if (retTrades(tckrs[t]).length == 0) {
      tmp.push(0)
    } else {
      tmp.push( tradeHistoryCalc(tckrs[t]) / average(transpose(retTrades(tckrs[t]))[6]))
    }
    arr0.push(tmp)
  }
  //console.log(arr0)
  arrSort = arr0.sort(compareRets)
  let outs = "\\n"
  outs += "🏆 Leaderboard as of "+Utilities.formatDate(new Date(), "GMT+1", "MM/dd")+" 🏆"
  outs += "\\n" + "\\n"
  for (var i = 1; i < 6; i++) {
    outs += i+") "+arrSort[i-1][0]+" - "+arrSort[i-1][1].toFixed(2) + "\\n"
  }
  return outs
}

function testtr(command) {
  var splits = command.split(" ")
  if (splits.length < 3) {
    return "Not enough arguments. Ex. !calc [ticker] [# shares] [limit]"
  }

  tckr = splits[1].toUpperCase()
  h = currPositions()
  tmp = 0;
  shr = 0;

  for (var k in h) {
    if (h[k][0] == tckr) {
        tmp = h[k][2];
        shr = h[k][6];
        break;
    }
  }

  if (tmp == 0) {
    return "Could not find ticker " + tckr
    }
  if (isNaN(splits[2])) {
    return "Shares must be a number"
  }

  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Overall');
  e = sheet.getSheetValues(2, 1, 1, 2)[0];
  cash = 0

  for (var i in h) {
    cash += (h[i][2] * h[i][6])
  }

  if (splits.length == 3) {
    
    am = splits[2]*tmp
    cashpos = e[1] - cash - am

    return "This would cost $" + am.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ". Remaining cash in the portfolio would be $" + cashpos.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  
  } else {
    if (isNaN(splits[3])) {
      return "Limit must be a number"
    }
    am = (splits[3]-tmp)*splits[2]
    cashpos = e[1] - cash - am
    absoluteRet = am / (tmp * shr)

    return "This would cost $" + am.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + " with "+ absoluteRet.toFixed(2)+ "% return. Remaining cash in the portfolio would be $" + cashpos.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')

  }
}

function opentr(tckr) {
  var sheet = SpreadsheetApp.openById('1v8wpfslSvUhSpodNEyYnK18zqKxKuE9j48g9QooNWJc').getSheetByName('Trades');
  h = sheet.getSheetValues(2, 1, 250, 11);
  // fix this so it changes every semester
  var date02 = new Date(2022, 1, 10);
  arr = []

  for (var k in h) {
    if (h[k][3].startsWith(tckr) && h[k][7] == h[k][8] && h[k][10].valueOf() > date02.valueOf()) 
    {
      // Logger.log(Utilities.formatDate(h[k][10], "GMT+1", "MM-dd-YY"))
      if (!isRebalanceDate(Utilities.formatDate(h[k][10], "GMT+1", "MM-dd-YY"))) {
        // console.log(k)
        arr.push(h[k])
      }
    }
  }
  //console.log(arr)
  
  if (arr.length == 0){
    return false
  }
  if (arr.length == 1){
    return true
  }
  parity = 0;
  tshare = 0;
  for (p in arr) {
    if (arr[p][1] == "Buy") {
      parity++;
      tshare += arr[p][7]
    } else {
      parity--
      tshare -= arr[p][7]
    }
  }

  if (parity != 0 && tshare != 0){
    // open trade
    return true
  } else {
    return false
  }
}


function notr(tckr) {
  tmp = getOptions(tckr)
  out = 0
  for (var o in tmp) {
    out += retTrades(tmp[o]).length
  }
  return out
}

function testing() {
  //Logger.log(tradething("CORN"))
  tcks= ['BNO','CANE','USO']
  for (var tckr in tcks) {
    tmp = tcks[tckr]
    Logger.log(tmp)
    Logger.log(opentr(tmp))
    //Logger.log(tradeHistory(tmp))
    sendText(tradething(tmp))
  }
  
}
