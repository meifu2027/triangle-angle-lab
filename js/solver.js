/* ============================================================
   solver.js · 三角形求解核心（纯数学，无 DOM、无语言文案）
   约定：边 a,b,c 与其对角 A,B,C 同名；h 是 A 到 BC 的高；
        A 点坐标 (x, h)，B=(0,0)，C=(a,0)。
   返回 { status, reason, solutions }：
     status   'unique' | 'multiple' | 'shape' | 'invalid' | 'insufficient'
     reason   语言无关的失败码，由 UI 层翻译
     solutions 互不相同的解，按 ∠B 升序
   该实现的前身在原始实验室中通过约 5000 组随机参数回归验证。
   ============================================================ */
(function () {
  "use strict";

  const RAD = Math.PI / 180;
  const near = (x, y) =>
    Math.abs(x - y) <= 1e-7 * Math.max(Math.abs(x), Math.abs(y), Number.MIN_VALUE);

  function triangleFromXY(a, x, h) {
    if (!(a > 0 && h > 0) || ![a, x, h].every(Number.isFinite)) return null;
    const b = Math.hypot(a - x, h), c = Math.hypot(x, h), m = Math.max(a, Math.abs(x), h);
    const A = Math.atan2((a / m) * (h / m), (x / m) * ((x - a) / m) + (h / m) ** 2) / RAD;
    const B = Math.atan2(h, x) / RAD, C = Math.atan2(h, a - x) / RAD;
    return { a, b, c, h, x, A, B, C, hb: a * (h / b), hc: a * (h / c), area: a * h / 2, perimeter: a + b + c };
  }

  function triangleFromAngles(q, lengthKey = "a", length = 1) {
    if (q.some((v) => !(v > 0 && v < 180)) || !near(q.reduce((s, v) => s + v, 0), 180)) return null;
    const sin = q.map((v) => Math.sin(v * RAD));
    const k = length / (lengthKey === "h" ? sin[1] * sin[2] : sin["abc".indexOf(lengthKey)]);
    const a = k * sin[0], c = k * sin[2], h = c * sin[1], x = c * Math.cos(q[1] * RAD);
    const t = triangleFromXY(a, x, h);
    if (t) Object.assign(t, { A: q[0], B: q[1], C: q[2] });
    return t;
  }

  function triangleFromSides(a, b, c) {
    const m = Math.max(a, b, c), u = a / m, v = b / m, w = c / m;
    const z = [u, v, w].sort((p, q) => q - p), [p, q, r] = z;
    if (!(r > 0 && r > p - q)) return null;
    // 数值稳定的 Heron 公式：先归一化再开方，避免大边长平方溢出
    const area4 = Math.sqrt((p + (q + r)) * (r - (p - q)) * (r + (p - q)) * (p + (q - r)));
    const h = (m * area4) / (2 * u), x = (m * (u * u + (w - v) * (w + v))) / (2 * u);
    return triangleFromXY(a, x, h);
  }

  function solveTriangle(known) {
    const keys = Object.keys(known);
    const ak = ["A", "B", "C"].filter((k) => k in known);
    const sk = ["a", "b", "c"].filter((k) => k in known);
    const invalid = (reason) => ({ status: "invalid", reason, solutions: [] });
    const insufficient = (reason) => ({ status: "insufficient", reason, solutions: [] });

    for (const k of keys)
      if (!Number.isFinite(known[k]) || known[k] <= 0 || ("ABC".includes(k) && known[k] >= 180))
        return invalid("range");
    if (ak.length === 3 && !near(ak.reduce((s, k) => s + known[k], 0), 180)) return invalid("sum3");
    if (ak.length === 2 && known[ak[0]] + known[ak[1]] >= 180) return invalid("sum2");
    if ("h" in known && sk.some((k) => k !== "a" && known.h > known[k] && !near(known.h, known[k])))
      return invalid("hSide");

    let candidates = [], attempted = false, shape = false;
    const add = (t) => { if (t) candidates.push(t); };
    const use = (fn) => { attempted = true; fn(); };

    if (ak.length >= 2) {
      let q = ["A", "B", "C"].map((k) => known[k]);
      const missing = q.findIndex((v) => v === undefined);
      if (missing >= 0) q[missing] = 180 - q.filter((v) => v !== undefined).reduce((s, v) => s + v, 0);
      const lengthKey = sk[0] || ("h" in known ? "h" : null);
      shape = !lengthKey;
      use(() => add(triangleFromAngles(q, lengthKey || "a", lengthKey ? known[lengthKey] : 1)));
    }
    if (sk.length === 3) use(() => add(triangleFromSides(known.a, known.b, known.c)));
    for (const angle of ak) {
      const i = "ABC".indexOf(angle), others = [0, 1, 2].filter((j) => j !== i), side = "abc"[i], theta = known[angle];
      if (others.every((j) => "abc"[j] in known)) use(() => {
        const u = known["abc"[others[0]]], v = known["abc"[others[1]]], m = Math.max(u, v);
        const opposite = m * Math.hypot((u - v) / m, 2 * Math.sqrt(u / m) * Math.sqrt(v / m) * Math.sin((theta * RAD) / 2));
        const sides = [known.a, known.b, known.c]; sides[i] = opposite;
        add(triangleFromSides(...sides));
      });
      if (side in known) for (const j of others) if ("abc"[j] in known) use(() => {
        const sine = (known["abc"[j]] / known[side]) * Math.sin(theta * RAD);
        if (sine > 1 + 1e-12) return;
        const alpha = Math.asin(Math.min(1, sine)) / RAD;
        for (const val of [alpha, 180 - alpha]) {
          let q = []; q[i] = theta; q[j] = val; q[3 - i - j] = 180 - theta - val;
          add(triangleFromAngles(q, side, known[side]));
        }
      });
    }
    if ("h" in known) {
      const h = known.h, foot = (l) => Math.sqrt(Math.max(0, 1 - (h / l) ** 2)) * l;
      if ("a" in known && "c" in known) use(() => { for (const sign of [-1, 1]) add(triangleFromXY(known.a, sign * foot(known.c), h)); });
      if ("a" in known && "b" in known) use(() => { for (const sign of [-1, 1]) add(triangleFromXY(known.a, known.a + sign * foot(known.b), h)); });
      if ("b" in known && "c" in known) use(() => {
        for (const sb of [-1, 1]) for (const sc of [-1, 1]) {
          const x = sc * foot(known.c);
          add(triangleFromXY(x + sb * foot(known.b), x, h));
        }
      });
      // B 与 h 决定 c，C 与 h 决定 b；这两条放在一起并不独立，无法确定整个三角形
      if ("B" in known && "c" in known && !near(known.c * Math.sin(known.B * RAD), h)) return invalid("hBconflict");
      if ("C" in known && "b" in known && !near(known.b * Math.sin(known.C * RAD), h)) return invalid("hCconflict");
      for (const side of ["b", "c"]) if (side in known) {
        const oppositeAngle = side === "b" ? "C" : "B";
        if (ak.some((k) => k !== oppositeAngle)) use(() => {
          const ratio = h / known[side];
          if (ratio > 1 + 1e-12) return;
          const phi = Math.asin(Math.min(1, ratio)) / RAD;
          for (const theta of [phi, 180 - phi]) for (const k of ak.filter((k) => k !== oppositeAngle)) {
            let q = [];
            const i = "ABC".indexOf(k), j = "ABC".indexOf(oppositeAngle);
            q[i] = known[k]; q[j] = theta; q[3 - i - j] = 180 - q[i] - q[j];
            add(triangleFromAngles(q, side, known[side]));
          }
        });
      }
      if ("a" in known) for (const k of ak) use(() => {
        const a = known.a;
        if (k === "B") add(triangleFromXY(a, h / Math.tan(known.B * RAD), h));
        else if (k === "C") add(triangleFromXY(a, a - h / Math.tan(known.C * RAD), h));
        else {
          const m = Math.max(a, h), u = a / m, v = h / m;
          const D = u * u / 4 - v * v + (u * v) / Math.tan(known.A * RAD);
          if (D >= -1e-13) {
            const offset = m * Math.sqrt(Math.max(0, D));
            add(triangleFromXY(a, a / 2 - offset, h));
            add(triangleFromXY(a, a / 2 + offset, h));
          }
        }
      });
    }

    candidates = candidates.filter(
      (t) => keys.every((k) => near(t[k], known[k])) &&
        ["a", "b", "c", "h", "x", "A", "B", "C", "hb", "hc", "area", "perimeter"].every((k) => Number.isFinite(t[k]))
    );
    const solutions = [];
    for (const t of candidates)
      if (!solutions.some((s) => ["a", "b", "c", "A", "B", "C"].every((k) => near(t[k], s[k])))) solutions.push(t);
    solutions.sort((p, q) => p.B - q.B);
    if (solutions.length)
      return { status: shape ? "shape" : solutions.length > 1 ? "multiple" : "unique", reason: null, solutions };
    return attempted ? invalid("degenerate") : insufficient("insufficient");
  }

  window.TriangleSolver = { solveTriangle, triangleFromXY, triangleFromAngles, triangleFromSides };
})();
