# Lexi design: fixed layouts

This file records the **layout** of every Lexi screen as finalised on the design canvases. Layouts are fixed. Visuals (fonts, colours, textures, button colours, illustration) are allowed to change, and when they do, only the tokens in "Visual tokens" change. The layout sections below do not.

If a request says "change the font", "change the colour" or "add a texture", that is a token change. Do not rebuild a screen from scratch, do not reinterpret it from the code, and do not "tidy" spacing. Start from the finalised board named in each section and change only what was asked.

## Where the designs live

| Canvas | Link | Holds |
|---|---|---|
| Lexi Word Card | https://claude.ai/artifact/SHSP2z6oQ88yRWP4CcrArW | widget, highlight popover, side panel library, Search, Add a word, today's word banner, empty state, font and widget explorations |
| Lexi Onboarding & Settings | https://claude.ai/artifact/3PeFMTDh8SyGsJJ1q8BRRM | onboarding pop-up (steps 1 to 4), Settings |
| Lexi Screens, Klee One + Geist | https://claude.ai/artifact/Xaj8dDBmLEAaHArfVoqrxn | every screen redrawn with the chosen fonts (widget and pill are the finalised boards; the rest are the finalised layouts with only the fonts changed, plus the popover meaning area). Final: the boards named in each section below are the source of truth for look and layout; the other two canvases are history |

Rules for working from them:

1. **Canvas first.** A visual or layout change is drawn on the canvas and approved before any code changes. Code is the last step.
2. **Copy the finalised board, change only the request.** Read the board file, copy it, make the one change. Never recreate a screen from the code or from memory.
3. If the code and the canvas disagree, the canvas is right (see "Known drift" at the end).
4. Anything labelled **pending** below has no approved board yet. Draw it on the canvas first.

## Visual tokens (these may change)

| Role | Current value |
|---|---|
| Display font (the word, titles, pronunciation, examples) | Klee One (chosen). Previously Cormorant Garamond |
| Body font (labels, buttons, dates, the widget meaning and part of speech) | Geist (chosen over Nunito, Manrope, DM Sans, IBM Plex Sans and Instrument Sans). Previously Manrope |
| Paper | `#F7F3EA`, canvas backdrop `#E9E4D6`; off-white `#FFFDF8` for inputs, chips (selected) and CTAs; sticky-note yellow `#FAF2CB`, added-note green `#E3F1E6` |
| Ink | `#171717`; secondary `#45423E`; muted `#66615A`; faint `#8B8579` |
| Card border | `#D8D3C9` |
| Blue rule (dividers, ruled lines) | `rgba(110,155,215,0.3)`; input outline `rgba(110,155,215,0.9)` |
| Red rule | the vertical margin line only, `rgba(214,100,96,0.42)` (header underlines are now blue; the onboarding and popover headers too) |
| Hand-drawn outline | `#B3AC9E`, 1.2 to 1.3px, SVG path with `vector-effect: non-scaling-stroke`; lighter `#CFC9BC` on the Add a word input; darker `#45423E` (1.5px) for selected chips and checked boxes |
| Button fill | CTAs `#FFFDF8` with border `#D8D3C9` (see Shared layout rules); small icon buttons `#EDE6D4`; the old selected-chip fill `#D9CFB2` is retired |
| Saved / success green | `#4F7053`; success fill `#F3EFE3`; success border `rgba(79,112,83,0.45)` |
| Destructive | `#A33333` (text, delete button), `#B4544F` (trash icon) |
| Motion | 160 / 240 / 320 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)`, off under reduced motion |

**Where the fonts are applied:** the widget and pill, the highlight popover, the side panel (library, today\'s-word banner, Search, Add a word, empty state), Settings and the onboarding pop-up. Not yet: the options page and `welcome.html`.

**How sizes map from the old serif and sans** (so a new screen is set the same way): Klee One for words and titles at 0.88 times the old serif size, semibold from 17px up and regular below; pronunciation at 0.95 times; examples at 0.88 times, regular and upright; Geist for meanings and other running text at 0.9 times, regular, in soft ink `#45423E`; no letter-spacing on either.

