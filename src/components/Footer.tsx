import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 border-t-4 border-emerald-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="বাংলাদেশ সরকার" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-bold text-sm">জন্ম ও মৃত্যু নিবন্ধন কার্যালয়</span>
            </div>
            <p className="text-emerald-200/70 leading-relaxed text-[11px]">
              ডিজিটাল বাংলাদেশ বিনির্মাণে স্মার্ট নাগরিক সেবা এবং কৃত্রিম বুদ্ধিমত্তা চালিত তাৎক্ষণিক সহায়তা প্রদান প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h3 className="text-white font-bold text-xs mb-3 border-b border-emerald-800 pb-1">প্রয়োজনীয় সেবা</h3>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#services" className="hover:text-amber-300 transition-colors">অনলাইন জন্ম নিবন্ধন আবেদন</a></li>
              <li><a href="#services" className="hover:text-amber-300 transition-colors">মৃত্যু নিবন্ধন আবেদন</a></li>
              <li><a href="#services" className="hover:text-amber-300 transition-colors">সনদ যাচাইকরণ (Verification)</a></li>
              <li><a href="#services" className="hover:text-amber-300 transition-colors">আবেদনের বর্তমান অবস্থা যাচাই</a></li>
              <li><a href="#services" className="hover:text-amber-300 transition-colors">তথ্য সংশোধন ও ডুপ্লিকেট সনদ</a></li>
            </ul>
          </div>

          {/* Col 3: Guidelines & FAQs */}
          <div>
            <h3 className="text-white font-bold text-xs mb-3 border-b border-emerald-800 pb-1">সহায়তা ও তথ্য</h3>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#faqs" className="hover:text-amber-300 transition-colors">প্রায়শই জিজ্ঞাসিত প্রশ্নাবলি (FAQ)</a></li>
              <li><a href="#guidelines" className="hover:text-amber-300 transition-colors">প্রয়োজনীয় কাগজপত্র তালিকা</a></li>
              <li><a href="#notices" className="hover:text-amber-300 transition-colors">আইন ও বিধিমালা নির্দেশিকা</a></li>
              <li><a href="#faqs" className="hover:text-amber-300 transition-colors">ফি সংক্রান্ত তথ্য</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div>
            <h3 className="text-white font-bold text-xs mb-3 border-b border-emerald-800 pb-1">জরুরি যোগাযোগ</h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>হটলাইন: ১৬১২২ / ৩৩৩</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>support@bdris.gov.bd</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>পরিবহন পুল ভবন, ৯ তলা, সচিবালয় লিংক রোড, ঢাকা।</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400/80">
          <p>© {new Date().getFullYear()} গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>গোপনীয়তার নীতি</span>
            <span>ব্যবহারের শর্তাবলি</span>
            <span>সাইটম্যাপ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
