import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-brico",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canada-pr-tracker.gabrielmolter.com";

const defaultTitle = "Canada PR Maintenance & Citizenship Eligibility Days Tracker";

const defaultDescription =
  "Calculate Canada PR and Citizenship physical presence: Trip log & IRCC-style absence rules. Free & Private: no account needed.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Canada PR & Citizenship Days Tracker",
  },
  description: defaultDescription,
  keywords: [
    "Canada PR days calculator",
    "permanent residency 730 days",
    "citizenship 1095 days",
    "physical presence calculator",
    "Canada residency tracker",
    "rolling five year window",
    "IRCC physical presence",
    "PR card maintenance",
    "Canadian citizenship application",
    "days in Canada calculator",
    "absence days Canada",
  ],
  authors: [{ name: "Gabriel Molter", url: "https://gabrielmolter.com" }],
  creator: "Gabriel Molter",
  publisher: "Gabriel Molter",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: "Canada PR & Citizenship Days Tracker",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/flag.png",
        width: 3840,
        height: 1920,
        alt: "National flag of Canada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/flag.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E%F0%9F%87%A8%F0%9F%87%A6%3C/text%3E%3C/svg%3E",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Canada PR & Citizenship Days Tracker",
  alternateName: "Canada Days Tracker",
  url: `${siteUrl}/`,
  image: `${siteUrl}/flag.png`,
  description: defaultDescription,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript. Data stored locally in the browser.",
  author: {
    "@type": "Person",
    name: "Gabriel Molter",
    url: "https://gabrielmolter.com",
  },
  inLanguage: "en-CA",
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${bricolage.variable} canvas-pattern min-h-screen antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
