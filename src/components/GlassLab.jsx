import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Icon, Segmented } from "./ui";

// three.js (~500 KB) is split out and only fetched when the lab nears the viewport.
const WineGlass = lazy(() => import("./WineGlass"));

const TINTS = { Red: "#74152e", White: "#e2c86a", "Rosé": "#ec8f86", Amber: "#c27a2c" };

export default function GlassLab() {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fill, setFill] = useState(40);
  const [tint, setTint] = useState("Red");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const stage = useRef(null);

  useEffect(() => {
    const el = stage.current;
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    const b = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    a.observe(el); b.observe(el);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); setFill((v) => Math.min(92, v + 6)); }
    if (e.key === "ArrowDown") { e.preventDefault(); setFill((v) => Math.max(8, v - 6)); }
  };
  const pour = fill < 30 ? "A tasting pour, about 60 ml" : fill < 55 ? "A standard pour, about 150 ml. Room to swirl." : fill < 75 ? "A generous pour, about 220 ml. Hard to swirl." : "Too full to swirl or smell properly";

  return (
    <div className="lab">
      <div className="lab-stage" ref={stage} onKeyDown={onKeyDown}>
        {near && visible ? (
          <Suspense fallback={<p className="lab-loading" role="status">Pouring the 3D glass</p>}>
            <WineGlass fill={fill} tint={TINTS[tint]} rotation={rotation} setRotation={setRotation} onWheel={() => {}} />
          </Suspense>
        ) : (
          <p className="lab-loading" role="status">{near ? "Paused while off-screen" : "The 3D glass loads when you get here"}</p>
        )}
      </div>
      <div className="lab-controls">
        <h3>Try it yourself</h3>
        <p>Drag the glass to turn it. Pour different amounts and see why a standard pour only fills about a third of the bowl.</p>
        <label htmlFor="fill" className="lab-label">How much to pour</label>
        <input id="fill" type="range" min="8" max="92" value={Math.round(fill)} onChange={(e) => setFill(+e.target.value)} aria-valuetext={pour} />
        <p className="lab-readout" aria-live="polite">{pour}</p>
        <Segmented legend="Wine color" name="tint" value={tint} onChange={setTint} options={Object.keys(TINTS).map((k) => [k, k])} />
        <div className="lab-btns">
          <button type="button" className="btn btn-ghost small" onClick={() => setRotation((r) => ({ ...r, y: r.y - 30 }))}><Icon name="left" size={16} /> Turn left</button>
          <button type="button" className="btn btn-ghost small" onClick={() => setRotation((r) => ({ ...r, y: r.y + 30 }))}>Turn right <Icon name="right" size={16} /></button>
          <button type="button" className="btn btn-ghost small" onClick={() => { setRotation({ x: 0, y: 0 }); setFill(40); setTint("Red"); }}><Icon name="refresh" size={16} /> Reset</button>
        </div>
        <p className="fine">Amber (or orange) wine is made from white grapes left on their skins, the way red wine is made.</p>
      </div>
    </div>
  );
}
