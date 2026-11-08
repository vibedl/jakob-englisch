// Englisch-Test Unit 1 Australia – Lern-App (läuft komplett im Browser, Fortschritt in localStorage)
"use strict";
const $ = (s) => document.querySelector(s);
const haupt = $("#haupt");
const SPEICHER = "jakob-englisch-australien-v1";

let stand = { schwer: {}, gekonnt: {}, bestwerte: {} };
try { stand = Object.assign(stand, JSON.parse(localStorage.getItem(SPEICHER)) || {}); } catch { /* ohne Speicher */ }
const sichern = () => { try { localStorage.setItem(SPEICHER, JSON.stringify(stand)); } catch { /* egal */ } };

const mischen = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Antworten vergleichen: Groß/klein egal, Klammern und "to " egal, Varianten mit "/" einzeln erlaubt
function norm(t) {
  return t.toLowerCase().replace(/[’`]/g, "'").replace(/\(.*?\)/g, " ").replace(/\bsth\.?|\bsb\.?/g, " ")
    .replace(/[.,!?;:…]/g, " ").replace(/\s+/g, " ").trim();
}
function varianten(en) {
  const v = new Set();
  const teile = [en, ...en.split("/")];
  for (const roh of teile) for (let t of [norm(roh), norm(roh.replace(/[()]/g, ""))]) {
    if (!t) continue; v.add(t); if (t.startsWith("to ")) v.add(t.slice(3)); if (t.startsWith("the ")) v.add(t.slice(4));
  }
  return v;
}
function abstand(a, b) { // Levenshtein – für "fast richtig"
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function pruefeVokabel(eingabe, en) {
  const e = norm(eingabe), e2 = e.startsWith("to ") ? e.slice(3) : e;
  const v = varianten(en);
  if (v.has(e) || v.has(e2)) return "richtig";
  for (const x of v) if (x.length > 4 && abstand(e2, x) <= 1) return "fast";
  return "falsch";
}

function sprich(text) {
  try { const u = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, "")); u.lang = "en-AU"; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* kein Ton */ }
}
const lautBtn = (t) => `<button class="laut" data-laut="${esc(t)}" aria-label="Vorlesen">🔊</button>`;
document.addEventListener("click", (ev) => { const b = ev.target.closest("[data-laut]"); if (b) sprich(b.dataset.laut); });

function zeige(html) { haupt.innerHTML = html; window.scrollTo(0, 0); }
const zurueck = `<button class="zurueck" onclick="start()">‹ Übersicht</button>`;

// ---------- Startseite ----------
function start() {
  location.hash = "";
  const anzSchwer = Object.keys(stand.schwer).length;
  const anzGekonnt = VOKABELN.filter((v) => stand.gekonnt[v.en]).length;
  const bw = (k) => stand.bestwerte[k] != null ? `<span class="best">Bestwert ${stand.bestwerte[k]} %</span>` : "";
  zeige(`
    <section class="kopf">
      <h1>Unit 1 · Australia</h1>
      <p>Englisch-Test Klasse 9 – Camden Market, S. 14–29, Vokabeln S. 264–265</p>
      <div class="fortschritt"><div style="width:${Math.round(100 * anzGekonnt / VOKABELN.length)}%"></div></div>
      <p class="klein">${anzGekonnt} von ${VOKABELN.length} Buch-Vokabeln sicher · ${anzSchwer} noch üben</p>
    </section>
    <nav class="kacheln">
      <button onclick="karten()"><b>🃏 Vokabelkarten</b><span>Buchliste S. 261–265 (${VOKABELN.length} Wörter): umdrehen, anhören</span></button>
      <button onclick="vokabeltest('de-en')"><b>✍️ Vokabeltest Deutsch → Englisch</b><span>Englisch eintippen</span>${bw("de-en")}</button>
      <button onclick="vokabeltest('en-de')"><b>🔤 Vokabeltest Englisch → Deutsch</b><span>Richtige Bedeutung wählen</span>${bw("en-de")}</button>
      ${anzSchwer ? `<button class="wichtig" onclick="vokabeltest('schwer')"><b>🔁 Schwere Wörter üben (${anzSchwer})</b><span>Nur die, die noch falsch waren</span></button>` : ""}
      <button onclick="mc('Falsche Freunde', mischen(FALSCHE_FREUNDE), 'ff')"><b>⚠️ Falsche Freunde</b><span>sensible, also, arm, cross …</span>${bw("ff")}</button>
      <button onclick="mc('Was ist das? (Definitionen)', mischen(DEFINITIONEN), 'def')"><b>💬 Was ist das?</b><span>Englische Umschreibung → Wort</span>${bw("def")}</button>
      <button onclick="quiz()"><b>🦘 Landeskunde-Quiz</b><span>Geschichte, Natur, Leben in Australien</span>${bw("quiz")}</button>
      <button onclick="karten(ZUSATZ)"><b>🌏 Zusatzwörter Australien</b><span>${ZUSATZ.length} weitere Wörter – nicht aus der Buchliste</span></button>
      <button onclick="grammatik()"><b>⚙️ Grammatik</b><span>if-clauses II, Passiv, Fragen, Gerund, Simple past</span></button>
      <button onclick="lesen()"><b>📖 Leseverstehen</b><span>Text „A day on Wirrawarra Station“</span>${bw("lesen")}</button>
      <button onclick="schreiben()"><b>📝 Schreiben</b><span>Typische Schreibaufgaben mit Tipps</span></button>
      <button class="probe" onclick="probetest()"><b>🎯 Probetest mit Note</b><span>Gemischt aus allem, ca. 15 Minuten</span>${bw("probe")}</button>
    </nav>
    <p class="hinweis">Grammatik und Themen nach dem Westermann-Stoffverteilungsplan zu Unit 1. Vokabeln wie Buchliste S. 261–265, Beispielsätze, Texte und Aufgaben selbst geschrieben.</p>
    <button class="leise" onclick="if(confirm('Fortschritt wirklich löschen?')){stand={schwer:{},gekonnt:{},bestwerte:{}};sichern();start();}">Fortschritt zurücksetzen</button>
  `);
}

// ---------- Vokabelkarten ----------
function karten(pool = VOKABELN) {
  let liste = mischen(pool), i = 0, umgedreht = false;
  const male = () => {
    const v = liste[i];
    zeige(`${zurueck}<h2>Vokabelkarten <small>${i + 1}/${liste.length}</small></h2>
      <div class="karte ${umgedreht ? "hinten" : ""}" id="karte">
        ${umgedreht ? `<div class="de">${esc(v.de)}</div><div class="bsp">${esc(v.bsp)} ${lautBtn(v.bsp)}</div>` : `<div class="en">${esc(v.en)}</div><div class="klein">Tippen zum Umdrehen</div>`}
      </div>
      <div class="reihe">${lautBtn(v.en)}
        <button class="neben" id="kz">‹</button><button class="haupt" id="kw">${umgedreht ? "Weiter ›" : "Umdrehen"}</button></div>
      ${umgedreht ? `<div class="reihe"><button class="gut" id="kk">Kann ich ✓</button><button class="schlecht" id="kn">Noch nicht ✗</button></div>` : ""}`);
    $("#karte").onclick = () => { umgedreht = !umgedreht; male(); };
    $("#kz").onclick = () => { i = (i - 1 + liste.length) % liste.length; umgedreht = false; male(); };
    $("#kw").onclick = () => { if (!umgedreht) umgedreht = true; else { i = (i + 1) % liste.length; umgedreht = false; } male(); };
    if (umgedreht) {
      $("#kk").onclick = () => { stand.gekonnt[v.en] = 1; delete stand.schwer[v.en]; sichern(); i = (i + 1) % liste.length; umgedreht = false; male(); };
      $("#kn").onclick = () => { stand.schwer[v.en] = 1; delete stand.gekonnt[v.en]; sichern(); i = (i + 1) % liste.length; umgedreht = false; male(); };
    }
  };
  male();
}

// ---------- Vokabeltest ----------
function vokabeltest(art, fertigCb, anzahl = 15) {
  const ALLE = VOKABELN.concat(ZUSATZ);
  let pool = art === "schwer" ? ALLE.filter((v) => stand.schwer[v.en]) : art === "zusatz" ? ZUSATZ : VOKABELN;
  if (!pool.length) pool = VOKABELN;
  const liste = mischen(pool).slice(0, Math.min(anzahl, pool.length));
  const richtung = art === "en-de" || art === "zusatz" ? "en-de" : "de-en";
  let i = 0, punkte = 0; const fehler = [];
  const naechste = () => {
    if (i >= liste.length) {
      const proz = Math.round(100 * punkte / liste.length);
      if (fertigCb) return fertigCb(punkte, liste.length, fehler);
      if (art !== "schwer") stand.bestwerte[art] = Math.max(stand.bestwerte[art] || 0, proz); sichern();
      return ergebnis(`Vokabeltest`, punkte, liste.length, fehler.map((v) => `<li><b>${esc(v.en)}</b> – ${esc(v.de)}</li>`).join(""), () => vokabeltest(art));
    }
    const v = liste[i];
    const kopf = `${fertigCb ? "" : zurueck}<h2>${fertigCb ? "Probetest · Vokabeln" : "Vokabeltest"} <small>${i + 1}/${liste.length}</small></h2>`;
    if (richtung === "de-en") {
      zeige(`${kopf}<div class="frage">${esc(v.de)}</div>
        <form id="f" autocomplete="off"><input id="ein" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="auf Englisch …" autofocus>
        <button class="haupt">Prüfen</button></form><div id="rm"></div>`);
      $("#ein").focus();
      $("#f").onsubmit = (ev) => {
        ev.preventDefault();
        const ein = $("#ein").value; if (!ein.trim()) return;
        const r = pruefeVokabel(ein, v.en);
        if (r !== "falsch") { punkte++; stand.gekonnt[v.en] = 1; delete stand.schwer[v.en]; } else { fehler.push(v); stand.schwer[v.en] = 1; delete stand.gekonnt[v.en]; }
        sichern();
        $("#f").innerHTML = "";
        $("#rm").innerHTML = `<div class="rm ${r === "falsch" ? "nein" : "ja"}">${r === "richtig" ? "Richtig! ✓" : r === "fast" ? "Fast richtig – achte auf die Schreibweise:" : "Leider falsch. Richtig ist:"}
          <div class="loesung">${esc(v.en)} ${lautBtn(v.en)}</div><div class="bsp">${esc(v.bsp)}</div></div>
          <button class="haupt" id="w">Weiter ›</button>`;
        $("#w").focus(); $("#w").onclick = () => { i++; naechste(); };
      };
    } else {
      const falsche = mischen((pool.length >= 8 ? pool : ALLE).filter((x) => x !== v)).slice(0, 3);
      const opts = mischen([v, ...falsche]);
      zeige(`${kopf}<div class="frage">${esc(v.en)} ${lautBtn(v.en)}</div><div class="wahl" id="w">${opts.map((o, k) => `<button data-k="${k}">${esc(o.de)}</button>`).join("")}</div><div id="rm"></div>`);
      document.querySelectorAll("#w button").forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.k], ok = o === v;
        if (ok) { punkte++; stand.gekonnt[v.en] = 1; delete stand.schwer[v.en]; } else { fehler.push(v); stand.schwer[v.en] = 1; delete stand.gekonnt[v.en]; }
        sichern();
        document.querySelectorAll("#w button").forEach((x) => { x.disabled = true; if (opts[+x.dataset.k] === v) x.classList.add("ok"); });
        if (!ok) b.classList.add("falsch");
        $("#rm").innerHTML = `<div class="bsp">${esc(v.bsp)}</div><button class="haupt" id="wt">Weiter ›</button>`;
        $("#wt").onclick = () => { i++; naechste(); };
      });
    }
  };
  naechste();
}

// ---------- Multiple-Choice (Quiz, Lesetext) ----------
function mc(titel, fragen, schluessel, fertigCb, vorText = "") {
  const liste = fragen.map((q) => { const o = mischen(q.a.map((t, k) => ({ t, ok: k === q.r }))); return { ...q, o }; });
  let i = 0, punkte = 0; const fehler = [];
  const naechste = () => {
    if (i >= liste.length) {
      if (fertigCb) return fertigCb(punkte, liste.length, fehler);
      stand.bestwerte[schluessel] = Math.max(stand.bestwerte[schluessel] || 0, Math.round(100 * punkte / liste.length)); sichern();
      return ergebnis(titel, punkte, liste.length, fehler.map((q) => `<li>${esc(q.f)}<br><b>${esc(q.a[q.r])}</b></li>`).join(""), () => mc(titel, fragen, schluessel, null, vorText));
    }
    const q = liste[i];
    zeige(`${fertigCb ? "" : zurueck}<h2>${titel} <small>${i + 1}/${liste.length}</small></h2>${vorText}
      <div class="frage">${esc(q.f)}</div><div class="wahl" id="w">${q.o.map((o, k) => `<button data-k="${k}">${esc(o.t)}</button>`).join("")}</div><div id="rm"></div>`);
    document.querySelectorAll("#w button").forEach((b) => b.onclick = () => {
      const ok = q.o[+b.dataset.k].ok; if (ok) punkte++; else fehler.push(q);
      document.querySelectorAll("#w button").forEach((x) => { x.disabled = true; if (q.o[+x.dataset.k].ok) x.classList.add("ok"); });
      if (!ok) b.classList.add("falsch");
      $("#rm").innerHTML = `${q.info ? `<div class="bsp">${esc(q.info)}</div>` : ""}<button class="haupt" id="wt">Weiter ›</button>`;
      $("#wt").onclick = () => { i++; naechste(); };
    });
  };
  naechste();
}
function quiz() { mc("Landeskunde-Quiz", mischen(QUIZ).slice(0, 12), "quiz"); }

function lesen() {
  zeige(`${zurueck}<h2>${esc(LESETEXT.titel)}</h2><article class="text">${LESETEXT.text}</article>
    <button class="haupt" onclick="lesenFragen()">Fragen zum Text ›</button>
    <h3>Zum Aufschreiben (ins Heft)</h3><ol>${LESETEXT.offen.map((o) => `<li>${esc(o)}</li>`).join("")}</ol>`);
}
function lesenFragen() {
  const knopf = `<details class="textauf"><summary>Text noch mal ansehen</summary><article class="text">${LESETEXT.text}</article></details>`;
  mc("Leseverstehen", LESETEXT.fragen, "lesen", null, knopf);
}

// ---------- Grammatik ----------
function grammatik() {
  zeige(`${zurueck}<h2>Grammatik</h2><nav class="kacheln">${GRAMMATIK.map((g, k) => `<button onclick="grammatikThema(${k})"><b>${esc(g.titel)}</b><span>${g.aufgaben.length} Lückensätze</span></button>`).join("")}</nav>`);
}
function lueckenOk(eingabe, loesungen) {
  const e = norm(eingabe).replace(/…|\.\.\./g, " ").replace(/\s+/g, " ").trim();
  return loesungen.some((l) => norm(l) === e);
}
function grammatikThema(k, fertigCb, aufgaben) {
  const g = GRAMMATIK[k];
  const liste = aufgaben || mischen(g.aufgaben);
  let i = 0, punkte = 0; const fehler = [];
  const naechste = () => {
    if (i >= liste.length) {
      if (fertigCb) return fertigCb(punkte, liste.length, fehler);
      return ergebnis(g.titel, punkte, liste.length, fehler.map((a) => `<li>${esc(a.s.replace("___", "…"))}<br><b>${esc(a.l[0])}</b></li>`).join(""), () => grammatikThema(k));
    }
    const a = liste[i];
    zeige(`${fertigCb ? "" : `<button class="zurueck" onclick="grammatik()">‹ Grammatik</button>`}<h2>${esc(g.titel)} <small>${i + 1}/${liste.length}</small></h2>
      <details class="regel" ${i === 0 && !fertigCb ? "open" : ""}><summary>Regel</summary><p>${g.regel}</p></details>
      <div class="frage satz">${esc(a.s).replace("___", "<span class='luecke'>_____</span>")}</div>
      <form id="f" autocomplete="off"><input id="ein" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Lücke ausfüllen …"><button class="haupt">Prüfen</button></form><div id="rm"></div>`);
    $("#ein").focus();
    $("#f").onsubmit = (ev) => {
      ev.preventDefault(); const ein = $("#ein").value; if (!ein.trim()) return;
      const ok = lueckenOk(ein, a.l); if (ok) punkte++; else fehler.push(a);
      $("#f").innerHTML = "";
      $("#rm").innerHTML = `<div class="rm ${ok ? "ja" : "nein"}">${ok ? "Richtig! ✓" : `Leider falsch (du: „${esc(ein)}“). Richtig:`}<div class="loesung">${esc(a.s.replace("___", a.l[0]).replace(/\s*\(.*?\)/, ""))}</div></div><button class="haupt" id="w">Weiter ›</button>`;
      $("#w").focus(); $("#w").onclick = () => { i++; naechste(); };
    };
  };
  naechste();
}

// ---------- Schreiben ----------
function schreiben() {
  zeige(`${zurueck}<h2>Schreiben</h2>
    <p>Im Test kommt oft eine Schreibaufgabe. Such dir eine aus, schreib sie ins Heft und lass sie dir korrigieren.</p>
    ${SCHREIBEN.map((s) => `<details class="schreib"><summary>${esc(s.titel)}</summary><p><i>${esc(s.aufgabe)}</i></p><ul>${s.tipps.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <textarea placeholder="Hier kannst du auch direkt tippen …" oninput="this.nextElementSibling.textContent=(this.value.trim().split(/\\s+/).filter(Boolean).length)+' Wörter'"></textarea><div class="klein">0 Wörter</div></details>`).join("")}`);
}

// ---------- Probetest ----------
function note(proz) {
  return proz >= 92 ? "1" : proz >= 81 ? "2" : proz >= 67 ? "3" : proz >= 50 ? "4" : proz >= 30 ? "5" : "6";
}
function probetest() {
  let gesamt = 0, max = 0; const fehlerHtml = [];
  zeige(`${zurueck}<h2>Probetest</h2><p>Der Test hat 4 Teile:</p><ol><li>10 Vokabeln (Deutsch → Englisch)</li><li>6 Grammatik-Lücken</li><li>6 Landeskunde-Fragen</li><li>Leseverstehen (7 Fragen)</li></ol><p>Am Ende bekommst du Punkte und eine ungefähre Note. Lies den Text in Teil 4 genau!</p><button class="haupt" id="los">Los geht's</button>`);
  $("#los").onclick = () => {
    vokabeltest("de-en", (p, m, f) => {
      gesamt += p; max += m; if (f.length) fehlerHtml.push(`<h3>Vokabeln</h3><ul>${f.map((v) => `<li><b>${esc(v.en)}</b> – ${esc(v.de)}</li>`).join("")}</ul>`);
      const gram = mischen(GRAMMATIK.flatMap((g, k) => g.aufgaben.map((a) => ({ a, k })))).slice(0, 6);
      let gi = 0, gp = 0; const gf = [];
      const weiterGram = () => {
        if (gi >= gram.length) {
          gesamt += gp; max += gram.length; if (gf.length) fehlerHtml.push(`<h3>Grammatik</h3><ul>${gf.map((a) => `<li>${esc(a.s.replace("___", "…"))} → <b>${esc(a.l[0])}</b></li>`).join("")}</ul>`);
          return mc("Probetest · Landeskunde", mischen(QUIZ).slice(0, 6), "quiz", (p2, m2, f2) => {
            gesamt += p2; max += m2; if (f2.length) fehlerHtml.push(`<h3>Landeskunde</h3><ul>${f2.map((q) => `<li>${esc(q.f)} → <b>${esc(q.a[q.r])}</b></li>`).join("")}</ul>`);
            zeige(`<h2>Probetest · Leseverstehen</h2><article class="text">${LESETEXT.text}</article><button class="haupt" id="lf">Zu den Fragen ›</button>`);
            $("#lf").onclick = () => mc("Probetest · Leseverstehen", LESETEXT.fragen, "lesen", (p3, m3, f3) => {
              gesamt += p3; max += m3; if (f3.length) fehlerHtml.push(`<h3>Leseverstehen</h3><ul>${f3.map((q) => `<li>${esc(q.f)} → <b>${esc(q.a[q.r])}</b></li>`).join("")}</ul>`);
              const proz = Math.round(100 * gesamt / max);
              stand.bestwerte.probe = Math.max(stand.bestwerte.probe || 0, proz); sichern();
              zeige(`<h2>Ergebnis Probetest</h2><div class="ergebnis"><div class="gross">${gesamt} / ${max}</div><div>${proz} % · ungefähr Note <b>${note(proz)}</b></div></div>
                ${fehlerHtml.length ? `<h3>Das solltest du noch üben:</h3>${fehlerHtml.join("")}` : "<p>Alles richtig – super! 🎉</p>"}
                <p class="klein">Die Note ist nur eine Schätzung; jede Lehrkraft bewertet anders.</p>
                <div class="reihe"><button class="haupt" onclick="probetest()">Noch mal</button><button class="neben" onclick="start()">Übersicht</button></div>`);
            }, `<details class="textauf"><summary>Text noch mal ansehen</summary><article class="text">${LESETEXT.text}</article></details>`);
          });
        }
        const { a, k } = gram[gi];
        const g = GRAMMATIK[k];
        zeige(`<h2>Probetest · Grammatik <small>${gi + 1}/${gram.length}</small></h2><p class="klein">${esc(g.titel)}</p>
          <div class="frage satz">${esc(a.s).replace("___", "<span class='luecke'>_____</span>")}</div>
          <form id="f" autocomplete="off"><input id="ein" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Lücke ausfüllen …"><button class="haupt">Prüfen</button></form><div id="rm"></div>`);
        $("#ein").focus();
        $("#f").onsubmit = (ev) => {
          ev.preventDefault(); const ein = $("#ein").value; if (!ein.trim()) return;
          const ok = lueckenOk(ein, a.l); if (ok) gp++; else gf.push(a);
          $("#f").innerHTML = "";
          $("#rm").innerHTML = `<div class="rm ${ok ? "ja" : "nein"}">${ok ? "Richtig! ✓" : "Leider falsch. Richtig:"}<div class="loesung">${esc(a.l[0])}</div></div><button class="haupt" id="w">Weiter ›</button>`;
          $("#w").focus(); $("#w").onclick = () => { gi++; weiterGram(); };
        };
      };
      weiterGram();
    }, 10);
  };
}

// ---------- Ergebnis ----------
function ergebnis(titel, p, m, fehlerListe, nochmal) {
  const proz = Math.round(100 * p / m);
  zeige(`${zurueck}<h2>${esc(titel)} – Ergebnis</h2>
    <div class="ergebnis"><div class="gross">${p} / ${m}</div><div>${proz} % ${proz >= 90 ? "– super! 🎉" : proz >= 70 ? "– gut! 👍" : "– weiter üben 💪"}</div></div>
    ${fehlerListe ? `<h3>Noch mal anschauen:</h3><ul class="fehler">${fehlerListe}</ul>` : ""}
    <div class="reihe"><button class="haupt" id="nm">Noch mal</button><button class="neben" onclick="start()">Übersicht</button></div>`);
  $("#nm").onclick = nochmal;
}

start();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
