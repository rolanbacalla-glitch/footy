import { Inter } from "next/font/google";
import "./globals.css";

const appleSans = Inter({
  variable: "--font-apple-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Anfield Insights — Liverpool FC Tactical Intelligence",
  description:
    "Elite tactical intelligence, pass networks, and recruitment analytics engineered for Liverpool FC supporters and sports analysts.",
  keywords: [
    "Liverpool FC",
    "LFC Analytics",
    "Pass Network",
    "Anfield Insights",
    "Tactical Data",
    "OBV",
    "xG",
    "Kopites",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`dark ${appleSans.variable}`}>
      <body className="bg-[#000000] text-[#F5F5F7] antialiased selection:bg-[#FF453A]/35 selection:text-white">
        {children}
      </body>
    </html>
  );
}
