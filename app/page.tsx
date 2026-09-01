'use client';

import { FormEvent, PointerEvent, useMemo, useRef, useState } from 'react';

const reasons = ['สอดคล้องกฎหมาย', 'ตามมาตรฐาน/ลูกค้า', 'นำมาใช้ในการทำงาน', 'ศึกษาเรียนรู้นำมาปรับปรุง', 'เพิ่มทักษะเรียนรู้สิ่งใหม่', 'ได้รับมอบหมายให้ดำเนินการ'];

const addDays = (date: string, days: number) => {
  if (!date) return '';
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
};

function SectionTitle({ number, children }: { number: string; children: React.ReactNode }) {
  return <h2 className="section-title"><span>{number}</span>{children}</h2>;
}

function Field({ label, required, hint, className = '', children }: { label: string; required?: boolean; hint?: string; className?: string; children: React.ReactNode }) {
  return <label className={`field ${className}`}><span className="field-label">{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function Home() {
  const [citizenId, setCitizenId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const signatureCanvas = useRef<HTMLCanvasElement>(null);
  const drawingSignature = useRef(false);
  const autoReportDate = useMemo(() => addDays(endDate, 15), [endDate]);

  function updateEndDate(value: string) { setEndDate(value); setReportDate(addDays(value, 15)); }
  function toggleReason(reason: string) { setSelectedReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]); }
  function signaturePoint(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
      y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
    };
  }
  function startSignature(event: PointerEvent<HTMLCanvasElement>) {
    drawingSignature.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext('2d');
    const point = signaturePoint(event);
    if (context) {
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#152944';
    }
  }
  function drawSignature(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingSignature.current) return;
    const context = event.currentTarget.getContext('2d');
    const point = signaturePoint(event);
    if (context) { context.lineTo(point.x, point.y); context.stroke(); setHasSignature(true); }
  }
  function stopSignature() { drawingSignature.current = false; }
  function clearSignature() {
    const canvas = signatureCanvas.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReasons.length) { document.querySelector('#reasons')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!hasSignature) { document.querySelector('#signature')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setSubmitted(true);
  }

  return (
    <main className="page-shell">
      <form className="form-card" onSubmit={submitForm}>
        <header className="form-header">
          {/* A relative URL keeps this public asset working under the GitHub Pages repository path. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-mark" src="kbs-sugar-logo.png" alt="KBS Sugar" />
          <div><p className="eyebrow">KBS SUGAR · HUMAN RESOURCES</p><h1>แบบคำร้องขอฝึกอบรม/<wbr />สัมมนา/<wbr />ดูงาน</h1><p>F-HR-302 v.4 Rev. 01.09.25 — ส่วนที่ 1 สำหรับหน่วยงานและผู้ขอรับการฝึกอบรม</p></div>
        </header>

        <div className="form-body">
          <section>
            <SectionTitle number="01">ข้อมูลพนักงานผู้ร้องขอ</SectionTitle>
            <Field label="หมายเลขบัตรประชาชน (13 หลัก)" required hint="ระบบจะค้นหา ชื่อ-สกุล ตำแหน่ง และสังกัดให้อัตโนมัติเมื่อกรอกครบ 13 หลัก">
              <input inputMode="numeric" autoComplete="off" maxLength={13} pattern="[0-9]{13}" value={citizenId} onChange={(event) => setCitizenId(event.target.value.replace(/\D/g, ''))} placeholder="กรอกตัวเลข 13 หลัก" required />
            </Field>
            <div className="employee-grid">
              <Field label="รหัสพนักงาน"><input value="—" readOnly /></Field>
              <Field label="ชื่อ-สกุล" className="span-2"><input value={citizenId.length === 13 ? '— พร้อมเชื่อมต่อฐานข้อมูลพนักงาน —' : '— ค้นหาจากเลขบัตรประชาชน —'} readOnly /></Field>
              <Field label="ตำแหน่ง"><input value="—" readOnly /></Field>
              <Field label="สังกัดหน่วยงาน (แผนก)" className="span-2"><input value="—" readOnly /></Field>
              <Field label="ฝ่าย" className="span-2"><input value="—" readOnly /></Field>
            </div>
            <div className="two-columns compact-top">
              <Field label="เบอร์โทรศัพท์มือถือ (10 หลัก)" required hint="ตัวเลข 10 หลัก ขึ้นต้นด้วย 0"><input type="tel" inputMode="numeric" pattern="0[0-9]{9}" maxLength={10} placeholder="เช่น 0821234567" required /></Field>
              <fieldset className="field option-field"><legend className="field-label">สถานที่ปฏิบัติงาน <b>*</b></legend><div className="pills">{['ครบุรี', 'สีคิ้ว', 'สำนักงานใหญ่'].map((place) => <label key={place}><input type="radio" name="workplace" value={place} required /><span>{place}</span></label>)}</div></fieldset>
            </div>
          </section>

          <section>
            <SectionTitle number="02">รายละเอียดการฝึกอบรม/สัมมนา/ดูงาน</SectionTitle>
            <Field label="มีความประสงค์เข้ารับการฝึกอบรม/สัมมนา/ดูงาน หลักสูตร/เรื่อง" required><input placeholder="พิมพ์ชื่อหลักสูตร/เรื่อง" required /></Field>
            <div className="two-columns compact-top">
              <Field label="ในระหว่างวันที่" required><input type="date" required /></Field>
              <Field label="ถึงวันที่" required><input type="date" value={endDate} onChange={(event) => updateEndDate(event.target.value)} required /></Field>
              <Field label="จัดโดย" required><input placeholder="ชื่อหน่วยงาน/สถาบันผู้จัด" required /></Field>
              <Field label="สถานที่จัด" required><input placeholder="สถานที่จัดอบรม" required /></Field>
            </div>
            <fieldset className="field reason-field" id="reasons"><legend className="field-label">เหตุผลการขอ (เลือกได้หลายข้อ) <b>*</b></legend><div className="reason-grid">{reasons.map((reason) => <label className={selectedReasons.includes(reason) ? 'selected' : ''} key={reason}><input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => toggleReason(reason)} /><span className="checkmark">✓</span><span>{reason}</span></label>)}</div>{!selectedReasons.length && <small>กรุณาเลือกอย่างน้อย 1 ข้อ</small>}</fieldset>
            <Field label="ค่าใช้จ่ายในการสมัครลงทะเบียน ประมาณ (บาท)" className="compact-top"><div className="money-input"><span>฿</span><input type="number" min="0" step="0.01" placeholder="0.00" /></div></Field>
            <Field label="ผลที่คาดว่าจะได้รับจากการฝึกอบรม" required className="compact-top"><textarea rows={4} placeholder="ระบุผลที่คาดว่าจะได้รับ" required /></Field>
          </section>

          <section>
            <SectionTitle number="03">การจัดส่งรายงานผล</SectionTitle>
            <div className="notice"><span>15</span><p>หลังการฝึกอบรม/สัมมนาเสร็จสิ้น จะดำเนินการจัดส่งรายงานผล<strong>ภายใน 15 วัน</strong></p></div>
            <Field label="กำหนดส่งรายงานผลวันที่" required className="compact-top" hint={`ระบบกำหนดให้อัตโนมัติ${autoReportDate ? ` เป็นวันที่ ${autoReportDate}` : ' (15 วันหลังสิ้นสุดอบรม)'} และสามารถเลือกวันก่อนหน้าได้`}><input type="date" value={reportDate} max={autoReportDate || undefined} onChange={(event) => setReportDate(event.target.value)} required /></Field>
          </section>

          <section>
            <SectionTitle number="04">เอกสารประกอบ</SectionTitle>
            <label className="upload-zone"><input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} required /><span className="upload-icon">↥</span><strong>{fileName || 'เลือกหรือวางไฟล์เอกสารที่นี่'}</strong><small>PDF, Word หรือรูปภาพ · ขนาดไม่เกิน 10 MB</small><em>{fileName ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}</em></label>
          </section>

          <section id="signature">
            <SectionTitle number="05">ลายเซ็นผู้ร้องขอ</SectionTitle>
            <div className={`signature-panel ${hasSignature ? 'signed' : ''}`}>
              <div className="signature-toolbar"><div><strong>ลงลายเซ็นในช่องด้านล่าง <b>*</b></strong><small>ใช้เมาส์ ปากกา หรือนิ้วมือในการเซ็น</small></div><button type="button" onClick={clearSignature}>ล้างลายเซ็น</button></div>
              <canvas ref={signatureCanvas} width="1400" height="300" aria-label="ช่องลงลายเซ็นผู้ร้องขอ" onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={stopSignature} onPointerCancel={stopSignature} onPointerLeave={stopSignature} />
              <div className="signature-line"><span>ลายเซ็นผู้ร้องขอ</span></div>
            </div>
            {!hasSignature && <p className="signature-required">กรุณาลงลายเซ็นก่อนส่งคำร้อง</p>}
          </section>

          <button className="submit-button" type="submit"><span>✓</span> ยืนยันส่งคำร้อง</button>
          <p className="privacy-note">ข้อมูลที่กรอกในหน้าตัวอย่างนี้ยังไม่ถูกส่งหรือบันทึกไปยังเซิร์ฟเวอร์</p>
        </div>
      </form>

      <footer className="site-footer"><strong>ฝ่ายทรัพยากรบุคคล — บริษัท น้ำตาลครบุรี จำกัด (มหาชน) · KBS SUGAR</strong><span>พนักงานควรเขียนคำร้องก่อนการสัมมนาอย่างน้อย 7 วัน · ส่งรายงานภายใน 15 วัน พร้อมวุฒิบัตร (ถ้ามี)</span></footer>

      {submitted && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSubmitted(false)}><section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-icon">✓</div><p>ตรวจสอบข้อมูลเรียบร้อย</p><h2 id="success-title">แบบฟอร์มพร้อมส่งแล้ว</h2><span>นี่คือหน้าเว็บไซต์ตัวอย่างบน GitHub Pages จึงยังไม่มีการส่งข้อมูลไปยังระบบ HR</span><button type="button" onClick={() => setSubmitted(false)}>กลับไปตรวจสอบข้อมูล</button></section></div>}
    </main>
  );
}
