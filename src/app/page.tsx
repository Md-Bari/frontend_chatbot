'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import { adminApi, systemApi } from '@/lib/api';
import { FAQItem } from '@/lib/types';
import {
  Search,
  FileCheck2,
  FileSpreadsheet,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Bot,
  Scale,
  Users,
  Building2,
  Layers,
  PhoneCall
} from 'lucide-react';

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 1,
    question: '১। জন্মের ৪৫ দিনের মধ্যে কিংবা পরবর্তী সময়েও নিবন্ধন করতে অনেক সময় পিতা মাতার জন্ম নিবন্ধন পাওয়া যায় না, করণীয় কী?',
    answer: `জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী জন্ম নিবন্ধন সকলের জন্য বাধ্যতামূলক (ধারা ৫(১), ৬ক এবং ৮(১))। আইনের এ নির্দেশনা কেউ না মানলে তিনি আইন লঙ্ঘনকারী হিসাবে গণ্য হবেন এবং অনধিক ৫০০০ টাকা অর্থদণ্ডে দণ্ডিত হতে পারেন। তাছাড়া, এখন বিদ্যালয়ে ভর্তি, চাকরিতে নিয়োগ, পাসপোর্ট, জাতীয় পরিচয়পত্রসহ ১৯টি ক্ষেত্রে জন্ম সনদ আবশ্যক। আবার জন্ম নিবন্ধন ব্যতীত কোন ব্যক্তির মৃত্যু নিবন্ধন করা যাবে না। মৃত্যু নিবন্ধন না হলে উত্তরাধিকার নিশ্চিত করা যাবে না।

বিষয়টি এভাবে বুঝিয়ে বললে সংশ্লিষ্ট ব্যক্তি জন্ম নিবন্ধনে আগ্রহী হবেন। সন্তানের জন্ম নিবন্ধনের সঙ্গে পিতা মাতার জন্ম নিবন্ধন অপেক্ষাকৃত সহজ। কারণ সন্তানের জন্ম নিবন্ধনের জন্য যে তথ্যাদি/রেকর্ডপত্র প্রয়োজন তার সঙ্গে পিতামাতার শুধু বয়স প্রমাণের রেকর্ড (শিক্ষা সনদ বা আইনের ৭(১) ধারা অনুযায়ী তদন্তসহ এনআইডি) যোগ করলেই অতি সহজে তাদের জন্ম নিবন্ধন করা সম্ভব। বিষয়টিকে সমস্যা হিসাবে না দেখে ‘সুযোগ’ হিসাবে দেখা যেতে পারে।

তাছাড়া, জন্ম-মৃত্যু নিবন্ধনের শুদ্ধ ডেটাবেজের জন্য ‘ফ্যামিলি ট্রি’ আন্তর্জাতিকভাবে গৃহীত একটি উত্তম চর্চা। বাংলাদেশ এটি গ্রহণ করেছে। এই পদ্ধতিতে সন্তানের জন্ম নিবন্ধনের সঙ্গে পিতা-মাতার জন্ম নিবন্ধন নম্বর যুক্ত করে একটি পারিবারিক কাঠামো তৈরি করা হয়, যাতে পিতা-মাতার সন্তানের সংখ্যা এবং তাদের ক্রমিক নম্বর জানা যায়। এর মাধ্যমে উত্তরাধিকার নিশ্চিত হয় এবং অনৈতিকভাবে বয়স বা অন্যান্য তথ্য পরিবর্তনের প্রবণতা রোধ করা সম্ভব হয়। এই পদ্ধতি বাংলাদেশে ভবিষ্যতে ‘পপুলেশন রেজিস্টার’ প্রণয়নে সহায়ক হবে। এ পরিপ্রেক্ষিতে নাগরিককে বিষয়টি ভালভাবে বুঝিয়ে এবং প্রয়োজনীয় সহযোগিতা প্রদান করে নিবন্ধন করিয়ে নিতে হবে।`,
  },
  {
    id: 2,
    question: '২। ম্যানুয়াল জন্ম নিবন্ধন, যেগুলি এখনও অনলাইনে করা হয়নি—এগুলির বিষয়ে করণীয় কী?',
    answer: 'ম্যানুয়াল জন্ম নিবন্ধনসমূহ অনলাইনে অন্তর্ভুক্তির জন্য অনেকবার সময় দেওয়া হয়েছে। অনলাইন বহির্ভূত এই সকল জন্ম নিবন্ধন এখন হুবহু একই জন্ম নিবন্ধন নম্বর দিয়ে অনলাইনে অন্তর্ভুক্তির সুযোগ নাই। যে এলাকায় হাতে লিখা জন্ম নিবন্ধনটি করা ছিল, সেই কার্যালয়ে রক্ষিত বইতে সনদের তথ্যটি পাওয়া গেলে নিবন্ধক সরাসরি হাতে লিখা সনদের তথ্য দিয়েই অনলাইন নিবন্ধন করে দিবেন যদি না ইতঃপূর্বে অন্য কোথাও জন্ম নিবন্ধন করা হয়ে থাকে। তবে জন্ম নিবন্ধন নম্বরটি পরিবর্তিত হবে। এতে অবশ্য সংশ্লিষ্ট নাগরিকের কোন ক্ষতি বা অসুবিধা হবে না।',
  },
  {
    id: 3,
    question: '৩। পূর্বের সফটওয়্যারে সংশোধিত কোন তথ্য BDRIS সফটওয়্যারে পাওয়া না গেলে কী করতে হবে?',
    answer: 'ইতঃপূর্বে সংশোধিত কোন তথ্য BDRIS সফটওয়্যারে পাওয়া না গেলে এই সকল সংশোধনের একটি বিস্তারিত তালিকা নির্বাহী অফিসার/ডিডিএলজির মাধ্যমে রেজিস্ট্রার জেনারেল-এর কার্যালয়ে প্রেরণ করা হলে তা হালনাগাদ করে দেওয়া হবে।',
  },
  {
    id: 4,
    question: '৪। পূর্বের যে সকল জন্ম-মৃত্যু নিবন্ধন শুধু বাংলায় আছে সেগুলি কীভাবে ইংরেজিতে করা হবে?',
    answer: 'সফটওয়্যারে কোন তথ্য সংযোজন বা বিয়োজন সংশোধন হিসাবে গণ্য হবে। নিবন্ধনের ক্ষেত্রে প্রথমেই তা উভয় ভাষায় করা প্রয়োজন ছিল। ইংরেজিতে না থাকায় তা এখন সংযোজন করতে গেলে তাও সংশোধন হিসাবে গণ্য হবে এবং তা জন্ম ও মৃত্যু নিবন্ধন বিধিমালা ২০১৮-এর ১৫ বিধি অনুযায়ী সংশোধন করতে হবে।',
  },
  {
    id: 5,
    question: '৫। জমজ সন্তানের জন্ম নিবন্ধন কীভাবে করা হবে?',
    answer: 'জমজ সন্তানের জন্ম নিবন্ধনের ক্ষেত্রে প্রথমে একের পর এক আবেদন করে অনলাইনে সাবমিট করতে হবে তারপর যথাযথ নিয়মে নিবন্ধন করতে হবে। (একটি নিবন্ধন সমাপ্ত করে ফেললে অপর আবেদনটি অনলাইনে সাবমিট করতে সমস্যা হবে।)',
  },
  {
    id: 6,
    question: '৬। ১৭ ডিজিটের কম জন্ম নিবন্ধন নম্বর কিভাবে ১৭ ডিজিটে উন্নীত করা যাবে?',
    answer: '১৭ ডিজিটের কম জন্ম নিবন্ধন নম্বর হলে সংশ্লিষ্ট নিবন্ধকের কার্যালয়ে পুরাতন সনদটি জমা প্রদান করে ১৭ ডিজিটের জন্ম নিবন্ধন নম্বর সম্বলিত সনদ নেওয়া যাবে। নিবন্ধনের সকল স্তরের মত এক্ষেত্রেও নাগরিকের নিজস্ব মোবাইল নম্বর ব্যবহার করতে হবে।',
  },
  {
    id: 7,
    question: '৭। পূর্বে নিবন্ধন না হয়ে থাকলে বিবাহিত নারীর জন্ম নিবন্ধন স্বামীর বাড়ির ঠিকানায় করা এবং সনদে স্বামীর নাম লিখা যাবে কি?',
    answer: 'পূর্বে নিবন্ধন না হয়ে থাকলে আইনের ৪ ধারা অনুযায়ী বিবাহিত নারীর বিলম্বিত জন্ম নিবন্ধন স্বামীর স্থায়ী ঠিকানায় করা যাবে। তিনি চাইলে তার জন্ম স্থানের ঠিকানায়ও নিবন্ধন করতে পারবেন। জন্ম নিবন্ধনের ক্ষেত্রে পিতা ও মাতার নাম লিখতে হবে, স্বামীর নাম লেখার কোন সুযোগ নাই।',
  },
  {
    id: 8,
    question: '৮। নিবন্ধনাধীন ব্যক্তিকে কি বাংলা ও ইংরেজি উভয় ভাষায় সনদ দিতে হবে?',
    answer: 'হ্যাঁ! বাধ্যতামূলকভাবে উভয় ভাষায় সনদ দিতে হবে। আবেদনপত্রটি গ্রহণের সময় জন্ম তথ্যসমুহ বাংলা ও ইংরেজি উভয় ভাষায় আছে কি-না তা ভালোভাবে দেখে নিতে হবে।',
  },
  {
    id: 9,
    question: '৯। জন্ম-মৃত্যু নিবন্ধন বা তথ্য সংশোধন সংক্রান্ত আবেদনের সময় নিবন্ধনাধীন ব্যক্তি বা তার পিতা-মাতা-অভিভাবক ছাড়া অন্য কারও মোবাইল ফোন নম্বর ব্যবহার করা যাবে কি?',
    answer: `যেহেতু বিষয়টি ব্যক্তিগত তথ্যের সাথে সংশ্লিষ্ট, সেহেতু এ ক্ষেত্রে নিবন্ধনাধীন ব্যক্তি বা তার পিতা-মাতা-অভিভাবকের মোবাইল ফোন নম্বরই দিতে হবে। এর সঙ্গে এদের কারও ইমেইল নম্বর (যদি থাকে) দিলে তা আরও সুবিধাজনক হবে। পরিবারের সদস্য সংখ্যা ৫ জন হতে পারে এমন ধারণা থেকে সফটওয়্যারে একটি মোবাইল ফোন নম্বর পরিবারের সর্বোচ্চ ৫ জন সদস্যের ব্যবহারের ব্যবস্থা রাখা হয়েছে। কোন ফোন নম্বর ৫-এর অধিক সংখ্যক নিবন্ধনে ব্যবহার করলে পরবর্তী সময়ে সেসকল নিবন্ধনের কোন সন্ধান পাওয়া যাবে না।

পরিবারের কোন মোবাইল ফোন না থাকলে বা সদস্য সংখ্যা মোবাইল ফোনের ধারণ ক্ষমতার বেশী হলে সে ক্ষেত্রে নিবন্ধনাধীন ব্যক্তি বা তার পিতা-মাতা-অভিভাবকের সম্মতিতে তার কোন নিকট-জনের ফোন নম্বর ব্যবহার করা যাবে। এইরূপ ক্ষেত্রে কোন অবস্থায়ই নিবন্ধন কার্যালয়ের কোন দাপ্তরিক বা কোন কর্মচারীর ব্যক্তিগত ফোন নম্বর ব্যবহার করা যাবে না।`,
  },
  {
    id: 10,
    question: '১০। বিবাহ বিচ্ছেদ বা পিতা-মাতার একজন অপ্রাপ্য/নিখোঁজ হলে সন্তানের জন্ম নিবন্ধন কীভাবে হবে?',
    answer: 'এইরূপ ক্ষেত্রে পিতা-মাতার একজনের তথ্য দিয়ে, অপরজনের শুধু নাম উল্লেখক্রমে সন্তানের জন্ম নিবন্ধন করা যাবে।',
  },
  {
    id: 11,
    question: '১১। পিতা-মাতার যে কোন একজন বিদেশী হলে কীভাবে সন্তানের জন্ম নিবন্ধন করা হবে?',
    answer: 'মাতা অথবা পিতার যে কোন একজন বিদেশী হলে যিনি বাংলাদেশী তার স্থায়ী ঠিকানার প্রয়োজনীয় দলিলাদি নিয়ে যোগাযোগ করতে হবে। তখন নিবন্ধক প্রয়োজনীয় অনুসন্ধান শেষে ঊর্ধ্বতন কর্তৃপক্ষের অনুমতিক্রমে নিবন্ধন করে দিবেন।',
  },
  {
    id: 12,
    question: '১২। বিদেশে জন্ম নিবন্ধন করে দেশে ফেরৎ আসা কোন প্রবাসী জন্ম নিবন্ধনের তথ্য সংশোধন অথবা সনদ পুনঃমুদ্রণের আবদেন করলে করণীয় কী?',
    answer: `যে নিবন্ধন অফিসে জন্ম/মৃত্যু নিবন্ধন করা হয়, কোন সংশোধন বা সনদ পুনঃমুদ্রণের প্রয়োজন হলে সে অফিস থেকেই তা করতে হবে। আইনত অন্য অফিস থেকে তা করার সুযোগ নাই। তবে স্থানীয় নিবন্ধন অফিসের সহায়তা নিয়ে অথবা নাগরিক নিজে সরাসরি অনলাইনে মূল নিবন্ধন অফিস বরাবর উপযুক্ত দলিলাদিসহ সংশোধন বা পুনঃমুদ্রণের আবেদন করতে পারেন। সে ক্ষেত্রে আবেদনের অনুলিপি রেজিস্ট্রার জেনারেলের কার্যালয়ে (arg1bdr@gmail.com) প্রেরণ করা হলে প্রয়োজনে পররাষ্ট্র মন্ত্রণালয়ের সঙ্গে যোগাযোগ করে তা নিস্পত্তির ব্যবস্থা করা হবে।

ভবিষ্যতে জন্ম নিবন্ধন সনদের কোন করণিক ভুল সংশোধন অথবা ইংরেজি বা বাংলায় প্রতিলিপির প্রয়োজন হলে তা যে কোনো নিবন্ধন অফিস থেকে যাতে প্রদান করা যায় সে বিষয়ে ব্যবস্থা গ্রহণ করা হবে।`,
  },
  {
    id: 13,
    question: '১৩। জন্ম-মৃত্যু নিবন্ধনের ফি বাবদ প্রাপ্ত অর্থ চালানের মাধ্যমে জমা সংক্রান্ত তথ্য BDRIS-এ প্রবেশ করাতে গেলে অনেক সময় ফাইল আপলোড করা যায় না বা নানা রকম সমস্যা দেখা দেয়, সমাধান কী?',
    answer: `জন্ম-মৃত্যু নিবন্ধন বিধিমালা ২০১৮-এর বিধি ২১ (৬) অনুযায়ী প্রতি মাসে আদায়কৃত অর্থ পরবর্তী মাসের ৭ তারিখের মধ্যে সরকারি তহবিলে জমা প্রদান বাধ্যতামূলক।

BDRIS-এ চালান সংক্রান্ত তথ্য আপলোড করতে না পারার দুইটি কারণ থাকতে পারে:
ক) চালানের তথ্যের সঙ্গে সংযুক্ত ফাইলের পরিমাণ ১০২৪ কিলোবাইট এর বেশি হওয়া (প্রতিটি ফাইলের পরিমাণ সর্বোচ্চ ১০২৪ কিলোবাইট বা এর নিচে হতে হবে)।
খ) চালানের টাকার পরিমাণ ব্যালান্স-এর পরিমাণের চেয়ে বেশি হওয়া (চালানের টাকার পরিমাণ সর্বদা ব্যালান্স-এর সমান অথবা এর কম হতে হবে)।

এখানে উল্লেখ্য যে, বদলি বা অন্য কোন কারণে ‘অথরাইজড ইউজার’কে রিলিজ করতে হলে বিধি ২১ (১) অনুযায়ী আদায়কৃত সমুদয় টাকা চালানের মাধ্যমে জমা দিয়ে ব্যালান্স শুন্য করে তারপর জেলা/উপজেলা অ্যাডমিনের মাধ্যমে তাকে রিলিজ করা যাবে।`,
  },
  {
    id: 14,
    question: '১৪। অনেক সময় জন্ম নিবন্ধনের আবেদন করলে আরও এক বা একাধিক ব্যক্তির সঙ্গে ‘পসিবল ডুপ্লিকেট’ দেখায়, সমাধান কীভাবে করবেন?',
    answer: `‘পসিবল ডুপ্লিকেট’ দেখানোর কারণ:
জন্ম নিবন্ধনের আবেদন পত্র দাখিল করার পর কোনো আবেদনাধীন ব্যক্তির নাম, পিতার নাম এবং মাতার নাম জন্ম নিবন্ধন ডেটাবেসে সংরক্ষিত কোন নিবন্ধনাধীন ব্যক্তির সঙ্গে হুবহু মিলে গেলে সফটওয়্যার স্বয়ংক্রিয়ভাবে “সম্ভাব্য সদৃশ” বা ‘পসিবল ডুপ্লিকেট’ স্ট্যাটাস দেখায়।

নিম্নে বর্ণিত ৫টি নির্ণায়ক বা ‘প্যারামিটার’ মিলে গেলে ‘পসিবল ডুপ্লিকেট’ ১০০% ‘ডুপ্লিকেট’ হিসাবে প্রতীয়মান হয়:
ক. আবেদনাধীন ব্যক্তির নাম; খ. পিতার নাম; গ. মাতার নাম; ঘ. নিবন্ধন কার্যালয়ের নাম; এবং ঙ. জন্ম তারিখ।

উল্লেখ্য যে ‘পসিবল ডুপ্লিকেট’ হিসাবে চিহ্নিত ব্যক্তিগণের জন্ম তারিখের ব্যবধান ৮ থেকে ১০ বছর বা তার বেশি হলে বা স্থায়ী ঠিকানা না মিললে সেই ক্ষেত্রে ‘ডুপ্লিকেট’ হবার সম্ভাবনা সাধারণত ০% হয়ে যায়।

• ‘পসিবল ডুপ্লিকেট’টি একই জেলায় হলে: অথরাইজড ইউজার বা ক্ষেত্র বিশেষে উপজেলা নির্বাহী অফিসার বা উপপরিচালক (স্থানীয় সরকার) প্রয়োজনীয় অনুসন্ধান বা তদন্ত কিংবা সংশ্লিষ্ট নিবন্ধন অফিসের সঙ্গে যোগাযোগ করে বিষয়টির নিষ্পত্তি করবেন।
• ‘পসিবল ডুপ্লিকেট’টি একই জেলায় না হলে: প্রথমে প্রশাসনিকভাবে ভিন্ন জেলার সাথে যোগাযোগ করে অনুসন্ধান বা তদন্ত করতে হবে। এতে ডুপ্লিকেট হওয়ার অনুকূলে কোনো তথ্য পাওয়া না গেলে আবেদনকারীকে ভালোভাবে জিজ্ঞাসাবাদ করে তার কাছে থেকে অন্যত্র তার জন্ম নিবন্ধন করা হয়নি মর্মে লিখিত নিয়ে আবেদনটি মঞ্জুর করা যেতে পারে। এ ক্ষেত্রে আবেদনের সঙ্গে সংশ্লিষ্ট সকল ডকুমেন্ট সংরক্ষণ করতে হবে (লগ স্থায়ীভাবে সংরক্ষিত থাকবে)।`,
  },
  {
    id: 15,
    question: '১৫। কোন কোন ক্ষেত্রে একজন ব্যক্তির জন্ম নিবন্ধন নম্বর দিয়ে অনুসন্ধান করা হলে সফটওয়্যারে একই নম্বরে একাধিক ব্যক্তিকে দেখায়, এ ক্ষেত্রে করণীয় কী?',
    answer: `অনলাইন জন্ম নিবন্ধনের শুরুতে অসাবধানতা বা অন্যান্য কারণে কোন কোন ক্ষেত্রে একই নম্বর একাধিক ব্যক্তির জন্ম নিবন্ধন নম্বর হিসাবে ব্যবহার করা হয়ে থাকতে পারে। এইরূপ ক্ষেত্রে সংশ্লিষ্ট সকলকে নিবন্ধন অফিসে এনে সম্মতির ভিত্তিতে ঐ নম্বরটি একজনকে বরাদ্দ প্রদান করে অপরজনকে একটি নতুন নম্বর দিয়ে বিষয়টি নিষ্পত্তি করা যেতে পারে। সমঝোতা না হলে যার নিবন্ধন আগে হয়েছে তার জন্য এই নম্বরটি রেখে অপরজনকে নতুন নম্বর বরাদ্দ (reset) করতে হবে। এই অপশনটি BDRIS এর “জন্মতথ্য” মডিউলে “জন্ম নিবন্ধন বিষয় সঠিক করুন” অপশনে গেলে পাওয়া যাবে। সফটওয়্যারে এই অপশনটি শুধু ‘অথরাইজড ইউজার’ পাবেন।

অপর ব্যক্তিকে হাজির করা না গেলে, উপস্থিত ব্যক্তি সম্মত হলে তাকে একটি নতুন নম্বর প্রদান করা যেতে পারে। তদন্ত/অনুসন্ধানে অপর ব্যক্তি অস্তিত্ব-শূন্য প্রমাণিত হলে সেই নিবন্ধনটি বাতিল করতে হবে।`,
  },
  {
    id: 16,
    question: '১৬। জন্ম ও মৃত্যু সনদে মোবাইল নম্বর সংশোধন/সংযোজন কিভাবে করতে হবে?',
    answer: `বর্তমানে BDRIS সিস্টেমে ব্যক্তির জন্ম ও মৃত্যু সনদে মোবাইল নম্বর সংশোধন/সংযোজন করা যাচ্ছে।
• যদি সনদধারী ব্যক্তির নিবন্ধন কার্যালয় ইউনিয়ন পরিষদ হয়: তাহলে উপজেলা নির্বাহী অফিসার এর ইউজার আইডি হতে মোবাইল নম্বর সংশোধন/সংযোজন করা যাবে।
• যদি সনদধারী ব্যক্তির নিবন্ধন কার্যালয় সিটি কর্পোরেশন, ক্যান্টনমেন্ট বোর্ড ও পৌরসভা হয়: সেক্ষেত্রে উপ-পরিচালক, স্থানীয় সরকার, জেলা প্রশাসকের কার্যালয়ের ইউজার আইডি হতে মোবাইল নম্বর সংশোধন/সংযোজন করা যাবে।

এক্ষেত্রে আবেদনকারীকে নিবন্ধন কার্যালয়ে যেতে হবে না; সরাসরি জেলা বা উপজেলা হতে মোবাইল নম্বর সংশোধন/সংযোজন করতে পারবেন। মোবাইল নম্বর সংযোজনের জন্য আবেদনকারীর জন্ম নিবন্ধন সনদ, জাতীয় পরিচয়পত্র (যদি থাকে) অথবা পিতা-মাতার জন্ম নিবন্ধন সনদ বা জাতীয় পরিচয়পত্র নিয়ে সংশ্লিষ্ট জেলা বা উপজেলায় যোগাযোগের জন্য অনুরোধ করা হলো।`,
  },
];

