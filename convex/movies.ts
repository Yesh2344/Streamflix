import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all movies with pagination and filters
export const getMovies = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    sortBy: v.optional(v.string()), // "rating", "year", "title"
    minRating: v.optional(v.number()),
    maxYear: v.optional(v.number()),
    minYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;
    
    if (args.sortBy === "rating") {
      results = await ctx.db.query("movies").withIndex("by_rating").paginate(args.paginationOpts);
    } else if (args.sortBy === "year") {
      results = await ctx.db.query("movies").withIndex("by_release_year").paginate(args.paginationOpts);
    } else {
      results = await ctx.db.query("movies").paginate(args.paginationOpts);
    }
    
    // Apply filters
    if (args.minRating || args.minYear || args.maxYear) {
      results.page = results.page.filter(movie => {
        if (args.minRating && movie.imdbRating < args.minRating) return false;
        if (args.minYear && movie.releaseYear < args.minYear) return false;
        if (args.maxYear && movie.releaseYear > args.maxYear) return false;
        return true;
      });
    }
    
    return results;
  },
});

// Get featured movies
export const getFeaturedMovies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(10);
  },
});

// Get trending movies (high rated recent movies)
export const getTrendingMovies = query({
  args: {},
  handler: async (ctx) => {
    const currentYear = new Date().getFullYear();
    const movies = await ctx.db.query("movies").collect();
    
    return movies
      .filter(movie => movie.releaseYear >= currentYear - 3 && movie.imdbRating >= 7.0)
      .sort((a, b) => b.imdbRating - a.imdbRating)
      .slice(0, 20);
  },
});

// Get top rated movies
export const getTopRatedMovies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_rating")
      .order("desc")
      .take(20);
  },
});

// Get movies by genre
export const getMoviesByGenre = query({
  args: { genre: v.string() },
  handler: async (ctx, args) => {
    const allMovies = await ctx.db.query("movies").collect();
    return allMovies.filter(movie => movie.genre.includes(args.genre)).slice(0, 20);
  },
});

// Search movies with advanced filters
export const searchMovies = query({
  args: { 
    searchTerm: v.string(),
    genre: v.optional(v.string()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("movies")
      .withSearchIndex("search_movies", (q) => {
        let searchQuery = q.search("title", args.searchTerm);
        if (args.year) {
          searchQuery = searchQuery.eq("releaseYear", args.year);
        }
        return searchQuery;
      })
      .take(20);

    if (args.genre) {
      results = results.filter(movie => movie.genre.includes(args.genre!));
    }

    return results;
  },
});

// Get single movie with user data
export const getMovie = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    if (!movie) return null;

    const userId = await getAuthUserId(ctx);
    let userRating = null;
    let isInWatchlist = false;
    let watchProgress = null;

    if (userId) {
      const rating = await ctx.db
        .query("ratings")
        .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
        .unique();
      userRating = rating?.rating || null;

      const watchlistItem = await ctx.db
        .query("watchlist")
        .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
        .unique();
      isInWatchlist = !!watchlistItem;

      const history = await ctx.db
        .query("watchHistory")
        .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
        .unique();
      watchProgress = history?.progress || null;
    }

    return {
      ...movie,
      userRating,
      isInWatchlist,
      watchProgress,
    };
  },
});

// Get movie recommendations
export const getRecommendations = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const movie = await ctx.db.get(args.movieId);
    if (!movie) return [];

    const allMovies = await ctx.db.query("movies").collect();
    
    // Simple recommendation based on genre and rating
    return allMovies
      .filter(m => 
        m._id !== args.movieId && 
        m.genre.some(g => movie.genre.includes(g)) &&
        Math.abs(m.imdbRating - movie.imdbRating) <= 1.5
      )
      .sort((a, b) => b.imdbRating - a.imdbRating)
      .slice(0, 10);
  },
});

// Add movie to watchlist
export const addToWatchlist = mutation({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("watchlist", {
      userId,
      movieId: args.movieId,
      addedAt: Date.now(),
    });
  },
});

// Remove from watchlist
export const removeFromWatchlist = mutation({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const watchlistItem = await ctx.db
      .query("watchlist")
      .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
      .unique();

    if (watchlistItem) {
      await ctx.db.delete(watchlistItem._id);
    }
  },
});

// Get user's watchlist
export const getUserWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchlistItems = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const movies = await Promise.all(
      watchlistItems.map(async (item) => {
        const movie = await ctx.db.get(item.movieId);
        return movie;
      })
    );

    return movies.filter(Boolean);
  },
});

// Rate a movie
export const rateMovie = mutation({
  args: {
    movieId: v.id("movies"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("ratings", {
        userId,
        movieId: args.movieId,
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    }
  },
});

// Get movie ratings and reviews
export const getMovieRatings = query({
  args: { movieId: v.id("movies") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_movie", (q) => q.eq("movieId", args.movieId))
      .order("desc")
      .take(20);

    const ratingsWithUsers = await Promise.all(
      ratings.map(async (rating) => {
        const user = await ctx.db.get(rating.userId);
        return {
          ...rating,
          userName: user?.name || "Anonymous",
        };
      })
    );

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    return {
      ratings: ratingsWithUsers,
      averageRating,
      totalRatings: ratings.length,
    };
  },
});

// Update watch progress
export const updateWatchProgress = mutation({
  args: {
    movieId: v.id("movies"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchHistory")
      .withIndex("by_user_movie", (q) => q.eq("userId", userId).eq("movieId", args.movieId))
      .unique();

    const completed = args.progress >= 90;

    if (existing) {
      await ctx.db.patch(existing._id, {
        progress: args.progress,
        watchedAt: Date.now(),
        completed,
      });
    } else {
      await ctx.db.insert("watchHistory", {
        userId,
        movieId: args.movieId,
        progress: args.progress,
        watchedAt: Date.now(),
        completed,
      });
    }
  },
});

// Get continue watching
export const getContinueWatching = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchHistory = await ctx.db
      .query("watchHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.and(q.gt(q.field("progress"), 5), q.lt(q.field("progress"), 90)))
      .order("desc")
      .take(10);

    const movies = await Promise.all(
      watchHistory.map(async (item) => {
        const movie = await ctx.db.get(item.movieId);
        return movie ? { ...movie, progress: item.progress } : null;
      })
    );

    return movies.filter(Boolean);
  },
});

// Get recently watched
export const getRecentlyWatched = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchHistory = await ctx.db
      .query("watchHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    const movies = await Promise.all(
      watchHistory.map(async (item) => {
        const movie = await ctx.db.get(item.movieId);
        return movie ? { ...movie, watchedAt: item.watchedAt } : null;
      })
    );

    return movies.filter(Boolean);
  },
});

// Internal helper functions for TMDB integration
export const getMovieByTmdbId = internalQuery({
  args: { tmdbId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_tmdb_id", (q) => q.eq("tmdbId", args.tmdbId))
      .unique();
  },
});

export const insertMovie = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    genre: v.array(v.string()),
    releaseYear: v.number(),
    duration: v.number(),
    rating: v.string(),
    imdbRating: v.number(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
    trailerUrl: v.optional(v.string()),
    cast: v.array(v.string()),
    director: v.string(),
    featured: v.optional(v.boolean()),
    language: v.optional(v.string()),
    country: v.optional(v.string()),
    awards: v.optional(v.string()),
    boxOffice: v.optional(v.string()),
    tmdbId: v.optional(v.number()),
    imdbId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("movies", args);
  },
});
