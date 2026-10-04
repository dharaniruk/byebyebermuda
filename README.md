# BYEBYEBERMUDA 🔺

> **Break the Loop. Crawl Smarter.**

A Cycle-Safe Web Crawler simulation built as a React + TypeScript + Vite application.

## 🌐 Live Demo

**[https://dharaniruk.github.io/byebyebermuda/](https://dharaniruk.github.io/byebyebermuda/)**

---

## 🚀 What It Does

BYEBYEBERMUDA simulates a safe web crawler that explores a directed web graph while ensuring normalized URLs are not processed more than once.

- Enter a URL → Configure the crawler → Start the crawl → Watch it explore the graph
- Detects **circular links** (A → B → C → A) and blocks repeated traversal
- Visualizes the crawl in real time with a live graph and activity console

## 🔧 Key Features

- **BFS / DFS** crawling strategies
- **Two-tier cycle detection**: Bloom Filter (probabilistic) + Exact Hash Set
- **URL Canonicalization** — normalizes URLs before deduplication
- **Live graph visualization** — nodes colored by status (visited, cycle, broken, duplicate)
- **Crawl History** — persisted to localStorage
- **Analytics Dashboard** — Recharts-powered crawl analytics
- **Algorithm Visualizer** — Interactive Bloom Filter lab & canonicalization sandbox
- **Presentation Mode** — automated walkthrough demo
- **Export** — Download crawl reports as JSON or CSV

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Graph | React Flow |
| Charts | Recharts |
| State | Zustand |
| Icons | Lucide React |

## 💻 Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## 📦 Build

```bash
npm run build
```

---

*BYEBYEBERMUDA — Say goodbye to getting lost in the web.*
