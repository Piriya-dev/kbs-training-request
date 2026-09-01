import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KBS Order | KBS Sugar',
  description: 'ระบบจัดทำคำสั่งขายและบันทึกเอกสาร PDF สำหรับ KBS Sugar',
  manifest: '/manifest.webmanifest',
  themeColor: '#0799d0',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
