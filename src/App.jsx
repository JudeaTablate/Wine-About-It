import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

function RealWineGlass({ fill, rotation, setRotation, onWheel }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const targetFillRef = useRef(fill);
  const dragRef = useRef({ active:false, x:0, y:0, rx:0, ry:0 });

  useEffect(() => { targetFillRef.current = fill; }, [fill]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
    camera.position.set(0, 2.55, 11.8);
    camera.lookAt(0, 2.35, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    scene.add(new THREE.HemisphereLight(0xfffaf4, 0x5b3430, 2.1));

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.8);
    keyLight.position.set(4.5, 7.5, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const frontLight = new THREE.PointLight(0xffeee8, 1.9, 10);
    frontLight.position.set(-1.5, 3.3, 5.5);
    scene.add(frontLight);

    const edgeLight = new THREE.DirectionalLight(0xf6c2ca, 2.5);
    edgeLight.position.set(-5, 4, -3);
    scene.add(edgeLight);

    const glassGroup = new THREE.Group();
    glassGroup.rotation.order = "YXZ";
    scene.add(glassGroup);
    groupRef.current = glassGroup;

    // A classic Bordeaux/restaurant-style stemmed wine glass.
    // The profile is deliberately tall, rounded and narrow at the foot.
    const glassProfile = [
      [0.00, 1.67],
      [0.22, 1.68], [0.48, 1.72], [0.78, 1.84],
      [1.06, 2.02], [1.30, 2.28], [1.49, 2.59],
      [1.63, 2.94], [1.73, 3.31], [1.79, 3.67],
      [1.81, 3.95], [1.81, 4.05],
      [1.75, 4.05], [1.75, 3.95], [1.73, 3.67],
      [1.67, 3.33], [1.57, 3.00], [1.43, 2.68],
      [1.27, 2.39], [1.05, 2.15], [0.80, 1.99],
      [0.54, 1.88], [0.27, 1.82], [0.00, 1.81]
    ].map(([r,y]) => new THREE.Vector2(r,y));

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f8f6,
      transparent: true,
      opacity: 0.24,
      transmission: 0.32,
      thickness: 0.06,
      roughness: 0.025,
      ior: 1.46,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const bowlGeo = new THREE.LatheGeometry(glassProfile, 192);
    bowlGeo.computeVertexNormals();
    const bowl = new THREE.Mesh(bowlGeo, glassMat);
    bowl.renderOrder = 5;
    glassGroup.add(bowl);

    const rimMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.72,
      transmission: 0.2,
      thickness: 0.025,
      roughness: 0.02,
      ior: 1.46,
      side: THREE.DoubleSide
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.025, 20, 192), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 4.03;
    rim.renderOrder = 8;
    glassGroup.add(rim);

    // Stem: thin but visible, with a subtle transition into the bowl.
    const stemProfile = [
      [0.025, 0.34], [0.14, 0.36], [0.18, 0.39],
      [0.12, 0.44], [0.055, 0.54], [0.048, 1.48],
      [0.07, 1.60], [0.15, 1.70]
    ].map(([r,y]) => new THREE.Vector2(r,y));
    const stemGeo = new THREE.LatheGeometry(stemProfile, 128);
    const stem = new THREE.Mesh(stemGeo, glassMat);
    stem.renderOrder = 4;
    glassGroup.add(stem);

    // Broad, elegant foot/base.
    const footProfile = [
      [0.02, 0.24], [0.22, 0.24], [0.52, 0.25],
      [0.78, 0.28], [0.98, 0.33], [1.03, 0.37],
      [1.01, 0.405], [0.84, 0.44], [0.52, 0.47],
      [0.24, 0.46], [0.02, 0.42]
    ].map(([r,y]) => new THREE.Vector2(r,y));
    const footGeo = new THREE.LatheGeometry(footProfile, 160);
    const foot = new THREE.Mesh(footGeo, glassMat);
    foot.renderOrder = 4;
    glassGroup.add(foot);

    // Fine highlight strips sell the transparent material without turning it white.
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const highlight = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 2.55), highlightMat);
    highlight.position.set(-0.72, 2.82, 1.57);
    highlight.rotation.z = -0.035;
    highlight.renderOrder = 9;
    glassGroup.add(highlight);

    const highlight2 = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 1.5), new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.13,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    highlight2.position.set(0.70, 2.75, 1.56);
    highlight2.rotation.z = 0.04;
    highlight2.renderOrder = 9;
    glassGroup.add(highlight2);

    // ---------------- LIQUID ----------------
    const wineGroup = new THREE.Group();
    wineGroup.renderOrder = 2;
    glassGroup.add(wineGroup);

    const wineMat = new THREE.MeshPhysicalMaterial({
      color: 0x74152e,
      roughness: 0.09,
      metalness: 0.0,
      clearcoat: 0.82,
      clearcoatRoughness: 0.08,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide
    });

    const wineTopMat = new THREE.MeshPhysicalMaterial({
      color: 0x9c2442,
      roughness: 0.055,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
      side: THREE.DoubleSide
    });

    // Inner radius lookup matches the actual bowl, so the wine hugs the glass.
    const radiusAt = (y) => {
      const points = [
        [1.81, 0.18], [1.88, 0.52], [2.02, 0.80],
        [2.16, 1.03], [2.39, 1.25], [2.68, 1.43],
        [3.00, 1.57], [3.33, 1.67], [3.67, 1.73],
        [3.95, 1.75]
      ];
      if (y <= points[0][0]) return points[0][1];
      for (let i=0;i<points.length-1;i++) {
        const [y1,r1]=points[i], [y2,r2]=points[i+1];
        if (y >= y1 && y <= y2) {
          return THREE.MathUtils.lerp(r1,r2,(y-y1)/(y2-y1));
        }
      }
      return 1.75;
    };

    let currentFill = THREE.MathUtils.clamp(targetFillRef.current, 8, 92);
    let wineMesh = null;
    let surfaceMesh = null;
    let lastBuiltFill = -999;

    const buildWine = (pct) => {
      const minY = 1.83;
      const maxY = 3.67;
      const topY = THREE.MathUtils.lerp(minY + 0.02, maxY, pct / 100);

      const profile = [[0.0, minY]];
      const steps = 42;
      for (let i=0;i<=steps;i++) {
        const y = THREE.MathUtils.lerp(minY, topY, i/steps);
        const r = Math.max(0.035, radiusAt(y) - 0.055);
        profile.push([r,y]);
      }
      profile.push([0.0, topY]);

      const geo = new THREE.LatheGeometry(
        profile.map(([r,y]) => new THREE.Vector2(r,y)), 160
      );
      geo.computeVertexNormals();

      if (wineMesh) {
        wineGroup.remove(wineMesh);
        wineMesh.geometry.dispose();
      }
      wineMesh = new THREE.Mesh(geo, wineMat);
      wineMesh.renderOrder = 2;
      wineGroup.add(wineMesh);

      const surfaceRadius = Math.max(0.08, radiusAt(topY) - 0.07);
      const sGeo = new THREE.CircleGeometry(surfaceRadius, 160);
      if (surfaceMesh) {
        wineGroup.remove(surfaceMesh);
        surfaceMesh.geometry.dispose();
      }
      surfaceMesh = new THREE.Mesh(sGeo, wineTopMat);
      surfaceMesh.rotation.x = -Math.PI / 2;
      surfaceMesh.position.y = topY;
      surfaceMesh.renderOrder = 3;
      wineGroup.add(surfaceMesh);
      lastBuiltFill = pct;
      return topY;
    };

    let surfaceY = buildWine(currentFill);

    // Subtle concentric ripples at the liquid surface.
    const rippleGroup = new THREE.Group();
    glassGroup.add(rippleGroup);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xe16a7e, transparent: true, opacity: 0.22,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const ripple1 = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.20, 96), rippleMat);
    const ripple2 = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.37, 96), rippleMat.clone());
    ripple1.rotation.x = ripple2.rotation.x = -Math.PI/2;
    rippleGroup.add(ripple1, ripple2);

    // No bottle or pouring stream: the Glass Lab focuses on the glass and
    // a smooth, continuously moving wine volume.

    // Ground shadow.
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 96),
      new THREE.MeshBasicMaterial({color:0x51352f, transparent:true, opacity:0.14, depthWrite:false})
    );
    shadow.rotation.x = -Math.PI/2;
    shadow.scale.set(1.65,0.38,1);
    shadow.position.set(0,0.19,-0.15);
    scene.add(shadow);

    const resize = () => {
      const w = mount.clientWidth || 760;
      const h = mount.clientHeight || 690;
      renderer.setSize(w,h,false);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf;
    const animate = (t) => {
      raf = requestAnimationFrame(animate);
      const target = THREE.MathUtils.clamp(targetFillRef.current,8,92);
      currentFill += (target-currentFill)*0.045;

      if (Math.abs(currentFill-lastBuiltFill)>0.45) {
        surfaceY = buildWine(currentFill);
      }
      const seconds = t*0.001;
      // Liquid gently moves continuously — the level itself remains smooth.
      if (surfaceMesh) {
        surfaceMesh.position.x = Math.sin(seconds*1.6)*0.006;
        surfaceMesh.position.z = Math.cos(seconds*1.2)*0.004;
        surfaceMesh.rotation.z = Math.sin(seconds*0.7)*0.008;
      }
      if (wineMesh) {
        wineMesh.scale.x = 1 + Math.sin(seconds*1.7)*0.003;
        wineMesh.scale.z = 1 + Math.cos(seconds*1.45)*0.003;
      }

      ripple1.position.set(0.54, surfaceY+0.012, 0.08);
      ripple2.position.set(0.54, surfaceY+0.014, 0.08);
      const pulse = 1 + (Math.sin(seconds*4.2)*0.5+0.5)*0.34;
      ripple1.scale.setScalar(pulse);
      ripple2.scale.setScalar(0.78+pulse*0.12);
      ripple1.material.opacity = 0.13 + (Math.sin(seconds*4.2)*0.5+0.5)*0.12;
      ripple2.material.opacity = 0.08 + (Math.sin(seconds*3.1+1)*0.5+0.5)*0.09;

      // A tiny organic sway keeps the scene alive without making the glass spin itself.
      if (!dragRef.current.active) {
        glassGroup.rotation.y += 0.00028;
      }
      glassGroup.position.y = Math.sin(seconds*0.9)*0.014;

      renderer.render(scene,camera);
    };
    animate(0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      bowlGeo.dispose(); stemGeo.dispose(); footGeo.dispose(); rim.geometry.dispose();
      glassMat.dispose(); rimMat.dispose(); highlightMat.dispose(); highlight2.material.dispose();
      wineMat.dispose(); wineTopMat.dispose();
      if (wineMesh) wineMesh.geometry.dispose();
      if (surfaceMesh) surfaceMesh.geometry.dispose();
      ripple1.geometry.dispose(); ripple2.geometry.dispose(); rippleMat.dispose(); ripple2.material.dispose();
      shadow.geometry.dispose(); shadow.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode===mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.x = THREE.MathUtils.degToRad(rotation.x * 0.32);
    g.rotation.y = THREE.MathUtils.degToRad(rotation.y);
  }, [rotation]);

  const down = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active:true, x:e.clientX, y:e.clientY, rx:rotation.x, ry:rotation.y };
  };
  const move = (e) => {
    if (!dragRef.current.active) return;
    const dx=e.clientX-dragRef.current.x;
    const dy=e.clientY-dragRef.current.y;
    setRotation({
      x:Math.max(-22,Math.min(22,dragRef.current.rx-dy*0.16)),
      y:dragRef.current.ry+dx*0.24
    });
  };
  const up = () => { dragRef.current.active=false; };

  return (
    <div
      ref={mountRef}
      className="real-glass-canvas"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onWheel={onWheel}
      role="img"
      aria-label="Interactive 3D stemmed wine glass with visible red wine. Scroll to smoothly pour more or less wine and drag to rotate the glass."
    />
  );
}

