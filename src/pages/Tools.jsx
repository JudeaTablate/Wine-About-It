import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, PageHead, SectionHead, Segmented } from "../components/ui";
import { servingGroups, allWinesFull, servingGroupOf, wineByName } from "../data";

export default function Tools(props) {
  return (
    <div className="wrap">
      <PageHead title="Handy tools for real evenings">
        Three calculators for the questions that come up just before people arrive. They give good estimates, not lab results.
      </PageHead>
      <nav className="tool-nav" aria-label="Tools on this page">
        <a href="#/tools/party"><Icon name="users" /> Party planner</a>
        <a href="#/tools/chill"><Icon name="thermo" /> Chill timer</a>
        <a href="#/tools/leftovers"><Icon name="drop" /> Leftover guide</a>
      </nav>
      <Party />
      <Chill {...props} />
      <Leftovers onAsk={props.onAsk} />
    </div>
  );
}

/* Party planner ---------------------------------------------------------------- */
const PACE = { easy: 0.5, steady: 0.75, lively: 1 };
const STYLES = [["red", "Red", "#5a1029"], ["white", "White", "#e0c768"], ["rose", "Rosé", "#ee9f94"], ["sparkling", "Sparkling", "#ece0a0"]];

function Num({ id, label, value, set, min, max, unit }) {
  return (
    <div className="num">
      <label htmlFor={id}>{label}</label>
      <div className="num-row">
        <button type="button" className="icon-btn bordered" onClick={() => set(Math.max(min, value - 1))} aria-label={`Fewer ${unit}`}><Icon name="minus" /></button>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(e) => set(Math.max(min, Math.min(max, +e.target.value || min)))} />
        <button type="button" className="icon-btn bordered" onClick={() => set(Math.min(max, value + 1))} aria-label={`More ${unit}`}><Icon name="plus" /></button>
      </div>
    </div>
  );
}

function Party() {
  const [guests, setGuests] = useState(10);
  const [drinkers, setDrinkers] = useState(8);
  const [hours, setHours] = useState(3);
  const [pace, setPace] = useState("steady");
  const [mix, setMix] = useState({ red: 50, white: 30, rose: 0, sparkling: 20 });
  const [toast, setToast] = useState(false);
  const d = Math.min(drinkers, guests);

  const r = useMemo(() => {
    const glasses = d * (1 + Math.max(0, hours - 1) * PACE[pace]);
    const total = Object.values(mix).reduce((a, b) => a + b, 0) || 1;
    const per = {};
    STYLES.forEach(([k]) => { per[k] = (glasses * mix[k]) / total; });
    if (toast) per.sparkling += guests * 0.5;
    const bottles = Object.fromEntries(Object.entries(per).map(([k, g]) => [k, g > 0 ? Math.ceil(g / 5) : 0]));
    const all = Object.values(bottles).reduce((a, b) => a + b, 0);
    return { glasses: Math.round(glasses + (toast ? guests * 0.5 : 0)), bottles, all, water: Math.ceil(guests * hours * 0.3) };
  }, [d, guests, hours, pace, mix, toast]);

  return (
    <section className="tool" id="party" aria-labelledby="party-h">
      <SectionHead id="party-h" title="How much wine for a party?">A standard bottle pours five glasses. Most people have about one glass in the first hour, then slow down.</SectionHead>
      <div className="tool-grid">
        <form className="tool-in" onSubmit={(e) => e.preventDefault()}>
          <Num id="guests" label="Guests" value={guests} set={setGuests} min={1} max={200} unit="guests" />
          <Num id="drinkers" label="Guests drinking wine" value={d} set={setDrinkers} min={0} max={guests} unit="wine drinkers" />
          <Num id="hours" label="Hours" value={hours} set={setHours} min={1} max={12} unit="hours" />
          <Segmented legend="Pace" name="pace" value={pace} onChange={setPace} options={[["easy", "Easy dinner"], ["steady", "Steady"], ["lively", "Celebration"]]} />
          <fieldset className="mix">
            <legend>The mix</legend>
            {STYLES.map(([k, l, c]) => (
              <div key={k} className="mix-row" style={{ "--c": c }}>
                <label htmlFor={`mix-${k}`}><span className="dot" aria-hidden="true" />{l}</label>
                <input id={`mix-${k}`} type="range" min="0" max="100" step="10" value={mix[k]} onChange={(e) => setMix({ ...mix, [k]: +e.target.value })} aria-valuetext={`${mix[k]} parts`} />
              </div>
            ))}
          </fieldset>
          <label className="check"><input type="checkbox" checked={toast} onChange={(e) => setToast(e.target.checked)} /> Everyone gets a small glass of bubbles for a toast</label>
        </form>

        <div className="tool-out" aria-live="polite">
          <p className="big-number"><span>{r.all}</span> {r.all === 1 ? "bottle" : "bottles"}</p>
          <p>About {r.glasses} glasses for {d} wine {d === 1 ? "drinker" : "drinkers"} over {hours} {hours === 1 ? "hour" : "hours"}.</p>
          <ul className="bottles">
            {STYLES.filter(([k]) => r.bottles[k] > 0).map(([k, l, c]) => (
              <li key={k}>
                <span className="bottle-row" aria-hidden="true" style={{ "--c": c }}>{Array.from({ length: Math.min(r.bottles[k], 24) }, (_, i) => <i key={i} />)}{r.bottles[k] > 24 && <b>+{r.bottles[k] - 24}</b>}</span>
                <span>{r.bottles[k]} {l.toLowerCase()}</span>
              </li>
            ))}
          </ul>
          <dl className="kv">
            <div><dt>Glasses to have ready</dt><dd>{guests + Math.ceil(guests / 5)}, a few spares for refills and drops</dd></div>
            <div><dt>Water</dt><dd>At least {r.water} litres, plus a pitcher on every table</dd></div>
            <div><dt>Ice</dt><dd>{Math.max(2, Math.ceil(r.all / 4))} bags if you're chilling in tubs</dd></div>
          </dl>
          <p className="fine">Buy one extra bottle of the most popular style. Unopened bottles keep, and nobody likes running out. Have good non-alcoholic options for drivers and non-drinkers.</p>
        </div>
      </div>
    </section>
  );
}

