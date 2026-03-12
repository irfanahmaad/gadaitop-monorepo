# **📄 Requirement Specification (RS1.0)**	

**Proyek	:** Digitalisasi Gadai Top indonesia  
**Klien		:** PT Gadai Top Indonesia  
**Disusun oleh	:** Megandi  
**Tanggal	:** 7 November 2025

---

1. **Document Control**

Versi Dokumen	: RS1.0

Penulis Utama		: Megandi

Approver		: Pak Ferry & Pak Yongki

Tanggal Persetujuan	: 

**Riwayat Revisi**

| Versi | Tanggal | Deskripsi Perubahan |
| :---- | :---- | :---- |
| **1.0** | **7 November 2025** | Dokumen awal berdasarkan hasil *requirement gathering* & Project Charter |

2. **Tujuan**

Dokumen **Requirement Specification (RS)** ini menjabarkan kebutuhan fungsional dan non-fungsional sistem Digitalisasi Gadai Top indonesia. RS menjadi jembatan antara **Project Charter** (tujuan bisnis & lingkup) dengan **Design (UI/UX) dan Perancangan Sistem.**

Fungsi utamanya:

* Mendefinisikan **apa yang harus dilakukan sistem**, bukan **bagaimana sistem dibuat**.  
* Menjadi acuan utama untuk **tim pengembang, QA, dan user acceptance test (UAT)**.

3. **Scope**

**3.1 In-Scope**

Sistem ini mencakup modul-modul berikut:

1. **Master & Katalog Pinjaman** – pengaturan data cabang, pemilik, PT, user, harga, dan potongan.  
2. **SPK & NKB** – pencatatan pinjaman, pelunasan, dan perpanjangan dengan aturan bunga/denda.  
3. **Tambah Modal & Setor Uang** – arus dana pusat ↔ cabang melalui virtual account.  
4. **Stock Opname** – verifikasi fisik barang yang belum ditebus/dilelang.  
5. **Lelangan** – manajemen barang jatuh tempo dan validasi hasil lelang.  
6. **Payment Gateway** – Integrasi pembayaran otomatis.  
7. **Laporan & Mutasi** – laporan transaksi dan analitik operasional.  
8. **Device Unique Usable** – penjagaan agar aplikasi hanya dapat digunakan menggunakan device yang terverifikasi.  
9. **Deployment** – penginstalan aplikasi pada server *staging* (biaya server ditanggung oleh vendor pembuat aplikasi) dan penginstalan aplikasi pada server *production* (biaya ditanggung oleh *client*).

### **3.2 Out-of-Scope**

* Aktivitas lelang fisik secara manual.  
* Pengadaan hardware (scanner, printer).  
* Modul akuntansi penuh.

### **3.3 Target User**

* Pemilik PT / Superadmin  
* Admin PT  
* Staff Toko  
* Tim Stock Opname  
* Tim Lelang & Marketing  
* Customer

    
    
    
    
    
  


## **4\. Business Objectives**

| Tujuan | Indikator Keberhasilan |
| :---- | :---- |
| **Digitalisasi proses gadai** | Semua transaksi SPK & NKB tercatat digital dan terhubung ke mutasi |
| **Konsolidasi multi cabang dan multi PT** | Data lintas cabang dan pemilik dapat diakses dalam satu sistem |
| **Transparansi arus kas pusat–cabang** | Setiap tambah modal dan setor uang otomatis tercatat di mutasi |
| **Akurasi perhitungan bunga & denda** | Sistem menghitung otomatis sesuai konfigurasi tiap pemilik |
| **Audit trail & keamanan data** | Setiap perubahan data tercatat (user, waktu, nilai lama/baru) |

## **5\. Background / Current Situation**

### **Kondisi Saat Ini**

* Proses pencatatan pinjaman dan pelunasan dilakukan menggunakan aplikasi desktop.  
* Aplikasi dekstop tidak fleksibel.  
* Sulit melakukan konsolidasi laporan antar cabang dan PT.

  ### **Pain Points**

* Penggunaan aplikasi desktop memakan waktu yang lebih lama dalam mengelola data  
* Teknologi cukup usang.  
* Proses audit dan pelaporan memakan waktu lama.  
* Tidak ada transparansi transaksi pusat–cabang.

  ### **Peluang Perbaikan**

