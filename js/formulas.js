/* ============================================================
   formulas.js · §01 三时刻卡片 + §05 五幅推导小图
   全部为静态 Canvas 插图，i18n 切换时重绘（标签跟随语言）
   ============================================================ */
(function () {
  "use strict";

  const t = (k, p) => window.I18N.t(k, p);
  const C_A = "#b5371c", C_B = "#33566e", C_C = "#8a6d1f";
  const INK = "#211d16", SOFT = "#544c3c", FAINT = "#8d8471";
  const EN = '"EB Garamond",Georgia,serif';
  const CN = '"Zen Old Mincho","Noto Serif SC",serif';

  function ctx2x(canvas) {
    const w = canvas.width / 2, h = canvas.height / 2; /* HTML 属性已是 2 倍逻辑尺寸 */
    const ctx = canvas.getContext("2d");
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    return { ctx, w, h };
  }
  function line(ctx, pts, color, width, dash) {
    ctx.beginPath(); ctx.setLineDash(dash || []);
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color; ctx.lineWidth = width || 1; ctx.stroke(); ctx.setLineDash([]);
  }
  function label(ctx, s, x, y, color, size, align, font) {
    ctx.font = (size || 13) + "px " + (font || EN);
    ctx.fillStyle = color || SOFT; ctx.textAlign = align || "left"; ctx.fillText(s, x, y);
  }
  function dot(ctx, p, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.6; ctx.stroke(); }
  }
  function arcAt(ctx, p, p1, p2, r, color) {
    const a = Math.atan2(p1[1] - p[1], p1[0] - p[0]), b = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    const d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    ctx.beginPath(); ctx.arc(p[0], p[1], r, a, a + d, d < 0);
    ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.stroke();
  }

  /* ================= § 01 · 三时刻 ================= */
  function momentCard(id, mode) {
    const { ctx, w, h } = ctx2x(document.getElementById(id));
    const baseY = h * 0.78, topY = h * 0.3;
    let B, C, A;
    if (mode === "mid") { B = [w * 0.28, baseY]; C = [w * 0.72, baseY]; A = [w * 0.5, topY]; }
    else if (mode === "left") { B = [w * 0.62, baseY]; C = [w * 0.88, baseY]; A = [w * 0.06, topY]; }
    else { B = [w * 0.12, baseY]; C = [w * 0.38, baseY]; A = [w * 0.94, topY]; }

    line(ctx, [[6, baseY], [w - 6, baseY]], "#cbbfa4");
    line(ctx, [[6, topY], [w - 6, topY]], "#5b7d94", 1.2, [6, 6]);
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.06)"; ctx.fill();
    line(ctx, [B, A, C], SOFT, 1.8);
    line(ctx, [B, C], INK, 2.6);

    const big = mode === "mid";
    arcAt(ctx, A, B, C, 16, C_A);
    arcAt(ctx, B, A, C, mode === "left" ? 30 : 14, C_B);
    arcAt(ctx, C, B, A, mode === "right" ? 30 : 14, C_C);
    dot(ctx, A, 5, C_A, "#efe8d4"); dot(ctx, B, 3.5, C_B, "#efe8d4"); dot(ctx, C, 3.5, C_C, "#efe8d4");

    label(ctx, "A", A[0] + (mode === "left" ? -14 : 12), A[1] - 8, C_A, 14);
    label(ctx, "B", B[0] - 6, B[1] + 20, C_B, 13, "right");
    label(ctx, "C", C[0] + 8, C[1] + 20, C_C, 13);

    const trip = mode === "mid" ? ["53°", "63°", "63°"] : mode === "left" ? ["0°", "180°", "0°"] : ["0°", "0°", "180°"];
    const dim = mode !== "mid";
    label(ctx, trip[0], A[0] + (mode === "left" ? -14 : 12), A[1] - 24, dim ? FAINT : C_A, 12);
    label(ctx, trip[1], B[0] - 4, B[1] + 36, dim ? FAINT : C_B, 12, "right");
    label(ctx, trip[2], C[0] + 4, C[1] + 36, dim ? FAINT : C_C, 12);
    if (!big) {
      const dir = mode === "left" ? "−∞" : "+∞";
      label(ctx, "A → " + dir, mode === "left" ? w - 16 : 16, topY - 10, FAINT, 12, mode === "left" ? "right" : "left", EN);
    }
  }

  /* ================= § 05 · 五幅推导小图 ================= */
  function fxCartesian() {
    const { ctx, w, h } = ctx2x(document.getElementById("fxCartesian"));
    const O = [w * 0.14, h * 0.8], X = w * 0.9, Y = h * 0.12;
    line(ctx, [O, [X, O[1]]], "#cbbfa4", 1);
    line(ctx, [O, [O[0], Y]], "#cbbfa4", 1);
    const B = O, C = [w * 0.72, O[1]], A = [w * 0.46, h * 0.32], F = [A[0], O[1]];
    line(ctx, [[O[0], A[1]], [X - 8, A[1]]], "#5b7d94", 1.2, [5, 5]);
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.06)"; ctx.fill();
    line(ctx, [B, A, C], SOFT, 1.8);
    line(ctx, [B, C], INK, 2.6);
    line(ctx, [A, F], FAINT, 1, [3, 4]);
    line(ctx, [[F[0] + 7, F[1]], [F[0] + 7, F[1] - 7], [F[0], F[1] - 7]], "#a9a08a", 1);
    dot(ctx, A, 5, C_A, "#efe8d4"); dot(ctx, B, 3.5, C_B, "#efe8d4"); dot(ctx, C, 3.5, C_C, "#efe8d4");
    label(ctx, "A (t, h)", A[0] + 10, A[1] - 8, C_A, 13);
    label(ctx, "B (0, 0)", B[0] - 6, B[1] + 18, C_B, 12.5, "right");
    label(ctx, "C (a, 0)", C[0] + 8, C[1] + 18, C_C, 12.5);
    label(ctx, "y = h", X - 14, A[1] - 8, "#5b7d94", 12, "right");
    label(ctx, "t", (O[0] + F[0]) / 2, O[1] + 16, FAINT, 12, "center");
    label(ctx, "a", (B[0] + C[0]) / 2, O[1] + 30, INK, 12, "center");
  }

  function fxAngles() {
    const { ctx, w, h } = ctx2x(document.getElementById("fxAngles"));
    const B = [w * 0.12, h * 0.78], C = [w * 0.88, h * 0.78], A = [w * 0.55, h * 0.28], F = [A[0], B[1]];
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.05)"; ctx.fill();
    line(ctx, [B, A, C], SOFT, 1.8);
    line(ctx, [B, C], INK, 2.4);
    line(ctx, [A, F], FAINT, 1, [3, 4]);
    arcAt(ctx, B, A, C, 26, C_B); arcAt(ctx, C, B, A, 22, C_C); arcAt(ctx, A, B, C, 15, C_A);
    dot(ctx, A, 4.5, C_A, "#efe8d4"); dot(ctx, B, 3.5, C_B, "#efe8d4"); dot(ctx, C, 3.5, C_C, "#efe8d4");
    label(ctx, "A", A[0] + 10, A[1] - 8, C_A, 13);
    label(ctx, "B", B[0] - 4, B[1] + 18, C_B, 12.5, "right");
    label(ctx, "C", C[0] + 8, C[1] + 18, C_C, 12.5);
    label(ctx, "h", F[0] + 10, (A[1] + F[1]) / 2, C_A, 13);
    label(ctx, "t", (B[0] + F[0]) / 2, B[1] + 16, C_B, 12.5, "center");
    label(ctx, "a − t", (F[0] + C[0]) / 2, C[1] + 16, C_C, 12.5, "center");
    label(ctx, "∠B = atan2(h, t)", w / 2, h * 0.14, C_B, 13.5, "center");
  }

  function fxSimplex() {
    const { ctx, w, h } = ctx2x(document.getElementById("fxSimplex"));
    const cxy = [w / 2, h * 0.56], R = Math.min(w, h) * 0.36;
    const V = [
      [cxy[0], cxy[1] - R],
      [cxy[0] - R * 0.87, cxy[1] + R * 0.5],
      [cxy[0] + R * 0.87, cxy[1] + R * 0.5],
    ];
    /* 单纯形边界 */
    ctx.beginPath(); V.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.045)"; ctx.fill();
    ctx.strokeStyle = "#b7ab8d"; ctx.lineWidth = 1.4; ctx.stroke();
    for (let g = 30; g < 180; g += 30) {
      const f = g / 180;
      const lerp = (p, q) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      line(ctx, [lerp(V[0], V[1]), lerp(V[0], V[2])], "rgba(33,29,22,.07)");
      line(ctx, [lerp(V[1], V[0]), lerp(V[1], V[2])], "rgba(33,29,22,.07)");
      line(ctx, [lerp(V[2], V[0]), lerp(V[2], V[1])], "rgba(33,29,22,.07)");
    }
    /* 轨迹曲线（a = h = 1） */
    const bary = (q) => {
      const s = q[0] + q[1] + q[2];
      const u = [q[0] / s, q[1] / s, q[2] / s];
      return [u[0] * V[0][0] + u[1] * V[1][0] + u[2] * V[2][0], u[0] * V[0][1] + u[1] * V[1][1] + u[2] * V[2][1]];
    };
    const fromXY = window.TriangleSolver.triangleFromXY;
    const traj = [[0, 180, 0]];
    for (let i = 1; i < 200; i++) {
      const tt = 0.5 + Math.tan((i / 200 - 0.5) * Math.PI);
      const r = fromXY(1, tt, 1);
      if (r) traj.push([r.A, r.B, r.C]);
    }
    traj.push([0, 0, 180]);
    line(ctx, traj.map(bary), "#b5371c", 2);
    dot(ctx, bary([0, 180, 0]), 4, "#efe8d4", "#b5371c");
    dot(ctx, bary([0, 0, 180]), 4, "#efe8d4", "#b5371c");
    const mid = fromXY(1, 0.5, 1);
    const P = bary(mid ? [mid.A, mid.B, mid.C] : [60, 60, 60]);
    dot(ctx, P, 4.5, "#211d16");
    label(ctx, "(0,180,0)", V[1][0] - 6, V[1][1] + 18, FAINT, 11.5, "left");
    label(ctx, "(0,0,180)", V[2][0] + 6, V[2][1] + 18, FAINT, 11.5, "right");
    label(ctx, "(180,0,0)", V[0][0], V[0][1] - 12, FAINT, 11.5, "center");
    label(ctx, "P", P[0] + 9, P[1] + 4, INK, 12.5);
  }

  function fxSine() {
    const { ctx, w, h } = ctx2x(document.getElementById("fxSine"));
    const O = [w / 2, h * 0.54], R = Math.min(w, h) * 0.36;
    ctx.beginPath(); ctx.arc(O[0], O[1], R, 0, Math.PI * 2);
    ctx.strokeStyle = "#b7ab8d"; ctx.lineWidth = 1.4; ctx.stroke();
    const ang = [-Math.PI / 2, Math.PI * 0.31, Math.PI * 0.79];
    const V = ang.map((a) => [O[0] + R * Math.cos(a), O[1] + R * Math.sin(a)]);
    const [A, B, C] = V;
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.055)"; ctx.fill();
    line(ctx, [A, B, C, A], SOFT, 1.8);
    line(ctx, [O, [O[0] + R * Math.cos(-0.1), O[1] + R * Math.sin(-0.1)]], FAINT, 1, [3, 4]);
    label(ctx, "2R", O[0] + R * 0.52, O[1] - 8, FAINT, 12);
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    label(ctx, "a", mid(B, C)[0], mid(B, C)[1] + 16, INK, 13, "center");
    label(ctx, "b", mid(C, A)[0] + 12, mid(C, A)[1], C_B, 13);
    label(ctx, "c", mid(A, B)[0] - 12, mid(A, B)[1], C_C, 13, "right");
    dot(ctx, A, 4.5, C_A, "#efe8d4"); dot(ctx, B, 3.5, C_B, "#efe8d4"); dot(ctx, C, 3.5, C_C, "#efe8d4");
    label(ctx, "A", A[0], A[1] - 10, C_A, 12.5, "center");
    label(ctx, "B", B[0] - 8, B[1] + 16, C_B, 12.5);
    label(ctx, "C", C[0] + 8, C[1] + 16, C_C, 12.5);
  }

  function fxHeron() {
    const { ctx, w, h } = ctx2x(document.getElementById("fxHeron"));
    const B = [w * 0.14, h * 0.76], C = [w * 0.86, h * 0.76], A = [w * 0.5, h * 0.3], F = [A[0], B[1]];
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(181,55,28,.06)"; ctx.fill();
    line(ctx, [B, A, C], SOFT, 1.8);
    line(ctx, [B, C], INK, 2.4);
    line(ctx, [A, F], C_A, 1.2, [4, 4]);
    line(ctx, [[F[0] + 7, F[1]], [F[0] + 7, F[1] - 7], [F[0], F[1] - 7]], "#a9a08a", 1);
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    label(ctx, "a", mid(B, C)[0], B[1] + 20, INK, 13, "center");
    label(ctx, "b", mid(C, A)[0] + 14, mid(C, A)[1] + 4, C_B, 13);
    label(ctx, "c", mid(A, B)[0] - 14, mid(A, B)[1] + 4, C_C, 13, "right");
    label(ctx, "h", F[0] + 10, (A[1] + F[1]) / 2, C_A, 13);
    label(ctx, "S = a·h / 2", w / 2, h * 0.14, C_A, 13.5, "center");
    dot(ctx, A, 4.5, C_A, "#efe8d4"); dot(ctx, B, 3.5, C_B, "#efe8d4"); dot(ctx, C, 3.5, C_C, "#efe8d4");
  }

  function drawAll() {
    momentCard("cardLeft", "left");
    momentCard("cardMid", "mid");
    momentCard("cardRight", "right");
    fxCartesian(); fxAngles(); fxSimplex(); fxSine(); fxHeron();
  }
  document.addEventListener("i18n:change", drawAll);
  drawAll();
})();
