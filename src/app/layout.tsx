import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

export const metadata: Metadata = {
  title: 'میت پلاس — Meat Plus',
  description:
    'میت پلاس — عرضه محصولات پروتئینی خام و فرآوری شده آماده طبخ؛ گوشت گرم و کشتار روز.',
};

const IranSans = localFont({
  preload: true,
  display: 'swap',
  src: [
    {
      path: '..//../public/fonts/IranSans_Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '..//../public/fonts/IranSans.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '..//../public/fonts/IranSans_Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '..//../public/fonts/IranSans_Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
});

const Khodkar = localFont({
  src: '..//../public/fonts/Khodkar.ttf',
  weight: '500',
  style: 'normal',
  variable: '--font-khodkar',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='fa'
      dir='rtl'>
      <body className={`${IranSans.variable} ${Khodkar.variable}`}>
        {children}
      </body>
    </html>
  );
}