When the display font changes, sizes are re-fitted (wider faces get smaller sizes) but every box, row height, gap and position below stays. Klee One has no italic, so nothing is italic: the widget's part of speech is set in Geist in a muted colour and examples are upright.

Fonts are bundled in the extension (`fonts/`, loaded by `src/ui/fonts.ts`), never loaded from a third-party host.

## Shared layout rules

- **Side panel is 375px wide.** Every screen is a column: header (84px, fixed), scrolling body, optional footer (84px, fixed).
- **Gutter is 18px** left and right everywhere in the panel.
- **Header:** 84px high, `0 18px` padding, title in the display font, a **blue rule** under it (`1px`, `rgba(110,155,215,0.3)`; it was red before the final side-panel boards; the red vertical margin line stays). Sub-screens have a back arrow (20px) then the title (26px, gap 12). The library's title is 28px with a small caps subtitle under it (11px, tracking 0.14em, muted).
- **Section label:** small caps, 11px, weight 500, tracking 0.14em, muted. Padding `16px 18px 8px`.
- **List rows:** padding `11px 18px`, a **blue rule** under each row. Word in the display font 20/24, meaning 12/14 muted on one line with ellipsis.
- **Footer:** 84px, `0 18px` padding, blue rule on top.
- **Buttons:** fill `#EDE6D4`, radius 10 (8 for small ones), label 14 to 15px weight 500, icon 18px, gap 8 to 10.
- **Inputs (final, from the Search bar, Add a word and Settings boards):** off-white fill `#FFFDF8`, **no border**; a **hand-drawn outline** instead (an SVG path stretched over the field, `#B3AC9E`, 1.3px, `vector-effect: non-scaling-stroke`), radius 10, 42px high (46px for the goal dropdown), 14px Geist text, 14px side padding. Placeholder is muted `#66615A`.
- **Chips (final):** no fill, hand-drawn warm-grey outline (`#B3AC9E`, 1.3px), padding `5px 12px`, Geist 12/16 regular, muted `#66615A`, gap 8, wrap. Selected: fill `#FFFDF8`, outline and text `#45423E` (outline 1.5px), weight 600. A count, when shown, is regular weight at 70% opacity.
- **Side-panel CTAs (final):** fill `#FFFDF8`, 1.5px border `#D8D3C9`, radius 14, 44px high, Geist 14 regular `#45423E`, icon 22px, shadow `0 8px 14px -8px rgba(60,50,40,0.30)`.
- **Icon-only header buttons:** 40 by 40, `#EDE6D4`, radius 10, icon 18px.

## Widget (word of the day card)

Final board: "Widget — Example laid out like Similar" (`WidgetChipsExampleRow.dc.html` in the Lexi Screens canvas). It is the earlier "Widget — final" layout with the Similar chips, the Example paragraph and the new CTA added. Nothing from older versions (a number row, a 24px grid) belongs to it.

- Card **480 by 579** on a 560 by 673 frame, radius 13, `#D8D3C9` border, soft shadow. The extension draws this exact card scaled by 36/49 (about 353px wide), so the 49px line pitch becomes a whole 36px. Every measurement goes through `u()` in `src/content/widget.ts`; change the canvas value, not a loose pixel.
- **Notebook paper:** blue ruled lines every **49px** (1px), starting 116px from the top (32px under the header). A **red margin line** at x = 40, 1.5px, vertical, full height.
- **Header** 84px high, left padding 58px (clear of the margin), blue rule underneath. Left: "WORD OF THE DAY" (13px caps, tracking 0.16em, `#8B8579`) over the date (13px). Right: minimise and close icons, 22px, gap 24.
- **Content** padding `26px 35px 0 58px`, in this order and nothing else:
  1. the word (Klee One semibold 54/62, one line, steps down through 49, 44, 38, 32 to fit);
  2. a 40px row: pronunciation (Klee One 19), then part of speech (**Geist** 17, muted), gap 22;
  3. the meaning (**Geist** 22/36 regular, `#66615A`, max width 380), 23px above;
  4. the **Similar row**, 16px above: label "SIMILAR" (Geist 13 caps, tracking 0.14em, `#8B8579`, 6px right margin) then up to **3 chips** (Geist 14/20 `#66615A`, padding `5px 12px`, **hand-drawn outline** `#B3AC9E` 1.3px, gap 8). Hidden when a word has none;
  5. the **Example paragraph**, 16px above, max width 380: the heading "EXAMPLE" (Geist 13 caps, tracking 0.14em, `#8B8579`) sits **inline at the start**, 12px before the sentence, and the sentence (Klee One 19/32 regular `#66615A`) continues on the same line and wraps underneath the heading.
