/**
 * D92A Hotmelt HMI — REST API Backend
 * Google Apps Script
 *
 * Deploy sebagai Web App (GET/POST handler).
 * Frontend (GitHub Pages) panggil URL ni sebagai API endpoint.
 */

var SETTINGS_SHEET = 'SETTINGS';
var LOG_SHEET = 'LOG';

var COL = {
  ID:1, DATE:2, TIME:3, OPERATOR:4, SHIFT:5, COVER:6,
  PLAN:7, ACTUAL:8, WPP:9,
  B:10, C:11, D:12, E:13, F:14, G:15,
  EWB:16, EWC:17, EWD:18, EWE:19, EWF:20, EWG:21,
  PLAN_G:22, ACTUAL_G:23, EVENTS_G:24, TOTAL_G:25, TOTAL_KG:26
};

var LOG_HEADERS = [
  'ID','DATE','TIME','OPERATOR','SHIFT','C/OVER',
  'PROD PLAN','ACTUAL PCS','W/PCS',
  'b','c','d','e','f','g',
  'EW_b','EW_c','EW_d','EW_e','EW_f','EW_g',
  'PLAN g','ACTUAL g','EVENTS g','TOTAL g','TOTAL kg'
];

// ============================================================
// WEB APP ENTRY — route GET & POST
// ============================================================
function doGet(e) {
  try {
    var action = e.parameter.action || '';
    var result;

    switch (action) {
      case 'init':
        result = initSheets_();
        break;
      case 'getSettings':
        result = getSettings();
        break;
      case 'getLog':
        result = getLog();
        break;
      case 'ping':
        result = { status: 'ok', timestamp: new Date().toISOString() };
        break;
      default:
        result = { error: 'Unknown action: ' + action, available: ['init','getSettings','getLog','ping'] };
    }

    return jsonResp(result);
  } catch (err) {
    return jsonResp({ error: err.message });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || '';
    var result;

    switch (action) {
      case 'addLog':
        result = addLogEntry(payload.data);
        break;
      case 'updateLog':
        result = updateLogEntry(payload.data);
        break;
      case 'saveSettings':
        result = saveSettings(payload.data);
        break;
      case 'resetAll':
        result = resetAllData();
        break;
      default:
        result = { error: 'Unknown action: ' + action, available: ['addLog','updateLog','saveSettings','resetAll'] };
    }

    return jsonResp(result);
  } catch (err) {
    return jsonResp({ error: err.message });
  }
}

