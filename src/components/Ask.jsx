import { Icon, SectionHead } from "./ui";

const FEATURES = [
  ["Real conversation", "Follow-up questions work. Sommy remembers what you said and what you're eating."],
  ["Live streaming", "Answers appear word by word instead of after a long wait."],
  ["Label reader", "Snap a bottle label and ask what it means (uses a vision-capable model)."],
  ["Voice in, voice out", "Speak your question, or have a reply read aloud. Great for hands-free dinner prep."],
  ["Honest by design", "If it isn't sure about a vintage or producer, it says so rather than guessing."],
  ["Free and private", "No account. Your chat stays in your browser and can be cleared anytime."],
];
const TRY = ["I like Pinot Noir. What should I try next?", "What's the difference between Prosecco and Champagne?", "Plan a 3-bottle tasting night for beginners", "Why does red wine make my mouth feel dry?"];

export default function Ask({ onAsk, openChat }) {
  return (
    <section className="section ask" id="ask" aria-labelledby="ask-title">
      <div className="wrap">
        <SectionHead id="ask-title" eyebrow="WINE ABOUT THE INTELLIGENCE" title={<>Chat with <em>Sommy.</em></>}>
          A conversational AI sommelier that lives on every page. Open it from anywhere with the button in the corner.
        </SectionHead>
        <div className="ask-grid">
          <ul className="feature-list reveal">
            {FEATURES.map(([t, d]) => (
              <li key={t}><span className="tick"><Icon name="check" size={16} /></span><div><h3>{t}</h3><p>{d}</p></div></li>
            ))}
          </ul>
          <div className="ask-demo reveal" aria-label="Try a conversation starter">
            <div className="demo-bar"><span className="avatar" aria-hidden="true">S</span><b>Try a conversation</b></div>
            <div className="demo-msgs" aria-hidden="true">
              <div className="msg bot"><div className="bubble">Hi! Tell me what you're eating or what you usually drink and I'll point you to a bottle.</div></div>
            </div>
            <ul className="starters">
              {TRY.map((t) => <li key={t}><button onClick={() => onAsk(t)}>{t}<Icon name="arrow" size={16} /></button></li>)}
            </ul>
            <button className="btn btn-primary wide" onClick={() => openChat()}><Icon name="spark" size={18} /> Open the chat</button>
          </div>
        </div>
      </div>
    </section>
  );
}
