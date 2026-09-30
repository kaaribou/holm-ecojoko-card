/* holm-ecojoko-card — https://github.com/kaaribou/holm-ecojoko-card — licence MIT — v1.0.0 */
// holm-ecojoko-card — cadran façon Ecojoko, adapté au thème (aucun helper)
// type: custom:holm-ecojoko-card
// power: sensor.ecojoko_consommation_temps_reel      (W, temps réel)
// energy_hc: sensor.ecojoko_consommation_hc_reseau    (kWh, total_increasing)
// energy_hp: sensor.ecojoko_consommation_hp_reseau
// price_hc: input_number.hc_heures_creuses            (€/kWh)  — ou nombre
// price_hp: input_number.heures_pleines
// solar_power: sensor.ecu_current_power               (optionnel)
// solar_energy: sensor.ecu_today_energy               (optionnel)
// export_energy: sensor.ecojoko_surplus_de_production (optionnel)
// max_power: 12000   scale: [0,50,100,500,1000,5000,10000]
// rotate_seconds: 10 (0 = pas de défilement auto)
(() => {
const NS = "http://www.w3.org/2000/svg";
const fmtNum = (v, d = 0) => Number(v).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtK = (v) => (v >= 1000 ? (v / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "K" : String(v));

class HolmEcojokoCard extends HTMLElement {
  setConfig(c) {
    if (!c || !c.power) throw new Error("holm-ecojoko-card : 'power' est requis");
    this._c = {
      max_power: 12000, rotate_seconds: 10,
      colors: { power: "#1f6aa8", today: "#0a8f95", week: "#43a867", solar: "#d99a1c" }, ...c,
    };
    this._c.colors = { power: "#1f6aa8", today: "#0a8f95", week: "#43a867", solar: "#d99a1c", ...(c.colors || {}) };
    if (typeof this._c.scale === "string") this._c.scale = this._c.scale.split(/[;, ]+/).map(Number).filter((n) => !isNaN(n));
    if (!Array.isArray(this._c.scale) || this._c.scale.length < 2) delete this._c.scale;
    this._c.max_power = Number(this._c.max_power) || 12000;
    this._c.rotate_seconds = Number(this._c.rotate_seconds ?? 10);
    this._slide = Math.min(this._slide || 0, 3); this._spark = []; this._stats = null; this._fetched = 0; this._key = "";
    this._solar = this._c.mode === "solar";
    if (this._solar) {
      this._c.colors = { power: "#d9921c", today: "#e2702a", week: "#43a867", self: "#0a8f95", ...(c.colors || {}) };
      if (!this._c.scale) this._c.scale = [0, 250, 500, 1000, 2000, 3000, 4500];
      if (!c.max_power) this._c.max_power = 6000;
      this._slides = ["power", "today", "week", "self"];
    } else {
      if (!this._c.scale) this._c.scale = [0, 50, 100, 500, 1000, 5000, 10000];
      this._slides = ["power", "today", "week"];
      if (this._c.solar_power) this._slides.push("solar");
    }
    if (this.shadowRoot) this._render(true);
  }
  connectedCallback() {
    this._startTimer();
    if (this.shadowRoot && this._c) this._render(true);
  }
  disconnectedCallback() { clearInterval(this._timer); this._timer = null; this._ro?.disconnect(); this._ro = null; this._root = null; }
  _startTimer() {
    clearInterval(this._timer);
    if (this._c && this._c.rotate_seconds > 0)
      this._timer = setInterval(() => { if (!this._hover) { this._slide = (this._slide + 1) % this._slides.length; this._render(); } }, this._c.rotate_seconds * 1000);
  }
  _num(id) { if (id === undefined || id === null) return NaN; if (typeof id === "number") return id; const s = this._hass?.states[id]; return s ? parseFloat(s.state) : NaN; }
  set hass(h) {
    this._hass = h;
    if (!this.shadowRoot) { this.attachShadow({ mode: "open" }); this._render(true); this._startTimer(); }
    const c = this._c;
    const p = this._num(c.power);
    if (!isNaN(p)) {
      const t = Date.now();
      const last = this._spark[this._spark.length - 1];
      if (!last || last.v !== p || t - last.t > 60000) this._spark.push({ t, v: p });
      this._spark = this._spark.filter((x) => x.t > t - 3600000);
    }
    if (Date.now() - this._fetched > 300000) { this._fetched = Date.now(); this._load(); }
    const key = [c.power, c.energy, c.energy_hc, c.energy_hp, c.solar_power, c.solar_energy, c.export_energy, c.forecast].map((e) => e && h.states[e]?.state).join("|");
    if (key !== this._key) { this._key = key; this._render(); }
  }
  async _load() {
    const c = this._c, h = this._hass;
    try {
      const now = new Date();
      // Sparkline : 60 dernières minutes
      const r = await h.callWS({ type: "history/history_during_period", start_time: new Date(now - 3600000).toISOString(),
        end_time: now.toISOString(), entity_ids: [c.power], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const pts = (r[c.power] || []).map((x) => ({ t: (x.lc ?? x.lu) * 1000, v: parseFloat(x.s) })).filter((x) => !isNaN(x.v));
      const merged = [...pts, ...this._spark].sort((a, b) => a.t - b.t);
      this._spark = merged.filter((x, i) => i === 0 || x.t !== merged[i - 1].t);
      // Statistiques : jours (7 derniers) et heures (comparaison)
      const ids = (this._solar ? [c.energy, c.export_energy] : [c.energy_hc, c.energy_hp]).filter(Boolean);
      if (ids.length) {
        const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const [days, hours] = await Promise.all([
          h.callWS({ type: "recorder/statistics_during_period", start_time: d0.toISOString(), statistic_ids: ids, period: "day", types: ["change"], units: { energy: "kWh" } }),
          h.callWS({ type: "recorder/statistics_during_period", start_time: d0.toISOString(), statistic_ids: ids, period: "hour", types: ["change"], units: { energy: "kWh" } }),
        ]);
        const byDay = {}, byHour = {};
        if (this._solar) {
          const ps = this._num(c.price_self) || 0, pe = this._num(c.price_export) || 0;
          for (const s of days[c.energy] || []) { const k = new Date(s.start).toDateString(); byDay[k] = byDay[k] || { kwh: 0, exp: 0, t: s.start }; byDay[k].kwh += s.change || 0; }
          for (const s of days[c.export_energy] || []) { const k = new Date(s.start).toDateString(); if (byDay[k]) byDay[k].exp += s.change || 0; }
          for (const v of Object.values(byDay)) { const exp = Math.min(v.exp, v.kwh); v.eur = (v.kwh - exp) * ps + exp * pe; }
          for (const s of hours[c.energy] || []) byHour[s.start] = (byHour[s.start] || 0) + (s.change || 0);
        } else for (const id of ids) {
          const price = this._num(id === c.energy_hc ? c.price_hc : c.price_hp) || 0;
          for (const s of days[id] || []) { const k = new Date(s.start).toDateString(); byDay[k] = byDay[k] || { kwh: 0, eur: 0, t: s.start }; byDay[k].kwh += s.change || 0; byDay[k].eur += (s.change || 0) * price; }
          for (const s of hours[id] || []) { byHour[s.start] = (byHour[s.start] || 0) + (s.change || 0); }
        }
        const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
        const week = Object.entries(byDay).filter(([k]) => k !== todayKey).map(([, v]) => v).sort((a, b) => a.t - b.t).slice(-7);
        // Écart du jour : heures écoulées aujourd'hui vs moyenne des mêmes heures sur les 7 jours précédents
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const hoursDone = Object.keys(byHour).map(Number).filter((t) => t >= midnight).length;
        let todaySum = 0, prevSum = 0, prevDays = 0;
        for (const [t, v] of Object.entries(byHour)) if (Number(t) >= midnight) todaySum += v;
        for (let d = 1; d <= 7; d++) {
          const ds = midnight - d * 86400000; let s = 0, n = 0;
          for (let hh = 0; hh < hoursDone; hh++) { const v = byHour[ds + hh * 3600000]; if (v !== undefined) { s += v; n++; } }
          if (n === hoursDone && n > 0) { prevSum += s; prevDays++; }
        }
        const avg = prevDays ? prevSum / prevDays : 0;
        this._stats = { week, deltaPct: avg > 0 && hoursDone >= 1 ? (todaySum / avg - 1) * 100 : null };
      }
      this._err = null;
    } catch (e) { this._err = e?.message || String(e); this._fetched = 0; }
    this._render();
  }
  // ---- géométrie ----
  _pt(r, deg) { const a = (deg * Math.PI) / 180; return [160 + r * Math.cos(a), 160 - r * Math.sin(a)]; }
  _arc(r, a0, a1) { // a0 -> a1 en degrés (math), sens décroissant = horaire
    const [x0, y0] = this._pt(r, a0), [x1, y1] = this._pt(r, a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 < a0 ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  _powerAngle(v) {
    const sc = [...this._c.scale, this._c.max_power], A0 = 198, A1 = -18, step = (A0 - A1) / (sc.length - 1);
    v = Math.max(0, Math.min(v, sc[sc.length - 1]));
    for (let i = 0; i < sc.length - 1; i++) if (v <= sc[i + 1]) return A0 - step * (i + (v - sc[i]) / (sc[i + 1] - sc[i]));
    return A1;
  }
  _pctAngle(p) { p = Math.max(-25, Math.min(25, p)); return 270 + (p / 20) * 55; } // -20 → 215°, +20 → 325°
  // ---- rendu ----
  _render(full) {
    if (!this.shadowRoot || !this._c) return;
    const c = this._c, col = c.colors, s = this._slides[this._slide] || "power";
    const P = this._num(c.power);
    const sc = [...c.scale, c.max_power];
    const A0 = 198, A1 = -18, step = (A0 - A1) / (sc.length - 1);
    const pa = isNaN(P) ? A0 : this._powerAngle(P);
    let svg = "";
    // anneau haut
    svg += `<path d="${this._arc(128, A0, A1)}" class="trk"/>`;
    svg += `<path d="${this._arc(128, A0, Math.max(A1, Math.min(A0, pa)))}" class="prog" style="stroke:${col.power}"/>`;
    sc.forEach((v, i) => {
      const a = A0 - step * i, [x, y] = this._pt(148, a);
      const rot = 90 - a;
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" class="lbl">${i === sc.length - 1 ? "MAX" : fmtK(v)}</text>`;
    });
    const [nx0, ny0] = this._pt(117, pa), [nx1, ny1] = this._pt(139, pa);
    svg += `<line x1="${nx0}" y1="${ny0}" x2="${nx1}" y2="${ny1}" class="needle" style="stroke:${col.power}"/>`;
    const [ux, uy] = this._pt(111, 90);
    svg += `<text x="${ux}" y="${uy}" class="unit">watts</text>`;
    // anneau bas (écart %)
    const dp = this._stats?.deltaPct;
    svg += `<path d="${this._arc(128, 215, 325)}" class="trk"/>`;
    if (dp !== null && dp !== undefined) {
      const da = this._pctAngle(dp);
      svg += `<path d="${this._arc(128, 270, da)}" class="prog" style="stroke:${(this._solar ? dp >= 0 : dp <= 0) ? "#1fce8a" : "#ef7d42"}"/>`;
      const [mx0, my0] = this._pt(117, da), [mx1, my1] = this._pt(139, da);
      svg += `<line x1="${mx0}" y1="${my0}" x2="${mx1}" y2="${my1}" class="needle" style="stroke:#7fd3e3"/>`;
    }
    [-20, -10, 0, 10, 20].forEach((v) => {
      const a = this._pctAngle(v), [x, y] = this._pt(148, a);
      svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${(270 - a).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" class="lbl">${v}</text>`;
    });
    const [px, py] = this._pt(109, 270);
    svg += `<text x="${px}" y="${py}" class="unit pct">${dp === null || dp === undefined ? "%" : (dp > 0 ? "+" : "") + fmtNum(dp) + " %"}</text>`;

    // contenu du disque
    let body = "", color = col.power;
    const eurTodayHC = (this._num(c.energy_hc) || 0) * (this._num(c.price_hc) || 0);
    const eurTodayHP = (this._num(c.energy_hp) || 0) * (this._num(c.price_hp) || 0);
    const kwhToday = (this._num(c.energy_hc) || 0) + (this._num(c.energy_hp) || 0);
    if (this._solar) {
      const prod = this._num(c.energy) || 0, exp = Math.min(this._num(c.export_energy) || 0, prod);
      const selfK = prod - exp, ps = this._num(c.price_self) || 0, pe = this._num(c.price_export) || 0;
      if (s === "power") {
        color = col.power;
        const sp = this._spark.filter((x) => x.t > Date.now() - 3600000);
        let spark = "";
        if (sp.length > 1) {
          const t0 = Date.now() - 3600000, max = Math.max(...sp.map((x) => x.v), 1);
          const ptsS = sp.map((x) => `${(((x.t - t0) / 3600000) * 140).toFixed(1)},${(38 - (x.v / max) * 34).toFixed(1)}`);
          ptsS.push(`140,${(38 - (P / max) * 34).toFixed(1)}`);
          spark = `<svg class="spark" viewBox="0 0 140 40"><polyline points="${ptsS.join(" ")}"/></svg>`;
        }
        const fc = this._num(c.forecast);
        body = `<div class="t1">Production<br>temps réel</div><div class="big">${isNaN(P) ? "—" : fmtNum(P)} W</div>
          ${!isNaN(fc) ? `<div class="sub">Prévision du jour ${fmtNum(fc, 1)} kWh</div>` : ""}${spark}`;
      } else if (s === "today") {
        color = col.today;
        body = `<div class="big">${fmtNum(selfK * ps + exp * pe, 2)} €</div><div class="mid">${fmtNum(prod, 1)} kWh produits</div>
          <div class="split"><span>Conso ${fmtNum(selfK, 1)}</span><span>Revente ${fmtNum(exp, 1)}</span></div>
          <div class="t2">Aujourd'hui</div>`;
      } else if (s === "week") {
        color = col.week;
        const w = this._stats?.week || [];
        const eur = w.reduce((a, x) => a + x.eur, 0), kwh = w.reduce((a, x) => a + x.kwh, 0), mx = Math.max(...w.map((x) => x.kwh), 0.001);
        body = `<div class="big">${w.length ? fmtNum(eur, 2) + " €" : "…"}</div><div class="mid">${w.length ? fmtNum(kwh, 1) + " kWh" : ""}</div>
          <div class="bars">${w.map((x) => `<i style="height:${Math.max(6, (x.kwh / mx) * 100)}%" title="${new Date(x.t).toLocaleDateString("fr-FR", { weekday: "long" })} : ${fmtNum(x.kwh, 1)} kWh"></i>`).join("")}</div>
          <div class="t2">Sur 7 jours</div>`;
      } else {
        color = col.self;
        const pct = prod > 0 ? (selfK / prod) * 100 : NaN;
        body = `<div class="t1">Autoconsommation</div><div class="big">${isNaN(pct) ? "—" : fmtNum(pct) + " %"}</div>
          <div class="sub">${fmtNum(selfK, 1)} kWh consommés</div><div class="sub">${fmtNum(exp, 1)} kWh revendus</div>`;
      }
    } else if (s === "power") {
      color = col.power;
      const sp = this._spark.filter((x) => x.t > Date.now() - 3600000);
      let spark = "";
      if (sp.length > 1) {
        const t0 = Date.now() - 3600000, max = Math.max(...sp.map((x) => x.v), 1);
        const ptsS = sp.map((x) => `${(((x.t - t0) / 3600000) * 140).toFixed(1)},${(38 - (x.v / max) * 34).toFixed(1)}`);
        ptsS.push(`140,${(38 - (P / max) * 34).toFixed(1)}`);
        spark = `<svg class="spark" viewBox="0 0 140 40"><polyline points="${ptsS.join(" ")}"/></svg>`;
      }
      const sol = c.solar_power ? this._num(c.solar_power) : NaN;
      body = `<div class="t1">Puissance<br>temps réel</div><div class="big">${isNaN(P) ? "—" : fmtNum(P)} W</div>
        ${!isNaN(sol) ? `<div class="sub">☀ ${fmtNum(sol)} W produits</div>` : ""}${spark}`;
    } else if (s === "today") {
      color = col.today;
      body = `<div class="big">${fmtNum(eurTodayHC + eurTodayHP, 2)} €</div><div class="mid">${fmtNum(kwhToday, 1)} kWh</div>
        <div class="split"><span>HC ${fmtNum(this._num(c.energy_hc) || 0, 1)}</span><span>HP ${fmtNum(this._num(c.energy_hp) || 0, 1)}</span></div>
        <div class="t2">Aujourd'hui</div>`;
    } else if (s === "week") {
      color = col.week;
      const w = this._stats?.week || [];
      const eur = w.reduce((a, x) => a + x.eur, 0), kwh = w.reduce((a, x) => a + x.kwh, 0), mx = Math.max(...w.map((x) => x.kwh), 0.001);
      body = `<div class="big">${w.length ? fmtNum(eur, 2) + " €" : "…"}</div><div class="mid">${w.length ? fmtNum(kwh, 1) + " kWh" : ""}</div>
        <div class="bars">${w.map((x) => `<i style="height:${Math.max(6, (x.kwh / mx) * 100)}%" title="${new Date(x.t).toLocaleDateString("fr-FR", { weekday: "long" })} : ${fmtNum(x.kwh, 1)} kWh"></i>`).join("")}</div>
        <div class="t2">Sur 7 jours</div>`;
    } else if (s === "solar") {
      color = col.solar;
      const sp = this._num(c.solar_power), se = this._num(c.solar_energy), ex = this._num(c.export_energy);
      const auto = !isNaN(se) && se > 0 && !isNaN(ex) ? Math.max(0, Math.min(100, ((se - ex) / se) * 100)) : NaN;
      body = `<div class="t1">Production<br>solaire</div><div class="big">${isNaN(sp) ? "—" : fmtNum(sp)} W</div>
        ${!isNaN(se) ? `<div class="sub">${fmtNum(se, 1)} kWh aujourd'hui</div>` : ""}
        ${!isNaN(auto) ? `<div class="sub">Autoconsommation ${fmtNum(auto)} %</div>` : ""}`;
    }
    const dots = this._slides.map((_, i) => `<b class="${i === this._slide ? "on" : ""}" data-i="${i}"></b>`).join("");

    if (full || !this._root) {
      this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; height:100%; }
        ha-card { padding: 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-sizing:border-box; height:100%; overflow:hidden; }
        .area { flex:1 1 auto; min-height:0; width:100%; display:flex; align-items:center; justify-content:center; }
        .wrap { position:relative; width:100%; aspect-ratio:1; flex:none; }
        .title { width:100%; text-align:center; font-size:16px; font-weight:600; color:var(--primary-text-color); letter-spacing:.3px; flex:none; }
        .title:empty { display:none; }
        ha-card.noframe { background:none !important; box-shadow:none !important; border:none !important;
          backdrop-filter:none !important; -webkit-backdrop-filter:none !important; --ha-card-background:transparent; }
        ha-card.noframe::before, ha-card.noframe::after { content:none !important; display:none !important; }
        svg.dial { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
        .face { fill: color-mix(in srgb, var(--primary-text-color) 4%, transparent); stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width:1; }
        .trk { fill:none; stroke: color-mix(in srgb, var(--primary-text-color) 18%, transparent); stroke-width:9; stroke-linecap:round; }
        .prog { fill:none; stroke-width:9; stroke-linecap:round; opacity:.85; transition: d .6s; }
        .needle { stroke-width:10; stroke-linecap:round; filter: drop-shadow(0 0 4px rgba(0,0,0,.35)); }
        .lbl { fill: var(--secondary-text-color); font-size:12px; text-anchor:middle; dominant-baseline:middle; letter-spacing:.3px; }
        .unit.pct { font-size:10px; font-weight:600; opacity:1; }
        .unit { fill: var(--secondary-text-color); font-size:8px; text-anchor:middle; dominant-baseline:middle; opacity:.8; }
        .disc { position:absolute; left:50%; top:50%; width:57.5%; height:57.5%; overflow:hidden; transform:translate(-50%,-50%); border-radius:50%;
                display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff; cursor:pointer;
                box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.08); transition: background .5s; user-select:none; padding:8px; box-sizing:border-box; }
        .t1 { font-size: clamp(6px, 4.2cqw, 16px); font-weight:600; text-transform:uppercase; letter-spacing:.5px; line-height:1.2; }
        .t2 { font-size: clamp(6px, 3.4cqw, 13px); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-top:6px; }
        .big { font-size: clamp(10px, 9.5cqw, 34px); font-weight:600; line-height:1.15; margin-top:4px; }
        .mid { font-size: clamp(7px, 5cqw, 18px); font-weight:500; opacity:.95; }
        .sub { font-size: clamp(6px, 3.4cqw, 12px); opacity:.9; margin-top:2px; }
        .split { display:flex; gap:10px; font-size: clamp(6px, 3.4cqw, 12px); opacity:.85; margin-top:6px; }
        .spark { width:62%; height:auto; margin-top:6px; overflow:visible; }
        .spark polyline { fill:none; stroke:#fff; stroke-width:1.6; stroke-linejoin:round; stroke-linecap:round; }
        .bars { display:flex; align-items:flex-end; gap:5px; height:12cqw; width:55%; margin-top:8px; }
        .bars i { flex:1; background:#fff; border-radius:1px; }
        .dots { position:absolute; left:50%; bottom:13.5%; transform:translateX(-50%); display:flex; gap:6px; }
        .dots b { width:clamp(4px,2cqw,7px); height:clamp(4px,2cqw,7px); border-radius:50%; border:1.5px solid #fff; opacity:.9; cursor:pointer; box-sizing:border-box; }
        .dots b.on { background:#fff; }
        .delta { position:absolute; left:0; right:0; bottom:1%; text-align:center; font-size:11px; color:var(--secondary-text-color); }
        .err { position:absolute; left:0; right:0; top:0; font-size:11px; color:var(--error-color); text-align:center; }
      </style>
      <ha-card><div class="title t-top"></div><div class="area"><div class="wrap" style="container-type:inline-size">
        <svg class="dial" viewBox="0 0 320 320"><circle cx="160" cy="160" r="158" class="face"/><g class="g"></g></svg>
        <div class="disc"><div class="content"></div><div class="dots"></div></div>
        <div class="err"></div>
      </div></div><div class="title t-bottom"></div></ha-card>`;
      this._root = this.shadowRoot.querySelector(".wrap");
      this._ro?.disconnect();
      this._ro = new ResizeObserver(() => this._fit());
      this._ro.observe(this.shadowRoot.querySelector(".area"));
      const disc = this._root.querySelector(".disc");
      disc.addEventListener("click", (e) => {
        const i = e.target?.dataset?.i;
        this._slide = i !== undefined ? Number(i) : (this._slide + 1) % this._slides.length;
        this._startTimer(); this._render();
      });
      disc.addEventListener("mouseenter", () => (this._hover = true));
      disc.addEventListener("mouseleave", () => (this._hover = false));
    }
    this._root.querySelector(".g").innerHTML = svg;
    const disc = this._root.querySelector(".disc");
    disc.style.background = `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 80%, #fff), ${color} 70%)`;
    disc.querySelector(".content").innerHTML = body;
    disc.querySelector(".content").style.cssText = "display:flex;flex-direction:column;align-items:center;width:100%;margin-top:-6%";
    disc.querySelector(".dots").innerHTML = dots;
    this._root.querySelector(".err").textContent = this._err ? "Erreur : " + this._err : "";
    const pos = c.title_position || "top";
    this.shadowRoot.querySelector("ha-card").classList.toggle("noframe", c.show_frame === false);
    this.shadowRoot.querySelector(".t-top").textContent = c.title && pos === "top" ? c.title : "";
    this.shadowRoot.querySelector(".t-bottom").textContent = c.title && pos === "bottom" ? c.title : "";
    this._fit();
  }
  _fit() {
    // Diamètre = largeur disponible ; si la hauteur de la carte est fixée (redimensionnée), on prend le plus petit des deux
    const area = this.shadowRoot?.querySelector(".area"); if (!area || !this._root) return;
    const rows = this._c.grid_options?.rows;
    const fixedH = rows !== undefined && rows !== "auto";
    let d = area.clientWidth;
    if (fixedH && area.clientHeight > 0) d = Math.min(d, area.clientHeight);
    if (this._c.size > 0) d = Math.min(d, this._c.size);
    const px = Math.max(120, Math.floor(d)) + "px";
    if (this._root.style.width !== px) this._root.style.width = px;
  }
  static getConfigElement() { return document.createElement("holm-ecojoko-card-editor"); }
  static getStubConfig(hass) {
    const f = (re) => Object.keys(hass.states).find((e) => re.test(e));
    return { title: "", title_position: "top", mode: "conso", power: f(/^sensor\..*(temps_reel|power)$/) || "", max_power: 12000, rotate_seconds: 10 };
  }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 4, min_rows: 3 }; }
}

// ---------------- Éditeur visuel ----------------
const LABELS = {
  title: "Titre", title_position: "Position du titre", mode: "Type de cadran",
  power: "Puissance temps réel (W)", energy_hc: "Énergie HC du jour (kWh)", energy_hp: "Énergie HP du jour (kWh)",
  price_hc: "Prix HC (€/kWh)", price_hp: "Prix HP (€/kWh)", solar_power: "Puissance solaire (W)", solar_energy: "Production solaire du jour (kWh)",
  energy: "Production du jour (kWh)", export_energy: "Énergie revendue du jour (kWh)", price_self: "Valeur du kWh autoconsommé (€/kWh)",
  price_export: "Prix de rachat (€/kWh)", forecast: "Prévision de production du jour (kWh)",
  max_power: "Puissance maximale (W)", scale: "Graduations (W, séparées par des virgules)", rotate_seconds: "Défilement automatique (secondes, 0 = désactivé)",
  size: "Diamètre maximum (px, 0 = auto)", show_frame: "Afficher le cadre de la carte",
  c_power: "Couleur — temps réel", c_today: "Couleur — aujourd'hui", c_week: "Couleur — 7 jours", c_solar: "Couleur — solaire", c_self: "Couleur — autoconsommation",
};
const ent = (domains) => ({ entity: { domain: domains } });
const hex2rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return undefined; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (a) => Array.isArray(a) ? "#" + a.map((v) => Number(v).toString(16).padStart(2, "0")).join("") : a;
class HolmEcojokoCardEditor extends HTMLElement {
  setConfig(c) { this._config = { ...c }; this._update(); }
  set hass(h) { this._hass = h; this._update(); }
  _schema(solar) {
    const colorKeys = solar ? ["power", "today", "week", "self"] : ["power", "today", "week", "solar"];
    const entities = solar ? [
      { name: "power", required: true, selector: ent(["sensor"]) },
      { name: "energy", selector: ent(["sensor"]) },
      { name: "export_energy", selector: ent(["sensor"]) },
      { name: "price_self", selector: ent(["sensor", "input_number", "number"]) },
      { name: "price_export", selector: ent(["sensor", "input_number", "number"]) },
      { name: "forecast", selector: ent(["sensor"]) },
    ] : [
      { name: "power", required: true, selector: ent(["sensor"]) },
      { name: "energy_hc", selector: ent(["sensor"]) },
      { name: "energy_hp", selector: ent(["sensor"]) },
      { name: "price_hc", selector: ent(["sensor", "input_number", "number"]) },
      { name: "price_hp", selector: ent(["sensor", "input_number", "number"]) },
      { name: "solar_power", selector: ent(["sensor"]) },
      { name: "solar_energy", selector: ent(["sensor"]) },
      { name: "export_energy", selector: ent(["sensor"]) },
    ];
    return [
      { type: "grid", name: "", schema: [
        { name: "title", selector: { text: {} } },
        { name: "title_position", selector: { select: { mode: "dropdown", options: [{ value: "top", label: "En haut" }, { value: "bottom", label: "En bas" }] } } },
      ] },
      { name: "mode", selector: { select: { mode: "dropdown", options: [{ value: "conso", label: "Consommation" }, { value: "solar", label: "Production solaire" }] } } },
      { type: "expandable", title: "Entités", icon: "mdi:flash", flatten: true, expanded: true, schema: entities },
      { type: "expandable", title: "Cadran et affichage", icon: "mdi:gauge", flatten: true, schema: [
        { type: "grid", name: "", schema: [
          { name: "max_power", selector: { number: { min: 100, max: 50000, step: 100, mode: "box", unit_of_measurement: "W" } } },
          { name: "rotate_seconds", selector: { number: { min: 0, max: 120, step: 1, mode: "box", unit_of_measurement: "s" } } },
        ] },
        { name: "scale", selector: { text: {} } },
        { name: "size", selector: { number: { min: 0, max: 1200, step: 10, mode: "box", unit_of_measurement: "px" } } },
        { name: "show_frame", selector: { boolean: {} } },
      ] },
      { type: "expandable", title: "Couleurs", icon: "mdi:palette", flatten: true, schema: [
        { type: "grid", name: "", schema: colorKeys.map((k) => ({ name: "c_" + k, selector: { color_rgb: {} } })) },
      ] },
    ];
  }
  _data() {
    const c = this._config || {}, d = { title_position: "top", mode: "conso", rotate_seconds: 10, size: 0, show_frame: true, ...c };
    d.scale = Array.isArray(c.scale) ? c.scale.join(", ") : c.scale || "";
    for (const [k, v] of Object.entries(c.colors || {})) d["c_" + k] = hex2rgb(v);
    delete d.colors;
    return d;
  }
  _update() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (sc) => LABELS[sc.name] || sc.name;
      this._form.addEventListener("value-changed", (ev) => {
        const v = { ...ev.detail.value };
        const out = { ...this._config };
        const colors = { ...(this._config.colors || {}) };
        for (const [k, val] of Object.entries(v)) {
          if (k.startsWith("c_")) { if (val) colors[k.slice(2)] = rgb2hex(val); else delete colors[k.slice(2)]; continue; }
          if (val === "" || val === undefined || val === null) delete out[k]; else out[k] = val;
        }
        if (Object.keys(colors).length) out.colors = colors; else delete out.colors;
        if (typeof out.scale === "string") {
          const arr = out.scale.split(/[;, ]+/).map(Number).filter((n) => !isNaN(n));
          if (arr.length >= 2) out.scale = arr; else delete out.scale;
        }
        if (!out.size) delete out.size;
        if (out.show_frame !== false) delete out.show_frame;
        this._config = out;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: out }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._data();
    this._form.schema = this._schema(this._config.mode === "solar");
  }
}
if (!customElements.get("holm-ecojoko-card-editor")) customElements.define("holm-ecojoko-card-editor", HolmEcojokoCardEditor);

if (!customElements.get("holm-ecojoko-card")) customElements.define("holm-ecojoko-card", HolmEcojokoCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "holm-ecojoko-card", name: "HOLM – Cadran Ecojoko", description: "Cadran consommation / production solaire façon Ecojoko, adapté au thème", preview: true });
})();

console.info("%c HOLM-ECOJOKO %c 1.0.0 ", "background:#1f6aa8;color:#111;border-radius:3px 0 0 3px", "background:#123;color:#fff;border-radius:0 3px 3px 0");
