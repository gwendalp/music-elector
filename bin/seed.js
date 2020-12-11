#!/usr/bin/env node

require('mongoose').connect('mongodb://mongo:27017/pollser');

const topics = [
    "Which music should be played next?"
];

const Poll = require('../models/poll');

// empty the collection first
Poll.remove({})
    .then(() => {
        let polls = [];
        for (let i = 0; i < 1; i++) {
            polls.push({
                topic: topics[i],
                choices: [
                    {
                        value: "Like a Rolling Stone",
                        votes: 0
                    },
                    {
                        value: "(I Can't Get No) Satisfaction",
                        votes: 0
                    },
                    {
                        value: "Breakfast in America",
                        votes: 0
                    }
                    



                    

                ]
            });
        }
        return Poll.create(polls);
    })
    .then(() => {
        process.exit();
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
