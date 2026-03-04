import "./globals.css";

export const metadata = {
  title: "Spinwheel",
  description: "Spinwheel + Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