* Otomatisasi proses pinjaman, pelunasan, dan stok opname.  
* Integrasi langsung dengan virtual account.  
* Laporan real-time untuk pengambilan keputusan.  
* Aplikasi berbasis web jauh lebih fleksibel

## **6\. Stakeholders & Users**

| Tipe | Nama / Jabatan | Tanggung Jawab |
| :---- | :---- | :---- |
| **Sponsor** | PT Gadai Top Indonesia | Pendanaan dan arah strategis proyek |
| **Project Owner** | Megandi | Pengawasan teknis dan implementasi |
| **Business Analyst** | Megandi | Pengumpulan kebutuhan dan validasi fungsional |
| **Tech Lead** | Irfan | Arsitektur backend, API, & Frontend |
| **Frontend** | Irfan | Pengembangan antarmuka pengguna |
| **Backend** | Ichsan | Pengembangan backend & API |
| **QA**  | Sarah | UAT dan pengujian fungsionalitas |
| **PM** | Firman Suryo | Mengorganisir jalannya proyek |

## 

## 

## **7\. System Overview**

### **Deskripsi Singkat**

Digitalisasi Gadai Top Indonesia adalah sistem berbasis web dan mobile yang memungkinkan PT Gadai Top Indonesia mengelola seluruh proses gadai, pembayaran, dan pelaporan dalam satu platform terintegrasi. Sistem mengatur entitas utama seperti Pemilik → PT → Cabang → Nasabah → Barang Gadai → Transaksi.

## **8\. Functional Requirements**

1. **Super Admin**

   1. **Master Super Admin**  
      Pemilik bertindak sebagai super admin, yaitu  sebuah role yang memiliki akses penuh terhadap semua data pt dan toko yang berada di bawah naungannya.

      **Data: Email, password, nama, nomor telepon**

   2. **Master PT**  
      PT sebagai induk data dari toko/cabang. PT berelasi dengan pemilik (one to one). 1 Pemilik hanya memiliki 1 PT. PT juga berelasi dengan toko (one to many). 1 PT dapat memiliki banyak toko. 

      **Terdapat case spesial:** dimana **pemilik** dapat memiliki toko yang terdapat di PT lain yang bukan PT miliknya, case ini dapat disebut sebagai *pinjam PT*. Pada case pinjam PT, semua data pada toko tersebut hanya dapat dilihat oleh pemilik peminjam.

      **Data: kode unik, nama, nomor telepon, pemilik**

   3. **Master Tipe Barang**  
      Terdapat master tipe barang untuk membedakan barang yang digadai.

      **Data: nama tipe barang, kode tipe barang**

      

2. **Admin PT**

   1. **Master Katalog**  
      Sebuah fitur yang berfungsi untuk menunjukan daftar acuan harga dari barang-barang yang ingin digadai oleh customer. Super admin dan Admin PT dapat mengubah daftar katalog dengan mengunggah file excel. Daftar katalog diupdate secara *historical*, artinya data yang lama tidak dihapus. Proses update berfungsi untuk mengubah data informasi harga terkini apabila barang sudah ada di katalog sebelumnya, namun proses update berfungsi menambahkan data pada katalog apabila barang belum ada sebelumnya pada katalog. Misal harga acuan gadai Iphone 12 Pro pada tanggal 20 Oktober adalah 10 juta rupiah, lalu pada 1 November diubah menjadi 8 juta rupiah. Maka 2 data tersebut harus disimpan, tujuannya agar data harga acuan konsisten apabila ada customer yang menggadaikan Iphone 12 Pro pada tanggal antara 20 Oktober s/d sebelum 1 November.   
      Katalog dapat dilihat oleh Staff Toko secara satuan (menggunakan dropdown pencarian, bukan *whole list*). Hanya Super admin dan Admin PT yang dapat melihat secara *whole list*.  
   2. **Potongan Harga**  
      Admin PT dapat menambahkan potongan harga acuan terhadap barang tertentu di Master Katalog. Attribute yang diperlukan adalah keterangan/nama potongan dan jumlah (amount) potongan.

   3. **Tambah Modal**  
      Fitur berguna sebagai pendukung proses penambahan modal uang yang diberikan oleh Admin PT ke toko. Penambahan modal diperlukan ketika toko kehabisan uang untuk melakukan operasional harian termasuk proses pegadaian.  
      Flow: Menunggu request dari Staff Toko \-\> Masuk ke Admin PT \-\> Admin PT melakukan transfer secara manual ke toko \-\> Admin PT mengupload bukti transfer \-\> Staff Toko menerima informasi transfer

   4. **Mutasi/Transaksi Tiap Toko**  
      Terdapat fitur yang menampilkan mutasi/data jurnal transaksi yang terjadi pada tiap toko. Transaksi yang dimaksud termasuk: tambah modal, setor modal, transaksi spk nasabah, operasional harian toko, dan pembayaran nasabah.

   5. **Master User (Admin PT, Staff Toko, Stock Opname, Lelang)**  
      Terdapat 5 hak akses user yang dapat dibuat oleh masing-masing super admin (pemilik), yaitu:   
