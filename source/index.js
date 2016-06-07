
'use strict';

var APP_ID = 'undefined'; //for now

var https = require('https');

var AlexaSkill = require('./AlexaSkill');

var url = ''; //figure out which api to use

var pagination = 3;

var delimiter = 2;

var RecipeFinder = function() {
  AlexaSkill.call(this,APP_ID);  
};

RecipeFinder.prototype = Object.create(AlexaSkill.prototype); //inherits from AlexaSkill(all AS methods available on RF)

RecipeFinder.prototype.constructor = RecipeFinder; //constructor refers to RF instead of AS

RecipeFinder.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest,session) {
    console.log("RecipeFinder onsession started requestid: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};

RecipeFinder.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log("RecipeFinder onlaunch requestid: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    
    getWelcomeResponse(response);
};

RecipeFinder.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest,session) {
    console.log("RecipeFinder sessionended requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
};

RecipeFinder.prototype.intentHandlers = {
    
    "GetRecipeFromIngredients": function(intent,session,response) {
        handleGetRecipe(intent, session, response);
    },
    
    "GetNextEventIntent": function(intent,session,response) {
        handleNextEventRequest(intent,session,response);
    },
    
    "RepeatIntent": function(intent,session,response) {
        handleRepeatRequest(intent,session,response);
    },
    
    "AMAZON.HelpIntent": function(intent,session,response) {
        var helperText = "With Make This With That, you can find a recipe based on the ingredients you have at home. " + "Say the ingredients you want to use, for example, potatoes, or you can say exit. Let's get cooking!";
        
        var reprompt = "What ingredients do you want to use?";
        var speechOutput = {
            speech:helperText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        
        var repromptOutput = {
            speech:reprompt,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput,repromptOutput);
    },
    
    "AMAZON.StopIntent": function(intent, session,response) {
        var speechOutput = {
            speech: "Goodbye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },
    
    "AMAZON.CancelIntent": function(intent,session,response) {
        var speechOutput = {
            speech: "Goodbye",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

function getWelcomeResponse(response) {
    var cardTitle = "With your ingredients, you can make";
    var reprompt = "With Make This With That, you can find a recipe for ingredients you have at home. Let's get cooking! Say the ingredients you want to use";
    var helperText = "<p>Make This With That.</p> What ingredients do you want a recipe for?";
    var cardOutput = "Make This With That. What ingredients do you want a recipe for?";
    
    var speechOutput = {
        speech: "<speak>" + helperText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    
    var repromptOutput = {
        speech: reprompt,
        type: AlexaSkill.speechOutputType.SSML
    };
    
    response.askWithCard(speechOutput,repromptOutput, cardTitle,cardOutput);
}
