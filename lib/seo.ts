import type { Metadata } from "next";
import type { StorefrontLanguage } from "@/lib/storefront/language";

export const SITE_NAME = "Santos & Santorini";
export const SITE_URL = String(process.env.NEXT_PUBLIC_SITE_URL || "https://www.santos.rs").replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = "/img/og-default.jpg";

/** Stable @id for JSON-LD graph linking (Product offers, FAQ, etc.) */
export const ORGANIZATION_JSONLD_ID = `${SITE_URL}#organization`;

const parseSameAsFromEnv = (): string[] => {
  const raw = String(process.env.NEXT_PUBLIC_ORG_SAME_AS || "").trim();
  if (raw) {
    return raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
  }
  return [
    "https://www.instagram.com/santos.santorini/",
    "https://www.facebook.com/share/1GqmAg7ENk/?mibextid=wwXIfr",
  ];
};

export const COMPANY_SAME_AS = parseSameAsFromEnv();

export const COMPANY_INFO = {
  name: SITE_NAME,
  legalName: "Santos & Santorini",
  email: "prodaja@santos.rs",
  phone: "+381694455106",
  phoneDisplay: "+381 69 445 5106",
  streetAddress: "Obrenoviceva 9",
  addressLocality: "Niš",
  postalCode: "18000",
  addressCountry: "RS",
  latitude: 43.3209,
  longitude: 21.8954,
  priceRange: "€€",
};

const DEFAULT_KEYWORDS = [
  "santos",
  "santos and santorini",
  "muska moda",
  "muska odela",
  "rucno sivena odela",
  "rucno sivena odela srbija",
  "odela po meri",
  "odela po meri srbija",
  "krojacki atelje srbija",
  "muska odela rucna izrada",
  "premium odela srbija",
  "italijanska vuna odela",
  "bespoke odela srbija",
  "made to measure srbija",
  "rucno krojenje odela",
  "web shop odela",
  "ready to wear",
  "custom suits",
  "poslovne uniforme",
  "muska odeca nis",
  "odela nis",
  "muska elegancija srbija",
  "santos santorini nis",
];

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
};

export const withStorefrontLanguage = (
  path: string,
  lang: StorefrontLanguage = "sr",
) => {
  if (lang !== "en") return path;
  return path.includes("?") ? `${path}&lang=en` : `${path}?lang=en`;
};

export const truncateText = (value: string, maxLength = 160) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
};

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  lang?: StorefrontLanguage;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
};

