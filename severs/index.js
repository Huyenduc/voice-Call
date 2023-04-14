import 'dotenv/config';
import express from 'express';

import twilio from 'twilio';
import ngrok from 'ngrok';
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
import { Device } from '@twilio/voice-sdk';

const app = express();

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/getToken', (req, res) => {
  if (!req.query || !req.query.userName) {
    return res.status(400).send('Username parameter is required');
  }
  const identity = 'user';
  const token = new AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY_SID,
    process.env.API_KEY_SECRET,
  );
  // Set the Identity of this token
  token.identity = req.query.userName;

  // Grant access to Video
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token as a JWT
  var jwt = token.toJwt();

  return res.send(jwt);
});



app.get('/notification', async (rep, res) => {
  const a = await admin.messaging().sendToDevice(
    [
      // 'd7pbhTJfTMaLRR1sAPBkY9:APA91bEm3OLSFKs-8pp-hxnvYPavl_AILpSoqmdjT4ULgPK-dQ6yeOwcOQE4K9WvrjZIMj3QQl2nlf1u9eFv52CiUQQ_y1ecnyr2Y4WnWs-J9QYO4l6rYX5dnS2Z6hgTF1-Vh9XXc3iL',
       'eQ2wBikAwkhog6B8mMkAAZ:APA91bHm-sNVnKJG-ARHOQMmsOlE7-cZXIpKu2dU37cb_lUPHfzbPOOkRC4V1FyFazN5LKZG8f6_bJmQ6GDl_5LGOASc7priqgKr4DPdHRLbNeBZUGvBmsRKbm_B_5Pt0mCE61Gcew3d'
    ], // device fcm tokens...
    {
      data: {
        roomName: "f",
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzkzOTgwZWRkYTFlYTNjYzE0MmMyNTI1MTEzNDEwZjg3LTE2NzIzMDIwODkiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJtbmF6eiIsInZpZGVvIjp7fX0sImlhdCI6MTY3MjMwMjA4OSwiZXhwIjoxNjcyMzA1Njg5LCJpc3MiOiJTSzkzOTgwZWRkYTFlYTNjYzE0MmMyNTI1MTEzNDEwZjg3Iiwic3ViIjoiQUM4MWQ1YWVhOTdhODMwYjQwMTRmNzMwYTY5NzNkZjM0MSJ9.YSxIqfwqKqTQ5ZzzanpsuA7SwItuYs4WAg-jdkJmLXM',

      },
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: 'high',
    },
  ).then(res => console.log(JSON.stringify(res)))

  console.log(a)
  return res.status(200).send("ok")
}
)
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.API_KEY_AUTH_TOKEN);
// console.log(client)

// client.calls
//   .create({
//     url: 'http://demo.twilio.com/docs/voice.xml',
//     to: '+84838941181',
//     from: '+18448533630'
//   })
//   .then(call => console.log(call));

// client.applications
//       .create({
//          voiceMethod: 'GET',
//          voiceUrl: 'http://demo.twilio.com/docs/voice.xml',
//          friendlyName: 'Phone Me'
//        })
//       .then(application => console.log(application));

app.get('/voice', async (rep, res) => {

  const AccessToken = require('twilio').jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Used when generating any kind of tokens
  // To set up environmental variables, see http://twil.io/secure
  const twilioAccountSid = process.env.ACCOUNT_SID;
  const twilioApiKey = process.env.API_KEY_SID;
  const twilioApiSecret = process.env.API_KEY_SECRET;

  // Used specifically for creating Voice tokens
  const outgoingApplicationSid = 'AP360973268932ccad7a5daea04b94a1e1';
  const identity = 'user';

  // Create a "grant" which enables a client to use Voice as a given user
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: outgoingApplicationSid,
    incomingAllow: true, // Optional: add to allow incoming calls
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );
  token.addGrant(voiceGrant);

  // Serialize the token to a JWT string
  const deviceOptions = {
    edge: 'ashburn',
  }

  // pass the options object as the second argument in Device constructor
  const device = new Device(token.toJwt(), {
    codecPreferences: ["opus", "pcmu"],
    fakeLocalDTMF: true,
    debug: false,
    enableRingingState: true,
    logLevel: '1'
})
  console.log(device);

  return res.send(token.toJwt());

})




app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`),
);

