# Behind The Algorithm: A Social Media Campaign

**Live demo:** https://syliu04.github.io/social-media-campaign/

*Behind The Algorithm* (`@behindthealgorithm`) is a student-led Instagram campaign about
how AI decision-making systems quietly shape people's lives. The campaign argues that
bias in these systems isn't an accident. It gets built in at every stage, from the data
the models learn from to where they end up getting deployed.

Instead of writing a document that describes a mockup of an account, I built the campaign
as a working Instagram-style website. You can click through it the same way a follower
would, which felt like a truer way to present a social media campaign than a static
write-up.

## Campaign at a glance

| | |
|---|---|
| **Advocacy goal** | Help a general audience understand how biased AI shapes hiring, surveillance, and the information we see, and point readers toward concrete things they can actually do (auditing their own digital footprint, learning their state's AI laws, building a habit of checking before sharing, following advocacy orgs). |
| **Audience** | Primary audience is high school students, college students, and early-career people in tech, data, and digital ethics on Instagram. Secondary audience is students in law, communication, public policy, and social science who care about surveillance, discrimination, and privacy. |
| **Platform** | Instagram. Carousels, single graphics, and Stories all count as posts, and that mix fits a topic that needs to stay visually clear and easy to read in short bursts. |
| **Post count** | 16 posts total, above the 15-post minimum. |
| **Multimedia** | 8 of the 16 are multimedia (6 carousels and 2 Story series), above the 5-multimedia minimum. |
| **Posting cadence** | Three times a week (Mon/Wed/Fri). The dates come from an anchor date in the config and show up as live relative timestamps like "3 days ago." |

## How to navigate the website

1. Open the demo at https://syliu04.github.io/social-media-campaign/
2. Read the profile header for the username, avatar, bio, follower and following counts,
   and the "Sources & deeper reads" link, the same way you'd skim any campaign account.
3. Tap the Story highlights (the circles under the bio) to open the full-screen Story
   viewer, then tap the right or left side of the screen to move between slides.
4. Click any post tile in the grid to open it with its full caption. Carousel posts have
   several slides, so swipe or use the arrows to move through them.
5. Click any hashtag inside a caption, like `#FacialRecognition`, to jump to a page that
   shows every post sharing that hashtag. Use your browser's back button to return.
6. Click a source link inside a caption, or the "Sources & deeper reads" link in the bio,
   to open [`links.html`](links.html), which lists every study, government report, and law
   the campaign cites.

## Features and the choices behind them

### It looks and behaves like a real Instagram profile

The whole interface mirrors Instagram: the top bar, the profile header with stats, the
Story highlights, the three-column post grid, the post view, the full-screen Story viewer,
and the mobile bottom nav.

I wanted the audience to read the campaign the way they read any account they already
follow, with no learning curve and no "academic document" framing around it. Building it
inside a real Instagram shell also means the design choices can be judged as actual social
media, which is the whole point of the assignment. The format carries part of the message:
this is content meant to live in the feed where the audience already spends time, not a
report about that content.

### Working hashtags that group related posts

Clicking a hashtag in any caption takes you to a results page that lists every post with
that tag. The recurring tags (`#FacialRecognition`, `#Surveillance`, `#HiringAlgorithms`,
`#Disinformation`, `#DigitalRights`, and others) are what hold the campaign together.

Real campaigns lean on hashtags to make posts discoverable and to bundle a longer argument
into themes people can browse. Someone who lands on one facial-recognition post can pull up
the rest in one tap, which turns a single scroll-by into a self-guided deep dive. Making
the hashtags actually work, instead of leaving them as plain text, was a way to use a real
platform feature on purpose so the 16 posts read as one connected campaign rather than a
pile of separate graphics.

### Every claim is sourced, with course readings and outside research

Captions cite their sources as links you can tap, and the "Sources & deeper reads" button
in the bio opens [`links.html`](links.html). That page sorts the references into core
course readings, government and policy sources I added on top of the assigned readings, and
advocacy orgs worth following.

Credibility matters a lot when you're trying to persuade a general audience about a
technical justice issue. Putting the sources one tap away from each post makes it easy to
go learn more, and it quietly models the same careful sourcing the campaign asks readers to
practice when it talks about misinformation. Pairing the peer-reviewed course readings with
current U.S. government and policy sources from 2019 to 2026 shows the issue is both well
grounded academically and very much live right now.

## Posts at a glance

Posts are listed in the order they appear on the profile. The carousel and story types are
the multimedia posts. Pinned posts and Stories get lifted to the front of their sections
automatically.

| # | Folder | Type | Slides | Pinned | Theme / hook | Hashtags |
|--:|--------|------|:------:|:------:|--------------|----------|
| 1 | `p1` | single | 1 | yes | Welcome and mission. An algorithm is reading you before any human does | `#AIethics` `#AlgorithmicBias` `#DigitalRights` `#StudentLife` |
| 2 | `p2` | carousel | 5 | | "The algorithm is just objective," and how bias gets laundered as neutrality | `#AIBias` `#AlgorithmicAccountability` `#DataEthics` |
| 3 | `p3` | single | 1 | | Hiring AI scans applicants' posts, photos, and captions. No score, no appeal | `#HiringAlgorithms` `#JobSearch` `#StudentLife` |
| 4 | `p4` | story | 4 | yes | Story series. Stories carry the engagement layer, so no caption or hashtags | N/A |
| 5 | `p5` | single | 1 | | Facial-recognition "ethics codes" versus demographic misidentification | `#FacialRecognition` `#Surveillance` `#DigitalRights` |
| 6 | `p6` | single | 1 | | "It's just math." Code inherits bias, then hides it behind objectivity | `#AIMyths` `#AlgorithmicBias` `#CriticalThinking` |
| 7 | `p7` | carousel | 4 | | Three experiments you can run today to make the invisible visible | `#AIethics` `#DigitalLife` `#BigData` `#Surveillance` |
| 8 | `p8` | story | 4 | yes | Story series. Stories carry the engagement layer, so no caption or hashtags | N/A |
| 9 | `p9` | carousel | 4 | | 13% of group-chat images were misinformation. Build a 3-second habit | `#Deepfakes` `#MediaLiteracy` `#Disinformation` |
| 10 | `p12` | single | 1 | | Visual misinformation, and how even real footage stops being trusted | `#Disinformation` `#MediaLiteracy` `#VisualMisinformation` |
| 11 | `p10` | single | 1 | | Next steps. Pick one action and do it this week | `#AIaccountability` `#DigitalRights` `#StudentAdvocacy` |
| 12 | `p11` | carousel | 5 | | Big data. The database keeps growing, with a purpose planned for later | `#BigData` `#Surveillance` `#DigitalRights` `#DataEthics` |
| 13 | `p13` | carousel | 4 | | Clean up your digital footprint before recruiting season | `#JobSearch` `#DigitalFootprint` `#StudentLife` |
| 14 | `p14` | single | 1 | yes | Closing thank-you. The systems aren't going away, but neither are we | `#AIethics` `#DigitalRights` `#AlgorithmicAccountability` `#StudentAdvocacy` |
| 15 | `p15` | carousel | 5 | yes | The 2025 federal rollback versus new IL, TX, and CO state AI laws | `#AIregulation` `#WorkersRights` `#DigitalRights` `#AIpolicy` |
| 16 | `p16` | single | 1 | | NIST's own test found false-positive rates 10 to 100 times higher by demographic | `#FacialRecognition` `#NIST` `#AIbias` `#Surveillance` |

Totals: 16 posts, made up of 8 single graphics, 6 carousels, and 2 Story series, for 8
multimedia posts.

## How the campaign maps to the assignment

- Communicates a technical social-justice issue to a general audience: algorithmic bias,
  surveillance, and mis/disinformation, all in plain, conversational language.
- States a problem and proposes action. Most posts end with a concrete, doable step, like
  auditing your footprint, checking your state's AI law, building a verification habit, or
  following an advocacy org.
- Includes a full profile mockup: username, avatar, bio, category, follower and following
  counts, pinned posts, and Story highlights, all labeled.
- Meets the quantity requirements with 16 posts (15 or more) and 8 multimedia (5 or more).
- Grounds the content in course readings plus outside research, with five core readings and
  a set of current government and policy sources, all cited inline and gathered in
  [`links.html`](links.html).
- Stays coherent around one advocacy goal and one audience, in a voice aimed at students and
  early-career tech people.

## Reflection

### Why there are no Reels

Earlier drafts of this campaign included a Reel for the hiring-algorithm post. I removed it
before this final version, and the choice ended up shaping how I structured the rest of the
campaign, so it's worth explaining.

Reels are built for short, fast, entertainment-driven video that loops and grabs attention
through motion and sound. The format rewards punchy hooks, emotional payoffs, and visual
storytelling that survives sound-off scrolling. That's a real skill, and the platform
optimizes heavily for it. My campaign is the opposite of that. The whole premise of
*Behind The Algorithm* is that AI bias is technical, layered, and hard to see, which means
each post needs room for at least one explanation, one piece of evidence, and one takeaway.
Carousels handle that naturally, because the reader can swipe through a multi-step argument
at their own pace. Stories handle the polling and engagement layer because they're
conversational. Single grid posts handle the one-stat or one-quote punches.

There was a production reason too. A real Reel needs filmed footage, music licensing, motion
graphics, and editing. For a draft, I can mock up a single carousel slide convincingly with
typography and color, but I can't mock up a Reel without producing the actual video. A
frame-by-frame Reel storyboard doesn't show how the finished piece would feel, and it isn't
a usable asset either. It would represent my campaign worse than the formats I chose, so I
went with the formats I could actually deliver well.

One thing worth noting is that Instagram has a feature that can surface carousels to people
scrolling Reels, so carousel posts can still reach a Reels audience without my having to
produce video. That softens the trade-off of skipping Reels, since the content I made in
carousel form can still find the people who mostly watch Reels. It's something I'd want to
look into and try to take advantage of in a future version of the campaign.

### On hashtags, and how they work on Instagram

A hashtag is a keyword or phrase written with a `#` in front and no spaces, which turns the
word into something clickable and searchable. On Instagram, tapping a hashtag opens a feed
of every public post using it, and you can follow a hashtag so those posts show up in your
home feed. That's how strangers find a campaign and how related posts get grouped into
browsable themes. This site recreates that behavior, so every hashtag is clickable and
filters the profile down to matching posts. The recurring tags work as real navigation
instead of decoration.

### An idea I'm keeping for a future version

Instagram accounts can run bots that watch comments and reply automatically when a comment
contains certain keywords or emojis. A few of my posts already nudge readers to "comment 👁️"
or "comment 🧹," so wiring those prompts up to an auto-responder would make the campaign more
interactive and help each post reach a little further.

## References

### Course readings

- Andrejevic, M., & Gates, K. (2014). Editorial. Big data surveillance: Introduction.
  *Surveillance & Society, 12*(2), 185–196. https://doi.org/10.24908/ss.v12i2.5242
- Kong, Y., & Ding, K. (2024). Tools, potential, and pitfalls of social media screening:
  Social profiling in the era of AI-assisted recruiting. *Journal of Business and Technical
  Communication, 38*(1), 33–65. https://doi.org/10.1177/10506519231199478
- Roundtree, A. K. (2022). Facial recognition technology codes of ethics: Content analysis
  and review. In *2022 IEEE International Professional Communication Conference (ProComm)*
  (pp. 211–220). IEEE. https://doi.org/10.1109/ProComm53155.2022.00045
- Shah, C., & Bender, E. M. (2024). Envisioning information access systems: What makes for
  good tools and a healthy web? *ACM Transactions on the Web, 18*(3), Article 33.
  https://doi.org/10.1145/3649468
- von Sikorski, C. (2021). Visual mis- and disinformation, social media, and democracy.
  *Journalism & Mass Communication Quarterly, 98*(3), 641–664.
  https://doi.org/10.1177/10776990211035395

### Government and policy sources

- Grother, P., Ngan, M., & Hanaoka, K. (2019). *Face recognition vendor test (FRVT) part 3:
  Demographic effects* (NIST Interagency Report 8280). National Institute of Standards and
  Technology, U.S. Department of Commerce. https://doi.org/10.6028/NIST.IR.8280
- U.S. Equal Employment Opportunity Commission. (2023). *Select issues: Assessing adverse
  impact in software, algorithms, and artificial intelligence used in employment selection
  procedures under Title VII of the Civil Rights Act of 1964* [Technical assistance document;
  removed from EEOC.gov in January 2025]. https://www.eeoc.gov
- *Removing Barriers to American Leadership in Artificial Intelligence*, Exec. Order
  No. 14179, 90 Fed. Reg. 8741 (Jan. 23, 2025).
- *Colorado Artificial Intelligence Act*, S.B. 24-205, Colo. Rev. Stat. § 6-1-1701 et seq.
  (2024) (effective June 30, 2026).
- *Illinois Public Act 103-0804*, H.B. 3773 (2024) (amending the Illinois Human Rights Act;
  effective January 1, 2026).
- *Texas Responsible Artificial Intelligence Governance Act (TRAIGA)*, H.B. 149, 89th Leg.,
  Reg. Sess. (Tex. 2025) (effective January 1, 2026).

## Project structure and editing

```
social_media_campaign/
├── index.html              # The Instagram-style profile (entry point)
├── links.html              # "Sources & deeper reads" page, linked from the bio
├── account_profile_photo.png
├── assets/
│   ├── config.js           # Profile info plus the ordered list of posts
│   ├── loader.js           # Reads each p<N>/post<N>.txt and finds its slides
│   ├── app.js              # UI: grid, post view, Story viewer, hashtag routing
│   └── styles.css
└── p1/ … p16/              # One folder per post: post<N>.txt plus slide1.png, slide2.png, …
```

To add, remove, or reorder posts, edit the `posts` array in `assets/config.js` and add a
matching `p<N>/` folder with a `post<N>.txt` file and the `slide*.png` images. Each
`post<N>.txt` sets `post_type` (`single`, `carousel`, or `story`), the caption, the
hashtags, and whether the post is pinned. The slide count is detected automatically.

*© 2026 Behind The Algorithm. A student-led campaign mockup.*
