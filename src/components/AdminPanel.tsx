import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("popular");
  
  const fetchMoviesFromTMDB = useAction(api.tmdb.fetchMoviesFromTMDB);

  const handleImportMovies = async () => {
    setIsLoading(true);
    setMessage("Fetching movies from TMDB...");

    try {
      const result = await fetchMoviesFromTMDB({ category });
      setMessage(`Successfully imported ${result.movies.length} movies!`);
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Movie Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-red-600 text-white"
            >
              <option value="popular">Popular</option>
              <option value="top_rated">Top Rated</option>
              <option value="upcoming">Upcoming</option>
              <option value="now_playing">Now Playing</option>
            </select>
          </div>

          <button
            onClick={handleImportMovies}
            disabled={isLoading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Importing..." : "Import Movies from TMDB"}
          </button>

          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes("Error") 
                ? "bg-red-900/50 text-red-300" 
                : "bg-green-900/50 text-green-300"
            }`}>
              {message}
            </div>
          )}

          <div className="text-sm text-gray-400 space-y-2">
            <p><strong>Setup Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Sign up for a free account at <a href="https://www.themoviedb.org/" target="_blank" className="text-blue-400 hover:underline">themoviedb.org</a></li>
              <li>Go to Settings → API and create an API key</li>
              <li>In Convex Dashboard → Settings → Environment Variables</li>
              <li>Add: <code className="bg-gray-800 px-1 rounded">TMDB_API_KEY</code> = your API key</li>
              <li>Click "Import Movies" to fetch real movie data!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
