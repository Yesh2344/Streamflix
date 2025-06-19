import { mutation } from "./_generated/server";

export const seedMovies = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if movies already exist
    const existingMovies = await ctx.db.query("movies").take(1);
    if (existingMovies.length > 0) {
      return "Movies already seeded";
    }

    const movies = [
      {
        title: "The Matrix",
        description: "A computer programmer discovers that reality as he knows it is a simulation controlled by machines.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        releaseYear: 1999,
        duration: 136,
        rating: "R",
        imdbRating: 8.7,
        thumbnailUrl: "https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=500&h=750&fit=crop",
        videoUrl: "YOUR_VIDEO_URL_HERE", // Replace with your actual video URL
        trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        director: "The Wachowskis",
        featured: true,
      },
      {
        title: "Night of the Living Dead",
        description: "A group of people hide from bloodthirsty zombies in a farmhouse. Classic horror film that's now in public domain.",
        genre: ["Horror", "Thriller"],
        releaseYear: 1968,
        duration: 96,
        rating: "R",
        imdbRating: 7.9,
        thumbnailUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&h=750&fit=crop",
        videoUrl: "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4",
        cast: ["Duane Jones", "Judith O'Dea", "Karl Hardman"],
        director: "George A. Romero",
        featured: true,
      },
      {
        title: "The Dark Knight",
        description: "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
        genre: ["Action", "Crime", "Drama"],
        releaseYear: 2008,
        duration: 152,
        rating: "PG-13",
        imdbRating: 9.0,
        thumbnailUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        director: "Christopher Nolan",
        featured: true,
      },
      {
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        genre: ["Crime", "Drama"],
        releaseYear: 1994,
        duration: 154,
        rating: "R",
        imdbRating: 8.9,
        thumbnailUrl: "https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
        director: "Quentin Tarantino",
      },
      {
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre: ["Drama"],
        releaseYear: 1994,
        duration: 142,
        rating: "R",
        imdbRating: 9.3,
        thumbnailUrl: "https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        director: "Frank Darabont",
      },
      {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        genre: ["Adventure", "Drama", "Sci-Fi"],
        releaseYear: 2014,
        duration: 169,
        rating: "PG-13",
        imdbRating: 8.6,
        thumbnailUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        director: "Christopher Nolan",
        featured: true,
      },
      {
        title: "The Godfather",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        genre: ["Crime", "Drama"],
        releaseYear: 1972,
        duration: 175,
        rating: "R",
        imdbRating: 9.2,
        thumbnailUrl: "https://images.unsplash.com/photo-1489599735734-79b4f9ab7b34?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        cast: ["Marlon Brando", "Al Pacino", "James Caan"],
        director: "Francis Ford Coppola",
      },
      {
        title: "Avatar",
        description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
        genre: ["Action", "Adventure", "Fantasy"],
        releaseYear: 2009,
        duration: 162,
        rating: "PG-13",
        imdbRating: 7.8,
        thumbnailUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=750&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
        director: "James Cameron",
        featured: true,
      },
    ];

    for (const movie of movies) {
      await ctx.db.insert("movies", movie);
    }

    return `Seeded ${movies.length} movies`;
  },
});