- **Footer** 100px, pinned to the bottom, with a soft fade (paper at 90%) rising 28px above it. The button is the **side-panel CTA style**: fill `#FFFDF8`, 1.5px `#D8D3C9` border, radius 14, padding `13px 28px`, Geist 18 regular `#45423E`, book icon 22px, gap 14, shadow `0 8px 14px -8px rgba(60,50,40,0.30)`, label "Add to my library". Saved state: same shape, disabled, green text `#4F7053` and check icon, 1.5px border `rgba(79,112,83,0.45)`, label "Added to my library".
- There is **no number row** and no other element beyond those listed.
- The CTA look is approved as drawn.

## Widget, collapsed pill

Final board: "Widget pill — collapsed" (`WidgetPill.dc.html`), approved as drawn. A pill, radius 999, paper fill `#F7F3EA`, `#D8D3C9` border, shadow `0 12px 30px rgba(0,0,0,0.16)`, padding `15px 36px`, showing only the word (Klee One semibold 28.5, line height 42; the extension draws it at two-thirds of this size), in the top-right corner. Clicking re-expands the card.

## Highlight popover

Final board: "Popover — plain outline CTA and red margin rule" (`PopoverMarginPlain.dc.html` in the Lexi Screens canvas). The other states are drawn in the same style (all approved): "Popover — loading, final style" (`PopoverLoadingPlain.dc.html`: three grey bars under the word row), "long meaning fades, final style" (`PopoverFadePlain.dc.html`) and "already in the library, final style" (`PopoverSavedPlain.dc.html`: the button is disabled, green outline and check, label "In your library"). The older `PopoverLoading`, `PopoverFade` and `PopoverSaved` boards are superseded.

- **Card:** fill `#F7F3EA`, `#D8D3C9` border, radius 10, shadow `0 10px 24px rgba(0,0,0,0.18)`. Width fits the content: at least 190px, at most **262px**, to the **right** of the selection with a 10px rotated caret on its left edge; it flips to the left when there is no room.
- **Margin line:** a 1px **red vertical rule** (`rgba(214,100,96,0.42)`), 16px from the card's left edge, full height. Everything inside starts **34px** from the left edge. No horizontal ruled lines.
- **Header** 35px high, padding `0 10px 0 34px`, a **blue** rule under it: the **logo mark** (18px) and the label **"SELECTED"** (9px caps, tracking 0.14em, muted) on the left, 12px close icon on the right.
- **Word row** min 35px, padding `6px 12px 6px 34px`: the word (Klee One semibold 18/22) with the **part of speech right beside it** (Geist 11/14, muted, baseline-aligned, 8px gap). The part of speech always sits next to the word, never inside the meaning.
- **Meaning:** Geist **12**/16, soft ink `#45423E`, margin `0 12px 0 34px`, up to **4 lines**; when it runs longer the last 2 lines fade out so the button sits cleanly. While it loads, three short grey bars show instead. If the lookup fails, a muted one-line message shows. No synonyms in the popover.
- **Button:** **205px wide**, 36px high, margin `12px 17px 14px 34px`, off-white fill `#FFFDF8`, 1.5px `#D8D3C9` border, radius 10, Geist 12 regular `#45423E`, book icon 14px, gap 8, shadow `0 6px 10px -6px rgba(60,50,40,0.30)`, label "Add to my library". For a word already in the library it is disabled and reads **"In your library"** with a green check.

## Side panel: library (home)

Final boards: "Library — interactive list (test)" (`PanelLibraryInteractive.dc.html`, the behaviour), "Library — Example outline, sentence inline" (`PanelLibraryExampleOutlineInline.dc.html`, the open row) and "Library — added confirmation" / "empty" below. All in the Lexi Screens canvas.

