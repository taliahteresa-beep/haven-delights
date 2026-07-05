// Step 2 of the Decap CMS GitHub OAuth flow: exchange the code for a token,
// then hand the token back to the CMS window via the postMessage handshake.
module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query.code;

  if (!clientId || !clientSecret) {
    res.status(500).send("OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET are not set in Vercel.");
    return;
  }
  if (!code) {
    res.status(400).send("Missing ?code parameter from GitHub.");
    return;
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const data = await tokenRes.json();

  const status = data.error ? "error" : "success";
  const payload = data.error
    ? JSON.stringify({ error: data.error_description || data.error })
    : JSON.stringify({ token: data.access_token, provider: "github" });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html><body><script>
(function () {
  function receiveMessage() {
    window.opener.postMessage(
      "authorization:github:${status}:" + ${JSON.stringify(payload)},
      "*"
    );
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>Signing you in… you can close this window if it doesn't close itself.</p>
</body></html>`);
};
