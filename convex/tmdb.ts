"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Fetch movies from TMDB API and return the data
export const fetchMoviesFromTMDB = action({
  args: {
    category: v.optional(v.string()), // "popular", "top_rated", "upcoming", "now_playing"
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY environment variable is required");
    }

    const category = args.category || "popular";
    const page = args.page || 1;
    
    const url = `https://api.themoviedb.org/3/movie/${category}?api_key=${apiKey}&page=${page}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform TMDB data to our movie format and save to database
      const movies = [];
      for (const tmdbMovie of data.results) {
        // Check if movie already exists
        const existingMovie = await ctx.runQuery(internal.movies.getMovieByTmdbId, { tmdbId: tmdbMovie.id });
        if (existingMovie) {
          continue; // Skip if already exists
        }

        const details = await fetchMovieDetails(tmdbMovie.id);
        
        const movieData = {
          title: tmdbMovie.title,
          description: tmdbMovie.overview || "No description available",
          genre: details.genres?.map((g: any) => g.name) || [],
          releaseYear: new Date(tmdbMovie.release_date || "2000-01-01").getFullYear(),
          duration: details.runtime || 120,
          rating: details.adult ? "R" : "PG-13",
          imdbRating: tmdbMovie.vote_average || 0,
          thumbnailUrl: tmdbMovie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
            : "https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=500&h=750&fit=crop",
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder
          trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", // Placeholder
          cast: details.credits?.cast?.slice(0, 10).map((c: any) => c.name) || [],
          director: details.credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown",
          featured: tmdbMovie.vote_average > 8.0,
          language: details.original_language || "en",
          country: details.production_countries?.[0]?.name || "Unknown",
          awards: details.awards || "",
          boxOffice: details.revenue ? `$${details.revenue.toLocaleString()}` : "",
          tmdbId: tmdbMovie.id,
          imdbId: details.imdb_id || "",
        };
        
        // Save to database
        await ctx.runMutation(internal.movies.insertMovie, movieData);
        movies.push(movieData);
      }
      
      return {
        movies,
        totalResults: data.total_results,
        totalPages: data.total_pages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      throw error;
    }
  },
});

// Helper function to fetch detailed movie info
async function fetchMovieDetails(tmdbId: number) {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return {};
  }
}