function jsonResp(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// SHEET INITIALIZATION
// ============================================================
function initSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── SETTINGS ──
  var sh = ss.getSheetByName(SETTINGS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SETTINGS_SHEET);

    // Header area
    sh.getRange('A1:N1').merge()
      .setValue('SETTINGS — EDIT VALUES HERE')
      .setFontWeight('bold').setFontSize(14).setFontColor('#f59e0b');
    sh.getRange('A2').setValue('Yellow cells are editable. The HMI & Log read from here.');

    // Column headers row 3
    sh.getRange('B3').setValue('PARAMETER').setFontWeight('bold');
    sh.getRange('C3').setValue('VALUE').setFontWeight('bold');
    sh.getRange('D3').setValue('UNIT').setFontWeight('bold');
    sh.getRange('E3').setValue('NOTE').setFontWeight('bold');
    sh.getRange('G3').setValue('OPERATOR LIST').setFontWeight('bold');
    sh.getRange('I3').setValue('SHIFT').setFontWeight('bold');
    sh.getRange('K3').setValue('C/OVER').setFontWeight('bold');

    // Parameters row 4-10
    var params = [
      ['Weight per 1 pcs',       48, 'g', 'a = Prod Plan x this'],
      ['INITIAL START (b)',     300, 'g', 'per count'],
      ['AFTER BODY FITTING (c)', 200, 'g', 'per count'],
      ['AFTER BREAK (d)',       200, 'g', 'per count'],
      ['IDLING (e)',             60, 'g', 'per count'],
      ['REPLACEMENT (f)',        58, 'g', 'per count'],
      ['PURGING ONLY (g)',      200, 'g', 'per count']
    ];
    sh.getRange('B4:E10').setValues(params);

    // Default counts row 13-18
    sh.getRange('B12').setValue('DEFAULT COUNTS').setFontWeight('bold');
    sh.getRange('C12').setValue('VALUE').setFontWeight('bold');
    var defs = [
      ['b INITIAL START',      1],
      ['c AFTER BODY FITTING', 1],
      ['d AFTER BREAK',        1],
      ['e IDLING',             0],
      ['f REPLACEMENT',        0],
      ['g PURGING ONLY',       0]
    ];
    sh.getRange('B13:C18').setValues(defs);

    // Operators G4:G10
    ['AHMAD','ROSLI','FAIZAL','SITI','KUMAR','WEI MING','NURUL']
      .forEach(function(op, i) { sh.getRange(4 + i, 7).setValue(op); });

    // Shifts I4:I6
    ['Shift A','Shift B','Shift C']
      .forEach(function(s, i) { sh.getRange(4 + i, 9).setValue(s); });

    // C/OVER K4:K5
    sh.getRange('K4').setValue('NO');
    sh.getRange('K5').setValue('YES');

    // Yellow highlight editable
    var yellow = '#fef9c3';
    sh.getRange('C4:C10').setBackground(yellow);
    sh.getRange('C13:C18').setBackground(yellow);
    sh.getRange('G4:G10').setBackground(yellow);

    // Column widths
    sh.setColumnWidth(1, 30);
    sh.setColumnWidth(2, 200);
    sh.setColumnWidth(3, 80);
    sh.setColumnWidth(4, 50);
    sh.setColumnWidth(5, 180);
    sh.setColumnWidth(7, 140);
    sh.setColumnWidth(9, 90);
    sh.setColumnWidth(11, 80);
    sh.setFrozenRows(3);
  }

  // ── LOG ──
  var lg = ss.getSheetByName(LOG_SHEET);
  if (!lg) {
    lg = ss.insertSheet(LOG_SHEET);
    lg.getRange(1, 1, 1, LOG_HEADERS.length)
      .setValues([LOG_HEADERS])
      .setFontWeight('bold')
      .setBackground('#1e1e2e')
      .setFontColor('#e4e4ed');

    var widths = [50,90,60,80,70,55,80,80,60,35,35,35,35,35,35,55,55,55,55,55,55,80,80,80,90,70];
    widths.forEach(function(w, i) { lg.setColumnWidth(i + 1, w); });
    lg.setFrozenRows(1);
  }

  return { success: true, message: 'Sheets ready' };
}

// ============================================================
// SETTINGS
// ============================================================
function getSettings() {
  initSheets_();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);

  var wpp = Number(sh.getRange('C4').getValue()) || 48;

  var ek = ['b','c','d','e','f','g'];
  var names = ['INITIAL START','AFTER BODY FITTING','AFTER BREAK','IDLING','REPLACEMENT','PURGING ONLY'];
  var events = {};
  ek.forEach(function(k, i) {
    events[k] = {
      name:         names[i],
      weight:       Number(sh.getRange(5 + i, 3).getValue()) || 0,
      defaultCount: Number(sh.getRange(13 + i, 3).getValue()) || 0
    };
  });

  var operators = [];
  for (var r = 4; r <= 30; r++) {
    var v = sh.getRange(r, 7).getValue();
    if (v && String(v).trim()) {
      operators.push(String(v).trim().toUpperCase());
    } else {
      break;
    }
  }

  return { weightPerPcs: wpp, events: events, operators: operators };
}

function saveSettings(data) {
  initSheets_();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);

  sh.getRange('C4').setValue(data.weightPerPcs);

  var ek = ['b','c','d','e','f','g'];
  ek.forEach(function(k, i) {
    sh.getRange(5 + i, 3).setValue(data.events[k].weight);
    sh.getRange(13 + i, 3).setValue(data.events[k].defaultCount);
  });

  // Clear lama, tulis baru
  for (var r = 4; r <= 30; r++) sh.getRange(r, 7).clearContent();
  (data.operators || []).forEach(function(op, i) {
    if (i < 27) sh.getRange(4 + i, 7).setValue(op);
  });

  return { success: true };
}

