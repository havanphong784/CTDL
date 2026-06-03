---
source: local-redesign-brief
---

# DESIGN.md

## 1. Product

Interactive review website for "Cau truc du lieu va Giai thuat" exam preparation. The app helps students choose a topic pack, answer multiple-choice questions, review explanations, track progress, and look up English/Vietnamese data-structure vocabulary.

## 2. Users

Vietnamese computer science students preparing for exams. They need a focused study interface, quick topic switching, clear progress feedback, and low-friction review of wrong answers.

## 3. Experience Goals

- Keep the quiz as the primary surface.
- Make topic packs scannable with counts and status.
- Make practice/test mode obvious.
- Keep dictionary helpful but secondary.
- Avoid marketing-page composition; this is a working study tool.

## 4. Visual Direction

- Modern academic dashboard.
- Light-first neutral background with soft blue, teal, amber, and violet accents.
- Dense but breathable layout, optimized for repeated study sessions.
- Rounded controls at 8px to 14px, not overly pill-shaped except small status chips.
- No decorative orbs, no glassmorphism-heavy panels, no one-note dark blue theme.

## 5. Interaction Notes

- Sidebar topic cards should look clickable and show active state.
- Mode toggle should feel like a segmented control.
- Primary actions should be high contrast.
- Answers need strong selected/correct/wrong states.
- Mobile should become a stacked study flow without horizontal overflow.

## 6. Design System Notes for Stitch Generation

**DESIGN SYSTEM (REQUIRED):**
Create a polished desktop learning workspace for a Vietnamese DSA quiz app. Use a light warm-neutral app background (#f6f7fb), white surfaces, charcoal text, muted blue-gray secondary text, and accents from blue (#2563eb), teal (#0f766e), amber (#d97706), red (#dc2626), and violet (#7c3aed). Use Outfit or Inter typography. The layout should be utilitarian and information-dense: a sticky top header, left topic rail, central quiz workspace, and right study assistant panel. Cards should use subtle borders, 8-14px radius, restrained shadows, clear hierarchy, and compact spacing. Avoid dark glassmorphism, oversized hero sections, gradients as primary surfaces, decorative blobs, and nested cards. Include responsive behavior for tablet and mobile.
