import Link from 'next/link'

export default function Networks() {
  return (
    <main style={{maxWidth: 900, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}}>
      <h1>Subway Networks</h1>
      <ul>
        <li>
          <span>TTC (Toronto)</span>{' '}
          <a href="https://ttc.subwaystatus.com">Open TTC</a>
        </li>
      </ul>
      <p><Link href="/">Back</Link></p>
    </main>
  )
}

