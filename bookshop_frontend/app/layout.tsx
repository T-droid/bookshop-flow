import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KICD Bookshop IMS",
  description: "Inventory Management System for Kenya Institute of Curriculum Development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex w-full bg-background">
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="flex-1 p-6">
              {children}
            </main>
            <footer className="border-t bg-card px-6 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Powered by KICD IMS • © 2025 Kenya Institute of Curriculum Development
              </p>
            </footer>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}