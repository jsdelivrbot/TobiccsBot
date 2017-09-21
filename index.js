var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var MyCoolAgent = require('./MyCoolAgent');

var openConvs = {};


var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});


var https = require('https');

setInterval(function() {
    https.get("https://lp-tobiccsbot.herokuapp.com/");
}, 600000); // every 5 minutes (300000) every 10 minutes (600000)


// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: '1e4d4a45-9bce-47c4-8741-b02df5e38854',
  password: 'mCFsSCyhU3qO',
  path: { 
       workspace_id: '69807254-5aaa-42fb-bd5a-36bb70f88aa5'
  }, 
  version_date: '2016-07-11'
});

var echoAgent = new MyCoolAgent({
  accountId: '38446654', //replace with your Account ID
  username: 'Tobiccs', //replace with bot username
  password: 'Pa55w0rd99' //replace bot password
});

var context = {};
var dialogID = "";

// Start conversation with empty message.
//conversation.message({}, processResponse);

// Process the conversation response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }

  context = response.context;

  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);

     // If an escalation intent is detected, escalate.
     if (response.intents[0].intent == "purchase-handset") {

         echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: "Just one moment, I'm finding the right person to help you buy a new phone"
            }
     });

       setTimeout(function(){ returntosteering(); }, 3000);
       
       console.log('Escalation detected: #' + response.intents[0].intent);
       
     }

     // If an escalation intent is detected, escalate.
     if (response.intents[0].intent == "back-to-steering") {

         echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: "Back to steering bot!"
            }
     });

       setTimeout(function(){ returntosteering(); }, 3000);
       
       console.log('Escalation detected: #' + response.intents[0].intent);
       
     }


  }


  // Display the output from dialog, if any.

  if (response.output.text.length != 0) {

    for (var i = 0; i < response.output.text.length; i++) {


     



      console.log(response.output.text[i]);


      
      echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: response.output.text[i]
            }
        });
console.log (dialogID);



	if (response.output.text[i] === "I'm transferring you to an agent now!") // insert here the answer that triggers the escalation
	{
        console.log("Need to transfer to agents."); 
        leaveChat();       
        }


   }

}
  // Display the full response for logs
  //console.log(response);

}

//echoAgent.on('MyCoolAgent.ContentEvnet',(contentEvent)=>{
//          dialogID = contentEvent.dialogId;
//        conversation.message({
//          input: { text: contentEvent.message },
//          context : context
//        },processResponse);
//
//        console.log("sending message: " + contentEvent.message);
//});

echoAgent.on('MyCoolAgent.ContentEvnet',(contentEvent)=>{
          greenlight = 1;
          dialogID = contentEvent.dialogId;
        
          console.log("sending message: " + contentEvent.message);
          message = contentEvent.message;

          setTimeout(function(){
                       

              if(greenlight){

                 conversation.message({
                     input: { text: message },
                     context : context
                 }, processResponse);
                 greenlight = 0;
              }


          }, 1000);
});

function escalatetohuman() {
  echoAgent.updateConversationField({
    conversationId: dialogID,
    conversationField: [
      {
        field: "ParticipantsChange",
        type: "REMOVE",
        role: "ASSIGNED_AGENT"
      },
       {
          field: "Skill",
          type: "UPDATE",
          skill: "814186732"
      }
    ]
  }, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("transfered to human completed");
    }
  });
}

function returntosteering() {
  echoAgent.updateConversationField({
    conversationId: dialogID,
    conversationField: [
      {
        field: "ParticipantsChange",
        type: "REMOVE",
        role: "ASSIGNED_AGENT"
      },
       {
          field: "Skill",
          type: "UPDATE",
          skill: "955337932"
      }
    ]
  }, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("transfered to bot completed");
    }
  });
}
