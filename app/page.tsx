'use client';

import { useEffect, useRef, useState } from 'react';

const productNames = [
  'ขาวธรรมดา 50 กก.',
  'ขาวบริสุทธิ์ 50 กก.',
  'ขาวธรรมชาติ 50 กก.',
  'ขาวธรรมดา 1×25 กก.',
  'ขาวบริสุทธิ์ 1×25 กก.',
  'ขาวธรรมชาติ 1×25 กก.',
] as const;

type ProductName = (typeof productNames)[number];
type Delivery = 'pickup' | 'delivery';

type ProductEntry = {
  selected: boolean;
  year: string;
  quantity: string;
  kg: string;
  vatPrice: string;
  delivery: Delivery;
  shipping: string;
};

type BasicFields = {
  documentNo: string;
  documentDate: string;
  po: string;
  quotation: string;
  sa: string;
  loadingDate: string;
  customerName: string;
  customerCode: string;
  customerDocumentNo: string;
  movingDate: string;
  phone: string;
  note: string;
  vehicleNo: string;
  driverName: string;
  salesName: string;
  signedDate: string;
};

type SavedProduct = ProductEntry & { name: ProductName; beforeVat: number; netBeforeVat: number };
type Order = BasicFields & {
  id: string;
  companyType: 'KBS' | 'KBST';
  products: SavedProduct[];
  signature: string;
};

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyBasic = (): BasicFields => ({
  documentNo: '', documentDate: today(), po: '', quotation: '', sa: '', loadingDate: '',
  customerName: '', customerCode: '', customerDocumentNo: '', movingDate: '', phone: '',
  note: '', vehicleNo: '', driverName: '', salesName: '', signedDate: today(),
});

const emptyProducts = () => Object.fromEntries(productNames.map((name) => [name, {
  selected: false, year: '', quantity: '', kg: '', vatPrice: '', delivery: 'pickup', shipping: '',
}])) as Record<ProductName, ProductEntry>;

const money = (value: number) => Number.isFinite(value) ? value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
const beforeVat = (price: string) => (Number(price) || 0) / 1.07;
const netBeforeVat = (entry: ProductEntry) => beforeVat(entry.vatPrice) - (Number(entry.shipping) || 0);

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>;
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="form-card"><div className="section-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>;
}

function PrintSheet({ order }: { order: Order }) {
  return (
    <article className="print-sheet">
      <div className="print-head">
        <img src="/kbs-sugar-logo.png" alt="KBS Sugar" />
        <div className="print-title"><strong>แบบฟอร์มคำสั่งขาย</strong><span>{order.companyType}</span></div>
        <dl><div><dt>เลขที่ กน.</dt><dd>{order.documentNo || '-'}</dd></div><div><dt>วันที่</dt><dd>{order.documentDate || '-'}</dd></div></dl>
      </div>
      <div className="print-meta">
        <span><b>ลูกค้า:</b> {order.customerName || '-'}</span><span><b>รหัส:</b> {order.customerCode || '-'}</span><span><b>PO:</b> {order.po || '-'}</span>
        <span><b>ใบเสนอราคา:</b> {order.quotation || '-'}</span><span><b>SA:</b> {order.sa || '-'}</span><span><b>วันขึ้น:</b> {order.loadingDate || '-'}</span>
      </div>
      <table>
        <thead><tr><th>สินค้า</th><th>ปี</th><th>จำนวน</th><th>กก.</th><th>รวม VAT</th><th>ก่อน VAT</th><th>รับสินค้า</th><th>ค่าขนส่ง</th><th>สุทธิ</th></tr></thead>
        <tbody>{order.products.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.year || '-'}</td><td>{item.quantity || '-'}</td><td>{item.kg || '-'}</td><td>{money(Number(item.vatPrice))}</td><td>{money(item.beforeVat)}</td><td>{item.delivery === 'pickup' ? 'รับเอง' : 'ส่งถึง'}</td><td>{money(Number(item.shipping))}</td><td>{money(item.netBeforeVat)}</td></tr>)}</tbody>
      </table>
      <div className="print-notes"><p><b>หมายเหตุ:</b> {order.note || '-'}</p><p><b>เบอร์โทร:</b> {order.phone || '-'}</p><p><b>ทะเบียนรถ:</b> {order.vehicleNo || '-'}</p><p><b>คนขับรถ:</b> {order.driverName || '-'}</p></div>
      <div className="print-sign"><div>{order.signature && <img src={order.signature} alt="ลายเซ็น" />}<span>{order.salesName || 'เจ้าหน้าที่ขาย'}</span></div><span>วันที่ {order.signedDate || '-'}</span></div>
    </article>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char);
}

