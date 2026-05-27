import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css'; // or your global styles path

// Configure the premium fonts
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-jakarta', // Expose as CSS variable
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-space', // Expose as CSS variable
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}