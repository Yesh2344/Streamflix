import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  movies: defineTable({
    title: v.string(),
    description: v.string(),
    genre: v.array(v.string()),
    releaseYear: v.number(),
    duration: v.number(), // in minutes
    rating: v.string(), // PG, PG-13, R, etc.
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
  })
    .index("by_featured", ["featured"])
    .index("by_release_year", ["releaseYear"])
    .index("by_rating", ["imdbRating"])
    .index("by_tmdb_id", ["tmdbId"])
    .searchIndex("search_movies", {
      searchField: "title",
      filterFields: ["releaseYear", "genre"],
    }),

  watchlist: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    addedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_movie", ["userId", "movieId"]),

  watchHistory: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    watchedAt: v.number(),
    progress: v.number(), // percentage watched (0-100)
    completed: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_movie", ["userId", "movieId"])
    .index("by_user_completed", ["userId", "completed"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    favoriteGenres: v.array(v.string()),
    preferredLanguage: v.optional(v.string()),
    maturityRating: v.optional(v.string()),
    autoplay: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"]),

  ratings: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    rating: v.number(), // 1-5 stars
    review: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_movie", ["movieId"])
    .index("by_user_movie", ["userId", "movieId"]),

  collections: defineTable({
    name: v.string(),
    description: v.string(),
    movieIds: v.array(v.id("movies")),
    createdBy: v.id("users"),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_public", ["isPublic"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "new_movie", "recommendation", "watchlist_update"
    title: v.string(),
    message: v.string(),
    movieId: v.optional(v.id("movies")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
