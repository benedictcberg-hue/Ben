import React, { useState, useEffect } from 'react';
import {
  Brain, Activity, Zap, CheckCircle2, Shield, Users,
  Layers, Lightbulb, ArrowLeft, ArrowRight, Smile, Heart,
  AlertTriangle, Cpu, Sparkles, Eye, Ear, Hand, Clock,
  Fingerprint, ChevronRight, RefreshCw, Mic, Moon, Music,
  Medal, Timer, Star, Compass, Map, Sun, Cloud, Waves,
  Mountain, Flame, Coffee, BookOpen, Feather, Crown, Leaf
} from 'lucide-react';

// ==========================================
// NARRATIVE DATA
// ==========================================

const CHAPTERS = [
  {
    id: 'heart', num: 1,
    title: "Das Tal der Emotionen",
    subtitle: "Limbisches System",
    intro: "Du betrittst ein nebelverhangenes Tal. Die Luft ist warm und feucht, durchzogen vom Duft vergessener Erinnerungen. Hier wohnen deine tiefsten Gefühle – Freude und Trauer, Angst und Liebe, alle verwoben in einem uralten Tanz.",
    gradient: 'from-rose-600 via-pink-700 to-rose-950',
    icon: Heart, color: 'rose',
    reflection: "Was hat dich in diesem Tal am meisten überrascht?",
    insight: "Das Limbische System ist älter als Sprache. Es spricht in Bildern und Gefühlen."
  },
  {
    id: 'mind', num: 2,
    title: "Die Festung der Gedanken",
    subtitle: "Frontallappen",
    intro: "Hoch über den Wolken erhebt sich eine kristalline Zitadelle. Ihre Türme glitzern im Licht der Vernunft. Hier werden Pläne geschmiedet, Impulse gezähmt und die Zukunft geformt.",
    gradient: 'from-blue-600 via-cyan-700 to-blue-950',
    icon: Brain, color: 'blue',
    reflection: "Welchen Aspekt deines Denkens möchtest du stärken?",
    insight: "Der präfrontale Kortex ist erst mit 25 vollständig entwickelt – das Organ der Weisheit."
  },
  {
    id: 'memory', num: 3,
    title: "Die Bibliothek der Echos",
    subtitle: "Temporallappen",
    intro: "Endlose Regale erstrecken sich in alle Richtungen. Hier flüstern Stimmen aus der Vergangenheit, und jedes Wort hinterlässt einen unsichtbaren Abdruck in den Hallen deiner Erinnerung.",
    gradient: 'from-violet-600 via-purple-700 to-indigo-950',
    icon: BookOpen, color: 'violet',
    reflection: "Welche Erinnerung begleitet dich am stärksten durch dein Leben?",
    insight: "Ohne den Temporallappen wären wir jeden Moment neu geboren."
  },
  {
    id: 'senses', num: 4,
    title: "Der Garten der Sinne",
    subtitle: "Parietallappen",
    intro: "Ein üppiger Garten, in dem jede Blume einen anderen Sinneseindruck trägt. Hier verschmelzen Sehen, Hören und Fühlen zu einer einzigen Symphonie der Wahrnehmung.",
    gradient: 'from-emerald-600 via-teal-700 to-emerald-950',
    icon: Eye, color: 'emerald',
    reflection: "Welcher deiner Sinne fühlt sich am lebendigsten an?",
    insight: "Der Parietallappen erschafft unser räumliches Selbst – er definiert, wo wir enden und die Welt beginnt."
  },
  {
    id: 'vitality', num: 5,
    title: "Der Brunnen der Lebenskraft",
    subtitle: "Vital-Zentrum",
    intro: "Am Ende der Reise liegt ein stiller Ort. Hier pulsiert das Leben selbst – der Rhythmus von Schlaf und Wachen, von Anspannung und Erholung, von Sein und Werden.",
    gradient: 'from-amber-600 via-orange-700 to-amber-950',
    icon: Sun, color: 'amber',
    reflection: "Was nimmst du mit von dieser Reise?",
    insight: "Wohlbefinden ist keine Konstante, sondern ein Tanz – die Kunst liegt im bewussten Mitbewegen."
  }
];

// Deep Scenarios with narrative context
const SCENARIOS = {
  heart: [
    {
      setting: "Es ist 23 Uhr. Morgen steht eine wichtige Präsentation an. Plötzlich fällt der Strom aus.",
      pause: "Spüre einen Moment in diese Situation hinein…",
      question: "Was passiert in deinem Inneren?",
      options: [
        { text: "Panik steigt auf. Mein Herz rast.", value: 1, insight: "Der Flucht-Impuls – urmenschlich und kraftvoll." },
        { text: "Ärger. Ich suche nach einem Schuldigen.", value: 2, insight: "Externalisierung – ein Schutzmechanismus." },
        { text: "Ich atme durch. Was kann ich noch kontrollieren?", value: 4, insight: "Dein präfrontaler Kortex übernimmt – das Zentrum der Ruhe." },
        { text: "Resignation. Es ist eh egal.", value: 2, insight: "Manchmal ist Loslassen weise, manchmal Vermeidung." }
      ]
    },
    {
      setting: "Jemand, der dir wichtig ist, sagt: 'Du hast mich enttäuscht.'",
      pause: "Lass diese Worte einen Moment wirken…",
      question: "Welcher Gedanke kommt zuerst?",
      options: [
        { text: "Was habe ich falsch gemacht?", value: 2, insight: "Selbstkritik kann konstruktiv sein – aber zu viel lähmt." },
        { text: "Das stimmt nicht! Ich wehre mich innerlich.", value: 2, insight: "Das Ego schützt sich – natürlich, aber wachstumshemmend." },
        { text: "Erzähl mir mehr. Ich will verstehen.", value: 4, insight: "Neugier in schwierigen Momenten – ein Zeichen emotionaler Reife." },
        { text: "Ich fühle nichts. Ich schalte ab.", value: 1, insight: "Emotionale Taubheit hat ihren Preis." }
      ]
    },
    {
      setting: "Du beobachtest, wie jemand ungerecht behandelt wird. Die anderen schweigen.",
      pause: "Spüre den Moment zwischen Sehen und Handeln…",
      question: "Was tust du?",
      options: [
        { text: "Ich sage etwas, auch wenn es riskant ist.", value: 4, insight: "Mut ist nicht die Abwesenheit von Angst." },
        { text: "Ich schweige auch. Es fühlt sich schrecklich an.", value: 2, insight: "Das Gewissen spricht – hörst du zu?" },
        { text: "Ich lenke ab – indirekt eingreifen.", value: 3, insight: "Diplomatie ist Kunst, manchmal braucht es Direktheit." },
        { text: "Es geht mich nichts an.", value: 1, insight: "Manchmal klug, manchmal eine Ausrede." }
      ]
    }
  ]
};