1. Admin PT	

   Memiliki kemampuan untuk melihat dan mengubah semua data pada semua toko di bawah PT nya

2. Staff Toko

   User yang di-assign pada sebuah PT

3. Stock Opname

   User yang memiliki akses terhadap fitur stock opname pada sebuah PT

4. Lelang

   User yang memiliki akses terhadap fitur pengambilan barang lelang pada sebuah PT

5. Marketing

   User yang memiliki akses terhadap fitur validator barang lelang yang dibawa oleh user lelang

   

   

   6. **Master Toko**  
      Toko adalah unit yang menjadi tempat transaksi antara customer dengan PT. Toko harus dimiliki oleh sebuah PT. Data toko hanya dapat dilihat oleh pemilik PT yang memiliki relasi terhadap toko tersebut, kecuali pada case *pinjam PT*.

      **Data: kode lokasi, nama toko (short version), nama toko (long version), alamat, telepon, kota, kode PT, pemilik** 

   7. **Pinjam PT**  
      Terdapat fitur pinjam PT, yaitu fitur yang berfungsi agar seorang pemilik dapat memiliki sebuah toko di bawah naungan PT pemilik lain. Fitur dapat diletakan pada fitur master toko tepatnya di fungsi pembuatan toko. Saat pembuatan toko, secara *default* field PT akan terisi dengan PT pemilik (pembuat toko), namun untuk mengajukan pinjaman PT, pemilik tersebut dapat mengisi PT dengan PT pemilik lain. Setelah itu, toko akan aktif setelah pemilik yang PT nya dipinjam mengkonfirmasi pinjaman tersebut. Fungsi ini juga terdapat pada fitur perubahan data PT dengan skema yang sama.

   8. **Stock Opname**  
      Tujuan: Admin PT merencanakan, menjadwalkan, dan memonitor kegiatan Stock Opname (SO) untuk memeriksa barang yang belum lunas/dilelang di toko-toko. Daftar prioritas “mata” menandai barang yang wajib dicek fisik, bukan sekadar ada/tiada. SO dilakukan scan QR Code SPK per barang; aksesnya khusus role Stock Opname.

   **Fitur:**

1. Master Syarat “Mata”: kriteria barang prioritas (contoh: kategori/tipe, nilai pinjaman ≥ X, kondisi tertentu) → menentukan daftar wajib-cek.  
2. Penjadwalan: tampilan kalender; pilih toko & staff SO; dukung multi-staff per toko dan multi-toko per staff di slot yang sama.  
3. Daftar Kandidat SO: sistem otomatis menarik barang belum lunas / belum dilelang sebagai scope SO.  
4. Monitoring Progress: status per jadwal (Draft / Dijadwalkan / Berjalan / Selesai), jumlah barang terscan vs target, daftar temuan (mismatch/kerusakan).

   **Data yang dikelola (minimum):**

1. Jadwal SO: ID, tanggal, toko (multi), petugas SO (multi), status, catatan.  
2. “Mata” Rules: nama aturan (misal: barang mahal), parameter (tipe barang, range nilai, kondisi, dll), aktif/nonaktif.  
3. Hasil SO: hasil cek (Ada & kondisi | Tidak Ada | Mismatch identitas), foto bukti, catatan.

   **Validasi Bisnis:**

1. Satu jadwal hanya dapat Berjalan untuk toko yang sama di slot waktu yang sama (hindari duplikasi inspeksi).  
2. Barang lunas/dilelang sebelum waktu SO otomatis dikeluarkan dari target.  
3. “Mata” hanya mem-filter subset prioritas; daftar total tetap tersedia.

   **Acceptance Criteria:**

