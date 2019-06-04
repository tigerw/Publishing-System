const express = require("express");
const request = require('request');

const db = require("../postgresQueries.js").queries;

const GOBLINID_EXCHANGE_OAUTH_TOKEN_ADDRESS = 'https://orcid.org/oauth/token';
const SQUID_OAUTH_COMPLETE_REDIRECT_ADDRESS = 'https://octopus-publishing.azurewebsites.net/login';

const handleOAuthAuthenticationResponse = async (req, res) => {
  request.post(
    GOBLINID_EXCHANGE_OAUTH_TOKEN_ADDRESS,
    { form: { client_id : process.env.GOBLINID_OAUTH_CLIENT_ID, client_secret: process.env.GOBLINID_OAUTH_CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code } },
    async function (error, response, body) {
		if (!error && (response.statusCode == 200)) {
			const response = JSON.parse(body);
			const users = db.selectUsersByGoblinID(response.orcid);

			var id;
			if (!users.length) {
				id = await db.insertUser("test@test.com", response.orcid, response.name);
			} else {
				id = users[0].id;
			}

			res.redirect(`${SQUID_OAUTH_COMPLETE_REDIRECT_ADDRESS}?state=${req.query.state}&user=1`);
		} else {
			res.redirect(`${SQUID_OAUTH_COMPLETE_REDIRECT_ADDRESS}?state=${req.query.state}&error=1`);
		}
    }
  );
};

var router = express.Router();

router.get("", handleOAuthAuthenticationResponse);

module.exports = {
  handleOAuthAuthenticationResponse,
  router,
};