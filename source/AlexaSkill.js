'use strict';


function AlexaSkill(appId) {
    this._addId = appId; 
}

AlexaSkill.speechOutputType = {
    PLAIN_TEXT:'PlainText',
    SSML:'SSML'
};

AlexaSkill.prototype.requestHandlers = {
    LaunchRequest: function(event,context,response) {
        this.eventHandlers.onLaunch.call(this,event.request,event.session,response);  
    },
    
    IntentRequest: function(event,context,response) {
        this.eventHandlers.onIntent.call(this, event.request,event.session,response);  
    },
    
    SessionEndedRequest:function(event,context) {
        this.eventHandlers.onSessionEnded(event.request,event.session);
        context.succeed();
    }
};

AlexaSkill.prototype.eventHandlers = {
    onSessionStarted: function(sessionStartedRequest,session) {
        
    },
    
    onLaunch: function(launchRequest,session,response) {
        throw "onLaunch should be overrided by subclass";
    },
    
    onIntent: function(intentRequest,session,response) {
        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this,intent,session,response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    },
    
    onSessionEnded: function(sessionEndedRequest,session) {
    }  
};

AlexaSkill.prototype.intentHandlers = {};

AlexaSkill.prototype.execute = function(event,context) {
    try {
        console.log("session appID: " + event.session.application.applicationId);
        if (this._appId && event.session.application.applicationId !== this._appId) {
            console.log("This applications don't match : " + event.session.application.applicationId +      " and " + this._appId);
            throw "Invalid appID";
        }
        
        if (!event.session.attributes) {
            event.session.attributes = {};
        }
        
        if (event.session.new) {
            this.eventHandlers.onSessionStarted(event.request,event.session);
        }
        
        var requestHandler = this.requestHandlers[event.request.type];
        requestHandler.call(this,event,context, new Response(context,event.session));
    } catch(error) {
        console.log("Unexpected excepiton: " + error);
        console.fail(error);
    }
};

var Response = function(context,session) {
    this._context = context;
    this._session = session;
}

Response.prototype = (function() {
    var buildSpeechletResponse = function(options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession:options.shouldEndSession
        };
        
        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt)
            };
        }
        
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: "Simple",
                title: options.cardTitle,
                content:options.cardContent
            };
        }
        
        var returnResult = {
            version: "1.0",
            response: alexaResponse
        };
        
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;    
        }
        
        return returnResult;
    };
    
    return {
        tell: function(speechOutput) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                shouldEndSession: true
            }));
        },
        
        tellWithCard: function(speechOutput,cardTitle,cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session:this._session,
                output: speechOutput,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: true
            }));
        },
        
        ask: function(speechOutput,repromptSpeech) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                shouldEndSession: false
            }));
        },
        
        askWithCard: function (speechOutput,repromptSpeech,cardTitle,cardContent) {
            this._context.succeed(buildSpeechletResponse({
                session:this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                cardTitle: cardTitle,
                
            }));
        }
    };
})();

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === "SSML") {
        return {
            type: optionsParam.type,
            ssml: optionsParam.speech
        }
    } else {
        return {
            type: optionsParam.type || "PlainText",
            text: optionsParam.speech || optionsParam
        }
    }
}

module.exports = AlexaSkill;
