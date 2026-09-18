"use client";

import { ArrowUpRight, Check } from "lucide-react";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";

const copy = {
  en: {
    eyebrow: "Privacy for important organizational work",
    title: "Your private work should stay private.",
    body: "Salaries. Decisions. Approvals. Bids. Financial records. Organizations should not have to make sensitive information public just to work with confidence.",
    solutions: "See the solutions",
    contact: "Talk to PrivateDAO",
    checks: ["Keep sensitive work private", "Approve with confidence", "Share only what matters"],
  },
  ar: {
    eyebrow: "الخصوصية للعمل المؤسسي المهم",
    title: "يجب أن يظل عملك الخاص خاصًا.",
    body: "الرواتب والقرارات والموافقات والعروض والسجلات المالية لا يجب أن تصبح عامة لمجرد أن مؤسستك تستخدم البلوك تشين.",
    solutions: "استكشف الحلول",
    contact: "تواصل مع PrivateDAO",
    checks: ["احمِ العمل الحساس", "وافق بثقة", "شارك ما يلزم فقط"],
  },
  ru: {
    eyebrow: "Конфиденциальность для важной работы организации",
    title: "Ваша закрытая работа должна оставаться закрытой.",
    body: "Зарплаты, решения, согласования, ставки и финансовые записи не должны становиться публичными только потому, что организация использует блокчейн.",
    solutions: "Посмотреть решения",
    contact: "Связаться с PrivateDAO",
    checks: ["Сохраняйте рабочие данные закрытыми", "Согласовывайте уверенно", "Делитесь только необходимым"],
  },
  uk: {
    eyebrow: "Приватність для важливої роботи організації",
    title: "Ваша приватна робота має залишатися приватною.",
    body: "Зарплати, рішення, погодження, ставки та фінансові записи не повинні ставати публічними лише тому, що організація використовує блокчейн.",
    solutions: "Переглянути рішення",
    contact: "Зв'язатися з PrivateDAO",
    checks: ["Зберігайте робочі дані приватними", "Погоджуйте впевнено", "Діліться лише необхідним"],
  },
  pl: {
    eyebrow: "Prywatność ważnej pracy organizacji",
    title: "Twoja prywatna praca powinna pozostać prywatna.",
    body: "Pensje, decyzje, zgody, oferty i dane finansowe nie muszą być publiczne tylko dlatego, że organizacja korzysta z blockchaina.",
    solutions: "Zobacz rozwiązania",
    contact: "Porozmawiaj z PrivateDAO",
    checks: ["Chroń wrażliwe dane", "Zatwierdzaj z pewnością", "Udostępniaj tylko to, co ważne"],
  },
  hi: {
    eyebrow: "महत्वपूर्ण संगठनात्मक काम के लिए गोपनीयता",
    title: "आपका निजी काम निजी ही रहना चाहिए।",
    body: "वेतन, निर्णय, अनुमोदन, बोलियां और वित्तीय रिकॉर्ड केवल ब्लॉकचेन उपयोग करने के कारण सार्वजनिक नहीं होने चाहिए।",
    solutions: "समाधान देखें",
    contact: "PrivateDAO से बात करें",
    checks: ["संवेदनशील काम निजी रखें", "विश्वास के साथ अनुमोदन करें", "केवल जरूरी जानकारी साझा करें"],
  },
  ko: {
    eyebrow: "중요한 조직 업무를 위한 프라이버시",
    title: "당신의 비공개 업무는 비공개로 남아야 합니다.",
    body: "급여, 의사결정, 승인, 입찰, 재무 기록은 조직이 블록체인을 사용한다는 이유만으로 공개될 필요가 없습니다.",
    solutions: "솔루션 보기",
    contact: "PrivateDAO에 문의",
    checks: ["민감한 업무를 비공개로 유지", "확신을 가지고 승인", "필요한 것만 공유"],
  },
  es: {
    eyebrow: "Privacidad para el trabajo importante de tu organización",
    title: "Tu trabajo privado debe seguir siendo privado.",
    body: "Los salarios, las decisiones, las aprobaciones, las ofertas y los registros financieros no tienen que hacerse públicos solo porque tu organización use blockchain.",
    solutions: "Ver las soluciones",
    contact: "Hablar con PrivateDAO",
    checks: ["Mantén privado el trabajo sensible", "Aprueba con confianza", "Comparte solo lo necesario"],
  },
  it: {
    eyebrow: "Privacy per il lavoro importante della tua organizzazione",
    title: "Il tuo lavoro privato deve restare privato.",
    body: "Stipendi, decisioni, approvazioni, offerte e registri finanziari non devono diventare pubblici solo perché la tua organizzazione usa la blockchain.",
    solutions: "Scopri le soluzioni",
    contact: "Parla con PrivateDAO",
    checks: ["Mantieni privato il lavoro sensibile", "Approva con fiducia", "Condividi solo ciò che serve"],
  },
} as const;

export function CommercialHeroCopy() {
  const { selectedLocale } = useI18n();
  const content = copy[selectedLocale] ?? copy.en;

  return (
    <>
      <div className="commercial-eyebrow"><span className="commercial-eyebrow-dot" /> {content.eyebrow}</div>
      <h1 className="commercial-display mt-6 max-w-4xl">{content.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#52647d] sm:text-xl">{content.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="#solutions" className="commercial-primary-cta">{content.solutions} <ArrowUpRight className="h-4 w-4" /></Link>
        <Link href="/contact" className="commercial-secondary-cta">{content.contact}</Link>
      </div>
      <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#52647d]">
        {content.checks.map((item) => <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#d64545]" />{item}</span>)}
      </div>
    </>
  );
}
