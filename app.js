const K = "lueur-v1";

const S = JSON.parse(localStorage.getItem(K) || "null") || {
  todos: [
    {
      id: 1,
      title: "今日いちばん大切なことを1つ進める",
      done: false
    }
  ],
  goals: [
    {
      title: "今年やりたいことを少しずつ叶える",
      progress: 42
    },
    {
      title: "自分の機嫌を自分で取れるようになる",
      progress: 28
    }
  ],
  schedule: [
    { time: "09:00", title: "大学" },
    { time: "17:30", title: "東進" }
  ],
  habits: ["水分をとる", "日記を書く"],
  diary: [],
  memos: []
};

const now = new Date();

const key = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayKey = key(now);

S.schedule = (S.schedule || []).map(x => ({
  ...x,
  date: x.date || todayKey
}));

let tab = "today";
let viewDate = new Date();
let selectedDate = new Date();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const save = () =>
  localStorage.setItem(K, JSON.stringify(S));

const esc = x =>
  String(x).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

const jp = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function head(t, s) {
  return `
    <div class="eyebrow">lueur</div>
    <div class="title">${t}</div>
    <p class="sub">${s || ""}</p>
  `;
}

function today() {
  const d = new Date();
  const dk = key(d);

  const items = S.schedule.filter(
    x => (x.date || todayKey) === dk
  );

  return (
    head(
      `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")} <em>${jp[d.getDay()]}</em>`,
      "今日を、自分のために。"
    ) +

    `<div class="hero">
      <b>今日の小さな光を、ひとつ。</b>
      <div class="muted" style="margin-top:8px">
        予定を管理するだけじゃなく、今日をちゃんと味わう。
      </div>
    </div>` +

    goals() +

    section(
      "Schedule",
      items.length
        ? items.map(x => `
          <div class="row">
            <span class="pill">${esc(x.time)}</span>
            <div class="grow">
              <b>${esc(x.title)}</b>
            </div>
          </div>
        `).join("")
        : `<div class="empty">今日の予定はまだないよ。</div>`
    ) +

    section(
      "Study",
      `<div class="two-col">
        <div class="card mini">
          <h3>今日の勉強</h3>
          <p>自分で決めたペースで。</p>
        </div>
        <div class="card mini">
          <h3>達成</h3>
          <p>あとで振り返れる。</p>
        </div>
      </div>`
    ) +

    todos() +

    section(
      "Habits",
      `<div class="two-col">
        ${S.habits.map(x => `
          <div class="card mini">
            <h3>${esc(x)}</h3>
            <p>今日の記録</p>
          </div>
        `).join("")}
      </div>`
    )
  );
}

function goals() {
  return section(
    "Goals",
    `<div class="card">
      ${S.goals.map(g => `
        <div class="row">
          <div class="grow">
            <b>${esc(g.title)}</b>
            <div class="goal-progress">
              <i style="width:${g.progress}%"></i>
            </div>
            <div class="muted" style="margin-top:6px">
              ${g.progress}%
            </div>
          </div>
        </div>
      `).join("")}
    </div>`
  );
}

function todos() {
  return section(
    "ToDo",
    `<div class="card">
      ${S.todos.map(t => `
        <div class="row" onclick="toggle(${t.id})">
          <button class="check ${t.done ? "done" : ""}"></button>
          <div class="grow">${esc(t.title)}</div>
        </div>
      `).join("")}
    </div>`
  );
}

function section(n, b) {
  return `
    <section class="section">
      <div class="section-head">
        <h2>${n}</h2>
        <button onclick="add('${n}')">＋追加</button>
      </div>
      ${b}
    </section>
  `;
}


/* =========================
   CALENDAR
========================= */

function calendar() {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const cells = [];

  for (let i = 0; i < first.getDay(); i++) {
    cells.push("<div></div>");
  }

  for (let n = 1; n <= last.getDate(); n++) {
    const d = new Date(y, m, n);
    const dk = key(d);

    const hasSchedule = S.schedule.some(
      x => (x.date || todayKey) === dk
    );

    cells.push(`
      <button
        class="day
          ${dk === todayKey ? "today" : ""}
          ${dk === key(selectedDate) ? "selected" : ""}
          ${hasSchedule ? "has" : ""}"
        onclick="pickDate(${n})"
      >
        ${n}
      </button>
    `);
  }

  const selectedKey = key(selectedDate);

  const items = S.schedule.filter(
    x => (x.date || todayKey) === selectedKey
  );

  return (
    head(
      `${y}.${String(m + 1).padStart(2, "0")}`,
      "予定もToDoも、ここから見渡せる。"
    ) +

    `<div class="calendar-nav">
      <button onclick="changeMonth(-1)">‹</button>
      <b>${y}年${m + 1}月</b>
      <button onclick="changeMonth(1)">›</button>
    </div>` +

    `<div class="seg">
      <button class="active">Month</button>
      <button>Week</button>
      <button>Day</button>
    </div>` +

    `<section class="section">
      <div class="card">
        <div class="calendar-grid">
          ${["日", "月", "火", "水", "木", "金", "土"]
            .map(x => `<div class="dow">${x}</div>`)
            .join("")}
          ${cells.join("")}
        </div>
      </div>
    </section>` +

    section(
      `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の予定`,
      items.length
        ? items.map(x => `
          <div class="row">
            <span class="pill">${esc(x.time)}</span>
            <div>${esc(x.title)}</div>
          </div>
        `).join("")
        : `<div class="empty">この日の予定はまだないよ。</div>`
    )
  );
}