- **Header:** title "{Name}'s Library" (Klee One 25/30), subtitle "N SAVED THIS WEEK" (caps 11px), settings icon button (40 by 40, `#EDE6D4`, radius 10). Blue rule underneath, red margin line at x = 26 down to the footer.
- **Ruled paper:** blue rule every **61px** (60 + 1px line) from the header down; content starts at x = 44 (right of the margin line), right gutter 18.
- **Week labels** ("THIS WEEK", "LAST WEEK"): caps 11px, a 61px row, centred between its two rules (equal space above and below). Words are grouped by week, newest first.
- **Row (closed):** padding `11px 18px 10px 44px`, word (Klee One 18/24 semibold) over a one-line meaning (Geist 12/14 muted, ellipsis), chevron 16px on the right, blue rule under the row.
- **Row (open, one open at a time):** the chevron flips and the one-line meaning folds away. Body padding `0 18px 15px 44px`: pronunciation (Klee One 14) and part of speech (Geist 13 muted, 10px gap), meaning (Geist 14/22 `#45423E`, 8px below), the **SIMILAR** row (label caps 11px, up to 3 chips: Geist 12/16, padding `4px 10px`, hand-drawn outline `#B3AC9E` 1.2px, gap 6, 14px above), then the **Example box** 14px below: no fill, **hand-drawn outline** (`#B3AC9E`, 1.3px), padding `10px 14px`, with the "EXAMPLE" heading (caps 11px) **inline at the start** and the sentence (Klee One 13/22 `#4A4742`) continuing and wrapping beneath it.
- **Motion:** the open and close glide uses grid-row height animation, 240ms, `cubic-bezier(0.22, 0.9, 0.3, 1)`, with the chevron rotating on the same timing (the same as `src/ui/motion.ts`). Off under reduced motion.
- **Footer:** 84px, blue rule on top, two equal side-panel CTAs "Search" and "Add a word" (44px high, gap 12, icon 22px).

## Today's word banner

Final board: "Library — roomier banner, Example inline" (`PanelBannerRoomyExampleInline.dc.html`), with the confirmation from `PanelAdded.dc.html`. The banner replaces the old white card.

- Appears above the list **only while the widget is closed** and the word is unsaved.
- **Sticky note:** fill `#FAF2CB`, radius 2, tilted **-0.8 degrees** (origin top centre), margin `16px 30px 0 44px`, padding `24px 18px 20px`, a soft shadow and a faint top shade. Lines are spaced roughly 16 to 20px apart.
  - Top row: "WORD OF THE DAY" (Geist 9px caps, weight 600, `#45423E`), the word (Klee One 20/25 semibold, `#45423E`) with a **brush underline** beneath it, then pronunciation (Klee One 11) and part of speech (Geist 12) below.
  - An **"Add" button** at the top right: 28px high, a **hand-drawn outline** (`rgba(43,40,34,0.5)`), a plus icon and the label (Geist 12 regular).
  - Meaning (Geist 13/20 `#66615A`), then up to **3 SIMILAR chips** (Geist 11/14, hand-drawn outline, padding `3px 9px`), then the **Example paragraph**: the "EXAMPLE" heading (Geist 9px caps) inline at the start with the sentence (Klee One 12/20) continuing and wrapping beneath it.
- **Caption** below the note, outside it: a hand-drawn **star** icon and "Add the word to your library before the day ends." (12/16, `#8B8579`), 20px below the note, width 320.
- The banner area is a whole number of ruled rows so the lines under it stay aligned. On this board the rules sit **58px** apart; the other side-panel boards use 61px. This is an open point to settle before coding (use one pitch everywhere).
- **Added confirmation** (`PanelAdded.dc.html`): replaces the note for 5 seconds. Same margins, a **green sticky note** (fill `#E3F1E6`, text `#3E7A58`, tilted -0.8 degrees, padding `20px 14px`), check icon 24px, "Added to your library" (14px weight 600) and "{word} is now in this week's list." (12px, the word in Klee One 13). The area is 106px; then the space closes and the list moves up. The list below shows "THIS WEEK" and a "LAST WEEK" group.

