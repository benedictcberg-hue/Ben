import ExcelJS from 'exceljs'
import { writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  azBlue:      '00395D',
  azBlueLight: 'D6E4EF',
  white:       'FFFFFFFF',
  headerText:  'FFFFFFFF',
  inputYellow: 'FFFFF0CC',
  lockedGrey:  'FFF2F2F2',
  green:       'FFD4EDDA',
  red:         'FFF8D7DA',
  amber:       'FFFFF3CD',
  greyText:    'FF888888',
  timingPre:   'FFDBEAFE',   // light blue  — Vorab
  timingOnsite:'FFFEF3C7',   // light amber — Vor Ort
}

// ── Helper: set cell style ──────────────────────────────────────────────────
function style(cell, opts = {}) {
  if (opts.bold !== undefined)     cell.font   = { ...cell.font, bold: opts.bold, name: 'Arial', size: opts.size || 10 }
  if (opts.size)                   cell.font   = { ...cell.font, name: 'Arial', size: opts.size }
  if (opts.color)                  cell.font   = { ...cell.font, color: { argb: opts.color } }
  if (opts.bg)                     cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.bg } }
  if (opts.align)                  cell.alignment = { vertical: 'middle', horizontal: opts.align, wrapText: true }
  if (opts.border)                 cell.border = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' },
  }
}

function hdr(cell, text, opts = {}) {
  cell.value = text
  cell.font  = { bold: true, color: { argb: C.headerText }, name: 'Arial', size: opts.size || 10 }
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.azBlue } }
  cell.alignment = { vertical: 'middle', horizontal: opts.align || 'left', wrapText: true }
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFAAAACC' } },
    bottom: { style: 'thin', color: { argb: 'FFAAAACC' } },
    left: { style: 'thin', color: { argb: 'FFAAAACC' } },
    right: { style: 'thin', color: { argb: 'FFAAAACC' } },
  }
}

function inputCell(cell, value, opts = {}) {
  cell.value = value !== undefined ? value : ''
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.inputYellow } }
  cell.font  = { name: 'Arial', size: 10 }
  cell.alignment = { vertical: 'top', wrapText: true }
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  }
}

function lockedCell(cell, value, opts = {}) {
  cell.value = value !== undefined ? value : ''
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lockedGrey } }
  cell.font  = { name: 'Arial', size: 10, color: opts.color ? { argb: opts.color } : undefined }
  cell.alignment = { vertical: 'top', wrapText: true }
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  }
}

