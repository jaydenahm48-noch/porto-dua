# Setup Google Apps Script

## Langkah-langkah

### 1. Buat Google Sheet
- Buka https://sheets.google.com
- Buat spreadsheet baru, beri nama **"NochyOS Portfolio"**

### 2. Pasang Script
- Di Sheet, klik **Extensions → Apps Script**
- Hapus kode default, paste seluruh isi `Code.gs`
- Klik **Save**

### 3. Setup Sheet
- Di Apps Script, jalankan fungsi `setupSheet` (klik Run)
- Ini otomatis bikin sheet `projects` dengan header yang benar + contoh data

### 4. Deploy sebagai Web App
- Klik **Deploy → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Klik **Deploy**
- Copy **Web App URL** yang muncul

### 5. Pakai di Website
Paste URL ke `index.html`:
```js
const API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';

// Ambil semua project
fetch(API_URL + '?action=getProjects')
  .then(r => r.json())
  .then(data => console.log(data.data));
```

---

## SendMail (form "Say hello!" di OS)

Kirim email dari form **Say hello!** ke inbox owner.

### 1. Buat script
- Buka https://script.google.com → **+ New project** (bukan dari Sheet)
- **+** di panel Files → **Script file** → nama `SendMail.gs`
- Paste isi `google-apps-script/SendMail.gs` → **Save**

### 2. Deploy sebagai Web App
- **Deploy → New deployment** → tipe **Web app**
- **Execute as:** Me · **Who has access:** Anyone
- Copy URL berakhiran `/exec`

### 3. Pasang di website
`index.html` baris konfigurasi:
```html
<script>window.NOCHY_SENDMAIL_URL = 'https://script.google.com/macros/s/AKfycb.../exec';</script>
```
Kalau kosong, tombol Send jatuh ke `mailto:` (butuh mail client default di OS).

### 4. Update kode (WAJIB agar Reply-To berfungsi)
Kalau nama & email pengirim tidak ikut masuk ke email, berarti deployment masih memakai versi lama:
- Paste ulang `SendMail.gs` terbaru → **Save**
- **Deploy → Manage deployments → ikon pensil → Version: `Head`** → Deploy (atau buat deployment baru, lalu update URL di `index.html`)

### Parameter yang dikirim
| Field | Isi |
|---|---|
| `email` | tujuan (inbox owner, `jydnahm@gmail.com`) |
| `name` | nama pengirim (opsional) |
| `fromEmail` | email pengirim — dipakai sebagai **Reply-To** + divalidasi format di form |
| `subject` | subjek |
| `body` | isi pesan |

---

## Struktur Kolom Sheet `projects`

| Kolom | Contoh | Keterangan |
|---|---|---|
| `id` | `nochy-eat` | Auto dari judul, bisa diisi manual |
| `judul` | `Nochy Eat` | Nama project |
| `kategori` | `Mobile App` | Kategori project |
| `deskripsi` | `Aplikasi...` | Deskripsi panjang |
| `url_thumbnail` | `https://drive...` | Link gambar cover (1 link) |
| `gambar_detail` | `https://...,https://...` | Multiple gambar, pisah koma |
| `link_project` | `https://github...` | Link GitHub/live |
| `teknologi` | `Flutter,Dart,Supabase` | Tech stack, pisah koma |

## Format Link Google Drive

Untuk gambar dari Google Drive, ubah link share:
```
Dari: https://drive.google.com/file/d/FILE_ID/view
Jadi: https://drive.google.com/uc?id=FILE_ID
```
