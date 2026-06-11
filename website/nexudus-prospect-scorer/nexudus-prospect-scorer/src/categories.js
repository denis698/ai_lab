export const CATEGORIES = [
  { id: 1,  name: 'Membership management',           nexudus: 5   },
  { id: 2,  name: 'Room and desk bookings',           nexudus: 4   },
  { id: 3,  name: 'Event management',                nexudus: 2.5, gapThreshold: 4 },
  { id: 4,  name: 'Check-in and access control',     nexudus: 3   },
  { id: 5,  name: 'Visitor management',              nexudus: 2,   gapThreshold: 4 },
  { id: 6,  name: 'Invoicing and payments',          nexudus: 4   },
  { id: 7,  name: 'Contracts and proposals',         nexudus: 3   },
  { id: 8,  name: 'Reporting and analytics',         nexudus: 3   },
  { id: 9,  name: 'Day passes and drop-ins',         nexudus: 4   },
  { id: 10, name: 'Mail handling and virtual office',nexudus: 3   },
  { id: 11, name: 'Member portal and app',           nexudus: 5   },
  { id: 12, name: 'Community and network',           nexudus: 3.5 },
  { id: 13, name: 'White labelling',                 nexudus: 5   },
  { id: 14, name: 'NexKiosk',                        nexudus: 3   },
  { id: 15, name: 'Identity verification',           nexudus: 4   },
  { id: 16, name: 'Multi-location',                  nexudus: 4   },
  { id: 17, name: 'CRM module',                      nexudus: 2.5, gapThreshold: 4 },
  { id: 18, name: 'Floor plan',                      nexudus: 4   },
  { id: 19, name: 'API and custom development',      nexudus: 5   },
  { id: 20, name: 'Migration and onboarding',        nexudus: 4,   isRisk: true, gapThreshold: 4 },
]

export const SYSTEM_PROMPT = 'You are an expert Nexudus sales analyst. Score a prospect against 20 capability categories and return a JSON scorecard. Score each 1-5 based on how much the prospect NEEDS that capability. Categories: 1.Membership management(Nexudus:5) 2.Room bookings(4) 3.Events(2.5,GAP>=4) 4.Access control(3) 5.Visitor mgmt(2,GAP>=4) 6.Invoicing(4) 7.Contracts(3) 8.Reporting(3) 9.Day passes(4) 10.Mail/VO(3) 11.Member portal(5) 12.Community(3.5) 13.White label(5) 14.NexKiosk(3) 15.Identity verification(4) 16.Multi-location(4) 17.CRM(2.5,GAP>=4) 18.Floor plan(4) 19.API(5) 20.Migration(4,RISK,GAP>=4). Affordability: Nexudus ~150GBP/month/location. Return ONLY valid JSON no markdown: {"company_name":"string","website":"string","space_type":"string","location":"string","current_platform":"string","scores":[20 integers],"total":integer,"verdict":"strong prospect|moderate fit|early stage|not an operator","gap_flags":["string"],"risk_flags":["string"],"affordability_flag":"string or null","opening_angle":"string","data_confidence":"high|medium|low","confidence_note":"string"}'

export function verdictMeta(t) {
  if (t >= 70) return { label: 'Strong prospect', textColor: '#27500A', bg: '#EAF3DE', dot: '#639922' }
  if (t >= 45) return { label: 'Moderate fit',    textColor: '#0C447C', bg: '#E6F1FB', dot: '#378ADD' }
  if (t >= 20) return { label: 'Early stage',     textColor: '#633806', bg: '#FAEEDA', dot: '#EF9F27' }
  return       { label: 'Not an operator', textColor: '#791F1F', bg: '#FCEBEB', dot: '#E24B4A' }
}