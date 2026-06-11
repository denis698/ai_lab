import ProspectScorer from './ProspectScorer.jsx'
export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 4px' }}>Prospect Scorer</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Nexudus fit scoring — powered by AI</p>
        </div>
        <ProspectScorer />
      </div>
    </div>
  )
}