const wines = {
  A: [
    { name:"Albariño", pronunciation:"al-bah-REE-nyoh", country:"Spain", style:"White", notes:"Lemon • Lime • Peach • Saline", body:"Light", description:"A bright, coastal Spanish white known for citrus, stone fruit and a fresh, slightly salty character.", pairings:"Seafood, oysters, ceviche, grilled prawns", locale:"es-ES" },
    { name:"Amarone", pronunciation:"am-ah-ROH-nay", country:"Italy", style:"Red", notes:"Dried cherry • Plum • Chocolate • Spice", body:"Full", description:"A powerful Valpolicella style made from partially dried grapes, creating concentrated fruit, warmth and a rich texture.", pairings:"Braised beef, aged cheese, mushroom dishes", locale:"it-IT" },
  ],
  B: [
    { name:"Barbera", pronunciation:"bar-BEH-rah", country:"Italy", style:"Red", notes:"Sour cherry • Blackberry • Herbs", body:"Medium", description:"A juicy northern Italian red with naturally high acidity and relatively low tannin.", pairings:"Pizza, tomato pasta, sausage, grilled vegetables", locale:"it-IT" },
    { name:"Beaujolais", pronunciation:"BOH-zhoh-LAY", country:"France", style:"Red", notes:"Strawberry • Raspberry • Violet", body:"Light", description:"A fresh, fruit-forward French red from Gamay, ranging from easy-drinking to more structured Cru styles.", pairings:"Charcuterie, roast chicken, burgers, soft cheese", locale:"fr-FR" },
  ],
  C: [
    { name:"Cabernet Sauvignon", pronunciation:"cab-er-NAY soh-vee-NYON", country:"France / Global", style:"Red", notes:"Blackcurrant • Cedar • Mint • Dark plum", body:"Full", description:"One of the world's best-known red grapes, prized for structure, dark fruit, tannin and aging potential.", pairings:"Steak, lamb, roast beef, hard cheese", locale:"fr-FR" },
    { name:"Chardonnay", pronunciation:"shar-doh-NAY", country:"France / Global", style:"White", notes:"Apple • Lemon • Butter • Vanilla", body:"Medium–Full", description:"A versatile white grape that can be lean and citrusy or rich and creamy depending on climate and winemaking.", pairings:"Roast chicken, creamy pasta, lobster, soft cheese", locale:"fr-FR" },
  ],
  D: [
    { name:"Dolcetto", pronunciation:"dole-CHET-toh", country:"Italy", style:"Red", notes:"Black cherry • Plum • Almond", body:"Medium", description:"A Piedmontese red with juicy fruit, moderate acidity and a characteristic bitter-almond finish.", pairings:"Pizza, antipasti, pasta with mushrooms", locale:"it-IT" },
    { name:"Dornfelder", pronunciation:"DORN-fel-der", country:"Germany", style:"Red", notes:"Blackberry • Cherry • Spice", body:"Medium–Full", description:"A German red variety known for deep color, ripe berry fruit and a softer, fuller style.", pairings:"Roast pork, sausages, mushroom dishes", locale:"de-DE" },
  ],
  E: [
    { name:"Eiswein", pronunciation:"EYES-vine", country:"Germany / Austria", style:"Sweet", notes:"Honey • Apricot • Citrus • Floral", body:"Medium–Full", description:"A sweet wine made from grapes naturally frozen on the vine, concentrating sugars and flavors.", pairings:"Blue cheese, fruit desserts, foie gras", locale:"de-DE" },
    { name:"Espumante", pronunciation:"esh-poo-MAHN-teh", country:"Portugal", style:"Sparkling", notes:"Apple • Citrus • Toast • Fine bubbles", body:"Light–Medium", description:"A Portuguese term for sparkling wine, covering styles from fresh and simple to more complex bottles.", pairings:"Seafood, fried foods, salty snacks, brunch", locale:"pt-PT" },
  ],
  F: [
    { name:"Fiano", pronunciation:"fee-AH-noh", country:"Italy", style:"White", notes:"Pear • Citrus • Almond • Floral", body:"Medium", description:"An aromatic southern Italian white with texture, fresh acidity and subtle nutty notes.", pairings:"Grilled fish, shellfish, roast chicken", locale:"it-IT" },
    { name:"Franciacorta", pronunciation:"fran-cha-KOR-tah", country:"Italy", style:"Sparkling", notes:"Apple • Brioche • Citrus • Almond", body:"Medium", description:"Elegant Lombardy sparkling wine made in a traditional bottle-fermented style.", pairings:"Fried seafood, risotto, Parmesan, aperitivo", locale:"it-IT" },
  ],
  G: [
    { name:"Gamay", pronunciation:"gah-MAY", country:"France", style:"Red", notes:"Strawberry • Raspberry • Violet • Pepper", body:"Light", description:"A naturally bright, juicy red grape best known for Beaujolais.", pairings:"Roast chicken, charcuterie, pizza, picnic foods", locale:"fr-FR" },
    { name:"Gewürztraminer", pronunciation:"geh-VURTS-trah-mee-ner", country:"Germany / Alsace", style:"White", notes:"Lychee • Rose • Ginger • Spice", body:"Medium", description:"A highly aromatic white with floral, tropical and spice-driven character; it can be dry or sweet.", pairings:"Spicy food, Thai curry, blue cheese, roast pork", locale:"de-DE" },
  ],
  H: [
    { name:"Hermitage", pronunciation:"er-MEE-tazh", country:"France", style:"Red / White", notes:"Blackberry • Violet • Pepper • Stone", body:"Full", description:"A prestigious northern Rhône appellation best known for powerful Syrah reds and rich Marsanne/Roussanne whites.", pairings:"Braised meats, game, roasted mushrooms", locale:"fr-FR" },
    { name:"Haut-Médoc", pronunciation:"oh may-DOK", country:"France", style:"Red", notes:"Blackcurrant • Cedar • Graphite • Herbs", body:"Full", description:"A Bordeaux appellation where Cabernet-led reds show structure, cassis and savory complexity.", pairings:"Beef, lamb, duck, aged Comté", locale:"fr-FR" },
  ],
  I: [
    { name:"Icewine", pronunciation:"EYES-wine", country:"Canada / Germany", style:"Sweet", notes:"Peach • Apricot • Honey • Citrus", body:"Medium–Full", description:"A sweet wine made from grapes frozen naturally on the vine, concentrating sugar and flavor.", pairings:"Fruit desserts, blue cheese, foie gras", locale:"en-US" },
    { name:"Inzolia", pronunciation:"in-SOH-lee-ah", country:"Italy", style:"White", notes:"Lemon • Almond • White flowers", body:"Light–Medium", description:"A Sicilian white grape producing fresh, softly textured wines with citrus and almond notes.", pairings:"Grilled fish, salads, light pasta", locale:"it-IT" },
  ],
  J: [
    { name:"Jacquère", pronunciation:"zhah-KEHR", country:"France", style:"White", notes:"Lemon • Green apple • Alpine herbs", body:"Light", description:"A crisp Alpine French white grape known for freshness and a clean, mineral-leaning profile.", pairings:"Fondue, raclette, freshwater fish", locale:"fr-FR" },
    { name:"Jurançon", pronunciation:"zhoo-rahn-SOHN", country:"France", style:"White / Sweet", notes:"Passion fruit • Citrus • Honey • Flowers", body:"Medium", description:"A southwest French appellation producing both dry and sweet aromatic wines from local grapes.", pairings:"Foie gras, blue cheese, fruit desserts", locale:"fr-FR" },
  ],
  K: [
    { name:"Kerner", pronunciation:"KER-ner", country:"Germany", style:"White", notes:"Apple • Peach • Floral", body:"Light–Medium", description:"A German crossing that combines Riesling-like freshness with aromatic stone-fruit character.", pairings:"Salads, fish, mild cheeses", locale:"de-DE" },
    { name:"Kabinett", pronunciation:"kah-bee-NET", country:"Germany", style:"White", notes:"Lime • Green apple • Peach", body:"Light", description:"A German Prädikatswein category for lighter wines made from naturally ripe grapes, often refreshing and elegant.", pairings:"Sushi, salads, shellfish, spicy food", locale:"de-DE" },
  ],
  L: [
    { name:"Lambrusco", pronunciation:"lam-BROOS-koh", country:"Italy", style:"Sparkling Red", notes:"Red berry • Violet • Citrus • Fresh", body:"Light–Medium", description:"A family of Italian sparkling red wines ranging from dry and savory to sweet and fruity.", pairings:"Pizza, salumi, burgers, fried foods", locale:"it-IT" },
    { name:"Listán Blanco", pronunciation:"lees-TAHN BLAHN-koh", country:"Spain", style:"White", notes:"Citrus • Pear • Herbs • Mineral", body:"Light–Medium", description:"A Canary Islands white grape that can show bright acidity, volcanic minerality and subtle savory notes.", pairings:"Grilled fish, goat cheese, seafood rice", locale:"es-ES" },
  ],
  M: [
    { name:"Malbec", pronunciation:"mal-BECK", country:"Argentina / France", style:"Red", notes:"Plum • Blackberry • Violet • Cocoa", body:"Medium–Full", description:"A dark-fruited red famous in Argentina, where it often combines ripe fruit with velvety tannin.", pairings:"Steak, barbecue, empanadas, grilled mushrooms", locale:"fr-FR" },
    { name:"Moscato", pronunciation:"mos-KAH-toh", country:"Italy", style:"White / Sweet", notes:"Peach • Orange blossom • Grape", body:"Light", description:"An aromatic Muscat-based style often lightly sparkling and sweet, with vivid floral and fruit aromas.", pairings:"Fresh fruit, brunch, light pastries", locale:"it-IT" },
  ],
  N: [
    { name:"Nebbiolo", pronunciation:"neh-bee-OH-loh", country:"Italy", style:"Red", notes:"Rose • Cherry • Tar • Herbs", body:"Full", description:"A Piedmont red grape with high acidity and tannin, capable of becoming complex and aromatic with age.", pairings:"Truffle pasta, braised beef, aged cheese", locale:"it-IT" },
    { name:"Nero d'Avola", pronunciation:"NAIR-oh dah-VOH-lah", country:"Italy", style:"Red", notes:"Black cherry • Plum • Spice", body:"Medium–Full", description:"Sicily's signature red grape, offering ripe dark fruit, spice and warm Mediterranean character.", pairings:"Lamb, grilled meats, tomato pasta", locale:"it-IT" },
  ],
  O: [
    { name:"Oloroso", pronunciation:"oh-loh-ROH-soh", country:"Spain", style:"Fortified", notes:"Walnut • Dried fruit • Spice • Savory", body:"Full", description:"A dry Sherry style matured with controlled exposure to oxygen, developing deep nutty and savory flavors.", pairings:"Iberian ham, nuts, mushrooms, aged cheese", locale:"es-ES" },
    { name:"Orvieto", pronunciation:"or-vee-EH-toh", country:"Italy", style:"White", notes:"Citrus • Pear • White flowers", body:"Light–Medium", description:"A central Italian white appellation producing fresh, easy-drinking wines with bright fruit and floral notes.", pairings:"Seafood pasta, roast chicken, salads", locale:"it-IT" },
  ],
  P: [
    { name:"Pinot Noir", pronunciation:"PEE-noh NWAHR", country:"France / Global", style:"Red", notes:"Cherry • Raspberry • Earth • Spice", body:"Light–Medium", description:"A delicate, high-acid red grape celebrated for perfume, silky texture and its ability to express place.", pairings:"Duck, salmon, roast chicken, mushrooms", locale:"fr-FR" },
    { name:"Prosecco", pronunciation:"proh-SEK-koh", country:"Italy", style:"Sparkling", notes:"Pear • Apple • White flowers • Citrus", body:"Light", description:"A fresh Italian sparkling wine, typically fruit-forward and made using the tank method.", pairings:"Aperitivo, seafood, fried snacks, brunch", locale:"it-IT" },
  ],
  Q: [
    { name:"Quarts de Chaume", pronunciation:"kar duh SHOHM", country:"France", style:"Sweet White", notes:"Honey • Quince • Citrus • Saffron", body:"Full", description:"A prestigious sweet wine appellation in the Loire, made from Chenin Blanc and known for concentration and acidity.", pairings:"Foie gras, blue cheese, fruit tart", locale:"fr-FR" },
    { name:"Qvevri Wine", pronunciation:"KWEV-ree wine", country:"Georgia", style:"Skin-contact / Traditional", notes:"Tea • Dried fruit • Earth • Spice", body:"Medium–Full", description:"Wine made using traditional Georgian qvevri clay vessels, often with extended skin contact and distinctive texture.", pairings:"Roasted vegetables, lamb, walnuts, earthy dishes", locale:"en-US" },
  ],
  R: [
    { name:"Riesling", pronunciation:"REEZ-ling", country:"Germany / Global", style:"White", notes:"Lime • Green apple • Peach • Petrol", body:"Light", description:"A high-acid aromatic white capable of everything from bone-dry and mineral to intensely sweet and age-worthy.", pairings:"Sushi, spicy food, pork, shellfish", locale:"de-DE" },
    { name:"Rioja", pronunciation:"ree-OH-hah", country:"Spain", style:"Red / White", notes:"Cherry • Vanilla • Leather • Herbs", body:"Medium–Full", description:"Spain's famous wine region, known especially for Tempranillo-based reds with varying degrees of oak and aging.", pairings:"Lamb, tapas, roast pork, aged cheese", locale:"es-ES" },
  ],
  S: [
    { name:"Sauvignon Blanc", pronunciation:"SOH-vee-nyon BLAHN", country:"France / Global", style:"White", notes:"Grapefruit • Lime • Herb • Gooseberry", body:"Light–Medium", description:"A high-acid white grape known for citrus, green fruit and herbal aromas, from lean to richer styles.", pairings:"Goat cheese, seafood, salads, green herbs", locale:"fr-FR" },
    { name:"Syrah", pronunciation:"see-RAH", country:"France / Global", style:"Red", notes:"Blackberry • Black pepper • Olive • Violet", body:"Full", description:"A dark, savory red grape that can range from peppery and elegant to plush and powerful.", pairings:"Lamb, barbecue, steak, roasted vegetables", locale:"fr-FR" },
  ],
  T: [
    { name:"Tempranillo", pronunciation:"tem-prah-NEE-yoh", country:"Spain", style:"Red", notes:"Plum • Cherry • Leather • Tobacco", body:"Medium–Full", description:"Spain's flagship red grape, often showing red and dark fruit with savory notes and oak-derived spice.", pairings:"Lamb, chorizo, roast pork, Manchego", locale:"es-ES" },
    { name:"Torrontés", pronunciation:"toh-ron-TESS", country:"Argentina", style:"White", notes:"Peach • Rose • Citrus • Grapefruit", body:"Light", description:"An intensely aromatic Argentine white with floral perfume and refreshing acidity.", pairings:"Empanadas, spicy dishes, grilled seafood", locale:"es-ES" },
  ],
  U: [
    { name:"Ugni Blanc", pronunciation:"oo-NYEE BLAHN", country:"France / Italy", style:"White", notes:"Lemon • Green apple • Fresh", body:"Light", description:"A high-acid grape widely used in France, especially for Cognac and Armagnac production, and in some dry white wines.", pairings:"Shellfish, light salads, simple seafood", locale:"fr-FR" },
    { name:"Ull de Llebre", pronunciation:"ool deh YEH-breh", country:"Spain", style:"Red", notes:"Cherry • Plum • Herbs", body:"Medium", description:"A Catalan name for Tempranillo, especially associated with Catalonia and its red wine traditions.", pairings:"Roast pork, tapas, grilled vegetables", locale:"es-ES" },
  ],
  V: [
    { name:"Vermentino", pronunciation:"ver-men-TEE-noh", country:"Italy / France", style:"White", notes:"Lemon • Pear • Saline • Herbs", body:"Light–Medium", description:"A Mediterranean white grape with citrus freshness, herbal lift and a subtly saline finish.", pairings:"Seafood, pesto pasta, grilled vegetables", locale:"it-IT" },
    { name:"Viognier", pronunciation:"vee-ohn-YAY", country:"France / Global", style:"White", notes:"Apricot • Peach • Honeysuckle", body:"Medium–Full", description:"A highly aromatic white grape with ripe stone fruit and floral aromas, often with a rounded texture.", pairings:"Roast chicken, aromatic curries, grilled pork", locale:"fr-FR" },
  ],
  W: [
    { name:"Welschriesling", pronunciation:"VELSH-reez-ling", country:"Central Europe", style:"White", notes:"Green apple • Citrus • Fresh", body:"Light", description:"A crisp Central European white variety unrelated to Riesling despite its name.", pairings:"Schnitzel, salads, freshwater fish", locale:"de-DE" },
    { name:"White Zinfandel", pronunciation:"WHYt ZIN-fan-del", country:"USA", style:"Rosé", notes:"Strawberry • Watermelon • Sweet spice", body:"Light", description:"A sweet, pink style made from Zinfandel, popular for its soft fruitiness and easy-drinking character.", pairings:"Spicy food, picnic snacks, fruit desserts", locale:"en-US" },
  ],
  X: [
    { name:"Xinomavro", pronunciation:"ksee-NOH-mah-vroh", country:"Greece", style:"Red", notes:"Sour cherry • Olive • Tomato • Earth", body:"Medium–Full", description:"A Greek red grape with high acidity and tannin, often compared structurally to Nebbiolo.", pairings:"Lamb, tomato-rich dishes, mushrooms", locale:"el-GR" },
    { name:"Xarel-lo", pronunciation:"sha-rel-LOH", country:"Spain", style:"White", notes:"Citrus • Apple • Herbs • Mineral", body:"Light–Medium", description:"A Catalan white grape important in Cava, valued for freshness and savory mineral character.", pairings:"Seafood, tapas, shellfish, soft cheese", locale:"es-ES" },
  ],
  Y: [
    { name:"Yalumba Y Series Shiraz", pronunciation:"yah-LOOM-bah why SEER-eez shih-RAHZ", country:"Australia", style:"Red", notes:"Blackberry • Plum • Pepper", body:"Medium–Full", description:"A representative Australian Shiraz style: ripe fruit, spice and generous texture.", pairings:"Barbecue, burgers, lamb, grilled mushrooms", locale:"en-AU" },
    { name:"Yarden Cabernet Sauvignon", pronunciation:"YAR-den cab-er-NAY soh-vee-NYON", country:"Israel", style:"Red", notes:"Cassis • Cedar • Plum • Spice", body:"Full", description:"A Cabernet-led Israeli style showing dark fruit, oak spice and structured tannin.", pairings:"Steak, lamb, roast beef, hard cheese", locale:"en-US" },
  ],
  Z: [
    { name:"Zinfandel", pronunciation:"ZIN-fan-del", country:"USA", style:"Red / Rosé", notes:"Blackberry • Raspberry • Jam • Spice", body:"Medium–Full", description:"A versatile American red grape capable of everything from juicy rosé to rich, high-alcohol reds.", pairings:"Barbecue, ribs, burgers, spicy sausage", locale:"en-US" },
    { name:"Zweigelt", pronunciation:"TSVY-gelt", country:"Austria", style:"Red", notes:"Cherry • Raspberry • Pepper", body:"Light–Medium", description:"Austria's widely planted red crossing, offering bright red fruit, freshness and gentle spice.", pairings:"Schnitzel, sausages, roast chicken", locale:"de-DE" },
  ],
};

