/* ============================================================
   solver-ui.js · §04 三角形求解台
   七个已知量（∠A∠B∠C、a、b、c、h）任意勾选，实时求解；
   结果写回 LAB.state，与 §02 平面视图、§03 角度空间联动。
   ============================================================ */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const t = (k, p) => window.I18N.t(k, p);
  const solveTriangle = window.TriangleSolver.solveTriangle;
  const fromXY = window.TriangleSolver.triangleFromXY;
  const LAB = window.LAB;

  /* key, 词典键, 是否角度 */
  const DEFS = [
    ["A", null, true], ["B", null, true], ["C", null, true],
    ["a", "solver.label.a", false], ["b", "solver.label.b", false], ["c", "solver.label.c", false],
    ["h", "solver.label.h", false],
  ];
  const labelOf = (k) => {
    const d = DEFS.find((x) => x[0] === k);
    return d && d[1] ? t(d[1]) : "∠" + k;
  };
  const METRICS = [
    ["a", "solver.label.a"], ["b", "solver.label.b"], ["c", "solver.label.c"],
    ["h", "solver.m.h"], ["hb", "solver.m.hb"], ["hc", "solver.m.hc"],
    ["area", "solver.m.area"], ["perimeter", "solver.m.perimeter"],
  ];

  let lastResult = null;
  let selection = 0;
  let draggingA = false; /* 拖 A 期间冻结预览取景，避免视图随三角形尺寸抖动 */

  /* ---------- 构建已知量行与结果格 ---------- */
  function buildKnownGrid() {
    $("knownGrid").innerHTML = DEFS.map(([k, dictKey, isAngle]) => {
      const label = dictKey ? t(dictKey) : "∠" + k;
      const min = isAngle ? 0.1 : 0.01, max = isAngle ? 179.9 : 5, step = isAngle ? 0.1 : 0.01;
      return (
        '<div class="known-row" id="kr-' + k + '">' +
        '<label><input type="checkbox" id="known-' + k + '" aria-label="' + t("solver.aria.known", { label }) + '">' +
        '<span class="kr-label">' + label + (isAngle ? ' <small class="en">°</small>' : "") + "</span></label>" +
        '<input type="number" id="input-' + k + '" step="any" min="0" placeholder="—" aria-label="' + t("solver.aria.input", { label }) + '">' +
        '<input type="range" id="range-' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + (isAngle ? 45 : 1) + '" aria-label="' + t("solver.aria.range", { label }) + '">' +
        "</div>"
      );
    }).join("");
    $("resultsGrid").innerHTML = METRICS.map(([key, dictKey]) =>
      '<div class="result-cell"><small>' + t(dictKey) + '</small><output id="res-' + key + '">—</output></div>'
    ).join("");
  }

  function refreshRange(k) {
    const v = Number($("input-" + k).value), r = $("range-" + k);
    const isAngle = "ABC".includes(k);
    if (!isAngle && v > 0 && Number.isFinite(v)) {
      r.max = String(Math.min(Number.MAX_VALUE, Math.max(5, v * 2)));
      r.step = String(Math.min(0.01, v / 100));
      r.min = String(Math.min(0.01, v / 100));
    }
    r.value = String(v);
  }

  function readKnown() {
    const out = {};
    for (const [k] of DEFS) if ($("known-" + k).checked) {
      const v = $("input-" + k).value.trim();
      out[k] = v === "" ? NaN : Number(v);
    }
    return out;
  }

  /* ---------- 消息与结果 ---------- */
  function messageFor(result) {
    if (result.status === "invalid" || result.status === "insufficient") return t("solve.msg." + result.reason);
    if (result.status === "multiple") return t("solve.msg.multiple", { n: result.solutions.length });
    return t("solve.msg." + result.status);
  }
  function renderMessage(result) {
    const el = $("solveMessage");
    el.textContent = messageFor(result);
    el.dataset.status = result.status;
  }
  function renderResults(result) {
    const tri = result.solutions.length
      ? result.solutions[Math.min(selection, result.solutions.length - 1)]
      : null;
    const shape = result.status === "shape";
    for (const [key] of METRICS) {
      const el = $("res-" + key);
      el.classList.remove("dim");
      if (!tri) { el.textContent = t("solve.pending"); el.classList.add("dim"); }
      else if (shape) { el.textContent = t("solve.undetermined"); el.classList.add("dim"); }
      else el.textContent = LAB.num(tri[key]);
    }
    $("solutionPicker").innerHTML = result.solutions.length > 1
      ? result.solutions.map((_, i) =>
          '<button data-solution="' + i + '" aria-pressed="' + (i === selection) + '">' + t("solve.sol", { n: i + 1 }) + "</button>"
        ).join("")
      : "";
  }

  function applySolution(tri) {
    const s = LAB.state;
    s.base = tri.a; s.height = tri.h; s.t = tri.x; s.limit = 0; s.valid = true;
    LAB.fit(); LAB.update(); LAB.drawAll();
    if (!draggingA) { LAB.fitSolver(); LAB.drawSolverPreview(); }
  }

  function fillComputed(tri, shape) {
    for (const [k, , isAngle] of DEFS) {
      if ($("known-" + k).checked) continue;
      if (tri && (!shape || isAngle)) $("input-" + k).value = LAB.num(tri[k]).replace("—", "");
      else $("input-" + k).value = "";
    }
  }

  function solve() {
    const known = readKnown();
    const result = solveTriangle(known);
    lastResult = result;
    if (result.solutions.length) {
      selection = Math.min(selection, result.solutions.length - 1);
      applySolution(result.solutions[selection]);
      fillComputed(result.solutions[selection], result.status === "shape");
    } else {
      selection = 0;
      LAB.state.valid = false;
      LAB.update(); LAB.drawAll();
      fillComputed(null, false);
    }
    renderMessage(result);
    renderResults(result);
    markPreset(null);
  }

  /* ---------- 预设 ---------- */
  const PRESETS = {
    aas: { A: 45, B: 45, a: 1 }, aah: { A: 45, B: 45, h: 1 },
    sss: { a: 3, b: 4, c: 5 }, sas: { A: 60, b: 2, c: 3 },
    ssa: { A: 30, a: 1, b: 1.5 }, ach: { a: 3, c: 2, h: 1.5 }, clear: {},
  };
  function markPreset(key) {
    $("presetGroup").querySelectorAll(".mode-btn").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.preset === key));
  }
  function preset(key) {
    const values = PRESETS[key];
    selection = 0;
    for (const [k] of DEFS) {
      $("known-" + k).checked = k in values;
      if (k in values) { $("input-" + k).value = String(values[k]); refreshRange(k); }
      else $("input-" + k).value = "";
    }
    markPreset(key);
    solve();
  }
  $("presetGroup").addEventListener("click", (e) => {
    const key = e.target.dataset.preset;
    if (key) preset(key);
  });

  /* ---------- 已知量交互（事件委托） ---------- */
  $("knownGrid").addEventListener("change", (e) => {
    const id = e.target.id;
    if (!id.startsWith("known-")) return;
    const k = id.slice(6);
    if (e.target.checked && LAB.state.valid !== false) {
      const s = LAB.state;
      const tri = fromXY(s.base, s.t, s.height);
      if (tri) $("input-" + k).value = LAB.num(tri[k]).replace("—", "");
    }
    refreshRange(k); solve();
  });
  $("knownGrid").addEventListener("input", (e) => {
    const id = e.target.id;
    if (id.startsWith("input-")) { refreshRange(id.slice(6)); solve(); }
    else if (id.startsWith("range-")) {
      const k = id.slice(6);
      $("input-" + k).value = $("range-" + k).value;
      solve();
    }
  });
  $("solutionPicker").addEventListener("click", (e) => {
    const i = e.target.dataset.solution;
    if (i === undefined) return;
    selection = Number(i);
    $("solutionPicker").querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-pressed", String(Number(b.dataset.solution) === selection)));
    const tri = lastResult && lastResult.solutions[selection];
    if (tri) applySolution(tri);
    renderResults(lastResult);
  });

  /* ---------- 预览画布：拖动顶点 A，勾选的已知量实时回写并重解 ---------- */
  const solverCanvas = $("solverCanvas");
  const solverLocal = (e) => {
    const r = solverCanvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  solverCanvas.addEventListener("pointerdown", (e) => {
    if (!lastResult || !lastResult.solutions.length) return;
    const s = LAB.state, v = LAB.solverView;
    const w = solverCanvas.clientWidth, h = solverCanvas.clientHeight;
    if (!(w > 0) || !(h > 0)) return;
    const p = solverLocal(e);
    const ax = (s.t - v.center) * v.scale + w / 2;
    const ay = h * 0.76 - s.height * v.scale;
    if (Math.hypot(p[0] - ax, p[1] - ay) > 52) return; /* 只允许从顶点 A 附近抓取 */
    draggingA = true;
    try { solverCanvas.setPointerCapture(e.pointerId); } catch (err) { /* 合成/非激活指针下允许失败 */ }
    solverCanvas.classList.add("is-grabbing");
  });
  solverCanvas.addEventListener("pointermove", (e) => {
    if (!draggingA) return;
    const s = LAB.state, v = LAB.solverView;
    const w = solverCanvas.clientWidth, h = solverCanvas.clientHeight;
    const p = solverLocal(e);
    const x = v.center + (p[0] - w / 2) / v.scale;
    const y = (h * 0.76 - p[1]) / v.scale;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const a = s.base; /* 拖动不改底边：B、C 固定，其余量全部重算 */
    const yy = Math.max(y, a * 0.02, 1e-6); /* 不允许拖成退化三角形 */
    const tri = fromXY(a, x, yy);
    if (!tri) return;
    for (const [k] of DEFS) if ($("known-" + k).checked) {
      $("input-" + k).value = LAB.num(tri[k]).replace("—", "");
      refreshRange(k);
    }
    solve();
    LAB.drawSolverPreview(); /* 取景被 applySolution 冻结，这里补一次静态重绘 */
  });
  const endSolverDrag = () => {
    if (!draggingA) return;
    draggingA = false;
    solverCanvas.classList.remove("is-grabbing");
    LAB.fitSolver(); LAB.drawSolverPreview(); /* 松手后重新取景 */
  };
  for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) solverCanvas.addEventListener(ev, endSolverDrag);

  /* ---------- 语言切换刷新（保留当前求解状态） ---------- */
  document.addEventListener("i18n:change", () => {
    const saved = DEFS.map(([k]) => [k, $("known-" + k).checked, $("input-" + k).value]);
    buildKnownGrid();
    for (const [k, checked, val] of saved) {
      $("known-" + k).checked = checked;
      $("input-" + k).value = val;
      if (checked && val !== "") refreshRange(k);
    }
    if (lastResult) { renderMessage(lastResult); renderResults(lastResult); }
  });

  buildKnownGrid();
  preset("aas");
})();
