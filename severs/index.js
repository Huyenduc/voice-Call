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


app.get('/notification',async (rep,res)=>{
  const a = await admin.messaging().sendToDevice(
    [
      'emt7I0oCT8Wv6tmMMisGzu:APA91bG4TKO2UmVjnaFzc_Rirc1wH9bVYEhrQ9L8Q4U3pkjIqGmc-UEeBErh6uk94hAsKFf3HpWYJzc5TOQe9eqpzrIHJ6SMjh_yN_jnbazALn-S5uffj82GCrQkSsZWOwbn94-cfxzF',
    // 'cLgZfB9zR824iZhk5ipU1Y:APA91bGvkDdq96gLwzDeB9jAlDdbceXOCAG5GvRGrHY2smTfzlQW0WpHUST087GBtBW-pol-z9WiaUmIjO4kx0H1hroTnN34v8mc1UM7-R7F92wg4D9C4Px_XrbSPrLWd_2tmY-0MZaT',
    // 'fE5Ym7YYRsyIhuSX8lRjsl:APA91bEN_2XThYN6o7rKUfl0eyibr62NcBFeTU6FGyyT6njKLMMOKf8fT2uuk842C7WjaopZkK2z9Lhsprqvoi1xXr9h43hxNaiGMVHofgwwhpqbIYV_xK7ntw-du-EAlR70sKPKIidr'
  ], // device fcm tokens...
    {
      data: {
        // owner: JSON.stringify(owner),
        // user: JSON.stringify(user),
        // picture: JSON.stringify(picture),
      },
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: 'high',
    },
  ).then(res =>console.log(JSON.stringify(res)))

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
