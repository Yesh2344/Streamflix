import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { MovieBrowser } from "./components/MovieBrowser";
import { AdminPanel } from "./components/AdminPanel";
import { useState } from "react";
import { MoviePlayer } from "./components/MoviePlayer";
import { Doc } from "../convex/_generated/dataModel";

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Doc<"movies"> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handlePlayMovie = (movie: Doc<"movies">) => {
    setSelectedMovie(movie);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster theme="dark" />
      
      <Authenticated>
        {isPlaying && selectedMovie ? (
          <MoviePlayer movie={selectedMovie} onClose={handleClosePlayer} />
        ) : (
          <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-8">
                  <h1 className="text-2xl font-bold text-red-600">STREAMFLIX</h1>
                  <nav className="hidden md:flex space-x-6">
                    <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">Movies</a>
                    <a href="#" className="hover:text-gray-300 transition-colors">My List</a>
                  </nav>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowAdmin(true)}
                    className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                  >
                    Admin
                  </button>
                  <SignOutButton />
                </div>
              </div>
            </header>
            <MovieBrowser onPlayMovie={handlePlayMovie} />
          </>
        )}

        {showAdmin && (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900">
          <div className="w-full max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-red-600 mb-4">STREAMFLIX</h1>
              <p className="text-xl text-gray-300">Unlimited movies, TV shows, and more</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
