export const supportedLocales = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", dir: "ltr" },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська", dir: "ltr" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", dir: "ltr" },
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];
export type LocaleDirection = (typeof supportedLocales)[number]["dir"];

export const defaultLocale: SupportedLocale = "en";
export const localeStorageKey = "privatedao.locale";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.some((locale) => locale.code === value);
}

export function resolveLocale(value?: string | null): SupportedLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export function getLocaleDefinition(locale: SupportedLocale) {
  return supportedLocales.find((item) => item.code === locale) ?? supportedLocales[0]!;
}

type ChromeTranslations = {
  start: string;
  learn: string;
  govern: string;
  liveState: string;
  story: string;
  trust: string;
  products: string;
  apiPricing: string;
  network: string;
  docs: string;
  community: string;
  help: string;
  search: string;
  openApp: string;
  searchSite: string;
  createPrivateDaoTagline: string;
  footerSummary: string;
  footerSupport: string;
  verificationView: string;
  fastPath: string;
  telemetryPacket: string;
  leadershipContact: string;
  repository: string;
  currentLiveSite: string;
  androidApk: string;
  storyVideo: string;
  youtube: string;
  discord: string;
  showMoreLinks: string;
  hideMoreLinks: string;
  language: string;
};

type ShellTranslations = {
  explore: string;
  productNavigation: string;
  userFirstRoutes: string;
  systemRails: string;
  openGovern: string;
  openLiveState: string;
  openCuratedDocs: string;
  startTheFlow: string;
  openTrustOnlyIfNeeded: string;
};

type RouteSummaryTranslations = {
  label: string;
  title: string;
  body: string;
};

type PrivacyPolicyTranslations = {
  eyebrow: string;
  title: string;
  description: string;
  bestFit: string;
  runPolicy: string;
  verifyPolicy: string;
  policies: Array<{
    key: "reviewer" | "committee" | "payout" | "disclosure";
    title: string;
    tech: string;
    summary: string;
  }>;
};

type SdkStarterTranslations = {
  eyebrow: string;
  title: string;
  description: string;
  openStarter: string;
  openCode: string;
  cards: Array<{
    key: "browser" | "readApi" | "policy" | "disclosure";
    title: string;
    summary: string;
  }>;
};

type RouteBriefTranslations = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

type SelectiveDisclosureTranslations = {
  eyebrow: string;
  title: string;
  description: string;
  stepsLabel: string;
  privateLabel: string;
  publicLabel: string;
  openTrust: string;
  openGuide: string;
  openReviewLane: string;
  scenarios: Array<{
    key: "auditor" | "committee" | "partner" | "incident";
    title: string;
    summary: string;
  }>;
  steps: string[];
  privateItems: string[];
  publicItems: string[];
};

type LocalizedCopy = {
  chrome: ChromeTranslations;
  shell: ShellTranslations;
  routeSummaries: Record<"start" | "services" | "products" | "learn" | "judge" | "proof", RouteSummaryTranslations>;
  privacySelector: PrivacyPolicyTranslations;
  sdkStarter: SdkStarterTranslations;
  routeBriefs: Record<"security" | "products" | "learn" | "servicesStarter", RouteBriefTranslations>;
  selectiveDisclosure: SelectiveDisclosureTranslations;
};

const routeSummaryHrefByKey: Record<keyof LocalizedCopy["routeSummaries"], string> = {
  start: "/start",
  services: "/services",
  products: "/products",
  learn: "/learn",
  judge: "/judge",
  proof: "/proof",
};

export function getRouteSummaryHref(routeKey: keyof LocalizedCopy["routeSummaries"]) {
  return routeSummaryHrefByKey[routeKey];
}

