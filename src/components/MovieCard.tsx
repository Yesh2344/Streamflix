import { Doc } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { MovieDetails } from "./MovieDetails";

interface MovieCardProps {
  movie: Doc<"movies">;
  onPlay: () => void;
  progress?: number;
}

export function MovieCard({ movie, onPlay, progress }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const watchlist = useQuery(api.movies.getUserWatchlist);
  const addToWatchlist = useMutation(api.movies.addToWatchlist);
  const removeFromWatchlist = useMutation(api.movies.removeFromWatchlist);
  
  const isInWatchlist = watchlist?.some(w => w?._id === movie._id);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWatchlist) {
      await removeFromWatchlist({ movieId: movie._id });
    } else {
      await addToWatchlist({ movieId: movie._id });
    }
  };

  return (
    <>
      <div 
        className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          
          {/* Progress bar for continue watching */}
          {progress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Hover overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                ▶ Play
              </button>
            </div>
          )}

          {/* Watchlist button */}
          <button
            onClick={handleWatchlistToggle}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {isInWatchlist ? "✓" : "+"}
          </button>

          {/* Rating badge */}
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-semibold">
            ⭐ {movie.imdbRating.toFixed(1)}
          </div>
        </div>

        <div className="mt-2">
          <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
          <p className="text-gray-400 text-xs">{movie.releaseYear} • {movie.rating}</p>
        </div>
      </div>

      {/* Movie Details Modal */}
      {showDetails && (
        <MovieDetails
          movie={movie}
          onClose={() => setShowDetails(false)}
          onPlay={onPlay}
        />
      )}
    </>
  );
}