const SERVICE_CARDS = [
  {
    title: 'অনলাইন জন্ম নিবন্ধন আবেদন',
    desc: 'নতুন জন্ম নিবন্ধনের জন্য অনলাইনে সহজে আবেদন দাখিল করুন',
    tag: 'নতুন আবেদন',
    icon: FileSpreadsheet,
    color: 'from-emerald-600 to-green-600',
    prompt: 'সন্তানের জন্ম নিবন্ধনের ক্ষেত্রে বাবা-মায়ের কোন তথ্য প্রয়োজন?',
  },
  {
    title: 'মৃত্যু নিবন্ধন আবেদন',
    desc: 'মৃত্যু সংক্রান্ত তথ্যাদি এন্ট্রি ও অনলাইন সনদের আবেদন ফর্ম',
    tag: 'নাগরিক সেবা',
    icon: FileCheck2,
    color: 'from-teal-600 to-cyan-600',
    prompt: 'মৃত্যু নিবন্ধন করার আগে জন্ম নিবন্ধন থাকা কি প্রয়োজন?',
  },
  {
    title: 'জন্ম নিবন্ধন ১৭ ডিজিটে উন্নীতকরণ',
    desc: 'পুরাতন সনদ জমা দিয়ে ১৭ ডিজিটের ডিজিটাল নম্বর গ্রহণ',
    tag: 'ভেরিফিকেশন',
    icon: ShieldCheck,
    color: 'from-blue-600 to-indigo-600',
    prompt: '১৭ ডিজিটের কম জন্ম নিবন্ধন নম্বরকে কীভাবে ১৭ ডিজিটে উন্নীত করা যায়?',
  },
  {
    title: 'সনদ ও মোবাইল নম্বর সংশোধন',
    desc: 'নাম, মোবাইল নম্বর বা অন্যান্য তথ্যের ভুল সংশোধন প্রক্রিয়া',
    tag: 'সংশোধন',
    icon: Layers,
    color: 'from-amber-600 to-orange-600',
    prompt: 'জন্ম ও মৃত্যু সনদে মোবাইল নম্বর সংশোধন বা সংযোজন করা যায় কি?',
  },
];

