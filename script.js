const categories = {
  all: "همه اخبار",
  economic: "اقتصادی",
  sport: "ورزشی",
  political: "سیاسی",
  cultural: "فرهنگی",
  international: "بین‌الملل",
  game: "بازی"
};

const sources = {
  economic: [{ name: "اقتصاد آنلاین", url: "https://www.eghtesadonline.com/rss" }],
  sport: [{ name: "ورزش سه", url: "https://www.varzesh3.com/rss" }],
  political: [{ name: "ایرنا", url: "https://www.irna.ir/rss/tp/1" }],
  cultural: [
    { name: "مهر", url: "https://www.mehrnews.com/rss/tp/4" },
    { name: "تسنیم", url: "https://www.tasnimnews.com/rss/tp/14" }
  ],
  international: [{ name: "خبرآنلاین", url: "https://www.khabaronline.ir/rss/tp/3" }],
  game: [{ name: "گیم‌گپ", url: "https://gamegap.ir/feed/" }]
};

function stripHTML(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

async function loadCategory(catKey) {
  const newsEl = document.getElementById("news");
  newsEl.innerHTML = "در حال دریافت اخبار...";

  let items = [];
  const list = catKey === "all" 
    ? Object.values(sources).flat() 
    : sources[catKey] || [];

  for (const src of list) {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}`);
      const data = await res.json();
      if (data.status === "ok" && data.items) {
        data.items.forEach(item => {
          item.sourceName = src.name;
          items.push(item);
        });
      }
    } catch (e) {
      console.warn("خطا در:", src.name);
    }
  }

  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  if (catKey === "all" && items[0]) {
    document.getElementById("breaking").textContent = "🔔 خبر فوری: " + stripHTML(items[0].title);
  }

  renderNews(items.slice(0, 20));
}

function renderNews(items) {
  const newsEl = document.getElementById("news");
  newsEl.innerHTML = "";

  items.forEach(item => {
    const title = stripHTML(item.title);
    const summary = stripHTML(item.description).substring(0, 120) + "...";

    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <h3>${title}</h3>
      <div class="summary">${summary}</div>
      <a href="${item.link}" target="_blank" rel="noopener" class="view-btn">مشاهده خبر</a>
    `;
    newsEl.appendChild(card);
  });
}

function initUI() {
  const catNav = document.getElementById("categories");
  Object.entries(categories).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (key === "all") btn.classList.add("active");
    btn.onclick = () => {
      document.querySelectorAll("#categories button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadCategory(key);
    };
    catNav.appendChild(btn);
  });
  loadCategory("all");
}

document.addEventListener("DOMContentLoaded", initUI);
