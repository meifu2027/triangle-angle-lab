/* ============================================================
   main.js · 英雄区动画（缓慢巡游的顶点）+ 滚动渐显
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 滚动渐显 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 英雄区：底边固定，A 缓慢巡游 ---------- */
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const C_A = "#b5371c", C_B = "#33566e", C_C = "#8a6d1f";
  const SOFT = "rgba(84,76,60,", FAINT = "rgba(141,132,113,";
  const EN = '"EB Garamond",Georgia,serif';
  let W = 0, H = 0, innerBottom = 0, visible = true, phase = -0.9;

  function resize() {
    const d = window.devicePixelRatio || 1;
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * d; canvas.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const inner = document.querySelector(".hero-inner");
    /* 文档坐标（hero 在页首），与滚动无关 */
    innerBottom = inner ? inner.offsetTop + inner.offsetHeight : H * 0.6;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawHero() {
    ctx.clearRect(0, 0, W, H);
    /* 场景条带钉在文字块下方，像制图纸上的地平线，任何视口都不与文字重叠 */
    const a = Math.max(W * 0.34, 220);
    const topY = Math.min(Math.max(innerBottom + 34, H * 0.55), H * 0.8);
    const baseY = Math.min(H * 0.92, topY + Math.max(56, H * 0.16));
    const h = baseY - topY;
    const cx = W / 2;
    const span = Math.max(a * 1.6, W * 0.5);
    const x = cx + span * Math.tan(phase * 0.92);

    const B = [cx - a / 2, baseY], C = [cx + a / 2, baseY], A = [x, topY];

    /* 平行线与底线 */
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = FAINT + ".55)"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, topY); ctx.lineTo(W, topY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = FAINT + ".4)";
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();

    /* 三角形 */
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
    ctx.fillStyle = "rgba(33,29,22,.045)"; ctx.fill();
    ctx.strokeStyle = SOFT + ".75)"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = "#211d16"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.stroke();

    /* 顶点角弧（三角色彩） */
    const arc = (p, p1, p2, r, color) => {
      const a1 = Math.atan2(p1[1] - p[1], p1[0] - p[0]), a2 = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
      const d = ((a2 - a1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, a1, a1 + d, d < 0);
      ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.stroke();
    };
    arc(A, B, C, 24, C_A); arc(B, A, C, 18, C_B); arc(C, B, A, 18, C_C);

    /* 顶点 */
    ctx.beginPath(); ctx.arc(A[0], A[1], 6, 0, Math.PI * 2);
    ctx.fillStyle = C_A; ctx.fill();
    ctx.strokeStyle = "#f4efe3"; ctx.lineWidth = 2; ctx.stroke();

    const dyA = Math.atan2(h, x - (cx - a / 2)), dyC = Math.atan2(h, (cx + a / 2) - x);
    const degA = 180 - (dyA + dyC) * 180 / Math.PI;
    ctx.font = "14px " + EN; ctx.textAlign = "center";
    ctx.fillStyle = C_A; ctx.fillText(degA.toFixed(1) + "°", A[0], A[1] - 12);
    ctx.fillStyle = C_B; ctx.fillText((dyA * 180 / Math.PI).toFixed(1) + "°", B[0] - 8, B[1] + 24);
    ctx.fillStyle = C_C; ctx.fillText((dyC * 180 / Math.PI).toFixed(1) + "°", C[0] + 8, C[1] + 24);
  }

  let raf = null;
  function loop() {
    if (phase > 0.9) phase = -0.9;
    phase += 0.0016;
    drawHero();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && !reduced) { raf = requestAnimationFrame(loop); } }
  function halt() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  const hero = document.querySelector(".hero");
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    visible ? start() : halt();
  }, { threshold: 0.05 }).observe(hero);

  window.addEventListener("resize", () => { resize(); drawHero(); });

  resize();
  drawHero();
})();
