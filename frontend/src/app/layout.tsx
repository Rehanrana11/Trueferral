import "./globals.css";
export const metadata = { title: "IntroFlow - Trust Engine", description: "Trust Engine v1" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}