const typeData = {
  Red: ["Bold, expressive, and often structured.", "🍒", ["Cabernet Sauvignon", "Pinot Noir", "Malbec"]],
  White: ["Crisp, aromatic, creamy, or somewhere in between.", "🍋", ["Sauvignon Blanc", "Chardonnay", "Riesling"]],
  Rosé: ["Fresh, fruity, and made for easy sipping.", "🌷", ["Provence Rosé", "Grenache Rosé", "Pinot Noir Rosé"]],
  Sparkling: ["Bubbles, brightness, and instant celebration.", "✨", ["Prosecco", "Cava", "Champagne"]],
};

const pairingData = {
  Pizza: ["🍕", "Sangiovese / Chianti", "Tomato sauce loves acidity; it keeps the wine bright next to cheese and herbs."],
  Chicken: ["🍗", "Chardonnay / Pinot Noir", "Roasted chicken can swing white or red depending on the sauce and preparation."],
  Steak: ["🥩", "Cabernet Sauvignon", "Structured tannins and dark fruit have the weight to stand beside a rich steak."],
  Seafood: ["🦐", "Sauvignon Blanc / Albariño", "Citrus, acidity, and freshness complement delicate seafood without dominating it."],
  Cheese: ["🧀", "Depends on the cheese", "Soft, salty, aged, and blue cheeses all create different pairing opportunities."],
  Chocolate: ["🍫", "Port / Sweet Red", "Rich chocolate needs a wine with enough sweetness and intensity to keep up."],
};

