import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, SYSTEM_PROMPT, verdictMeta } from './categories.js'
import { buildFullHtml, downloadPdf, downloadDocx } from './export.js'

function ScoreRing({ total }) {
  const v = verdictMeta(total)
  const r = 28, circ = 2 * Math.PI * r
  const progress = (total / 100) * circ
  return (
    <svg width='80' height='80' viewBox='0 0 80 80'>
      <circle cx='40' cy='40' r={r} fill='none' stroke='#e5e7eb' strokeWidth='6'/>
      <circle cx='40' cy='40' r={r} fill='none' stroke={v.dot} strokeWidth='6'
        strokeDasharray={progress + ' ' + circ} strokeLinecap='round'
        transform='rotate(-90 40 40)' style={{ transition: 'stroke-dasharray 0.6s ease' }}/>
      <text x='40' y='44' textAnchor='middle' fontSize='16' fontWeight='500' fill='#111827'>{total}</text>
    </svg>
  )
}

function MiniBar({ value, max = 5, color }) {
  return (
    <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, flex: 1, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: ((value/max)*100)+'%', background: color, borderRadius: 3 }} />
    </div>
  )
}

function ExportMenu({ result, onClose }) {
  const ref = useRef()
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const items = [
    { label: 'Full scorecard', sub: 'PDF',         action: () => { downloadPdf(buildFullHtml(result)); onClose() } },
    { label: 'Full scorecard', sub: 'Word (.doc)', action: () => { downloadDocx(result, 'full'); onClose() } },
    { label: 'AE summary',     sub: 'Word (.doc)', action: () => { downloadDocx(result, 'summary'); onClose() } },
  ]
  return (
    <div ref={ref} style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '0.5px solid #d1d5db', borderRadius: 12, zIndex: 20, minWidth: 200, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '8px 12px 6px', fontSize: 11, color: '#9ca3af', borderBottom: '0.5px solid #f3f4f6' }}>Export as</div>
      {items.map((item, i) => (
        <button key={i} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', textAlign: 'left', fontSize: 13, color: '#111827', background: 'transparent', border: 'none', borderBottom: i < items.length-1 ? '0.5px solid #f3f4f6' : 'none', cursor: 'pointer' }}>
          <span style={{ flex: 1 }}>{item.label}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.sub}</span>
        </button>
      ))}
    </div>
  )
}