## Empty library (new user)

Final board: "Library — empty (new user)" (`PanelEmpty.dc.html`).

- Header: "Your Library" with subtitle "NOTHING SAVED YET", settings button, blue rule. The red margin line runs the full height. **No footer.**
- Body is **top-aligned** and centred horizontally, padding `48px 36px 40px 62px`, in this order: illustration (232 by 143, a ruled notebook card with one highlighted word and a cursor), "LEXI" caps label (11px, weight 600) 28px below, headline "Never forget a word you see." (Klee One 28/36), one body sentence (14/21), the CTA **"+ Add your first word"** (side-panel CTA style, 44px, padding `0 24px`) 24px below, and the caption "or highlight a word on any page" (12px muted) 14px below.

## Search

Final boards (Lexi Screens canvas): "Search — all words" (`SearchAll.dc.html`), "topic chip selected" (`SearchFiltered.dc.html`), "typing a query" (`SearchQuery.dc.html`), "select mode and delete drawer" (`SearchSelect.dc.html`).

- **Header:** back arrow, "Search" (Klee One 23/30) with the count "42 WORDS" in caps under it, and the **trash** icon button on the right (red icon, `#EDE6D4`, 40 by 40). Blue rule under it; red margin line full height.
- **Ruled paper** continues from the header at the same 61px pitch, all the way down.
- **Top section (bar and chips are one section, no rule between them, one blue rule after):** the **search bar** (42px, final input style: off-white fill, hand-drawn outline, a hand-drawn magnifier, placeholder "Search words, meanings, topics"; a clear cross appears once there is a query), 16px from the header, then the **chips** 12px below: **All, then one chip per topic present**, "Other" last; final chip style, up to two rows with 16px below them. Selected chip: fill `#FFFDF8`, outline and text `#45423E`, semibold.
- **List:** starts with a **heading row** (61px, caps 11px, centred between its two rules): "All · 42" for All, "Technology · 8" for a selected topic, "All · N" for a query (N is the number of matches). Rows are the library's closed rows. Typing filters across everything and **bolds the matching start** of each word (weight 700).
- **No footer** on this screen.
- **Delete (select) mode:** the header becomes Cancel (Geist 14 regular, muted) / "N selected" (Klee One 20/30, nudged up 2px so the three align) / Select all. Rows show a **20px hand-drawn checkbox** on the left of the word: unchecked outline `#B3AC9E`; checked fill `#FFFDF8` with a `#45423E` outline and tick. Tapping a row toggles it. A **bottom drawer** replaces the footer: panel fill, `#D8D3C9` top border, a soft **warm-tan shadow** (`0 -4px 24px` at `#A08A5C` 21%), padding `22px 18px 26px`, the line "Removed words can't be recovered." (14px muted), then a full-width red button (46px, `#A33333`, white text, trash icon) "Delete from library (N)", 20px below. The red margin line stops above the drawer. There is no separate confirm step.

## Add a word

Final boards (Lexi Screens canvas): "Add a word — empty / preview / added, icon + caret + lighter input" (`AddWordEmptyV2.dc.html`, `AddWordPreviewV2.dc.html`, `AddWordSavedV2.dc.html`). They replace the earlier `AddWordEmpty`, `AddWordPreview` and `AddWordSaved` boards.