const tastingSteps = [
  ["01", "See", "👀", "Look at color, clarity, and intensity. Tilt the glass against a light background."],
  ["02", "Swirl", "🌀", "Gently move the wine around the bowl to release more aromas."],
  ["03", "Sniff", "👃", "Take a few short sniffs. Look for fruit, flowers, herbs, spice, or oak."],
  ["04", "Sip", "👄", "Notice sweetness, acidity, tannin, body, texture, and balance."],
  ["05", "Savor", "✨", "Pause. Notice the finish and ask yourself the most important question: did I like it?"],
];

const wineTerms = [
  ["A","Acidity","The mouth-watering freshness that makes a wine feel lively and crisp.","“This has bright acidity.”"],
  ["B","Body","How heavy, light, or mouth-filling a wine feels — think water versus milk.","“It's medium-bodied.”"],
  ["C","Corked","A wine fault usually associated with TCA, giving musty or damp-cardboard aromas and muting fruit.","“I think this bottle is corked.”"],
  ["D","Decant","To transfer wine into another vessel, commonly to separate sediment or, sometimes, encourage aeration.","“Let's decant it for a little while.”"],
  ["E","Enology / Oenology","The study and practice of winemaking.","“She's studying oenology.”"],
  ["F","Finish","The flavors and sensations that remain after you swallow or spit the wine.","“It has a long finish.”"],
  ["G","Grippy","A casual tasting word for tannins that feel noticeable, textured, or slightly drying.","“The tannins are beautifully grippy.”"],
  ["H","Herbaceous","Aroma or flavor reminiscent of fresh herbs, leaves, grass, or green plants.","“There's a lovely herbaceous note.”"],
  ["I","Intensity","How powerful the aromas or flavors seem, rather than simply how pleasant they are.","“The nose has high intensity.”"],
  ["J","Jammy","Very ripe, sweet-fruited aromas or flavors, often suggesting cooked or jam-like berries.","“It's plush and jammy.”"],
  ["K","Kabinett","A German Prädikatswein category for lighter wines made from naturally ripe grapes.","“Try a Kabinett Riesling.”"],
  ["L","Lees","Spent yeast cells and other sediment left after fermentation; contact can add texture and savory notes.","“It was aged on its lees.”"],
  ["M","Mouthfeel","The physical sensation of wine in your mouth: texture, weight, warmth, dryness and more.","“The mouthfeel is silky.”"],
  ["N","Nose","Sommelier shorthand for the wine's aromas, especially after swirling.","“The nose is floral and citrusy.”"],
  ["O","Oxidation","A chemical change caused by oxygen exposure; too much can make wine lose freshness and develop bruised-apple or nutty notes.","“This tastes oxidized.”"],
  ["P","Palate","What you perceive once the wine is in your mouth — structure, flavor, texture and finish.","“On the palate, it's dry and fresh.”"],
  ["Q","Qvevri","A traditional Georgian clay vessel used for fermentation and maturation, often with extended skin contact.","“This was made in qvevri.”"],
  ["R","Round","A wine that feels smooth, broad and softly textured rather than sharp or angular.","“It's really round on the palate.”"],
  ["S","Structure","The framework created by acidity, tannin, alcohol, body and other elements.","“The wine has great structure.”"],
  ["T","Terroir","The combination of a place's natural environment and human influence that shapes a wine's character.","“You can really taste the terroir.”"],
  ["U","Umami","A savory taste sensation that can interact strongly with wine, especially tannin and acidity.","“The mushroom dish brings out umami.”"],
  ["V","Volatile","Refers to aroma compounds that readily evaporate and contribute to what you smell.","“The wine has expressive volatile aromas.”"],
  ["W","Woody","A tasting description for aromas or flavors associated with oak, especially when oak is prominent.","“There's a little woody character.”"],
  ["X","Xylem","The water-conducting tissue inside a vine; a vineyard term rather than a tasting descriptor.","“The vine's xylem carries water upward.”"],
  ["Y","Yield","The amount of grapes produced by a vineyard, often discussed as tonnes per hectare or similar measures.","“Lower yields can be part of a producer's strategy.”"],
  ["Z","Zymology","The study of fermentation and its processes — a useful technical word when talking about yeast and wine.","“Fermentation is central to zymology.”"],
];

