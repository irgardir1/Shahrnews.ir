// ========== دسته‌بندی‌ها ==========
const categories = {
  all: "همه اخبار",
  political: "سیاسی",
  economic: "اقتصادی",
  sport: "ورزشی",
  science: "علمی",
  cultural: "فرهنگی و هنری",
  market: "بازار",
  cinema: "سینما و هنر",
  game: "بازی و گیم",
  international: "بین‌الملل"
};

const categoryMap = {
  political: "politics",
  economic: "economy",
  sport: "sports",
  science: "science",
  cultural: "culture",
  market: "market",
  cinema: "cinema",
  game: "gaming",
  international: "international"
};

// ========== منابع RSS (بدون فاصله اضافه!) ==========
const sources = {
  political: [
    { name: "خبرگزاری جمهوری اسلامی", url: "https://www.irna.ir/rss/tp/1" },
    { name: "خبرآنلاین - سیاسی", url: "https://www.khabaronline.ir/rss/tp/1" }
  ],
  economic: [
    { name: "اقتصاد آنلاین", url: "https://www.eghtesadonline.com/rss" },
    { name: "ایسنا - اقتصادی", url: "https://www.isna.ir/rss/tp/33" }
  ],
  sport: [
    { name: "ورزش سه", url: "https://www.varzesh3.com/rss" },
    { name: "فارس - ورزشی", url: "https://www.farsnews.ir/rss/tp/6" }
  ],
  science: [
    { name: "ایسنا - علمی", url: "https://www.isna.ir/rss/tp/60" },
    { name: "خبرگزاری دانشجو - علمی", url: "https://www.isna.ir/rss/tp/180" }
  ],
  cultural: [
    { name: "مهر - فرهنگی", url: "https://www.mehrnews.com/rss/tp/4" },
    { name: "ایسنا - فرهنگی", url: "https://www.isna.ir/rss/tp/5" }
  ],
  market: [
    { name: "بورس نیوز", url: "https://www.boursenews.ir/rss" },
    { name: "کالا نیوز", url: "https://www.kalanews.ir/rss" }
  ],
  cinema: [
    { name: "تسنیم - سینما", url: "https://www.tasnimnews.com/rss/tp/14" },
    { name: "ایمنا - سینما", url: "https://www.ayandnews.ir/rss/tp/18" }
  ],
  game: [
    { name: "دیجی‌رُند", url: "https://digi-rund.ir/feed/" },
    { name: "گیم‌گپ", url: "https://gamegap.ir/feed/" }
  ],
  international: [
    { name: "ایرنا - بین‌الملل", url: "https://www.irna.ir/rss/tp/7" },
    { name: "خبرآنلاین - بین‌الملل", url: "https://www.khabaronline.ir/rss/tp/3" }
  ]
};

// ========== عناصر DOM ==========
const newsEl = document.getElementById("news");
const catEl = document.getElementById("categories");
const breakingEl = document.getElementById("breaking");
const darkBtn = document.getElementById("darkBtn");

// ========== ساخت منوی دسته‌ها ==========
Object.keys(categories).forEach((key, i) => {
  const btn = document.createElement("button");
  btn.textContent = categories[key];
  if (i === 0) btn.classList.add("active");
  btn.onclick = () => loadCategory(key, btn);
  catEl.appendChild(btn);
});

// ========== استخراج هوشمند تصویر ==========
function getThumbnail(item) {
  // 1. thumbnail مستقیم (مثل varzesh3)
  if (item.thumbnail) return item.thumbnail;

  // 2. enclosure (مثل eghtesadonline.com)
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  // 3. تصویر در description (مثل isna, tasnim)
  const imgMatch = item.description?.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return null;
}

// ========== انتخاب تصویر جایگزین ==========
function getFallbackImage(categoryKey) {
  const term = categoryMap[categoryKey] || "news";
  return `https://source.unsplash.com/600x400/?${term}`;
}

// ========== پاک‌سازی HTML ==========
function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

// ========== escape نقل قول‌ها ==========
function escapeQuotes(text) {
  return (text || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ========== بارگذاری اخبار ==========
async function loadCategory(catKey, btn) {
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  newsEl.innerHTML = "در حال دریافت اخبار...";
  
  let items = [];
  const rssList = catKey === "all" 
    ? Object.values(sources).flat() 
    : sources[catKey] || [];

  for (const src of rssList) {
    try {
      const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}`;
      const res = await fetch(api);
      const data = await res.json();

      if (data.status === "ok" && data.items) {
        data.items.forEach(item => {
          item.sourceName = src.name;
          items.push(item);
        });
      }
    } catch (e) {
      console.warn("خطا در بارگذاری:", src.name, e);
    }
  }

  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  renderNews(items, catKey);
}

// ========== نمایش اخبار ==========
function renderNews(items, catKey) {
  newsEl.innerHTML = "";
  if (!items.length) {
    newsEl.innerHTML = "خبری یافت نشد.";
    return;
  }

  items.slice(0, 30).forEach((item, idx) => {
    if (idx === 0) {
      breakingEl.textContent = "🔔 خبر فوری: " + stripHTML(item.title);
    }

    const imgUrl = getThumbnail(item) || getFallbackImage(catKey);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgUrl}" 
           onerror="this.onerror=null;this.src='https://source.unsplash.com/600x400/?news'" 
           loading="lazy"
           alt="تصویر خبر">
      <div class="content">
        <h3>${escapeHTML(stripHTML(item.title))}</h3>
        <div class="meta">
          ${item.sourceName} • 
          ${new Date(item.pubDate).toLocaleDateString("fa-IR")}
        </div>
        <p>${escapeHTML(stripHTML(item.description).slice(0, 120))}...</p>
        <a href="${item.link}" target="_blank" rel="noopener">مشاهده خبر</a>
        <button class="fav" onclick="toggleFav('${escapeQuotes(stripHTML(item.title))}','${item.link}')">❤️</button>
      </div>
    `;
    newsEl.appendChild(card);
  });
}

// ========== escape HTML برای نمایش ایمن ==========
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// ========== ذخیره علاقه‌مندی‌ها ==========
function toggleFav(title, link) {
  let favs = JSON.parse(localStorage.getItem("favs") || "[]");
  const i = favs.findIndex(f => f.link === link);
  if (i > -1) favs.splice(i, 1);
  else favs.push({ title, link });
  localStorage.setItem("favs", JSON.stringify(favs));
  alert(i > -1 ? "از لیست علاقه‌مندی‌ها حذف شد" : "به لیست علاقه‌مندی‌ها اضافه شد");
}

// ========== حالت تاریک ==========
darkBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// ========== بارگذاری اولیه ==========
loadCategory("all", document.querySelector("nav button"));
