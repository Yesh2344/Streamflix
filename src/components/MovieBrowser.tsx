import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { MovieCard } from "./MovieCard";
import { FeaturedMovie } from "./FeaturedMovie";
import { MovieFilters } from "./MovieFilters";

interface MovieBrowserProps {
  onPlayMovie: (movie: Doc<"movies">) => void;
}

export function MovieBrowser({ onPlayMovie }: MovieBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [sortBy, setSortBy] = useState<string>("title");
  const [minRating, setMinRating] = useState<number>(0);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2024]);
  
  const featuredMovies = useQuery(api.movies.getFeaturedMovies);
  const trendingMovies = useQuery(api.movies.getTrendingMovies);
  const topRatedMovies = useQuery(api.movies.getTopRatedMovies);
  
  const searchResults = useQuery(
    api.movies.searchMovies,
    searchTerm ? { 
      searchTerm,
      genre: selectedGenre || undefined,
    } : "skip"
  );
  
  const genreMovies = useQuery(
    api.movies.getMoviesByGenre,
    selectedGenre && !searchTerm ? { genre: selectedGenre } : "skip"
  );
  
  const allMovies = useQuery(api.movies.getMovies, {
    paginationOpts: { numItems: 20, cursor: null },
    sortBy,
    minRating: minRating > 0 ? minRating : undefined,
    minYear: yearRange[0],
    maxYear: yearRange[1],
  });
  
  const watchlist = useQuery(api.movies.getUserWatchlist);
  const continueWatching = useQuery(api.movies.getContinueWatching);
  const recentlyWatched = useQuery(api.movies.getRecentlyWatched);
  const seedMovies = useMutation(api.seedData.seedMovies);

  useEffect(() => {
    seedMovies();
  }, [seedMovies]);

  const genres = ["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller", "Adventure", "Crime", "Fantasy"];

  const getDisplayMovies = () => {
    if (searchTerm) return searchResults;
    if (selectedGenre) return genreMovies;
    
    switch (activeTab) {
      case "trending":
        return trendingMovies;
      case "top-rated":
        return topRatedMovies;
      case "my-list":
        return watchlist;
      case "recently-watched":
        return recentlyWatched;
      default:
        return allMovies?.page || [];
    }
  };

  const displayMovies = getDisplayMovies();
  const featuredMovie = featuredMovies?.[0];

  const tabs = [
    { id: "home", label: "Home" },
    { id: "trending", label: "Trending" },
    { id: "top-rated", label: "Top Rated" },
    { id: "my-list", label: "My List" },
    { id: "recently-watched", label: "Recently Watched" },
  ];

  return (
    <div className="pt-16">
      {/* Featured Movie Hero Section */}
      {featuredMovie && activeTab === "home" && !searchTerm && !selectedGenre && (
        <FeaturedMovie movie={featuredMovie} onPlay={() => onPlayMovie(featuredMovie)} />
      )}

      <div className="px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-600 text-white"
              />
            </div>
            
            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre("")}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  !selectedGenre 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                All Genres
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedGenre === genre 
                      ? "bg-red-600 text-white" 
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <MovieFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            minRating={minRating}
            setMinRating={setMinRating}
            yearRange={yearRange}
            setYearRange={setYearRange}
          />
        </div>

        {/* Continue Watching */}
        {continueWatching && continueWatching.length > 0 && activeTab === "home" && !searchTerm && !selectedGenre && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {continueWatching.filter(movie => movie !== null).map((movie) => (
                <MovieCard
                  key={movie!._id}
                  movie={movie!}
                  onPlay={() => onPlayMovie(movie!)}
                  progress={(movie as any).progress}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Movies */}
        {trendingMovies && trendingMovies.length > 0 && activeTab === "home" && !searchTerm && !selectedGenre && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingMovies.slice(0, 12).map((movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onPlay={() => onPlayMovie(movie)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Movie Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {searchTerm 
              ? `Search Results for "${searchTerm}"` 
              : selectedGenre 
              ? `${selectedGenre} Movies` 
              : tabs.find(t => t.id === activeTab)?.label || "Movies"
            }
          </h2>
          
          {displayMovies && displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayMovies.filter(movie => movie !== null).map((movie) => (
                <MovieCard
                  key={movie!._id}
                  movie={movie!}
                  onPlay={() => onPlayMovie(movie!)}
                  progress={(movie as any).progress}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">No movies found</p>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