// ── AZ question data ─────────────────────────────────────────────────────────
// timing: 'pre'  = can be confirmed / filled before the visit (Vorab)
//         'onsite' = must be checked on the day of the visit (Vor Ort)
const sections = [
  { id: '1', title: 'Training of Study Personnel', questions: [
    { id:'1.1',    timing:'onsite', expected:'Yes',    text:'Study rationale and objectives?',                                    comment:'The objective of this "pre-approval" SIV was conducted for training purposes only.' },
    { id:'1.2',    timing:'onsite', expected:'Yes',    text:'Clinical Study Protocol requirements, including adherence thereto?', comment:'Training was provided according to SIV PPT V.x.x. dated YYYY MMM DD and CSP V.X.X.' },
    { id:'1.3',    timing:'onsite', expected:'Yes',    text:"Key elements of the Investigator's Brochure?",                      comment:'MSLM/CRA/LSAD discussed these with the PI/SI/SC.' },
    { id:'1.4',    timing:'onsite', expected:'Yes',    text:'Study timelines?',                                                   comment:'PI/SI confirmed enrollment of 14 patients; first screening/randomization planned YYYY MM DD.' },
    { id:'1.5',    timing:'onsite', expected:'Yes',    text:'Study assessments and visit schedule?',                              comment:'CRA discussed in detail according to CSP V x.x.' },
    { id:'1.6',    timing:'onsite', expected:'Yes',    text:'Procedures for screening, enrolment, randomisation and premature discontinuation?', comment:'CRA discussed in detail according to CSP V x.x.' },
    { id:'1.7',    timing:'onsite', expected:'Yes',    text:'Inclusion/exclusion criteria?',                                      comment:'CRA discussed in detail according to CSP V x.x.' },
    { id:'1.8',    timing:'onsite', expected:'Yes',    text:'Subject information and consent requirements?',                      comment:'CRA discussed in detail according to CSP V x.x. See also 1.1 regarding Pre-Approval nature.' },
    { id:'1.9',    timing:'onsite', expected:'Yes',    text:'Adverse Event reporting?',                                           comment:'CRA discussed AE reporting procedures in detail according to CSP V x.x.' },
    { id:'1.10',   timing:'onsite', expected:'Yes',    text:'SAE reporting, follow up process and causality?',                    comment:'CRA discussed in detail according to CSP V x.x.' },
    { id:'1.11',   timing:'onsite', expected:'Yes',    text:'Pregnancy, Overdose, Medication Error, Drug Misuse & Abuse procedures?', comment:'HIGH risk for theft discussed — site to notify Monitor immediately, no later than 24h.' },
    { id:'1.12',   timing:'onsite', expected:'Yes',    text:'Doses and study drug regimens including disallowed/concomitant medication?', comment:'MSLM, CRA, LSAD discussed in detail and site is in agreement.' },
    { id:'1.13',   timing:'onsite', expected:'Yes',    text:'Procedures for study drug handling?',                                comment:'MSLM, CRA, LSAD discussed in detail. See also 1.1 Pre-Approval nature.' },
    { id:'1.14',   timing:'onsite', expected:'Yes/NA', text:'Emergency unblinding procedures, if applicable?',                   comment:'NA — This study is open label.' },
    { id:'1.14.1', timing:'onsite', expected:'Yes/NA', text:'PI delegated Sub-I for Emergency Unblinding on DoR Log?',           comment:'NA — This study is open label.' },
    { id:'1.15',   timing:'onsite', expected:'Yes',    text:'Requirements for the content of medical records?',                   comment:'CRA discussed in detail; site is in agreement.' },
    { id:'1.16',   timing:'onsite', expected:'Yes',    text:'Procedures for sample collection, processing, labelling, storage, tracking and shipping?', comment:'CRA discussed with the site in detail.' },
    { id:'1.17',   timing:'onsite', expected:'Yes/NA', text:'Requirements for risk samples, if applicable?',                      comment:'NA.' },
    { id:'1.18',   timing:'onsite', expected:'Yes',    text:'Equipment including maintenance and calibration?',                   comment:'All certificates and calibrations are in place and were reviewed.' },
    { id:'1.19',   timing:'onsite', expected:'Yes',    text:'Data recording (paper/eCRF), data query requirements, timelines and procedures?', comment:'Site is fully trained and accesses are working/were requested.' },
    { id:'1.20',   timing:'onsite', expected:'Yes',    text:'Obligation to inform sponsor of urgent safety measures?',            comment:'Site to immediately notify Study Clinical Lead and Clinical Team.' },
    { id:'1.21',   timing:'onsite', expected:'Yes',    text:'Obligation to report non-compliance/serious breach?',                comment:'MSLM, CRA, LSAD discussed in detail and site is in agreement.' },
    { id:'1.22',   timing:'onsite', expected:'Yes',    text:'Comments regarding Training of Study Site Personnel.',               comment:'The listed Personnel was fully trained. ICF versions, IP Handling Manual, Biological Sample Handling, ISF and Vendors discussed.' },
  ]},
  { id: '2', title: 'Subject Requirements and Procedures', questions: [
    { id:'2.1', timing:'pre',    expected:'Yes',    text:'Were the number of subjects (overall and per site) discussed with the site?', comment:'PI confirmed 14 patients; first screening/randomization planned YYYY MM DD.' },
    { id:'2.2', timing:'onsite', expected:'Yes/NA', text:'Were advertisements for subject recruitment (if applicable) discussed?',       comment:'See 1.1 regarding Pre-Approval nature of this visit.' },
    { id:'2.3', timing:'onsite', expected:'Yes',    text:'Were materials (Thank You cards, Ongoing Communications, Trial Results Summaries) discussed?', comment:'CRA/LSAD discussed patient-reimbursement and retention. Thank You Cards in German discussed.' },
  ]},
  { id: '3', title: 'IRB/IEC and Regulatory Authority Responsibilities', questions: [
    { id:'3.1', timing:'onsite', expected:'Yes',    text:'Were responsibilities for obtaining approval for updated CSP, ICFs and patient facing materials discussed?', comment:'Site was informed no patient procedures before sponsor approval via "Ready To Enrollment".' },
    { id:'3.2', timing:'pre',    expected:'Yes/NA', text:'Were responsibilities for reporting ISIs, safety information and progress reports to IRB/IEC discussed?',    comment:'NA — Sponsor will report accordingly and inform sites.' },
    { id:'3.3', timing:'onsite', expected:'Yes',    text:'Comments regarding IRB/IEC and Regulatory Authority Responsibilities.',                                      comment:'Please refer to 3.2.' },
  ]},
  { id: '4', title: 'Monitoring and Source Data Verification', questions: [
    { id:'4.1', timing:'onsite', expected:'Yes',    text:'Were remote monitoring visits discussed? Is key contact agreed?',         comment:'CRA discussed REMs regularly; main SC is contact; medical queries forwarded to PI/SI.' },
    { id:'4.2', timing:'onsite', expected:'Yes',    text:'Are Investigators aware to contact monitor at time of enrolment of first subject?', comment:'Site is aware; first RMV after first patient screened.' },
    { id:'4.3', timing:'onsite', expected:'Yes',    text:'Were on-site monitoring procedures and frequency discussed?',            comment:'CRA discussed frequency; site is in agreement.' },
    { id:'4.4', timing:'onsite', expected:'Yes',    text:'Were remote monitoring procedures and centralized monitoring discussed?', comment:'CRA discussed in detail. Site is in agreement.' },
    { id:'4.5', timing:'onsite', expected:'Yes',    text:'Were SDV requirements and access to original records discussed?',        comment:'Site using printouts/EMR; CRA will get access according to 21 CFR Part 11.' },
    { id:'4.6', timing:'onsite', expected:'Yes/NA', text:'If EMR is used: confirmed local or remote CRA access?',                  comment:'CRA will get access only to study patients according to 21 CFR Part 11.' },
    { id:'4.7', timing:'pre',    expected:'Yes/NA', text:'Are Local Laboratory reference ranges available and up to date?',        comment:'NA — Site using local lab for quick check; Central Lab used in general.' },
    { id:'4.8', timing:'onsite', expected:'Yes',    text:'Comments regarding Monitoring and Source Data Verification.',            comment:'CRA discussed all applicable study patient data need to be reviewed on an ongoing basis.' },
  ]},
  { id: '5', title: 'Study Drug', questions: [
    { id:'5.1', timing:'onsite', expected:'Yes', text:'Is the study drug storage facility considered adequate (security, temperature)?', comment:'CRA checked the facility and considered it adequate.' },
    { id:'5.2', timing:'onsite', expected:'Yes', text:'Comments regarding Study Drug.',                                                  comment:'See 1.1. IP restrictions communicated. Initial IP Shipment triggered once IP Greenlight activities completed. Site must inform LST prior any new patient screening/randomization.' },
  ]},
  { id: '6', title: 'Human Biological Samples', questions: [
    { id:'6.1', timing:'onsite', expected:'Yes',    text:'Is there an appropriate storage area for samples (security, temperature)?', comment:'Lab Samples will be stored in secured fridge/freezer at -20°C and/or -80°C.' },
    { id:'6.2', timing:'pre',    expected:'Yes/NA', text:'Have the required accreditation(s)/licenses been collected?',               comment:'CRA checked during SIV.' },
    { id:'6.3', timing:'onsite', expected:'Yes/NA', text:'Comments regarding Human Biological Samples.',                               comment:'NA — Central Lab will be used. Main SC is IATA trained. AZ HbS Log Vx to be used.' },
  ]},
  { id: '7', title: 'Web-based Data Capture / Randomization and Trial Supply Management (RTSM, IRT, IxRS)', questions: [
    { id:'7.1', timing:'pre',    expected:'Yes', text:'Is the set-up of WBDC, Randomization and RTSM/IRT/IxRS at the site complete?', comment:'All accesses provided. SC activated; PI/SI accesses pending after Pre-Approval SIV.' },
    { id:'7.2', timing:'onsite', expected:'Yes', text:'Is WBDC, RTSM training complete and access confirmed?',                          comment:'The whole Site Team is fully activated.' },
    { id:'7.3', timing:'onsite', expected:'Yes', text:'Comments regarding WBDC / Randomization and Trial Supply Management.',           comment:'WBDC and IRT systems trained during SIV. IRT access: active/pending. RAVE access: active/pending.' },
  ]},
  { id: '8', title: 'Electronic Patient Reported Outcome (ePRO)', questions: [
    { id:'8.1', timing:'onsite', expected:'Yes', text:'Is the ePRO storage facility considered adequate?',           comment:'CRA checked and considered facility adequate.' },
    { id:'8.2', timing:'onsite', expected:'Yes', text:'Is ePRO training complete and access confirmed?',              comment:'Whole Site Team fully activated. E-learning required for: [list].' },
    { id:'8.3', timing:'onsite', expected:'Yes', text:'Were contingency plans for ePRO system failure discussed?',   comment:'CRA discussed the details with the site.' },
    { id:'8.4', timing:'onsite', expected:'Yes', text:'Comments regarding Electronic Patient Reported Outcome.',      comment:'' },
  ]},
  { id: '9', title: 'Study Materials and Supplies', questions: [
    { id:'9.1',  timing:'onsite', expected:'Yes',    text:'Is an up-to-date Investigator Study File available and appropriately stored?', comment:'ISF reviewed; documents will be provided after IEC Approval and RtE.' },
    { id:'9.2',  timing:'pre',    expected:'Yes/NA', text:'Is a signed Clinical Study Protocol available and appropriately stored?',      comment:'NA — Will be provided after IEC Approval; PI Signature to be collected.' },
    { id:'9.3',  timing:'pre',    expected:'Yes',    text:'Are signed CSA and Source Data Agreement available and appropriately stored?', comment:'CSA fully executed. SDA collected during SIV.' },
    { id:'9.4',  timing:'pre',    expected:'Yes/NA', text:'Is a current Investigator Brochure available and appropriately stored?',       comment:'NA — Will be provided after IEC Approval. See 1.3.' },
    { id:'9.5',  timing:'pre',    expected:'Yes/NA', text:'Are ePRO supplies and user instructions available and stored?',               comment:'NA — Will be provided after IEC Approval.' },
    { id:'9.6',  timing:'pre',    expected:'Yes/NA', text:'Are Emergency unblinding tools available (if applicable)?',                   comment:'NA — Open label study.' },
    { id:'9.7',  timing:'pre',    expected:'Yes/NA', text:'Are paper CRFs available and appropriately stored (if applicable)?',          comment:'NA — Electronic CRF is used.' },
    { id:'9.8',  timing:'onsite', expected:'Yes',    text:'Are subject diary cards, questionnaires, participation cards available and IRB/IEC-approved?', comment:'No — Patient material will be provided after site RtE.' },
    { id:'9.9',  timing:'pre',    expected:'Yes/NA', text:'Are laboratory supplies available and appropriately stored?',                  comment:'NA — Will be provided after IEC Approval.' },
    { id:'9.10', timing:'pre',    expected:'Yes/NA', text:'Is Study Drug available and appropriately stored?',                            comment:'Study drug shipment triggered once site activated in IRT system.' },
    { id:'9.11', timing:'onsite', expected:'Yes',    text:'Comments regarding Study Materials and Supplies.',                             comment:'' },
  ]},
  { id: '10', title: 'Other Study Requirements', questions: [
    { id:'10.1',  timing:'pre',    expected:'Yes', text:'Were CSA requirements and Source Data location discussed?',                    comment:'CSA completed. CRA will have access to all needed source data.' },
    { id:'10.2',  timing:'onsite', expected:'Yes', text:'Does PI understand responsibility to supervise delegated duties?',             comment:'PI is fully aware of responsibility.' },
    { id:'10.3',  timing:'onsite', expected:'Yes', text:'Was delegation of responsibilities within Study Site Team discussed?',         comment:'DOR completed during SIV. Scan collected and will be filed in eTMF.' },
    { id:'10.4',  timing:'onsite', expected:'Yes', text:'Were ISF requirements and responsibilities discussed?',                        comment:'' },
    { id:'10.5',  timing:'onsite', expected:'Yes', text:'Were archiving responsibilities discussed?',                                   comment:'Site archive will be X.' },
    { id:'10.6',  timing:'pre',    expected:'Yes', text:'Were Financial Disclosure requirements discussed?',                            comment:'FDFs completed and collected from PI/SI.' },
    { id:'10.7',  timing:'onsite', expected:'Yes', text:'Were potential audit/inspection responsibilities discussed?',                  comment:'Site will inform CRA/LSAD immediately upon receiving any audit/inspection notification.' },
    { id:'10.8',  timing:'pre',    expected:'Yes', text:'Was site provided with AstraZeneca contact information?',                      comment:'ISF reviewed during SIV including AZ contact information.' },
    { id:'10.9',  timing:'pre',    expected:'Yes', text:'Was site provided with WBDC IS Service Desk contact information?',            comment:'' },
    { id:'10.10', timing:'pre',    expected:'Yes', text:'Was site provided with ePRO Service Provider Helpdesk contact?',              comment:'' },
    { id:'10.11', timing:'onsite', expected:'Yes', text:'Was Sponsor obligation to provide new Safety Information discussed?',          comment:'New safety information via Veeva Site Connect; PI and SI must acknowledge electronically.' },
    { id:'10.12', timing:'onsite', expected:'Yes', text:'Were other digital or electronic tools used in the study discussed?',         comment:'Tools: MonTE (IMP temp tracking), Signant Health, IRT & eCOA/ePRO, iMediData Rave EDC, IOVIA Central Lab, ICON Adjudication, Teckro.' },
    { id:'10.13', timing:'onsite', expected:'Yes', text:'Comments regarding Other Study Requirements.',                                 comment:'' },
  ]},
]

