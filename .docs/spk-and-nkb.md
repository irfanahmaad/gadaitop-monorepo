**User Story SPK**

1. **SPK Baru**

**CUSTOMER:**  
Seorang customer datang ke toko dengan membawa barang yang ingin digadaikan. Customer menyerahkan KTP kepada staff dan menyampaikan barang serta nominal pinjaman yang diinginkan.

**STAFF TOKO:**  
Staff membuka sistem dan mencari data customer berdasarkan NIK atau nama. Jika data sudah tersedia, sistem menampilkan datanya secara otomatis. Jika customer baru, staff membuat data customer terlebih dahulu sebelum melanjutkan. Staff juga memastikan customer tidak masuk dalam daftar blacklist jika iya, proses SPK tidak bisa dilanjutkan.

Setelah data customer siap, staff menginput detail barang gadai: tipe barang, kondisi fisik (mulus / lecet sedikit / lecet parah), kelengkapan, status barang, nomor IMEI (scan atau manual), serta keterangan tambahan. Staff mengacu pada harga acuan dari Master Katalog sesuai tanggal transaksi, lalu memasukkan jumlah pinjaman yang diminta customer. Sistem memastikan nominal pinjaman tidak boleh melebihi harga acuan barang.

CUSTOMER:  
Setelah staff selesai menginput data, sistem berpindah ke tampilan portal customer — layar yang menghadap langsung ke customer. Di layar ini, customer diminta memasukkan PIN pribadi mereka sebagai kunci penebusan barang di kemudian hari. Jika customer sudah pernah bertransaksi sebelumnya dan sudah punya PIN, customer diberi pilihan untuk menggunakan PIN lama atau membuat PIN baru.

**SYSTEM:**  
Setelah PIN dikonfirmasi, sistem secara otomatis membuat dua nomor

**SPK:**

- Nomor SPK Internal : format \[Tipe Barang\]\[8 digit urutan per toko\] contoh H00000001
- Nomor SPK Customer : format \[YYYYMMDD\]\[4 digit random\] contoh 202410184823 (unik secara global)

Nomor SPK internal kemudian bisa dicetak sebagai QR Code untuk ditempelkan pada barang gadai. Pencetakan hanya bisa dilakukan satu kali.

\*note::

- Customer blacklist tidak bisa lanjut ke proses SPK.
- Nominal pinjaman tidak bisa melebihi harga acuan katalog.
- Hanya customer yang bisa input PIN di layar customer-facing.
- Nomor SPK customer unik secara global di seluruh cabang.
- QR Code SPK hanya bisa dicetak satu kali.

2. **Melihat Daftar dan Riwayat SPK**

**STAFF TOKO:**  
Staff membuka fitur Index SPK untuk memantau seluruh pinjaman yang aktif maupun yang sudah selesai. Staff dapat mencari data berdasarkan nama customer, NIK, atau nomor SPK, serta memfilter berdasarkan lokasi cabang.

**SYSTEM:**  
Sistem menampilkan detail SPK yang dipilih, meliputi: informasi barang gadai, nominal pinjaman, referensi harga katalog beserta tanggalnya, riwayat seluruh pembayaran (NKB), serta status terkini SPK.

**SYSTEM:**  
Status SPK diperbarui otomatis setiap kali ada transaksi NKB baru:

- "Berjalan" : pinjaman aktif, belum jatuh tempo.
- "Terlambat" : sudah lewat jatuh tempo, belum ada pembayaran.
- "Lunas" : seluruh pokok pinjaman sudah dibayar penuh.
- "Terlelang" : barang sudah diproses melalui jalur lelang.

**Acceptance Criteria:**

- Pencarian bisa berdasarkan nama, NIK, atau nomor SPK.
- Filter lokasi cabang berfungsi dengan benar.
- Status SPK berubah otomatis setiap ada transaksi NKB.
- Referensi katalog menampilkan tanggal harga yang digunakan.

**User Story NKB**  
**(Nota Kredit Bayar / Pembayaran)**

1. **Pelunasan oleh Customer (via Portal)**

**CUSTOMER:**  
Customer membuka Portal Pembayaran di subdomain terpisah dari sistem utama, lalu login menggunakan NIK dan PIN. Sistem menampilkan daftar SPK aktif beserta nominal tagihan hari ini untuk masing-masing SPK. Customer memilih SPK yang ingin dilunasi dan memilih opsi "Pelunasan".

**SYSTEM:**  
Sistem menghitung total yang harus dibayar berdasarkan kapan pembayaran dilakukan:

- Kurang dari 15 hari sejak SPK : Pokok \+ (Pokok x 5%)
- Lebih dari 15 hari, maks 1 bln : Pokok \+ (Pokok x 10%)

Nominal ditampilkan jelas sebelum customer mengonfirmasi.

**CUSTOMER:**  
Customer memilih metode pembayaran:

- Virtual Account / Payment Gateway: customer menyelesaikan pembayaran secara digital, konfirmasi otomatis dari gateway.
- Cash di Cabang: customer datang ke toko dan membayar tunai kepada staff.

**STAFF TOKO (jika cash):**  
Staff menerima uang tunai dari customer dan mengonfirmasi penerimaan pembayaran di sistem utama.

**SYSTEM:**  
Setelah pembayaran terkonfirmasi (otomatis via gateway atau manual via staff), sistem:

- Membuat nomor NKB otomatis: \[KodeLokasi\]-NKB-\[YYYYMMDD\]-\[4DigitRandom\]
- Mengubah status SPK menjadi "Lunas".
- Mencatat transaksi ke mutasi toko.

**Acceptance Criteria:**

