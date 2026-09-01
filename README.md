# KBS Training Request

หน้าแบบคำร้องขอฝึกอบรม/สัมมนา/ดูงาน สำหรับเผยแพร่ด้วย GitHub Pages

## พัฒนาในเครื่อง

```bash
pnpm install
pnpm dev
```

## เผยแพร่บน GitHub Pages

1. สร้าง GitHub repository และ push โปรเจกต์ขึ้น branch `main`
2. เปิด **Settings → Pages**
3. เลือก **Source: GitHub Actions**
4. Workflow จะ build และ deploy ให้อัตโนมัติทุกครั้งที่ push

ไฟล์ static ที่พร้อมเผยแพร่จะอยู่ใน `dist/client`

หมายเหตุ: เวอร์ชันนี้เป็นหน้า UI ตัวอย่าง ข้อมูลในฟอร์มยังไม่ถูกบันทึกหรือส่งไปยังระบบ HR