export default function ProspectScorer() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [view, setView] = useState('scorer')
  const [exportOpen, setExportOpen] = useState(false)
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  const score = async () => {
    if (!url.trim()) return
    setLoading(true); setError(null); setResult(null); setExportOpen(false)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: 'Score this prospect: ' + url.trim() + '. Return only the JSON object.' }] })
      })
      if (!res.ok) throw new Error('API error ' + res.status)
      const data = await res.json()
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = text.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON in response')
      const parsed = JSON.parse(match[0])
      if (!Array.isArray(parsed.scores)) throw new Error('Invalid scores')
      setResult(parsed)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const v = result ? verdictMeta(result.total) : null
  const tab = active => ({ padding: '8px 16px', fontSize: 13, fontWeight: active ? 500 : 400, color: active ? '#111827' : '#6b7280', background: 'transparent', border: 'none', borderBottom: active ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', marginBottom: -1 })

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, borderBottom: '0.5px solid #e5e7eb' }}>
        <button style={tab(view==='scorer')}    onClick={() => setView('scorer')}>Score a prospect</button>
        <button style={tab(view==='framework')} onClick={() => setView('framework')}>Framework</button>
      </div>

      {view === 'scorer' && (
        <div>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Prospect website</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Enter the full URL including https://</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type='text' value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key==='Enter' && !loading && score()} placeholder='https://example.com' style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', fontSize: 14 }} />
              <button onClick={score} disabled={loading || !url.trim()} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: loading||!url.trim() ? '#e5e7eb' : '#111827', color: loading||!url.trim() ? '#9ca3af' : 'white', cursor: loading||!url.trim() ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, minWidth: 96 }}>{loading ? 'Scoring…' : 'Score ↗'}</button>
            </div>
          </div>
          {loading && <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280', fontSize: 13 }}>Analysing across 20 modules…</div>}
          {error  && <div style={{ padding: '12px 14px', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {result && v && (
            <div>
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{result.company_name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{result.space_type} · {result.location}</div>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: v.bg, color: v.textColor }}>{v.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ScoreRing total={result.total} />
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setExportOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '0.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Export ▾</button>
                      {exportOpen && <ExportMenu result={result} onClose={() => setExportOpen(false)} />}
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '0.5px solid #f3f4f6', paddingTop: 14 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 500 }}>AE opening angle</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65 }}>{result.opening_angle}</div>
                </div>
              </div>
              <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ padding: '12px 1.25rem', borderBottom: '0.5px solid #f3f4f6', fontSize: 13, fontWeight: 500 }}>Module scores</div>
                {CATEGORIES.map((cat, i) => {
                  const ps = result.scores[i] || 0
                  const hasGap = cat.gapThreshold && ps >= cat.gapThreshold
                  return (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 1.25rem', borderBottom: i < CATEGORIES.length-1 ? '0.5px solid #f9fafb' : 'none' }}>
                      <div style={{ width: 18, fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{cat.id}</div>
                      <div style={{ flex: '0 0 160px', fontSize: 12 }}>{cat.name}</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <MiniBar value={ps} color={cat.isRisk ? '#EF9F27' : '#1D9E75'} />
                        <MiniBar value={cat.nexudus} color='#378ADD' />
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', width: 28, textAlign: 'right' }}>{ps}/5</div>
                      <div style={{ width: 56, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        {cat.isRisk && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#FAEEDA', color: '#854F0B', fontWeight: 500 }}>risk</span>}
                        {hasGap   && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#FCEBEB', color: '#A32D2D', fontWeight: 500 }}>gap</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
              {(result.gap_flags?.length || result.risk_flags?.length || result.affordability_flag) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                  {result.gap_flags?.length > 0 && <div style={{ background: '#FCEBEB', border: '0.5px solid #F7C1C1', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', marginBottom: 8 }}>Gap flags</div>{result.gap_flags.map((f,i) => <div key={i} style={{ fontSize: 12, color: '#791F1F', marginBottom: 4 }}>· {f}</div>)}</div>}
                  {result.risk_flags?.length > 0 && <div style={{ background: '#FAEEDA', border: '0.5px solid #FAC775', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 11, fontWeight: 500, color: '#854F0B', marginBottom: 8 }}>Risk flags</div>{result.risk_flags.map((f,i) => <div key={i} style={{ fontSize: 12, color: '#633806', marginBottom: 4 }}>· {f}</div>)}</div>}
                  {result.affordability_flag && <div style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 8, padding: '12px 14px' }}><div style={{ fontSize: 11, fontWeight: 500, color: '#185FA5', marginBottom: 8 }}>Affordability</div><div style={{ fontSize: 12, color: '#0C447C' }}>{result.affordability_flag}</div></div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'framework' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8, marginBottom: 24 }}>
            {[['70-100','Strong prospect','#EAF3DE','#27500A'],['45-69','Moderate fit','#E6F1FB','#0C447C'],['20-44','Early stage','#FAEEDA','#633806'],['<20','Not an operator','#FCEBEB','#791F1F']].map(([range,label,bg,col]) => (
              <div key={range} style={{ background: bg, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: col }}>{range}</div>
                <div style={{ fontSize: 12, color: col, marginTop: 2, opacity: 0.85 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {CATEGORIES.map((cat,i) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 1rem', borderBottom: i < CATEGORIES.length-1 ? '0.5px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 18, fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{cat.id}</div>
                <div style={{ flex: '0 0 190px', fontSize: 13 }}>{cat.name}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {[1,2,3,4,5].map(d => <div key={d} style={{ width: 9, height: 9, borderRadius: 2, background: d <= cat.nexudus ? '#378ADD' : '#e5e7eb' }} />)}
                  <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 2 }}>{cat.nexudus}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {cat.isRisk && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#FAEEDA', color: '#854F0B', fontWeight: 500 }}>risk</span>}
                  {cat.gapThreshold && !cat.isRisk && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: '#FCEBEB', color: '#A32D2D', fontWeight: 500 }}>gap if ge{cat.gapThreshold}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}