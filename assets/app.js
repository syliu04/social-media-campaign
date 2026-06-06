/* ============================================================
   @behindthealgorithm — Instagram-style profile UI
   Reads window.IG_CONFIG, loads posts via window.IGLoader,
   then renders the page and wires up the interactive components
   (carousel post modal + auto-advancing story viewer).
   ============================================================ */

(function () {
  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v !== undefined && v !== null && v !== false) {
        node.setAttribute(k, v === true ? "" : String(v));
      }
    }
    for (const child of [].concat(children)) {
      if (child == null || child === false) continue;
      node.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      );
    }
    return node;
  };

  const ICONS = {
    carousel: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.999 3h-9.5C9.121 3 8 4.121 8 5.499v9.5c0 1.378 1.121 2.499 2.499 2.499h9.5c1.378 0 2.499-1.121 2.499-2.499v-9.5C22.498 4.121 21.377 3 19.999 3Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"/>
      <path d="M4.499 7A1.5 1.5 0 0 0 3 8.5v10A2.5 2.5 0 0 0 5.5 21h10a1.5 1.5 0 0 0 1.5-1.5" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"/>
    </svg>`,
    pin: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3v6.5l3.5 3.5v3h-5v5l-1 1-1-1v-5h-5v-3L9 9.5V3" fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/>
    </svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z" fill="currentColor"/>
    </svg>`,
    comment: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="currentColor"/>
    </svg>`,
    chevLeft: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline fill="none" points="14 18 8 12 14 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/>
    </svg>`,
    chevRight: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline fill="none" points="10 6 16 12 10 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/>
    </svg>`,
  };

  const config = window.IG_CONFIG || {};
  const profile = config.profile || {};

  // ----------------------------------------------------------
  // Posting-schedule dates
  // ----------------------------------------------------------
  // Posts go out 3×/week on Mon/Wed/Fri. A post's date is derived from its
  // position in config.posts (the order you list them IS the posting order):
  // the Nth post in that array lands on the Nth posting day on/after
  // config.firstPostDate. Reorder the array and the dates follow. We store
  // nothing per-post — the date is computed, then shown as a live relative
  // time ("3 days ago") in the UI.
  const POSTING_WEEKDAYS = [1, 3, 5]; // Mon, Wed, Fri (0 = Sun)

  // Parse "YYYY-MM-DD" as a local-time date (avoids UTC off-by-one).
  function parseISODate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  // The Nth posting day (1-based) on/after the anchor date.
  function postingDate(n) {
    const anchor = parseISODate(config.firstPostDate);
    if (!anchor || !Number.isFinite(n) || n < 1) return null;
    const d = new Date(anchor);
    // Advance to the first valid posting weekday on/after the anchor.
    while (!POSTING_WEEKDAYS.includes(d.getDay())) d.setDate(d.getDate() + 1);
    // Then step forward (n - 1) more posting days.
    for (let count = 1; count < n; count++) {
      do {
        d.setDate(d.getDate() + 1);
      } while (!POSTING_WEEKDAYS.includes(d.getDay()));
    }
    return d;
  }

  // A post's ordinal is its 1-based position in config.posts — so the order
  // you list posts in IS their posting order. Returns null if not listed.
  function postOrdinal(id) {
    const order = Array.isArray(config.posts) ? config.posts : [];
    const i = order.indexOf(id);
    return i === -1 ? null : i + 1;
  }

  // Instagram-style relative time, computed against the real current date.
  function relativeTime(date) {
    if (!date) return "";
    const now = new Date();
    const sec = Math.floor((now - date) / 1000);
    if (sec < 60) return "Just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
    const wk = Math.floor(day / 7);
    if (wk < 5) return `${wk} week${wk === 1 ? "" : "s"} ago`;
    // Older than ~a month: fall back to an absolute date, IG-style.
    const opts = { month: "long", day: "numeric" };
    if (date.getFullYear() !== now.getFullYear()) opts.year = "numeric";
    return date.toLocaleDateString(undefined, opts);
  }

  // Relative time for a post/story object, by its folder number.
  function relativeTimeFor(post) {
    return relativeTime(postingDate(postOrdinal(post && post.id)));
  }

  // ----------------------------------------------------------
  // Apply profile config to all data-bind nodes
  // ----------------------------------------------------------
  function applyProfile() {
    document.title = config.pageTitle || document.title;
    const favicon = $("#favicon");
    if (favicon && config.favicon) favicon.href = config.favicon;

    $$("[data-avatar]").forEach((img) => {
      if (profile.avatar) img.src = profile.avatar;
    });

    $$("[data-bind]").forEach((node) => {
      const key = node.getAttribute("data-bind");
      const val = profile[key];
      if (val == null) return;
      if (key === "bio") {
        // preserve newlines exactly
        node.textContent = val;
      } else {
        node.textContent = val;
      }
    });

    $$("[data-bind-href]").forEach((node) => {
      const key = node.getAttribute("data-bind-href");
      const val = profile[key];
      if (val) node.href = val;
    });
  }

  // ----------------------------------------------------------
  // Render: highlights row
  // ----------------------------------------------------------
  function renderHighlights(stories) {
    const root = $("#highlights");
    if (!root) return;
    root.innerHTML = "";

    stories.forEach((story) => {
      // Label = the post id verbatim (e.g. "p4"), per spec.
      const label = story.id;
      const btn = el(
        "button",
        {
          class: "highlight",
          type: "button",
          "aria-label": `Open highlight ${label}`,
          onclick: () => openStory(story),
        },
        [
          el("span", { class: "highlight__ring" }, [
            el("span", { class: "highlight__cover" }, [
              el("img", { src: `${story.id}/${story.slides[0]}`, alt: "" }),
            ]),
          ]),
          el("span", { class: "highlight__label" }, label),
        ]
      );
      root.appendChild(btn);
    });
  }

  // ----------------------------------------------------------
  // Render: posts grid
  // ----------------------------------------------------------
  function buildTile(post) {
    const tile = el(
      "button",
      {
        class: "tile",
        type: "button",
        "aria-label": `Open ${post.id}${post.pinned ? " (pinned)" : ""}`,
        onclick: () => openPost(post),
      },
      [
        el("img", { src: `${post.id}/${post.slides[0]}`, alt: "" }),
        el("span", {
          class: "tile__hover",
          html: `<span>${ICONS.heart} 1.2k</span><span>${ICONS.comment} 24</span>`,
        }),
      ]
    );
    if (post.pinned) {
      tile.appendChild(el("span", { class: "tile__pin", html: ICONS.pin }));
    }
    if (post.type === "carousel") {
      tile.appendChild(
        el("span", { class: "tile__overlay-icon", html: ICONS.carousel })
      );
    }
    return tile;
  }

  function renderGrid(gridPosts) {
    const root = $("#grid");
    if (!root) return;
    root.innerHTML = "";
    gridPosts.forEach((post) => root.appendChild(buildTile(post)));
  }

  function updateCounts(gridPostsLength) {
    $$('[data-bind="posts"]').forEach((node) => {
      node.textContent = String(gridPostsLength);
    });
  }

  // ----------------------------------------------------------
  // Post modal (with carousel)
  // ----------------------------------------------------------
  const modal = $("#post-modal");
  const modalClose = $("#post-modal-close");
  const mediaEl = $("#post-media");
  const bodyEl = $("#post-body");

  let carousel = null;
  // Grid posts (non-story, in display order) — kept so the hashtag router
  // can filter them without reloading.
  let allGridPosts = [];

  function openPost(post) {
    bodyEl.innerHTML = "";
    mediaEl.innerHTML = "";

    const track = el("div", { class: "post__track" });
    post.slides.forEach((src) => {
      track.appendChild(
        el("div", { class: "post__slide" }, [
          el("img", { src: `${post.id}/${src}`, alt: "" }),
        ])
      );
    });
    mediaEl.appendChild(track);

    const isCarousel = post.slides.length > 1;

    let prevBtn = null;
    let nextBtn = null;
    let dotsEl = null;
    let counterEl = null;

    if (isCarousel) {
      prevBtn = el("button", {
        class: "post__nav post__nav--prev",
        type: "button",
        "aria-label": "Previous",
        html: ICONS.chevLeft,
      });
      nextBtn = el("button", {
        class: "post__nav post__nav--next",
        type: "button",
        "aria-label": "Next",
        html: ICONS.chevRight,
      });
      dotsEl = el("div", { class: "post__dots", role: "tablist" });
      post.slides.forEach(() =>
        dotsEl.appendChild(el("span", { class: "post__dot" }))
      );
      counterEl = el("div", { class: "post__counter" });
      mediaEl.appendChild(prevBtn);
      mediaEl.appendChild(nextBtn);
      mediaEl.appendChild(dotsEl);
      mediaEl.appendChild(counterEl);

      prevBtn.addEventListener("click", () => goTo(carousel.idx - 1));
      nextBtn.addEventListener("click", () => goTo(carousel.idx + 1));
    }

    carousel = {
      idx: 0,
      total: post.slides.length,
      track,
      dotsEl,
      counterEl,
      prevBtn,
      nextBtn,
    };
    goTo(0);
    attachSwipe(mediaEl);

    const captionRow = el("div", { class: "post__caption-row" }, [
      el("img", { src: profile.avatar || "account_profile_photo.png", alt: "" }),
      buildCaption(post),
    ]);
    bodyEl.appendChild(captionRow);

    const timeEl = $(".post__time", modal);
    if (timeEl) timeEl.textContent = relativeTimeFor(post);

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function buildCaption(post) {
    const wrap = el("div", { class: "post__caption" });

    const username = el("strong");
    username.textContent = profile.username || "user";
    wrap.appendChild(username);
    // Drop the caption body onto its own line beneath the username.
    wrap.appendChild(document.createTextNode("\n"));

    const caption = post.caption ? post.caption.trim() : "";
    const tags = Array.isArray(post.hashtags) ? post.hashtags.join(" ") : "";
    const text = tags ? `${caption}\n\n${tags}` : caption;
    appendFormattedText(wrap, text);
    return wrap;
  }

  function makeLink(href, label) {
    return el(
      "a",
      { class: "post__link", href, target: "_blank", rel: "noopener noreferrer" },
      [label]
    );
  }

  // Convert tabs to newlines and linkify markdown [text](url) links,
  // bare URLs, and #hashtags.
  function appendFormattedText(node, text) {
    if (!text) return;
    const normalized = text.replace(/\t/g, "\n");
    const lines = normalized.split("\n");
    // Each alternative captures one token type: markdown link, bare URL, hashtag.
    const TOKEN = /(\[[^\]]+\]\([^)\s]+\))|(https?:\/\/[^\s]+)|(#[\p{L}0-9_]+)/gu;
    lines.forEach((line, idx) => {
      let last = 0;
      let m;
      TOKEN.lastIndex = 0;
      while ((m = TOKEN.exec(line)) !== null) {
        if (m.index > last) {
          node.appendChild(document.createTextNode(line.slice(last, m.index)));
        }
        if (m[1]) {
          // [label](url)
          const inner = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(m[1]);
          node.appendChild(makeLink(inner[2], inner[1]));
        } else if (m[2]) {
          // Bare URL — peel off trailing punctuation so ")." etc. stay as text.
          let url = m[2];
          const trailMatch = /[.,;:!?)\]]+$/.exec(url);
          const trail = trailMatch ? trailMatch[0] : "";
          if (trail) url = url.slice(0, -trail.length);
          node.appendChild(makeLink(url, url));
          if (trail) node.appendChild(document.createTextNode(trail));
        } else if (m[3]) {
          // #Hashtag -> link to the in-app tag view (#tag/<name>).
          const tagName = m[3].slice(1);
          node.appendChild(
            el(
              "a",
              { class: "hashtag", href: `#tag/${encodeURIComponent(tagName)}` },
              [m[3]]
            )
          );
        }
        last = m.index + m[0].length;
      }
      if (last < line.length) {
        node.appendChild(document.createTextNode(line.slice(last)));
      }
      if (idx < lines.length - 1) {
        node.appendChild(document.createTextNode("\n"));
      }
    });
  }

  function goTo(i) {
    if (!carousel) return;
    const { total } = carousel;
    const idx = Math.max(0, Math.min(total - 1, i));
    carousel.idx = idx;
    carousel.track.style.transform = `translateX(-${idx * 100}%)`;
    if (carousel.dotsEl) {
      [...carousel.dotsEl.children].forEach((dot, di) =>
        dot.classList.toggle("post__dot--active", di === idx)
      );
    }
    if (carousel.counterEl) {
      carousel.counterEl.textContent = `${idx + 1}/${total}`;
    }
    if (carousel.prevBtn) carousel.prevBtn.toggleAttribute("disabled", idx === 0);
    if (carousel.nextBtn) carousel.nextBtn.toggleAttribute("disabled", idx === total - 1);
  }

  function attachSwipe(container) {
    let startX = 0;
    let lastX = 0;
    let dragging = false;
    const threshold = 40;
    const pointX = (e) => {
      if (e.touches && e.touches[0]) return e.touches[0].clientX;
      if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
      return e.clientX;
    };
    const onStart = (e) => {
      if (!carousel || carousel.total <= 1) return;
      dragging = true;
      startX = lastX = pointX(e);
    };
    const onMove = (e) => {
      if (!dragging) return;
      lastX = pointX(e);
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const dx = lastX - startX;
      if (Math.abs(dx) >= threshold) {
        goTo(carousel.idx + (dx < 0 ? 1 : -1));
      }
    };
    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchmove", onMove, { passive: true });
    container.addEventListener("touchend", onEnd);
    container.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onStart(e);
    });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
  }

  function closePost() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    carousel = null;
  }

  modalClose.addEventListener("click", closePost);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePost();
  });

  document.addEventListener("keydown", (e) => {
    if (modal.getAttribute("aria-hidden") === "false") {
      if (e.key === "Escape") closePost();
      if (carousel && carousel.total > 1) {
        if (e.key === "ArrowLeft") goTo(carousel.idx - 1);
        if (e.key === "ArrowRight") goTo(carousel.idx + 1);
      }
    }
  });

  // ----------------------------------------------------------
  // Story viewer
  // ----------------------------------------------------------
  const storyViewer = $("#story-viewer");
  const storyClose = $("#story-close");
  const storyPrev = $("#story-prev");
  const storyNext = $("#story-next");
  const storyImage = $("#story-image");
  const storyProgress = $("#story-progress");
  const storyStage = $("#story-stage");

  let storyState = null;
  const SLIDE_DURATION = 5000;

  function openStory(story) {
    storyState = {
      post: story,
      idx: 0,
      total: story.slides.length,
      paused: false,
    };
    storyProgress.innerHTML = "";
    for (let i = 0; i < storyState.total; i++) {
      storyProgress.appendChild(el("span", { class: "bar" }, [el("span")]));
    }
    const storyTimeEl = $(".story-viewer__time", storyViewer);
    if (storyTimeEl) storyTimeEl.textContent = `· ${relativeTimeFor(story)}`;
    storyViewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showStorySlide(0);
    attachStoryHold();
    attachStorySwipe();
  }

  function showStorySlide(i) {
    if (!storyState) return;
    if (i >= storyState.total) {
      closeStory();
      return;
    }
    if (i < 0) i = 0;
    storyState.idx = i;
    storyImage.src = `${storyState.post.id}/${storyState.post.slides[i]}`;
    const bars = [...storyProgress.querySelectorAll(".bar > span")];
    bars.forEach((b, bi) => {
      if (bi < i) b.style.width = "100%";
      else b.style.width = "0%";
    });
    startStoryTimer();
  }

  function startStoryTimer() {
    stopStoryTimer();
    if (!storyState) return;
    const fill = storyProgress.querySelectorAll(".bar > span")[storyState.idx];
    if (!fill) return;
    storyState.startTime = performance.now();
    storyState.elapsed = 0;

    const tick = (now) => {
      if (!storyState || storyState.paused) {
        storyState && (storyState._rafId = null);
        return;
      }
      const dt = now - storyState.startTime;
      const total = storyState.elapsed + dt;
      const pct = Math.min(100, (total / SLIDE_DURATION) * 100);
      fill.style.width = pct + "%";
      if (pct >= 100) {
        showStorySlide(storyState.idx + 1);
        return;
      }
      storyState._rafId = requestAnimationFrame(tick);
    };
    storyState._rafId = requestAnimationFrame(tick);
  }

  function stopStoryTimer() {
    if (storyState && storyState._rafId) {
      cancelAnimationFrame(storyState._rafId);
      storyState._rafId = null;
    }
  }

  function pauseStory() {
    if (!storyState || storyState.paused) return;
    storyState.paused = true;
    const now = performance.now();
    storyState.elapsed += now - storyState.startTime;
    stopStoryTimer();
  }
  function resumeStory() {
    if (!storyState || !storyState.paused) return;
    storyState.paused = false;
    startStoryTimer();
  }

  function attachStoryHold() {
    let downTimer = null;
    const startHold = () => {
      downTimer = setTimeout(pauseStory, 180);
    };
    const endHold = () => {
      if (downTimer) clearTimeout(downTimer);
      downTimer = null;
      if (storyState && storyState.paused) resumeStory();
    };
    storyStage.addEventListener("touchstart", startHold, { passive: true });
    storyStage.addEventListener("touchend", endHold);
    storyStage.addEventListener("touchcancel", endHold);
    storyStage.addEventListener("mousedown", startHold);
    storyStage.addEventListener("mouseup", endHold);
    storyStage.addEventListener("mouseleave", endHold);
  }

  function attachStorySwipe() {
    let sx = 0, ex = 0, dragging = false;
    const threshold = 50;
    storyStage.addEventListener("touchstart", (e) => {
      dragging = true;
      sx = ex = e.touches[0].clientX;
    }, { passive: true });
    storyStage.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      ex = e.touches[0].clientX;
    }, { passive: true });
    storyStage.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      const dx = ex - sx;
      if (Math.abs(dx) >= threshold && storyState) {
        showStorySlide(storyState.idx + (dx < 0 ? 1 : -1));
      }
    });
  }

  function closeStory() {
    storyViewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    stopStoryTimer();
    storyState = null;
  }

  storyClose.addEventListener("click", closeStory);
  storyPrev.addEventListener("click", () => {
    if (storyState) showStorySlide(storyState.idx - 1);
  });
  storyNext.addEventListener("click", () => {
    if (storyState) showStorySlide(storyState.idx + 1);
  });

  document.addEventListener("keydown", (e) => {
    if (storyViewer.getAttribute("aria-hidden") === "false") {
      if (e.key === "Escape") closeStory();
      if (e.key === "ArrowLeft" && storyState) showStorySlide(storyState.idx - 1);
      if (e.key === "ArrowRight" && storyState) showStorySlide(storyState.idx + 1);
    }
  });

  // ----------------------------------------------------------
  // Hashtag router — "#tag/<name>" shows a page of matching posts
  // ----------------------------------------------------------
  const tagView = $("#tag-view");

  // Normalize a hashtag for comparison: drop a leading '#', lowercase.
  function normalizeTag(s) {
    return String(s || "").replace(/^#/, "").toLowerCase();
  }

  // Parse the current location hash -> decoded tag name, or null.
  function tagFromHash() {
    const m = /^#tag\/(.+)$/.exec(location.hash);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch (e) {
      return m[1];
    }
  }

  // Toggle between the profile page and the tag page. We hide every direct
  // child of <main> except the tag view (the modal/story viewer live outside
  // <main>, so they're unaffected).
  function setTagMode(on) {
    if (!tagView) return;
    $$(".ig-main > *").forEach((node) => {
      if (node === tagView) return;
      node.style.display = on ? "none" : "";
    });
    tagView.hidden = !on;
  }

  function goToProfile() {
    // Drop the hash without adding history noise, then re-route.
    if (location.hash) {
      history.replaceState("", document.title, location.pathname + location.search);
    }
    handleRoute();
  }

  function renderTagView(tag) {
    if (!tagView) return;
    const norm = normalizeTag(tag);
    const matches = allGridPosts.filter(
      (p) =>
        Array.isArray(p.hashtags) &&
        p.hashtags.some((h) => normalizeTag(h) === norm)
    );
    // Prefer the canonical casing as written in the posts.
    let label = tag;
    for (const p of matches) {
      const hit = p.hashtags.find((h) => normalizeTag(h) === norm);
      if (hit) { label = hit.replace(/^#/, ""); break; }
    }

    const back = el(
      "button",
      { class: "tagview__back", type: "button" },
      [el("span", { class: "tagview__back-icon", html: ICONS.chevLeft }), "Back"]
    );
    back.addEventListener("click", goToProfile);

    const header = el("div", { class: "tagview__header" }, [
      back,
      el("div", { class: "tagview__heading" }, [
        el("div", { class: "tagview__tag" }, [`#${label}`]),
        el("div", { class: "tagview__count" }, [
          `${matches.length} post${matches.length === 1 ? "" : "s"}`,
        ]),
      ]),
    ]);

    tagView.innerHTML = "";
    tagView.appendChild(header);

    if (matches.length === 0) {
      tagView.appendChild(
        el("p", { class: "tagview__empty" }, ["No posts found with this hashtag."])
      );
    } else {
      const grid = el("div", { class: "grid tagview__grid" });
      matches.forEach((post) => grid.appendChild(buildTile(post)));
      tagView.appendChild(grid);
    }
    window.scrollTo(0, 0);
  }

  function handleRoute() {
    const tag = tagFromHash();
    if (tag) {
      closePost();
      closeStory();
      renderTagView(tag);
      setTagMode(true);
    } else {
      setTagMode(false);
    }
  }

  window.addEventListener("hashchange", handleRoute);

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  async function init() {
    applyProfile();

    const ids = Array.isArray(config.posts) ? config.posts : [];
    if (ids.length === 0) {
      console.warn("[app] window.IG_CONFIG.posts is empty.");
      return;
    }

    let posts = [];
    try {
      posts = await window.IGLoader.loadAll(ids);
    } catch (err) {
      console.error("[app] Failed to load posts:", err);
      const grid = $("#grid");
      if (grid) {
        grid.innerHTML =
          '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#737373">' +
          "Couldn't load posts. If you're opening this file directly, run a local server " +
          "instead:  <code>python3 -m http.server 8000</code>" +
          "</p>";
      }
      return;
    }

    // Split: stories go to the highlights row; everything else to the grid.
    const stories = posts.filter((p) => p.type === "story");
    const gridPostsRaw = posts.filter((p) => p.type !== "story");

    // Pinned posts first (preserving config order within each group).
    const pinned = gridPostsRaw.filter((p) => p.pinned);
    const others = gridPostsRaw.filter((p) => !p.pinned);
    const gridPosts = [...pinned, ...others];

    allGridPosts = gridPosts;
    renderHighlights(stories);
    renderGrid(gridPosts);
    updateCounts(gridPosts.length);

    // Honor a #tag/... hash if the page was opened/reloaded directly on one.
    handleRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
