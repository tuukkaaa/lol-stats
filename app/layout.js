import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});
export const metadata = {
  title: "LoL Stats Tracker",
  description: "Track your League of Legends performance and statistics"
};
export default function RootLayout({
  children
}) {
  return <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>;
}