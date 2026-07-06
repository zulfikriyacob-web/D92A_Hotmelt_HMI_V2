# D92A Hotmelt HMI

Sistem pemantauan penggunaan hotmelt untuk **Main Assembly — Door Mirror**.
Frontend di-host di **GitHub Pages**, backend di **Google Apps Script** dengan data disimpan di **Google Spreadsheet**.

## Architecture

```
GitHub Pages (index.html)  ↔ fetch() ↔  Google Apps Script (Code.gs) ↔ Google Spreadsheet
```

## Features

- **Usage Input** — Key-in operator, shift, plan/actual pcs, event counters dengan weight yang boleh di-override
- **History** — Card-based view dengan button VIEW (popup detail) & EDIT
- **Report** — Bar chart (by event type) + line chart (daily trend) dengan date range filter
- **Master Settings** — Default parameter, event weights, operator list — disimpan ke spreadsheet
- **Auto-connect** — Setup sekali, URL disimpan dalam localStorage

## Quick Start

### 1. Google Spreadsheet
1. Buka Google Sheets > buat spreadsheet baru
2. Extensions > Apps Script
3. Paste `gs/Code.gs`
4. Deploy > New deployment > Web app > Execute as: Me > Access: Anyone
5. Copy Web App URL

### 2. GitHub Pages
1. Fork/clone repo ini
2. Settings > Pages > Branch: main > / (root) > Save

### 3. Connect
1. Buka URL GitHub Pages
2. Masukkan Google Script URL
3. Klik SAMBUNG

## Folder Structure

```
d92a-hotmelt-hmi/
├── README.md
├── LICENSE
├── .gitignore
├── gs/
│   └── Code.gs
└── src/
    └── index.html
```

## API Reference

### GET
| Action | Description |
|--------|-------------|
| `ping` | Test connection |
| `init` | Auto-create sheets |
| `getSettings` | Baca settings |
| `getLog` | Baca semua log |

### POST
| Action | Description |
|--------|-------------|
| `addLog` | Tambah rekod baru |
| `updateLog` | Kemaskini rekod |
| `saveSettings` | Simpan settings |
| `resetAll` | Reset semua data |

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, Chart.js, Vanilla JS
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Spreadsheet
- **Hosting**: GitHub Pages + Google

## License

MIT
