# Cutover Functional Checklist

Date: 2026-05-19
Phase: 9.1
Preview URL: _(fill after GH Actions deploy)_

## Routes

| Status | Check | Notes |
| ------ | ----- | ----- |
| TODO | Home `/` renders, hero + categories visible | |
| TODO | `/bai-viet/<slug>/` — title, cover, body, math, code, mermaid, callouts, image zoom, TOC, related posts | Test 5 random posts |
| TODO | `/tat-ca-bai-viet/` renders | |
| TODO | `/tat-ca-bai-viet/trang/2/` pagination works | |
| TODO | `/chu-de/<known-tag>/` + pagination | |
| TODO | `/chuyen-muc/<known-category>/` + pagination | |
| TODO | `/tac-gia/<known-author>/` + pagination | |
| TODO | `/tuyen-chon/` works | |
| TODO | `/gioi-thieu/` renders | |
| TODO | `/huong-dan-viet-bai/` renders | |
| TODO | `/viet-bai-tren-math2it/` renders | |

## Features

| Status | Check | Notes |
| ------ | ----- | ----- |
| TODO | Ctrl+K opens Pagefind search | |
| TODO | Typing a known title returns matching post | |
| TODO | View source: OG tags, title, canonical, JSON-LD | |
| TODO | `/sitemap.xml` contains all prerendered URLs | |
| TODO | Unknown slug returns 404 (`dynamicParams = false`) | |
| TODO | Giscus comments load on a single post | |

## Responsive

| Status | Check | Notes |
| ------ | ----- | ----- |
| TODO | Mobile 375px layout correct | |
| TODO | Tablet 768px layout correct | |

## Summary

All checks: TODO / PASS / FAIL
Ready for merge: _(yes/no)_
