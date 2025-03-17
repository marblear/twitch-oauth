import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { getTwitchOAuthTokenResponse } from './twitch.server';
import { OAuth, TwitchOAuthQuery } from './types';

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

    const { tokenResponse, config } = await getTwitchOAuthTokenResponse(query);
    console.log(tokenResponse);

    const state = OAuth._generateState(
      'redirect',
      tokenResponse.access_token,
      Meteor.absoluteUrl()
    );

    console.log({ state });

    const url = Meteor.absoluteUrl('_oauth/twitch');
    const redirectUrl = `${url}?state=${state}`;

    res.writeHead(302, { 'Location': redirectUrl });
    res.end();

    // const response = await fetch(`${url}?state=${state}`, {
    //   method: 'GET',
    //   headers: new Headers({
    //     'Content-Type': 'text/html'
    //   })
    // });

    // console.log('Response from /_oauth/twitch:');
    // console.log(response.status);
    // console.log(response);
    // console.log(await response.json());

    // const html = await response.text();
    // res.writeHead(200, { 'Content-Type': 'text/html' });
    // res.end(html);
  } catch (e) {
    console.log('Error in Twitch OAuth handler:');
    console.log(e);
    const err = e as Meteor.Error;
    error(403, err.message);
  }
});
