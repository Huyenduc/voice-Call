import 'dotenv/config';
import express from 'express';

import twilio from 'twilio';
import ngrok from 'ngrok';
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

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
  const accessToken = new AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY_SID,
    process.env.API_KEY_SECRET,
  );

  // Set the Identity of this token
  accessToken.identity = req.query.userName;

  // Grant access to Video
  var grant = new VideoGrant();
  accessToken.addGrant(grant);

  // Serialize the token as a JWT
  var jwt = accessToken.toJwt();
  console.log(jwt)
  return res.send(jwt);
});

app.get('/notification',async (rep,res)=>{
  const a = await admin.messaging().send({
    notification: {
      title: "Notification Title",
      body: "Notification Body ",
    },
    "android":{
      "notification":{
        "sound":"default"
      }
    },
    'apns': {
      'payload': {
        'aps': {
          // contentAvailable: true,
          "sound":"default"
        },
      },
      // headers: {
      //   'apns-push-type': 'background',
      //   'apns-priority': '5',
      //   'apns-topic': '', // your app bundle identifier
      // },
    },
    //must include token, topic, or condition
    token: 'eH-7TTO_QjOJM7mresUSES:APA91bGS3gumICNhjG95NB2P5TJTwGU0QrMQifI5RJKZrpvUIr9FVmqk_L58aGT9ebOFQREoffXlaUZElRPRIpyX2ayS-T2IgochUTDmv5fgdl16R8_TubhcGaDtGda3P2URdHOpwWb2'
    //topic: //notification topic
    //condition: //notification condition
  }).then(res =>console.log(JSON.stringify(res)))

  console.log(a)
  return res.status(200).send("ok")
}
  )

app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`),
);

ngrok.connect(process.env.PORT).then((url) => {
  console.log(`Server forwarded to public url ${url}`);
});
