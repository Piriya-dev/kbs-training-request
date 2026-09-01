# ขั้นตอน Deploy KBS Training Request ไปยัง GitHub Pages

เอกสารนี้อธิบายขั้นตอนนำโปรเจกต์ `kbs-training-request` ขึ้น GitHub Pages ตั้งแต่เริ่มต้นจนเว็บไซต์ออนไลน์

## ข้อมูลเว็บไซต์

- GitHub username: `Piriya-dev`
- Repository: `kbs-training-request`
- Branch หลัก: `main`
- เว็บไซต์: <https://piriya-dev.github.io/kbs-training-request/>
- Workflow: `.github/workflows/deploy-pages.yml`

## 1. เปิด Terminal และเข้าโฟลเดอร์โปรเจกต์

```bash
cd "/Users/piriya/Desktop/9 Expert Course/Cafe near me/kbs-training-request"
```

ตรวจสอบสถานะ Git:

```bash
git status
```

## 2. บันทึกไฟล์ลง Git

เพิ่มไฟล์ทั้งหมดเข้า staging:

```bash
git add .
```

สร้าง commit:

```bash
git commit -m "Create KBS training request form"
```

## 3. สร้าง Repository บน GitHub

1. เปิด <https://github.com/new>
2. ตั้งชื่อ Repository เป็น `kbs-training-request`
3. เลือก `Public`
4. ไม่ต้องเลือกสร้าง README, `.gitignore` หรือ License เพิ่ม
5. กด **Create repository**

## 4. เชื่อม Local Repository กับ GitHub

เพิ่ม GitHub remote:

```bash
git remote add origin https://github.com/Piriya-dev/kbs-training-request.git
```

กำหนด branch หลักเป็น `main`:

```bash
git branch -M main
```

Push โปรเจกต์ขึ้น GitHub:

```bash
git push -u origin main
```

ตรวจสอบ remote:

```bash
git remote -v
```

### ทางเลือก: ใช้ GitHub CLI

หากติดตั้งและเข้าสู่ระบบ GitHub CLI แล้ว สามารถสร้าง Repository และ Push ได้ด้วยคำสั่ง:

```bash
gh repo create kbs-training-request \
  --public \
  --source=. \
  --remote=origin \
  --push
```

## 5. เปิดใช้งาน GitHub Pages

1. เปิด Repository `Piriya-dev/kbs-training-request` บน GitHub
2. เลือกแท็บ **Settings**
3. เลือก **Pages** ในเมนูด้านซ้าย
4. ไปที่หัวข้อ **Build and deployment**
5. ตั้งค่า **Source** เป็น `GitHub Actions`

ไม่ต้องเลือก branch หรือโฟลเดอร์สำหรับ deploy เพราะโปรเจกต์ใช้ GitHub Actions workflow

เอกสารอ้างอิง: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## 6. GitHub Actions Workflow

โปรเจกต์มี workflow อยู่ที่:

```text
.github/workflows/deploy-pages.yml
```

Workflow จะทำงานอัตโนมัติเมื่อมีการ Push ไปยัง branch `main` โดยจะ:

1. Checkout source code
2. ติดตั้ง Node.js และ pnpm
3. ติดตั้ง dependencies
4. Build เว็บไซต์เป็น static files
5. จัดตำแหน่ง CSS และ JavaScript ให้ตรงกับ project path ของ GitHub Pages
6. Upload ไฟล์จาก `dist/client`
7. Deploy artifact ไปยัง GitHub Pages

## 7. ตรวจสอบสถานะการ Deploy

1. เปิดแท็บ **Actions** ภายใน Repository
2. เลือก workflow **Deploy to GitHub Pages**
3. รอจน workflow แสดงเครื่องหมายถูกสีเขียว

ความหมายของสถานะ:

- เครื่องหมายถูกสีเขียว: Deploy สำเร็จ
- เครื่องหมายกากบาทสีแดง: Build หรือ Deploy ล้มเหลว
- วงกลมสีเหลือง/ส้ม: Workflow กำลังทำงาน

