// pages/dashboard.js
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [funFact, setFunFact] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/getUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.favoriteMovie) {
            setFavoriteMovie(data.favoriteMovie);
          } else {
            const movie = prompt("What's your favorite movie?");
            if (movie) {
              fetch("/api/saveFavorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email, movie }),
              });
              setFavoriteMovie(movie);
            }
          }
        });
    }
  }, [session]);

  useEffect(() => {
    if (favoriteMovie) {
      fetch(`/api/fact?movie=${encodeURIComponent(favoriteMovie)}`)
        .then((res) => res.json())
        .then((data) => setFunFact(data.fact));
    }
  }, [favoriteMovie]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to MovieFun!</h1>
      <p>
        <strong>Name:</strong> {session.user.name}
      </p>
      <p>
        <strong>Email:</strong> {session.user.email}
      </p>
      <img
        src={session.user.image}
        alt="Profile"
        width={100}
        style={{ borderRadius: "50%" }}
      />
      <p>
        <strong>Favorite Movie:</strong> {favoriteMovie}
      </p>
      <p>
        <strong>Fun Fact:</strong> {funFact || "Loading fun fact..."}
      </p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
