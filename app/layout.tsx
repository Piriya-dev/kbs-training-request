import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'แบบคำร้องขอฝึกอบรม | KBS Sugar',
  description: 'แบบคำร้องขอฝึกอบรม สัมมนา และดูงาน สำหรับพนักงาน KBS Sugar',
  themeColor: '#087ab9',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
