import React, { useState } from "react";
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  FileCode, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Layers,
  Key,
  RefreshCw,
  X
} from "lucide-react";

interface InstallGuideProps {
  onClose?: () => void;
  onDownloadIpa?: () => void;
}

export default function InstallGuide({ onClose, onDownloadIpa }: InstallGuideProps) {
  const [activeTab, setActiveTab] = useState<"steps" | "esign" | "faq">("steps");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDownload = () => {
    if (onDownloadIpa) {
      onDownloadIpa();
    } else {
      // Direct IPA download fallback
      const link = document.createElement("a");
      link.href = "/downloads/FutureArtist.ipa";
      link.download = "FutureArtist.ipa";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const faqs = [
    {
      q: "ESign คืออะไร? ปลอดภัยหรือไม่?",
      a: "ESign คือเครื่องมือ Sideloading ยอดนิยมบน iOS สำหรับการติดตั้งไฟล์แอปพลิเคชัน (.ipa) โดยไม่ต้องผ่าน App Store ทางตรง ปลอดภัยเมื่อใช้ใบรับรองและไฟล์แอปจากแหล่งที่น่าเชื่อถือ"
    },
    {
      q: "หากกดเปิดแอปแล้วขึ้น 'Untrusted Developer' ต้องทำอย่างไร?",
      a: "ไปที่ Settings (การตั้งค่า) > General (ทั่วไป) > VPN & Device Management (การจัดการ VPN และอุปกรณ์) > เลือกชื่อบริษัท/ใบรับรอง > กด 'Trust' (เชื่อถือ) แล้วจะสามารถเข้าใช้งานแอปได้ทันที"
    },
    {
      q: "ถ้าใบรับรอง (Certificate) หมดอายุหรือโดน Revoke ต้องแก้ยังไง?",
      a: "กรณีใบรับรองหมดอายุ สามารถนำเข้าใบรับรองใหม่ (New Cert/P12) เข้าใน ESign แล้วทำการ Re-sign ไฟล์ FutureArtist.ipa ใหม่ได้เลย โดยข้อมูลเดิมภายในแอปจะไม่สูญหาย"
    },
    {
      q: "ทำไมถึงแนะนำให้ติดตั้งผ่าน ESign สำหรับ iOS?",
      a: "เนื่องจาก Future Artist มีระบบแจ้งเตือนแบบเรียลไทม์ OneSignal และ Background Notification รวมถึงเพลง/เอฟเฟกต์เสียงฝึกซ้อมเฉพาะ การติดตั้งเป็น iOS Native App ผ่าน ESign ช่วยให้แอปทำงานได้เต็มประสิทธิภาพสูงสุด"
    },
    {
      q: "รองรับ iOS เวอร์ชันไหนบ้าง?",
      a: "รองรับ iOS 14.0 ขึ้นไป ทั้งบน iPhone และ iPad ทุกรุ่น"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-4">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 md:p-8 border-b border-indigo-500/20">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            aria-label="Close Guide"
          >
            <X size={20} />
          </button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1.5">
            <Smartphone size={13} /> คู่มือติดตั้ง iOS Native App
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            ESign Sideloading Method
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          วิธีติดตั้ง Future Artist บน iPhone & iPad (ผ่าน ESign)
        </h2>
        <p className="mt-2 text-sm md:text-base text-slate-300 max-w-2xl">
          คู่มือแนะนำขั้นตอนการดาวน์โหลดไฟล์ <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">FutureArtist.ipa</code> และการติดตั้งเข้าสู่อุปกรณ์ของคุณอย่างปลอดภัย
        </p>

        {/* Quick Action Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all text-sm"
          >
            <Download size={18} />
            <span>ดาวน์โหลด FutureArtist.ipa</span>
          </button>

          <a
            href="https://esign.yy338.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-sm"
          >
            <ExternalLink size={16} />
            <span>เว็บไซต์ ESign Official</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("steps")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "steps"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers size={16} />
          <span>4 ขั้นตอนติดตั้งง่ายๆ</span>
        </button>

        <button
          onClick={() => setActiveTab("esign")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "esign"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Key size={16} />
          <span>วิธีลงทะเบียน Certificate</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === "faq"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle size={16} />
          <span>คำถามที่พบบ่อย (FAQ)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {activeTab === "steps" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl relative hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-sm">
                    1
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Step 01</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <Download size={18} className="text-indigo-400" />
                  ติดตั้งแอป ESign
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ดาวน์โหลดแอป ESign บน iPhone/iPad ผ่านลิงก์ติดตั้งตรง (Direct Install) หรือลงผ่าน DNS/Certificate ที่เตรียมไว้
                </p>
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <a 
                    href="https://esign.yy338.cn/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    ไปที่เว็บ ESign <ArrowRight size={12} />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl relative hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-sm">
                    2
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Step 02</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <FileCode size={18} className="text-indigo-400" />
                  โหลดไฟล์ FutureArtist.ipa
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  กดปุ่ม "ดาวน์โหลด FutureArtist.ipa" ด้านบน เพื่อรับไฟล์ติดตั้งแอปพลิเคชัน และบันทึกไว้ในแอป Files (ไฟล์) บน iPhone
                </p>
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <button 
                    onClick={handleDownload}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    ดาวน์โหลดไฟล์ทันที <Download size={12} />
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl relative hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-sm">
                    3
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Step 03</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <Key size={18} className="text-indigo-400" />
                  นำเข้าไฟล์ & กด Signature
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  เปิดแอป ESign &gt; ไปที่เมนู File &gt; Import ไฟล์ <code className="text-indigo-300">FutureArtist.ipa</code> &gt; แตะไฟล์แล้วเลือก <strong>Signature</strong> (เซ็นสัญญาใบรับรอง)
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-800/60 border border-slate-700/80 p-5 rounded-xl relative hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-sm">
                    4
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Step 04</span>
                </div>
                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" />
                  กด Install & Trust Certificate
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  เมื่อ Sign สำเร็จ ให้กด <strong>Install</strong> &gt; หากเปิดแอปแล้วติดสิทธิ์ ให้ไปที่ <em>Settings &gt; General &gt; VPN & Device Management</em> แล้วกด <strong>Trust</strong>
                </p>
              </div>
            </div>

            {/* Visual Callout */}
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-3">
              <ShieldCheck size={24} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-indigo-200">คำแนะนำเพิ่มเติมเพื่อความสะดวก</h4>
                <p className="text-xs text-slate-300 mt-1">
                  หลังจากติดตั้งเสร็จสิ้น Future Artist จะแสดงเป็นแอปพลิเคชันเต็มรูปแบบบน Home Screen ของคุณ สามารถเปิดรับการแจ้งเตือน Push Notification และเสียงแจ้งเตือนได้อย่างราบรื่น
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "esign" && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Key size={18} className="text-indigo-400" />
              วิธีติดตั้งและนำเข้า Certificate ใน ESign
            </h3>
            <p className="text-xs text-slate-300">
              การใช้งาน ESign จำเป็นต้องมีใบรับรอง (Enterprise Certificate หรือ Personal P12) ในการเซ็นแอป .ipa:
            </p>

            <div className="space-y-3 mt-3">
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                <h4 className="font-semibold text-sm text-indigo-300 mb-1">1. นำเข้าไฟล์ .p12 และ .mobileprovision</h4>
                <p className="text-xs text-slate-300">
                  ดาวน์โหลดไฟล์ Certificate (.p12) และ Provisioning Profile (.mobileprovision) บันทึกลงในเครื่อง จากนั้นเปิดแอป ESign &gt; แตะที่เมนู <strong>Settings</strong> &gt; เลือก <strong>Import Certificate</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                <h4 className="font-semibold text-sm text-indigo-300 mb-1">2. ใส่รหัสผ่านของ Certificate (ถ้ามี)</h4>
                <p className="text-xs text-slate-300">
                  ป้อนรหัสผ่าน (Password) ของไฟล์ .p12 ที่ได้รับมา แล้วกด <strong>Confirm</strong> ระบบ ESign จะขึ้นสถานะ Certificate เป็น Active
                </p>
              </div>

              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl">
                <h4 className="font-semibold text-sm text-indigo-300 mb-1">3. เซ็นสัญญา (Signature) แอป FutureArtist.ipa</h4>
                <p className="text-xs text-slate-300">
                  ไปที่เมนู <strong>Apps</strong> หรือ <strong>Files</strong> ใน ESign &gt; แตะที่ <code className="text-indigo-300">FutureArtist.ipa</code> &gt; เลือก <strong>Signature</strong> &gt; ตรวจสอบว่าเลือก Cert ถูกต้อง แล้วกด <strong>Signature</strong> ด้านล่าง
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <HelpCircle size={18} className="text-indigo-400" />
              คำถามที่พบบ่อยสำหรับ iPhone & iPad
            </h3>

            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-800 bg-slate-800/40 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between font-medium text-sm text-slate-200 hover:text-white hover:bg-slate-800/60"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronDown size={18} className="text-indigo-400" /> : <ChevronRight size={18} className="text-slate-500" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800/80 leading-relaxed bg-slate-900/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <RefreshCw size={14} className="text-indigo-400" /> Future Artist Build v2.4 (iOS Native Ready)
        </span>
        <button
          onClick={handleDownload}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
        >
          <Download size={14} /> ดาวน์โหลด IPA
        </button>
      </div>
    </div>
  );
}