// Spectrum questions with depth
const SPECTRUMS = {
  heart: [
    { dim: "Energie", left: "Stille nährt mich", right: "Menschen laden mich auf", leftIcon: Moon, rightIcon: Users },
    { dim: "Ausdruck", left: "Ich beobachte und denke", right: "Ich spreche und forme", leftIcon: Eye, rightIcon: Mic },
    { dim: "Vertrauen", left: "Vertrauen muss wachsen", right: "Ich vertraue schnell", leftIcon: Shield, rightIcon: Heart },
    { dim: "Nähe", left: "Wenige tiefe Bindungen", right: "Viele Verbindungen", leftIcon: Compass, rightIcon: Users }
  ]
};

// Structure questions
const STRUCTURE_QS = [
  { statement: "Mein äußerer Raum spiegelt meinen inneren Zustand.", poles: ["Nicht bei mir", "Absolut"] },
  { statement: "Ein Tag ohne Plan fühlt sich an wie ein Schiff ohne Ruder.", poles: ["Gar nicht", "Sehr stark"] },
  { statement: "Unangenehme Aufgaben erledige ich sofort.", poles: ["Nie", "Immer"] },
  { statement: "Details sind wichtiger als das große Ganze.", poles: ["Überhaupt nicht", "Vollkommen"] },
  { statement: "Ich halte mein Wort, auch wenn es Opfer kostet.", poles: ["Selten", "Immer"] }
];

// Impulse questions
const IMPULSE_QS = [
  { q: "Unterbrichst du andere oft?", yes: "Ja, oft", no: "Selten" },
  { q: "Kaufst du ungeplante Dinge?", yes: "Regelmäßig", no: "Kaum" },
  { q: "Fällt dir Warten schwer?", yes: "Eine Qual", no: "Kein Problem" },
  { q: "Bewegst du dich unbewusst?", yes: "Ständig", no: "Kaum" },
  { q: "Handelst du erst, denkst dann?", yes: "Oft genug", no: "Ich überlege erst" }
];

// Verbal questions
const VERBAL_QS = [
  { statement: "Worte fließen mühelos aus mir.", icon: Feather },
  { statement: "Ich erinnere mich wortwörtlich an Gespräche.", icon: BookOpen },
  { statement: "Beim Lesen höre ich eine innere Stimme.", icon: Mic },
  { statement: "Sprachen fallen mir leichter als Zahlen.", icon: Compass },
  { statement: "Komplexe Sätze verwirren mich nicht.", icon: Layers }
];

// Perception pairs
const PERCEPTION_PAIRS = [
  { dim: "Information", left: { l: "Konkret", d: "Fakten & Daten", icon: Layers }, right: { l: "Abstrakt", d: "Muster & Theorien", icon: Sparkles } },
  { dim: "Arbeitsweise", left: { l: "Methodisch", d: "Schritt für Schritt", icon: Layers }, right: { l: "Intuitiv", d: "Nach Gefühl", icon: Zap } },
  { dim: "Fokus", left: { l: "Gegenwart", d: "Was ist", icon: Eye }, right: { l: "Zukunft", d: "Was sein könnte", icon: Star } },
  { dim: "Entscheidung", left: { l: "Logik", d: "Objektiv & analytisch", icon: Cpu }, right: { l: "Werte", d: "Empathisch & harmonisch", icon: Heart } }
];

// Sensory dimensions
const SENSES = [
  { id: 'vis', name: 'Visuell', icon: Eye, examples: ['Grelles Licht', 'Unordnung', 'Blinkende Bildschirme'] },
  { id: 'aud', name: 'Auditiv', icon: Ear, examples: ['Hintergrundgespräche', 'Kauen', 'Tickende Uhren'] },
  { id: 'tac', name: 'Taktil', icon: Hand, examples: ['Etiketten in Kleidung', 'Kratzige Stoffe', 'Temperaturen'] }
];

// Mood dimensions
const MOODS = [
  { id: 'energy', label: 'Energie', left: 'Erschöpft', right: 'Energiegeladen', icon: Zap },
  { id: 'mood', label: 'Stimmung', left: 'Gedrückt', right: 'Gehoben', icon: Smile },
  { id: 'calm', label: 'Ruhe', left: 'Unruhig', right: 'Gelassen', icon: Waves },
  { id: 'clarity', label: 'Klarheit', left: 'Neblig', right: 'Kristallklar', icon: Sparkles }
];