/* Chill timer ------------------------------------------------------------------- */
const METHODS = [
  ["fridge", "Fridge", 4, 110],
  ["bucket", "Ice bucket with water and salt", -1, 14],
  ["freezer", "Freezer", -18, 75],
];
const minutes = (t0, target, ta, tau) => (t0 <= target ? 0 : Math.max(1, Math.round((tau * Math.log((t0 - ta) / (target - ta))) / 5) * 5));
const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim() : `${m} min`);

function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => { const o = a.createOscillator(); const g = a.createGain(); o.frequency.value = 660; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.15, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.3); o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.3); });
  } catch { /* audio blocked */ }
}

function Chill() {
  const [mode, setMode] = useState("style");
  const [group, setGroup] = useState("lightWhite");
  const [wine, setWine] = useState("Sauvignon Blanc");
  const [room, setRoom] = useState(30);
  const [timer, setTimer] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [doneMsg, setDoneMsg] = useState("");
  const tick = useRef(null);
  const g = servingGroups[mode === "style" ? group : servingGroupOf(wineByName[wine])];
  const target = (g.target[0] + g.target[1]) / 2;
  const times = METHODS.map(([id, label, ta, tau]) => ({ id, label, m: minutes(room, target, ta, tau) }));

  useEffect(() => {
    if (!timer || timer.paused) return;
    tick.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick.current);
  }, [timer]);

  const left = timer ? (timer.paused ? timer.left : Math.max(0, timer.end - now)) : 0;
  useEffect(() => {
    if (timer && !timer.paused && left <= 0) {
      setTimer(null); beep(); navigator.vibrate?.([200, 100, 200]);
      setDoneMsg(`Time's up. Your ${timer.what} should be ready to pour.`);
      document.title = "Ready to pour | Wine About It";
    } else if (timer && !timer.paused) {
      const s = Math.ceil(left / 1000);
      document.title = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} chilling | Wine About It`;
    }
  }, [left, timer]);
  useEffect(() => () => { document.title = "Handy tools | Wine About It"; }, []);

  const start = (m, label) => { setDoneMsg(""); setNow(Date.now()); setTimer({ end: Date.now() + m * 60000, total: m * 60000, what: `${(mode === "style" ? g.label : wine).toLowerCase()} in the ${label.split(" ")[0].toLowerCase()}`, paused: false }); };
  const secs = Math.ceil(left / 1000);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <section className="tool" id="chill" aria-labelledby="chill-h">
      <SectionHead id="chill-h" title="How long to chill it?">Room temperature here is often 30 °C, which is too warm even for red wine. Tell us what you're chilling and we'll estimate the time.</SectionHead>
      <div className="tool-grid">
        <form className="tool-in" onSubmit={(e) => e.preventDefault()}>
          <Segmented legend="Choose by" name="chillmode" value={mode} onChange={setMode} options={[["style", "Style"], ["wine", "Specific wine"]]} />
          {mode === "style" ? (
            <label className="select big">Style
              <select value={group} onChange={(e) => setGroup(e.target.value)}>{Object.entries(servingGroups).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </label>
          ) : (
            <label className="select big">Wine
              <select value={wine} onChange={(e) => setWine(e.target.value)}>{allWinesFull.map((w) => <option key={w.name}>{w.name}</option>)}</select>
            </label>
          )}
          <div className="setting">
            <label htmlFor="room">Bottle is at <output htmlFor="room">{room} °C</output></label>
            <input id="room" type="range" min="18" max="36" value={room} onChange={(e) => setRoom(+e.target.value)} aria-valuetext={`${room} degrees Celsius`} />
          </div>
        </form>
        <div className="tool-out">
          <p className="thermo-line" style={{ "--c": g.color }}><span className="dot" aria-hidden="true" /> Serve {g.label.toLowerCase()} at <b>{g.target[0]}–{g.target[1]} °C</b></p>
          <ul className="methods">
            {times.map((t) => (
              <li key={t.id}>
                <span className="m-label">{t.label}</span>
                <span className="m-time">{t.m === 0 ? "Already cool enough" : fmt(t.m)}</span>
                {t.m > 0 && <button type="button" className="btn btn-ghost small" onClick={() => start(t.m, t.label)} disabled={!!timer}><Icon name="timer" size={16} /> Start timer</button>}
              </li>
            ))}
          </ul>
          {timer && (
            <div className="timer" role="timer" aria-label={`Chill timer for ${timer.what}`}>
              <span className="timer-ring" style={{ "--p": `${(1 - left / timer.total) * 100}%` }} aria-hidden="true" />
              <span className="timer-clock" aria-hidden="true">{clock}</span>
              <span className="sr-only">{Math.ceil(secs / 60)} minutes left</span>
              <div className="row-actions">
                <button type="button" className="btn btn-ghost small" onClick={() => setTimer(timer.paused ? { ...timer, paused: false, end: Date.now() + timer.left } : { ...timer, paused: true, left })}><Icon name={timer.paused ? "play" : "pause"} size={16} /> {timer.paused ? "Resume" : "Pause"}</button>
                <button type="button" className="btn btn-ghost small" onClick={() => { setTimer(null); document.title = "Handy tools | Wine About It"; }}>Cancel</button>
              </div>
            </div>
          )}
          <p role="status" className="done-msg">{doneMsg}</p>
          <p className="fine">The timer runs while this page is open. Never leave a bottle in the freezer without a timer: it can freeze and push the cork out or crack. Too cold? Wrap the glass in your hands for a minute.</p>
        </div>
      </div>
    </section>
  );
}

/* Leftovers ------------------------------------------------------------------ */
function Leftovers({ onAsk }) {
  return (
    <section className="tool" id="leftovers" aria-labelledby="left-h">
      <SectionHead id="left-h" title="How long does an open bottle last?">Oxygen slowly flattens the fruit. Put the cork back in and keep the bottle in the fridge, even red wine.</SectionHead>
      <table className="keeps">
        <caption className="sr-only">How long open wine keeps, by style</caption>
        <thead><tr><th scope="col">Style</th><th scope="col">Keeps for</th></tr></thead>
        <tbody>
          {Object.values(servingGroups).map((g) => (
            <tr key={g.label} style={{ "--c": g.color }}><th scope="row"><span className="dot" aria-hidden="true" />{g.label}</th><td>{g.keeps}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="dd two">
        <div>
          <h3>Signs it has turned</h3>
          <ul><li>Smells like vinegar, nail polish or bruised apple</li><li>White wine has gone deep yellow or brown</li><li>Red wine looks brick-brown and tastes flat</li></ul>
        </div>
        <div>
          <h3>Ways to use it up</h3>
          <ul><li>Splash white wine into a pan sauce or steamed mussels</li><li>Add red wine to a beef stew or bolognese</li><li>Mix with fruit and soda for an easy sangria</li></ul>
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={() => onAsk("I have half a bottle of wine left over. What can I cook with it tonight?")}><Icon name="spark" size={18} /> Ask Sommy for a recipe</button>
    </section>
  );
}
