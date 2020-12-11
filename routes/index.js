
let router = require('express').Router();

let Poll = require('./../models/poll');

router.get('/', (req, res, next) => {
    Poll.find().exec((err, polls) => {
        res.render('index', { polls });
    });
});

 router.post('/:pollId/vote', (req, res, next) => {
    const choice = req.body.choice;
    const identifier = `choices.${choice}.votes`;
    Poll.update({_id: req.params.pollId}, {$inc: {[identifier]: 1}}, {}, (err, numberAffected) => {
        let Pusher = require('pusher');
        let pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_APP_KEY,
            secret: process.env.PUSHER_APP_SECRET,
            cluster: 'eu'
        });

        let payload = { pollId: req.params.pollId, choice: choice };
        pusher.trigger('poll-events', 'vote', payload, req.body.socketId);

        res.send('');
    });

}); 

let dbo;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://mongo:27017/';


// DATABASE  

MongoClient.connect(url, (err, database) => {
  if(err) {
    return console.log(err);
  }
  dbo = database.db("pollser");
  console.log("Connected to the database")
});


var callback = function(res)
  {
    var n = res[0].choices.length;
    var i;
    var dict = {};
    for (i = 0; i < n; i++)
    {
      key = res[0].choices[i].value;
      value = res[0].choices[i].votes;
      dict[key] = value;
    }
    var highestVal = Math.max.apply(null, Object.values(dict)),
    val = Object.keys(dict).find(function(a) {
      return dict[a] === highestVal;
    });
    return val; 
    //console.log(dict);
  }


router.post('/clicked', (req, res) => {
    


  dbo.collection('polls').find({topic: 'Which music should be played next?'}).toArray((err, result) => {
    if (err) return console.log(err);
    
    val = callback(result);

    res.send({title : val});
    console.log(val);


  });
  });
  
  router.get("/getsong", function (request, response){
    var song = request.query.song;

    if (song != "") {
        console.log("The song you choose is " + song);
        
        
        var myquery = {topic: "Which music should be played next?" };
        var newvalues = { $push: {choices: {value: song, votes: 0}}};
        dbo.collection("polls").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        response.redirect('/');
        }); 


    } else {
        console.log("Please provide us a song");
    }
});




  
 


module.exports = router;