const CITIZEN_NOTICES = [
  {
    id: 1,
    tag: 'বাধ্যতামূলক',
    tagColor: 'bg-red-600',
    text: 'জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী সন্তান জন্মের ৪৫ দিনের মধ্যে নিবন্ধন সম্পন্ন করা বাধ্যতামূলক।',
    prompt: 'জন্ম নিবন্ধন কি সবার জন্য বাধ্যতামূলক?',
  },
  {
    id: 2,
    tag: 'জরিমানা বিধিমালা',
    tagColor: 'bg-amber-700',
    text: ' ধারা ৫(১), ৬ক এবং ৮(১) লঙ্ঘন করলে অনধিক ৫,০০০ টাকা অর্থদণ্ডে দণ্ডিত হতে পারেন।',
    prompt: 'জন্ম নিবন্ধন না করলে সর্বোচ্চ কত টাকা জরিমানা হতে পারে?',
  },
  {
    id: 3,
    tag: '১৯টি ক্ষেত্রে ব্যবহার',
    tagColor: 'bg-emerald-700',
    text: ' বিদ্যালয়ে ভর্তি, পাসপোর্ট, জাতীয় পরিচয়পত্রসহ ১৯টি জরুরি নাগরিক সেবায় ডিজিটাল জন্ম সনদ আবশ্যক।',
    prompt: 'কোন কোন ক্ষেত্রে জন্ম সনদ প্রয়োজন হয়?',
  },
  {
    id: 4,
    tag: 'ফ্যামিলি ট্রি ও মোবাইল নম্বর',
    tagColor: 'bg-blue-700',
    text: ' সফটওয়্যারে একটি মোবাইল নম্বর দিয়ে পরিবারের সর্বোচ্চ ৫ জন সদস্যের নিবন্ধনের ব্যবস্থা রয়েছে।',
    prompt: 'একটি মোবাইল নম্বর দিয়ে সর্বোচ্চ কতজন পরিবারের সদস্যের নিবন্ধন করা যায়?',
  },
];

