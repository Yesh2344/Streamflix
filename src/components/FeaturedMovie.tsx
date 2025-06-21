import { Doc } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface FeaturedMovieProps {
  movie: Doc<"movies">;
  onPlay: () => void;
}

export function FeaturedMovie({ movie, onPlay }: FeaturedMovieProps) {
  const watchlist = useQuery(api.movies.getUserWatchlist);
  const addToWatchlist = useMutation(api.movies.addToWatchlist);
  const removeFromWatchlist = useMutation(api.movies.removeFromWatchlist);
  
  const isInWatchlist = watchlist?.some(w => w?._id === movie._id);

  const handleWatchlistToggle = async () => {
    if (isInWatchlist) {
      await removeFromWatchlist({ movieId: movie._id });
    } else {
      await addToWatchlist({ movieId: movie._id });
    }
  };

  return (
    <div className="relative h-[70vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.thumbnailUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">{movie.title}</h1>
        
        <div className="flex items-center space-x-4 text-sm mb-4">
          <span className="bg-red-600 px-2 py-1 rounded text-xs font-semibold">
            {movie.rating}
          </span>
          <span>{movie.releaseYear}</span>
          <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          <span>⭐ {movie.imdbRating}</span>
        </div>

        <p className="text-lg text-gray-300 mb-6 max-w-xl leading-relaxed">
          {movie.description}
        </p>

        <div className="flex space-x-4">
          <button
            onClick={onPlay}
            className="bg-white text-black px-8 py-3 rounded font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <span>▶</span>
            <span>Play</span>
          </button>
          
          <button
            onClick={handleWatchlistToggle}
            className="bg-gray-600/80 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <span>{isInWatchlist ? "✓" : "+"}</span>
            <span>My List</span>
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <div className="mb-1">
            <span className="font-semibold">Director: </span>
            {movie.director}
          </div>
          <div>
            <span className="font-semibold">Starring: </span>
            {movie.cast.slice(0, 3).join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}
