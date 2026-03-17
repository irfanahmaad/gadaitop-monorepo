import Image from "next/image";
import {
  Zap,
  Percent,
  Building2,
  ShieldCheck,
  Layers,
  CalendarCheck,
  Smartphone,
  Laptop,
  Camera,
  Watch,
  Gem,
  Gamepad2,
  Cpu,
  MapPin,
  Users,
  Timer,
  Star,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/contact-form";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Zap,
    title: "Proses Cepat",
    description:
      "Proses gadai hanya 15 menit. Uang langsung cair tanpa prosedur yang rumit.",
  },
  {
    icon: Percent,
    title: "Bunga Transparan",
    description:
      "Bunga kompetitif dan terhitung otomatis. Tidak ada biaya tersembunyi.",
  },
  {
    icon: Building2,
    title: "Multi Cabang",
    description:
      "Tersedia di berbagai lokasi strategis. Gadai di cabang mana pun sesuai kebutuhan Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Data Aman",
    description:
      "Sistem digital terenkripsi. Data dan barang jaminan Anda terlindungi sepenuhnya.",
  },
  {
    icon: Layers,
    title: "Barang Beragam",
    description:
      "Menerima gadai berbagai jenis barang elektronik, perhiasan, dan barang berharga lainnya.",
  },
  {
    icon: CalendarCheck,
    title: "Pelunasan Fleksibel",
    description:
      "Lunasi kapan saja atau perpanjang pinjaman sesuai kemampuan Anda.",
  },
];

const steps = [
  {
    number: "01",
    title: "Datang ke Cabang",
    description:
      "Kunjungi cabang Gadai Top terdekat dengan membawa barang yang ingin digadaikan dan KTP.",
  },
  {
    number: "02",
    title: "Penilaian Barang",
    description:
      "Staf kami akan melakukan penilaian barang secara profesional dan transparan.",
  },
  {
    number: "03",
    title: "Uang Langsung Cair",
    description:
      "Setujui nominal pinjaman dan terima uang tunai langsung di tempat.",
  },
];

const pawnableItems: { icon: LucideIcon; name: string }[] = [
  { icon: Smartphone, name: "Smartphone & Tablet" },
  { icon: Laptop, name: "Laptop & Komputer" },
  { icon: Camera, name: "Kamera & Aksesoris" },
  { icon: Watch, name: "Jam Tangan Branded" },
  { icon: Gem, name: "Perhiasan & Logam Mulia" },
  { icon: Gamepad2, name: "Konsol Game" },
  { icon: Cpu, name: "Elektronik Lainnya" },
];

const testimonials = [
  {
    rating: 5,
    text: "Prosesnya cepat banget, tidak sampai 15 menit uang sudah cair. Stafnya juga ramah dan profesional.",
    name: "Budi S.",
    location: "Jakarta Selatan",
  },
  {
    rating: 5,
    text: "Bunga jelas dari awal, tidak ada biaya kejutan. Sudah 3x gadai di sini, selalu puas.",
    name: "Rina M.",
    location: "Depok",
  },
  {
    rating: 5,
    text: "Cabangnya banyak, dekat dari rumah saya. Sistem digitalnya bikin semua lebih mudah.",
    name: "Ahmad F.",
    location: "Jakarta Timur",
  },
];

