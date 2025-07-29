import express from 'express';
import cors from 'cors';

import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import WebAuthN from 'supertokens-node/recipe/webauthn';

const app = express();

supertokens.init({
  framework: "express",
  supertokens: {
    connectionURI: "https://try.supertokens.io", // Use your SuperTokens Core instance or self-hosted URI
    // apiKey: "<YOUR_API_KEY>", // Required for managed service
  },
  appInfo: {
    appName: "YourAppName",
    apiDomain: "http://localhost:3001", // Node.js auth service URL
    websiteDomain: "http://localhost:3000", // Your frontend URL
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    WebAuthN.init(), // Passkeys support
    Session.init(), // Session management
  ],
});

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:8000"],
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        credentials: true,
    })
);

app.use(supertokens.middleware());
app.use(supertokens.errorHandler());

app.listen(3001, () => {
    console.log("Auth service is running on http://localhost:3001");
});