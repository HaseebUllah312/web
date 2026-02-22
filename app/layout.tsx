import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";

export const metadata: Metadata = {
  title: "VU Academic Hub – Powered by HSM Tech | All-in-One VU Student Platform",
  description: "Complete academic solution for Virtual University of Pakistan students. Access past papers, solved assignments, MCQ practice, CGPA calculator, AI assistant, and more. Powered by HSM Tech.",
  keywords: "VU, Virtual University, Pakistan, past papers, solved assignments, MCQs, CGPA calculator, VU students, HSM Tech, academic hub",
  openGraph: {
    title: "VU Academic Hub – Powered by HSM Tech",
    description: "All-in-One Academic Solution for VU Students",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <FloatingButtons />
        </ThemeProvider>
      </body>
    </html>
  );
}
