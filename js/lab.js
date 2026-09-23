/* ============================================================
   lab.js · §02 平行线实验台 + §03 角度空间
   两个视图共享同一个三角形状态（LAB.state）：
     base, height —— 底边与高
     t            —— A 的横坐标（自由参数）
     limit        —— 0 有限 / −1、+1 无穷远极限
   求解台（§04）也写这份状态，三视图联动。
   ============================================================ */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const t = (k, p) => window.I18N.t(k, p);
  const fromXY = window.TriangleSolver.triangleFromXY;

  /* ---- 三角色彩：∠A 朱 / ∠B 藍 / ∠C 金 ---- */
  const C_A = "#b5371c", C_B = "#33566e", C_C = "#8a6d1f";
  const D_A = "#e8724f", D_B = "#8fb3cc", D_C = "#d3ac5e";   /* 暗色区变体 */
  const INK = "#211d16", INK_SOFT = "#544c3c", INK_FAINT = "#8d8471";
  const NIGHT_INK = "#e9e0cb";

  const state = {
    base: 1, height: 1, t: 0.5, limit: 0,
    center: 0.25, scale: 160,
    speed: 1, playing: false, phase: 0,
    view: { yaw: 0.75, pitch: 0.52, zoom: 1 },
    drag: null, spin: null, last: 0,
  };

  /* ---------- 画布与工具 ---------- */
  const bench = $("benchCanvas"), bctx = bench.getContext("2d");
  const space = $("spaceCanvas"), sctx = space.getContext("2d");
  const solver = $("solverCanvas"), vctx = solver.getContext("2d");
  let bw = 0, bh = 0, sw = 0, sh = 0, vw = 0, vh = 0;

  function setup(canvas, ctx) {
    const rect = canvas.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, rect.width * d); canvas.height = Math.max(1, rect.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    return [rect.width, rect.height];
  }
  function line(ctx, pts, color, width = 1, dash = []) {
    ctx.beginPath(); ctx.setLineDash(dash);
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
  }
  function text(ctx, label, x, y, color, size, align, font) {
    ctx.font = size + "px " + (font || '"EB Garamond",Georgia,serif');
    ctx.fillStyle = color; ctx.textAlign = align || "left"; ctx.fillText(label, x, y);
  }
  const cn = (s) => '"Zen Old Mincho","Noto Serif SC",serif';
  function dot(ctx, p, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function arc(ctx, p, p1, p2, r, color) {
    const a = Math.atan2(p1[1] - p[1], p1[0] - p[0]), b = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    const delta = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.arc(p[0], p[1], r, a, a + delta, delta < 0); ctx.closePath();
    ctx.fillStyle = color + "1f"; ctx.fill();
    ctx.beginPath(); ctx.arc(p[0], p[1], r, a, a + delta, delta < 0);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }

  /* ---------- 数值格式化 ---------- */
  function num(v) {
    if (!Number.isFinite(v)) return "—";
    if (v === 0) return "0";
    if (Math.abs(v) >= 1e6 || Math.abs(v) < 1e-5) return v.toExponential(5);
    return String(Number(v.toFixed(6)));
  }
  function deg(v, places = 3) {
    if (v !== 0 && Math.abs(v) < 10 ** -places) return v.toExponential(2) + "°";
    return v.toFixed(places) + "°";
  }
  function anglesAt(tt) {
    const r = fromXY(state.base, tt, state.height);
    return r ? [r.A, r.B, r.C] : [0, 0, 180];
  }
  function currentAngles() {
    if (state.limit) return state.limit < 0 ? [0, 180, 0] : [0, 0, 180];
    return anglesAt(state.t);
  }

  /* ---------- 取景 ---------- */
  function fit() {
    const l = Math.min(0, state.t), r = Math.max(state.base, state.t);
    state.center = l / 2 + r / 2;
    state.scale = Math.min((bw - 130) / Math.max(2.6 * state.base, r - l), (bh * 0.47) / state.height);
  }
  function stop() {
    state.playing = false;
    $("benchPlay").innerHTML = t("bench.btn.play");
  }
  function setT(v, limit = 0, adapt = true) {
    if (!limit && !Number.isFinite(v)) return;
    state.t = limit ? state.base / 2 + limit * 8 * Math.max(state.base, state.height) : v;
    state.limit = limit;
    state.valid = true; /* 实验台交互总能给出有效三角形，清除求解器留下的无效标记 */
    if (adapt && $("autoFit").checked) fit();
    update(); drawAll();
  }

  /* ---------- §02 平面视图（也用于 §04 预览） ---------- */
  /* 坐标映射必须基于「当前绘制的目标画布」尺寸，两个画布各自传入 */
  function makeXY(w, h) {
    return (x, y) => [(x - state.center) * state.scale + w / 2, h * 0.76 - y * state.scale];
  }
  function drawGeometry(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    const xy = makeXY(w, h);
    const aid = state.scale * Math.min(state.base, state.height) > 25 && $("showAids").checked;
    const B = xy(0, 0), Cp = xy(state.base, 0), A = xy(state.t, state.height), F = xy(state.t, 0);
    const top = xy(0, state.height)[1];

    /* 基准线与平行线 */
    line(ctx, [[0, B[1]], [w, B[1]]], "#cbbfa4");
    line(ctx, [[0, top], [w, top]], "#5b7d94", 1.3, [6, 6]);
    text(ctx, t("bench.canvas.parallel", { h: num(state.height) }), 18, Math.max(25, top - 14), "#5b7d94", 12, "left", cn());
    text(ctx, "←", 8, top + 4, "#5b7d94", 12);
    text(ctx, "→", w - 19, top + 4, "#5b7d94", 12);

    if (state.limit) {
      text(ctx, t(state.limit < 0 ? "bench.canvas.leftInf" : "bench.canvas.rightInf"), w / 2, h * 0.42, C_A, 20, "center", cn());
      text(ctx, t("bench.canvas.noFinite"), w / 2, h * 0.42 + 30, INK_FAINT, 13, "center", cn());
      const end = [state.limit < 0 ? -1000 : w + 1000, top];
      line(ctx, [B, end, Cp], "#8c9fc2", 2, [5, 6]);
    } else {
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(Cp[0], Cp[1]); ctx.closePath();
      ctx.fillStyle = "rgba(33,29,22,.055)"; ctx.fill();
      line(ctx, [B, A, Cp], INK_SOFT, 2);
      if (aid) {
        line(ctx, [A, F], "#9a917c", 1, [4, 4]);
        line(ctx, [[F[0] + 8, F[1]], [F[0] + 8, F[1] - 8], [F[0], F[1] - 8]], "#a9a08a");
        text(ctx, t("bench.canvas.hLabel", { v: num(state.height) }), F[0] + 11, (A[1] + F[1]) / 2, INK_FAINT, 12);
        const rr = Math.min(31, state.scale * Math.min(state.base, state.height) * 0.2);
        arc(ctx, A, B, Cp, rr, C_A);
        arc(ctx, B, A, Cp, Math.max(16, rr * 0.9), C_B);
        arc(ctx, Cp, B, A, Math.max(16, rr * 0.9), C_C);
      }
      if (A[0] > -20 && A[0] < w + 20) {
        dot(ctx, A, 15, "rgba(181,55,28,.09)");
        dot(ctx, A, 7, C_A, "#f4efe3");
        text(ctx, "A", A[0] + 14, A[1] - 10, C_A, 17);
        text(ctx, "(" + num(state.t) + ", " + num(state.height) + ")", A[0], A[1] - 26, C_A, 12, "center");
      } else {
        const side = A[0] < 0 ? 18 : w - 18;
        dot(ctx, [side, top], 7, C_A);
        text(ctx, t(A[0] < 0 ? "bench.canvas.offscreenL" : "bench.canvas.offscreenR"), side, top - 16, C_A, 12, A[0] < 0 ? "left" : "right", cn());
      }
    }

    line(ctx, [B, Cp], INK, 3);
    dot(ctx, B, 4.5, C_B, "#f4efe3");
    dot(ctx, Cp, 4.5, C_C, "#f4efe3");
    if (state.scale * state.base > 55) {
      text(ctx, "B (0, 0)", B[0] - 9, B[1] + 24, C_B, 13, "right");
      text(ctx, "C (" + num(state.base) + ", 0)", Cp[0] + 9, Cp[1] + 24, C_C, 13);
      text(ctx, "a = " + num(state.base), (B[0] + Cp[0]) / 2, B[1] + 24, INK_SOFT, 12, "center");
    } else {
      text(ctx, "B · C   a = " + num(state.base), (B[0] + Cp[0]) / 2, B[1] + 28, INK_SOFT, 12, "center");
    }
  }

  function drawBench() {
    bctx.clearRect(0, 0, bw, bh);
    if (state.valid === false) {
      text(bctx, t("solver.canvas.wait"), bw / 2, bh / 2, INK_FAINT, 17, "center", cn());
      return;
    }
    drawGeometry(bctx, bw, bh);
    text(bctx, "t = " + (state.limit ? (state.limit < 0 ? "−∞" : "+∞") : num(state.t)), 18, bh - 10, INK_FAINT, 12);
  }

  /* ---------- §03 角度空间（暗色） ---------- */
  function project(p) {
    const a = p[0] - 60, b = p[1] - 60, c = p[2] - 60;
    const x = a * Math.cos(state.view.yaw) - b * Math.sin(state.view.yaw);
    const depth = a * Math.sin(state.view.yaw) + b * Math.cos(state.view.yaw);
    const y = c * Math.cos(state.view.pitch) - depth * Math.sin(state.view.pitch);
    const k = Math.min(sw / 450, sh / 370) * state.view.zoom;
    return [sw / 2 + x * k, sh * 0.57 - y * k];
  }
  const worldLine = (ctx, pts, color, width, dash) => line(ctx, pts.map(project), color, width, dash);

  function drawSpace() {
    const ctx = sctx;
    ctx.clearRect(0, 0, sw, sh);
    const axes = [D_A, D_B, D_C];

    /* 约束平面（单纯形截面） */
    if ($("showPlane").checked) {
      const ps = [[180, 0, 0], [0, 180, 0], [0, 0, 180]].map(project);
      ctx.beginPath(); ps.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fillStyle = "rgba(233,224,203,.055)"; ctx.fill();
      ctx.strokeStyle = "rgba(233,224,203,.3)"; ctx.lineWidth = 1; ctx.stroke();
      for (let g = 30; g < 180; g += 30) {
        worldLine(ctx, [[g, 0, 180 - g], [g, 180 - g, 0]], "rgba(233,224,203,.09)");
        worldLine(ctx, [[0, g, 180 - g], [180 - g, g, 0]], "rgba(233,224,203,.09)");
        worldLine(ctx, [[0, 180 - g, g], [180 - g, 0, g]], "rgba(233,224,203,.09)");
      }
    }

    /* 三根轴与刻度 */
    if ($("showAxes").checked) {
      const names = ["∠A", "∠B", "∠C"];
      for (let ax = 0; ax < 3; ax++) {
        const p = [0, 0, 0]; p[ax] = 202;
        worldLine(ctx, [[0, 0, 0], p], axes[ax], 1.7);
        const l = project(p);
        text(ctx, names[ax], l[0], l[1] + (ax === 2 ? -10 : 20), axes[ax], 15, "center", cn());
        for (let v = 45; v <= 180; v += 45) {
          const q = [0, 0, 0]; q[ax] = v;
          const pos = project(q);
          dot(ctx, pos, 2, axes[ax]);
          text(ctx, String(v), pos[0] + (ax === 2 ? 9 : 0), pos[1] + (ax === 2 ? 4 : 15), "rgba(233,224,203,.5)", 10, ax === 2 ? "left" : "center");
        }
      }
      const o = project([0, 0, 0]);
      text(ctx, "0", o[0], o[1] + 16, "rgba(233,224,203,.5)", 11, "center");
    }

    /* 轨迹曲线 */
    if ($("showCurve").checked) {
      const traj = [[0, 180, 0]];
      for (let i = 1; i < 600; i++) {
        const tt = state.base / 2 + Math.max(state.base, state.height) * Math.tan((i / 600 - 0.5) * Math.PI);
        traj.push(anglesAt(tt));
      }
      traj.push([0, 0, 180]);
      worldLine(ctx, traj, "#e86a4a", 2.5);
      for (const e of [[0, 180, 0], [0, 0, 180]]) dot(ctx, project(e), 5, "#201c14", "#e86a4a");
    }

    /* 当前点 P */
    const q = currentAngles(), P = project(q);
    for (let ax = 0; ax < 3; ax++) {
      const foot = [0, 0, 0]; foot[ax] = q[ax];
      worldLine(ctx, [q, foot], axes[ax] + "55", 1, [3, 5]);
    }
    dot(ctx, P, 13, "rgba(233,224,203,.1)");
    dot(ctx, P, 6, NIGHT_INK, "#e86a4a");
    text(ctx, state.limit ? "P →" : "P", P[0] + 13, P[1] - 10, NIGHT_INK, 15);
  }

  function drawSolverPreview() {
    vctx.clearRect(0, 0, vw, vh);
    if (state.valid === false) {
      text(vctx, t("solver.canvas.wait"), vw / 2, vh / 2, INK_FAINT, 17, "center", cn());
      return;
    }
    drawGeometry(vctx, vw, vh);
  }

  function drawAll() {
    drawBench(); drawSpace(); drawSolverPreview();
  }

  /* ---------- 面板刷新 ---------- */
  function update() {
    const q = state.valid === false ? [0, 0, 0] : currentAngles();
    const ids = ["mA", "mB", "mC"], fills = ["fillA", "fillB", "fillC"];
    q.forEach((v, i) => {
      $(ids[i]).textContent = state.valid === false ? "—" : (state.limit ? "→ " : "") + deg(v);
      $(fills[i]).style.width = (v / 180 * 100) + "%";
    });
    const max = Math.max(...q);
    const equal = q.some((v, i) => q.some((w, j) => i !== j && Math.abs(v - w) < 1e-7));
    let st;
    if (state.valid === false) st = "";
    else if (state.limit) st = "status.degenerate";
    else if (Math.abs(max - 90) < 1e-7) st = "status.right";
    else if (equal) st = "status.isosceles";
    else if (max > 90) st = "status.obtuse";
    else st = "status.acute";
    $("benchStatus").textContent = st ? t(st) : "";

    if (document.activeElement !== $("tInput"))
      $("tInput").value = state.limit ? (state.limit < 0 ? "-∞" : "+∞") : String(Number(state.t.toFixed(6)));
    $("tOut").textContent = state.limit ? (state.limit < 0 ? "−∞" : "+∞") : num(state.t);
    if (document.activeElement !== $("navRange"))
      $("navRange").value = String(state.limit ? state.limit * 1000 : Math.atan((state.t - state.base / 2) / Math.max(state.base, state.height)) * 2000 / Math.PI);

    $("spacePoint").innerHTML = "P = (" +
      '<span class="c-a">' + deg(q[0]) + "</span>, " +
      '<span class="c-b">' + deg(q[1]) + "</span>, " +
      '<span class="c-c">' + deg(q[2]) + "</span>)";
    const sum = state.valid === false ? 0 : q[0] + q[1] + q[2];
    $("spaceSum").textContent = state.valid === false ? "—" : sum.toFixed(3) + "°";
  }

  /* ---------- 交互：§02 ---------- */
  const local = (e, c) => {
    const r = c.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  $("baseRange").addEventListener("input", () => {
    stop();
    const ratio = state.limit ? 0 : state.t / state.base;
    state.base = Number($("baseRange").value);
    state.limit = 0;
    state.t = ratio * state.base; /* 保持相对位置 */
    $("baseOut").textContent = state.base.toFixed(2);
    if ($("autoFit").checked) fit();
    update(); drawAll();
  });
  $("heightRange").addEventListener("input", () => {
    stop(); state.height = Number($("heightRange").value);
    $("heightOut").textContent = state.height.toFixed(2);
    if ($("autoFit").checked) fit();
    update(); drawAll();
  });
  $("speedRange").addEventListener("input", () => {
    state.speed = Number($("speedRange").value);
    $("speedOut").textContent = state.speed.toFixed(1) + "×";
  });

  $("tForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("tInput").value.trim().replace(/−/g, "-");
    if (/^\+?∞$|^\+?infinity$/i.test(v)) { stop(); setT(0, 1); $("tError").textContent = ""; }
    else if (/^-∞$|^-infinity$/i.test(v)) { stop(); setT(0, -1); $("tError").textContent = ""; }
    else if (v !== "" && Number.isFinite(Number(v))) { stop(); setT(Number(v)); $("tError").textContent = ""; }
    else $("tError").textContent = t("bench.err.t");
  });
  $("navRange").addEventListener("input", () => {
    stop();
    const v = Number($("navRange").value);
    if (Math.abs(v) === 1000) setT(0, Math.sign(v));
    else setT(state.base / 2 + Math.max(state.base, state.height) * Math.tan((v * Math.PI) / 2000));
  });
  $("tNegInf").onclick = () => { stop(); setT(0, -1); };
  $("tPosInf").onclick = () => { stop(); setT(0, 1); };
  $("tMid").onclick = () => { stop(); setT(state.base / 2); };
  $("benchReset").onclick = () => {
    stop(); state.base = 1; state.height = 1;
    $("baseRange").value = "1"; $("heightRange").value = "1";
    $("baseOut").textContent = "1.00"; $("heightOut").textContent = "1.00";
    $("tError").textContent = "";
    setT(state.base / 2);
  };
  $("benchPlay").onclick = () => {
    if (state.playing) { stop(); return; }
    state.phase = Math.atan(((state.limit ? state.base / 2 : state.t) - state.base / 2) / Math.max(state.base, state.height));
    state.playing = true; state.limit = 0;
    $("benchPlay").innerHTML = t("bench.btn.pause");
  };

  bench.addEventListener("pointerdown", (e) => {
    stop();
    const xyBench = makeXY(bw, bh);
    const p = local(e, bench), A = xyBench(state.t, state.height);
    const onLine = Math.abs(p[1] - A[1]) < 25;
    state.drag = { kind: onLine ? "a" : "pan", px: p[0], prev: p[0] };
    bench.setPointerCapture(e.pointerId);
    bench.classList.add("is-grabbing");
    if (onLine) {
      state.limit = 0;
      const v = state.center + (p[0] - bw / 2) / state.scale;
      if (Number.isFinite(v)) setT(v, 0, false);
    }
  });
  bench.addEventListener("pointermove", (e) => {
    if (!state.drag) return;
    const p = local(e, bench);
    state.drag.px = p[0];
    if (state.drag.kind === "pan") {
      const v = state.center - (p[0] - state.drag.prev) / state.scale;
      if (Number.isFinite(v)) state.center = v;
      drawBench();
    } else {
      const v = state.center + (p[0] - bw / 2) / state.scale;
      if (Number.isFinite(v)) setT(v, 0, false);
    }
    state.drag.prev = p[0];
  });
  const endDrag = () => {
    if (!state.drag) return;
    const movedA = state.drag.kind === "a";
    state.drag = null;
    bench.classList.remove("is-grabbing");
    if (movedA && $("autoFit").checked) fit();
    drawAll();
  };
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) bench.addEventListener(ev, endDrag);
  bench.addEventListener("wheel", (e) => {
    e.preventDefault();
    state.scale = Math.max(1e-306, Math.min((bh * 0.65) / state.height, state.scale * Math.exp(-e.deltaY * 0.001)));
    drawBench(); drawSolverPreview();
  }, { passive: false });
  bench.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault(); stop();
    const step = Math.max(state.base * 0.01, Math.abs(state.t) * 0.025) * (e.shiftKey ? 10 : 1);
    setT(state.t + (e.key === "ArrowLeft" ? -step : step));
  });

  /* ---------- 交互：§03 ---------- */
  $("spaceReset").onclick = () => { state.view = { yaw: 0.75, pitch: 0.52, zoom: 1 }; drawSpace(); };
  for (const id of ["showPlane", "showCurve", "showAxes"]) $(id).addEventListener("change", drawSpace);
  space.addEventListener("pointerdown", (e) => {
    state.spin = local(e, space);
    space.setPointerCapture(e.pointerId);
    space.classList.add("is-grabbing");
  });
  space.addEventListener("pointermove", (e) => {
    if (!state.spin) return;
    const p = local(e, space);
    state.view.yaw -= (p[0] - state.spin[0]) * 0.008;
    state.view.pitch = Math.max(-1.35, Math.min(1.35, state.view.pitch + (p[1] - state.spin[1]) * 0.007));
    state.spin = p; drawSpace();
  });
  const endSpin = () => { state.spin = null; space.classList.remove("is-grabbing"); };
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) space.addEventListener(ev, endSpin);
  space.addEventListener("wheel", (e) => {
    e.preventDefault();
    state.view.zoom = Math.max(0.55, Math.min(2, state.view.zoom * Math.exp(-e.deltaY * 0.001)));
    drawSpace();
  }, { passive: false });
  space.addEventListener("keydown", (e) => {
    if (!e.key.startsWith("Arrow")) return;
    e.preventDefault();
    if (e.key === "ArrowLeft") state.view.yaw += 0.1;
    if (e.key === "ArrowRight") state.view.yaw -= 0.1;
    if (e.key === "ArrowUp") state.view.pitch = Math.min(1.35, state.view.pitch + 0.1);
    if (e.key === "ArrowDown") state.view.pitch = Math.max(-1.35, state.view.pitch - 0.1);
    drawSpace();
  });

  /* ---------- 帧循环：巡游动画 / 拖到边缘滑向无穷 / 自转 ---------- */
  function frame(now) {
    const dt = Math.min(50, now - state.last); state.last = now;
    if (state.playing) {
      state.phase += (dt * 0.00019) * state.speed;
      if (state.phase >= Math.PI / 2 - 0.006) state.phase = -Math.PI / 2 + 0.006;
      setT(state.base / 2 + Math.max(state.base, state.height) * Math.tan(state.phase), 0, false);
    }
    if (state.drag && state.drag.kind === "a") {
      const edge = state.drag.px < 42 ? state.drag.px - 42 : state.drag.px > bw - 42 ? state.drag.px - (bw - 42) : 0;
      if (edge) {
        const c = state.center + (edge * dt * 0.012) / state.scale;
        if (Number.isFinite(c)) {
          state.center = c;
          state.scale = Math.max(1e-306, state.scale * Math.exp(-dt * 0.0005));
          const v = state.center + (state.drag.px - bw / 2) / state.scale;
          if (Number.isFinite(v)) setT(v, 0, false);
        }
      }
    }
    if ($("autoSpin").checked && !state.spin) { state.view.yaw += dt * 0.00006; drawSpace(); }
    requestAnimationFrame(frame);
  }

  /* ---------- 尺寸 / 语言 ---------- */
  function resize() {
    [bw, bh] = setup(bench, bctx);
    [sw, sh] = setup(space, sctx);
    [vw, vh] = setup(solver, vctx);
    if ($("autoFit").checked) fit();
    drawAll();
  }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  document.addEventListener("i18n:change", () => {
    if (state.playing) $("benchPlay").innerHTML = t("bench.btn.pause");
    update(); drawAll();
  });

  /* ---------- 对外接口（§04 求解台联动） ---------- */
  window.LAB = {
    state,
    fit, setT, update, drawAll, drawSolverPreview,
    anglesAt, currentAngles, num, deg, drawGeometry, setup,
  };

  resize(); update();
  requestAnimationFrame(frame);
})();
