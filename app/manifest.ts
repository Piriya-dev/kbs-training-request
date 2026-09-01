import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KBS Order',
    short_name: 'KBS Order',
    description: 'ระบบจัดทำคำสั่งขายสำหรับ KBS Sugar',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f7f9',
    theme_color: '#0799d0',
    lang: 'th',
    icons: [{ src: '/kbs-sugar-logo.png', sizes: 'any', type: 'image/png', purpose: 'any' }],
  };
}
