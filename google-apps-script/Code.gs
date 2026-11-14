// ============================================================
// NochyOS Portfolio - Google Apps Script API
// Deploy sebagai Web App: Execute as "Me", Access "Anyone"
// ============================================================

const SHEET_NAME = 'projects';

function doGet(e) {
  var action = e.parameter.action || 'getProjects';
  var result;

  try {
    if (action === 'getProjects') {
      result = getProjects();
    } else if (action === 'getProject') {
      result = getProjectById(e.parameter.id);
    } else {
      result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var result;

  try {
    if (action === 'addProject') {
      result = addProject(data.project);
    } else if (action === 'updateProject') {
      result = updateProject(data.id, data.project);
    } else if (action === 'deleteProject') {
      result = deleteProject(data.id);
    } else {
      result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── READ ALL ──────────────────────────────────────────────
function getProjects() {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  var headers = rows[0];
  var projects = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue; // skip empty rows

    var project = {};
    headers.forEach(function(header, j) {
      project[header] = row[j];
    });

    // Parse comma-separated fields jadi array
    project.teknologi   = splitComma(project.teknologi);
    project.gambar_detail = splitComma(project.gambar_detail);

    projects.push(project);
  }

  return { status: 'ok', data: projects };
}

// ── READ ONE ──────────────────────────────────────────────
function getProjectById(id) {
  var all = getProjects();
  var found = all.data.filter(function(p) { return p.id === id; });
  if (found.length === 0) return { error: 'Not found' };
  return { status: 'ok', data: found[0] };
}

// ── CREATE ────────────────────────────────────────────────
function addProject(project) {
  var sheet = getSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Auto-generate id dari judul jika kosong
  if (!project.id) {
    project.id = slugify(project.judul);
  }

  // Pastikan id unik
  var existing = getProjects().data.map(function(p) { return p.id; });
  if (existing.indexOf(project.id) !== -1) {
    return { error: 'ID sudah ada: ' + project.id };
  }

  var row = headers.map(function(header) {
    var val = project[header] || '';
    // Kalau array, join jadi string
    if (Array.isArray(val)) val = val.join(',');
    return val;
  });

  sheet.appendRow(row);
  return { status: 'ok', id: project.id };
}

// ── UPDATE ────────────────────────────────────────────────
function updateProject(id, project) {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  var headers = rows[0];

  var idCol = headers.indexOf('id');
  if (idCol === -1) return { error: 'Kolom id tidak ditemukan' };

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === id) {
      headers.forEach(function(header, j) {
        if (project[header] !== undefined) {
          var val = project[header];
          if (Array.isArray(val)) val = val.join(',');
          sheet.getRange(i + 1, j + 1).setValue(val);
        }
      });
      return { status: 'ok', id: id };
    }
  }

  return { error: 'Project tidak ditemukan: ' + id };
}

// ── DELETE ────────────────────────────────────────────────
function deleteProject(id) {
  var sheet = getSheet();
  var rows  = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idCol = headers.indexOf('id');

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { status: 'ok', deleted: id };
    }
  }

  return { error: 'Project tidak ditemukan: ' + id };
}

// ── HELPERS ───────────────────────────────────────────────
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan');
  return sheet;
}

function splitComma(str) {
  if (!str) return [];
  return String(str).split(',').map(function(s) { return s.trim(); }).filter(Boolean);
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

// ── SETUP: Buat sheet dengan header yang benar ────────────
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  var headers = ['id', 'judul', 'kategori', 'deskripsi', 'url_thumbnail', 'gambar_detail', 'link_project', 'teknologi'];

  // Set header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff')
    .setFontWeight('bold');

  // Set lebar kolom
  sheet.setColumnWidth(1, 150);  // id
  sheet.setColumnWidth(2, 200);  // judul
  sheet.setColumnWidth(3, 120);  // kategori
  sheet.setColumnWidth(4, 350);  // deskripsi
  sheet.setColumnWidth(5, 300);  // url_thumbnail
  sheet.setColumnWidth(6, 300);  // gambar_detail
  sheet.setColumnWidth(7, 250);  // link_project
  sheet.setColumnWidth(8, 250);  // teknologi

  // Contoh data
  var example = [
    'nochy-eat',
    'Nochy Eat',
    'Mobile App',
    'Aplikasi layanan pesan-antar makanan berbasis Flutter dengan sistem multi-role',
    'https://drive.google.com/uc?id=THUMBNAIL_ID',
    'https://drive.google.com/uc?id=IMG1_ID,https://drive.google.com/uc?id=IMG2_ID',
    'https://github.com/username/nochy-eat',
    'Flutter,Dart,Supabase,PostgreSQL,Midtrans API'
  ];
  sheet.getRange(2, 1, 1, example.length).setValues([example]);

  return 'Sheet berhasil dibuat!';
}
