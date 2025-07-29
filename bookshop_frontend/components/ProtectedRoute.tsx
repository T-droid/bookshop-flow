"use client";

import { ReactNode, useEffect, useState } from "react";
import { doesSessionExist } from "supertokens-web-js/recipe/session";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const sessionExists = await doesSessionExist();
      setIsAuthenticated(sessionExists);
      if (!sessionExists) {
        router.push("/login");
      }
    }
    checkSession();
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
}