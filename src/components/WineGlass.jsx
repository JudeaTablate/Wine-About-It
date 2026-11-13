import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WineGlass({ fill, rotation, setRotation, onWheel, tint = "#74152e", label }) {
  const matsRef = useRef(null);
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

    matsRef.current = { wineMat, wineTopMat };

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
    const m = matsRef.current;
    if (!m) return;
    const c = new THREE.Color(tint);
    m.wineMat.color.copy(c);
    m.wineTopMat.color.copy(c.clone().offsetHSL(0, 0, 0.08));
    const clear = c.getHSL({}).l > 0.5;
    m.wineMat.transparent = clear; m.wineMat.opacity = clear ? 0.86 : 1;
    m.wineMat.needsUpdate = true;
  }, [tint]);

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
      tabIndex={0}
      aria-label={label || "Interactive 3D wine glass. Drag or use the left and right arrow keys to turn it. Up and down arrows change the wine level."}
      onKeyDown={(e)=>{if(e.key==="ArrowLeft")setRotation(r=>({...r,y:r.y-10}));if(e.key==="ArrowRight")setRotation(r=>({...r,y:r.y+10}));}}
    />
  );
}