1. Admin dapat membuat jadwal SO (multi-toko / multi-staf) via kalender.  
   Daftar target memuat hanya barang aktif (belum lunas/dilelang); subset “mata” ter-highlight.  
2. Progres & hasil SO per toko dapat dipantau dan diekspor (CSV/PDF).

   9. **Lelangan**  
      Tujuan: Admin PT mengelola Index Jatuh Tempo dan distribusi tugas lelang kepada User Lelang, serta memantau validasi oleh tim Marketing atas barang yang diambil.

      **Fitur:**	

1. Index Jatuh Tempo: daftar barang jatuh tempo dari SPK	; filter tipe barang (multi), lokasi (multi), range tanggal, dan segmentasi \< 1 bulan / \> 1 bulan.  
2. Distribusi Tugas: Admin mendistribusikan list barang ke User Lelang per toko; setiap item wajib scan saat pengambilan → otomatis checklist.  
3. Validasi Marketing: setelah pengambilan, Marketing memvalidasi kondisi & kesesuaian barang.

   **Data yang dikelola (minimum):**

1. Batch Lelang: ID batch, toko, penanggung jawab (User Lelang), jumlah item, status (Draft/Didistribusikan/Diambil/Validasi/Siap Lelang).  
2. Item Lelang: referensi QR Code SPK, tipe, lokasi, status pengambilan (scanned/not), status validasi marketing (OK/Return/Reject) \+ alasan.

   **Validasi Bisnis:**

1. Hanya SPK **jatuh tempo** yang tampil pada index & bisa didistribusikan.  
2. Setiap item harus **scan** saat diambil; sistem otomatis memberi **checklist**.  
3. Perubahan status item ke “Siap Lelang” **wajib** sudah **OK** oleh Marketing.

   **Acceptance Criteria:**

1. Admin dapat menghasilkan daftar jatuh tempo sesuai filter dan mencetaknya.  
2. Admin dapat membentuk batch & menugaskan User Lelang per toko.  
3. Setiap pengambilan terekam via scan; marketing dapat memberi verdict (OK/Return/Reject) dengan alasan.

   

3. **Staff Toko**

1. **Master Customer**

   Sebuah fitur yang berguna untuk menambahkan data customer saat customer ingin bertransaksi gadai. Tidak hanya untuk menambahkan pada fitur ini juga terdapat fungsi ubah, hapus, dan cari. Data customer terintegrasi antar PT, jadi 1 customer datanya dapat dilihat di semua PT . Terdapat fungsi OCR (upload foto KTP), sehingga staff toko memiliki pilihan untuk memasukan NIK customer secara otomatis. Staff toko dapat melakukan blacklist terhadap customer. Terdapat labeling terhadap customer yang ter-blacklist (Customer tidak dapat melakukan pinjaman).

   **Data: Nama, alamat, kota, kecamatan, kelurahan, telepon 1, telepon 2, nomor ktp, tanggal lahir, email, NIK.**

2. **Pinjaman \-\> SPK**

   Staff toko memasukan NIK customer atau melakukan pencarian berdasarkan nama. Lalu staff toko memasukan data terkait barang yang ingin digadai. Data yang dibutuhkan adalah

1. Data harga acuan dari master katalog  
2. Tipe barang  
3. Kondisi barang: mulus, lecet sedikit, lecet parah  
4. Kelengkapan barang  
5. Status barang  
6. Jumlah Pinjaman  
7. IMEI: dapat di-scan atau diketik manual (terdapat labeling antara keduanya)  
8. Keterangan tambahan  
9. PIN: harus dimasukkan oleh Customer sebagai syarat penebusan barang.  
10. Jumlah pinjaman: tidak bisa lebih dari harga acuan barang

    Setelah berhasil memasukkan data, nomor SPK akan terbuat secara otomatis. **Format SPK untuk internal**: 

    \[Tipe barang\]\[kode urutan transaksi yang dimiliki tiap toko\]   
    \*kode urutan: 8 digit

    contoh: H00000001 → di toko cabang pasar minggu bisa sama dengan H0000001 nya di cabang Daan Mogot.

    Lalu, **format SPK untuk customer**:   
    yyyymmdd\[randomize 4 angka\]  
    \*pastikan kode tidak redundant

    SPK internal itu bisa dicetak dalam bentuk QR Code, agar bisa ditempel di barang yang digadai.

    Pada proses pinjaman, customer diwajibkan memasukan PIN Customer yang nantinya digunakan ketika ingin melakukan pembayaran dan penebusan barang. PIN Customer dimasukkan pada interface terpisah (portal customer), dimana ketika staff toko selesai memasukkan data customer, langkah terakhir adalah meminta PIN dari customer, layar kedua (layar yang tampil menghadap customer/portal customer) memunculkan interface permintaan PIN dari customer. Hanya customer yang dapat memasukkan pin tersebut. PIN Customer berelasi one to one terhadap data customer, artinya 1 customer hanya dapat memiliki 1 PIN. Jika customer sudah memiliki PIN (sudah pernah membuat SPK sebelumnya), maka terdapat pilihan apakah customer mau membuat PIN baru atau menggunakan PIN lamanya. 