// Flatten all questions with their section
const allQuestions = sections.flatMap(sec =>
  sec.questions.map(q => ({ ...q, sectionId: sec.id, sectionTitle: sec.title }))
)

// ── Build workbook ───────────────────────────────────────────────────────────
const wb = new ExcelJS.Workbook()
wb.creator = 'SIV Report Generator'
wb.created = new Date()

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 1 — Admin_Info
// ══════════════════════════════════════════════════════════════════════════════
const wsAdmin = wb.addWorksheet('Admin_Info', {
  pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
})

wsAdmin.columns = [
  { width: 36 },   // A - label
  { width: 46 },   // B - value
  { width: 12 },   // C - timing indicator
]

// Title row
wsAdmin.mergeCells('A1:C1')
const titleCell = wsAdmin.getCell('A1')
titleCell.value = 'AstraZeneca — Initiation Visit Report'
titleCell.font = { bold: true, size: 14, color: { argb: C.headerText }, name: 'Arial' }
titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.azBlue } }
titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
wsAdmin.getRow(1).height = 30

// Subtitle
wsAdmin.mergeCells('A2:C2')
const subCell = wsAdmin.getCell('A2')
subCell.value = 'Version 18.0  |  Form Doc Number: TMP-0010246  |  Parent Doc Number: SOP-0066820'
subCell.font = { italic: true, size: 9, color: { argb: C.headerText }, name: 'Arial' }
subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.azBlue } }
subCell.alignment = { horizontal: 'center', vertical: 'middle' }