- Header: back arrow, "Add a word" (23px display font), blue rule under it. No footer. The body is ruled paper: a blue rule every **61px** (60 + 1px line) starting under the header, red margin line full height.
- **No "NEW WORD" label.** The input sits alone in the first ruled row: 42px high, **9px above and 9px below** (centred between the header rule and the first rule), margin `0 18px 0 44px`.
- **Input style:** the final input style (off-white fill, hand-drawn outline), but **lighter**: outline `#CFC9BC`, 1.1px. A **pencil icon** (17px, muted) sits on the left with a 10px gap. **Empty state:** a text caret (1.5px by 18px, `#45423E`) before the placeholder "Type a word..." (muted). **When a word is typed** the text is ink and a **clear cross** (14px, muted) sits on the right edge, the same cross as the Search bar.
- **Empty state:** nothing below the input. No button, no preview.
- **With a preview:** a **static word card** (no chevron, not tappable) below the input, laid out exactly like the open row of the final library list: the word (display font 18/24 semibold), pronunciation (Klee One 14) with part of speech (Geist 13 muted) 10px to its right, the meaning (Geist 14/22 `#45423E`), a "SIMILAR" label with up to 3 hand-drawn chips, and the Example in the hand-drawn outlined box with the sentence starting after the "EXAMPLE" heading and wrapping beneath it. The card has its own blue line at the bottom; the ruled rows **restart from that line** at the same 61px spacing, so there are no double lines. No "PREVIEW" label.
- **The button sits below the card, in its own ruled row:** "Add to my library", the side-panel CTA style, **205px wide, centred in the panel**, 44px high, 8px below the card's line, border darker than the other CTAs (`#B8B1A1`) so it reads as the action next to the input. It appears only once a preview exists.
- **Saved state:** the button becomes the outline pill (fill `#FFFDF8`, 1.5px green outline, green text and check icon, label "Added to my library", disabled) and **the input goes back to empty** (placeholder, no cross). Feedback lives in the button; there is no separate success line.
- **Rule:** the input is **always empty whenever the screen is opened**, including a new session. Never restore the previously typed word.
- **Synonyms:** shown as the Similar chips in the card; hidden when a word has none.

## Settings

Final board: "Settings" (`Settings.dc.html` in the Lexi Screens canvas).

- Header: back arrow, "Settings" (23px), blue rule under it. Scrolling body, fixed footer. The red margin line runs from the top down to the footer's top line.
- Groups in this order, with **12px** between sections: **Profile** card (final input style: off-white fill, hand-drawn outline, radius 10, 38px avatar circle, name 14px weight 600, email 12px muted, red "Sign out" with icon at the right); **Your name** (input, 42px); **Word of the day arrives at** (dropdown field with clock icon and chevron, 42px); **Your goal** (42px dropdown like the other fields, value in Geist 14 regular); **Which industry?** (input plus chips), shown only for the "Learn industry jargon" goal.
- All fields use the final input style (off-white fill, hand-drawn outline `#B3AC9E`). The industry chips use the final chip style. The list holds more than five industries (Technology, Design, Law, Finance, Healthcare, Education, Marketing, Retail). **A new industry the user types appears as an extra chip at the end, already selected**, alongside the rest.
- Footer: full-width **"Save changes"** (the side-panel CTA, 44px), then a tertiary **"Delete account"** (36px, red text 13px weight 500, trash icon), gap 6, blue rule on top.
- No removed items come back: no time-of-day chips, no words-per-day control, no name preview, no job-title field.

## Onboarding pop-up

Boards: steps 1 to 4 and 4c in the Onboarding & Settings canvas (`Main.dc.html`, `OnboardName.dc.html`, `OnboardTime.dc.html`, `OnboardGoal.dc.html`, `OnboardGoalIndustryInline.dc.html`).

- A **460 by 720 dialog**, centred over the current web page, page dimmed (`rgba(23,23,23,0.45)`). Paper fill, border, radius 13, large shadow.
- **Final** (approved). **Styles follow the final side-panel boards** (redrawn in the Lexi Screens canvas: `Onboard1` to `Onboard4Industry`): blue header rule, off-white hand-drawn inputs, hand-drawn chips, side-panel CTAs.
- **Header** 76px: logo mark and "Lexi" (28px) on the left, "STEP N OF 4" caps on the right, **blue** rule under it.
- **Body** padding `24px 32px 32px`, in this order: a **4-segment progress bar** (3px high, gap 6; done segments ink `#45423E`, the rest `rgba(110,155,215,0.3)`), the heading (Klee One semibold **30/38**, 28px below), one intro sentence (15/23, 12px below), then the step's content under a blue rule (24px below).
- **Footer** 84px, blue rule on top: a text "Back" button with arrow (left, Geist 14 regular `#45423E`) and a flexible **side-panel CTA** (44px, fill `#FFFDF8`, 1.5px `#D8D3C9` border, radius 14, shadow) on the right: "Continue", and "Start learning" on the last step.
- Steps: **1** welcome (three tick bullets in ink, "Continue with Google" in the CTA style, 44px high, small legal text as the footer instead of buttons); **2** your name (the signed-in card and the name input, both in the final input style); **3** arrival time (one dropdown field in the final input style and a hint line); **4** goal (60px radio rows, the goal names in Geist 14 medium with a muted one-line description under each, and hand-drawn radio circles; the selected row is filled `#FFFDF8` with an ink outline and tick; picking "Learn industry jargon" opens the industry field and the final chips **inline under that row**, with the same extra industries as Settings and a typed industry added as a selected chip).

