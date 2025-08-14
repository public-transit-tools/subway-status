import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="page landing">
      <header>
        <h1>Subway Status</h1>
      </header>
      <main>
        <section className="hero">
          <h2>Welcome to Subway Status</h2>
          <p>Get a quick overview of subway networks and their current status.</p>
          <Link to="/networks" className="button">View Networks</Link>
        </section>
      </main>
      <footer>
        <p>&copy; 2025 SubwayStatus.com</p>
      </footer>
    </div>
  )
}