หากรายการล่าสุดสำเร็จ รายการเก่าที่ล้มเหลวจะไม่กระทบกับเว็บไซต์ปัจจุบัน

## 8. เปิดเว็บไซต์

หลัง Deploy สำเร็จ ให้เปิด:

<https://piriya-dev.github.io/kbs-training-request/>

หน้าที่ถูกต้องควรแสดงหัวข้อ:

```text
แบบคำร้องขอฝึกอบรม/สัมมนา/ดูงาน
```

## 9. Deploy การแก้ไขครั้งต่อไป

หลังแก้ไขเว็บไซต์ ให้ใช้คำสั่ง:

```bash
cd "/Users/piriya/Desktop/9 Expert Course/Cafe near me/kbs-training-request"
git add .
git commit -m "Update training request form"
git push
```

GitHub Actions จะ Build และ Deploy เวอร์ชันใหม่ให้อัตโนมัติ

## 10. Run และทดสอบในเครื่อง

ติดตั้ง dependencies:

```bash
pnpm install
```

เปิด Development Server:

```bash
pnpm dev
```

จากนั้นเปิด:

```text
http://localhost:3000
```

ตรวจสอบโค้ดด้วย ESLint:

```bash
pnpm lint
```

ทดสอบ Production Build:

```bash
pnpm build
```

Static artifact จะถูกสร้างใน:

```text
dist/client
```

## 11. การแก้ปัญหาเบื้องต้น

### เว็บไซต์แสดงหน้า 404

ตรวจสอบว่า:

- Repository ตั้งค่า **Settings → Pages → Source** เป็น `GitHub Actions`
- Workflow ล่าสุดทำงานสำเร็จ
- URL มีชื่อ Repository ต่อท้าย: `/kbs-training-request/`
- Repository และ branch `main` ยังมีไฟล์ workflow

### Workflow เป็นสีแดง

1. เปิดแท็บ **Actions**
2. เลือก workflow ที่ล้มเหลว
3. เปิด job `build`
4. ตรวจขั้นตอนที่มีเครื่องหมายกากบาท
5. แก้ไขไฟล์ในเครื่อง จากนั้น Commit และ Push ใหม่

### ต้องการ Run Workflow ใหม่ด้วยตนเอง

1. เปิด **Actions**
2. เลือก **Deploy to GitHub Pages**
3. กด **Run workflow**
4. เลือก branch `main`
5. กด **Run workflow** อีกครั้ง

### แก้ไฟล์แล้วหน้าเว็บยังไม่เปลี่ยน

- รอ workflow ทำงานจนสำเร็จ
- Reload หน้าเว็บไซต์
- ใช้ Hard Refresh: `Command + Shift + R` บน macOS
- ตรวจว่าการแก้ไขถูก Commit และ Push แล้วด้วย `git status`

### หน้าเว็บแสดงเป็นข้อความธรรมดา ไม่มีสีหรือเลย์เอาต์

อาการนี้หมายถึง CSS และ JavaScript ไม่ถูกโหลดจาก GitHub Pages project path ให้ตรวจว่า workflow มีขั้นตอน **Prepare assets for GitHub Pages project path** แล้ว Commit และ Push workflow เวอร์ชันล่าสุด จากนั้นรอ Deploy ใหม่จนสำเร็จ

## หมายเหตุด้านข้อมูล

GitHub Pages เป็น Static Hosting เวอร์ชันปัจจุบันจึงเป็นหน้า UI ตัวอย่างและยังไม่ส่งข้อมูลไปยังระบบ HR

หากต้องการใช้งานจริง ต้องมี Backend/API สำหรับ:

- ค้นหาข้อมูลพนักงาน
- บันทึกคำร้อง
- จัดเก็บเอกสารแนบ
- จัดการสิทธิ์ผู้ใช้งาน
- ปกป้องข้อมูลส่วนบุคคล เช่น หมายเลขบัตรประชาชนและเบอร์โทรศัพท์
