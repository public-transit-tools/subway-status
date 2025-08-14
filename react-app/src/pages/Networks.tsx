import { Link } from 'react-router-dom'

export function Networks() {
  return (
    <div className="page networks">
      <header>
        <h1>Subway Networks</h1>
      </header>
      <main>
        <section className="network-list">
          <h2>Available Systems</h2>
          <ul>
            <li>
              <span className="line-name">TTC (Toronto)</span>
              <Link to="/ttc" className="button">Open TTC</Link>
            </li>
          </ul>
          <p style={{marginTop: '2em', color: '#888'}}>More systems coming soon.</p>
          <Link to="/" className="button" style={{marginTop: '2em'}}>Back to Home</Link>
        </section>
      </main>
      <footer>
        <p>&copy; 2025 SubwayStatus.com</p>
      </footer>
    </div>
  )
}