// timing: 'pre' = Vorab (fillable before visit), 'onsite' = Vor Ort (confirmed on the day)
const adminData = [
  { label: 'Study Code',                        value: 'Eliminate-2 (D7261C00005)', timing: 'pre' },
  { label: 'Study Site Number',                 value: '',                           timing: 'pre' },
  { label: 'Principal Investigator',            value: '',                           timing: 'pre' },
  { label: 'Study Site Address',                value: '',                           timing: 'pre' },
  { label: 'Monitor Name',                      value: '',                           timing: 'pre' },
  { label: 'Visit Date(s)',                     value: '',                           timing: 'pre' },
  { label: 'Visit Conducted',                   value: 'In Person',                  timing: 'pre' },
  { label: 'Reason for remote (if applicable)', value: '',                           timing: 'pre' },
  { label: 'Monitoring Event Reviewed?',        value: 'Yes',                        timing: 'onsite' },
  { label: 'Reviewed By',                       value: '',                           timing: 'onsite' },
  { label: 'Date Review Completed',             value: '',                           timing: 'onsite' },
  { label: 'Report Author',                     value: '',                           timing: 'pre' },
  { label: 'Report Status',                     value: 'Draft',                      timing: 'onsite' },
]

adminData.forEach(({ label, value, timing }, i) => {
  const row = wsAdmin.getRow(i + 3)
  const labelCell  = row.getCell(1)
  const valueCell  = row.getCell(2)
  const timingCell = row.getCell(3)

  lockedCell(labelCell, label, { color: C.azBlue })
  labelCell.font = { bold: true, name: 'Arial', size: 10, color: { argb: C.azBlue } }
  inputCell(valueCell, value)

  // Timing indicator
  const isVorab = timing === 'pre'
  timingCell.value = isVorab ? 'Vorab' : 'Vor Ort'
  timingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isVorab ? C.timingPre : C.timingOnsite } }
  timingCell.font = { bold: true, name: 'Arial', size: 9, color: { argb: isVorab ? 'FF1E40AF' : 'FF92400E' } }
  timingCell.alignment = { horizontal: 'center', vertical: 'middle' }
  timingCell.border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  }
  row.height = 20
})

