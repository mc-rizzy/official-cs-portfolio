import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import ScrollProvider from '@/scrollProvider';
import './globals.css';

// Configure the premium fonts
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Caleb Liu',
    template: '%s | Caleb Liu', // %s will be replaced by the page title
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body>
        <ScrollProvider>
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}