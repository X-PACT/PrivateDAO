"use client";

import { HeartHandshake } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";

const localizedMessage = {
  en: {
    title: "Built as infrastructure, not a competition-only artifact",
    body:
      "This product was built in the true spirit of Solana frontier innovation: identify real ecosystem pain points and engineer operational infrastructure that organizations, DAOs, and AI-native systems can use in production. The support of trusted reviewers, ecosystem catalysts, and foundational supporters accelerates this mission and strengthens confidence in the next generation of Solana builders.",
  },
  ar: {
    title: "تم بناء المنتج كبنية تشغيلية حقيقية وليس كمخرج مسابقة فقط",
    body:
      "تم بناء هذا المنتج على روح الابتكار الحقيقي في سولانا: تحديد فجوات تشغيلية مؤلمة في الايكوسيستم ثم هندسة بنية تحتية عملية تخدم المنظمات وDAOs والأنظمة المدعومة بالذكاء الاصطناعي. دعم المراجعين الموثوقين وقادة الايكوسيستم والشركاء الداعمين يسرّع المهمة ويعزز ثقة المجتمع في الجيل القادم من مطوري سولانا.",
  },
  ru: {
    title: "Построено как реальный продукт, а не только хакатонный артефакт",
    body:
      "Этот продукт создан по базовым принципам хакатона: делать реальные решения из ключевых потребностей фондов, грантодателей и аудиторов, с практической пользой для блокчейн-экосистемы. Наша политика проста: мы построили реальное решение для реальной боли. Ваше признание дает нам максимальный импульс двигаться быстрее и укрепляет доверие сообществ к разработчикам Solana, которые поддерживают талант и поставляют полезную инфраструктуру.",
  },
  uk: {
    title: "Створено як реальний продукт, а не лише хакатонний артефакт",
    body:
      "Цей продукт побудований на базових принципах хакатону: створювати реальні рішення з найважливіших потреб фондів, грантових програм і аудиторів, з практичною цінністю для блокчейн-екосистеми. Наша політика проста: ми створили реальне рішення для реального болю. Ваше визнання дає нам найбільший імпульс рухатися швидше та посилює довіру спільнот до розробників Solana, які підтримують талант і запускають корисну інфраструктуру.",
  },
  pl: {
    title: "Zbudowane jako realny produkt, a nie tylko artefakt konkursowy",
    body:
      "Ten produkt powstał w oparciu o kluczowe zasady hackathonu: tworzyć realne rozwiązania z najważniejszych potrzeb fundatorów, grantodawców i audytorów, z praktyczną wartością dla ekosystemu blockchain. Nasza polityka jest prosta: zbudowaliśmy realne rozwiązanie dla realnego problemu. Wasze uznanie daje nam najsilniejszy impuls do szybszego działania i buduje zaufanie społeczności do deweloperów Solana, którzy wspierają talenty i dostarczają użyteczną infrastrukturę.",
  },
  hi: {
    title: "यह केवल प्रतियोगिता नहीं, एक वास्तविक उत्पाद के रूप में बनाया गया है",
    body:
      "यह उत्पाद हैकाथॉन के मूल सिद्धांतों पर बनाया गया है: फंडर, ग्रांट प्रोग्राम और ऑडिटर की सबसे महत्वपूर्ण जरूरतों से वास्तविक उत्पाद बनाना, ताकि ब्लॉकचेन इकोसिस्टम को वास्तविक उपयोगिता मिले। हमारी नीति स्पष्ट है: हमने वास्तविक समस्या के लिए वास्तविक समाधान बनाया है। आपकी मान्यता हमें तेज़ी से आगे बढ़ने की सबसे बड़ी प्रेरणा देती है और Solana डेवलपर्स पर समुदाय का भरोसा मजबूत करती है, जो प्रतिभा को समर्थन देकर उपयोगी इंफ्रास्ट्रक्चर बनाते हैं।",
  },
  ko: {
    title: "대회용 산출물이 아니라 실제 제품으로 구축했습니다",
    body:
      "이 제품은 해커톤의 핵심 원칙에 따라 구축되었습니다. 후원자, 그랜트 프로그램, 감사자의 핵심 요구를 바탕으로 블록체인 생태계에 실제로 필요한 제품을 만드는 것입니다. 우리의 정책은 명확합니다. 우리는 실제 문제를 해결하는 실제 제품을 만들었습니다. 여러분의 인정은 더 빠르게 전진할 가장 큰 동력이며, 재능을 지원하고 실질 인프라를 제공하는 Solana 개발자에 대한 커뮤니티 신뢰를 높입니다.",
  },
  es: {
    title: "Construido como infraestructura real, no solo como entrega de concurso",
    body:
      "Este producto se construyó sobre principios centrales de hackathon: crear productos reales a partir de necesidades reales de financiadores, grant programs y auditores, con utilidad concreta para el ecosistema blockchain. Nuestra política es clara: construimos una solución real para un dolor real. Su reconocimiento nos da el mayor impulso para acelerar y fortalece la confianza de las comunidades en los desarrolladores de Solana que apoyan el talento y entregan infraestructura útil.",
  },
  it: {
    title: "Costruito come infrastruttura reale, non solo come artefatto da competizione",
    body:
      "Questo prodotto è stato costruito sui principi fondamentali dell'hackathon: creare prodotti reali partendo dai bisogni reali di finanziatori, programmi grant e auditor, con valore pratico per l'ecosistema blockchain. La nostra politica è semplice: abbiamo costruito una soluzione reale per un problema reale. Il vostro riconoscimento ci dà la spinta più forte per accelerare e rafforza la fiducia delle community negli sviluppatori Solana che sostengono il talento e rilasciano infrastruttura utile.",
  },
} as const;

export function JudgeFoundationMessageCard() {
  const { locale } = useI18n();
  const message = localizedMessage[locale];

  return (
    <div className="rounded-[26px] border border-emerald-300/16 bg-emerald-300/[0.07] p-5">
      <div className="flex items-center gap-2 text-emerald-100">
        <HeartHandshake className="h-4 w-4" />
        <div className="text-[11px] uppercase tracking-[0.24em]">Ecosystem message</div>
      </div>
      <h3 className="mt-3 text-xl font-semibold text-white">{message.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/66">{message.body}</p>
    </div>
  );
}
