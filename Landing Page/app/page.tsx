import Link from 'next/link'

export default function Page() {
  return (
    <main style={{maxWidth: 900, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}}>
      <h1>Subway Status</h1>
      <h2>Welcome to Subway Status</h2>
      <p>Get a quick overview of subway networks and their current status.</p>
      <p>
        <Link href="/networks">View Networks</Link>
      </p>
    </main>
  )
}

