import { useEffect, useState } from "react";
import "./index.css";

interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
}

async function getMovies(): Promise<Movie[]> {
  const response = await fetch("http://localhost:8080/get-movies", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

async function addMovie(movie: Omit<Movie, "id">): Promise<Movie> {
  const response = await fetch("http://localhost:8080/add-movie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState<number>(2025);
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMovie = await addMovie({ title, year, genre, rating });
      setMovies([...movies, newMovie]);
      setTitle("");
      setYear(2025);
      setGenre("");
      setRating(0);
    } catch (e) {
      console.error("Error adding movie:", e);
      alert("Failed to add movie");
    }
  };

  // delete handler
  async function deleteMovie(id: number): Promise<void> {
    const response = await fetch(`http://localhost:8080/delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }

  return (
    <div className="wrapper">
      <header className="header">
        <h1 className="title">Movie Database</h1>
      </header>

      <section className="panel movie-section">
        <h2>Movies</h2>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "#fca5a5" }}>Error: {error}</p>}

        {!loading && !error && (
          <div className="movie-grid">
            {movies.map((movie) => (
              <article key={movie.id} className="movie-card">
                <h3>{movie.title}</h3>
                <p className="movie-meta">
                  <strong>Year:</strong> {movie.year}
                </p>
                <p className="movie-meta">
                  <strong>Genre:</strong> {movie.genre}
                </p>
                <p className="movie-meta">
                  <strong>Rating:</strong> {movie.rating}
                </p>
                <p className="movie-meta">
                  <strong>ID:</strong> {movie.id}
                </p>
                <button
                  className="button delete"
                  onClick={async () => {
                    try {
                      await deleteMovie(movie.id);
                      setMovies(movies.filter((m) => m.id !== movie.id));
                    } catch (e) {
                      console.error("Failed to delete movie:", e);
                      alert("Failed to delete movie");
                    }
                  }}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="hr" />

      <section className="panel">
        <h2>Add a Movie</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="title">
              Title*
            </label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inception"
              required
            />
          </div>

          <div className="row">
            <div className="field">
              <label className="label" htmlFor="year">
                Year*
              </label>
              <input
                id="year"
                type="number"
                className="input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1888}
                max={2100}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="genre">
                Genre*
              </label>
              <input
                id="genre"
                className="input"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Sci-Fi"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="rating">
              Rating*
            </label>
            <input
              id="rating"
              type="number"
              step="0"
              className="input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min={0}
              max={10}
              required
            />
          </div>
          <button type="submit" className="button">
            Add Movie
          </button>
        </form>
      </section>
    </div>
  );
}

export default App;
