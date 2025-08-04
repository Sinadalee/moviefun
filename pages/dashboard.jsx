// pages/dashboard.js
import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [funFact, setFunFact] = useState("");
  const [loadingFact, setLoadingFact] = useState(false);
  const askedRef = useRef(false); // prevent double prompt in dev/hot-reload

  // Client-side safety: if user becomes unauthenticated, go to login
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  // Load user from DB; if no favorite movie, prompt and save it
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;

    (async () => {
      try {
        const res = await fetch("/api/getUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const user = await res.json();

        if (user?.favoriteMovie) {
          setFavoriteMovie(user.favoriteMovie);
          return;
        }

        if (!askedRef.current) {
          askedRef.current = true;
          const movie = window.prompt("What's your favorite movie?");
          if (movie && movie.trim()) {
            await fetch("/api/saveFavorite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, movie: movie.trim() }),
            });
            setFavoriteMovie(movie.trim());
          }
        }
      } catch (e) {
        console.error("Failed to load/save user:", e);
      }
    })();
  }, [session]);

  // Fetch a fresh fun fact every time the page (or favoriteMovie) loads
  useEffect(() => {
    if (!favoriteMovie) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingFact(true);
        const res = await fetch(
          `/api/fact?movie=${encodeURIComponent(favoriteMovie)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setFunFact(data.fact || "No fact found.");
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fact fetch failed:", e);
          setFunFact("Could not load a fun fact right now.");
        }
      } finally {
        setLoadingFact(false);
      }
    })();

    return () => controller.abort();
  }, [favoriteMovie]);

  if (status === "loading") return <p>Loading…</p>;
  if (!session) return null; // SSR will prevent this, but guards against flashes

  return (
    <div style={{ maxWidth: 640, margin: "48px auto", textAlign: "center" }}>
      <h1 style={{ textAlign: "center" }}>Welcome to MovieFun!</h1>

      <p>
        <strong>Name:</strong> {session.user?.name || "-"}
      </p>
      <p>
        <strong>Email:</strong> {session.user?.email || "-"}
      </p>

      {session.user?.image && (
        <div style={{ textAlign: "center", margin: "16px 0" }}>
          <img
            src={session.user.image}
            alt="Profile"
            width={120}
            height={120}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        </div>
      )}

      <p>
        <strong>Favorite Movie:</strong> {favoriteMovie || "-"}
      </p>
      <p>
        <strong>Fun Fact:</strong>{" "}
        {loadingFact ? "Loading fun fact..." : funFact || "-"}
      </p>

      <div style={{ marginTop: 24 }}>
        <button onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
      </div>
    </div>
  );
}

// Server-side protection: redirect unauthenticated users to "/"
export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
}
