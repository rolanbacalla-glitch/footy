import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  themeColor: "#141518",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en-GB"
      className={`dark ${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#141518] text-[#F2F3F5] antialiased selection:bg-[#D2F865]/30 selection:text-[#D2F865]">
        {children}
      </body>
    </html>
  );
}