/* =========================
   MONTH CHANGE
========================= */

function changeMonth(delta) {
  viewDate = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + delta,
    1
  );

  selectedDate = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  );

  render();
}


/* =========================
   DATE SELECT
========================= */

function pickDate(n) {
  selectedDate = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    n
  );

  render();
}


/* =========================
   SEARCH
========================= */

function search() {
  return (
    head(
      "Search",
      "lueurの中にあるものを、まとめて探す。"
    ) +

    `<div class="search">
      <span>⌕</span>
      <input
        id="q"
        placeholder="予定、ToDo、日記、メモ…"
        oninput="find(this.value)"
      >
    </div>

    <div id="results" class="empty">
      検索するとここに表示されるよ。
    </div>`
  );
}


/* =========================
   MENU
========================= */

const menus = [
  "Goals",
  "Habits",
  "Study Plan",
  "Memo",
  "Tweets",
  "Diary",
  "Places",
  "Photos",
  "Notifications",
  "Music",
  "AI",
  "振り返り",
  "Settings",
  "Trash"
];

function menu() {
  return (
    head(
      "Menu",
      "自分の生活を、大切にしまっておく場所。"
    ) +

    `<div class="menu-grid">
      ${menus.map(x => `
        <button
          class="menu-item"
          onclick="alert('${x}はこれから順番に完成させるよ')"
        >
          <b>${x}</b>
          <span>開く</span>
        </button>
      `).join("")}
    </div>`
  );
}


/* =========================
   RENDER
========================= */

function render() {
  const app = $("#app");

  if (!app) return;

  if (tab === "today") {
    app.innerHTML = today();
  } else if (tab === "calendar") {
    app.innerHTML = calendar();
  } else if (tab === "search") {
    app.innerHTML = search();
  } else {
    app.innerHTML = menu();
  }

  $$(".tab").forEach(x => {
    x.classList.toggle(
      "active",
      x.dataset.tab === tab
    );
  });
}


/* =========================
   TODO
========================= */

function toggle(id) {
  const t = S.todos.find(x => x.id === id);

  if (!t) return;

  t.done = !t.done;

  save();
  render();
}


/* =========================
   ADD
========================= */

function add(type) {
  const isSchedule =
    type === "Schedule" ||
    type === "予定" ||
    type === "スケジュール";

  const defaultDate = key(selectedDate);

  $("#modalRoot").innerHTML = `
    <div class="modal-back">
      <div class="modal">

        <button
          class="close"
          onclick="closeM()"
        >
          ×
        </button>

        <h2>
          ${isSchedule ? "予定を追加" : "ToDoを追加"}
        </h2>

        <div class="field">
          <label>名前</label>
          <input id="newTitle">
        </div>

        ${
          isSchedule
            ? `
              <div class="field">
                <label>日付</label>
                <input
                  id="newDate"
                  type="date"
                  value="${defaultDate}"
                >
              </div>

              <div class="field">
                <label>時間</label>
                <input
                  id="newTime"
                  type="time"
                  value="18:00"
                >
              </div>
            `
            : ""
        }

        <button
          class="primary"
          onclick="saveNew('${isSchedule ? "Schedule" : "ToDo"}')"
        >
          追加する
        </button>

      </div>
    </div>
  `;
}


/* =========================
   SAVE NEW
========================= */

function saveNew(type) {
  const titleElement = $("#newTitle");

  if (!titleElement) return;

  const title = titleElement.value.trim();

  if (!title) return;

  if (type === "Schedule") {
    const date =
      $("#newDate").value ||
      key(selectedDate);

    const time =
      $("#newTime").value ||
      "18:00";

    S.schedule.push({
      time,
      title,
      date
    });
  } else {
    S.todos.push({
      id: Date.now(),
      title,
      done: false
    });
  }

  save();
  closeM();
  render();
}


/* =========================
   CLOSE MODAL
========================= */

function closeM() {
  const root = $("#modalRoot");

  if (root) {
    root.innerHTML = "";
  }
}


/* =========================
   SEARCH FUNCTION
========================= */

function find(q) {
  const r = $("#results");

  if (!r) return;

  if (!q) {
    r.className = "empty";
    r.textContent =
      "検索するとここに表示されるよ。";
    return;
  }

  const results = [
    ...S.todos.map(x => ["ToDo", x.title]),
    ...S.schedule.map(x => ["Schedule", x.title])
  ].filter(x => x[1].includes(q));

  r.className = "card";

  r.innerHTML = results.length
    ? results.map(x => `
        <div class="row">
          <span class="pill">${x[0]}</span>
          ${esc(x[1])}
        </div>
      `).join("")
    : `<div class="empty">見つからなかったよ。</div>`;
}


/* =========================
   MAKE FUNCTIONS AVAILABLE
   TO BUTTONS IN HTML
========================= */

window.changeMonth = changeMonth;
window.pickDate = pickDate;
window.add = add;
window.saveNew = saveNew;
window.closeM = closeM;
window.toggle = toggle;
window.find = find;


/* =========================
   NAVIGATION
========================= */

$$(".tab").forEach(button => {
  button.onclick = () => {
    tab = button.dataset.tab;
    render();
  };
});

const addButton = $("#addButton");

if (addButton) {
  addButton.onclick = () => add("schedule");
}


/* =========================
   START
========================= */

save();
render();
