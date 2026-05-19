import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ThemeInitScript } from "./components/theme-init-script";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "WedStudio OS",
  description: "Studio ledger for wedding film teams — clients, payroll, gear, and rentals.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className={sans.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
