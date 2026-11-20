import { Inter } from "next/font/google";
import "./globals.css";

const appleSans = Inter({
  variable: "--font-apple-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Football Insights — Live Tactical Intelligence",
  description:
    "Elite tactical intelligence, pass networks, and recruitment analytics engineered for supporters and sports analysts.",
  keywords: [
    "Football Insights",
    "Premier League Analytics",
    "Pass Network",
    "Tactical Data",
    "OBV",
    "xG",
    "Football Analysis",
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
