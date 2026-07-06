
---

## `docs/DATA_SCHEMA.md`

```markdown
# Data Schema — Google Spreadsheet

## Sheet: SETTINGS

### Layout

| Row | Col B (Parameter) | Col C (Value) | Col D (Unit) | Col E (Note) |
|-----|-------------------|---------------|--------------|--------------|
| 1 | *(merged title)* | | | |
| 2 | *Yellow cells note* | | | |
| 3 | PARAMETER | VALUE | UNIT | NOTE |
| 4 | Weight per 1 pcs | 48 | g | a = Prod Plan x this |
| 5 | INITIAL START (b) | 300 | g | per count |
| 6 | AFTER BODY FITTING (c) | 200 | g | per count |
| 7 | AFTER BREAK (d) | 200 | g | per count |
| 8 | IDLING (e) | 60 | g | per count |
| 9 | REPLACEMENT (f) | 58 | g | per count |
| 10 | PURGING ONLY (g) | 200 | g | per count |
| 12 | DEFAULT COUNTS | VALUE | | |
| 13 | b INITIAL START | 1 | | |
| 14 | c AFTER BODY FITTING | 1 | | |
| 15 | d AFTER BREAK | 1 | | |
| 16 | e IDLING | 0 | | |
| 17 | f REPLACEMENT | 0 | | |
| 18 | g PURGING ONLY | 0 | | |

| Col G | Col I | Col K |
|-------|-------|-------|
| OPERATOR LIST | SHIFT | C/OVER |
| AHMAD | Shift A | NO |
| ROSLI | Shift B | YES |
| FAIZAL | Shift C | |
| SITI | | |
| KUMAR | | |
| WEI MING | | |
| NURUL | | |

> Sel kuning (C4:C10, C13:C18, G4:G10) boleh diedit terus.

---

## Sheet: LOG

### Column Definitions

| Col # | Header | Type | Description |
|-------|--------|------|-------------|
| A (1) | ID | Number | Auto-increment unique ID |
| B (2) | DATE | String | YYYY-MM-DD |
| C (3) | TIME | String | HH:MM |
| D (4) | OPERATOR | String | Nama operator |
| E (5) | SHIFT | String | Shift A / B / C |
| F (6) | C/OVER | String | NO / YES |
| G (7) | PROD PLAN | Number | Plan pcs |
| H (8) | ACTUAL PCS | Number | Actual pcs (0 jika tiada) |
| I (9) | W/PCS | Number | Weight per pcs pada masa simpan |
| J (10) | b | Number | Count event INITIAL START |
| K (11) | c | Number | Count event BODY FITTING |
| L (12) | d | Number | Count event AFTER BREAK |
| M (13) | e | Number | Count event IDLING |
| N (14) | f | Number | Count event REPLACEMENT |
| O (15) | g | Number | Count event PURGING ONLY |
| P (16) | EW_b | Number | Weight(g) b pada masa simpan |
| Q (17) | EW_c | Number | Weight(g) c pada masa simpan |
| R (18) | EW_d | Number | Weight(g) d pada masa simpan |
| S (19) | EW_e | Number | Weight(g) e pada masa simpan |
| T (20) | EW_f | Number | Weight(g) f pada masa simpan |
| U (21) | EW_g | Number | Weight(g) g pada masa simpan |
| V (22) | PLAN g | Number | plan × w/pcs |
| W (23) | ACTUAL g | Number | actual × w/pcs |
| X (24) | EVENTS g | Number | Jumlah (b×ew_b + c×ew_c + ... + g×ew_g) |
| Y (25) | TOTAL g | Number | Base (actual atau plan) + events |
| Z (26) | TOTAL kg | Number | Total g ÷ 1000 (1 dp) |

### Calculation Logic
