import { CATEGORIES, verdictMeta } from './categories.js'

const fmt = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

function flags(items, title, bg, col) {
  if (!items || !items.length) return ''
  return '<div style="background:' + bg + ';border-radius:6px;padding:12px 14px;margin-bottom:10px;"><div style="font-size:11px;font-weight:600;color:' + col + ';margin-bottom:5px;">' + title + '</div>' + items.map(function(f){ return '<div style="font-size:12px;color:' + col + ';margin-bottom:2px;">· ' + f + '</div>' }).join('') + '</div>'
}

export function buildFullHtml(r) {
  var v = verdictMeta(r.total)
  var rows = CATEGORIES.map(function(cat, i) {
    var ps = r.scores[i] || 0
    var gap = cat.gapThreshold && ps >= cat.gapThreshold
    return '<tr><td style="padding:8px 10px;font-size:12px;border-bottom:1px solid #f3f4f6;">' + cat.id + '. ' + cat.name + (cat.isRisk ? ' <span style="font-size:10px;background:#FAEEDA;color:#854F0B;padding:1px 5px;border-radius:3px;">risk</span>' : '') + (gap ? ' <span style="font-size:10px;background:#FCEBEB;color:#A32D2D;padding:1px 5px;border-radius:3px;">gap</span>' : '') + '</td><td style="padding:8px 10px;width:110px;border-bottom:1px solid #f3f4f6;"><div style="background:#e5e7eb;border-radius:3px;height:6px;"><div style="background:#1D9E75;height:6px;border-radius:3px;width:' + ((ps/5)*100) + '%;"></div></div><div style="font-size:10px;color:#6b7280;margin-top:2px;">' + ps + '/5</div></td><td style="padding:8px 10px;width:110px;border-bottom:1px solid #f3f4f6;"><div style="background:#e5e7eb;border-radius:3px;height:6px;"><div style="background:#378ADD;height:6px;border-radius:3px;width:' + ((cat.nexudus/5)*100) + '%;"></div></div><div style="font-size:10px;color:#6b7280;margin-top:2px;">' + cat.nexudus + '/5</div></td></tr>'
  }).join('')
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Scorecard</title><style>body{font-family:Arial,sans-serif;color:#111;margin:0;padding:40px;max-width:780px;}table{width:100%;border-collapse:collapse;}</style></head><body><div style="border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:24px;display:flex;justify-content:space-between;"><div><div style="font-size:22px;font-weight:700;">' + r.company_name + '</div><div style="font-size:12px;color:#6b7280;">' + r.space_type + ' · ' + r.location + '</div></div><div style="text-align:right;"><div style="font-size:40px;font-weight:700;">' + r.total + '<span style="font-size:14px;color:#9ca3af;">/100</span></div><div style="font-size:11px;font-weight:600;background:' + v.bg + ';color:' + v.textColor + ';display:inline-block;padding:2px 10px;border-radius:4px;">' + v.label.toUpperCase() + '</div></div></div><div style="background:#f9fafb;border-radius:6px;padding:14px;margin-bottom:20px;"><div style="font-size:13px;font-weight:600;margin-bottom:6px;">AE opening angle</div><p style="font-size:13px;line-height:1.65;margin:0;">' + r.opening_angle + '</p></div><table><thead><tr><th style="text-align:left;font-size:10px;color:#9ca3af;padding:6px 10px;border-bottom:2px solid #e5e7eb;">Module</th><th style="font-size:10px;color:#9ca3af;padding:6px 10px;border-bottom:2px solid #e5e7eb;">Prospect need</th><th style="font-size:10px;color:#9ca3af;padding:6px 10px;border-bottom:2px solid #e5e7eb;">Nexudus cap.</th></tr></thead><tbody>' + rows + '</tbody></table>' + flags(r.gap_flags,'Gap flags','#FCEBEB','#A32D2D') + flags(r.risk_flags,'Risk flags','#FAEEDA','#854F0B') + (r.affordability_flag ? flags([r.affordability_flag],'Affordability','#E6F1FB','#185FA5') : '') + '<div style="margin-top:24px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:10px;">Nexudus Prospect Scorer · ' + fmt() + '</div></body></html>'
}

export function downloadPdf(html) {
  var w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(function(){ w.print() }, 600)
}

export function downloadDocx(r, layout) {
  var v = verdictMeta(r.total)
  var slug = r.company_name.toLowerCase().replace(/\s+/g, '-')
  var body = '<h1>Nexudus ' + (layout === 'full' ? 'Scorecard' : 'AE Brief') + '</h1><h2>' + r.company_name + '</h2><p><b>Score:</b> ' + r.total + '/100 | <b>Verdict:</b> ' + v.label + ' | <b>Platform:</b> ' + r.current_platform + '</p><p><b>Opening angle:</b> ' + r.opening_angle + '</p>'
  if (layout === 'full') {
    body += '<h3>Module Scores</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;"><tr><th>Module</th><th>Need</th><th>Nexudus</th></tr>' + CATEGORIES.map(function(cat,i){ return '<tr><td>' + cat.id + '. ' + cat.name + '</td><td>' + (r.scores[i]||0) + '/5</td><td>' + cat.nexudus + '/5</td></tr>' }).join('') + '</table>'
    if (r.gap_flags && r.gap_flags.length) body += '<h3>Gap Flags</h3><ul>' + r.gap_flags.map(function(f){ return '<li>' + f + '</li>' }).join('') + '</ul>'
    if (r.risk_flags && r.risk_flags.length) body += '<h3>Risk Flags</h3><ul>' + r.risk_flags.map(function(f){ return '<li>' + f + '</li>' }).join('') + '</ul>'
  }
  var html = '<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>' + body + '</body></html>'
  var blob = new Blob([html], { type: 'application/msword' })
  var a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'nexudus-' + (layout === 'full' ? 'scorecard' : 'ae-brief') + '-' + slug + '.doc'
  a.click()
}