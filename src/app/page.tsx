import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ChartLineUp,
  CheckCircle,
  FileMagnifyingGlass,
  GameController,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/ssr";
import BlurText from "@/components/react-bits/BlurText";
import ScrollReveal from "@/components/react-bits/ScrollReveal";
import { MarketingNavbar } from "@/components/navigation";
import Image from "next/image";

const journey = [
  { label: "Pilih pengalaman", icon: GameController },
  { label: "Pindai, simulasikan, atau bermain peran", icon: Sparkle },
  { label: "Pahami risikonya", icon: BookOpenText },
  { label: "Bangun naluri finansial", icon: ShieldCheck },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <MarketingNavbar />

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Literasi keuangan yang interaktif</p>
          <BlurText
            text="Uji pilihanmu. Ingat pelajarannya."
            className="hero-title"
            delay={58}
          />
          <p className="hero-subtext">
            Lihat dampak keputusan finansial lewat simulasi, pemindaian dokumen,
            dan bermain peran dengan AI sebelum uangmu menjadi taruhan.
          </p>
          <div className="hero-actions">
            <Link href="/app/simulator" className="button button-primary">
              <span>Mulai Belajar</span>
              <span className="button-orb" aria-hidden="true">
                <ArrowRight size={16} weight="bold" />
              </span>
            </Link>
            <Link href="/app/simulator" className="button button-secondary">
              Jelajahi Simulator
            </Link>
          </div>
        </div>
        <div className="hero-art-shell  ">
          <div
            className="hero-art-slot"
            role="img"
            aria-label="Slot produksi ilustrasi yang menampilkan pelajar sedang menguji pilihan finansial sebelum mengambil keputusan"
          >
            <Image
              src="/hero.webp"
              alt="Ilustrasi pelajar sedang menguji pilihan finansial"
              width={600}
              height={300}
              priority
            />
          </div>
        </div>
      </section>

      <section className="gap-section" id="learn" aria-labelledby="gap-title">
        <div
          className="gap-stats"
          aria-label="Statistik inklusi dan literasi keuangan SNLIK 2024"
        >
          <div className="stat stat-primary">
            <span>75,02%</span>
            <p>inklusi keuangan</p>
          </div>
          <div className="gap-bracket" aria-hidden="true">
            <span>9,59 poin</span>
          </div>
          <div className="stat stat-secondary">
            <span>65,43%</span>
            <p>literasi keuangan</p>
          </div>
        </div>
        <ScrollReveal
          containerClassName="gap-message"
          textClassName="gap-title"
        >
          Akses berkembang lebih cepat daripada pemahaman. FinLen mengubah
          kesenjangan itu menjadi pengalaman yang bisa disentuh, diuji, dan
          diingat.
        </ScrollReveal>
        <p className="source-note" id="gap-title">
          Sumber: SNLIK 2024
        </p>
      </section>

      <section className="features-section" aria-labelledby="features-title">
        <div className="stacked-heading">
          <h2 id="features-title">Satu naluri, dilatih dengan tiga cara.</h2>
          <p>
            Mulai dari memahami konsep, merasakan dampaknya, lalu mengenalinya
            dalam kehidupan nyata.
          </p>
        </div>
        <div className="feature-field">
          <article className="feature feature-simulate">
            <div className="feature-copy">
              <span className="feature-question">Apa itu?</span>
              <ChartLineUp
                size={38}
                weight="duotone"
                aria-hidden="true"
                className="mt-3"
              />
              <h3>Simulasikan angkanya</h3>
              <p>
                Ubah utang, bunga, dan waktu. Lihat bunga majemuk mengubah
                hasilnya secara langsung.
              </p>
              <Link href="/app/simulator">
                Buka simulator <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
            <div className="feature-roleplay-media">
              <Image
                src="/feature-1.webp"
                width={600}
                height={400}
                alt="Ilustrasi simulasi roleplay menghadapi penagih utang"
                className="feature-roleplay-img"
              />
            </div>
          </article>

          <article className="feature feature-roleplay" id="roleplay">
            <div className="feature-copy">
              <span className="feature-question">Apa yang terjadi?</span>
              <GameController
                size={38}
                weight="duotone"
                aria-hidden="true"
                className="mt-3"
              />
              <h3>Berlatih menghadapi tekanan</h3>
              <p>
                Hadapi penagih utang yang mendesak dalam skenario AI yang aman
                dan pelajari pertanyaan yang dapat melindungimu.
              </p>
              <Link href="/app/roleplay">
                Mulai roleplay <ArrowRight size={16} weight="bold" />
              </Link>
            </div>

            <div className="feature-roleplay-media">
              <Image
                src="/feature-2.webp"
                width={400}
                height={400}
                alt="Ilustrasi simulasi roleplay menghadapi penagih utang"
                className="feature-roleplay-img"
              />
            </div>
          </article>

          <article className="feature feature-scan" id="scanner">
            <div className="feature-copy">
              <span className="feature-question">
                Bisakah aku mengenalinya?
              </span>
              <FileMagnifyingGlass
                size={38}
                weight="duotone"
                aria-hidden="true"
                className="mt-3"
              />
              <h3>Pindai sebelum menandatangani</h3>
              <p>
                Ubah dokumen keuangan yang rumit menjadi penjelasan sederhana
                tentang istilah yang perlu diperiksa lebih lanjut.
              </p>
            </div>
             <div className="feature-roleplay-media">
              <Image
                src="/document.png"
                width={400}
                height={400}
                alt="Ilustrasi simulasi roleplay menghadapi penagih utang"
                className="feature-roleplay-img"
              />
            </div>
          </article>
        </div>
      </section>

      <section className="journey-section" aria-labelledby="journey-title">
        <div className="journey-heading">
          <h2 id="journey-title">Rasa ingin tahu menjadi naluri.</h2>
          <p>
            Setiap jalur melatih kemampuan yang sama: berhenti sejenak agar
            mampu mengenali risiko finansial.
          </p>
        </div>
        <ol className="journey-track">
          {journey.map(({ label, icon: Icon }, index) => (
            <li
              key={label}
              className={index === journey.length - 1 ? "journey-finish" : ""}
            >
              <span className="journey-icon">
                <Icon size={26} weight="duotone" />
              </span>
              {index < journey.length - 1 ? (
                <strong className="text-white">{label}</strong>
              ) : (
                <strong className="text-foreground">{label}</strong>
              )}

              {index < journey.length - 1 ? (
                <ArrowRight size={22} weight="bold" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="credibility-section"
        aria-labelledby="credibility-title"
      >
        <div className="credibility-intro">
          <h2 id="credibility-title">
            Dibangun dari bukti nyata, bukan sekadar janji.
          </h2>
          <p>
            FinLen masih dalam tahap prapeluncuran. Kredibilitasnya berasal dari
            sumber transparan, perhitungan yang dapat diuji, dan bahasa edukatif
            yang cermat.
          </p>
        </div>
        <div className="credibility-ledger">
          <article>
            <span className="ledger-icon">
              <BookOpenText size={26} weight="duotone" />
            </span>
            <h3>Berdasarkan SNLIK 2024</h3>
            <p>
              Kesenjangan literasi dan inklusi yang ditampilkan berasal langsung
              dari survei nasional yang dikutip dalam ringkasan produk.
            </p>
          </article>
          <article>
            <span className="ledger-icon">
              <ChartLineUp size={26} weight="duotone" />
            </span>
            <h3>Perhitungan yang bisa diperiksa</h3>
            <p>
              Simulator menggunakan rumus bunga majemuk standar dan menampilkan
              setiap variabel yang memengaruhi hasil.
            </p>
          </article>
          <article>
            <span className="ledger-icon">
              <CheckCircle size={26} weight="duotone" />
            </span>
            <h3>Umpan balik tanpa menghakimi</h3>
            <p>
              Bahasa pada pemindai dan bermain peran menjelaskan potensi risiko
              tanpa berpura-pura memberikan penilaian hukum atau finansial.
            </p>
          </article>
        </div>
      </section>

      <section className="trust-section" aria-labelledby="trust-title">
        <div className="trust-symbol" aria-hidden="true">
          <ShieldCheck size={88} weight="duotone" />
        </div>
        <div className="trust-copy">
          <h2 id="trust-title">Ruang berlatih, bukan penasihat.</h2>
          <p>
            FinLen membantumu menjelajahi kemungkinan dan mengenali sinyal
            risiko. FinLen tidak memberikan nasihat keuangan, hukum, atau
            investasi.
          </p>
          <div className="trust-principles">
            <span>Potensi tanda bahaya, bukan tuduhan pasti</span>
            <span>Hasil edukasi, bukan rekomendasi pribadi</span>
          </div>
        </div>
      </section>

      <footer className="marketing-footer">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark">
              {" "}
              <Image
                src="/logo-finlen.svg"
                alt=""
                width={26}
                height={26}
              />{" "}
            </span>
            <span>FinLen</span>
          </Link>
          <p>Pelajari keuangan dengan mencoba keputusannya lebih dulu.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Jelajahi</strong>
            <a href="#learn">Belajar</a>
            <Link href="/app/simulator">Simulator</Link>
          </div>
          <div>
            <strong>Pengalaman</strong>
            <a href="#roleplay">Bermain Peran</a>
            <a href="#scanner">Pemindai</a>
          </div>
          <div>
            <strong>Produk</strong>
            <a href="#credibility-title">Sumber</a>
            <a href="#trust-title">Keamanan edukasi</a>
          </div>
        </div>
        <p className="footer-safety">
          Hanya untuk simulasi edukatif. Bukan nasihat keuangan, hukum, atau
          investasi.
        </p>
      </footer>
    </main>
  );
}
