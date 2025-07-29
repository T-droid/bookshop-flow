"use client";

import { useEffect } from "react";
import { signIn } from "supertokens-web-js/recipe/webauthn";
import { useRouter } from "next/navigation";

export default function PasskeyLogin() {
  const router = useRouter();

  async function handlePasskeyLogin() {
    try {
      const response = await signIn();
      if (response.status === "OK") {
        console.log("Passkey login successful", response.user);
        router.push("/dashboard"); // Redirect to protected route
      } else {
        console.error("Passkey login failed", response);
        alert("Authentication failed");
      }
    } catch (err) {
      console.error("Error during passkey login", err);
      alert("An error occurred");
    }
  }

  return (
    <button onClick={handlePasskeyLogin} className="px-4 py-2 bg-blue-500 text-white rounded">
      Login with Passkey
    </button>
  );
}