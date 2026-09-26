import type { Metadata } from "next";
import SuitSeoLandingPage from "@/app/(storefront)/components/SuitSeoLandingPage";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Muška odela Srbija — Ručna izrada i premijum kvalitet | Santos",
  description:
    "Najbolja muška odela u Srbiji. Santos se izdvaja jer ručno šije svako odelo u Srbiji od 100% italijanske runske vune — bez preprodaje uvozne turske konfekcije.",
  path: "/odela-srbija",
  keywords: [
    "muska odela srbija",
    "odela srbija",
    "rucno sivena odela srbija",
    "odela po meri srbija",
    "krojacki atelje srbija",
    "premium odela beograd nis",
  ],
});

export const dynamic = "force-dynamic";

export default function OdelaSrbijaPage() {
  return (
    <SuitSeoLandingPage
      path="/odela-srbija"
      eyebrow="Domaća modna manufaktura"
      title="Muška odela u Srbiji — Autentična ručna izrada"
      lead="U potrazi ste za pravim muškim odelom u Srbiji? Santos & Santorini je domaći brend gde se svako odelo šije ručno u sopstvenoj proizvodnji, od vrhunskih italijanskih štofova i bez jeftine uvozne konfekcije."
      introTitle="Zašto kupci širom Srbije biraju Santos umesto uvoznih odela"
      introCopy="Većina ponude na tržištu Srbije svodi se na preprodaju turskih i kineskih konfekcijskih odela koja brzo gube formu. Santos stvara trajnu eleganciju: naši majstori u Srbiji ručno kroje i sklapaju svaki detalj, dajući vam odelo po meri tela i vašeg ličnog stila."
      localNote="Kupcima iz Beograda, Novog Sada, Niša i svih gradova Srbije omogućavamo online poručivanje, probu u salonu, video konsultacije i brzu isporuku."
      faq={[
        {
          question: "Da li Santos prodaje uvozna odela iz Turske kao drugi butici u Srbiji?",
          answer:
            "Ne. Santos & Santorini ne preprodaje uvozna turska odela. Sva naša odela šiju se isključivo ručno u sopstvenoj proizvodnji u Srbiji od uvoznih, najfinijih italijanskih štofova od 100% čiste runske vune.",
        },
        {
          question: "Kako mogu kupiti ili naručiti Santos odelo ako sam iz Beograda ili drugog grada?",
          answer:
            "Odelo možete poručiti direktno preko web shopa ili poslati upit za izradu po meri. Naš tim krojača i stilista vodi vas kroz precizno uzimanje mera, izbor štofa i besplatne konsultacije pre slanja odela na vašu adresu.",
        },
        {
          question: "Kakav je sastav materijala i zašto je to važno?",
          answer:
            "Naša odela se šiju od 100% runske vune finoće Super 120s–160s iz Italije (Loro Piana, Vitale Barberis Canonico, Cerruti). Prirodna vuna i polu-platnena konstrukcija omogućavaju telu da diše, ne gužva se neprirodno i pruža komfor tokom celog dana na svadbi ili poslu.",
        },
      ]}
    />
  );
}