## Approved on the canvas 2026-10-27, not coded yet

These override the sections above where they differ. Source boards are in the Lexi Screens canvas.

1. **Widget, 320 wide and hugging its content.** Board "Widget 320px, tighter gap under the header" (`Widget320HugTight.dc.html`); "Widget 320px, hugs its content" is the same card with the larger gap and is superseded. The card is **320px wide** (it was about 353) and **has no minimum height**: remove `min-height` and the footer's `margin-top: auto`, so the card ends under the CTA. Type and spacing keep the current extension scale (`u()`, 36/49), so only the width changes; the word still steps down to fit the narrower content width (about 252px).
   - Content padding top **10.29px** (was `u(26)` = 19.1px), i.e. `u(14)`; the gap under the header is about 9px smaller.
   - Ruled lines start **77.22px** from the top (was `u(116)` = 85.22px), 8px higher, so text keeps its place against the lines. Pitch stays 36px.
   - Footer padding `u(22) u(36) u(30) u(58)` (16.16, 26.45, 22.04, 42.61px), no fixed height. The fade behind the button covers **the footer only** (top 0 of the footer, paper at 90% after `u(28)`); it must never reach the content above, so the last sentence is never covered.
   - Collapsed pill, header, chips and CTA are unchanged.
2. **Highlight popover: no "SELECTED" label.** Boards `PopoverMarginPlainNoLabel`, `PopoverLoadingNoLabel`, `PopoverFadeNoLabel`, `PopoverSavedNoLabel` (all approved). The header keeps the logo mark and the close icon; everything else as in the Highlight popover section.
3. **CTA hover (every CTA: widget, side panel, popover, onboarding).** Board `CtaHover.dc.html`. Fill stays `#FFFDF8`; border `#45423E`, drawn 0.5px thicker with an inset shadow (`inset 0 0 0 0.5px #45423E`, plus the normal shadow) so nothing shifts; label and icon `#171717`. 160ms, `cubic-bezier(0.22, 0.9, 0.3, 1)`. The old tan hover fill is retired.
4. **Header icon buttons (Settings, Search's delete)**: now CTA style, **44 by 44**, fill `#FFFDF8`, 1.5px `#D8D3C9` border, radius 14, the CTA shadow, icon 20px in ink `#45423E` (the trash icon is **ink**, no longer red), same hover as above.
5. **Library title** 20/26 (was 25/30); only the library title changes, the subtitle and the sub-screen titles stay.
6. **Banner caption** reads **"Add it before the day ends."** (was "Add the word to your library before the day ends."), on one line, with no fixed 320px width. Board `PanelLibrary320.dc.html` shows the banner at 320px. **The side panel width is not changed**: Chrome owns it and the user resizes it (the extension cannot set it; the narrowest is about 320px), so the other screens are still drawn at 375px.

7. **Widget minimise / expand animation (final).** Board "Widget — minimise to pill and back" (`WidgetMorph.dc.html`). The card and the pill are one shape that morphs in the top-right corner, not two elements swapped. Everything uses `cubic-bezier(0.22, 0.9, 0.3, 1)` and is off under reduced motion.
   - Shape: width, height, corner radius and shadow glide together over **320ms** (card 320px wide, radius 9.55px, to the pill, radius 24px, shadow `0 8px 20px rgba(0,0,0,0.16)`). The pill's width is the word's natural width plus 24px side padding (the board shows 128px for "affinity"); its height is 48px (word line 28px plus 10px padding top and bottom). In code, measure both ends and animate between them.
   - Minimise: the card content fades out in **120ms** while the shape closes; the word fades in on the pill after **180ms**, over 160ms.
   - Expand (click the pill): the word fades out in 100ms, the shape opens over 320ms, and the card content fades in after **140ms**, over 200ms.
   - The card content stays 318px wide and is clipped from the left, so it never reflows during the morph. The pill is a button ("Open word of the day"); the card content is not clickable while collapsed.
   - A flip-card version was tried and dropped; do not build it.

8. **Banner to "Added" animation (final, option A: the new note sticks on).** Board "Library — banner to Added, option A: sticks on" (`PanelBannerStick.dc.html`; the peel version and the older `PanelBannerAdded` are superseded). Starts when "Add" is clicked; all times are from the click and use the same easing unless stated. Off under reduced motion (the green note simply appears).
   - **Sticker lands (0 to 1000ms):** the green note (rest: fill `#E3F1E6`, tilt -0.8 degrees, the same margins as the yellow one, 3D perspective 900px) starts from the top right, edge-on and tilted (translate 70px right and 90px up, rotateY 84, rotateX 20, rotateZ -14, scale 0.88, big soft shadow, invisible) and lowers hinged at its **right edge** in one smooth ease-in-out-cubic curve, with **no overshoot**: the right edge touches first, then the middle, then the left. The shadow tightens to the rest shadow on the way. A faint shade (`rgba(30,50,40,0.30)` fading to clear to the right) covers the lifted left side and fades out over the same 1000ms. Opacity reaches 1 within the first sixth.
   - **Yellow note:** keeps its place under the sticker, then fades out over **400ms starting at 740ms**. Its caption fades at once (260ms).
   - **Check:** the circle draws over 300ms from 760ms, then the tick over 260ms from 980ms (stroke-dashoffset 1 to 0, `pathLength` 1).
   - **List:** the banner area closes from 348px to 116px (a whole number of rule rows) over 320ms starting at **1200ms**; "{word}" slides into the top of this week's list (row height 0 to its natural height over 320ms from 1200ms, opacity over 240ms from 1240ms); the header count goes up by one at the click.
   - **Hold and exit:** the confirmation stays for 5 seconds after the list settles (6200ms from the click in the board). Then the note lifts 8px and fades (opacity 240ms, transform 320ms) while the area closes from 116px to 0 over 320ms and the list glides up.
   - **Code notes:** the hinge turns about the right edge, so use an outer element for the spin and an inner one for the resting -0.8 degree tilt about the top centre (the board tilts about the right centre, about 2px off). The sampled keyframes in the board are an eased single curve; the code can use a normal keyframe animation with the same start and end values and `cubic-bezier(0.65, 0, 0.35, 1)`. While the sticker is invisible or in flight it must not take clicks.

## Pending

1. **Ruled-line spacing, to look at later:** the banner board uses 58px between blue rules and the other side-panel boards 61px. Kept as drawn for now; decide on one pitch before or after the code pass.
2. Text length limits (agreed, not coded): example sentence at most 14 words (about 90 characters, 3 lines) and meaning at most 2 lines (about 10 words); a prompt rule plus a 3-line clamp.
3. Paper texture on the other screens, a cue-card flip for the library and a different CTA colour. Mentor feedback; each needs a canvas board and approval before code.

## Approved 2026-10-27 (second round, coded)
- All screen titles are 20px (Library, Add a word, Search, Settings, onboarding headings and brand name, empty-state title, options page "Lexi"). The widget word and popover word keep their own sizes.
- Popover: meaning 13px / 18px (4 lines, fade over the last 2), max width 280px. Board PopoverBody13.
- Today's-word sticky note: example text 14px / 22px.
- Options page restyled (board OptionsPageNew): paper card, red margin rule, hand-drawn inputs, CTA-style Save; the "Saved on this device" message appears only after Save and fades out after 4s; errors stay.
- Welcome tab: after onboarding, a paper note "You're all set" with a "Got it" button; the tab closes itself after 8s.