// Dropdowns for specific fields
const visitFormatRow = 3 + 6  // "Visit Conducted"
wsAdmin.getCell(`B${visitFormatRow}`).dataValidation = {
  type: 'list', allowBlank: true,
  formulae: ['"In Person,Remotely,Both"'],
  showErrorMessage: true, error: 'Please choose from the list.',
}
const statusRow = 3 + 12  // "Report Status"
wsAdmin.getCell(`B${statusRow}`).dataValidation = {
  type: 'list', allowBlank: true,
  formulae: ['"Draft,Final"'],
}
const reviewedRow = 3 + 8  // "Monitoring Event Reviewed?"
wsAdmin.getCell(`B${reviewedRow}`).dataValidation = {
  type: 'list', allowBlank: true,
  formulae: ['"Yes,No"'],
}

// Timing legend
const legendRow = 3 + adminData.length + 1
wsAdmin.mergeCells(`A${legendRow}:C${legendRow}`)
const legendCell = wsAdmin.getCell(`A${legendRow}`)
legendCell.value = 'Colour legend:  Vorab (blau) = vor dem Besuch ausfüllbar  |  Vor Ort (gelb) = erst am Besuchstag zu bestätigen'
legendCell.font = { italic: true, size: 8.5, name: 'Arial', color: { argb: 'FF444444' } }
legendCell.alignment = { horizontal: 'left', vertical: 'middle' }
wsAdmin.getRow(legendRow).height = 18

// Attendees table
const attStart = legendRow + 2
wsAdmin.mergeCells(`A${attStart}:C${attStart}`)
hdr(wsAdmin.getCell(`A${attStart}`), 'Personnel Present')

const attHeaders = ['Name', 'Role / Function', 'Present (Y/N)']
const attHdrRow = wsAdmin.getRow(attStart + 1)
attHeaders.forEach((h, i) => hdr(attHdrRow.getCell(i + 1), h))