3. **History Pinjaman (Index SPK)**

   Terdapat fitur daftar index SPK. Staff toko dapat mencari berdasarkan lokasi. Pencarian dapat dilakukan berdasarkan customer dan nomor SPK (h1, h2, dll). Di detail SPK nya ada history pembayaran, ada status jika lunas, ada status juga jika terlelang.

4. **NKB**  
   Modul NKB berfungsi untuk mencatat dan memproses pembayaran dari nasabah atas pinjaman yang tercatat dalam SPK. Pembayaran dapat berupa pelunasan maupun perpanjangan.

   Setiap transaksi pembayaran menghasilkan nomor NKB unik, dan perhitungannya mengikuti rumus bunga, denda, serta konfigurasi yang disepakati.

   **Pembayaran Terhadap SPK**

1. Terdapat portal terpisah dari sistem utama khusus untuk pembayaran NKB. Portal ini dapat diakses oleh customer.   
2. Untuk melakukan pembayaran SPK, customer harus membuka Portal Customer, lalu memasukkan NIK dan PIN Customer. Sistem akan menampilkan data customer dan daftar SPK nya.  
3. Customer memilih SPK mana yang ingin dibayar. Tiap daftar SPK menampilkan nominal pembayaran yang harus dibayar oleh customer.  
4. Setelah itu customer memilih jenis pembayaran:  
   - **Pelunasan:** pembayaran penuh (pokok \+ bunga).   
   - **Perpanjangan:** pembayaran bunga dan pembayaran pokok (batas atas tidak ditentukan, namun batas bawah sebesar Rp50.000).  
5. Setelah memilih jenis pembayaran, sistem akan menampilkan jenis transaksi:   
- **Pembayaran mandiri**: menggunakan payment gateway (virtual account, transfer, dll). Pembayaran ini terkonfirmasi secara otomatis oleh sistem.  
- **Pembayaran cash**: pembayaran uang cash di cabang. Pada pembayaran jenis ini, permintaan pembayaran cash dapat dilihat di sistem utama Staff Toko. Staff Toko dapat mengkonfirmasi pembayaran cash berhasil jika uang sudah diterima olehnya.

  **Penomoran Otomatis**

  Setiap kali pembayaran dilakukan, sistem akan membuat **nomor NKB baru** secara otomatis dengan format:

   `[KodeLokasi]-NKB-[YYYYMMDD]-[4DigitRandom]`  
  Nomor ini tidak boleh duplikat walaupun berasal dari lokasi berbeda.

  **Perhitungan Otomatis Bunga dan Denda**

  Sistem menghitung bunga dan denda berdasarkan **aturan tanggal dan kondisi pembayaran**.

  ### **Rumus Perhitungan Bunga dan Denda**

