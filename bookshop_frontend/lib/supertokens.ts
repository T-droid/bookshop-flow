import SuperTokens from "supertokens-web-js";
import WebAuthN from "supertokens-web-js/recipe/webauthn";
import Session from "supertokens-web-js/recipe/session";

export function initSuperTokens() {
    SuperTokens.init({
        appInfo: {
            appName: "Bookshop",
            apiDomain: process.env.NEXT_PUBLIC_AUTH_SERVICE_DOMAIN || "http://localhost:3001",
            apiBasePath: "/auth",
        },
        recipeList: [
            WebAuthN.init(),
            Session.init(),
        ],
    });
}