const attendees = [
  'Principal Investigator (PI)',
  'Sub-Investigator (Sub-I)',
  'Study Coordinator (SC)',
  'Study Nurse',
  'MSLM',
  'LSAD',
  'Lead-CRA',
  'Other',
  'Other',
  'Other',
]
attendees.forEach((role, i) => {
  const r = wsAdmin.getRow(attStart + 2 + i)
  inputCell(r.getCell(1), '')
  lockedCell(r.getCell(2), role)
  inputCell(r.getCell(3), '')
  r.getCell(3).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ['"Y,N"'],
  }
  r.height = 18
})

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 2 — Questions_Input
// Column layout:
//  A=Section  B=Q_ID  C=Question Text  D=Expected  E=Has HOLD  F=Has ISS  G=Has ESC
//  H=TIMING   I=YOUR_ANSWER  J=IS_DEVIATION  K=Date1  L=Date2  M=Name  N=Version/Ref  O=Notes
// ══════════════════════════════════════════════════════════════════════════════
const wsQ = wb.addWorksheet('Questions_Input', {
  pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
})

wsQ.columns = [
  { key: 'sec',     width: 8  },   // A
  { key: 'qid',     width: 9  },   // B
  { key: 'text',    width: 48 },   // C
  { key: 'exp',     width: 11 },   // D
  { key: 'hold',    width: 9  },   // E
  { key: 'iss',     width: 9  },   // F
  { key: 'esc',     width: 9  },   // G
  { key: 'timing',  width: 10 },   // H ← TIMING (NEW)
  { key: 'answer',  width: 11 },   // I ← YOUR_ANSWER
  { key: 'isdev',   width: 12 },   // J ← IS_DEVIATION (formula)
  { key: 'p1',      width: 18 },   // K  date_1
  { key: 'p2',      width: 18 },   // L  date_2
  { key: 'p3',      width: 18 },   // M  name
  { key: 'p4',      width: 18 },   // N  version/ref
  { key: 'notes',   width: 35 },   // O
]

// HOLD banner in A1 (spans all columns)
wsQ.mergeCells('A1:O1')
const holdBanner = wsQ.getCell('A1')
holdBanner.value = {
  formula: `=IF(SUMPRODUCT((Questions_Input!J3:J${2 + allQuestions.length}=TRUE)*(Questions_Input!E3:E${2 + allQuestions.length}=TRUE))>0,"⚠  SITE ON HOLD — resolve outstanding HOLD items before activation","")`,
}
holdBanner.font = { bold: true, size: 11, color: { argb: 'FF721C24' }, name: 'Arial' }
holdBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }
holdBanner.alignment = { horizontal: 'center', vertical: 'middle' }
wsQ.getRow(1).height = 22

// Column headers row 2
const qHeaders = [
  'Section', 'Q ID', 'Question Text', 'Expected', 'Has HOLD', 'Has ISS', 'Has ESC',
  'TIMING', 'YOUR ANSWER ▼', 'IS_DEVIATION',
  'Placeholder: Date 1', 'Placeholder: Date 2',
  'Placeholder: Name', 'Placeholder: Version/Ref', 'Notes / Comments',
]
const hRow = wsQ.getRow(2)
hRow.height = 28
qHeaders.forEach((h, i) => {
  const cell = hRow.getCell(i + 1)
  hdr(cell, h, { align: 'center' })
})
wsQ.views = [{ state: 'frozen', xSplit: 2, ySplit: 2 }]

const holdQs = new Set([])
const issQs  = new Set([])
const escQs  = new Set([])

// Data rows starting at row 3
allQuestions.forEach((q, idx) => {
  const rowNum = idx + 3
  const r = wsQ.getRow(rowNum)
  r.height = 45

  // A — Section
  lockedCell(r.getCell(1), q.sectionId)
  r.getCell(1).alignment = { horizontal: 'center', vertical: 'top' }

  // B — Q_ID
  lockedCell(r.getCell(2), q.id)
  r.getCell(2).alignment = { horizontal: 'center', vertical: 'top' }

  // C — Question Text
  lockedCell(r.getCell(3), q.text)

  // D — Expected
  lockedCell(r.getCell(4), q.expected)
  r.getCell(4).alignment = { horizontal: 'center', vertical: 'top' }

  // E/F/G — Has_HOLD / Has_ISS / Has_ESC
  lockedCell(r.getCell(5), holdQs.has(q.id))
  lockedCell(r.getCell(6), issQs.has(q.id))
  lockedCell(r.getCell(7), escQs.has(q.id))
  r.getCell(5).alignment = { horizontal: 'center', vertical: 'top' }
  r.getCell(6).alignment = { horizontal: 'center', vertical: 'top' }
  r.getCell(7).alignment = { horizontal: 'center', vertical: 'top' }

  // H — TIMING (new)
  const isVorab = q.timing === 'pre'
  const timCell = r.getCell(8)
  timCell.value = isVorab ? 'Vorab' : 'Vor Ort'
  timCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: isVorab ? C.timingPre : C.timingOnsite } }
  timCell.font  = { bold: true, name: 'Arial', size: 9, color: { argb: isVorab ? 'FF1E40AF' : 'FF92400E' } }
  timCell.alignment = { horizontal: 'center', vertical: 'top' }
  timCell.border = {
    top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
  }

  // I — YOUR_ANSWER (was H)
  inputCell(r.getCell(9), q.answer || '')
  r.getCell(9).alignment = { horizontal: 'center', vertical: 'top' }
  r.getCell(9).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ['"Yes,No,NA"'],
    showErrorMessage: true,
    error: 'Please select Yes, No or NA.',
  }

  // J — IS_DEVIATION formula (was I, references now use col I for answer)
  const ansRef  = `I${rowNum}`
  const expRef  = `D${rowNum}`
  const devFormula =
    `=IF(${ansRef}="",FALSE,` +
    `IF(${expRef}="Yes",OR(${ansRef}="No",${ansRef}="NA"),` +
    `IF(${expRef}="Yes/NA",${ansRef}="No",` +
    `IF(${expRef}="No",OR(${ansRef}="Yes",${ansRef}="NA"),FALSE))))`
  r.getCell(10).value = { formula: devFormula }
  r.getCell(10).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lockedGrey } }
  r.getCell(10).font  = { name: 'Arial', size: 9, italic: true }
  r.getCell(10).alignment = { horizontal: 'center', vertical: 'top' }

  // K–N — Placeholder input cells (was J–M)
  ;[11, 12, 13, 14].forEach(col => inputCell(r.getCell(col), ''))

  // O — Notes (was N)
  inputCell(r.getCell(15), q.comment || '')
})