const englishCopy: LocalizedCopy = {
  chrome: {
    start: "Start",
    learn: "Learn",
    govern: "Govern",
    liveState: "Live State",
    story: "Story",
    trust: "Trust",
    products: "Products",
    apiPricing: "API & Pricing",
    network: "Network",
    docs: "Docs",
    community: "Community",
    help: "Help",
    search: "Search",
    openApp: "Open App",
    searchSite: "Search the app, docs, or live proof",
    createPrivateDaoTagline: "Create a private Solana DAO, propose, vote, and execute in one wallet-first flow",
    footerSummary:
      "PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and clear verification surfaces.",
    footerSupport:
      "Built with execution support from a multi-national technical team. Product direction, execution accountability, and external coordination are led by Fahd Kotb.",
    verificationView: "Verification view",
    fastPath: "Fast path",
    telemetryPacket: "Telemetry packet",
    leadershipContact: "Leadership and contact",
    repository: "Repository",
    currentLiveSite: "Current live site",
    androidApk: "Android APK",
    storyVideo: "Story video",
    youtube: "YouTube",
    discord: "Discord",
    showMoreLinks: "Show more links",
    hideMoreLinks: "Hide more links",
    language: "Language",
  },
  shell: {
    explore: "Explore",
    productNavigation: "Product navigation",
    userFirstRoutes: "User-first routes for onboarding, governance, proof, support, and live product state.",
    systemRails: "System rails",
    openGovern: "Open govern",
    openLiveState: "Open live state",
    openCuratedDocs: "Open curated docs",
    startTheFlow: "Start the flow",
    openTrustOnlyIfNeeded: "Open trust only if needed",
  },
  routeSummaries: {
    start: {
      label: "Route summary",
      title: "Connect a Devnet wallet, run one real flow, then inspect the evidence",
      body: "This start route is the shortest path for a normal user: connect a wallet, move into governance, then open proof and logs without terminal work.",
    },
    services: {
      label: "Route summary",
      title: "Use PrivateDAO like infrastructure, not like a static brochure",
      body: "This services route explains hosted reads, privacy policies, payout corridors, and the integration starter needed to plug the product into real organizations.",
    },
    products: {
      label: "Route summary",
      title: "Browse the product corridors that can be sold, integrated, and reviewed",
      body: "This product route groups the real operational lanes: private governance, confidential payouts, gaming control, agentic treasury execution, and runtime APIs.",
    },
    learn: {
      label: "Route summary",
      title: "Learn in minutes, then run advanced blockchain operations from the UI",
      body: "This learning route is a live bootcamp: understand the wallet-first model, test the matching route, and verify the resulting Devnet hashes and logs immediately.",
    },
    judge: {
      label: "Route summary",
      title: "Review the product in plain language, then open the same proofs yourself",
      body: "This judge route is built for fast verification: governance lifecycle, privacy explanation, transaction evidence, and generated packets stay one click away.",
    },
    proof: {
      label: "Route summary",
      title: "See what stays private, what becomes public, and how the chain proves it",
      body: "This proof route turns privacy into something inspectable: public hashes, runtime logs, and proof packets stay visible while sensitive intent remains protected until the right stage.",
    },
  },
  privacySelector: {
    eyebrow: "Privacy policy selector",
    title: "Choose the privacy posture that matches the operation",
    description:
      "PrivateDAO is strongest when the privacy boundary is explicit. Pick the policy that fits the action, then open the matching route and proof path.",
    bestFit: "Best fit now",
    runPolicy: "Run this policy",
    verifyPolicy: "Verify this policy",
    policies: [
      {
        key: "reviewer",
        title: "Reviewer-visible proof",
        tech: "by ZK anchors + explorer evidence",
        summary: "Best when judges, buyers, or community reviewers must follow every public hash while sensitive inputs stay abstracted.",
      },
      {
        key: "committee",
        title: "Committee-private voting",
        tech: "by commit-reveal + ZK voting",
        summary: "Best when vote intent should stay hidden until reveal, while final execution remains auditable on Devnet.",
      },
      {
        key: "payout",
        title: "Confidential treasury payout",
        tech: "by REFHE + MagicBlock corridors",
        summary: "Best for payroll, grants, rewards, or vendor payouts where amount logic and intent need stronger protection.",
      },
      {
        key: "disclosure",
        title: "Selective disclosure",
        tech: "by custody trail + narrow reviewer window",
        summary: "Best when an operator needs a bounded reviewer or institutional audit path without exposing every internal detail publicly.",
      },
    ],
  },
  sdkStarter: {
    eyebrow: "Privacy SDK / API starter",
    title: "Start integrating the privacy layer without rebuilding the protocol",
    description:
      "This starter route turns the current product into an integration surface: browser SDK patterns, hosted read contracts, privacy policy binding, and selective disclosure handoff.",
    openStarter: "Open starter route",
    openCode: "Open code",
    cards: [
      {
        key: "browser",
        title: "Browser SDK starter",
        summary: "Wrap wallet connection, signer state, and privacy policy selection in one consumer-ready frontend starter.",
      },
      {
        key: "readApi",
        title: "Hosted read API contract",
        summary: "Use the read-node and telemetry patterns to surface governance, payout, and diagnostics state without forcing the client to parse raw chain data alone.",
      },
      {
        key: "policy",
        title: "Privacy policy binding",
        summary: "Bind user actions to reviewer-visible, committee-private, or confidential payout policies before the wallet signs.",
      },
      {
        key: "disclosure",
        title: "Selective disclosure handoff",
        summary: "Prepare a narrow reviewer path for audit, custody, or enterprise checks without flattening the protected workflow into a public spreadsheet.",
      },
    ],
  },
  routeBriefs: {
    security: {
      eyebrow: "Security route brief",
      title: "Security is where privacy claims, custody discipline, and runtime evidence meet one operating surface",
      description:
        "This route is not an audit appendix. It is the operator view for how PrivateDAO protects proposal intent, payout execution, wallet signing, custody posture, and reviewer visibility without flattening the product into a spreadsheet.",
      bullets: [
        "Use it to explain the cryptographic stack in plain language before a reviewer opens packets.",
        "Use it to choose the right privacy posture before a treasury or governance action starts.",
        "Use it to show what is proven now on Devnet and what still remains gated for institutional closure.",
      ],
    },
    products: {
      eyebrow: "Product route brief",
      title: "Products are grouped by the operational pain they remove, not by internal protocol modules",
      description:
        "This route should read like a real infrastructure catalog: private governance, confidential payouts, gaming operations, reviewer-safe disclosure, and reusable read/API surfaces.",
      bullets: [
        "Open this route when a buyer needs the shortest explanation of what PrivateDAO sells.",
        "Keep the explanation tied to live Devnet flows, not abstract architecture diagrams.",
        "Use the privacy selector and SDK starter here as the bridge from product story to implementation.",
      ],
    },
    learn: {
      eyebrow: "Learning route brief",
      title: "The learning corridor should move a normal builder into live Devnet action in the same session",
      description:
        "This route now teaches the stack through product surfaces: wallet-first UX, governance lifecycle, runtime reads, private payouts, selective disclosure, and proof-linked verification.",
      bullets: [
        "Every lecture should end in a real route and a real verification path.",
        "The student should learn what stays private, what becomes public, and why.",
        "The same route should stay useful for judges, operators, and non-terminal users.",
      ],
    },
    servicesStarter: {
      eyebrow: "Integration route brief",
      title: "The starter route should feel like an integration contract, not a vague ecosystem page",
      description:
        "This route packages the current live product into integration-ready building blocks: browser wallet entry, hosted reads, privacy policy selection, and selective disclosure handoff for audit or enterprise review.",
      bullets: [
        "Start with the browser starter if the partner needs a wallet-first front end.",
        "Use the hosted read contract when the partner needs runtime state and telemetry without parsing raw chain data.",
        "Use selective disclosure when the partner must review sensitive execution without opening the full internal workflow.",
      ],
    },
  },
  selectiveDisclosure: {
    eyebrow: "Selective disclosure",
    title: "Give reviewers a narrow window into the operation without turning private work into public exposure",
    description:
      "Selective disclosure is the bridge between strong privacy and institutional review. It decides what the operator can keep private, what the reviewer can inspect, and which links are enough to prove the action happened correctly on Devnet.",
    stepsLabel: "How the handoff works",
    privateLabel: "Private until the right boundary",
    publicLabel: "Visible for review and verification",
    openTrust: "Open trust route",
    openGuide: "Open privacy guide",
    openReviewLane: "Open matching review lane",
    scenarios: [
      {
        key: "auditor",
        title: "Auditor review",
        summary: "Use this when an external reviewer needs a bounded proof path for governance or treasury actions without reading the full internal operating log.",
      },
      {
        key: "committee",
        title: "Committee oversight",
        summary: "Use this when a DAO committee needs evidence that a decision path stayed valid while vote intent or payout details remained protected until the approved stage.",
      },
      {
        key: "partner",
        title: "Partner due diligence",
        summary: "Use this when a grant partner, buyer, or infrastructure supporter needs enough visibility to trust the flow without receiving every operational detail.",
      },
      {
        key: "incident",
        title: "Incident response lane",
        summary: "Use this when a signer, payout, or governance incident needs a narrow evidence packet that preserves operational privacy while still showing the chain trail.",
      },
    ],
    steps: [
      "Choose the privacy posture before the wallet signs.",
      "Run the governance or treasury action on Devnet.",
      "Open the proof and custody routes that match that action.",
      "Disclose only the hashes, logs, and reviewer packet needed for that review window.",
    ],
    privateItems: [
      "vote intent before reveal",
      "sensitive payout reasoning and internal operator notes",
      "committee-only context that does not need public distribution",
    ],
    publicItems: [
      "transaction signatures and explorer-visible hashes",
      "runtime logs, proof packets, and reviewer summaries",
      "custody and authority state when that proof is required",
    ],
  },
};