- Login portal hanya bisa dengan NIK \+ PIN yang valid.
- Nominal dihitung otomatis sesuai aturan bunga yang berlaku.
- Konfirmasi gateway bersifat otomatis, cash butuh konfirmasi staff.
- Status SPK berubah "Lunas" setelah pembayaran penuh terkonfirmasi.
- Nomor NKB unik secara global di seluruh cabang.

2. **Perpanjangan Tepat Waktu oleh Customer (via Portal)**

**CUSTOMER:**  
Customer login ke Portal Pembayaran menggunakan NIK dan PIN. Dari daftar SPK, customer memilih SPK yang ingin diperpanjang sebelum tanggal jatuh tempo dan memilih opsi "Perpanjangan / Cicil".

**SYSTEM:**  
Sistem menghitung tagihan perpanjangan tepat waktu:

- (Pokok x 10%) \+ biaya administrasi \+ biaya asuransi.
- Bunga dihitung dari total pokok SEBELUM pembayaran parsial.
- Nominal ditampilkan lengkap sebelum customer mengonfirmasi.

**CUSTOMER:**  
Customer memasukkan nominal angsuran pokok yang ingin dibayar (minimal Rp50.000), lalu memilih metode pembayaran: virtual account / payment gateway, atau cash di cabang.

**STAFF TOKO (jika cash):**  
Staff menerima uang tunai dan mengonfirmasi pembayaran di sistem utama.

**SYSTEM:**  
Setelah terkonfirmasi, sistem:

- Mengurangi saldo pokok sesuai angsuran parsial yang dibayar.
- Memperbarui jatuh tempo: jatuh tempo lama \+ 30 hari (bukan dari tanggal bayar).
- Membuat nomor NKB baru secara otomatis.
- Status SPK tetap "Berjalan".

**Acceptance Criteria:**

- Minimal angsuran pokok Rp50.000.
- Jatuh tempo baru \= jatuh tempo lama \+ 30 hari.
- Saldo pokok berkurang sesuai angsuran yang dibayar.
- Status SPK tetap "Berjalan" setelah perpanjangan.

3. **Perpanjangan Terlambat oleh Customer (via Portal)**

**CUSTOMER:**  
Customer login ke Portal Pembayaran menggunakan NIK dan PIN. Customer memilih SPK yang sudah melewati tanggal jatuh tempo dan memilih opsi "Perpanjangan".

**SYSTEM:**  
Sistem mendeteksi keterlambatan dan menghitung tagihan:

- (Pokok x 10%) \+ administrasi \+ asuransi \+ (denda 2% x n bulan).
- Jika keterlambatan lebih dari 1 bulan, denda dikalikan jumlah bulan yang terlambat.
- Bunga untuk siklus berikutnya tetap dihitung dari pokok SEBELUM angsuran parsial dibayar pada hari ini.
- Rincian tagihan ditampilkan transparan sebelum konfirmasi.

**CUSTOMER:**  
Customer memasukkan nominal angsuran pokok (minimal Rp50.000) lalu memilih metode pembayaran: digital atau cash.

**STAFF TOKO (jika cash):**  
Staff menerima uang tunai dan mengonfirmasi penerimaan pembayaran di sistem.

**SYSTEM:**  
Setelah terkonfirmasi, sistem:

- Mengurangi saldo pokok sesuai angsuran parsial.
- Memperbarui jatuh tempo: jatuh tempo lama \+ 30 hari.
- Membuat nomor NKB baru secara otomatis.
- Status SPK berubah kembali menjadi "Berjalan".
- Basis perhitungan bunga siklus berikutnya menggunakan pokok sebelum angsuran hari ini.

**Acceptance Criteria:**

- Denda dihitung 2% per bulan terlambat, berlaku kelipatan.
- Jatuh tempo baru \= jatuh tempo lama \+ 30 hari (bukan tanggal bayar).
- Basis bunga berikutnya \= pokok sebelum angsuran hari ini.
- Status SPK kembali "Berjalan" setelah pembayaran.

4. **Staff Toko Memproses Pembayaran via Scan SPK**

**CUSTOMER:**  
Customer datang langsung ke toko dan menyerahkan SPK atau barang gadai kepada staff untuk diproses pembayarannya.

**STAFF TOKO:**  
Staff men-scan QR Code SPK pada barang menggunakan scanner. Sistem langsung menampilkan detail lengkap pinjaman: nominal pokok, riwayat pembayaran, tanggal jatuh tempo, dan status SPK. Staff menanyakan kepada customer jenis pembayaran yang diinginkan: pelunasan atau perpanjangan.

**SYSTEM:**  
Sistem menghitung otomatis bunga dan/atau denda berdasarkan: tanggal SPK dibuat, tanggal jatuh tempo, dan tanggal pembayaran hari ini. Rincian tagihan ditampilkan kepada staff.

**STAFF TOKO:**  
Staff mengonfirmasi nominal kepada customer. Setelah customer menyerahkan uang tunai dan staff menerimanya, staff mengonfirmasi pembayaran berhasil di sistem.

**SYSTEM:**  
Setelah konfirmasi staff masuk, sistem:

- Membuat nomor NKB otomatis.
- Memperbarui status SPK (Lunas / Berjalan).
- Mencatat transaksi ke mutasi toko.

**Acceptance Criteria:**

- Scan QR Code langsung memunculkan detail SPK yang sesuai.
- Perhitungan bunga/denda otomatis dan akurat.
- Konfirmasi cash hanya bisa dilakukan oleh staff.
- NKB terbuat dan status SPK terupdate setelah konfirmasi.