// ============================================================
// LOG
// ============================================================
function getLog() {
  initSheets_();
  var lg = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET);
  var lastRow = lg.getLastRow();

  if (lastRow <= 1) return [];

  var raw = lg.getRange(2, 1, lastRow - 1, COL.TOTAL_KG).getValues();
  var ek = ['b','c','d','e','f','g'];

  return raw.map(function(row) {
    var ap  = Number(row[COL.ACTUAL - 1]) || 0;
    var wpp = Number(row[COL.WPP - 1])    || 48;

    var entry = {
      id:       Number(row[COL.ID - 1]) || 0,
      date:     row[COL.DATE - 1] || '',
      time:     row[COL.TIME - 1] || '',
      operator: row[COL.OPERATOR - 1] || '',
      shift:    row[COL.SHIFT - 1] || '',
      cover:    row[COL.COVER - 1] || 'NO',
      plan:     Number(row[COL.PLAN - 1]) || 0,
      actualPcs: ap,
      ew: {
        _wpp: wpp,
        b: Number(row[COL.EWB - 1]) || 0,
        c: Number(row[COL.EWC - 1]) || 0,
        d: Number(row[COL.EWD - 1]) || 0,
        e: Number(row[COL.EWE - 1]) || 0,
        f: Number(row[COL.EWF - 1]) || 0,
        g: Number(row[COL.EWG - 1]) || 0
      }
    };

    ek.forEach(function(k, i) {
      entry[k] = Number(row[COL.B - 1 + i]) || 0;
    });

    return entry;
  });
}

function addLogEntry(entry) {
  initSheets_();
  var lg  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET);
  var nid = getNextId_(lg);

  var wpp  = (entry.ew && entry.ew._wpp) ? Number(entry.ew._wpp) : 48;
  var plan = Number(entry.plan) || 0;
  var ap   = Number(entry.actualPcs) || 0;
  var planG  = plan * wpp;
  var actualG = ap * wpp;

  var ek = ['b','c','d','e','f','g'];
  var eventsG = 0;
  var ewVals = ek.map(function(k) {
    var w = (entry.ew && entry.ew[k] != null) ? Number(entry.ew[k]) : 0;
    eventsG += (Number(entry[k]) || 0) * w;
    return w;
  });

  var baseG  = ap > 0 ? actualG : planG;
  var totalG = baseG + eventsG;
  var totalKg = Math.round((totalG / 1000) * 10) / 10;

  var row = [
    nid, entry.date, entry.time || '', entry.operator, entry.shift, entry.cover,
    plan, ap, wpp
  ];
  ek.forEach(function(k) { row.push(Number(entry[k]) || 0); });
  ewVals.forEach(function(w) { row.push(w); });
  row.push(planG, actualG, eventsG, totalG, totalKg);

  lg.appendRow(row);
  return { success: true, id: nid };
}

function updateLogEntry(entry) {
  initSheets_();
  var lg   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET);
  var info = findRowById_(lg, entry.id);

  if (!info) return { success: false, error: 'ID ' + entry.id + ' tidak dijumpai' };

  var wpp  = (entry.ew && entry.ew._wpp) ? Number(entry.ew._wpp) : 48;
  var plan = Number(entry.plan) || 0;
  var ap   = Number(entry.actualPcs) || 0;
  var planG  = plan * wpp;
  var actualG = ap * wpp;

  var ek = ['b','c','d','e','f','g'];
  var eventsG = 0;
  var ewVals = ek.map(function(k) {
    var w = (entry.ew && entry.ew[k] != null) ? Number(entry.ew[k]) : 0;
    eventsG += (Number(entry[k]) || 0) * w;
    return w;
  });

  var baseG  = ap > 0 ? actualG : planG;
  var totalG = baseG + eventsG;
  var totalKg = Math.round((totalG / 1000) * 10) / 10;

  var row = [
    entry.id, entry.date, entry.time || '', entry.operator, entry.shift, entry.cover,
    plan, ap, wpp
  ];
  ek.forEach(function(k) { row.push(Number(entry[k]) || 0); });
  ewVals.forEach(function(w) { row.push(w); });
  row.push(planG, actualG, eventsG, totalG, totalKg);

  lg.getRange(info.row, 1, 1, COL.TOTAL_KG).setValues([row]);
  return { success: true };
}

function resetAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lg = ss.getSheetByName(LOG_SHEET);  if (lg) ss.deleteSheet(lg);
  var sh = ss.getSheetByName(SETTINGS_SHEET); if (sh) ss.deleteSheet(sh);
  initSheets_();
  return { success: true };
}

// ============================================================
// INTERNAL
// ============================================================
function getNextId_(lg) {
  var lr = lg.getLastRow();
  if (lr <= 1) return 1;
  var ids = lg.getRange(2, 1, lr - 1, 1).getValues().flat().map(Number);
  return Math.max.apply(null, ids.concat([0])) + 1;
}

function findRowById_(lg, id) {
  var lr = lg.getLastRow();
  if (lr <= 1) return null;
  var ids = lg.getRange(2, 1, lr - 1, 1).getValues().flat().map(Number);
  var idx = ids.indexOf(Number(id));
  if (idx === -1) return null;
  return { row: idx + 2, index: idx };
}