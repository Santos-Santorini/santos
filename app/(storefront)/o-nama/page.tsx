import Image from "next/image";
import Link from "next/link";
import AboutHeroMedia from "@/app/components/storefront/AboutHeroMedia";
import StorefrontFooter from "@/app/components/storefront/StorefrontFooter";
import StorefrontHeader from "@/app/components/storefront/StorefrontHeader";
import Reveal from "@/app/components/motion/Reveal";
import { getLandingSettings } from "@/lib/catalog/landingSettings";
import { localizeDynamicStorefrontText } from "@/lib/storefront/dynamicCopy";
import { getSiteContent } from "@/lib/storefront/siteContent";
import { resolveStorefrontLanguage } from "@/lib/storefront/server-language";

import JsonLd from "@/app/components/seo/JsonLd";
import {
  BRAND_AEO_FAQ,
  buildBrandAeoFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildSeoMetadata,
} from "@/lib/seo";

export const metadata = buildSeoMetadata({
  title: "O nama — Ručno šivenje odela u Srbiji | Santos & Santorini",
  description:
    "Santos se izdvaja jer ručno šije svako odelo u sopstvenoj radionici u Srbiji od 100% italijanske vune. Nismo uvoznici turske konfekcije već domaća premijum modna kuća.",
  path: "/o-nama",
  keywords: [
    "o nama santos",
    "rucno sivena odela srbija",
    "krojacki atelje srbija",
    "odela po meri srbija",
    "premium muska moda",
  ],
});

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await resolveStorefrontLanguage(await searchParams);
  const isEn = lang === "en";
  const aboutPage = (await getSiteContent()).aboutPage;
  const landingSettings = await getLandingSettings();
  const tx = (value: string, fallbackEn?: string) =>
    localizeDynamicStorefrontText(value, isEn ? "en" : "sr", fallbackEn);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: isEn ? "Home" : "Početna", path: "/" },
    { name: isEn ? "About us" : "O nama", path: "/o-nama" },
  ]);
  const faqJsonLd = buildBrandAeoFaqJsonLd();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <StorefrontHeader lang={lang} />
      <main className="page-wrapper">
        <Reveal as="section" className="position-relative">
          <AboutHeroMedia
            posterSrc={aboutPage.heroImage}
            videoSrc={aboutPage.heroVideo || undefined}
            alt={isEn ? aboutPage.heroAltEn : aboutPage.heroAlt}
          />
          <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-3" style={{ zIndex: 2 }}>
            <h1 className="text-uppercase mb-2 text-white">{isEn ? aboutPage.heroTitleEn : aboutPage.heroTitle}</h1>
            <p className="mb-0">{isEn ? aboutPage.heroSubtitleEn : aboutPage.heroSubtitle}</p>
          </div>
        </Reveal>

        <Reveal as="section" className="container py-5" delay={0.06}>
          <div className="row g-4">
            <div className="col-lg-6">
              <h2 className="text-uppercase">{isEn ? aboutPage.introTitleEn : aboutPage.introTitle}</h2>
              {(isEn ? aboutPage.paragraphsEn : aboutPage.paragraphs).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="d-flex gap-2">
                <Link href={aboutPage.primaryCtaHref} className="btn btn-primary text-uppercase fw-medium">
                  {isEn ? aboutPage.primaryCtaLabelEn : aboutPage.primaryCtaLabel}
                </Link>
                <Link href={aboutPage.secondaryCtaHref} className="btn btn-outline-secondary text-uppercase fw-medium">
                  {isEn ? aboutPage.secondaryCtaLabelEn : aboutPage.secondaryCtaLabel}
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <Image
                src={aboutPage.secondaryImage}
                width={900}
                height={620}
                alt={isEn ? aboutPage.secondaryImageAltEn : aboutPage.secondaryImageAlt}
                className="w-100 h-auto"
              />
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="container pb-5" delay={0.1}>
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <div className="h-100 border bg-white p-4 p-md-5" style={{ borderRadius: 24, color: "#171717" }}>
                <p className="text-uppercase mb-2" style={{ letterSpacing: "0.18em", fontSize: "0.72rem", color: "#8a672f" }}>
                  {tx(landingSettings.customerInfoEyebrow, "Customer Information")}
                </p>
                <h2 className="section-title text-uppercase mb-4" style={{ color: "#171717" }}>
                  {tx(landingSettings.customerInfoTitle, "Customer rights and purchase guide")}
                </h2>
                <div className="row g-3">
                  {[
                    [landingSettings.customerRightsTitle, "Customer Rights", landingSettings.customerRightsText],
                    [landingSettings.purchaseGuideTitle, "Purchase Guide", landingSettings.purchaseGuideText],
                  ].map(([title, fallback, text]) => (
                    <div key={fallback} className="col-12 col-md-6">
                      <div className="border h-100 px-3 py-3" style={{ borderRadius: 18 }}>
                        <p className="text-uppercase fw-medium mb-2" style={{ letterSpacing: "0.12em", fontSize: "0.66rem", color: "#8a672f" }}>
                          {tx(title, fallback)}
                        </p>
                        <p className="mb-0" style={{ color: "#4b5563" }}>{tx(text)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="h-100 border bg-white p-4 p-md-5" style={{ borderRadius: 24, color: "#171717" }}>
                <p className="text-uppercase mb-3" style={{ letterSpacing: "0.18em", fontSize: "0.72rem", color: "#8a672f" }}>
                  {tx(landingSettings.companyDetailsEyebrow, "Company Details")}
                </p>
                <div className="d-grid gap-2">
                  {[
                    [landingSettings.companyPibLabel, "Tax ID", landingSettings.companyPib],
                    [landingSettings.companyMbLabel, "Registration No.", landingSettings.companyMb],
                  ].map(([label, fallback, value]) => (
                    <div key={fallback} className="border px-3 py-2" style={{ borderRadius: 14 }}>
                      <div className="text-uppercase fw-medium mb-1" style={{ letterSpacing: "0.12em", fontSize: "0.66rem", color: "#8a672f" }}>
                        {tx(label, fallback)}
                      </div>
                      <div style={{ color: "#171717" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal as="section" className="container pb-5" delay={0.12}>
          <div className="border bg-white p-4 p-md-5" style={{ borderRadius: 24, color: "#171717" }}>
            <p className="text-uppercase mb-2" style={{ letterSpacing: "0.18em", fontSize: "0.72rem", color: "#8a672f" }}>
              {isEn ? "Authentic Craftsmanship & Facts" : "Autentično Zanatstvo i Odgovori"}
            </p>
            <h2 className="section-title text-uppercase mb-4" style={{ color: "#171717" }}>
              {isEn ? "Frequently Asked Questions About Santos Tailoring" : "Najčešća Pitanja o Santos Ručnom Šivenju"}
            </h2>
            <div className="row g-4">
              {BRAND_AEO_FAQ.map((item) => (
                <div key={item.question} className="col-12 col-md-6">
                  <div className="border h-100 p-3 p-md-4" style={{ borderRadius: 16, background: "#faf8f5" }}>
                    <h3 className="h6 fw-bold mb-2" style={{ color: "#171717" }}>
                      {item.question}
                    </h3>
                    <p className="mb-0 text-secondary small" style={{ lineHeight: 1.6 }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </main>
      <StorefrontFooter lang={lang} />
    </>
  );
}