// Life domains
const DOMAINS = [
  { id: 'health', label: 'Gesundheit', icon: Heart, color: 'rose' },
  { id: 'career', label: 'Karriere', icon: Star, color: 'blue' },
  { id: 'love', label: 'Beziehungen', icon: Users, color: 'pink' },
  { id: 'growth', label: 'Wachstum', icon: Leaf, color: 'emerald' },
  { id: 'joy', label: 'Freude', icon: Sun, color: 'amber' }
];

// Chronotypes
const CHRONOTYPES = [
  { id: 'lark', label: 'Lerche', time: '5-7 Uhr', icon: Sun },
  { id: 'morning', label: 'Vormittag', time: '8-11 Uhr', icon: Coffee },
  { id: 'afternoon', label: 'Nachmittag', time: '14-17 Uhr', icon: Cloud },
  { id: 'owl', label: 'Eule', time: '20+ Uhr', icon: Moon }
];

// ==========================================
// STROOP GAME COMPONENT
// ==========================================

const StroopGame = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [current, setCurrent] = useState({ text: 'ROT', color: 'text-red-500', val: 'red' });
  const [streak, setStreak] = useState(0);

  const colors = [
    { name: 'ROT', cls: 'text-red-500', val: 'red', bg: 'bg-red-500' },
    { name: 'BLAU', cls: 'text-blue-500', val: 'blue', bg: 'bg-blue-500' },
    { name: 'GRÜN', cls: 'text-emerald-500', val: 'green', bg: 'bg-emerald-500' },
    { name: 'GELB', cls: 'text-yellow-400', val: 'yellow', bg: 'bg-yellow-400' }
  ];

  const nextRound = () => {
    const word = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setCurrent({ text: word.name, color: color.cls, val: color.val });
  };

  useEffect(() => {
    if (phase === 'play') {
      nextRound();
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setPhase('done'); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const handleClick = (val) => {
    if (val === current.val) {
      setScore(s => s + 10 + streak);
      setStreak(s => Math.min(s + 2, 10));
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
    }
    nextRound();
  };

  if (phase === 'intro') return (
    <div className="text-center p-8 max-w-md mx-auto space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <Activity size={40} className="text-white"/>
      </div>
      <h3 className="text-2xl font-bold text-white">Die Nebelkammer</h3>
      <p className="text-slate-400">Drücke den Button der <span className="text-cyan-400 font-bold">SCHRIFTFARBE</span> – nicht des Wortes!</p>
      <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
        <span className="text-3xl font-black text-blue-500">ROT</span>
        <p className="text-xs text-slate-500 mt-4">↑ Richtig wäre: BLAU</p>
      </div>
      <button onClick={() => setPhase('play')} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg">
        STARTEN
      </button>
    </div>
  );

  if (phase === 'done') return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="text-6xl font-black text-white mb-2">{score}</div>
      <div className="text-slate-500 mb-8">PUNKTE</div>
      <p className="text-slate-400 mb-8">
        {score > 150 ? "Exzellente kognitive Kontrolle!" : score > 80 ? "Gute Leistung!" : "Der Stroop-Effekt ist mächtig – das ist normal."}
      </p>
      <button onClick={() => onComplete(score)} className="px-8 py-3 bg-slate-800 border border-cyan-500 text-cyan-400 rounded-lg font-bold">
        WEITER
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto text-center py-6">
      <div className="flex justify-between items-center mb-8 px-4">
        <span className="text-slate-400">Punkte: <span className="text-white font-bold">{score}</span></span>
        {streak > 0 && <span className="text-amber-400 flex items-center gap-1"><Flame size={14}/> x{streak/2}</span>}
        <span className="text-rose-400 flex items-center gap-2 bg-rose-950/50 px-3 py-1 rounded-full">
          <Timer size={14}/>{timeLeft}s
        </span>
      </div>
      <div className="h-40 flex items-center justify-center mb-8 bg-slate-900/50 rounded-3xl border border-slate-800">
        <span className={`text-6xl font-black ${current.color}`}>{current.text}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {colors.map(c => (
          <button key={c.val} onClick={() => handleClick(c.val)}
            className={`${c.bg} h-20 rounded-2xl text-black font-bold text-lg active:scale-95 transition-transform`}>
            {c.val.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// ECHO GAME COMPONENT
// ==========================================

const EchoGame = ({ onComplete }) => {
  const [seq, setSeq] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(null);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);

  const pads = [
    { id: 0, color: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    { id: 1, color: 'bg-gradient-to-br from-rose-400 to-rose-600' },
    { id: 2, color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: 3, color: 'bg-gradient-to-br from-amber-400 to-amber-600' }
  ];

  const playSeq = (s) => {
    setPlaying(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= s.length) { clearInterval(interval); setPlaying(false); setActive(null); return; }
      setActive(s[i]);
      setTimeout(() => setActive(null), 400);
      i++;
    }, 700);
  };

  const start = () => {
    setStarted(true);
    const newSeq = [Math.floor(Math.random() * 4)];
    setSeq(newSeq);
    setRound(1);
    setUserStep(0);
    setTimeout(() => playSeq(newSeq), 500);
  };

  const handlePad = (id) => {
    if (playing) return;
    setActive(id);
    setTimeout(() => setActive(null), 200);

    if (id === seq[userStep]) {
      if (userStep === seq.length - 1) {
        setTimeout(() => {
          const next = [...seq, Math.floor(Math.random() * 4)];
          setSeq(next);
          setRound(r => r + 1);
          setUserStep(0);
          playSeq(next);
        }, 800);
      } else {
        setUserStep(s => s + 1);
      }
    } else {
      onComplete(round);
    }
  };

  if (!started) return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-6">
        <Music size={40} className="text-white"/>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Der Klangsaal</h3>
      <p className="text-slate-400 mb-8">Merke dir die Sequenz und wiederhole sie exakt.</p>
      <button onClick={start} className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-bold text-lg">
        BEGINNEN
      </button>
    </div>
  );

  return (
    <div className="max-w-xs mx-auto py-8">
      <div className="text-center mb-8">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Sequenz</div>
        <div className="text-4xl font-black text-white">{round}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {pads.map(p => (
          <button key={p.id} onClick={() => handlePad(p.id)} disabled={playing}
            className={`h-28 rounded-2xl transition-all ${active === p.id ? `${p.color} scale-95 shadow-2xl` : 'bg-slate-800/80 border-2 border-slate-700'}`}/>
        ))}
      </div>
      <div className="text-center text-sm">
        {playing ? <span className="text-violet-400 animate-pulse">Lausche…</span> : <span className="text-slate-400">Dein Zug</span>}
      </div>
    </div>
  );
};

// ==========================================
// N-BACK GAME COMPONENT
// ==========================================

const NBackGame = ({ onComplete }) => {
  const [phase, setPhase] = useState('intro');
  const [seq, setSeq] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const N = 2, LEN = 12;
  const ITEMS = ['A', 'B', 'C', 'D', 'X'];

  const start = () => {
    const s = [];
    for (let i = 0; i < LEN; i++) {
      if (i >= N && Math.random() > 0.65) s.push(s[i - N]);
      else s.push(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    }
    setSeq(s);
    setPhase('play');
    setIdx(0);
    setScore(0);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    const timer = setTimeout(() => {
      if (idx >= LEN - 1) setPhase('done');
      else { setIdx(i => i + 1); setFeedback(null); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [idx, phase]);

  const handleMatch = () => {
    if (idx < N) return;
    const isMatch = seq[idx] === seq[idx - N];
    if (isMatch) { setScore(s => s + 1); setFeedback('correct'); }
    else setFeedback('wrong');
  };

  if (phase === 'intro') return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mb-6">
        <Cpu size={40} className="text-white"/>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Die Zeitschleife</h3>
      <p className="text-slate-400 mb-8">Drücke MATCH, wenn der Buchstabe = dem vorletzten ist.</p>
      <button onClick={start} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold text-lg">
        STARTEN
      </button>
    </div>
  );

  if (phase === 'done') {
    const total = seq.filter((s, i) => i >= N && s === seq[i - N]).length;
    return (
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="text-5xl font-black text-white mb-2">{score}/{total}</div>
        <div className="text-slate-500 mb-8">TREFFER</div>
        <button onClick={() => onComplete(score)} className="px-8 py-3 bg-slate-800 border border-indigo-500 text-indigo-400 rounded-lg font-bold">
          WEITER
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-10 max-w-md mx-auto">
      <div className="flex justify-between text-xs text-slate-500 mb-8 px-4">
        <span>TREFFER: {score}</span>
        <span>{idx + 1}/{LEN}</span>
      </div>
      <div className={`text-8xl font-black mb-12 transition-all ${feedback === 'correct' ? 'text-emerald-400 scale-110' : feedback === 'wrong' ? 'text-rose-400' : 'text-white'}`}>
        {seq[idx]}
      </div>
      <button onClick={handleMatch} disabled={idx < N || feedback}
        className="w-full max-w-xs mx-auto py-6 bg-slate-800/80 border-2 border-slate-600 rounded-2xl hover:border-indigo-500 disabled:opacity-50">
        <span className="text-2xl font-bold text-white">MATCH</span>
      </button>
    </div>
  );
};

// ==========================================
// TRAIL GAME COMPONENT
// ==========================================

const TrailGame = ({ onComplete }) => {
  const [nodes, setNodes] = useState([]);
  const [next, setNext] = useState(1);
  const [startTime, setStartTime] = useState(0);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);

  const start = () => {
    const pos = [
      {x: 12, y: 15}, {x: 45, y: 12}, {x: 78, y: 18}, {x: 25, y: 42}, {x: 58, y: 48},
      {x: 85, y: 38}, {x: 15, y: 72}, {x: 42, y: 78}, {x: 75, y: 70}
    ].sort(() => Math.random() - 0.5);
    setNodes(pos.map((p, i) => ({ id: i + 1, ...p, status: 'pending' })));
    setNext(1);
    setStartTime(Date.now());
  };

  const handleClick = (n) => {
    if (n.id === next) {
      setNodes(ns => ns.map(x => x.id === n.id ? { ...x, status: 'done' } : x));
      if (next === nodes.length) {
        setTime((Date.now() - startTime) / 1000);
        setDone(true);
      } else setNext(x => x + 1);
    }
  };

  if (!startTime) return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-6">
        <Map size={40} className="text-white"/>
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Der Pfadfinder</h3>
      <p className="text-slate-400 mb-8">Verbinde 1 bis 9 in Reihenfolge – so schnell du kannst.</p>
      <button onClick={start} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-lg">
        LOS GEHT'S
      </button>
    </div>
  );

  if (done) return (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="text-5xl font-black text-white mb-2">{time.toFixed(1)}s</div>
      <div className="text-slate-500 mb-8">ZEIT</div>
      <button onClick={() => onComplete(time)} className="px-8 py-3 bg-slate-800 border border-emerald-500 text-emerald-400 rounded-lg font-bold">
        WEITER
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="text-xs text-slate-500 mb-4 text-center">NÄCHSTE: {next}</div>
      <div className="relative h-80 bg-slate-900/50 rounded-2xl border border-slate-800">
        {nodes.map(n => (
          <button key={n.id} onClick={() => handleClick(n)}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg -translate-x-1/2 -translate-y-1/2 transition-all ${ n.status === 'done' ? 'bg-emerald-500 text-white scale-90 opacity-50' : n.id === next ? 'bg-slate-700 text-white border-2 border-emerald-400 hover:scale-110' : 'bg-slate-800 text-slate-300 border border-slate-700' }`}>
            {n.id}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MODULE VIEWS
// ==========================================

const ScenarioView = ({ scenarios, onAnswer, onComplete }) => {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('setting');
  const [selected, setSelected] = useState(null);
  const current = scenarios[step];

  const handleSelect = (opt, i) => {
    setSelected(i);
    onAnswer(step, opt.value);
    setPhase('insight');
  };

  const nextStep = () => {
    if (step < scenarios.length - 1) {
      setStep(s => s + 1);
      setPhase('setting');
      setSelected(null);
    } else onComplete();
  };

  if (!current) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-8 justify-center">
        {scenarios.map((_, i) => <div key={i} className={`h-1 w-12 rounded-full ${i <= step ? 'bg-rose-500' : 'bg-slate-800'}`}/>)}
      </div>

      {phase === 'setting' && (
        <div className="text-center space-y-8 animate-in fade-in">
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
            <p className="text-xl text-slate-200 leading-relaxed">{current.setting}</p>
          </div>
          <p className="text-slate-500 italic">{current.pause}</p>
          <button onClick={() => setPhase('question')} className="px-8 py-3 bg-rose-600 rounded-full font-bold">Weiter</button>
        </div>
      )}

      {phase === 'question' && (
        <div className="space-y-6 animate-in slide-in-from-right">
          <h3 className="text-2xl font-bold text-white text-center mb-8">{current.question}</h3>
          <div className="space-y-4">
            {current.options.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(opt, i)}
                className="w-full text-left p-6 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-rose-500 transition-all">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center shrink-0">
                    <span className="text-sm text-slate-500">{i + 1}</span>
                  </div>
                  <span className="text-slate-300">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'insight' && selected !== null && (
        <div className="text-center space-y-8 animate-in fade-in">
          <div className="bg-rose-950/30 rounded-2xl p-8 border border-rose-500/30">
            <Lightbulb className="mx-auto text-rose-400 mb-4" size={32}/>
            <p className="text-lg text-rose-200">{current.options[selected].insight}</p>
          </div>
          <button onClick={nextStep} className="px-8 py-3 bg-slate-800 border border-slate-600 rounded-full font-bold">
            {step < scenarios.length - 1 ? 'Nächstes Szenario' : 'Abschließen'}
          </button>
        </div>
      )}
    </div>
  );
};

const SpectrumView = ({ spectrums, onAnswer, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const current = spectrums[idx];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex gap-2 justify-center">
        {spectrums.map((_, i) => <div key={i} className={`h-1 w-12 rounded-full ${i <= idx ? 'bg-rose-500' : 'bg-slate-800'}`}/>)}
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
        <div className="text-center mb-8">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">{current.dim}</div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="flex-1 text-right">
            <current.leftIcon className="inline-block text-cyan-400 mb-2" size={24}/>
            <p className="text-sm font-bold text-cyan-300">{current.left}</p>
          </div>
          <div className="flex-1">
            <input type="range" min="0" max="100" defaultValue="50"
              onChange={(e) => onAnswer(idx, parseInt(e.target.value))}
              className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-rose-500"/>
          </div>
          <div className="flex-1 text-left">
            <current.rightIcon className="inline-block text-rose-400 mb-2" size={24}/>
            <p className="text-sm font-bold text-rose-300">{current.right}</p>
          </div>
        </div>

        <div className="flex justify-between">
          {idx > 0 && <button onClick={() => setIdx(i => i - 1)} className="text-slate-500 hover:text-white"><ArrowLeft className="inline mr-2" size={16}/>Zurück</button>}
          <button onClick={() => idx < spectrums.length - 1 ? setIdx(i => i + 1) : onComplete()}
            className="ml-auto px-6 py-2 bg-rose-600 rounded-full font-bold">
            {idx < spectrums.length - 1 ? <>Weiter<ArrowRight className="inline ml-2" size={16}/></> : <><CheckCircle2 className="inline mr-2" size={16}/>Fertig</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const LikertView = ({ questions, moduleId, onAnswer, answers, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {questions.map((q, i) => (
        <div key={i} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <p className="text-lg text-white mb-2">{q.statement}</p>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => onAnswer(i, v)}
                className={`h-12 rounded-lg font-bold transition-all ${answers[`${moduleId}_${i}`] === v ? 'bg-blue-600 text-white scale-105' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2">
            <span>{q.poles[0]}</span>
            <span>{q.poles[1]}</span>
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-blue-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Abschließen
        </button>
      </div>
    </div>
  );
};

const RapidView = ({ questions, onAnswer, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const current = questions[idx];

  const handle = (val) => {
    onAnswer(idx, val);
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else onComplete();
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="h-1 w-full bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all" style={{ width: `${(idx / questions.length) * 100}%` }}/>
      </div>
      <div key={idx} className="animate-in slide-in-from-right">
        <h3 className="text-2xl font-bold text-white mb-12">{current.q}</h3>
        <div className="grid grid-cols-2 gap-6">
          <button onClick={() => handle(0)} className="py-8 bg-slate-800/80 border-2 border-slate-700 rounded-2xl hover:border-slate-500 active:scale-95">
            <span className="text-xl font-bold text-slate-300">{current.no}</span>
          </button>
          <button onClick={() => handle(4)} className="py-8 bg-rose-600/80 border-2 border-rose-500 rounded-2xl hover:bg-rose-500 active:scale-95">
            <span className="text-xl font-bold text-white">{current.yes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const VerbalView = ({ questions, moduleId, onAnswer, answers, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {questions.map((q, i) => (
        <div key={i} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-violet-900/50 flex items-center justify-center shrink-0">
              <q.icon size={20} className="text-violet-400"/>
            </div>
            <p className="text-lg text-white font-medium">{q.statement}</p>
          </div>
          <div className="grid grid-cols-5 gap-2 ml-14">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => onAnswer(i, v)}
                className={`h-10 rounded-lg font-bold ${answers[`${moduleId}_${i}`] === v ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-violet-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Abschließen
        </button>
      </div>
    </div>
  );
};

const PerceptionView = ({ pairs, onAnswer, answers, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const current = pairs[idx];

  const handleSelect = (side) => {
    onAnswer(idx, side === 'left' ? 0 : 100);
    if (idx < pairs.length - 1) setTimeout(() => setIdx(i => i + 1), 300);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 mb-8 justify-center">
        {pairs.map((_, i) => <div key={i} className={`h-1 w-16 rounded-full ${i <= idx ? 'bg-emerald-500' : 'bg-slate-800'}`}/>)}
      </div>

      <div key={idx} className="animate-in fade-in">
        <div className="text-center mb-8">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">{current.dim}</div>
          <p className="text-lg text-slate-400">Welche Seite beschreibt dich besser?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => handleSelect('left')}
            className={`p-8 rounded-2xl border-2 transition-all text-left ${answers[`perception_${idx}`] === 0 ? 'bg-cyan-900/30 border-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}>
            <current.left.icon className="text-cyan-400 mb-4" size={32}/>
            <h4 className="text-xl font-bold text-white mb-2">{current.left.l}</h4>
            <p className="text-slate-400">{current.left.d}</p>
          </button>
          <button onClick={() => handleSelect('right')}
            className={`p-8 rounded-2xl border-2 transition-all text-left ${answers[`perception_${idx}`] === 100 ? 'bg-emerald-900/30 border-emerald-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}>
            <current.right.icon className="text-emerald-400 mb-4" size={32}/>
            <h4 className="text-xl font-bold text-white mb-2">{current.right.l}</h4>
            <p className="text-slate-400">{current.right.d}</p>
          </button>
        </div>

        {idx === pairs.length - 1 && answers[`perception_${idx}`] !== undefined && (
          <div className="flex justify-center mt-8">
            <button onClick={onComplete} className="px-8 py-3 bg-emerald-600 rounded-full font-bold">
              <CheckCircle2 className="inline mr-2" size={16}/>Abschließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SensoryView = ({ senses, onAnswer, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {senses.map((s, i) => (
        <div key={s.id} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <s.icon className="text-white" size={24}/>
            </div>
            <div>
              <h4 className="font-bold text-white">{s.name}</h4>
              <p className="text-sm text-slate-500">Wie empfindlich bist du?</p>
            </div>
          </div>
          <input type="range" min="0" max="100" defaultValue="50" onChange={(e) => onAnswer(i, parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-500 mb-4"/>
          <div className="flex flex-wrap gap-2">
            {s.examples.map((ex, j) => <span key={j} className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">{ex}</span>)}
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-emerald-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Abschließen
        </button>
      </div>
    </div>
  );
};

const MoodView = ({ moods, onAnswer, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <p className="text-lg text-slate-400">Wie fühlst du dich gerade – in diesem Moment?</p>
      </div>
      {moods.map((m, i) => (
        <div key={m.id} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <m.icon className="text-amber-400" size={20}/>
            <span className="font-bold text-white">{m.label}</span>
          </div>
          <input type="range" min="0" max="100" defaultValue="50" onChange={(e) => onAnswer(i, parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"/>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{m.left}</span>
            <span>{m.right}</span>
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-amber-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Weiter
        </button>
      </div>
    </div>
  );
};

const RhythmView = ({ chronotypes, onAnswer, onComplete }) => {
  const [sleep, setSleep] = useState(7);
  const [type, setType] = useState(null);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Moon className="text-indigo-400" size={24}/>
            <div>
              <h4 className="font-bold text-white">Schlafdauer</h4>
              <p className="text-sm text-slate-500">Durchschnittlich pro Nacht</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-400">{sleep}h</span>
        </div>
        <input type="range" min="4" max="12" step="0.5" value={sleep}
          onChange={(e) => { setSleep(parseFloat(e.target.value)); onAnswer('sleep', parseFloat(e.target.value)); }}
          className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"/>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Sun className="text-amber-400" size={24}/>
          <h4 className="font-bold text-white">Wann bist du am fittesten?</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chronotypes.map((c, i) => (
            <button key={c.id} onClick={() => { setType(i); onAnswer('type', i); }}
              className={`p-4 rounded-xl border-2 transition-all ${type === i ? 'bg-amber-900/30 border-amber-500' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
              <c.icon className={`mx-auto mb-2 ${type === i ? 'text-amber-400' : 'text-slate-500'}`} size={24}/>
              <div className="font-bold text-white text-sm">{c.label}</div>
              <div className="text-xs text-slate-500">{c.time}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-amber-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Weiter
        </button>
      </div>
    </div>
  );
};

const WheelView = ({ domains, onAnswer, answers, onComplete }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <p className="text-lg text-slate-400">Bewerte deine Zufriedenheit (1-10) in jedem Bereich.</p>
      </div>
      {domains.map((d, i) => (
        <div key={d.id} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-${d.color}-900/50 flex items-center justify-center shrink-0`}>
            <d.icon className={`text-${d.color}-400`} size={20}/>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white">{d.label}</span>
              <span className={`text-lg font-bold text-${d.color}-400`}>{answers[`wheel_${i}`] || 5}</span>
            </div>
            <input type="range" min="1" max="10" defaultValue="5" onChange={(e) => onAnswer(i, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"/>
          </div>
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <button onClick={onComplete} className="px-8 py-3 bg-amber-600 rounded-full font-bold">
          <CheckCircle2 className="inline mr-2" size={16}/>Abschließen
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [phase, setPhase] = useState('intro'); // intro, chapter_intro, module, chapter_end, final
  const [chapterIdx, setChapterIdx] = useState(0);
  const [moduleIdx, setModuleIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reflections, setReflections] = useState({});

  const chapter = CHAPTERS[chapterIdx];

  // Module definitions per chapter
  const MODULES = {
    heart: [
      { id: 'scenario', title: 'Der Prüfungspfad', desc: 'Wie begegnest du Stürmen?', icon: Shield, type: 'scenario' },
      { id: 'spectrum', title: 'Das Soziale Spektrum', desc: 'Dein Platz unter Menschen', icon: Users, type: 'spectrum' }
    ],
    mind: [
      { id: 'structure', title: 'Die Archive der Ordnung', desc: 'Wie strukturierst du dein Reich?', icon: Layers, type: 'likert' },
      { id: 'impulse', title: 'Der Blitzpfad', desc: 'Deine spontane Natur', icon: Zap, type: 'rapid' },
      { id: 'stroop', title: 'Die Nebelkammer', desc: 'Klarheit im Chaos', icon: Activity, type: 'stroop' }
    ],
    memory: [
      { id: 'echo', title: 'Der Klangsaal', desc: 'Auditives Gedächtnis', icon: Music, type: 'echo' },
      { id: 'verbal', title: 'Der Wortweber', desc: 'Deine Sprachbeziehung', icon: Mic, type: 'verbal' },
      { id: 'nback', title: 'Die Zeitschleife', desc: 'Arbeitsgedächtnis', icon: Cpu, type: 'nback' }
    ],
    senses: [
      { id: 'perception', title: 'Die Wahrnehmungsweiche', desc: 'Wie siehst du die Welt?', icon: Fingerprint, type: 'perception' },
      { id: 'sensory', title: 'Der Sinnesgarten', desc: 'Deine Empfindlichkeit', icon: Hand, type: 'sensory' },
      { id: 'trail', title: 'Der Pfadfinder', desc: 'Visuelle Aufmerksamkeit', icon: Map, type: 'trail' }
    ],
    vitality: [
      { id: 'mood', title: 'Das Stimmungsbarometer', desc: 'Deine innere Wetterlage', icon: Cloud, type: 'mood' },
      { id: 'rhythm', title: 'Der Zeitenkreis', desc: 'Dein natürlicher Rhythmus', icon: Moon, type: 'rhythm' },
      { id: 'wheel', title: 'Das Lebensrad', desc: 'Balance der Welten', icon: Compass, type: 'wheel' }
    ]
  };

  const modules = MODULES[chapter?.id] || [];
  const currentModule = modules[moduleIdx];

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [`${chapter.id}_${currentModule?.id}_${key}`]: value }));
  };

  const completeModule = () => {
    if (moduleIdx < modules.length - 1) {
      setModuleIdx(i => i + 1);
    } else {
      setPhase('chapter_end');
    }
  };

  const completeChapter = (reflection) => {
    setReflections(prev => ({ ...prev, [chapter.id]: reflection }));
    if (chapterIdx < CHAPTERS.length - 1) {
      setChapterIdx(i => i + 1);
      setModuleIdx(0);
      setPhase('chapter_intro');
    } else {
      setPhase('final');
    }
  };

  const restart = () => {
    setPhase('intro');
    setChapterIdx(0);
    setModuleIdx(0);
    setAnswers({});
    setReflections({});
  };

  // ==========================================
  // RENDER PHASES
  // ==========================================

  // INTRO
  if (phase === 'intro') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-rose-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl animate-pulse">
          <Brain size={48} className="text-white"/>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white">Die Reise nach Innen</h1>
        <p className="text-xl text-slate-400">Eine Expedition durch die Landschaften deines Geistes</p>
        <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 text-left">
          <p className="text-slate-300 leading-relaxed">
            Willkommen, Reisender. Du stehst am Beginn einer besonderen Expedition – nicht durch ferne Länder,
            sondern durch die unendlichen Weiten deines eigenen Bewusstseins.
            <br/><br/>
            In den nächsten Momenten wirst du fünf einzigartige Territorien erkunden. Jedes hat seine eigene
            Landschaft, seine eigenen Geheimnisse und seine eigenen Fragen an dich.
            <br/><br/>
            <span className="text-slate-500 italic">Es gibt keine richtigen oder falschen Antworten. Es gibt nur deine Wahrheit.</span>
          </p>
        </div>
        <button onClick={() => setPhase('chapter_intro')}
          className="group px-12 py-5 bg-gradient-to-r from-rose-600 via-violet-600 to-cyan-600 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all">
          DIE REISE BEGINNEN
          <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform"/>
        </button>
      </div>
    </div>
  );

  // CHAPTER INTRO
  if (phase === 'chapter_intro') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-sm font-mono text-slate-500 uppercase tracking-[0.3em]">
          Kapitel {chapter.num} von {CHAPTERS.length}
        </div>
        <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${chapter.gradient} flex items-center justify-center shadow-2xl`}>
          <chapter.icon size={56} className="text-white"/>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{chapter.title}</h1>
          <p className="text-lg text-slate-400">{chapter.subtitle}</p>
        </div>
        <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800">
          <p className="text-slate-300 leading-relaxed text-lg italic">"{chapter.intro}"</p>
        </div>
        <div className="flex justify-center gap-4">
          {modules.map((m, i) => (
            <div key={i} className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
              <m.icon size={20} className="text-slate-500"/>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('module')}
          className={`group px-10 py-4 bg-gradient-to-r ${chapter.gradient} rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all`}>
          BETRETEN
          <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform"/>
        </button>
      </div>
    </div>
  );

  // MODULE
  if (phase === 'module' && currentModule) {
    const ModuleHeader = () => (
      <div className="text-center mb-12">
        <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800 mb-6 shadow-xl">
          <currentModule.icon size={32} className={`text-${chapter.color}-500`}/>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{currentModule.title}</h2>
        <p className="text-slate-400">{currentModule.desc}</p>
        <div className="flex justify-center gap-2 mt-6">
          {modules.map((_, i) => <div key={i} className={`h-1 w-8 rounded-full ${i <= moduleIdx ? `bg-${chapter.color}-500` : 'bg-slate-800'}`}/>)}
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => moduleIdx > 0 ? setModuleIdx(i => i - 1) : setPhase('chapter_intro')}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16}/> Zurück
          </button>

          <ModuleHeader/>

          {/* Render appropriate module view */}
          {currentModule.type === 'scenario' && (
            <ScenarioView scenarios={SCENARIOS.heart} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'spectrum' && (
            <SpectrumView spectrums={SPECTRUMS.heart} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'likert' && (
            <LikertView questions={STRUCTURE_QS} moduleId={currentModule.id} answers={answers} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'rapid' && (
            <RapidView questions={IMPULSE_QS} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'stroop' && <StroopGame onComplete={completeModule}/>}
          {currentModule.type === 'echo' && <EchoGame onComplete={completeModule}/>}
          {currentModule.type === 'verbal' && (
            <VerbalView questions={VERBAL_QS} moduleId={currentModule.id} answers={answers} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'nback' && <NBackGame onComplete={completeModule}/>}
          {currentModule.type === 'perception' && (
            <PerceptionView pairs={PERCEPTION_PAIRS} answers={answers} onAnswer={(i, v) => handleAnswer(`perception_${i}`, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'sensory' && (
            <SensoryView senses={SENSES} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'trail' && <TrailGame onComplete={completeModule}/>}
          {currentModule.type === 'mood' && (
            <MoodView moods={MOODS} onAnswer={(i, v) => handleAnswer(i, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'rhythm' && (
            <RhythmView chronotypes={CHRONOTYPES} onAnswer={(k, v) => handleAnswer(k, v)} onComplete={completeModule}/>
          )}
          {currentModule.type === 'wheel' && (
            <WheelView domains={DOMAINS} answers={answers} onAnswer={(i, v) => handleAnswer(`wheel_${i}`, v)} onComplete={completeModule}/>
          )}
        </div>
      </div>
    );
  }

  // CHAPTER END / REFLECTION
  if (phase === 'chapter_end') {
    const [reflection, setReflection] = useState('');
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-700">
          <div className="text-center">
            <div className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">Zwischenreflexion</div>
            <h2 className="text-2xl font-bold text-white">Kapitel {chapter.num} abgeschlossen</h2>
          </div>
          <div className={`bg-gradient-to-br ${chapter.gradient} p-[1px] rounded-2xl`}>
            <div className="bg-slate-950 rounded-2xl p-8">
              <p className="text-lg text-slate-300 mb-6">{chapter.reflection}</p>
              <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
                placeholder="Deine Gedanken… (optional)"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 resize-none h-32 focus:outline-none focus:border-slate-500"/>
            </div>
          </div>
          <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800 flex gap-4">
            <Lightbulb className={`text-${chapter.color}-400 shrink-0 mt-1`} size={20}/>
            <p className="text-sm text-slate-400 italic">{chapter.insight}</p>
          </div>
          <div className="flex justify-center">
            <button onClick={() => completeChapter(reflection)}
              className="px-10 py-4 bg-slate-800 border border-slate-600 hover:border-slate-500 rounded-full font-bold transition-all hover:bg-slate-700">
              {chapterIdx < CHAPTERS.length - 1 ? 'WEITER ZUR NÄCHSTEN STATION' : 'ZUM ABSCHLUSS'}
              <ArrowRight className="inline-block ml-2" size={18}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FINAL REPORT
  if (phase === 'final') return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl mb-6">
            <Crown className="text-white" size={40}/>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Reise Abgeschlossen</h1>
          <p className="text-slate-400">Du hast alle fünf Territorien durchquert</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {CHAPTERS.map(ch => (
            <div key={ch.id} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 text-center">
              <ch.icon className={`mx-auto text-${ch.color}-400 mb-3`} size={28}/>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{ch.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="text-amber-400"/>
            Was du entdeckt hast
          </h3>
          <div className="space-y-4 text-slate-300">
            <p>
              Du hast fünf einzigartige Territorien deines Geistes durchquert. Jeder Bereich erzählt
              eine Geschichte über dich – nicht als Urteil, sondern als Einladung zur Reflexion.
            </p>
            <p>
              Diese Momentaufnahme ist genau das: ein Moment. Dein Gehirn ist plastisch, formbar,
              ständig im Wandel. Was heute so ist, kann morgen anders sein.
            </p>
            <p className="text-slate-500 italic">
              "Die größte Entdeckung meiner Generation ist, dass ein Mensch sein Leben verändern kann,
              indem er seine Geisteshaltung ändert." — William James
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={restart}
            className="px-8 py-4 bg-slate-800 border border-slate-600 rounded-full font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
            <RefreshCw size={18}/> Neue Reise beginnen
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}