| Kondisi Pembayaran | Ketentuan | Formula |
| :---- | :---- | :---- |
| **Pelunasan \< 15 hari** | Bunga ringan | Pokok \+ (Pokok × x%) |
| **Pelunasan ≤ 1 bulan** | Bunga normal | Pokok \+ (Pokok × y%) |
| **Perpanjangan tepat waktu** | Bayar bunga \+ adm \+ as | (Pokok × y%) \+ adm% \+ as(Rp) |
| **Perpanjangan terlambat** | Bayar bunga \+ adm \+ as \+ denda | (Pokok × y%) \+ adm% \+ as(Rp) \+ d% |
| **Keterlambatan \> 1 bulan** | Berlaku kelipatan | (Pokok × y%) \+ adm% \+ as \+ (d% × n bulan terlambat) |


  `x` \= bunga cepat (default: 5%)

  `y` \= bunga normal (default: 10%)	

  `adm` \= biaya administrasi (default: 0%)

  `as` \= biaya asuransi (default: 0 rupiah)

  `d` \= denda keterlambatan (default: 2%)

  `Minimal angsuran pokok` \= Rp 50.000


  *Case:*

  Jika ada seorang customer melakukan gadai pada tanggal 18 oktober, maka jatuh temponya jatuh pada 18 November.

  Jika customer tersebut ingin melunasi barang di bawah 2 minggu, maka ia hanya perlu membayar pokok pinjaman \+ (bunga) 5%, namun jika lebih dari 2 minggu maka bunganya jadi 10%.

  Jika customer ingin melakukan perpanjangan, customer harus membayar pokok secara parsial (min. Rp50.000) \+ (bunga) 10% dari total pokok sebelum dibayar secara parsial pada saat itu. Pembayaran pokok parsial akan mengurangi pinjaman pokok.

  Jika customer telat melakukan perpanjangan pada 20 November (lebih dari tanggal 18 November), maka ia harus membayar pokok secara parsial \+ 10% bunga \+ 2% sebagai denda. Pada case ini, untuk pembayaran selanjutnya bunga akan dihitung berdasarkan hutang pokok sebelum dibayar secara parsial pada 20 November (dalam hitungan denda tidak terjadi pengurangan pokok yang dibayar pada 20 November).

  ### **Alur Proses Pembayaran**

1. ### Staff toko **scan barcode SPK** → sistem menampilkan detail pinjaman.

2. ### Staff toko memilih **jenis pembayaran (Pelunasan / Perpanjangan)**.

3. ### Sistem menghitung otomatis bunga/denda berdasarkan: Tanggal pinjaman (start date), Tanggal jatuh tempo (due date), Tanggal pembayaran saat ini

4. ### Nasabah melakukan pembayaran → sistem menyimpan transaksi & membuat **nomor NKB**.

5. ### Status SPK berubah:

- ### **“Lunas”** jika pokok dibayar penuh.

- ### **“Berjalan”** jika hanya bunga dibayar (perpanjangan).

- ### **“Terlambat”** jika pembayaran lewat tanggal jatuh tempo dan belum dilunasi.

- ### Status SPK akan berubah lagi pada pembayaran selanjutnya.

5. **Setor Uang**

   Fitur Setor Uang berfungsi untuk mengelola proses pengiriman dana dari cabang ke pusat. Flow transaksi dilakukan dengan integrasi Virtual Account (VA) untuk memastikan transparansi dan sinkronisasi otomatis antara pusat dan cabang.

1. Permintaan Setoran oleh Pusat  
- Admin pusat dapat membuat permintaan setoran kepada cabang tertentu.  
- Permintaan disertai jumlah nominal, batas waktu pembayaran (hari yang sama), dan nomor VA unik.  
- Sistem mengirim notifikasi ke dashboard cabang.  
2. Pembayaran oleh Cabang  
- Cabang melakukan pembayaran melalui Virtual Account sesuai instruksi.  
- Setelah transfer berhasil, sistem menerima callback konfirmasi dari payment gateway.  
3. Verifikasi & Pencatatan Otomatis  
- Jika callback valid, status setoran berubah menjadi “Lunas”.  
- Sistem secara otomatis menambahkan transaksi ke mutasi pusat (Kredit) dan mutasi cabang (Debit).  
  **Alur Proses**  
1. Admin pusat membuat **permintaan setor uang** dengan nominal tertentu.  
2. Sistem menghasilkan **VA unik** untuk cabang tersebut.  
3. Cabang melakukan pembayaran **di hari yang sama** melalui bank/payment app.  
4. Payment gateway mengirim callback → sistem memverifikasi.  
5. Status transaksi diperbarui:  
- **Pending** → **Lunas** jika berhasil.  
- **Expired** jika lewat hari tanpa pembayaran.  
6. Transaksi otomatis masuk ke laporan mutasi pusat & cabang.

   ### 

   ### **Validasi** 

1. ### Satu cabang hanya dapat memiliki **satu transaksi setor uang aktif (Pending)** dalam waktu bersamaan.

2. ### Pembayaran **tidak boleh dilakukan lewat dari hari permintaan**.

