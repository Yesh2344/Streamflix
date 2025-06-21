import { Doc } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface MovieDetailsProps {
  movie: Doc<"movies">;
  onClose: () => void;
  onPlay: () => void;
}

export function MovieDetails({ movie, onClose, onPlay }: MovieDetailsProps) {
  const [userRating, setUserRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  
  const movieData = useQuery(api.movies.getMovie, { movieId: movie._id });
  const movieRatings = useQuery(api.movies.getMovieRatings, { movieId: movie._id });
  const recommendations = useQuery(api.movies.getRecommendations, { movieId: movie._id });
  
  const addToWatchlist = useMutation(api.movies.addToWatchlist);
  const removeFromWatchlist = useMutation(api.movies.removeFromWatchlist);
  const rateMovie = useMutation(api.movies.rateMovie);

  const handleWatchlistToggle = async () => {
    if (movieData?.isInWatchlist) {
      await removeFromWatchlist({ movieId: movie._id });
    } else {
      await addToWatchlist({ movieId: movie._id });
    }
  };

  const handleRating = async () => {
    if (userRating > 0) {
      await rateMovie({
        movieId: movie._id,
        rating: userRating,
        review: review || undefined,
      });
      setUserRating(0);
      setReview("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span>{movie.releaseYear}</span>
                <span>{movie.rating}</span>
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                <span>⭐ {movie.imdbRating.toFixed(1)}</span>
                {movieRatings && (
                  <span>👥 {movieRatings.averageRating.toFixed(1)} ({movieRatings.totalRatings} reviews)</span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onPlay}
                className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
              >
                ▶ Play
              </button>
              <button
                onClick={handleWatchlistToggle}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                {movieData?.isInWatchlist ? "✓ In List" : "+ My List"}
              </button>
            </div>
          </div>
          
          <p className="text-gray-300 mb-6 text-lg leading-relaxed">{movie.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 font-medium">Director: </span>
                <span>{movie.director}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Cast: </span>
                <span>{movie.cast.slice(0, 5).join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Genres: </span>
                <span>{movie.genre.join(", ")}</span>
              </div>
              {movie.language && (
                <div>
                  <span className="text-gray-400 font-medium">Language: </span>
                  <span>{movie.language}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {movie.country && (
                <div>
                  <span className="text-gray-400 font-medium">Country: </span>
                  <span>{movie.country}</span>
                </div>
              )}
              {movie.boxOffice && (
                <div>
                  <span className="text-gray-400 font-medium">Box Office: </span>
                  <span>{movie.boxOffice}</span>
                </div>
              )}
              {movieData?.watchProgress && (
                <div>
                  <span className="text-gray-400 font-medium">Your Progress: </span>
                  <span>{Math.round(movieData.watchProgress)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className="border-t border-gray-700 pt-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Rate this movie</h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className={`text-2xl ${
                      star <= userRating ? "text-yellow-400" : "text-gray-600"
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {movieData?.userRating && (
                <span className="text-sm text-gray-400">
                  Your rating: {movieData.userRating}/5
                </span>
              )}
            </div>
            
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a review (optional)..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-red-600 text-white resize-none"
              rows={3}
            />
            
            <button
              onClick={handleRating}
              disabled={userRating === 0}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </button>
          </div>

          {/* Reviews */}
          {movieRatings && movieRatings.ratings.length > 0 && (
            <div className="border-t border-gray-700 pt-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Reviews</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {movieRatings.ratings.slice(0, 5).map((rating) => (
                  <div key={rating._id} className="bg-gray-800 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rating.userName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">
                          {"⭐".repeat(rating.rating)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {rating.rating}/5
                        </span>
                      </div>
                    </div>
                    {rating.review && (
                      <p className="text-gray-300 text-sm">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-semibold mb-4">You might also like</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {recommendations.slice(0, 6).map((rec) => (
                  <div key={rec._id} className="cursor-pointer group">
                    <img
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      className="w-full aspect-[2/3] object-cover rounded group-hover:scale-105 transition-transform"
                    />
                    <p className="text-sm mt-1 truncate">{rec.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
