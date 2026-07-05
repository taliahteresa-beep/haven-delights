// Step 1 of the Decap CMS GitHub OAuth flow: send the user to GitHub's consent page.
module.exports = (req, res) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("OAUTH_GITHUB_CLIENT_ID environment variable is not set in Vercel.");
    return;
  }
  const params = new URLSearchParams({ client_id: clientId, scope: "repo,user" });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
};
