

**## API Reference**



**### GET Requests**



**| Action | URL | Description |**

**|--------|-----|-------------|**

**| `ping` | `?action=ping` | Test connection |**

**| `init` | `?action=init` | Auto-create sheets |**

**| `getSettings` | `?action=getSettings` | Baca settings |**

**| `getLog` | `?action=getLog` | Baca semua log |**



**### POST Requests**



**| Action | Body | Description |**

**|--------|------|-------------|**

**| `addLog` | `{data: entry}` | Tambah rekod baru |**

**| `updateLog` | `{data: entry}` | Kemaskini rekod |**

**| `saveSettings` | `{data: settings}` | Simpan settings |**

**| `resetAll` | `{}` | Reset semua data |**



**## Screenshots**



**| Usage Input | History |**

**|-------------|---------|**

**| Form input dengan live calculation | Card view dengan VIEW/EDIT button |**



**| Report Charts | Report Table |**

**|---------------|--------------|**

**| Bar chart + line trend | Full data table dengan highlight |**



**## Tech Stack**



**- \*\*Frontend\*\*: HTML, Tailwind CSS, Chart.js, Vanilla JS**

**- \*\*Backend\*\*: Google Apps Script (serverless)**

**- \*\*Database\*\*: Google Spreadsheet**

**- \*\*Hosting\*\*: GitHub Pages (frontend) + Google (backend)**



**## License**



**MIT — lihat \[LICENSE](LICENSE)**

