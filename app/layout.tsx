import type { Metadata } from "next";
import { Nunito, Bitter } from "next/font/google";
import { BarbriLogo } from "@/components/logo";
import "./globals.css";

// BARBRI's typefaces, extracted by designlang: Nunito (body/UI) and Bitter
// (serif accent). Bound to the same CSS variables globals.css references.
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Copyright Practice Engine",
  description:
    "Apply copyright doctrine (fair use balancing and the prima facie element test) to fact patterns you have never seen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${bitter.variable}`}>
      <body className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <BarbriLogo className="h-7 w-auto text-primary" />
              <span className="hidden border-l pl-3 text-sm text-muted-foreground sm:inline">
                Copyright Practice Engine
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Title 17 · U.S. Copyright
            </span>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