const stats: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Building2, value: "10+", label: "Cabang di Jakarta" },
  { icon: Users, value: "10.000+", label: "Nasabah Aktif" },
  { icon: Timer, value: "< 15 Min", label: "Proses Gadai" },
  { icon: ShieldCheck, value: "100%", label: "Aman & Terpercaya" },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="beranda"
        className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-white via-white to-light"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-brand/[0.04]" />
          <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-brand/[0.04]" />
          <div className="absolute top-1/3 right-1/4 size-3 rounded-full bg-brand/20" />
          <div className="absolute bottom-1/4 left-1/3 size-2 rounded-full bg-brand/15" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.025) 1px, transparent 0)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="max-w-xl">
              <AnimateOnScroll>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-50 px-4 py-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-brand" />
                  </span>
                  <span className="text-sm font-medium text-brand">
                    Terdaftar & Diawasi
                  </span>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={100}>
                <h1 className="font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-dark sm:text-5xl lg:text-[3.5rem]">
                  Gadai Mudah,{" "}
                  <span className="text-brand">Cepat</span>, dan{" "}
                  <span className="relative inline-block">
                    Terpercaya
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full"
                      viewBox="0 0 200 8"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 6C40 2 160 2 198 6"
                        stroke="#E02020"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </AnimateOnScroll>

              <AnimateOnScroll delay={200}>
                <p className="mt-6 text-lg leading-relaxed text-dark-muted sm:text-xl">
                  Solusi pinjaman tunai terbaik dengan jaminan barang berharga
                  Anda. Proses cepat, bunga transparan, aman terdaftar dan
                  diawasi.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll delay={300}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="#kontak"
                    className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30"
                  >
                    Gadaikan Sekarang
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href="#keunggulan"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-dark/10 bg-white px-8 py-4 text-base font-semibold text-dark transition-all hover:border-brand hover:text-brand"
                  >
                    Pelajari Lebih Lanjut
                  </a>
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll
              direction="left"
              delay={200}
              className="hidden lg:flex lg:items-center lg:justify-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute size-72 rounded-full bg-brand/[0.08] blur-3xl" />
                <div className="absolute size-80 rounded-full border-2 border-dashed border-brand/15" />
                <div className="absolute size-96 rounded-full border border-brand/[0.06]" />
                <Image
                  src="/img_logo-gadai-top.png"
                  alt="Gadai Top"
                  width={280}
                  height={280}
                  className="relative z-10 drop-shadow-2xl"
                  priority
                />
                <div className="absolute -top-4 -right-6 size-14 rounded-2xl bg-brand/10 backdrop-blur-sm" />
                <div className="absolute -bottom-2 -left-4 size-10 rounded-full bg-brand/15" />
                <div className="absolute right-12 -bottom-6 size-7 rounded-lg bg-brand/20" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative overflow-hidden bg-brand py-14">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <stat.icon className="mx-auto mb-3 size-7 text-white/70" />
                  <div className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-white/60">
                    {stat.label}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEUNGGULAN ── */}
      <section id="keunggulan" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Keunggulan
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-dark sm:text-4xl">
              Mengapa Memilih{" "}
              <span className="text-brand">Gadai Top</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-dark-muted">
              Kami menawarkan layanan gadai terbaik dengan proses yang mudah dan
              transparan
            </p>
          </AnimateOnScroll>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <AnimateOnScroll key={feature.title} delay={i * 80}>
                <div className="group relative h-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/[0.06]">
                  <div className="mb-5 inline-flex rounded-xl bg-brand-light p-3 transition-colors duration-300 group-hover:bg-brand">
                    <feature.icon className="size-6 text-brand transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-dark">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-dark-muted">
                    {feature.description}
                  </p>
                  <div className="mt-6 h-1 w-12 rounded-full bg-brand/20 transition-all duration-500 group-hover:w-full group-hover:bg-brand" />
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="bg-light py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Cara Kerja
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-dark sm:text-4xl">
              Cara Gadai di{" "}
              <span className="text-brand">Gadai Top</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-dark-muted">
              Mudah, cepat, dan transparan hanya dalam 3 langkah
            </p>
          </AnimateOnScroll>

          <div className="relative mt-16">
            <div className="absolute top-16 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-transparent via-brand/20 to-transparent md:block" />

            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => (
                <AnimateOnScroll key={step.number} delay={i * 150}>
                  <div className="relative text-center">
                    <div className="relative z-10 mx-auto mb-8 flex size-32 items-center justify-center rounded-full bg-white shadow-lg shadow-brand/10 ring-4 ring-brand/10">
                      <span className="font-display text-4xl font-extrabold text-brand">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-dark">
                      {step.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-dark-muted">
                      {step.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JENIS BARANG ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Layanan
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-dark sm:text-4xl">
              Apa Saja yang Bisa{" "}
              <span className="text-brand">Digadaikan</span>?
            </h2>
          </AnimateOnScroll>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {pawnableItems.map((item, i) => (
              <AnimateOnScroll key={item.name} delay={i * 70}>
                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:border-brand/30 hover:shadow-md">
                  <div className="rounded-xl bg-brand-light p-2.5 transition-colors duration-300 group-hover:bg-brand">
                    <item.icon className="size-5 text-brand transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-semibold text-dark">
                    {item.name}
                  </span>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="bg-light py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Testimonial
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-dark sm:text-4xl">
              Apa Kata{" "}
              <span className="text-brand">Nasabah</span> Kami?
            </h2>
          </AnimateOnScroll>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={t.name} delay={i * 120}>
                <div className="relative h-full rounded-2xl bg-white p-8 shadow-sm">
                  <div className="absolute -top-3.5 left-6 flex size-7 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white">
                    &ldquo;
                  </div>

                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-dark-muted">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-light font-display text-sm font-bold text-brand">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-dark">
                        {t.name}
                      </div>
                      <div className="text-xs text-dark-muted">
                        {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="kontak" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              Kontak
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-dark sm:text-4xl">
              Hubungi <span className="text-brand">Kami</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-dark-muted">
              Ada pertanyaan? Tim kami siap membantu Anda
            </p>
          </AnimateOnScroll>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <AnimateOnScroll>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-light p-3">
                    <MapPin className="size-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">Alamat</h4>
                    <p className="mt-1 text-sm leading-relaxed text-dark-muted">
                      Jl. Alamat Kantor Pusat, Jakarta Selatan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-light p-3">
                    <Phone className="size-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">Telepon</h4>
                    <p className="mt-1 text-sm text-dark-muted">
                      (021) XXXX-XXXX
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-light p-3">
                    <Mail className="size-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">Email</h4>
                    <p className="mt-1 text-sm text-dark-muted">
                      info@gadaitop.id
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-light p-3">
                    <Clock className="size-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark">
                      Jam Operasional
                    </h4>
                    <p className="mt-1 text-sm text-dark-muted">
                      Senin - Sabtu, 08.00 - 17.00 WIB
                    </p>
                  </div>
                </div>

                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1DA851] hover:shadow-lg"
                >
                  <MessageCircle className="size-5" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={150}>
              <div className="rounded-2xl border border-gray-100 bg-light p-8 shadow-sm">
                <h3 className="mb-6 font-display text-xl font-bold text-dark">
                  Kirim Pesan
                </h3>
                <ContactForm />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
