import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { getAccessToken } from './twitch.server';
import { TwitchOAuthQuery } from './types';

WebApp.connectHandlers.use('/_oauth_twitch', async (req, res) => {
  const error = (status: number, message: string) => {
    const result = { status, message };
    res.writeHead(status);
    res.end(JSON.stringify(result));
  };
  console.log('Twitch OAuth handler');
  try {
    const query = req.query as TwitchOAuthQuery;
    const { scope, code } = query;
    console.log({ scope, code });

    const tokenResponse = await getAccessToken(query);
    console.log(tokenResponse);

    // Apple.config = await ServiceConfiguration.configurations.findOneAsync({ service: 'apple' });
    // // set native=true to use the app identifier associated with the signin service
    // const parsedToken = await Apple.verifyAndParseIdentityToken(
    //   { appId: clientName }, // TODO: get the client from the URL
    //   token,
    //   true
    // );
    // const event = JSON.parse(parsedToken.events);
    // const { type, sub: appleUserId } = event;
    // switch (type) {
    //   case 'consent-revoked':
    //   case 'account-delete':
    //     Meteor.defer(() => void removeServiceUser(appleUserId));
    //     break;
    // }
    const json = JSON.stringify({ status: 200, message: 'OK' });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(json);
  } catch (e) {
    console.log('Error in Twitch OAuth handler:');
    console.log(e);
    const err = e as Meteor.Error;
    error(403, err.message);
  }
});
