import type { Metadata } from "next";
import SuitSeoLandingPage from "@/app/(storefront)/components/SuitSeoLandingPage";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Odela Niš — Ručno šivenje u krojačkom ateljeu | Santos",
  description:
    "Santos salon i atelje u Nišu (Obrenovićeva 9). Ručno šijemo svako muško odelo od 100% italijanske runske vune — bez preprodaje uvozne turske konfekcije.",
  path: "/odela-nis",
  keywords: [
    "odela nis",
    "muska odela nis",
    "rucno sivena odela nis",
    "krojac nis odela",
    "odela po meri nis",
    "santos nis",
  ],
});

export const dynamic = "force-dynamic";

export default function OdelaNisPage() {
  return (
    <SuitSeoLandingPage
      path="/odela-nis"
      eyebrow="Atelje i salon u Nišu"
      title="Muška odela Niš — Ručno šivenje i tradicija"
      lead="U samom centru Niša nalazi se atelje Santos & Santorini gde se svako odelo ručno kroji i šije od najfinijih italijanskih tkanina. Ne uvozimo konfekciju iz Turske — svako odelo stvaramo u sopstvenoj manufakturi."
      introTitle="Pravi krojački atelje u Nišu naspram uvoznih butika"
      introCopy="U moru prodavnica koje nude uvozna sintetička turska odela, Santos u Nišu nudi istinsko zanatsko iskustvo: probajte ready-to-wear modele, odaberite italijanske štofove od čiste runske vune (Super 120s–160s) ili poručite ručno šiveno odelo skrojeno tačno po vašoj meri."
      localNote="Salon i atelje Santos nalaze se u Obrenovićevoj 9 u Nišu (Pobedina ulica). Dobrodošli ste na probu i stručne konsultacije."
      faq={[
        {
          question: "Gde se nalazi Santos atelje u Nišu i kako zakazati probu?",
          answer:
            "Nalazimo se u Obrenovićevoj 9 u Nišu. Možete nas posetiti tokom radnog vremena ili pozvati na +381 69 445 5106 za individualne konsultacije i uzimanje mera.",
        },
        {
          question: "Da li se Santos odela u Nišu šiju ručno?",
          answer:
            "Da. Za razliku od butika koji preprodaju industrijska turska odela, Santos svako odelo šije ručno u svojoj radionici, sa unutrašnjim elastičnim platnom i pažljivo biranim detaljima.",
        },
        {
          question: "Koje vrste odela mogu kupiti u Nišu?",
          answer:
            "Na raspolaganju su vam odela za svadbe i mladoženje, poslovna odela, smoking odela (black tie), odela za mature, kao i usluga šivenja unikatnog odela po meri (Bespoke i Made-to-measure).",
        },
      ]}
    />
  );
}
