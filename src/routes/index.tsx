import { createAsync, Navigate } from "@solidjs/router";
import { checkSession } from "~/lib/auth-checks";

export default function Home() {
  const url = createAsync(() => checkSession());

  // Use Navigate component for safer redirection
  const dest = url();
  if (dest) {
    return <Navigate href={dest} />;
  }

  return <div>Loading...</div>;
}
