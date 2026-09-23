/* ============================================================
   i18n.js · 国际化：中 / 英 双语
   静态文案：HTML 元素标注 data-i18n="key"，由词典注入
   动态文案：脚本通过 window.I18N.t(key) 读取，
            并监听 document 上的 "i18n:change" 事件刷新
   ============================================================ */
(function () {
  "use strict";

  const DICT = {
    /* ---------------- 中文 ---------------- */
    zh: {
      "doc.title": "滑动的顶点 · 三角形角度实验室",
      /* hero */
      "hero.title": '滑动的<span class="hero-title-dot">·</span>顶点',
      "hero.lede":
        '底边固定，高度固定，顶点 <i class="math">A</i> 沿着与底边平行的直线滑向无穷远。' +
        "三个内角此消彼长，总和恒为 <i class=\"math\">180&deg;</i>。" +
        '把 <span class="math">(&ang;A, &ang;B, &ang;C)</span> 看成三维空间里的一个点，' +
        "这场无声的重新分配，会在 <i class=\"math\">x+y+z=180&deg;</i> 的截面上画出一条安静的曲线。",
      "hero.ctaBench": "拖动顶点 ↓",
      "hero.ctaSolver": "三角形求解器",
      /* § 01 */
      "prob.title": "一个问题，三个时刻",
      "prob.desc":
        "底边 BC 长为 a，A 到 BC 的高为 h。A 沿平行线移动时，角度三元组 (&ang;A, &ang;B, &ang;C) " +
        "始终满足同一份约束：总和 180&deg;。取 a = h = 1，先看三个代表性时刻。",
      "prob.c1.title": "走向左端无穷远",
      "prob.c1.body": "&ang;B 无限逼近 180&deg;，其余两角趋近 0&deg;。三角形退化成一条直线——这是曲线的起点。",
      "prob.c2.title": "等腰时刻",
      "prob.c2.body": "A 位于底边中点正上方，&ang;B = &ang;C。此刻 &ang;A 取到全程最大值 53.13&deg;。",
      "prob.c3.title": "走向右端无穷远",
      "prob.c3.body": "&ang;C 无限逼近 180&deg;。曲线的终点与起点在单纯形的另一端遥遥相望。",
      /* § 02 */
      "lab1.no": "§ 02 · 实验室",
      "lab1.title": "平行线实验台",
      "lab1.desc":
        "拖动 A——或让它自己滑向无穷远。三个角的实时读数在右侧面板；底边与高可重新设定，" +
        "角度空间中的轨迹曲线会随之改变。",
      "bench.hint": "拖动 A 沿平行线移动 · 拖向边缘可滑向无穷远 · 滚轮缩放",
      "bench.panel.params": "参数",
      "bench.base": "底边 a",
      "bench.height": "高 h",
      "bench.speed": "巡游速度",
      "bench.panel.pos": "位置 t",
      "bench.negInf": "−∞",
      "bench.mid": "中点",
      "bench.posInf": "+∞",
      "bench.panel.measure": "测量",
      "bench.aids": "显示垂线与角弧",
      "bench.autofit": "自动取景",
      "bench.btn.play": "▶ 巡游",
      "bench.btn.pause": "⏸ 暂停",
      "bench.btn.reset": "↺ 重置",
      "bench.err.t": "请输入有效的有限数（如 −2、1e6），或 ±∞。",
      /* § 03 */
      "lab2.no": "§ 03 · 实验室",
      "lab2.title": "角度空间",
      "lab2.desc":
        "以 &ang;A、&ang;B、&ang;C 为三根轴，每个三角形都是空间中的一点 P。" +
        "内角和把 P 压在 x+y+z = 180&deg; 的正三角形截面上；固定底边与高之后，" +
        "A 的全程滑动只留下一条开曲线——从 (0&deg;, 180&deg;, 0&deg;) 走向 (0&deg;, 0&deg;, 180&deg;)。" +
        "拖动画面旋转视角。",
      "space.hint": "拖动旋转视角 · 滚轮缩放 · P 随上方实验台联动",
      "space.panel.layers": "图层",
      "space.plane": "约束平面 x+y+z = 180°",
      "space.curve": "轨迹曲线（当前 a、h）",
      "space.axes": "三根坐标轴",
      "space.spin": "缓慢自转",
      "space.panel.measure": "当前点",
      "space.sum": "内角和",
      "space.note": "曲线在两端的极限点即 § 01 的两个退化时刻；顶点位于中点上方时，P 恰在曲线的最「高」处。",
      "space.btn.reset": "↺ 重置视角",
      /* § 04 */
      "lab3.no": "§ 04 · 实验室",
      "lab3.title": "三角形求解台",
      "lab3.desc":
        "从七个量里勾选你已知的那几个——两角一边、三边、两边夹角……满足最低独立条件即可解出整个三角形：" +
        "三边、三高、面积与周长。条件冲突或不足会说明原因；存在两解时可切换查看。" +
        "求解结果同步到上方两个实验台。",
      "solver.hint": "预览随求解结果更新",
      "solver.panel.presets": "快捷组合",
      "solver.preset.aas": "两角一边",
      "solver.preset.aah": "两角一高",
      "solver.preset.sss": "三边",
      "solver.preset.sas": "两边夹角",
      "solver.preset.ssa": "两边一对角",
      "solver.preset.ach": "底·腰·高",
      "solver.preset.clear": "清空",
      "solver.panel.known": "已知量",
      "solver.knownNote": "勾选后输入数值或拖动滑块，未勾选的量自动计算。h 指定为 A 到 BC 的高。",
      "solver.panel.result": "求解结果",
      /* § 05 */
      "lab4.no": "§ 05",
      "lab4.title": "纸上的推导",
      "lab4.desc": "以上所有图形背后的五段推导——从坐标化到正弦定理与 Heron 公式。",
      "fx1.title": "坐标化",
      "fx1.body":
        "把底边放到 x 轴上：B 在原点，C 在 (a, 0)，平行线就是 y = h。" +
        "底边与高固定后，唯一的自由度是横坐标 t——整场实验都在这一个参数上进行。",
      "fx2.title": "三个角",
      "fx2.body":
        "底角就是对边与邻边之比：在 B 处看 A，横距是 t；在 C 处看 A，横距是 a−t。" +
        "用 atan2 而非 tan，t 越出 [0, a] 时的分支会自动接对。",
      "fx3.title": "角度空间",
      "fx3.body":
        "内角和把 P 压在第一卦限里的正三角形截面上。t 从 −∞ 扫到 +∞，" +
        "P 沿一条开曲线从 (0°,180°,0°) 走到 (0°,0°,180°)；t = a/2 时 ∠B = ∠C，∠A 最大。",
      "fx4.title": "正弦定理",
      "fx4.body":
        "两角加任一边（或高），第三角与全套边长立即可解。已知两边与一对角时可能交出两个三角形——" +
        "几何上是射线与圆的两个交点，这就是「两解」的来历。",
      "fx5.title": "余弦与面积",
      "fx5.body":
        "三边用余弦定理定角、Heron 公式定面积；两边夹一角则反过来由余弦定理补出第三边。" +
        "三条高由面积反推：hᵦ = 2S/b，h𝒸 = 2S/c。",
      "fx6.title": "哪些组合够用",
      "fx6.body":
        "至少三个独立量才能定下一个三角形：三边（SSS）；两边夹角（SAS）；两角加任一边或高（AAS / AAH）；" +
        "两边一对角（SSA）可能有零、一或两个解。只有三个角（AAA）定型不定量；" +
        "而像「B、c、h」这样的组合彼此不独立，永远差一个自由度。",
      /* footer */
      "footer.note": "交互演示 · 全部计算在浏览器本地完成 · 仅供数学演示",
      "footer.repo": "在 GitHub 查看源码",
      /* ---- 动态文案 ---- */
      "status.right": "直角三角形",
      "status.obtuse": "钝角三角形",
      "status.acute": "锐角三角形",
      "status.isosceles": "等腰三角形",
      "status.degenerate": "退化极限 · 非有限三角形",
      "bench.canvas.parallel": "y = {h} · 与 BC 平行",
      "bench.canvas.leftInf": "A 向左趋于无穷远",
      "bench.canvas.rightInf": "A 向右趋于无穷远",
      "bench.canvas.noFinite": "极限位置没有有限的三角形",
      "bench.canvas.offscreenL": "← A 在视野外",
      "bench.canvas.offscreenR": "A 在视野外 →",
      "bench.canvas.hLabel": "h = {v}",
      "bench.canvas.midTick": "t = {v}",
      "solve.msg.unique": "条件充分，已求得唯一三角形。",
      "solve.msg.multiple": "这些条件有 {n} 个解，切换查看不同三角形。",
      "solve.msg.shape": "形状已确定，大小未定。补充一条边长或高，即可求出实际尺寸。",
      "solve.msg.range": "角度须大于 0° 且小于 180°；边长与高须是大于 0 的有限数。",
      "solve.msg.sum3": "三个内角之和必须等于 180°。",
      "solve.msg.sum2": "两个已知角之和必须小于 180°。",
      "solve.msg.hSide": "A 到 BC 的高不能大于边 b 或边 c。",
      "solve.msg.hBconflict": "条件冲突：高 h 应等于 c × sin(B)。",
      "solve.msg.hCconflict": "条件冲突：高 h 应等于 b × sin(C)。",
      "solve.msg.degenerate": "这些条件不能构成同一个非退化三角形。请检查角度、三角形不等式与高。",
      "solve.msg.insufficient": "条件不足：请补充独立条件，例如两角与一条边或高、三边、两边与夹角。",
      "solve.sol": "解 {n}",
      "solve.undetermined": "大小未定",
      "solve.pending": "待计算",
      "solver.label.a": "a = BC",
      "solver.label.b": "b = CA",
      "solver.label.c": "c = AB",
      "solver.label.h": "h（A→BC）",
      "solver.m.h": "高 h（A→BC）",
      "solver.m.hb": "高 hᵦ（B→CA）",
      "solver.m.hc": "高 h𝒸（C→AB）",
      "solver.m.area": "面积 S",
      "solver.m.perimeter": "周长 L",
      "solver.aria.known": "已知 {label}",
      "solver.aria.input": "{label} 的数值",
      "solver.aria.range": "调节 {label}",
      "solver.canvas.wait": "等待充分且相容的已知条件",
    },

    /* ---------------- English ---------------- */
    en: {
      "doc.title": "The Moving Vertex · Triangle Angle Lab",
      /* hero */
      "hero.title": 'The Moving<span class="hero-title-dot">·</span><wbr>Vertex',
      "hero.lede":
        'A fixed base, a fixed height, and a vertex <i class="math">A</i> free to slide along the line ' +
        "parallel to the base, out to infinity. The three interior angles trade magnitude among themselves, " +
        'their sum pinned at <i class="math">180&deg;</i>. Read <span class="math">(&ang;A, &ang;B, &ang;C)</span> ' +
        "as a point in 3-space, and this quiet redistribution traces a serene curve on the slice " +
        "<i class=\"math\">x+y+z=180&deg;</i>.",
      "hero.ctaBench": "Drag the vertex ↓",
      "hero.ctaSolver": "Triangle solver",
      /* § 01 */
      "prob.title": "One Question, Three Moments",
      "prob.desc":
        "Base BC has length a, and the height from A to BC is h. As A slides along the parallel line, " +
        "the triple (&ang;A, &ang;B, &ang;C) obeys one standing constraint: the sum is 180&deg;. " +
        "Take a = h = 1 and look at three representative moments.",
      "prob.c1.title": "Off to −infinity",
      "prob.c1.body": "&ang;B approaches 180&deg; while the other two angles tend to 0&deg;. The triangle degenerates into a line — the start of the curve.",
      "prob.c2.title": "The isosceles moment",
      "prob.c2.body": "A sits directly above the midpoint of the base, so &ang;B = &ang;C. Right here &ang;A reaches its journey-wide maximum of 53.13&deg;.",
      "prob.c3.title": "Off to +infinity",
      "prob.c3.body": "&ang;C approaches 180&deg;. The end of the curve faces its beginning across the far side of the simplex.",
      /* § 02 */
      "lab1.no": "§ 02 · LAB",
      "lab1.title": "The Parallel-Line Bench",
      "lab1.desc":
        "Drag A — or let it cruise to infinity on its own. Live angle readouts sit in the panel; " +
        "reset the base and height, and the trajectory curve in the angle space changes with them.",
      "bench.hint": "Drag A along the parallel line · drag to the edge to glide to infinity · scroll to zoom",
      "bench.panel.params": "Parameters",
      "bench.base": "Base a",
      "bench.height": "Height h",
      "bench.speed": "Cruise speed",
      "bench.panel.pos": "Position t",
      "bench.negInf": "−∞",
      "bench.mid": "Midpoint",
      "bench.posInf": "+∞",
      "bench.panel.measure": "Measurements",
      "bench.aids": "Show altitude & angle arcs",
      "bench.autofit": "Auto framing",
      "bench.btn.play": "▶ Cruise",
      "bench.btn.pause": "⏸ Pause",
      "bench.btn.reset": "↺ Reset",
      "bench.err.t": "Enter a finite number (e.g. −2, 1e6) or ±∞.",
      /* § 03 */
      "lab2.no": "§ 03 · LAB",
      "lab2.title": "The Angle Space",
      "lab2.desc":
        "Take &ang;A, &ang;B, &ang;C as three axes: every triangle is a single point P. " +
        "The angle sum pins P onto the equilateral slice x+y+z = 180&deg;; with base and height fixed, " +
        "A’s whole journey leaves behind one open curve — from (0&deg;, 180&deg;, 0&deg;) to (0&deg;, 0&deg;, 180&deg;). " +
        "Drag the scene to orbit.",
      "space.hint": "Drag to orbit · scroll to zoom · P follows the bench above",
      "space.panel.layers": "Layers",
      "space.plane": "Constraint plane x+y+z = 180°",
      "space.curve": "Trajectory curve (current a, h)",
      "space.axes": "The three axes",
      "space.spin": "Slow auto-rotate",
      "space.panel.measure": "Current point",
      "space.sum": "Angle sum",
      "space.note": "The curve’s two limit points are the degenerate moments of § 01; with the vertex above the midpoint, P sits at the “highest” point of the curve.",
      "space.btn.reset": "↺ Reset view",
      /* § 04 */
      "lab3.no": "§ 04 · LAB",
      "lab3.title": "The Triangle Solver",
      "lab3.desc":
        "Tick whichever of the seven quantities you know — two angles and a side, three sides, two sides and the included angle… " +
        "Meet the minimum of independent data and the whole triangle resolves: all sides, all heights, area and perimeter. " +
        "Conflicting or insufficient data is explained on the spot; switch between solutions when there are two. " +
        "Results sync to the two benches above.",
      "solver.hint": "Preview updates with each solve",
      "solver.panel.presets": "Shortcuts",
      "solver.preset.aas": "AA + side",
      "solver.preset.aah": "AA + height",
      "solver.preset.sss": "SSS",
      "solver.preset.sas": "SAS",
      "solver.preset.ssa": "SSA",
      "solver.preset.ach": "base·side·h",
      "solver.preset.clear": "Clear",
      "solver.panel.known": "Known quantities",
      "solver.knownNote": "Tick a quantity, then type a value or drag its slider; unticked quantities are computed. h is the height from A to BC.",
      "solver.panel.result": "Result",
      /* § 05 */
      "lab4.no": "§ 05",
      "lab4.title": "Derivations on Paper",
      "lab4.desc": "Five derivations behind every figure above — from coordinates to the law of sines and Heron’s formula.",
      "fx1.title": "Coordinates",
      "fx1.body":
        "Put the base on the x-axis: B at the origin, C at (a, 0), and the parallel line is y = h. " +
        "With base and height fixed, the only degree of freedom is the abscissa t — the whole experiment runs on this one parameter.",
      "fx2.title": "The three angles",
      "fx2.body":
        "Each base angle is a ratio of opposite to adjacent: seen from B, A stands at horizontal distance t; seen from C, at a−t. " +
        "atan2 rather than tan, so the branch switches correctly once t leaves [0, a].",
      "fx3.title": "The angle space",
      "fx3.body":
        "The angle sum pins P onto the equilateral slice in the first octant. As t sweeps from −∞ to +∞, " +
        "P follows an open curve from (0°,180°,0°) to (0°,0°,180°); at t = a/2, ∠B = ∠C and ∠A is maximal.",
      "fx4.title": "Law of sines",
      "fx4.body":
        "Two angles plus any side (or height) resolve the third angle and every side at once. " +
        "Two sides and a non-included angle can cut out two triangles — geometrically, the two intersections of a ray with a circle: that is where “two solutions” come from.",
      "fx5.title": "Cosines & area",
      "fx5.body":
        "Three sides fix the angles by the law of cosines and the area by Heron’s formula; with two sides and the included angle, the third side comes first. " +
        "The heights follow from the area: hᵦ = 2S/b and h𝒸 = 2S/c.",
      "fx6.title": "Which triplets suffice",
      "fx6.body":
        "A triangle needs at least three independent quantities: SSS; SAS; two angles plus any side or height (AAS / AAH); " +
        "SSA may admit zero, one or two solutions. Three angles alone (AAA) fix the shape but not the size; " +
        "and a combination like “B, c, h” is mutually dependent — one degree of freedom short forever.",
      /* footer */
      "footer.note": "Interactive demo · all computation runs locally in your browser · for mathematical illustration only",
      "footer.repo": "View source on GitHub",
      /* ---- dynamic ---- */
      "status.right": "Right triangle",
      "status.obtuse": "Obtuse triangle",
      "status.acute": "Acute triangle",
      "status.isosceles": "Isosceles triangle",
      "status.degenerate": "Degenerate limit · no finite triangle",
      "bench.canvas.parallel": "y = {h} · parallel to BC",
      "bench.canvas.leftInf": "A glides off to −infinity",
      "bench.canvas.rightInf": "A glides off to +infinity",
      "bench.canvas.noFinite": "No finite triangle at the limit",
      "bench.canvas.offscreenL": "← A off-screen",
      "bench.canvas.offscreenR": "A off-screen →",
      "bench.canvas.hLabel": "h = {v}",
      "bench.canvas.midTick": "t = {v}",
      "solve.msg.unique": "Data sufficient — a unique triangle is determined.",
      "solve.msg.multiple": "These data admit {n} solutions — switch to compare triangles.",
      "solve.msg.shape": "Shape determined, size not. Add one side or height to fix the scale.",
      "solve.msg.range": "Angles must lie strictly between 0° and 180°; sides and heights must be finite and positive.",
      "solve.msg.sum3": "The three interior angles must sum to 180°.",
      "solve.msg.sum2": "Two known angles must sum to less than 180°.",
      "solve.msg.hSide": "The height from A to BC cannot exceed side b or side c.",
      "solve.msg.hBconflict": "Conflict: h must equal c × sin(B).",
      "solve.msg.hCconflict": "Conflict: h must equal b × sin(C).",
      "solve.msg.degenerate": "These data cannot form one non-degenerate triangle. Check angles, the triangle inequality and the height.",
      "solve.msg.insufficient": "Insufficient data: add independent quantities — e.g. two angles plus a side or height, three sides, or two sides with the included angle.",
      "solve.sol": "Sol. {n}",
      "solve.undetermined": "size open",
      "solve.pending": "—",
      "solver.label.a": "a = BC",
      "solver.label.b": "b = CA",
      "solver.label.c": "c = AB",
      "solver.label.h": "h (A→BC)",
      "solver.m.h": "Height h (A→BC)",
      "solver.m.hb": "Height hᵦ (B→CA)",
      "solver.m.hc": "Height h𝒸 (C→AB)",
      "solver.m.area": "Area S",
      "solver.m.perimeter": "Perimeter L",
      "solver.aria.known": "know {label}",
      "solver.aria.input": "value of {label}",
      "solver.aria.range": "adjust {label}",
      "solver.canvas.wait": "Waiting for sufficient, consistent data",
    },
  };

  const STORE_KEY = "triangle-lang";

  function detect() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch (e) { /* localStorage 不可用时忽略 */ }
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "zh";
    return /^zh/i.test(nav) ? "zh" : "en";
  }

  let lang = detect();

  function t(key, params) {
    let s = (DICT[lang] && DICT[lang][key]) || DICT.zh[key] || key;
    if (params) for (const [k, v] of Object.entries(params)) s = s.split("{" + k + "}").join(String(v));
    return s;
  }

  function apply() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t("doc.title");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18n);
    });
    const btn = document.getElementById("langToggle");
    if (btn) {
      btn.textContent = lang === "zh" ? "EN" : "中";
      btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    }
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang } }));
  }

  function setLang(l) {
    if (l !== "zh" && l !== "en") return;
    lang = l;
    try { localStorage.setItem(STORE_KEY, l); } catch (e) { /* ignore */ }
    apply();
  }

  window.I18N = { t, setLang, get lang() { return lang; } };

  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
  apply();
})();