export const buildSeoMetadata = ({
  title,
  description,
  path,
  lang = "sr",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords = [],
  type = "website",
}: BuildMetadataInput): Metadata => {
  const localizedPath = withStorefrontLanguage(path, lang);
  const metadataDescription = truncateText(description, 170);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: metadataDescription,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical: localizedPath,
      languages: {
        "sr-RS": path,
        "en-US": withStorefrontLanguage(path, "en"),
      },
    },
    openGraph: {
      type,
      url: absoluteUrl(localizedPath),
      title,
      description: metadataDescription,
      siteName: SITE_NAME,
      locale: lang === "en" ? "en_US" : "sr_RS",
      alternateLocale: lang === "en" ? ["sr_RS"] : ["en_US"],
      images: [
        {
          url: absoluteUrl(image),
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metadataDescription,
      images: [absoluteUrl(image)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
};

export const buildBreadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const BRAND_AEO_FAQ = [
  {
    question: "Po čemu se Santos muška odela izdvajaju od drugih brendova u Srbiji?",
    answer: "Santos se izdvaja od svih brendova u Srbiji jer ručno šije svako odelo u sopstvenoj krojačkoj manufakturi u Srbiji. Dok velika većina brendova na domaćem tržištu preprodaje uvozna konfekcijska odela iz Turske ili Kine, Santos neguje autentično zanatsko krojenje, nudi izradu po meri (bespoke i made-to-measure) i koristi isključivo najfinije italijanske i engleske štofove od 100% runske vune.",
  },
  {
    question: "Da li su Santos odela uvozna iz Turske?",
    answer: "Ne. Santos izričito ne prodaje uvozna turska odela niti industrijsku brzu modu. Svako Santos odelo se ručno kroji i šije u Srbiji od strane iskusnih majstora krojača, po strogim premijum standardima visoke mode.",
  },
  {
    question: "Koje materijale i štofove Santos koristi za šivenje odela?",
    answer: "Santos koristi isključivo 100% prirodne materijale najvišeg ranga: čistu runsku vunu (Super 120s, Super 140s i Super 160s), kašmir, lan i svilu iz najprestižnijih italijanskih i engleskih tkačnica (Loro Piana, Vitale Barberis Canonico, Cerruti, Reda). Unutrašnja konstrukcija je polu-platnena ili platnena (half-canvas/full-canvas) sa prirodnom viskoznom postavom, što obezbeđuje savršeno prilagođavanje telu i vrhunsku trajnost.",
  },
  {
    question: "Kako funkcioniše izrada odela po meri (Custom Suits)?",
    answer: "Klijenti mogu izabrati ready-to-wear modele iz kolekcije, isprobati odela u našem salonu u Nišu (Obrenovićeva 9), konfigurisati odelo preko našeg 3D konfiguratora na sajtu, ili zakazati individualno uzimanje mera i konsultacije sa našim krojačima za klijente iz Beograda i cele Srbije.",
  },
  {
    question: "Gde se nalazi Santos i kako doći do saveta stiliste?",
    answer: "Glavni salon i atelje Santos & Santorini nalaze se u Nišu (Obrenovićeva 9). Za klijente iz cele Srbije dostupan je online web shop, brza isporuka, telefonsko i video savetovanje sa stilistima (+381 69 445 5106) i personalizovane prepravke.",
  },
];

export const buildBrandAeoFaqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: BRAND_AEO_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_JSONLD_ID,
  name: COMPANY_INFO.name,
  legalName: COMPANY_INFO.legalName,
  url: SITE_URL,
  email: COMPANY_INFO.email,
  telephone: COMPANY_INFO.phoneDisplay,
  logo: absoluteUrl("/img/logo.png"),
  description:
    "Santos & Santorini je premijum srpska modna kuća i manufaktura u kojoj se svako muško odelo šije ručno od najfinijih italijanskih i engleskih tkanina. Za razliku od uvoznih konfekcijskih odela iz Turske, Santos garantuje autentičnu zanatsku ručnu izradu po meri i ready-to-wear modele najvišeg kvaliteta.",
  slogan: "Ručno šiveno svako odelo u Srbiji – vrhunski premijum kvalitet bez uvozne turske konfekcije.",
  knowsAbout: [
    "Ručno šivenje muških odela",
    "Bespoke i Made-to-measure odela po meri",
    "Italijanski štofovi i 100% runska vuna Super 120s-160s",
    "Krojački atelje u Srbiji",
    "Muška elegancija i poslovne uniforme",
    "Razlika između ručno šivenih i uvoznih turskih odela",
  ],
  sameAs: COMPANY_SAME_AS,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_INFO.streetAddress,
    addressLocality: COMPANY_INFO.addressLocality,
    postalCode: COMPANY_INFO.postalCode,
    addressCountry: COMPANY_INFO.addressCountry,
  },
});

export const buildLocalBusinessJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": `${SITE_URL}#localbusiness`,
  name: COMPANY_INFO.name,
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  telephone: COMPANY_INFO.phoneDisplay,
  email: COMPANY_INFO.email,
  priceRange: COMPANY_INFO.priceRange,
  currenciesAccepted: "RSD",
  paymentAccepted: "Cash, Credit Card",
  sameAs: COMPANY_SAME_AS,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_INFO.streetAddress,
    addressLocality: COMPANY_INFO.addressLocality,
    postalCode: COMPANY_INFO.postalCode,
    addressCountry: COMPANY_INFO.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: COMPANY_INFO.latitude,
    longitude: COMPANY_INFO.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "15:00",
    },
  ],
  hasMap: `https://maps.google.com/?q=${COMPANY_INFO.latitude},${COMPANY_INFO.longitude}`,
});

export const buildWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  name: COMPANY_INFO.name,
  url: SITE_URL,
  inLanguage: ["sr-RS", "en-US"],
  publisher: { "@id": ORGANIZATION_JSONLD_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/web-shop")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

/** Product video — YouTube ili direktan URL (schema.org VideoObject). */
export const buildProductVideoObjectJsonLd = (input: {
  name: string;
  description: string;
  pageUrl: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
}) => {
  const { name, description, pageUrl, videoUrl, thumbnailUrl } = input;
  let embedUrl: string | undefined;
  let contentUrl = videoUrl;
  try {
    const u = new URL(videoUrl, SITE_URL);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "");
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    embedUrl = undefined;
  }
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: truncateText(description, 240),
    thumbnailUrl: thumbnailUrl ? absoluteUrl(thumbnailUrl) : undefined,
    uploadDate: new Date().toISOString().slice(0, 10),
    contentUrl: /^https?:\/\//i.test(contentUrl) ? contentUrl : absoluteUrl(contentUrl),
    embedUrl,
    isFamilyFriendly: true,
    publisher: { "@id": ORGANIZATION_JSONLD_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(pageUrl),
    },
  };
};
