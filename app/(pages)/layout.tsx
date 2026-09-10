import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "@/app/components/StoreProvider";
import ApolloClientProvider from "@/app/components/ApolloClientProvider";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drawith | Draw together",
  description: "A collaborative canvas for ideas in motion.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApolloClientProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ApolloClientProvider>
      </body>
    </html>
  );
};
