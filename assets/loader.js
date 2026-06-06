/* ============================================================
   LOADER — turns each post directory into a post object.
   Reads p<N>/post<N>.txt and probes for slideN.png files.
   Exposed as window.IGLoader.
   ============================================================ */

window.IGLoader = (function () {
  // --------------------------------------------------------
  // .txt parser
  // --------------------------------------------------------
  // Expected format (see p1/post1.txt for reference):
  //   post_type: "single" | "carousel" | "story"
  //   caption:
  //   "
  //   <multiline string, may contain embedded "quotes">
  //   "
  //   ...or...   caption: NULL
  //   hashtags: "#a", "#b", "#c"      OR  hashtags: NULL
  //   pinned: TRUE | FALSE
  function parseTxt(text) {
    const out = {
      post_type: null,
      caption: null,
      hashtags: null,
      pinned: false,
    };

    // post_type
    const ptMatch = text.match(/post_type\s*:\s*"([^"]+)"/i);
    if (ptMatch) out.post_type = ptMatch[1].trim().toLowerCase();

    // caption: parse line-by-line so embedded quotes inside the caption
    // do not get treated as the closing delimiter.
    out.caption = extractCaption(text);

    // hashtags: NULL | "#a", "#b", ...
    if (/hashtags\s*:\s*NULL/i.test(text)) {
      out.hashtags = null;
    } else {
      const hLine = text.match(/hashtags\s*:\s*([^\n\r]+)/i);
      if (hLine) {
        const tags = [...hLine[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        if (tags.length) out.hashtags = tags;
      }
    }

    // pinned: TRUE | FALSE
    const pinMatch = text.match(/pinned\s*:\s*(TRUE|FALSE)/i);
    if (pinMatch) out.pinned = pinMatch[1].toUpperCase() === "TRUE";

    return out;
  }

  // The caption block uses a Python-style triple-quote-ish format: a line
  // containing only `"` opens it, and a later line containing only `"`
  // closes it. Anything between is the caption body (quotes included).
  function extractCaption(text) {
    if (/caption\s*:\s*NULL/i.test(text)) return null;

    const lines = text.split(/\r?\n/);
    let capLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*caption\s*:/i.test(lines[i])) {
        capLine = i;
        break;
      }
    }
    if (capLine < 0) return null;

    // Inline single-line form: caption: "..."
    const rest = lines[capLine].replace(/^\s*caption\s*:\s*/i, "");
    if (rest.startsWith('"') && rest.length > 1 && rest.endsWith('"')) {
      return rest.slice(1, -1);
    }

    // Multi-line form: opening `"` on its own line after the caption: line,
    // closing `"` on its own line.
    const openLineRe = /^\s*"\s*$/;
    let openIdx = -1;
    for (let i = capLine + 1; i < lines.length; i++) {
      if (openLineRe.test(lines[i])) {
        openIdx = i;
        break;
      }
      // If we hit the next field before finding an opening quote, give up.
      if (/^\s*(post_type|hashtags|pinned)\s*:/i.test(lines[i])) return null;
    }
    if (openIdx < 0) return null;

    let closeIdx = -1;
    for (let i = openIdx + 1; i < lines.length; i++) {
      if (openLineRe.test(lines[i])) {
        closeIdx = i;
        break;
      }
    }
    if (closeIdx < 0) return null;

    return lines.slice(openIdx + 1, closeIdx).join("\n");
  }

  // --------------------------------------------------------
  // Slide detection — probe slide1.png, slide2.png, ... until a 404.
  // --------------------------------------------------------
  async function detectSlides(id, max = 30) {
    const slides = [];
    for (let i = 1; i <= max; i++) {
      const path = `${id}/slide${i}.png`;
      let ok = false;
      try {
        const r = await fetch(path, { method: "HEAD" });
        ok = r.ok;
      } catch {
        ok = false;
      }
      if (!ok) break;
      slides.push(`slide${i}.png`);
    }
    return slides;
  }

  // --------------------------------------------------------
  // Resolve the .txt filename from a directory id.
  // Convention: "p4" -> "p4/post4.txt"
  //             "p10" -> "p10/post10.txt"
  // If the prefix is something other than "p", we still try
  // "<id>/<id>.txt" as a fallback so this is reusable.
  // --------------------------------------------------------
  function txtPathsFor(id) {
    const numMatch = id.match(/(\d+)$/);
    const candidates = [];
    if (numMatch) candidates.push(`${id}/post${numMatch[1]}.txt`);
    candidates.push(`${id}/${id}.txt`);
    candidates.push(`${id}/post.txt`);
    return candidates;
  }

  async function fetchFirstAvailable(paths) {
    for (const p of paths) {
      try {
        const r = await fetch(p);
        if (r.ok) return { path: p, text: await r.text() };
      } catch {}
    }
    return null;
  }

  // --------------------------------------------------------
  // Load a single post.
  // Returns a normalized post object, or null if the post
  // cannot be loaded (e.g. missing .txt or no slides yet).
  // --------------------------------------------------------
  async function loadPost(id) {
    const txtResult = await fetchFirstAvailable(txtPathsFor(id));
    if (!txtResult) {
      console.warn(
        `[loader] Skipping "${id}": no post .txt found at any of ${txtPathsFor(id).join(", ")}`
      );
      return null;
    }

    const parsed = parseTxt(txtResult.text);
    if (!parsed.post_type) {
      console.warn(`[loader] Skipping "${id}": post_type missing in ${txtResult.path}`);
      return null;
    }

    const slides = await detectSlides(id);
    if (slides.length === 0) {
      console.warn(`[loader] Skipping "${id}": no slide*.png files found in ${id}/`);
      return null;
    }

    return {
      id,
      type: parsed.post_type,
      // Stories are always pinned (per campaign spec).
      pinned: parsed.post_type === "story" ? true : parsed.pinned,
      slides,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    };
  }

  // --------------------------------------------------------
  // Load all posts listed in window.IG_CONFIG.posts, preserving order.
  // Skips any that fail to load (with a console.warn).
  // --------------------------------------------------------
  async function loadAll(ids) {
    const results = await Promise.all(ids.map((id) => loadPost(id)));
    const ok = results.filter((p) => p !== null);
    const skipped = ids.filter((_, i) => results[i] === null);
    console.log(
      `[loader] Loaded ${ok.length}/${ids.length} posts:`,
      ok.map((p) => `${p.id}(${p.type}${p.pinned ? "/pinned" : ""}, ${p.slides.length}×)`).join(", "),
      skipped.length ? `  Skipped: ${skipped.join(", ")}` : ""
    );
    return ok;
  }

  return { parseTxt, detectSlides, loadPost, loadAll };
})();