export const localizedCopy: Record<SupportedLocale, LocalizedCopy> = {
  en: englishCopy,
  ar: {
    chrome: {
      start: "ابدأ",
      learn: "تعلّم",
      govern: "الحوكمة",
      liveState: "الحالة الحية",
      story: "القصة",
      trust: "الثقة",
      products: "المنتجات",
      apiPricing: "الواجهة والأسعار",
      network: "الشبكة",
      docs: "الوثائق",
      community: "المجتمع",
      help: "المساعدة",
      search: "بحث",
      openApp: "افتح التطبيق",
      searchSite: "ابحث في التطبيق أو الوثائق أو الإثبات الحي",
      createPrivateDaoTagline: "أنشئ DAO خاصًا على سولانا، ثم اقترح وصوّت ونفّذ من مسار واحد يبدأ بالمحفظة",
      footerSummary: "PrivateDAO منتج حوكمة وخزانة يركز على الخصوصية فوق سولانا مع hardening تدريجي وأدلة تشغيلية وأسـطح تحقق واضحة.",
      footerSupport: "يُبنى بدعم تنفيذي من فريق تقني متعدد الجنسيات. اتجاه المنتج والمساءلة التنفيذية والتنسيق الخارجي يقودها فهد قطب.",
      verificationView: "واجهة التحقق",
      fastPath: "المسار السريع",
      telemetryPacket: "حزمة القياس",
      leadershipContact: "القيادة والتواصل",
      repository: "المستودع",
      currentLiveSite: "الموقع الحي",
      androidApk: "حزمة أندرويد",
      storyVideo: "فيديو القصة",
      youtube: "يوتيوب",
      discord: "ديسكورد",
      showMoreLinks: "أظهر المزيد",
      hideMoreLinks: "أخفِ المزيد",
      language: "اللغة",
    },
    shell: {
      explore: "استكشاف",
      productNavigation: "تنقل المنتج",
      userFirstRoutes: "مسارات تضع المستخدم أولًا للتشغيل والحوكمة والإثبات والدعم والحالة الحية.",
      systemRails: "طبقات النظام",
      openGovern: "افتح الحوكمة",
      openLiveState: "افتح الحالة الحية",
      openCuratedDocs: "افتح الوثائق المنتقاة",
      startTheFlow: "ابدأ الدورة",
      openTrustOnlyIfNeeded: "افتح الثقة فقط عند الحاجة",
    },
    routeSummaries: {
      start: {
        label: "ملخص المسار",
        title: "اربط محفظة Devnet ونفّذ دورة حقيقية ثم راجع الدليل",
        body: "هذا أقصر مسار لمستخدم عادي: ربط المحفظة ثم الدخول إلى الحوكمة ثم فتح الإثبات واللوجز بدون طرفية.",
      },
      services: {
        label: "ملخص المسار",
        title: "استخدم PrivateDAO كبنية تحتية لا كبروشور ثابت",
        body: "هذا المسار يشرح hosted reads وسياسات الخصوصية ومسارات المدفوعات وstarter التكامل للمؤسسات الحقيقية.",
      },
      products: {
        label: "ملخص المسار",
        title: "تصفح المسارات الإنتاجية القابلة للبيع والدمج والمراجعة",
        body: "هذا المسار يجمع الحوكمة الخاصة والمدفوعات السرية والتحكم في الجيمينج والتنفيذ الوكيلي وواجهات runtime.",
      },
      learn: {
        label: "ملخص المسار",
        title: "تعلّم خلال دقائق ثم نفّذ عمليات بلوك تشين معقدة من الواجهة",
        body: "هذا معسكر حي: افهم الفكرة، افتح المسار المطابق، ثم راجع الهاشات واللوجز على Devnet فورًا.",
      },
      judge: {
        label: "ملخص المسار",
        title: "افهم التقنية بسهولة ثم افتح الإثباتات بنفسك",
        body: "هذا المسار صُمم للتحقق السريع: دورة الحوكمة وشرح الخصوصية وأدلة المعاملات والحزم المرجعية في مكان واحد.",
      },
      proof: {
        label: "ملخص المسار",
        title: "افهم ما يبقى سريًا وما يصبح عامًا وكيف تثبته السلسلة",
        body: "هذا المسار يجعل الخصوصية قابلة للفحص: هاشات عامة ولوجز تشغيل وحزم إثبات مع بقاء النية الحساسة محمية حتى المرحلة الصحيحة.",
      },
    },
    privacySelector: {
      eyebrow: "محدد سياسة الخصوصية",
      title: "اختر وضع الخصوصية المناسب للعملية",
      description: "قوة PrivateDAO تظهر حين تكون حدود الخصوصية واضحة. اختر السياسة ثم افتح المسار والإثبات المطابقين.",
      bestFit: "الأنسب الآن",
      runPolicy: "نفّذ هذه السياسة",
      verifyPolicy: "تحقق من هذه السياسة",
      policies: [
        { key: "reviewer", title: "إثبات مرئي للمراجع", tech: "بواسطة ZK anchors + أدلة المستكشف", summary: "الأفضل عندما يحتاج الحكام أو المشترون أو المجتمع إلى متابعة الهاشات العامة مع إبقاء المدخلات الحساسة مجردة." },
        { key: "committee", title: "تصويت خاص للجنة", tech: "بواسطة commit-reveal + ZK voting", summary: "الأفضل عندما يجب أن تبقى نية التصويت مخفية حتى reveal مع بقاء التنفيذ النهائي قابلاً للمراجعة." },
        { key: "payout", title: "مدفوعات خزانة سرية", tech: "بواسطة REFHE + MagicBlock", summary: "الأفضل للرواتب والمنح والمكافآت ومدفوعات الموردين حين تحتاج النية والحسابات إلى حماية أقوى." },
        { key: "disclosure", title: "كشف انتقائي", tech: "بواسطة custody trail + نافذة مراجعة ضيقة", summary: "الأفضل عندما يحتاج المشغل إلى مسار مراجعة أو تدقيق مؤسسي محدود بدون كشف كل التفاصيل داخليًا." },
      ],
    },
    sdkStarter: {
      eyebrow: "بداية SDK / API للخصوصية",
      title: "ابدأ دمج طبقة الخصوصية دون إعادة بناء البروتوكول",
      description: "هذا المسار يحول المنتج الحالي إلى سطح تكامل: أنماط Browser SDK وعقود القراءة وسياسات الخصوصية ومسار الكشف الانتقائي.",
      openStarter: "افتح مسار البداية",
      openCode: "افتح الكود",
      cards: [
        { key: "browser", title: "بداية Browser SDK", summary: "لفّ اتصال المحفظة وحالة الموقّع واختيار سياسة الخصوصية داخل starter واجهة جاهزة للمستخدم." },
        { key: "readApi", title: "عقد Hosted Read API", summary: "استخدم أنماط read-node والقياس لإظهار حالة الحوكمة والمدفوعات والتشخيص دون إجبار العميل على تحليل السلسلة الخام وحده." },
        { key: "policy", title: "ربط سياسة الخصوصية", summary: "اربط أفعال المستخدم بسياسات reviewer-visible أو committee-private أو confidential payout قبل التوقيع." },
        { key: "disclosure", title: "تسليم الكشف الانتقائي", summary: "جهّز مسار مراجعة محدود للتدقيق والحفظ المؤسسي دون تحويل العمل المحمي إلى ملف عام مسطح." },
      ],
    },
    routeBriefs: {
      security: {
        eyebrow: "ملخص مسار الأمان",
        title: "الأمان هو المكان الذي تلتقي فيه الخصوصية والانضباط المؤسسي وأدلة التشغيل في سطح واحد",
        description:
          "هذا المسار ليس ملحق تدقيق فقط، بل هو واجهة المشغّل لفهم كيف تحمي PrivateDAO نية المقترح وتنفيذ المدفوعات وتوقيع المحافظ ومسار الحفظ وإثباتات المراجعة دون تبسيط المنتج إلى ملف جامد.",
        bullets: [
          "استخدمه لشرح الطبقة التشفيرية بلغة بسيطة قبل أن يفتح المراجع الحزم.",
          "استخدمه لاختيار وضع الخصوصية الصحيح قبل أي حركة خزانة أو حوكمة.",
          "استخدمه لإظهار ما أُثبت فعليًا على Devnet وما بقي مغلقًا حتى الإقفال المؤسسي.",
        ],
      },
      products: {
        eyebrow: "ملخص مسار المنتجات",
        title: "المنتجات تُعرض حسب المشكلة التشغيلية التي تحلها لا حسب الوحدات الداخلية فقط",
        description:
          "هذا المسار يجب أن يقرأ ككتالوج بنية تحتية حقيقي: حوكمة خاصة، مدفوعات سرية، عمليات الجيمينج، كشف انتقائي للمراجعة، وواجهات قراءة وتكامل قابلة لإعادة الاستخدام.",
        bullets: [
          "افتح هذا المسار عندما يحتاج الممول أو المشتري أسرع شرح لما نبيعه.",
          "اربط الشرح دائمًا بمسارات Devnet الحية لا برسومات معمارية مجردة.",
          "استخدم محدد الخصوصية وStarter الـ SDK هنا للانتقال من القصة إلى التنفيذ.",
        ],
      },
      learn: {
        eyebrow: "ملخص مسار التعلّم",
        title: "مسار التعلّم يجب أن ينقل المستخدم العادي إلى فعل حقيقي على Devnet في نفس الجلسة",
        description:
          "هذا المسار يشرح الطبقات عبر المنتج نفسه: wallet-first UX، دورة الحوكمة، القراءة الحية، المدفوعات الخاصة، الكشف الانتقائي، والإثبات المرتبط بالتحقق.",
        bullets: [
          "كل محاضرة يجب أن تنتهي بمسار حي وبمسار تحقق حقيقي.",
          "المتعلم يجب أن يفهم ما يبقى سريًا وما يصبح عامًا ولماذا.",
          "نفس المسار يجب أن يخدم المتعلم والمراجع والمشغل بدون طرفية.",
        ],
      },
      servicesStarter: {
        eyebrow: "ملخص مسار التكامل",
        title: "مسار البداية يجب أن يبدو كعقد تكامل واضح لا كصفحة عامة ضبابية",
        description:
          "هذا المسار يجمع المنتج الحي في وحدات قابلة للدمج: دخول من المتصفح، hosted reads، اختيار سياسة الخصوصية، ومسار الكشف الانتقائي للتدقيق أو المراجعة المؤسسية.",
        bullets: [
          "ابدأ بـ browser starter إذا كان الشريك يحتاج واجهة wallet-first.",
          "استخدم hosted read contract إذا كان يحتاج حالة وتشخيصًا دون تحليل السلسلة الخام.",
          "استخدم الكشف الانتقائي إذا كان يحتاج مراجعة حساسة بدون فتح كامل المسار الداخلي.",
        ],
      },
    },
    selectiveDisclosure: {
      eyebrow: "الكشف الانتقائي",
      title: "امنح المراجع نافذة ضيقة على العملية دون تحويل العمل الخاص إلى كشف عام",
      description:
        "الكشف الانتقائي هو الجسر بين الخصوصية القوية والمراجعة المؤسسية. هو الذي يحدد ما يبقى خاصًا للمشغل وما يراه المراجع وما يكفي من روابط لإثبات صحة التنفيذ على Devnet.",
      stepsLabel: "كيف يعمل التسليم",
      privateLabel: "يبقى سريًا حتى الحد الصحيح",
      publicLabel: "يصبح مرئيًا للمراجعة والتحقق",
      openTrust: "افتح مسار الثقة",
      openGuide: "افتح دليل الخصوصية",
      openReviewLane: "افتح مسار المراجعة المطابق",
      scenarios: [
        { key: "auditor", title: "مراجعة مدقق", summary: "استخدمه عندما يحتاج مراجع خارجي إلى مسار إثبات محدود لحوكمة أو خزانة دون قراءة كل السجل الداخلي." },
        { key: "committee", title: "إشراف اللجنة", summary: "استخدمه عندما تحتاج اللجنة إلى التأكد من سلامة القرار مع بقاء نية التصويت أو تفاصيل الدفع محمية حتى المرحلة المعتمدة." },
        { key: "partner", title: "فحص شريك أو ممول", summary: "استخدمه عندما يحتاج شريك أو ممول أو داعم بنية تحتية إلى قدر كافٍ من الوضوح لبناء الثقة دون استلام كل التفاصيل التشغيلية." },
        { key: "incident", title: "مسار استجابة للحوادث", summary: "استخدمه عندما تحتاج حادثة توقيع أو دفع أو حوكمة إلى حزمة أدلة ضيقة تحفظ الخصوصية التشغيلية وتُظهر الأثر على السلسلة." },
      ],
      steps: [
        "اختر وضع الخصوصية قبل توقيع المحفظة.",
        "نفّذ حركة الحوكمة أو الخزانة على Devnet.",
        "افتح مسارات proof وcustody المطابقة لتلك الحركة.",
        "اكشف فقط الهاشات واللوجز وحزمة المراجعة اللازمة لتلك النافذة.",
      ],
      privateItems: [
        "نية التصويت قبل reveal",
        "منطق الدفع الحساس وملاحظات التشغيل الداخلية",
        "سياق اللجنة الذي لا يحتاج إلى نشر عام",
      ],
      publicItems: [
        "تواقيع المعاملات والهاشات العامة",
        "اللوجز التشغيلية وحزم الإثبات وملخصات المراجعة",
        "حالة الحفظ والصلاحيات عندما يتطلب الإثبات ذلك",
      ],
    },
  },
  ru: {
    ...englishCopy,
    chrome: {
      ...englishCopy.chrome,
      start: "Старт",
      learn: "Обучение",
      govern: "Управление",
      liveState: "Живое состояние",
      story: "История",
      trust: "Доверие",
      products: "Продукты",
      apiPricing: "API и цены",
      network: "Сеть",
      docs: "Документы",
      community: "Сообщество",
      help: "Помощь",
      search: "Поиск",
      openApp: "Открыть приложение",
      searchSite: "Искать в приложении, документах или живом proof",
      createPrivateDaoTagline: "Создайте приватный DAO на Solana, предложите, проголосуйте и исполните в одном wallet-first потоке",
      language: "Язык",
    },
    shell: {
      ...englishCopy.shell,
      explore: "Навигация",
      productNavigation: "Навигация по продукту",
      userFirstRoutes: "Маршруты для онбординга, управления, proof, поддержки и живого состояния продукта.",
      systemRails: "Системные слои",
      openGovern: "Открыть управление",
      openLiveState: "Открыть live state",
      openCuratedDocs: "Открыть документы",
      startTheFlow: "Запустить поток",
      openTrustOnlyIfNeeded: "Открыть trust только при необходимости",
    },
    routeSummaries: {
      start: { label: "Кратко о маршруте", title: "Подключите Devnet-кошелек, выполните реальный поток и проверьте доказательства", body: "Это самый короткий путь для обычного пользователя: кошелек, управление, затем proof и логи без терминала." },
      services: { label: "Кратко о маршруте", title: "Используйте PrivateDAO как инфраструктуру, а не как статичную витрину", body: "Здесь собраны hosted reads, политики приватности, payout-маршруты и starter для интеграций." },
      products: { label: "Кратко о маршруте", title: "Изучите продуктовые коридоры, готовые к продаже, интеграции и ревью", body: "Маршрут объединяет приватное управление, конфиденциальные выплаты, gaming-контроль, агентные treasury-операции и runtime API." },
      learn: { label: "Кратко о маршруте", title: "Учитесь несколько минут, затем запускайте сложные onchain-операции из UI", body: "Это живой bootcamp: понять концепцию, открыть соответствующий маршрут и сразу проверить Devnet-хэши и логи." },
      judge: { label: "Кратко о маршруте", title: "Поймите систему простым языком и откройте те же доказательства сами", body: "Маршрут judge создан для быстрой проверки: lifecycle, приватность, транзакции и reviewer-пакеты находятся рядом." },
      proof: { label: "Кратко о маршруте", title: "Узнайте, что остается приватным, что становится публичным и как это доказывает сеть", body: "Маршрут proof делает приватность проверяемой: публичные хэши, runtime-логи и proof-пакеты видимы, пока чувствительное намерение остается защищенным." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "Выбор политики приватности",
      title: "Выберите режим приватности под конкретную операцию",
      description: "Сильная сторона PrivateDAO — явная граница приватности. Выберите политику и откройте соответствующий маршрут и proof.",
      bestFit: "Лучший вариант",
      runPolicy: "Запустить эту политику",
      verifyPolicy: "Проверить эту политику",
      policies: [
        { key: "reviewer", title: "Proof для ревьюера", tech: "через ZK anchors + explorer evidence", summary: "Подходит, когда судьи, покупатели или сообщество должны видеть публичные хэши без раскрытия чувствительных входов." },
        { key: "committee", title: "Закрытое голосование комитета", tech: "через commit-reveal + ZK voting", summary: "Подходит, когда намерение голоса должно оставаться скрытым до reveal, а итоговое исполнение — проверяемым." },
        { key: "payout", title: "Конфиденциальные treasury-выплаты", tech: "через REFHE + MagicBlock", summary: "Подходит для payroll, grants, rewards и vendor payouts, где нужны более сильные гарантии приватности." },
        { key: "disclosure", title: "Выборочное раскрытие", tech: "через custody trail + узкое reviewer-окно", summary: "Подходит, когда оператору нужен ограниченный путь ревью или аудита без раскрытия всех внутренних деталей." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Starter для Privacy SDK / API",
      title: "Интегрируйте слой приватности без перестройки протокола",
      description: "Этот маршрут превращает текущий продукт в интеграционную поверхность: Browser SDK, hosted read contracts, binding политики приватности и selective disclosure.",
      openStarter: "Открыть starter",
      openCode: "Открыть код",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Объедините подключение кошелька, signer state и выбор политики приватности в одном frontend starter." },
        { key: "readApi", title: "Hosted read API contract", summary: "Используйте паттерны read-node и telemetry, чтобы показывать state управления, выплат и диагностики без сырого парсинга chain-data на клиенте." },
        { key: "policy", title: "Привязка политики приватности", summary: "Привязывайте действия пользователя к режимам reviewer-visible, committee-private или confidential payout до подписи кошельком." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Подготовьте узкий reviewer-путь для аудита, custody или enterprise-checks без упрощения защищенного workflow до публичной таблицы." },
      ],
    },
  },
  uk: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "Старт", learn: "Навчання", govern: "Керування", liveState: "Живий стан", story: "Історія", trust: "Довіра", products: "Продукти", apiPricing: "API і ціни", network: "Мережа", docs: "Документи", community: "Спільнота", help: "Допомога", search: "Пошук", openApp: "Відкрити застосунок", searchSite: "Шукати в застосунку, документах або proof", createPrivateDaoTagline: "Створіть приватний DAO на Solana, запропонуйте, проголосуйте та виконайте в одному wallet-first потоці", language: "Мова" },
    shell: { ...englishCopy.shell, explore: "Навігація", productNavigation: "Навігація продуктом", userFirstRoutes: "Маршрути для онбордингу, керування, proof, підтримки та живого стану.", systemRails: "Системні шари", openGovern: "Відкрити керування", openLiveState: "Відкрити live state", openCuratedDocs: "Відкрити документи", startTheFlow: "Запустити потік", openTrustOnlyIfNeeded: "Відкрити trust лише за потреби" },
    routeSummaries: {
      start: { label: "Коротко про маршрут", title: "Підключіть Devnet-гаманець, виконайте реальний потік і перевірте докази", body: "Це найкоротший шлях для звичайного користувача: гаманець, керування, потім proof і логи без терміналу." },
      services: { label: "Коротко про маршрут", title: "Використовуйте PrivateDAO як інфраструктуру, а не як статичну вітрину", body: "Тут зібрані hosted reads, політики приватності, payout-маршрути та starter для інтеграцій." },
      products: { label: "Коротко про маршрут", title: "Перегляньте продуктові коридори для продажу, інтеграції та рев'ю", body: "Маршрут поєднує приватне керування, конфіденційні виплати, gaming-контроль, агентне treasury-виконання та runtime API." },
      learn: { label: "Коротко про маршрут", title: "Навчіться за хвилини, а потім запускайте складні onchain-операції з UI", body: "Це живий bootcamp: зрозуміти концепцію, відкрити відповідний маршрут і одразу перевірити Devnet-хеші та логи." },
      judge: { label: "Коротко про маршрут", title: "Зрозумійте систему простою мовою та відкрийте ті самі докази самі", body: "Маршрут judge створений для швидкої перевірки: lifecycle, приватність, транзакції та reviewer-пакети поруч." },
      proof: { label: "Коротко про маршрут", title: "Побачте, що залишається приватним, що стає публічним і як це доводить мережа", body: "Маршрут proof робить приватність перевірюваною: публічні хеші, runtime-логи та proof-пакети видимі, а чутливий намір захищений до правильної стадії." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "Вибір політики приватності",
      title: "Оберіть режим приватності для потрібної операції",
      description: "Сильна сторона PrivateDAO — явна межа приватності. Оберіть політику і відкрийте відповідний маршрут та proof.",
      bestFit: "Найкращий варіант",
      runPolicy: "Запустити цю політику",
      verifyPolicy: "Перевірити цю політику",
      policies: [
        { key: "reviewer", title: "Proof для рев'юера", tech: "через ZK anchors + explorer evidence", summary: "Найкраще, коли судді, покупці або спільнота мають бачити публічні хеші без розкриття чутливих вхідних даних." },
        { key: "committee", title: "Приватне голосування комітету", tech: "через commit-reveal + ZK voting", summary: "Підходить, коли намір голосу має бути прихованим до reveal, а фінальне виконання — перевірюваним." },
        { key: "payout", title: "Конфіденційні treasury-виплати", tech: "через REFHE + MagicBlock", summary: "Підходить для payroll, grants, rewards і vendor payouts, коли потрібен сильніший захист наміру та логіки сум." },
        { key: "disclosure", title: "Вибіркове розкриття", tech: "через custody trail + вузьке reviewer-вікно", summary: "Підходить, коли оператору потрібен обмежений маршрут рев'ю або аудиту без повного публічного розкриття." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Starter для Privacy SDK / API",
      title: "Інтегруйте шар приватності без перебудови протоколу",
      description: "Цей маршрут перетворює поточний продукт на інтеграційну поверхню: Browser SDK, hosted read contracts, прив'язка політики приватності та selective disclosure.",
      openStarter: "Відкрити starter",
      openCode: "Відкрити код",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Об'єднайте підключення гаманця, signer state і вибір політики приватності в одному frontend starter." },
        { key: "readApi", title: "Hosted read API contract", summary: "Використовуйте патерни read-node і telemetry, щоб показувати стан керування, виплат і діагностики без сирого розбору chain-data на клієнті." },
        { key: "policy", title: "Прив'язка політики приватності", summary: "Прив'язуйте дії користувача до reviewer-visible, committee-private або confidential payout до підпису гаманцем." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Підготуйте вузький reviewer-шлях для аудиту, custody або enterprise-checks без спрощення захищеного workflow до публічної таблиці." },
      ],
    },
  },
  pl: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "Start", learn: "Nauka", govern: "Governance", liveState: "Stan live", story: "Historia", trust: "Zaufanie", products: "Produkty", apiPricing: "API i ceny", network: "Sieć", docs: "Dokumenty", community: "Społeczność", help: "Pomoc", search: "Szukaj", openApp: "Otwórz aplikację", searchSite: "Szukaj w aplikacji, dokumentach lub proof", createPrivateDaoTagline: "Stwórz prywatne DAO na Solanie, proponuj, głosuj i wykonuj w jednym wallet-first flow", language: "Język" },
    shell: { ...englishCopy.shell, explore: "Nawigacja", productNavigation: "Nawigacja produktu", userFirstRoutes: "Trasy dla onboardingu, governance, proof, wsparcia i live state produktu.", systemRails: "Warstwy systemu", openGovern: "Otwórz governance", openLiveState: "Otwórz live state", openCuratedDocs: "Otwórz dokumenty", startTheFlow: "Uruchom flow", openTrustOnlyIfNeeded: "Otwórz trust tylko w razie potrzeby" },
    routeSummaries: {
      start: { label: "Skrót trasy", title: "Podłącz portfel Devnet, uruchom realny flow i sprawdź dowody", body: "To najkrótsza ścieżka dla zwykłego użytkownika: portfel, governance, a potem proof i logi bez terminala." },
      services: { label: "Skrót trasy", title: "Używaj PrivateDAO jako infrastruktury, nie jako statycznej prezentacji", body: "Ta trasa pokazuje hosted reads, polityki prywatności, payout corridors i starter integracyjny dla realnych organizacji." },
      products: { label: "Skrót trasy", title: "Przeglądaj korytarze produktowe gotowe do sprzedaży, integracji i review", body: "Trasa łączy prywatne governance, poufne wypłaty, gaming control, agentic treasury execution i runtime API." },
      learn: { label: "Skrót trasy", title: "Ucz się przez kilka minut, a potem wykonuj złożone operacje blockchain z UI", body: "To żywy bootcamp: zrozum koncepcję, otwórz pasującą trasę i od razu sprawdź hashe i logi na Devnet." },
      judge: { label: "Skrót trasy", title: "Zrozum produkt prostym językiem i otwórz te same proof samodzielnie", body: "Ta trasa jest zbudowana do szybkiej weryfikacji: lifecycle governance, prywatność, dowody transakcji i reviewer packets są obok siebie." },
      proof: { label: "Skrót trasy", title: "Zobacz, co pozostaje prywatne, co staje się publiczne i jak potwierdza to chain", body: "Ta trasa robi z prywatności coś weryfikowalnego: publiczne hashe, runtime logs i packets są widoczne, a wrażliwy intent pozostaje chroniony do właściwego etapu." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "Selektor polityki prywatności",
      title: "Wybierz tryb prywatności dopasowany do operacji",
      description: "Siłą PrivateDAO jest jawna granica prywatności. Wybierz politykę i otwórz pasującą trasę oraz proof.",
      bestFit: "Najlepsze dopasowanie",
      runPolicy: "Uruchom tę politykę",
      verifyPolicy: "Zweryfikuj tę politykę",
      policies: [
        { key: "reviewer", title: "Proof widoczny dla reviewera", tech: "przez ZK anchors + explorer evidence", summary: "Najlepsze, gdy sędziowie, kupujący lub społeczność muszą śledzić publiczne hashe bez ujawniania wrażliwych wejść." },
        { key: "committee", title: "Prywatne głosowanie komitetu", tech: "przez commit-reveal + ZK voting", summary: "Najlepsze, gdy intencja głosu ma pozostać ukryta do reveal, a finalne wykonanie ma być audytowalne." },
        { key: "payout", title: "Poufna wypłata treasury", tech: "przez REFHE + MagicBlock", summary: "Najlepsze dla payroll, grants, rewards i vendor payouts, gdy logika kwot i intent wymagają mocniejszej ochrony." },
        { key: "disclosure", title: "Selektywne ujawnianie", tech: "przez custody trail + wąskie reviewer window", summary: "Najlepsze, gdy operator potrzebuje ograniczonej ścieżki review lub audytu bez publicznego ujawniania wszystkich szczegółów." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Starter Privacy SDK / API",
      title: "Zacznij integrować warstwę prywatności bez przebudowy protokołu",
      description: "Ta trasa zamienia obecny produkt w powierzchnię integracyjną: Browser SDK, hosted read contracts, powiązanie polityki prywatności i selective disclosure handoff.",
      openStarter: "Otwórz starter",
      openCode: "Otwórz kod",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Połącz wallet connection, signer state i wybór polityki prywatności w jednym frontend starterze." },
        { key: "readApi", title: "Hosted read API contract", summary: "Użyj wzorców read-node i telemetry, by pokazać governance, payouts i diagnostics bez surowego parsowania chain-data po stronie klienta." },
        { key: "policy", title: "Powiązanie polityki prywatności", summary: "Powiąż akcje użytkownika z reviewer-visible, committee-private lub confidential payout zanim portfel podpisze." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Przygotuj wąską ścieżkę review dla audytu, custody lub enterprise checks bez spłaszczania chronionego workflow do publicznego arkusza." },
      ],
    },
  },
  hi: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "शुरू करें", learn: "सीखें", govern: "गवर्न", liveState: "लाइव स्टेट", story: "स्टोरी", trust: "ट्रस्ट", products: "प्रोडक्ट्स", apiPricing: "API और प्राइसिंग", network: "नेटवर्क", docs: "डॉक्स", community: "कम्युनिटी", help: "मदद", search: "खोजें", openApp: "ऐप खोलें", searchSite: "ऐप, डॉक्स या लाइव प्रूफ में खोजें", createPrivateDaoTagline: "एक private Solana DAO बनाएं, propose करें, vote करें, और execute करें — एक ही wallet-first flow में", language: "भाषा" },
    shell: { ...englishCopy.shell, explore: "एक्सप्लोर", productNavigation: "प्रोडक्ट नेविगेशन", userFirstRoutes: "ऑनबोर्डिंग, governance, proof, support और live product state के लिए user-first routes।", systemRails: "सिस्टम रेल्स", openGovern: "गवर्न खोलें", openLiveState: "लाइव स्टेट खोलें", openCuratedDocs: "क्यूरेटेड डॉक्स खोलें", startTheFlow: "फ्लो शुरू करें", openTrustOnlyIfNeeded: "ज़रूरत पर ही trust खोलें" },
    routeSummaries: {
      start: { label: "रूट सारांश", title: "Devnet wallet जोड़ें, एक real flow चलाएँ, फिर evidence देखें", body: "यह सामान्य यूज़र के लिए सबसे छोटा रास्ता है: wallet, governance, फिर proof और logs — बिना terminal के." },
      services: { label: "रूट सारांश", title: "PrivateDAO को infrastructure की तरह इस्तेमाल करें, brochure की तरह नहीं", body: "यह route hosted reads, privacy policies, payout corridors और integration starter को एक साथ दिखाता है." },
      products: { label: "रूट सारांश", title: "वे product corridors देखें जिन्हें बेचा, integrate और review किया जा सकता है", body: "यह route private governance, confidential payouts, gaming control, agentic treasury execution और runtime APIs को जोड़ता है." },
      learn: { label: "रूट सारांश", title: "कुछ मिनट में सीखें, फिर UI से complex blockchain operations चलाएँ", body: "यह live bootcamp है: concept समझें, matching route खोलें, और Devnet hashes व logs तुरंत verify करें." },
      judge: { label: "रूट सारांश", title: "टेक्नोलॉजी को आसान भाषा में समझें और वही proofs खुद खोलें", body: "यह judge route fast verification के लिए बना है: governance lifecycle, privacy explanation, transaction evidence और reviewer packets एक क्लिक दूर हैं." },
      proof: { label: "रूट सारांश", title: "देखें क्या private रहता है, क्या public बनता है, और chain इसे कैसे साबित करती है", body: "यह proof route privacy को inspectable बनाता है: public hashes, runtime logs और proof packets दिखते हैं जबकि sensitive intent सही stage तक protected रहता है." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "प्राइवेसी पॉलिसी सेलेक्टर",
      title: "ऑपरेशन के लिए सही privacy posture चुनें",
      description: "PrivateDAO तब सबसे मजबूत होता है जब privacy boundary स्पष्ट हो। policy चुनें और matching route व proof खोलें.",
      bestFit: "सबसे उपयुक्त",
      runPolicy: "यह policy चलाएँ",
      verifyPolicy: "इस policy को verify करें",
      policies: [
        { key: "reviewer", title: "Reviewer-visible proof", tech: "ZK anchors + explorer evidence", summary: "जब judges, buyers या community reviewers को public hashes देखनी हों लेकिन sensitive inputs abstract रहनी चाहिए." },
        { key: "committee", title: "Committee-private voting", tech: "commit-reveal + ZK voting", summary: "जब vote intent reveal तक hidden रहना चाहिए, और final execution auditable रहनी चाहिए." },
        { key: "payout", title: "Confidential treasury payout", tech: "REFHE + MagicBlock corridors", summary: "Payroll, grants, rewards या vendor payouts के लिए, जहाँ amount logic और intent को stronger protection चाहिए." },
        { key: "disclosure", title: "Selective disclosure", tech: "custody trail + narrow reviewer window", summary: "जब operator को limited reviewer या audit path चाहिए, बिना पूरे internal workflow को public किए." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Privacy SDK / API starter",
      title: "प्रोटोकॉल दोबारा बनाए बिना privacy layer integrate करें",
      description: "यह starter route current product को integration surface में बदलता है: browser SDK patterns, hosted read contracts, privacy policy binding और selective disclosure handoff.",
      openStarter: "starter route खोलें",
      openCode: "कोड खोलें",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Wallet connection, signer state और privacy policy selection को एक consumer-ready frontend starter में जोड़ें." },
        { key: "readApi", title: "Hosted read API contract", summary: "Governance, payout और diagnostics state दिखाने के लिए read-node और telemetry patterns का उपयोग करें, बिना raw chain parsing को client पर छोड़े." },
        { key: "policy", title: "Privacy policy binding", summary: "Wallet sign करने से पहले user actions को reviewer-visible, committee-private या confidential payout policies से बाँधें." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Audit, custody या enterprise checks के लिए narrow reviewer path तैयार करें, बिना protected workflow को public spreadsheet में बदले." },
      ],
    },
  },
  ko: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "시작", learn: "학습", govern: "거버넌스", liveState: "실시간 상태", story: "스토리", trust: "신뢰", products: "제품", apiPricing: "API 및 가격", network: "네트워크", docs: "문서", community: "커뮤니티", help: "도움말", search: "검색", openApp: "앱 열기", searchSite: "앱, 문서, 라이브 증거 검색", createPrivateDaoTagline: "하나의 wallet-first 흐름에서 프라이빗 Solana DAO를 만들고 제안하고 투표하고 실행하세요", language: "언어" },
    shell: { ...englishCopy.shell, explore: "탐색", productNavigation: "제품 탐색", userFirstRoutes: "온보딩, 거버넌스, 증거, 지원, 실시간 상태를 위한 사용자 우선 경로.", systemRails: "시스템 레일", openGovern: "거버넌스 열기", openLiveState: "실시간 상태 열기", openCuratedDocs: "선별 문서 열기", startTheFlow: "플로우 시작", openTrustOnlyIfNeeded: "필요할 때만 trust 열기" },
    routeSummaries: {
      start: { label: "경로 요약", title: "Devnet 지갑을 연결하고 실제 플로우를 실행한 뒤 증거를 확인하세요", body: "일반 사용자를 위한 가장 짧은 경로입니다: 지갑 연결, 거버넌스 실행, 그리고 proof/log 확인까지 터미널 없이 진행됩니다." },
      services: { label: "경로 요약", title: "PrivateDAO를 정적인 소개가 아니라 인프라처럼 사용하세요", body: "이 경로는 hosted reads, 프라이버시 정책, payout corridor, integration starter를 한곳에 모읍니다." },
      products: { label: "경로 요약", title: "판매, 통합, 검토가 가능한 제품 경로를 살펴보세요", body: "이 경로는 프라이빗 거버넌스, 기밀 지급, 게임 제어, 에이전트 treasury 실행, 런타임 API를 묶어 보여줍니다." },
      learn: { label: "경로 요약", title: "몇 분 안에 배우고 UI에서 고급 블록체인 작업을 실행하세요", body: "이곳은 라이브 부트캠프입니다. 개념을 이해하고 해당 경로를 열고 Devnet 해시와 로그를 즉시 검증할 수 있습니다." },
      judge: { label: "경로 요약", title: "기술을 쉬운 언어로 이해한 뒤 같은 증거를 직접 열어보세요", body: "judge 경로는 빠른 검증을 위해 설계되었습니다. 거버넌스 수명주기, 프라이버시 설명, 트랜잭션 증거, reviewer 패킷이 모두 가깝게 배치됩니다." },
      proof: { label: "경로 요약", title: "무엇이 비공개로 남고 무엇이 공개되며 체인이 이를 어떻게 증명하는지 확인하세요", body: "proof 경로는 프라이버시를 검토 가능한 형태로 바꿉니다. 공개 해시, 런타임 로그, proof 패킷이 보이고 민감한 의도는 올바른 시점까지 보호됩니다." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "프라이버시 정책 선택기",
      title: "작업에 맞는 프라이버시 모드를 선택하세요",
      description: "PrivateDAO의 강점은 프라이버시 경계를 명확히 드러내는 데 있습니다. 정책을 선택하고 해당 경로와 proof를 여세요.",
      bestFit: "지금 가장 적합",
      runPolicy: "이 정책 실행",
      verifyPolicy: "이 정책 검증",
      policies: [
        { key: "reviewer", title: "리뷰어 가시형 proof", tech: "ZK anchors + explorer evidence", summary: "민감한 입력은 추상화한 채 심사위원, 구매자, 커뮤니티가 공개 해시를 따라가야 할 때 적합합니다." },
        { key: "committee", title: "위원회 비공개 투표", tech: "commit-reveal + ZK voting", summary: "투표 의도가 reveal 전까지 숨겨져야 하고 최종 실행은 검증 가능해야 할 때 적합합니다." },
        { key: "payout", title: "기밀 treasury 지급", tech: "REFHE + MagicBlock corridors", summary: "급여, 보조금, 보상, 공급업체 지급에서 금액 로직과 의도를 더 강하게 보호해야 할 때 적합합니다." },
        { key: "disclosure", title: "선택적 공개", tech: "custody trail + narrow reviewer window", summary: "운영자가 제한된 리뷰 또는 감사 경로가 필요하지만 내부 세부 사항 전체를 공개하고 싶지 않을 때 적합합니다." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Privacy SDK / API starter",
      title: "프로토콜을 다시 만들지 않고 프라이버시 레이어를 통합하세요",
      description: "이 starter 경로는 현재 제품을 통합 표면으로 바꿉니다. 브라우저 SDK 패턴, hosted read contracts, privacy policy binding, selective disclosure handoff를 포함합니다.",
      openStarter: "starter 열기",
      openCode: "코드 열기",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "지갑 연결, signer state, privacy policy 선택을 하나의 소비자용 프론트엔드 starter로 묶습니다." },
        { key: "readApi", title: "Hosted read API contract", summary: "클라이언트가 raw chain data를 직접 해석하지 않아도 governance, payout, diagnostics 상태를 보여주도록 read-node와 telemetry 패턴을 사용합니다." },
        { key: "policy", title: "Privacy policy binding", summary: "지갑이 서명하기 전에 사용자 액션을 reviewer-visible, committee-private, confidential payout 정책에 연결합니다." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "감사, custody, enterprise 검토를 위한 좁은 reviewer 경로를 준비하되 보호된 워크플로를 공개 스프레드시트로 평탄화하지 않습니다." },
      ],
    },
  },
  es: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "Inicio", learn: "Aprender", govern: "Gobernar", liveState: "Estado en vivo", story: "Historia", trust: "Confianza", products: "Productos", apiPricing: "API y precios", network: "Red", docs: "Docs", community: "Comunidad", help: "Ayuda", search: "Buscar", openApp: "Abrir app", searchSite: "Buscar en la app, docs o proof en vivo", createPrivateDaoTagline: "Crea un DAO privado en Solana, propone, vota y ejecuta en un solo flujo wallet-first", language: "Idioma" },
    shell: { ...englishCopy.shell, explore: "Explorar", productNavigation: "Navegación del producto", userFirstRoutes: "Rutas centradas en el usuario para onboarding, governance, proof, soporte y estado en vivo.", systemRails: "Capas del sistema", openGovern: "Abrir governance", openLiveState: "Abrir estado en vivo", openCuratedDocs: "Abrir docs", startTheFlow: "Iniciar flujo", openTrustOnlyIfNeeded: "Abrir trust solo si hace falta" },
    routeSummaries: {
      start: { label: "Resumen de ruta", title: "Conecta una wallet Devnet, ejecuta un flujo real y revisa la evidencia", body: "Es la ruta más corta para un usuario normal: wallet, governance y luego proof y logs sin terminal." },
      services: { label: "Resumen de ruta", title: "Usa PrivateDAO como infraestructura, no como un folleto estático", body: "Esta ruta reúne hosted reads, políticas de privacidad, payout corridors y un starter de integración." },
      products: { label: "Resumen de ruta", title: "Explora los corredores de producto que se pueden vender, integrar y auditar", body: "La ruta agrupa governance privada, payouts confidenciales, control gaming, ejecución treasury agentic y APIs de runtime." },
      learn: { label: "Resumen de ruta", title: "Aprende en minutos y luego ejecuta operaciones complejas desde la UI", body: "Es un bootcamp vivo: entiende el concepto, abre la ruta correspondiente y verifica hashes y logs de Devnet al instante." },
      judge: { label: "Resumen de ruta", title: "Entiende la tecnología en lenguaje simple y abre las mismas pruebas tú mismo", body: "La ruta judge está hecha para verificación rápida: lifecycle, privacidad, evidencia de transacciones y reviewer packets a un clic." },
      proof: { label: "Resumen de ruta", title: "Ve qué permanece privado, qué se vuelve público y cómo la cadena lo prueba", body: "La ruta proof vuelve la privacidad inspeccionable: hashes públicos, runtime logs y proof packets visibles mientras la intención sensible queda protegida hasta la etapa correcta." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "Selector de política de privacidad",
      title: "Elige el modo de privacidad que encaja con la operación",
      description: "PrivateDAO es más fuerte cuando el límite de privacidad es explícito. Elige una política y abre la ruta y la prueba correspondientes.",
      bestFit: "Mejor opción",
      runPolicy: "Ejecutar esta política",
      verifyPolicy: "Verificar esta política",
      policies: [
        { key: "reviewer", title: "Prueba visible para revisión", tech: "por ZK anchors + explorer evidence", summary: "Ideal cuando jueces, compradores o revisores de la comunidad deben seguir los hashes públicos sin exponer entradas sensibles." },
        { key: "committee", title: "Votación privada del comité", tech: "por commit-reveal + ZK voting", summary: "Ideal cuando la intención del voto debe permanecer oculta hasta reveal y la ejecución final debe seguir siendo auditable." },
        { key: "payout", title: "Pago confidencial de tesorería", tech: "por REFHE + MagicBlock corridors", summary: "Ideal para nómina, grants, rewards o vendor payouts cuando la lógica del monto y la intención requieren mayor protección." },
        { key: "disclosure", title: "Divulgación selectiva", tech: "por custody trail + narrow reviewer window", summary: "Ideal cuando el operador necesita una ruta limitada para revisión o auditoría sin exponer cada detalle interno públicamente." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Starter de Privacy SDK / API",
      title: "Empieza a integrar la capa de privacidad sin reconstruir el protocolo",
      description: "Esta ruta convierte el producto actual en una superficie de integración: patrones de Browser SDK, hosted read contracts, binding de política de privacidad y selective disclosure handoff.",
      openStarter: "Abrir starter",
      openCode: "Abrir código",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Envuelve la conexión de wallet, el estado del firmante y la selección de política de privacidad en un starter frontend listo para usuarios." },
        { key: "readApi", title: "Contrato de Hosted Read API", summary: "Usa los patrones de read-node y telemetry para mostrar estado de governance, payouts y diagnostics sin obligar al cliente a parsear la cadena cruda." },
        { key: "policy", title: "Vinculación de política de privacidad", summary: "Vincula las acciones del usuario a políticas reviewer-visible, committee-private o confidential payout antes de la firma de la wallet." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Prepara una ruta limitada para revisión, custody o auditoría empresarial sin convertir el flujo protegido en una hoja pública." },
      ],
    },
  },
  it: {
    ...englishCopy,
    chrome: { ...englishCopy.chrome, start: "Inizio", learn: "Impara", govern: "Governance", liveState: "Stato live", story: "Storia", trust: "Trust", products: "Prodotti", apiPricing: "API e prezzi", network: "Rete", docs: "Documenti", community: "Community", help: "Aiuto", search: "Cerca", openApp: "Apri app", searchSite: "Cerca nell'app, nei documenti o nel proof live", createPrivateDaoTagline: "Crea un DAO privato su Solana, proponi, vota ed esegui in un unico flusso wallet-first", language: "Lingua" },
    shell: { ...englishCopy.shell, explore: "Esplora", productNavigation: "Navigazione prodotto", userFirstRoutes: "Percorsi user-first per onboarding, governance, proof, supporto e stato live del prodotto.", systemRails: "Layer di sistema", openGovern: "Apri governance", openLiveState: "Apri stato live", openCuratedDocs: "Apri documenti", startTheFlow: "Avvia il flusso", openTrustOnlyIfNeeded: "Apri trust solo se serve" },
    routeSummaries: {
      start: { label: "Riassunto percorso", title: "Collega un wallet Devnet, esegui un flusso reale e controlla le prove", body: "È il percorso più corto per un utente normale: wallet, governance e poi proof e log senza terminale." },
      services: { label: "Riassunto percorso", title: "Usa PrivateDAO come infrastruttura, non come una brochure statica", body: "Questo percorso raccoglie hosted reads, policy di privacy, payout corridors e uno starter di integrazione." },
      products: { label: "Riassunto percorso", title: "Esplora i corridoi prodotto pronti per vendita, integrazione e review", body: "Il percorso unisce governance privata, payout confidenziali, controllo gaming, esecuzione treasury agentic e runtime API." },
      learn: { label: "Riassunto percorso", title: "Impara in pochi minuti e poi esegui operazioni blockchain complesse dalla UI", body: "È un bootcamp vivo: capisci il concetto, apri il percorso giusto e verifica subito hash e log su Devnet." },
      judge: { label: "Riassunto percorso", title: "Capisci la tecnologia in modo semplice e apri le stesse prove da solo", body: "Il percorso judge è pensato per la verifica rapida: lifecycle, privacy, prove di transazione e reviewer packet sono tutti vicini." },
      proof: { label: "Riassunto percorso", title: "Vedi cosa resta privato, cosa diventa pubblico e come la chain lo prova", body: "Il percorso proof rende la privacy ispezionabile: hash pubblici, runtime log e proof packet restano visibili mentre l'intento sensibile è protetto fino allo stadio corretto." },
    },
    privacySelector: {
      ...englishCopy.privacySelector,
      eyebrow: "Selettore della policy di privacy",
      title: "Scegli il livello di privacy adatto all'operazione",
      description: "PrivateDAO è più forte quando il confine di privacy è esplicito. Scegli una policy e apri il percorso e il proof corrispondenti.",
      bestFit: "Scelta migliore",
      runPolicy: "Esegui questa policy",
      verifyPolicy: "Verifica questa policy",
      policies: [
        { key: "reviewer", title: "Proof visibile al reviewer", tech: "con ZK anchors + explorer evidence", summary: "Ideale quando giudici, buyer o revisori della community devono seguire gli hash pubblici senza esporre input sensibili." },
        { key: "committee", title: "Voto privato del comitato", tech: "con commit-reveal + ZK voting", summary: "Ideale quando l'intento di voto deve restare nascosto fino al reveal e l'esecuzione finale deve essere auditabile." },
        { key: "payout", title: "Payout treasury confidenziale", tech: "con REFHE + MagicBlock corridors", summary: "Ideale per payroll, grants, rewards o vendor payouts quando logica dell'importo e intento richiedono protezione più forte." },
        { key: "disclosure", title: "Disclosure selettiva", tech: "con custody trail + narrow reviewer window", summary: "Ideale quando l'operatore ha bisogno di un percorso limitato per review o audit senza esporre ogni dettaglio interno in pubblico." },
      ],
    },
    sdkStarter: {
      ...englishCopy.sdkStarter,
      eyebrow: "Starter Privacy SDK / API",
      title: "Inizia a integrare il layer di privacy senza ricostruire il protocollo",
      description: "Questo percorso trasforma il prodotto attuale in una superficie di integrazione: pattern Browser SDK, hosted read contracts, privacy policy binding e selective disclosure handoff.",
      openStarter: "Apri starter",
      openCode: "Apri codice",
      cards: [
        { key: "browser", title: "Browser SDK starter", summary: "Raccogli connessione wallet, stato del firmatario e selezione della policy di privacy in un frontend starter pronto per l'utente." },
        { key: "readApi", title: "Hosted Read API contract", summary: "Usa i pattern di read-node e telemetry per mostrare stato di governance, payout e diagnostics senza lasciare al client il parsing grezzo della chain." },
        { key: "policy", title: "Binding della policy di privacy", summary: "Collega le azioni dell'utente a policy reviewer-visible, committee-private o confidential payout prima della firma del wallet." },
        { key: "disclosure", title: "Selective disclosure handoff", summary: "Prepara un percorso limitato per review, custody o audit enterprise senza ridurre il workflow protetto a un foglio pubblico." },
      ],
    },
  },
};
