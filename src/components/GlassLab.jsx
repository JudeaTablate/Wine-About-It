import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

// three.js (~500 KB) is split out and only fetched when this section nears the viewport.
const WineGlass = lazy(() => import("./WineGlass"));

export default function GlassLab() {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fill, setFill] = useState(48);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const stage = useRef(null);

  useEffect(() => {
    const el = stage.current;
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    const b = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    a.observe(el); b.observe(el);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  const noop = () => {};
  const onKeyDown = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); setFill((v) => Math.min(92, v + 6)); }
    if (e.key === "ArrowDown") { e.preventDefault(); setFill((v) => Math.max(8, v - 6)); }
  };
  const label = fill < 35 ? "Light pour" : fill < 65 ? "Dinner pour" : "Generous pour";

  return (
    <section className="section alt glass-lab" id="glass-lab" aria-labelledby="lab-title">
      <div className="wrap lab-grid">
        <div className="reveal">
          <p className="eyebrow">THE GLASS LAB</p>
          <h2 id="lab-title">Don't just look at the glass. <em>Play with it.</em></h2>
          <p className="lede">A real-time 3D wine glass built with WebGL. Drag to turn it. Use the slider to pour (or focus the glass and use the arrow keys). Page scrolling is never hijacked.</p>
          <div className="lab-controls">
            <label htmlFor="fill">Wine level: <b>{label}</b></label>
            <input id="fill" type="range" min="8" max="92" value={Math.round(fill)} onChange={(e) => setFill(+e.target.value)} />
            <div className="lab-btns">
              <button className="btn btn-ghost small" onClick={() => setRotation((r) => ({ ...r, y: r.y - 30 }))}><Icon name="left" size={16} /> Turn</button>
              <button className="btn btn-ghost small" onClick={() => setRotation((r) => ({ ...r, y: r.y + 30 }))}>Turn <Icon name="right" size={16} /></button>
              <button className="btn btn-ghost small" onClick={() => { setRotation({ x: 0, y: 0 }); setFill(48); }}><Icon name="refresh" size={16} /> Reset</button>
            </div>
          </div>
          <dl className="anatomy">
            <div><dt>Bowl</dt><dd>Collects aroma</dd></div>
            <div><dt>Stem</dt><dd>Keeps warmth from your hand away</dd></div>
            <div><dt>Base</dt><dd>Keeps it stable</dd></div>
          </dl>
        </div>
        <div className="lab-stage reveal" ref={stage} onKeyDown={onKeyDown}>
          {near && visible ? (
            <Suspense fallback={<p className="lab-loading" role="status">Pouring…</p>}>
              <WineGlass fill={fill} rotation={rotation} setRotation={setRotation} onWheel={noop} />
            </Suspense>
          ) : (
            <p className="lab-loading" role="status">{near ? "Paused while off-screen" : "Loading 3D glass…"}</p>
          )}
        </div>
      </div>
    </section>
  );
}
