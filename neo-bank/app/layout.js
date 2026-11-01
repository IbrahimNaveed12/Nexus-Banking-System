import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "NEXUS · Neo-Banking Platform",
  description:
    "A cutting-edge 3D spatial banking interface with immersive wealth visualization, biometric security, and real-time transaction orchestration.",
  keywords: ["neo-banking", "3D banking", "spatial finance", "wealth sphere"],
};

export const viewport = {
  themeColor: "#0B0F19",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#0B0F19] text-[#E8ECF4] overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