function printableOrder(order: Order) {
  const rows = order.products.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.year || '-')}</td><td>${escapeHtml(item.quantity || '-')}</td><td>${escapeHtml(item.kg || '-')}</td><td>${money(Number(item.vatPrice))}</td><td>${money(item.beforeVat)}</td><td>${item.delivery === 'pickup' ? 'รับเอง' : 'ส่งถึง'}</td><td>${money(Number(item.shipping))}</td><td>${money(item.netBeforeVat)}</td></tr>`).join('');
  return `<article class="sheet"><header><img src="${window.location.origin}/kbs-sugar-logo.png"><div><h2>แบบฟอร์มคำสั่งขาย</h2><b>${order.companyType}</b></div><dl><div><dt>เลขที่ กน.</dt><dd>${escapeHtml(order.documentNo || '-')}</dd></div><div><dt>วันที่</dt><dd>${escapeHtml(order.documentDate || '-')}</dd></div></dl></header><section class="meta"><span><b>ลูกค้า:</b> ${escapeHtml(order.customerName || '-')}</span><span><b>รหัส:</b> ${escapeHtml(order.customerCode || '-')}</span><span><b>PO:</b> ${escapeHtml(order.po || '-')}</span><span><b>ใบเสนอราคา:</b> ${escapeHtml(order.quotation || '-')}</span><span><b>SA:</b> ${escapeHtml(order.sa || '-')}</span><span><b>วันขึ้น:</b> ${escapeHtml(order.loadingDate || '-')}</span></section><table><thead><tr><th>สินค้า</th><th>ปี</th><th>จำนวน</th><th>กก.</th><th>รวม VAT</th><th>ก่อน VAT</th><th>รับสินค้า</th><th>ค่าขนส่ง</th><th>สุทธิ</th></tr></thead><tbody>${rows}</tbody></table><section class="notes"><p><b>หมายเหตุ:</b> ${escapeHtml(order.note || '-')}</p><p><b>เบอร์โทร:</b> ${escapeHtml(order.phone || '-')}</p><p><b>ทะเบียนรถ:</b> ${escapeHtml(order.vehicleNo || '-')}</p><p><b>คนขับรถ:</b> ${escapeHtml(order.driverName || '-')}</p></section><footer><div>${order.signature ? `<img src="${order.signature}">` : ''}<span>${escapeHtml(order.salesName || 'เจ้าหน้าที่ขาย')}</span></div><span>วันที่ ${escapeHtml(order.signedDate || '-')}</span></footer></article>`;
}

export default function Home() {
  const [basic, setBasic] = useState<BasicFields>(emptyBasic);
  const [companyType, setCompanyType] = useState<'KBS' | 'KBST'>('KBS');
  const [products, setProducts] = useState<Record<ProductName, ProductEntry>>(emptyProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preview, setPreview] = useState<Order | null>(null);
  const [status, setStatus] = useState('');
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('kbs-orders');
    if (saved) { try { setOrders(JSON.parse(saved)); } catch { localStorage.removeItem('kbs-orders'); } }
    navigator.serviceWorker?.register('/sw.js').catch(() => undefined);
    const handleInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); };
    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

  useEffect(() => { localStorage.setItem('kbs-orders', JSON.stringify(orders)); }, [orders]);

  const updateBasic = (key: keyof BasicFields, value: string) => setBasic((current) => ({ ...current, [key]: value }));
  const updateProduct = (name: ProductName, patch: Partial<ProductEntry>) => setProducts((current) => ({ ...current, [name]: { ...current[name], ...patch } }));

  function currentOrder(showError = true): Order | null {
    const selected = productNames.filter((name) => products[name].selected);
    if (!basic.documentNo.trim() || !basic.customerName.trim() || selected.length === 0) {
      if (showError) setStatus('กรุณากรอกเลขที่ กน. ชื่อลูกค้า และเลือกสินค้าอย่างน้อย 1 รายการ');
      return null;
    }
    return { ...basic, id: crypto.randomUUID(), companyType, signature: canvasRef.current?.toDataURL('image/png') || '', products: selected.map((name) => ({ name, ...products[name], beforeVat: beforeVat(products[name].vatPrice), netBeforeVat: netBeforeVat(products[name]) })) };
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width), y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height) };
  }

  function startDraw(event: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    const context = event.currentTarget.getContext('2d');
    if (context) { context.beginPath(); context.moveTo(point.x, point.y); }
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const point = canvasPoint(event);
    const context = event.currentTarget.getContext('2d');
    if (context) { context.lineWidth = 2.4; context.lineCap = 'round'; context.strokeStyle = '#17212b'; context.lineTo(point.x, point.y); context.stroke(); }
  }

  function resetForm() {
    setBasic(emptyBasic()); setProducts(emptyProducts()); setCompanyType('KBS'); setStatus('ล้างแบบฟอร์มแล้ว'); clearSignature();
  }

  function addOrder() {
    const order = currentOrder();
    if (!order) return;
    setOrders((current) => [...current, order]);
    setStatus(`เพิ่ม ${order.documentNo} เข้ารายการรอออก PDF แล้ว`);
    resetForm();
  }

  function printAll() {
    const printable = orders.length ? orders : [currentOrder()].filter(Boolean) as Order[];
    if (!printable.length) return;
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) { setStatus('เบราว์เซอร์ปิดกั้นหน้าพิมพ์ กรุณาอนุญาตป๊อปอัปแล้วลองอีกครั้ง'); return; }
    const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>KBS Order</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;color:#111}.sheet{height:136mm;padding:7mm;border-bottom:1px dashed #aaa;break-inside:avoid;page-break-inside:avoid}.sheet:nth-child(2n){border:0;break-after:page;page-break-after:always}header{display:grid;grid-template-columns:90px 1fr 210px;gap:14px;align-items:center;border-bottom:1px solid #222;padding-bottom:6px}header img{width:72px;height:52px;object-fit:contain}h2{font-size:15px;margin:0 0 4px;text-align:center}header b{display:block;text-align:center;font-size:11px}dl{margin:0;font-size:9px}dl div{display:grid;grid-template-columns:65px 1fr;gap:5px}dt{font-weight:bold}dd{margin:0;border-bottom:1px dotted #555}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 12px;padding:6px 0;font-size:8px}table{width:100%;border-collapse:collapse;font-size:7.5px}th,td{border:1px solid #777;padding:3px;text-align:center}th:first-child,td:first-child{text-align:left}.notes{display:grid;grid-template-columns:2fr 1fr;gap:0 12px;font-size:8px}.notes p{margin:5px 0;border-bottom:1px dotted #888}footer{display:flex;justify-content:flex-end;gap:40px;align-items:end;font-size:8px;margin-top:3px}footer div{display:grid;text-align:center;min-width:130px;border-bottom:1px dotted #777}footer img{width:110px;height:28px;object-fit:contain}@media screen{body{background:#ddd}.sheet{width:210mm;margin:12px auto;background:white}}@media print{.sheet{width:auto}}</style></head><body>${printable.map(printableOrder).join('')}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`;
    popup.document.write(html); popup.document.close();
  }

  async function installApp() {
    if (!installPrompt) { setStatus('เปิดเมนูของเบราว์เซอร์ แล้วเลือก “เพิ่มไปยังหน้าจอหลัก” หรือ “ติดตั้งแอป”'); return; }
    await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null);
  }

  return (
    <main>
      <header className="app-header"><div className="brand"><img src="/kbs-sugar-logo.png" alt="KBS Sugar" /><div><strong>KBS ORDER</strong><small>ระบบจัดทำคำสั่งขาย</small></div></div><div className="header-actions"><span className="version">v1.0</span><button type="button" onClick={installApp}>ติดตั้งแอป</button></div></header>
      <div className="page-shell">
        <div className="hero"><p>SALES ORDER</p><h1>แบบฟอร์มคำสั่งขาย</h1><span>กรอกและเพิ่มรายการได้เรื่อย ๆ แล้วบันทึกเป็น PDF พร้อมกันครั้งเดียว</span></div>
        <section className="queue-card"><div className="queue-count">{orders.length}</div><div><h2>รายการรอออก PDF</h2><p>ระบบจัดให้ 2 รายการต่อกระดาษ A4 หนึ่งแผ่น</p></div>{orders.length === 0 ? <div className="empty-state">ยังไม่มีรายการที่เพิ่มไว้</div> : <div className="queue-list">{orders.map((order) => <div className="queue-item" key={order.id}><span><b>{order.documentNo}</b>{order.customerName}</span><button type="button" onClick={() => setOrders((current) => current.filter((item) => item.id !== order.id))} aria-label={`ลบ ${order.documentNo}`}>×</button></div>)}</div>}</section>

        <form onSubmit={(event) => event.preventDefault()}>
          <Section number="01" title="ข้อมูลเอกสาร">
            <div className="type-switch" role="radiogroup" aria-label="ประเภทเอกสาร"><label className={companyType === 'KBST' ? 'active' : ''}><input type="radio" name="company" checked={companyType === 'KBST'} onChange={() => setCompanyType('KBST')} /> KBST</label><label className={companyType === 'KBS' ? 'active' : ''}><input type="radio" name="company" checked={companyType === 'KBS'} onChange={() => setCompanyType('KBS')} /> KBS</label></div>
            <div className="field-grid three"><Field label="เลขที่ กน." value={basic.documentNo} onChange={(value) => updateBasic('documentNo', value)} placeholder="เช่น MK-046/2026" required /><Field label="วันที่เอกสาร" type="date" value={basic.documentDate} onChange={(value) => updateBasic('documentDate', value)} /><Field label="PO" value={basic.po} onChange={(value) => updateBasic('po', value)} placeholder="เลขที่ PO" /><Field label="เลขที่ใบเสนอราคา" value={basic.quotation} onChange={(value) => updateBasic('quotation', value)} /><Field label="SA" value={basic.sa} onChange={(value) => updateBasic('sa', value)} placeholder="เลขที่ SA" /><Field label="วันขึ้น" type="date" value={basic.loadingDate} onChange={(value) => updateBasic('loadingDate', value)} /></div>
          </Section>

          <Section number="02" title="ข้อมูลลูกค้า"><div className="field-grid three"><Field label="ชื่อลูกค้า" value={basic.customerName} onChange={(value) => updateBasic('customerName', value)} placeholder="ชื่อบริษัท / ชื่อลูกค้า" required /><Field label="รหัสลูกค้า" value={basic.customerCode} onChange={(value) => updateBasic('customerCode', value)} placeholder="รหัส" /><Field label="กน." value={basic.customerDocumentNo} onChange={(value) => updateBasic('customerDocumentNo', value)} placeholder="เลขที่ กน." /><Field label="วันนัดย้าย" type="date" value={basic.movingDate} onChange={(value) => updateBasic('movingDate', value)} /><Field label="เบอร์โทรผู้ติดต่อ" value={basic.phone} onChange={(value) => updateBasic('phone', value)} placeholder="08x-xxx-xxxx" /></div></Section>

          <Section number="03" title="รายการสินค้า"><div className="product-list">{productNames.map((name) => { const entry = products[name]; return <div className={entry.selected ? 'product selected' : 'product'} key={name}><label className="product-toggle"><input type="checkbox" checked={entry.selected} onChange={(event) => updateProduct(name, { selected: event.target.checked })} /><b>{name}</b></label>{entry.selected && <div className="product-details"><Field label="ปี" value={entry.year} onChange={(value) => updateProduct(name, { year: value })} /><Field label="จำนวน" type="number" value={entry.quantity} onChange={(value) => updateProduct(name, { quantity: value })} /><Field label="กก." type="number" value={entry.kg} onChange={(value) => updateProduct(name, { kg: value })} /><Field label="ราคารวม VAT 7% (บาท)" type="number" value={entry.vatPrice} onChange={(value) => updateProduct(name, { vatPrice: value })} /><label className="field calculated"><span>ราคาก่อน VAT 7%</span><output>{money(beforeVat(entry.vatPrice))}</output></label><div className="delivery-switch"><label><input type="radio" name={`delivery-${name}`} checked={entry.delivery === 'pickup'} onChange={() => updateProduct(name, { delivery: 'pickup' })} /> รับเอง</label><label><input type="radio" name={`delivery-${name}`} checked={entry.delivery === 'delivery'} onChange={() => updateProduct(name, { delivery: 'delivery' })} /> ส่งถึง</label></div><Field label="ค่าขนส่ง (บ./กก.)" type="number" value={entry.shipping} onChange={(value) => updateProduct(name, { shipping: value })} /><label className="field calculated"><span>ก่อน VAT − ขนส่ง</span><output>{money(netBeforeVat(entry))}</output></label></div>}</div>; })}</div></Section>

          <Section number="04" title="รายละเอียดเพิ่มเติม"><div className="field-grid three"><label className="field wide"><span>หมายเหตุ</span><textarea value={basic.note} onChange={(event) => updateBasic('note', event.target.value)} placeholder="รายละเอียดเพิ่มเติม" /></label><Field label="ทะเบียนรถ" value={basic.vehicleNo} onChange={(value) => updateBasic('vehicleNo', value)} placeholder="ทะเบียน" /><Field label="คนขับรถชื่อ" value={basic.driverName} onChange={(value) => updateBasic('driverName', value)} placeholder="ชื่อคนขับ" /></div></Section>

          <Section number="05" title="ผู้ลงนาม"><div className="signature-grid"><div className="signature-box"><div><b>ลายเซ็นเจ้าหน้าที่ขาย</b><button type="button" onClick={clearSignature}>ล้างลายเซ็น</button></div><canvas ref={canvasRef} width="700" height="180" onPointerDown={startDraw} onPointerMove={draw} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} aria-label="พื้นที่วาดลายเซ็น" /></div><div className="sign-fields"><Field label="ชื่อเจ้าหน้าที่ขาย" value={basic.salesName} onChange={(value) => updateBasic('salesName', value)} /><Field label="วันที่ลงนาม" type="date" value={basic.signedDate} onChange={(value) => updateBasic('signedDate', value)} /></div></div></Section>

          {status && <p className="status" role="status">{status}</p>}
          <div className="action-bar"><button className="secondary" type="button" onClick={resetForm}>ล้างฟอร์ม</button><button className="secondary" type="button" onClick={() => { const order = currentOrder(); if (order) setPreview(order); }}>ดูตัวอย่าง</button><button className="primary" type="button" onClick={addOrder}>＋ เพิ่มรายการ</button><button className="dark" type="button" onClick={printAll}>บันทึก PDF ทั้งหมด</button></div>
        </form>
      </div>

      {preview && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}><section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><div className="modal-head"><div><small>PDF PREVIEW</small><h2 id="preview-title">ตัวอย่างเอกสาร</h2></div><button type="button" onClick={() => setPreview(null)} aria-label="ปิด">×</button></div><div className="preview-paper"><PrintSheet order={preview} /></div><button className="primary modal-print" type="button" onClick={printAll}>บันทึก PDF ทั้งหมด</button></section></div>}
    </main>
  );
}