export default function HomePage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDefaultPrompt, setChatDefaultPrompt] = useState<string | undefined>(undefined);
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);

  // Sequential Notice State: When one ends, the next one arrives from the right
  const [noticeIdx, setNoticeIdx] = useState(0);

  const handleNextNotice = () => {
    setNoticeIdx((prev) => (prev + 1) % CITIZEN_NOTICES.length);
  };

  // Load live FAQs & health check
  useEffect(() => {
    async function loadData() {
      try {
        const liveFaqs = await adminApi.getFaqs();
        if (liveFaqs && liveFaqs.length > 0) {
          // If live FAQs from backend, ensure they merge or default to full 16 items
          setFaqs(liveFaqs.length >= DEFAULT_FAQS.length ? liveFaqs : DEFAULT_FAQS);
        }
      } catch {
        // Fallback to rich default FAQs
      }

      try {
        const health = await systemApi.getHealth();
        setSystemOnline(health?.status === 'ok' || health?.status === 'healthy');
      } catch {
        setSystemOnline(true);
      }
    }
    loadData();
  }, []);

  const openChatWithPrompt = (promptText: string) => {
    setChatDefaultPrompt(promptText);
    setChatOpen(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openChatWithPrompt(searchQuery);
    } else {
      setChatOpen(true);
    }
  };

  const currentNotice = CITIZEN_NOTICES[noticeIdx];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800 antialiased selection:bg-emerald-200">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      {/* Hero & Citizen Search Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 text-white overflow-hidden py-12 md:py-16">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-4 backdrop-blur-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>কৃত্রিম বুদ্ধিমত্তা সম্পন্ন নাগরিক সহায়তা প্ল্যাটফর্ম</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-snug">
            স্মার্ট জন্ম ও মৃত্যু নিবন্ধন সহায়তা এবং তাৎক্ষণিক নাগরিক সেবা
          </h1>

          <p className="mt-4 text-xs sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত আইন, সরকারি বিধিমালা, আবেদন প্রক্রিয়া এবং যেকোনো প্রশ্নের তাৎক্ষণিক সঠিক উত্তর পেতে আমাদের এআই সহকারীকে জিজ্ঞাসা করুন।
          </p>

          {/* Citizen Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-2xl mx-auto relative flex items-center bg-white/95 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md border border-white/20 focus-within:ring-4 focus-within:ring-emerald-400/40 transition-all"
          >
            <div className="pl-3.5 pr-2 text-emerald-700">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো প্রশ্ন লিখুন..."
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-2.5 px-2"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>সন্ধান করুন</span>
            </button>
          </form>

          {/* Quick prompt suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-200">
            <span className="opacity-80">জনপ্রিয় জিজ্ঞাসা:</span>
            <button
              onClick={() => openChatWithPrompt('জন্ম নিবন্ধন কি সবার জন্য বাধ্যতামূলক?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              বাধ্যতামূলক কিনা?
            </button>
            <button
              onClick={() => openChatWithPrompt('কোন কোন ক্ষেত্রে জন্ম সনদ প্রয়োজন হয়?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              সনদের ব্যবহারক্ষেত্র
            </button>
            <button
              onClick={() => openChatWithPrompt('ম্যানুয়াল জন্ম নিবন্ধন অনলাইনে অন্তর্ভুক্ত করার সুযোগ আছে কি?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              ম্যানুয়াল থেকে অনলাইন
            </button>
            <button
              onClick={() => openChatWithPrompt('Family Tree পদ্ধতি কী এবং কেন ব্যবহার করা হচ্ছে?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              Family Tree পদ্ধতি
            </button>
          </div>
        </div>
      </section>

      {/* Sequential Notice Banner (One Ends -> Next One Arrives from Right) */}
      <section className="bg-amber-100/95 border-y border-amber-300 text-amber-950 py-2.5 px-3 sm:px-4 shadow-xs overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Static Alert Badge */}
          <div className="flex items-center gap-2 shrink-0 z-10 bg-amber-100/95 pr-2">
            <span className="bg-red-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-md uppercase tracking-wide shrink-0 animate-pulse shadow-xs">
              জরুরি প্রজ্ঞাপন
            </span>
          </div>

          {/* Sequential Scrolling Track: Notice arrives from right, crosses to left, then ends & triggers next */}
          <div
            className="flex-1 overflow-hidden relative cursor-pointer group"
            title="ক্লিক করে এই সংক্রান্ত তথ্য জানুন (মাউস রাখলে স্ক্রল থামবে)"
            onClick={() => openChatWithPrompt(currentNotice.prompt)}
          >
            <div
              key={noticeIdx}
              onAnimationEnd={handleNextNotice}
              className="animate-notice-across whitespace-nowrap text-sm sm:text-base md:text-lg font-bold text-amber-950 flex items-center gap-3"
            >
              <span className={`text-[10px] sm:text-xs font-bold text-white px-2 py-0.5 rounded-sm shrink-0 ${currentNotice.tagColor}`}>
                {currentNotice.tag}
              </span>
              <span>{currentNotice.text}</span>
              <span className="text-emerald-700 text-xs font-semibold bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded-md ml-2 shrink-0">
                বিস্তারিত জানুন 
              </span>
            </div>
          </div>

          {/* Action Link Button */}
          <div className="flex items-center shrink-0 z-10 bg-amber-100/95 pl-2">
            <button
              onClick={() => openChatWithPrompt(currentNotice.prompt)}
              className="text-emerald-800 hover:text-emerald-950 font-bold shrink-0 underline text-xs sm:text-sm transition-colors"
            >
              আইন জানুন →
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Service Cards Grid */}
        <section id="services">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-2 border-b border-gray-200">
            <div>
              <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">নাগরিক সেবা কর্নার</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                প্রয়োজনীয় সেবা এবং এআই নির্দেশিকা
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 md:mt-0">
              যেকোনো সেবায় ক্লিক করে সরাসরি এআই সহায়কের কাছে তথ্য ও নিয়ম জেনে নিন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_CARDS.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => openChatWithPrompt(card.prompt)}
                  className="group bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                        {card.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                    <span>এআই সহায়ক জানুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modern Feature Showcase Section (Inspired by User's Reference Layout) */}
        <section id="features" className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50/80 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-50/80 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Side: Overlapping Modern Images */}
            <div className="lg:col-span-6 relative pb-6 sm:pb-8">
              {/* Primary Background Card Image */}
              <div className="relative w-[86%] sm:w-[82%] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/15 border-4 border-white bg-slate-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/features/service_center.jpg"
                  alt="ডিজিটাল জন্ম ও মৃত্যু নিবন্ধন নাগরিক সেবা কেন্দ্র"
                  className="w-full h-64 sm:h-80 md:h-92 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent"></div>
              </div>

              {/* Overlapping Elevated Portrait Image (Shifted bottom-right) */}
              <div className="absolute right-0 bottom-0 w-[56%] sm:w-[52%] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/30 border-4 border-white bg-slate-100 group z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/features/ai_consultant.jpg"
                  alt="স্মার্ট জন্ম ও মৃত্যু নিবন্ধন এআই বিশেষজ্ঞ"
                  className="w-full h-56 sm:h-72 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-transparent to-transparent"></div>

                {/* Overlay chip on bottom of consultant */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/60 shadow-md flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></div>
                  <span className="text-[11px] font-bold text-slate-900 leading-tight">
                    BDRIS ২০২৪ বিধিমালা সংযুক্ত
                  </span>
                </div>
              </div>

              {/* Decorative Floating Sparkle Badge */}
              <div className="absolute -top-3 left-6 sm:left-10 bg-gradient-to-r from-emerald-700 to-green-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>স্মার্ট এআই প্ল্যাটফর্ম</span>
              </div>
            </div>

            {/* Right Side: Features Content & Action Bar */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <span className="inline-block text-emerald-700 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 mb-2">
                  আমাদের উন্নত বৈশিষ্ট্যসমূহ • SMART AI SYSTEM
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  বিশ্বস্ত ও আধুনিক এআই-চালিত জন্ম ও মৃত্যু নিবন্ধন সহকারী
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                আমাদের কৃত্রিম বুদ্ধিমত্তা চালিত প্ল্যাটফর্মটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ এবং সর্বশেষ সংশোধিত বিধিমালা অনুসারে নাগরিকদের প্রতিটি প্রশ্নের তাৎক্ষণিক, নির্ভরযোগ্য ও আইনি দিকনির্দেশনা প্রদান করে। কোনো জটিলতা ছাড়াই সহজেই জেনে নিন সঠিক নিয়ম ও সরকারি ফি সংক্রান্ত যেকোনো তথ্য।
              </p>

              {/* Feature Points with Green Checkmark Circles (Matching Reference Layout) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    দ্রুত ও নির্ভুল কৃত্রিম বুদ্ধিমত্তা সম্পন্ন তাৎক্ষণিক আইনি পরামর্শ এবং রিয়েল-টাইম সমাধান।
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    পিতা-মাতা, দ্বৈত নাম, জমজ সন্তান, ও তথ্য সংশোধন সংক্রান্ত স্বয়ংক্রিয় নির্দেশিকা।
                  </span>
                </div>

                
              </div>

              {/* Bottom Action Bar (Hotline + Action Button matching Reference Layout) */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Main Action CTA Button */}
                <button
                  onClick={() => setChatOpen(true)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>এআই সহকারীর সাথে কথা বলুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Guidelines & Act Highlights */}
        <section id="guidelines" className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-2xl text-white p-6 md:p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                <Scale className="w-3 h-3" />
                আইনি বাধ্যবাধকতা
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী ১৯টি জরুরি ক্ষেত্রে সনদের প্রয়োজনীয়তা
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                পাসপোর্ট ইস্যু, জাতীয় পরিচয়পত্র প্রাপ্তি, সকল স্তরের শিক্ষাপ্রতিষ্ঠানে ভর্তি, সরকারি-বেসরকারি চাকরি প্রাপ্তি, ড্রাইভিং লাইসেন্স, জমি রেজিস্ট্রেশন ও ব্যাংক একাউন্ট খোলার মতো প্রতিটি ক্ষেত্রে সঠিক জন্ম নিবন্ধন অপরিহার্য।
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center space-y-2">
              <span className="text-xs text-emerald-200 font-semibold">তাৎক্ষণিক সহায়তা প্রয়োজন?</span>
              <p className="text-sm font-bold text-amber-300">হটলাইন: ১৬১২২ অথবা ৩৩৩</p>
              <button
                onClick={()=>window.open('https://bdris.gov.bd/contact')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold py-2 rounded-lg transition-colors"
              >
                যোগাযোগ করুন
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Chatbot Widget in Bottom-Right Corner */}
      <FloatingChatWidget
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => {
          setChatOpen(false);
          setChatDefaultPrompt(undefined);
        }}
        defaultPrompt={chatDefaultPrompt}
        onPromptConsumed={() => setChatDefaultPrompt(undefined)}
      />
    </div>
  );
}