3. ### Jika lewat waktu, status berubah ke **Expired** dan VA tidak dapat digunakan kembali.

4. ### Sistem hanya menerima callback dari **payment gateway resmi (registered endpoint)**.

4. **Staff Stock Opname** 

1. **Stock Opname \- Staff View**

   Tujuan: Petugas SO mengeksekusi jadwal yang dibuat Admin PT dengan scan QR Code SPK per barang, memberi hasil cek, dan melaporkan temuan.

   **Alur:**

1. **Lihat Jadwal**: staf melihat daftar tugas (tanggal, toko, target barang, indikator “mata”).  
2. **Eksekusi SO (Scan)**:  
- Scan QR Code SPK barang → tampil data ringkas (SPK, tipe, status).  
- Input hasil: **Ada & kondisi sesuai** / **Ada tapi mismatch** / **Tidak Ada**; unggah foto bukti bila perlu.  
3. **Submit Hasil** per toko/jadwal; sistem menghitung progres & menyimpan log.

   **Validasi Bisnis:**

1. Hanya barang **aktif** (belum lunas/dilelang) yang bisa di-scan.  
2. Barang prioritas “mata” wajib memiliki hasil cek **bukan kosong**. Hasil cek berupa foto yang harus diupload.

   **Acceptance Criteria:**

1. Staf dapat menyelesaikan SO dengan scan sukses; progres meningkat sesuai jumlah barang ter-scan.  
2. Hasil & foto bukti tersimpan; laporan per jadwal dapat ditinjau Admin PT.

   **Data Tersimpan (per hasil scan):**

1. Waktu scan, QR Code SPK, hasil cek, foto (opsional), catatan, user id, lokasi.

5. **Staff Lelang**

1. **Lelang \- Staff View**

   Tujuan: Menjalankan penjemputan barang jatuh tempo sesuai batch/tugas dari Admin PT, melakukan scan saat pengambilan, dan menyerahkan barang untuk dilakukan validasi oleh tim Marketing.

   **Alur:**

1. **Terima Tugas**: lihat batch lelang (toko, daftar item, rute).  
2. **Pengambilan di Toko**:  
- Untuk setiap item, **scan QR Code SPK** → status item berubah **“Diambil (Checklist)”**.  
- Jika tidak ditemukan/bermasalah, tandai dan beri catatan.  
3. **Serah ke Marketing**: serahkan barang beserta daftar scan ke tim Marketing untuk validasi.

   **Validasi Bisnis:**

1. Setiap item pada batch **wajib** di-scan untuk dianggap **diambil**.  
2. Pengambilan item yang **bukan** pada batch aktif → ditolak.  
3. Item yang tidak berhasil diambil harus memiliki **alasan**.

   **Acceptance Criteria:**

1. Setiap item di batch memiliki status hasil scan (checklist) atau alasan gagal.  
2. Batch dapat ditandai **Selesai Ambil** dan siap ke tahap **Validasi Marketing**.  
   **Data Tersimpan:**  
1. Waktu & lokasi scan, user lelang, QR Code SPK item, status (checklist/gagal), catatan.

6. **Staff Marketing**

1. **Validasi Lelang**

   Tujuan: Memastikan kesesuaian & kondisi barang yang diambil User Lelang sebelum status “Siap Lelang” ditetapkan.

   **Alur:**

1. Terima Batch untuk Validasi: lihat daftar item yang sudah berstatus Diambil (Checklist).  
2. Validasi Item:  
1. Buka item → bandingkan identitas (SPK/IMEI/tipe) & kondisi fisik.  
2. Pilih verdict: OK / Return / Reject \+ alasan & foto bukti (opsional).  
3. Finalisasi Batch: bila semua item OK, batch berstatus “Siap Lelang”.

   **Validasi Bisnis:**

1. Item tanpa hasil scan User Lelang → tidak bisa divalidasi.  
2. OK hanya jika identitas & kondisi sesuai.  
3. Return/Reject harus menyertakan alasan; sistem memberi notifikasi ke Admin PT.

   **Acceptance Criteria:**

1. Semua item tervalidasi dengan verdict dan (jika perlu) foto bukti.  
2. Batch otomatis berstatus Siap Lelang jika seluruh item OK; item non-OK tercatat untuk tindak lanjut.

   **Data Tersimpan:**

1. Waktu validasi, user marketing, verdict, alasan, foto (opsional).

   ### **Catatan Tambahan Integrasi & Laporan**

