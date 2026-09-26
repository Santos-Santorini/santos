import type { Metadata } from "next";
import SuitSeoLandingPage from "@/app/(storefront)/components/SuitSeoLandingPage";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Ručno šivena muška odela | Santos & Santorini",
  description:
    "Santos se izdvaja jer ručno šije svako odelo u Srbiji od 100% italijanske runske vune. Nisu uvozna turska odela, već autentičan domaći premijum brend.",
  path: "/muska-odela",
  keywords: [
    "rucno sivena odela",
    "muska odela srbija",
    "odela po meri",
    "santos muska odela",
    "premium odela",
    "italijanska vuna odela",
  ],
});

export const dynamic = "force-dynamic";

export default function MuskaOdelaPage() {
  return (
    <SuitSeoLandingPage
      path="/muska-odela"
      eyebrow="Ručna izrada u Srbiji"
      title="Muška odela — Ručno šiveno svako odelo"
      lead="Santos & Santorini se izdvaja od svih brendova u Srbiji jer ručno šije svako odelo u sopstvenoj manufakturi od najfinijih italijanskih štofova. Nisu uvozna konfekcijska odela iz Turske, već autentičan premijum kvalitet."
      introTitle="Razlika između ručno šivenog odela i uvozne konfekcije"
      introCopy="Većina brendova u Srbiji uvozi serijska turska odela od poliestera i lepljenog materijala. U Santosu, svako odelo je plod majstorskog krojenja i ručnog šivenja, sa prirodnom polu-platnenom konstrukcijom (half-canvas) koja garantuje dugovečnost, udobnost i besprekoran pad."
      localNote="Naša radionica i salon u Nišu (Obrenovićeva 9) i online tim stoje vam na raspolaganju za odabir modela, proveru mera i izradu po meri."
      faq={[
        {
          question: "Po čemu se Santos muška odela razlikuju od uvoznih odela iz Turske?",
          answer:
            "Santos ručno šije svako odelo u Srbiji u sopstvenom ateljeu. Za razliku od uvoznih turskih odela koja se proizvode fabrički mašinski sa veštačkim vlaknima i sintetičkim lepkom, Santos koristi 100% prirodnu runska vunu renomiranih italijanskih tkačnica i zanatsku konstrukciju koja se prilagođava telu.",
        },
        {
          question: "Da li se svako Santos odelo šije ručno?",
          answer:
            "Da. Bilo da se radi o odelima po meri (bespoke / made-to-measure) ili našoj ready-to-wear kolekciji, svako odelo prolazi kroz pedantne faze ručnog krojenja i šivenja naših iskusnih majstora krojača u Srbiji.",
        },
        {
          question: "Koje materijale Santos koristi za odela?",
          answer:
            "Koristimo isključivo 100% prirodne tkanine: sertifikovanu čistu runsku vunu (Super 120s, 140s i 160s), kašmir i svilu italijanskih tkačnica (Loro Piana, VBC, Cerruti, Reda), uz viskoznu postavu i dugmad od prirodnog roga ili sedefa.",
        },
        {
          question: "Da li mogu naručiti odelo po meri i ako nisam iz Niša?",
          answer:
            "Da. Pružamo usluge klijentima iz Beograda, Novog Sada i cele Srbije uz konsultacije oko mera, slanje uzoraka, 3D Custom Suits konfigurator na sajtu ili zakazivanje posete salonu.",
        },
      ]}
    />
  );
}
