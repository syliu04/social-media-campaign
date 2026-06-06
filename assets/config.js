/* ============================================================
   SITE CONFIGURATION — single source of truth
   ------------------------------------------------------------
   Edit this file (and only this file) to:
     • add or remove a post / story
     • update profile info, bio, link, follower counts
     • change the page title and favicon

   How to add a new post:
     1. Create a directory at the project root named p<N>/ (e.g. "p5")
     2. Inside it, place:
          • post<N>.txt   — the post metadata file (same format as p1/post1.txt)
          • slide1.png    — first slide (also slide2.png, slide3.png, ... as needed)
     3. Add the directory name (e.g. "p5") to the `posts` array below.

   The loader will:
     • read post<N>.txt and parse post_type, caption, hashtags, pinned
     • auto-detect how many slides exist (slide1.png, slide2.png, ...)
     • render carousels / single posts in the grid, and stories as highlights
     • force pinned=TRUE on any post whose type is "story"
     • use the directory name (e.g. "p4") as the story-highlight label
   ============================================================ */

window.IG_CONFIG = {
  // ---- Page chrome -----------------------------------------------------
  pageTitle: "Behind The Algorithm (@behindthealgorithm) • Instagram",
  favicon: "account_profile_photo.png",

  // ---- Profile ---------------------------------------------------------
  profile: {
    username: "behindthealgorithm",
    name: "Behind The Algorithm",
    category: "Digital creator · AI ethics",
    avatar: "account_profile_photo.png",
    bio:
`Decoding how AI quietly shapes your life 🤖
Algorithms, surveillance, biased data explained.
🎓 Student-led | 🔔 New posts 3×/week

💬 Drop your questions in the DMs`,
    link: "links.html",
    linkLabel: "Sources & deeper reads",
    followers: "12.4K",
    following: "287",
    // Where the post-header in the modal says "AI ethics" under the username
    postLocation: "AI ethics",
  },

  // ---- Posting schedule ------------------------------------------------
  // The campaign posts 3×/week (Mon/Wed/Fri). Post dates are computed
  // automatically from this anchor and the ORDER of the `posts` array below:
  // the 1st post listed is published on `firstPostDate`, the 2nd on the next
  // Mon/Wed/Fri, and so on. Reorder the array and the dates follow it. The
  // UI shows these as relative times ("3 days ago"), computed live.
  //
  // To shift every date, just change this one value. It should land on a
  // Mon, Wed, or Fri. (2026-04-27 is a Monday → the 16th/last post listed
  // lands on Mon 2026-06-01.)
  firstPostDate: "2026-04-27",

  // ---- Posts -----------------------------------------------------------
  // List the directory name of each post you want to display, in the
  // order you want them rendered. Pinned posts (and stories) are
  // automatically lifted to the front of their respective sections.
  // To add p5, p6, ... once those .txt files exist, just append them here.
  posts: [
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "p7",
    "p8",
    "p9",
    "p12",
    "p10",
    "p11",
    "p13",
    "p14",
    "p15",
    "p16"
  ],
};