1. ### Laporan SO: per jadwal, per toko, rekap “mata”, mismatch, bukti foto.

2. ### Laporan Lelang: index jatuh tempo (filter multi-tipe/multi-lokasi/range), rekap distribusi, rekap pengambilan (scan), rekap validasi (OK/Return/Reject).

   

7. **Customer**

1. **Portal Pembayaran**

   Portal Pembayaran Customer adalah sebuah portal sistem yang terpisah dari sistem utama (dipisahkan dengan sub domain). Customer dapat mengakses portal ini dengan memasukkan NIK dan PIN Customer. Setelah memasukkan NIK dan Pin Customer, customer dapat melihat daftar SPK nya. Pada daftar tersebut terdapat informasi PT, cabang, barang, dan nominal SPK nya. Customer dapat memilih SPK mana yang ingin dibayar, setelah memilih sistem akan menunjukan detail informasi SPK tersebut disertai dengan nominal yang harus dibayarkan pada hari itu. Pembayaran SPK dapat dilakukan secara cash atau virtual menggunakan payment gateway.

8. **Super Admin \- Laporan**  
   1. Laporan Jatuh Tempo: menampilkan laporan SPK SPK yang jatuh tempo  
   2. SPK detail: Bisa melihat detail SPK, Pembayaran2 terkait, Lelangan Terkait , dan Buku Bunga  
   3.  Laporan Mutasi Harian  
   4.  Laporan Stok Opname  
   5. Laporan Perhitungan Outstanding  
   6.  Laporan Perhitungan Biaya lain, tambah modal dan Tarik modal  
   7. Laporan Omset Kanan Kiri  
      1. Perhitungan nya: dari sisa pinjaman SPK yang dibungakan, dijumlahkan dengan SPK baru  
   8. Jumlah Barang (unit), SPK, Sisa Pinjaman, Lelangan  
   9.  Laporan Persentase Kemungkinan Fraud di cabang  
   10. Laporan adanya lonjakan merk dan tipe tertentu yang tiba tiba banyak masuk (check bom)  
   11. Laporan blacklist customer dan barang  
   12. Laporan list NKB  
   13. Laporan list SPK  
   14. Laporan list Lelangan  
   15. Laporan list Tambah, Tarik Modal, dan Biaya Lain  
   16. Laporan list SPK yang harus di SMS / WA Repeat Order maupun di-reminder jatuh tempo

   **\*Semua Laporan dapat di-filter berdasarkan lokasi, tanggal, dan filter lainnya yang sesuai diperlukan oleh laporan tersebut. Laporan juga dapat diatur berdasarkan data tanggal yang sudah lampau.**

## **9\. Non-Functional Requirements**

| Kategori | Deskripsi |
| :---- | :---- |
| **Keamanan (Security)** | Enkripsi PIN & data sensitif; autentikasi JWT; role-based access VPN-based access. Aplikasi hanya dapat dibuka menggunakan VPN. Terdapat penguncian mac address untuk menentukan pc atau laptop mana saja yang dapat mengakses aplikasi atau VPN |
| **Ketersediaan (Availability)** | All-time uptime; backup harian otomatis |
| **Kegunaan (Usability)** | UI responsif (web & mobile UI); bahasa Indonesia yang jelas |
| **Pemeliharaan (Maintainability)** |      Konfigurasi bunga/denda via UI admin tanpa hardcode |

## 

## **10\. Constraints**

| Jenis | Deskripsi |
| :---- | :---- |
| **Bisnis** | Timeline maksimal 3.5 bulan; budget sesuai proposal disetujui |
| **Teknis** | Sistem berbasis web (Next.js/Nest.js) dan mobile (React Native) |
| **Regulasi** | Server production dimiliki seutuhnya oleh *client*. |
| **Operasional** | Tidak boleh ada hard delete untuk semua dokumen atau data |

Tambahkan pindah kepemilikan…  
Role tiap kekuasaan..  
di SPK \-\> ada informasi katalog di tanggal yang mana  
Syarat mata \-\> tanggal jatuh tempo, tanggal pinjam, sama persen  
Nah syarat mata itu ada di-append ke Stock opname  
Proses submit stock opname masih blm jelas?  
Tanggung jawab  
di stock opname ada ngecek uang juga  
Print SPK cuma sekali