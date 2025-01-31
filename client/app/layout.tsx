import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Agent Battles",
  description: "A Web3 application using OnchainKit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