// Conditional formatting on col I (YOUR_ANSWER)
const answerColRange = `I3:I${2 + allQuestions.length}`

// Green: no deviation
wsQ.addConditionalFormatting({
  ref: answerColRange,
  rules: [{
    type: 'expression',
    formulae: [`AND(I3<>"",J3=FALSE)`],
    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.green } } },
    priority: 1,
  }],
})
// Red: deviation
wsQ.addConditionalFormatting({
  ref: answerColRange,
  rules: [{
    type: 'expression',
    formulae: [`J3=TRUE`],
    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.red } } },
    priority: 2,
  }],
})
// Amber: not yet answered
wsQ.addConditionalFormatting({
  ref: answerColRange,
  rules: [{
    type: 'expression',
    formulae: [`I3=""`],
    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.amber } } },
    priority: 3,
  }],
})

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 3 — Issue_Log
// ══════════════════════════════════════════════════════════════════════════════
const wsIssue = wb.addWorksheet('Issue_Log')
wsIssue.columns = [
  { width: 9 }, { width: 14 }, { width: 12 }, { width: 22 },
  { width: 16 }, { width: 12 }, { width: 32 }, { width: 32 }, { width: 14 },
]
const issHdrs = ['Issue No.', 'Subject ID', 'Category', 'Summary', 'Created By', 'Status', 'Issue Description', 'Action Description', 'Action Due Date']
wsIssue.mergeCells('A1:I1')
hdr(wsIssue.getCell('A1'), 'Issue Log', { size: 12 })
wsIssue.getRow(1).height = 24
const issHdrRow = wsIssue.getRow(2)
issHdrs.forEach((h, i) => hdr(issHdrRow.getCell(i + 1), h))
for (let i = 3; i <= 18; i++) {
  const r = wsIssue.getRow(i)
  r.height = 36
  issHdrs.forEach((_, j) => inputCell(r.getCell(j + 1), ''))
  r.getCell(3).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ['"Critical,Major,Minor"'],
  }
}
wsIssue.addConditionalFormatting({
  ref: 'C3:C18',
  rules: [
    { type: 'containsText', operator: 'containsText', text: 'Critical', style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.red } } }, priority: 1 },
    { type: 'containsText', operator: 'containsText', text: 'Major',    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.amber } } }, priority: 2 },
    { type: 'containsText', operator: 'containsText', text: 'Minor',    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFFFF3CD' } } }, priority: 3 },
  ],
})

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 4 — Observation_Log
// ══════════════════════════════════════════════════════════════════════════════
const wsObs = wb.addWorksheet('Observation_Log')
const obsHdrs = ['Obs No.', 'Priority', 'Date Identified', 'Summary', 'Description', 'Created By', 'Status', 'Actions Description', 'Actions Due Date', 'Updates', 'Actual Completion Date']
wsObs.columns = obsHdrs.map((_, i) => ({ width: [9,12,16,22,32,16,12,32,16,22,18][i] || 14 }))
wsObs.mergeCells(`A1:K1`)
hdr(wsObs.getCell('A1'), 'Observation Log', { size: 12 })
wsObs.getRow(1).height = 24
const obsHdrRow = wsObs.getRow(2)
obsHdrs.forEach((h, i) => hdr(obsHdrRow.getCell(i + 1), h))
for (let i = 3; i <= 18; i++) {
  const r = wsObs.getRow(i)
  r.height = 36
  obsHdrs.forEach((_, j) => inputCell(r.getCell(j + 1), ''))
  r.getCell(2).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ['"High,Medium,Low"'],
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 5 — Follow_Up_Items
// ══════════════════════════════════════════════════════════════════════════════
const wsFU = wb.addWorksheet('Follow_Up_Items')
const fuHdrs = ['Action Item', 'Responsible Party', 'Status', 'Date Identified', 'Date Resolved', 'Comments']
wsFU.columns = [{ width: 40 }, { width: 22 }, { width: 14 }, { width: 16 }, { width: 16 }, { width: 40 }]
wsFU.mergeCells('A1:F1')
hdr(wsFU.getCell('A1'), 'Follow Up Items', { size: 12 })
wsFU.getRow(1).height = 24
const fuHdrRow = wsFU.getRow(2)
fuHdrs.forEach((h, i) => hdr(fuHdrRow.getCell(i + 1), h))
for (let i = 3; i <= 22; i++) {
  const r = wsFU.getRow(i)
  r.height = 30
  fuHdrs.forEach((_, j) => inputCell(r.getCell(j + 1), ''))
  r.getCell(3).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ['"Open,Closed,In Progress"'],
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 6 — Report_Comments (formula-driven)
// References Questions_Input columns: I=answer, J=isdev, O=notes, K-N=placeholders
// ══════════════════════════════════════════════════════════════════════════════
const wsRC = wb.addWorksheet('Report_Comments')
wsRC.columns = [
  { width: 8 }, { width: 9 }, { width: 18 }, { width: 70 },
]

wsRC.mergeCells('A1:D1')
hdr(wsRC.getCell('A1'), 'Report Comments — Auto-generated from Questions_Input (do not edit this sheet directly)', { size: 11 })
wsRC.getRow(1).height = 24

const rcHdrs = ['Section', 'Q ID', 'Section Title', 'Generated Comment']
const rcHdrRow = wsRC.getRow(2)
rcHdrs.forEach((h, i) => hdr(rcHdrRow.getCell(i + 1), h))
wsRC.views = [{ state: 'frozen', ySplit: 2 }]

allQuestions.forEach((q, idx) => {
  const rowNum = idx + 3
  const qRow   = idx + 3
  const r = wsRC.getRow(rowNum)
  r.height = 50

  // Updated column references (shifted by +1 due to new TIMING col H)
  const ansRef   = `Questions_Input!I${qRow}`   // YOUR_ANSWER (col I)
  const devRef   = `Questions_Input!J${qRow}`   // IS_DEVIATION (col J)
  const notesRef = `Questions_Input!O${qRow}`   // Notes (col O)
  const p1Ref    = `Questions_Input!K${qRow}`   // Placeholder Date 1 (col K)
  const p2Ref    = `Questions_Input!L${qRow}`   // Placeholder Date 2 (col L)
  const p3Ref    = `Questions_Input!M${qRow}`   // Placeholder Name (col M)
  const p4Ref    = `Questions_Input!N${qRow}`   // Placeholder Version/Ref (col N)

  const asExp = q.comment
    ? q.comment.replace(/"/g, '""').substring(0, 200)
    : '[As expected — add comment]'

  const devMsg = `Please clarify — deviation from expected answer. Add details in Notes column.`

  const commentFormula =
    `=IF(${ansRef}="","— not yet answered —",` +
    `IF(${devRef}=FALSE,` +
      `"${asExp}"&IF(${notesRef}<>""," | Note: "&${notesRef},""),` +
      `"[DEVIATION] Expected: "&Questions_Input!D${qRow}&" | Actual: "&${ansRef}&" — ${devMsg}"&IF(${notesRef}<>""," | Details: "&${notesRef},"")` +
    `))`

  lockedCell(r.getCell(1), q.sectionId)
  r.getCell(1).alignment = { horizontal: 'center', vertical: 'top' }
  lockedCell(r.getCell(2), q.id)
  r.getCell(2).alignment = { horizontal: 'center', vertical: 'top' }
  lockedCell(r.getCell(3), q.sectionTitle)

  r.getCell(4).value = { formula: commentFormula }
  r.getCell(4).font  = { name: 'Arial', size: 10 }
  r.getCell(4).alignment = { vertical: 'top', wrapText: true }
  r.getCell(4).border = {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  }
})

// Highlight deviation rows amber — references updated col J
wsRC.addConditionalFormatting({
  ref: `A3:D${2 + allQuestions.length}`,
  rules: [{
    type: 'expression',
    formulae: [`Questions_Input!J3=TRUE`],
    style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: C.amber } } },
    priority: 1,
  }],
})

// ── Save ─────────────────────────────────────────────────────────────────────
const outPath = resolve(__dirname, 'SIV_Overview.xlsx')
await wb.xlsx.writeFile(outPath)
console.log(`Excel written → ${outPath}`)