const glassware = [
  { name:"Bordeaux", icon:"🍷", best:"Cabernet Sauvignon, Merlot, Bordeaux blends", when:"Bold, tannic reds", why:"Tall and spacious: gives powerful reds room for aroma while helping the wine feel more balanced." },
  { name:"Burgundy / Pinot Noir", icon:"🍷", best:"Pinot Noir, Nebbiolo, delicate reds", when:"Aromatic, lighter-bodied reds", why:"The wide bowl collects delicate aromas and lets expressive wines open up." },
  { name:"White Wine", icon:"🥂", best:"Sauvignon Blanc, Albariño, Pinot Grigio", when:"Crisp, lighter whites", why:"A smaller bowl helps preserve cooler temperature and highlights fresh, floral aromas." },
  { name:"Full-bodied White", icon:"🥂", best:"Oaked Chardonnay, Viognier, White Rioja", when:"Rich or oak-aged whites", why:"A wider bowl gives fuller whites more room for texture and layered aromas." },
  { name:"Sparkling / Flute", icon:"🥂", best:"Prosecco, Cava, Champagne", when:"Bubbly wines", why:"A narrow shape helps retain bubbles; a tulip or white-wine glass can reveal more complex aromas." },
  { name:"Dessert / Port", icon:"🍷", best:"Port, Sauternes, Icewine, sweet wines", when:"Sweet or fortified wines", why:"The smaller bowl suits smaller pours and concentrates aromas without overwhelming the nose." },
  { name:"Universal", icon:"✨", best:"Almost everything", when:"Everyday drinking", why:"If you only want one glass, this is the practical answer: versatile enough for reds, whites and rosé." },
];

const dosDonts = {
  dos: [
    ["🍷","Hold the stem","It keeps fingerprints and hand warmth away from the bowl."],
    ["👃","Smell before sipping","A huge part of wine's character comes from aroma."],
    ["💧","Keep water nearby","Water resets your palate and makes tasting more comfortable."],
    ["🌡️","Serve it at a sensible temperature","Cold isn't automatically better; style matters."],
    ["🗣️","Ask questions","A good sommelier should make wine easier, not make you feel stupid."],
    ["❤️","Drink what you enjoy","There is no prize for pretending to like a wine you hate."],
  ],
  donts: [
    ["🚫","Don't say “I don't know enough”","You are allowed to like wine before knowing the vocabulary."],
    ["🚫","Don't fill the glass to the top","Leave room to swirl and collect aromas."],
    ["🚫","Don't call every old wine better","Only some wines benefit from extended aging."],
    ["🚫","Don't panic over cork crumbs","Pieces of cork are not the same thing as cork taint."],
    ["🚫","Don't over-decant everything","Many everyday wines need little or no decanting."],
    ["🚫","Don't perform for the table","The goal is enjoyment, not passing a sommelier audition."],
  ],
};

function detectWineLocale(name) {
  const french = ["Albariño", "Beaujolais", "Cabernet Sauvignon", "Chardonnay", "Champagne", "Chablis", "Hermitage", "Haut-Médoc", "Jacquère", "Jurançon", "Pinot Noir", "Riesling", "Sauvignon Blanc", "Syrah", "Ugni Blanc", "Viognier", "Xarel-lo"];
  const italian = ["Amarone", "Barbera", "Dolcetto", "Fiano", "Franciacorta", "Lambrusco", "Malbec", "Moscato", "Nebbiolo", "Nero d'Avola", "Oloroso", "Orvieto", "Prosecco", "Vermentino"];
  const spanish = ["Jerez", "Rioja", "Tempranillo", "Torrontés", "Ull de Llebre", "Xarel-lo"];
  const german = ["Eiswein", "Gewürztraminer", "Kabinett", "Kerner", "Welschriesling", "Zweigelt"];
  if (french.includes(name)) return "fr-FR";
  if (italian.includes(name)) return "it-IT";
  if (spanish.includes(name)) return "es-ES";
  if (german.includes(name)) return "de-DE";
  if (/France/.test(name)) return "fr-FR";
  return "en-US";
}

function chooseNaturalVoice(voices, locale) {
  const langPrefix = locale.split("-")[0];
  const matching = voices.filter(v => v.lang?.toLowerCase().startsWith(langPrefix));
  const femaleHint = /(female|woman|sophie|amelie|audrey|julie|claire|marie|celine|léa|lea|alice|emma|susan|samantha|victoria|karen|zira|helena|fiona|google français|google french|microsoft.*online.*natural)/i;
  const preferred = matching.find(v => femaleHint.test(v.name));
  return preferred || matching.find(v => /natural|online|enhanced|premium/i.test(v.name)) || matching[0] || voices.find(v => v.lang?.toLowerCase().startsWith("fr")) || voices[0];
}

function SpeakButton({ name, pronunciation, locale = "fr-FR" }) {
  const speak = (e) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const voice = chooseNaturalVoice(voices, locale);
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.lang = locale;
    utterance.voice = voice || null;
    utterance.rate = locale.startsWith("fr") ? 0.72 : 0.76;
    utterance.pitch = 1.08;
    synth.speak(utterance);
  };
  return <button className="speak" onClick={speak} aria-label={`Hear the pronunciation of ${name}`} title={`Hear ${name} pronounced`}>
    <span className="speaker-icon">🔊</span><small>{pronunciation}</small>
  </button>;
}

