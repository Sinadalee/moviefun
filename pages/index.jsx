import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to MovieFun</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}
