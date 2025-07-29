import { getAccessToken } from "supertokens-web-js/recipe/session";

export async function fetchProtectedData() {
  const accessToken = await getAccessToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}/protected`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}