function App() {
  const app = useRef(null);
  const [letter, setLetter] = useState("A");
  const [expandedWine, setExpandedWine] = useState(null);
  const [termLetter, setTermLetter] = useState("A");
  const [activeGlass, setActiveGlass] = useState("Bordeaux");
  const [type, setType] = useState("Red");
  const [pairing, setPairing] = useState("Pizza");
  const [activeRegion, setActiveRegion] = useState("France");
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [glassRotation, setGlassRotation] = useState({ x: 0, y: 0 });
  const [glassFill, setGlassFill] = useState(48);
  const [draggingGlass, setDraggingGlass] = useState(false);
  const [wineQuery, setWineQuery] = useState("");
  const [wineImage, setWineImage] = useState(null);
  const [wineImageName, setWineImageName] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav", { y: -24, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from(".hero-kicker,.hero-title .word,.hero-copy,.hero-actions,.hero-note", {
        y: 45, opacity: 0, duration: 1.05, stagger: 0.08, ease: "power4.out", delay: 0.15, clearProps: "all"
      });
      gsap.from(".hero-art", { scale: 0.9, opacity: 0, duration: 1.35, ease: "expo.out", delay: 0.2 });
      gsap.to(".bottle-float", { y: -14, rotation: 1.5, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".glass-float", { y: 12, rotation: -1.5, duration: 4.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orbit", { rotation: 360, duration: 24, repeat: -1, ease: "none" });
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
      });
      gsap.utils.toArray(".stagger").forEach((group) => {
        gsap.fromTo(group.children, { y: 35, opacity: 0.001 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.09, ease: "power3.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: group, start: "top 88%", once: true }
        });
      });
      gsap.to(".marquee-track", { xPercent: -25, duration: 22, repeat: -1, ease: "none" });
      gsap.to(".hero-glow", { x: 80, y: -30, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, app);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(".hero-art", { rotateY: x * 3, rotateX: -y * 2, duration: 0.8, ease: "power2.out" });
      gsap.to(".cursor-glow", { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power2.out" });
      gsap.to(".cursor-layer-a", { x: x * 22, y: y * 14, duration: 1.1, ease: "power3.out" });
      gsap.to(".cursor-layer-b", { x: x * -14, y: y * -10, duration: 1.5, ease: "power3.out" });
      gsap.to(".cursor-layer-c", { x: x * 7, y: y * 6, duration: 1.9, ease: "power3.out" });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const regions = {
    France: "Bordeaux, Burgundy, Champagne — tradition, terroir, and endless regional personality.",
    Italy: "Tuscany, Piedmont, Veneto, Sicily — a huge patchwork of grapes, climates, and styles.",
    USA: "Napa, Sonoma, Oregon — bold Cabernet, cool-climate Pinot, and experimental energy.",
    Spain: "Rioja, Ribera del Duero, Priorat — Tempranillo, old vines, oak, and Mediterranean character.",
    Australia: "Barossa, Hunter Valley, Margaret River — Shiraz, Riesling, and modern regional diversity.",
    Chile: "Maipo, Colchagua, Casablanca — Andes influence, bright fruit, and excellent value.",
  };

  const quizQuestions = [
    { q: "Your ideal glass sounds like…", a: ["🍓 Fruity & easy", "🍋 Crisp & fresh", "🔥 Bold & rich", "✨ Bubbly & playful"] },
    { q: "Dinner is probably…", a: ["🍕 Pizza night", "🐟 Seafood", "🥩 Steak", "🧀 Cheese & snacks"] },
    { q: "Your wine personality?", a: ["☀️ Carefree", "🌿 Elegant", "🖤 Confident", "🥂 Celebratory"] },
  ];

  const resultNames = [
    ["The Fruity Explorer", "🍓", "Approachable, expressive, and full of fruit. Start with Pinot Noir, Rosé, or a fruity Riesling."],
    ["The Crisp Chaser", "🍋", "You want freshness and energy. Try Sauvignon Blanc, Albariño, or Pinot Grigio."],
    ["The Bold One", "🔥", "You like a wine with presence. Try Cabernet Sauvignon, Syrah, or Malbec."],
    ["The Bubbly Enthusiast", "🥂", "You believe bubbles make everything better. Try Prosecco, Cava, or Champagne."],
  ];

  const chooseQuiz = (index) => {
    const next = [...quizAnswers, index];
    if (quizStep < 2) {
      setQuizAnswers(next);
      setQuizStep(quizStep + 1);
    } else {
      const counts = [0, 0, 0, 0];
      next.forEach(i => counts[i]++);
      const winner = counts.indexOf(Math.max(...counts));
      setQuizResult(resultNames[winner]);
    }
  };

  const handleGlassPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingGlass(true);
  };
  const handleGlassPointerMove = (e) => {
    if (!draggingGlass) return;
    setGlassRotation(r => ({ x: Math.max(-22, Math.min(22, r.x + e.movementY * 0.45)), y: Math.max(-30, Math.min(30, r.y + e.movementX * 0.55)) }));
  };
  const handleGlassWheel = (e) => {
    e.preventDefault();
    setGlassFill(v => Math.max(8, Math.min(92, v - e.deltaY * 0.06)));
  };

  const resizeImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const analyzeWine = async (e) => {
    e?.preventDefault();
    if (!wineQuery.trim() && !wineImage) {
      setAiError("Type a wine name or upload a clear label photo first.");
      return;
    }
    setAiLoading(true); setAiError(""); setAiResult(null);
    try {
      const res = await fetch("/api/wine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: wineQuery.trim(), image: wineImage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The wine assistant couldn't answer right now.");
      setAiResult(data.result);
    } catch (err) {
      setAiError(err.message || "Something went wrong. Try again.");
    } finally { setAiLoading(false); }
  };

  const onWineImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAiError("Please choose an image file."); return; }
    try {
      setWineImage(await resizeImage(file));
      setWineImageName(file.name);
      setAiError("");
    } catch { setAiError("I couldn't read that image. Try another label photo."); }
  };

  return (
    <div ref={app} className="site">
      <div className="cursor-glow" />
      <div className="progress"><span /></div>

      <header className="nav">
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 39c-2-8-2-14 1-20 2-4 5-7 10-10"/><path d="M25 30c-7-1-12-5-14-11 6-1 12 2 14 8"/><path d="M28 24c4-6 9-8 15-7-2 6-7 9-14 10"/><circle cx="18" cy="35" r="3"/><circle cx="24" cy="37" r="3"/><circle cx="30" cy="35" r="3"/><circle cx="24" cy="42" r="3"/></svg></span><span>Wine About It<small>WINE 101</small></span></a>
        <nav>
          <a href="#learn">Learn</a><a href="#crash-course">Crash Course</a><a href="#glass-lab">Glass Lab</a><a href="#tell-me">AI Wine</a><a href="#alphabet">A–Z</a><a href="#pairing">Pair</a><a href="#world">World</a>
        </nav>
        <button className="nav-cta" onClick={() => {setQuizStep(0);setQuizAnswers([]);setQuizResult(null);setQuizOpen(true)}}>Find My Wine <b>↗</b></button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-kicker">YOUR FRIENDLY WINE 101 <span>✦</span></div>
            <h1 className="hero-title">
              <span className="word">Wine</span> <span className="word">doesn't</span> <span className="word">have</span> <span className="word">to</span><br/>
              <span className="word">be</span> <span className="word accent">complicated.</span>
            </h1>
            <p className="hero-copy">No intimidating vocabulary. No wine-snob energy. Just the things you actually want to know about what's in your glass.</p>
            <div className="hero-actions"><a href="#learn" className="magnetic primary">Start learning <span>↗</span></a><a href="#alphabet" className="text-link">Explore the wine A–Z <span>→</span></a></div>
            <div className="hero-note"><span className="dot" /> Made for curious beginners <span>•</span> built for people who just want to enjoy wine.</div>
          </div>

          <div className="hero-art">
            <div className="hero-glow" />
            <div className="cursor-layer-a ambient-blob" />
            <div className="cursor-layer-b ambient-ring" />
            <div className="cursor-layer-c ambient-dust">✦　·　✦　·　·　✦</div>
            <div className="art-grid" />
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="float-card card-one"><small>THE GOLDEN RULE</small><b>Drink what<br/>you like.</b></div>
            <div className="float-card card-two"><span>✦</span> Sip smarter.</div>
            <div className="bottle-float bottle">
              <div className="bottle-neck" /><div className="bottle-body"><div className="bottle-label"><strong>WAI</strong><small>WINE ABOUT IT</small><em>101</em></div></div>
            </div>
            <div className="glass-float glass"><div className="glass-bowl"><div className="wine-fill" /></div><div className="glass-stem" /><div className="glass-foot" /></div>
            <div className="art-caption"><span>01</span><b>Wine, decoded.</b><small>Less snobbery. More curiosity.</small></div>
          </div>
        </section>

        <div className="marquee"><div className="marquee-track">GRAPES <i>✦</i> FLAVORS <i>✦</i> PAIRINGS <i>✦</i> REGIONS <i>✦</i> MYTHS <i>✦</i> TASTING <i>✦</i> GRAPES <i>✦</i> FLAVORS <i>✦</i> PAIRINGS <i>✦</i> REGIONS <i>✦</i> MYTHS <i>✦</i> TASTING <i>✦</i></div></div>

        <section className="feature-split section" id="glass-lab">
          <div className="feature-intro reveal"><span className="eyebrow">THE GLASS LAB</span><h2>Don't just look at the glass.<br/><em>Play with it.</em></h2><p>Drag the glass to inspect it from different angles. Scroll to smoothly raise or lower the wine. The glass is rendered in WebGL with transparent physical materials, a modeled bowl, stem and foot, and a gently animated liquid surface — no bottle, no pouring line, no image.</p><div className="feature-hint">↔ DRAG <span>•</span> ↕ WINE LEVEL</div></div>
          <div className="glass-lab-stage reveal" onWheel={handleGlassWheel}>
            <div className="glass-lab-orbit orbit-a"/><div className="glass-lab-orbit orbit-b"/>
            <RealWineGlass fill={glassFill} rotation={glassRotation} setRotation={setGlassRotation} onWheel={handleGlassWheel} />
            <div className="glass-callout callout-bowl"><b>BOWL</b><span>Collects aroma.</span></div><div className="glass-callout callout-stem"><b>STEM</b><span>Keeps warmth away.</span></div><div className="glass-callout callout-base"><b>BASE</b><span>Stability.</span></div>
            <div className="glass-fill-readout"><span>WINE LEVEL</span><b>{glassFill < 35 ? "LIGHT" : glassFill < 65 ? "DINNER" : "FULL"}</b><small>Scroll to adjust</small></div>
          </div>
        </section>

        <section className="section ai-wine" id="tell-me">
          <div className="ai-shell reveal">
            <div className="ai-copy"><span className="eyebrow">WINE ABOUT THE INTELLIGENCE</span><h2>Tell me what<br/>I'm <em>drinking.</em></h2><p>Type a bottle name or upload a label. The Wine About It assistant turns the label into a beginner-friendly breakdown — without the wine-snob lecture.</p><div className="ai-points"><span>✦ IDENTIFY</span><span>✦ GO DEEPER</span><span>✦ PAIR</span><span>✦ DISCOVER</span></div></div>
            <form className="ai-panel" onSubmit={analyzeWine}>
              <div className="ai-tabs"><button type="button" className="active">TYPE A WINE</button><label className="upload-label">⌁ UPLOAD LABEL<input type="file" accept="image/*" onChange={onWineImage}/></label></div>
              <div className="ai-input-wrap"><input value={wineQuery} onChange={e=>setWineQuery(e.target.value)} placeholder="e.g. Château Margaux 2018" aria-label="Wine name"/><span>⌕</span></div>
              <div className={`upload-status ${wineImage?"has-image":""}`}>{wineImage ? `✓ ${wineImageName}` : "Or upload a clear photo of the front label"}</div>
              <div className="ai-examples"><button type="button" onClick={()=>setWineQuery("Chardonnay")}>Chardonnay</button><button type="button" onClick={()=>setWineQuery("Catena Malbec")}>Catena Malbec</button><button type="button" onClick={()=>setWineQuery("Prosecco")}>Prosecco</button></div>
              <button className="ai-submit" type="submit" disabled={aiLoading}>{aiLoading ? <><span className="ai-spinner"/> Reading your wine…</> : <>Ask about my wine <b>↗</b></>}</button>
              {aiError && <div className="ai-error" role="alert">{aiError}</div>}
              {aiResult && <div className="ai-result"><div className="ai-result-head"><span>YOUR WINE, DECODED · DEEP DIVE</span><button type="button" onClick={()=>setAiResult(null)}>×</button></div><div className="ai-result-body">
  {aiResult.split("\n").filter(Boolean).map((line,i) => {
    const clean = line.trim();
    const heading = /^([A-Z][A-Z &/'-]+):?$/.test(clean);
    const bullet = /^[-•]/.test(clean);
    return heading
      ? <h4 key={i}>{clean.replace(/:$/, "")}</h4>
      : bullet
        ? <p className="ai-bullet" key={i}><span>•</span>{clean.replace(/^[-•]\s*/, "")}</p>
        : <p key={i}>{clean}</p>;
  })}
</div></div>}
            </form>
          </div>
        </section>

        <section className="section" id="learn">
          <div className="section-head reveal"><div><span className="eyebrow">WINE ABOUT THE BASICS</span><h2>Start with what <em>actually matters.</em></h2></div><p>Wine can sound like a secret language. We're here to translate it.</p></div>
          <div className="basic-grid stagger basic-grid-visible">
            {[
              ["01","🍇","What is wine?","Grapes + yeast + time. That's the wonderfully short version.","Explore the basics"],
              ["02","🍷","Red, white, or rosé?","What actually makes them different — and what doesn't.","Compare styles"],
              ["03","👃","How does it taste?","Sweet, dry, acidic, tannic, full-bodied. We'll make sense of it.","Decode tasting"],
            ].map(([n,e,t,d,l])=><article className="basic-card" key={n}><span className="card-no">{n}</span><div className="card-emoji">{e}</div><h3>{t}</h3><p>{d}</p><a href="#taste">{l} <b>↗</b></a></article>)}
          </div>
        </section>

        <section className="section crash-course" id="crash-course">
          <div className="section-head reveal">
            <div><span className="eyebrow">WINE ABOUT THE WORDS</span><h2>The crash course for <em>sounding like you know.</em></h2></div>
            <p>Twenty-six terms. One alphabet. No dictionary required. Learn the words that actually help you understand a wine list and describe what's in your glass.</p>
          </div>
          <div className="term-letters reveal">{wineTerms.map(([l])=><button className={termLetter===l?"active":""} key={l} onClick={()=>setTermLetter(l)}>{l}</button>)}</div>
          <div className="term-feature reveal">
            {wineTerms.filter(([l])=>l===termLetter).map(([l,t,d,q])=><div className="term-card" key={l}>
              <span className="term-big">{l}</span>
              <div><span className="eyebrow">SOMMELIER WORD OF THE DAY</span><h3>{t}</h3><p>{d}</p><div className="term-say"><span>TRY SAYING</span><strong>{q}</strong></div></div>
            </div>)}
          </div>
          <div className="term-grid stagger">
            {wineTerms.map(([l,t,d])=><button className={`term-tile ${termLetter===l?"selected":""}`} key={l} onClick={()=>setTermLetter(l)}><span>{l}</span><div><b>{t}</b><small>{d}</small></div><i>↗</i></button>)}
          </div>
        </section>

        <section className="section dos-donts">
          <div className="section-head reveal">
            <div><span className="eyebrow">WINE ABOUT THE ETIQUETTE</span><h2>The dos, the don'ts, and the <em>please don'ts.</em></h2></div>
            <p>You do not need to act like a sommelier. But a few habits make wine service, tasting and ordering much easier.</p>
          </div>
          <div className="dd-grid">
            <div className="dd-column reveal"><div className="dd-title"><span>DO</span><small>Good habits worth keeping</small></div>{dosDonts.dos.map(([i,t,d])=><article className="dd-card" key={t}><span>{i}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}</div>
            <div className="dd-column dont reveal"><div className="dd-title"><span>DON'T</span><small>Wine snobbery stays outside</small></div>{dosDonts.donts.map(([i,t,d])=><article className="dd-card" key={t}><span>{i}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}</div>
          </div>
        </section>

        <section className="section glasses" id="glasses">
          <div className="section-head reveal">
            <div><span className="eyebrow">WINE ABOUT THE GLASS</span><h2>Yes, the glass <em>actually matters.</em></h2></div>
            <p>The bowl changes how aromas collect and how the wine reaches your palate. You do not need a cabinet full of 20 shapes, though.</p>
          </div>
          <div className="glass-guide">
            <div className="glass-menu reveal">{glassware.map(g=><button key={g.name} className={activeGlass===g.name?"active":""} onClick={()=>setActiveGlass(g.name)}><span>{g.icon}</span><b>{g.name}</b><small>{g.best}</small></button>)}</div>
            <div className="glass-detail reveal">
              {glassware.filter(g=>g.name===activeGlass).map(g=><div key={g.name}>
                <div className="glass-hero-icon">{g.icon}</div><span className="eyebrow">USE IT FOR</span><h3>{g.name}</h3><div className="glass-pills"><span>{g.best}</span><span>{g.when}</span></div><p>{g.why}</p>
                <div className="glass-tip"><strong>BEGINNER TIP</strong><span>If you only buy one style, choose a good universal glass. Add a sparkling or larger red glass later if you notice a real difference for the wines you drink most.</span></div>
              </div>)}
            </div>
          </div>
        </section>

        <section className="section style-section">
          <div className="section-head reveal"><div><span className="eyebrow">WINE ABOUT THE TYPES</span><h2>Choose your <em>glass.</em></h2></div><p>Four styles. Four moods. Zero need to memorize a textbook.</p></div>
          <div className="type-tabs">{Object.keys(typeData).map(k=><button key={k} className={type===k?"active":""} onClick={()=>setType(k)}><span>{typeData[k][1]}</span>{k}</button>)}</div>
          <div className="type-showcase reveal"><div className="type-number">0{Object.keys(typeData).indexOf(type)+1}</div><div><span className="eyebrow">THE QUICK TAKE</span><h3>{type}</h3><p>{typeData[type][0]}</p><div className="chips">{typeData[type][2].map(x=><span key={x}>{x}</span>)}</div></div><div className="type-symbol">{typeData[type][1]}</div></div>
        </section>

        <section className="section tasting" id="taste">
          <div className="taste-visual reveal"><div className="taste-ring ring-a"/><div className="taste-ring ring-b"/><div className="taste-core"><span>5 S's</span><strong>TASTE<br/>LIKE A<br/><em>PRO.</em></strong></div></div>
          <div className="taste-copy reveal"><span className="eyebrow">WINE ABOUT THE 5 S's</span><h2>Turn tasting into a <em>ritual.</em></h2><p>Professional tasting doesn't have to be intimidating. Five tiny steps make the whole experience more intentional.</p><div className="steps">{tastingSteps.map(([n,t,e,d])=><div className="step" key={n}><span>{n}</span><div><strong>{e} {t}</strong><p>{d}</p></div></div>)}</div></div>
        </section>

        <section className="section alphabet" id="alphabet">
          <div className="center reveal"><span className="eyebrow">WINE ABOUT THE ALPHABET</span><h2>From <em>Albariño</em> to Zinfandel.</h2><p>Two wines per letter. Click a wine's name to open its mini tasting card — description, notes, body and food pairings stay tucked away until you ask for them.</p><div className="voice-note">🔊 Click the speaker for pronunciation. Click the wine name for the full breakdown.</div></div>
          <div className="letters reveal">{Object.keys(wines).map(l=><button className={letter===l?"active":""} key={l} onClick={()=>{setLetter(l);setExpandedWine(null)}}>{l}</button>)}</div>
          <div className="wine-list stagger">
            {wines[letter].map((wine)=><article className={`wine-row ${expandedWine===wine.name?"expanded":""}`} key={wine.name}>
              <div className="wine-initial">{letter}</div>
              <div className="wine-main">
                <span className="wine-meta">{wine.style} · {wine.country}</span>
                <button className="wine-name-button" onClick={()=>setExpandedWine(expandedWine===wine.name?null:wine.name)} aria-expanded={expandedWine===wine.name}>
                  <h3>{wine.name}</h3><span>{expandedWine===wine.name?"−":"+"}</span>
                </button>
                <p>{wine.notes}</p>
                {expandedWine===wine.name && <div className="wine-detail">
                  <div className="detail-description"><span className="eyebrow">THE QUICK STORY</span><p>{wine.description}</p></div>
                  <div className="detail-grid">
                    <div><span>NOTES</span><b>{wine.notes}</b></div>
                    <div><span>BODY</span><b>{wine.body}</b></div>
                    <div><span>PAIR IT WITH</span><b>{wine.pairings}</b></div>
                  </div>
                </div>}
              </div>
              <SpeakButton name={wine.name} pronunciation={wine.pronunciation} locale={wine.locale}/>
            </article>)}
          </div>
        </section>

        <section className="section dark" id="pairing">
          <div className="section-head reveal"><div><span className="eyebrow">WINE ABOUT THE PAIRING</span><h2>Because wine shouldn't <em>fight your food.</em></h2></div><p>Pick a food. We'll point you in the right direction.</p></div>
          <div className="pair-tabs stagger">{Object.keys(pairingData).map(k=><button className={pairing===k?"active":""} key={k} onClick={()=>setPairing(k)}><span>{pairingData[k][0]}</span>{k}</button>)}</div>
          <div className="pair-result reveal"><div className="pair-icon">{pairingData[pairing][0]}</div><div><span className="eyebrow">YOUR MATCH</span><h3>{pairingData[pairing][1]}</h3><p>{pairingData[pairing][2]}</p></div><span className="pair-arrow">↗</span></div>
        </section>

        <section className="section world" id="world">
          <div className="world-copy reveal"><span className="eyebrow">WINE ABOUT THE WORLD</span><h2>Same drink.<br/><em>Different stories.</em></h2><p>Wine is shaped by climate, soil, tradition, and people. Explore a few of the world's best-known wine cultures.</p><div className="region-tabs">{Object.keys(regions).map(r=><button className={activeRegion===r?"active":""} key={r} onClick={()=>setActiveRegion(r)}>{r}</button>)}</div><div className="region-note"><strong>{activeRegion}</strong><span>{regions[activeRegion]}</span></div></div>
          <div className="world-art reveal"><div className="map-glow"/><div className="map-shape"/><div className="pin pin-a">🍇</div><div className="pin pin-b">🍇</div><div className="pin pin-c">🍇</div><div className="map-label">THE<br/><b>WINE</b><br/>WORLD</div></div>
        </section>

        <section className="section myths">
          <div className="center reveal"><span className="eyebrow">WINE ABOUT THE MYTHS</span><h2>Let's uncork some <em>nonsense.</em></h2></div>
          <div className="myth-grid stagger">
            {[["01","“Wine legs tell you if it's good.”","Those streaks mostly relate to alcohol, viscosity, and surface tension — not quality."],["02","“Screw caps mean cheap wine.”","Screw caps can protect wine from cork taint and preserve freshness."],["03","“You need to know wine to enjoy it.”","Absolutely not. Your favorite wine is the wine you actually enjoy drinking."]].map(([n,t,d])=><article className="myth" key={n}><span>MYTH {n}</span><h3>{t}</h3><p>{d}</p><b>FALSE ✕</b></article>)}
          </div>
        </section>

        <section className="section quiz-section" id="quiz">
          <div className="quiz-card reveal"><div className="quiz-copy"><span className="eyebrow">THE WINE VIBE CHECK</span><h2>Find the wine that fits <em>you.</em></h2><p>Three quick choices about taste, mood, and the moment. We turn them into a bottle direction — no personality-test theatrics required.</p><button className="magnetic light" onClick={()=>{setQuizStep(0);setQuizAnswers([]);setQuizResult(null);setQuizOpen(true)}}>Find my wine <span>↗</span></button></div><div className="quiz-vibe-grid"><div className="vibe-row"><span>01</span><strong>TASTE</strong><b>Sweet ↔ Dry</b></div><div className="vibe-row"><span>02</span><strong>MOOD</strong><b>Chill ↔ Bold</b></div><div className="vibe-row"><span>03</span><strong>MOMENT</strong><b>Dinner ↔ Party</b></div><div className="vibe-stamp">YOUR<br/><em>WINE</em><br/>DIRECTION</div></div></div>
        </section>
      </main>

      <footer><div className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 39c-2-8-2-14 1-20 2-4 5-7 10-10"/><path d="M25 30c-7-1-12-5-14-11 6-1 12 2 14 8"/><path d="M28 24c4-6 9-8 15-7-2 6-7 9-14 10"/><circle cx="18" cy="35" r="3"/><circle cx="24" cy="37" r="3"/><circle cx="30" cy="35" r="3"/><circle cx="24" cy="42" r="3"/></svg></span><span>Wine About It<small>WINE 101</small></span></div><p>Wine doesn't have to be complicated.</p><a href="#top">Back to top ↑</a></footer>

      {quizOpen && <div className="modal" onClick={(e)=>e.target===e.currentTarget&&setQuizOpen(false)}><div className="modal-box">{quizResult ? <><div className="result-emoji">{quizResult[1]}</div><span className="eyebrow">YOUR WINE VIBE</span><h2>{quizResult[0]}</h2><p>{quizResult[2]}</p><button className="magnetic primary" onClick={()=>{setQuizStep(0);setQuizAnswers([]);setQuizResult(null)}}>Again ↻</button></> : <><div className="quiz-progress">0{quizStep+1} / 03</div><h2>{quizQuestions[quizStep].q}</h2><div className="quiz-options">{quizQuestions[quizStep].a.map((a,i)=><button key={a} onClick={()=>chooseQuiz(i)}>{a}<span>↗</span></button>)}</div></>}<button className="modal-close" onClick={()=>setQuizOpen(false)}>×</button></div></div>}
    </div>
  );
}

export default App;
