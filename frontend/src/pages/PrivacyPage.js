import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Cookie, Mail, FileText } from "lucide-react";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
    <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-2">{children}</div>
  </section>
);

const PrivacyPage = () => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language?.slice(0, 2) || "en";
  const updated = "February 2026";

  const content = {
    en: {
      title: "Privacy Policy",
      intro: `GameDeals respects your privacy. This document explains what we collect, why, and your choices.`,
      sections: [
        ["1. Information We Collect",
         <>
           <p><strong>Account data:</strong> If you register, we store your email, name, and an encrypted password (bcrypt). For Google sign-in, we receive your email, name, and profile picture from Google.</p>
           <p><strong>Activity data:</strong> Your wishlist items, price alerts, and Pro subscription status.</p>
           <p><strong>Payment data:</strong> Handled entirely by Stripe. We never see or store your card details — only a transaction ID and status.</p>
           <p><strong>Technical data:</strong> IP address, browser type, and pages visited (standard server logs, kept ≤ 30 days).</p>
         </>],
        ["2. How We Use Your Data",
         <ul className="list-disc ps-5 space-y-1">
           <li>Provide and personalize the service (wishlist, alerts, language preferences).</li>
           <li>Process payments through Stripe.</li>
           <li>Send transactional emails (account confirmation, price-drop alerts) — never marketing without consent.</li>
           <li>Detect abuse and secure the platform.</li>
         </ul>],
        ["3. Cookies",
         <>
           <p>We use a small number of cookies:</p>
           <ul className="list-disc ps-5 space-y-1">
             <li><strong>session_token</strong> (essential) — keeps you signed in. httpOnly, Secure.</li>
             <li><strong>theme / i18nextLng</strong> (functional) — stores your theme & language choices in localStorage.</li>
             <li><strong>Stripe</strong> — Stripe Checkout sets its own cookies for fraud detection during payment.</li>
             <li><strong>Google AdSense / affiliate networks</strong> (when enabled) — measure ad performance and attribute commissions.</li>
           </ul>
           <p>You can refuse non-essential cookies via the banner shown on your first visit.</p>
         </>],
        ["4. Affiliate Disclosure",
         <p>Some links on GameDeals are affiliate links. When you buy a game through a "View Deal" button, the store (e.g. Humble, Fanatical, Green Man Gaming) may pay us a small commission at no extra cost to you. This does not influence which deals we show — the data comes directly from CheapShark's public API.</p>],
        ["5. Third-Party Services",
         <ul className="list-disc ps-5 space-y-1">
           <li><a className="text-[#D4FF00] underline" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a> — payment processing.</li>
           <li><a className="text-[#D4FF00] underline" href="https://www.cheapshark.com" target="_blank" rel="noopener noreferrer">CheapShark</a> — deal aggregation API.</li>
           <li><a className="text-[#D4FF00] underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a> — optional OAuth login + AdSense.</li>
         </ul>],
        ["6. Your Rights",
         <p>You can request a copy of your data, correct it, or delete your account at any time by emailing us. Deleting your account removes your wishlist, alerts, and subscription record. Anonymized analytics may be retained.</p>],
        ["7. Children",
         <p>GameDeals is not directed at children under 13. We do not knowingly collect their data.</p>],
        ["8. Contact",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:privacy@gamedeals.app">privacy@gamedeals.app</a></p>],
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      intro: "نحترم خصوصيتك. توضح هذه الوثيقة ما نجمعه ولماذا وما هي خياراتك.",
      sections: [
        ["1. البيانات التي نجمعها",
         <>
           <p><strong>بيانات الحساب:</strong> عند التسجيل نحفظ بريدك الإلكتروني واسمك وكلمة مرور مشفّرة (bcrypt). عند تسجيل الدخول عبر Google نتلقى البريد والاسم والصورة من Google.</p>
           <p><strong>بيانات النشاط:</strong> قائمة المفضلة وتنبيهات الأسعار وحالة اشتراك Pro.</p>
           <p><strong>بيانات الدفع:</strong> تُدار بالكامل عبر Stripe. لا نرى أو نخزّن تفاصيل بطاقتك أبداً.</p>
           <p><strong>بيانات تقنية:</strong> عنوان IP ونوع المتصفح والصفحات المزارة (سجلات خادم تُحفظ ≤ 30 يوم).</p>
         </>],
        ["2. كيف نستخدم بياناتك",
         <ul className="list-disc ps-5 space-y-1">
           <li>تقديم الخدمة وتخصيصها.</li>
           <li>معالجة المدفوعات عبر Stripe.</li>
           <li>إرسال رسائل إلكترونية ضرورية فقط (تأكيد الحساب، تنبيهات الأسعار).</li>
           <li>كشف إساءة الاستخدام وتأمين المنصة.</li>
         </ul>],
        ["3. ملفات تعريف الارتباط (Cookies)",
         <>
           <p>نستخدم عدداً قليلاً من الكوكيز:</p>
           <ul className="list-disc ps-5 space-y-1">
             <li><strong>session_token</strong> (أساسي) — لإبقاء تسجيل الدخول.</li>
             <li><strong>theme / i18nextLng</strong> (وظيفي) — تفضيلات الثيم واللغة.</li>
             <li><strong>Stripe</strong> — تستخدم Stripe كوكيزها لمنع الاحتيال أثناء الدفع.</li>
             <li><strong>Google AdSense / affiliate</strong> (عند التفعيل) — لقياس أداء الإعلانات.</li>
           </ul>
           <p>يمكنك رفض الكوكيز غير الأساسية عبر شريط الموافقة الذي يظهر في أول زيارة.</p>
         </>],
        ["4. الإفصاح عن العمولات (Affiliate)",
         <p>بعض الروابط على GameDeals هي روابط affiliate. عند شراء لعبة عبر زر "View Deal"، قد يدفع لنا المتجر (Humble، Fanatical، Green Man Gaming) عمولة صغيرة دون أي تكلفة إضافية عليك. لا يؤثر ذلك على الصفقات التي نعرضها — البيانات من CheapShark API مباشرة.</p>],
        ["5. خدمات الطرف الثالث",
         <ul className="list-disc ps-5 space-y-1">
           <li>Stripe — معالجة المدفوعات.</li>
           <li>CheapShark — تجميع بيانات الصفقات.</li>
           <li>Google — تسجيل الدخول الاختياري + AdSense.</li>
         </ul>],
        ["6. حقوقك",
         <p>يمكنك طلب نسخة من بياناتك أو تصحيحها أو حذف حسابك في أي وقت بمراسلتنا.</p>],
        ["7. الأطفال",
         <p>GameDeals غير موجّه للأطفال دون سن 13 ولا نجمع بياناتهم بشكل متعمّد.</p>],
        ["8. التواصل",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:privacy@gamedeals.app">privacy@gamedeals.app</a></p>],
      ],
    },
    es: {
      title: "Política de Privacidad",
      intro: "GameDeals respeta tu privacidad. Este documento explica qué recopilamos, por qué y tus opciones.",
      sections: [
        ["1. Datos que recopilamos",
         <p><strong>Cuenta:</strong> email, nombre, contraseña encriptada (bcrypt). Si usas Google, recibimos email, nombre y foto. <strong>Actividad:</strong> tu lista de deseos, alertas, estado de suscripción Pro. <strong>Pago:</strong> gestionado por Stripe — nunca vemos tu tarjeta. <strong>Técnicos:</strong> IP y navegador (logs ≤ 30 días).</p>],
        ["2. Cómo los usamos",
         <ul className="list-disc ps-5 space-y-1">
           <li>Prestar y personalizar el servicio.</li>
           <li>Procesar pagos vía Stripe.</li>
           <li>Enviar correos transaccionales únicamente.</li>
           <li>Detectar abusos y proteger la plataforma.</li>
         </ul>],
        ["3. Cookies",
         <p>Usamos cookies esenciales (session_token), funcionales (tema/idioma), de Stripe (durante el pago) y opcionalmente de AdSense/afiliados.</p>],
        ["4. Divulgación de Afiliados",
         <p>Algunos enlaces son de afiliados. Si compras un juego desde "Ver oferta", la tienda puede pagarnos una pequeña comisión sin costo extra para ti.</p>],
        ["5. Servicios de Terceros",
         <p>Stripe, CheapShark, Google. Ver sus respectivas políticas de privacidad.</p>],
        ["6. Tus derechos",
         <p>Puedes solicitar acceso, corrección o eliminación de tus datos en cualquier momento por correo.</p>],
        ["7. Niños",
         <p>No dirigido a menores de 13 años.</p>],
        ["8. Contacto",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:privacy@gamedeals.app">privacy@gamedeals.app</a></p>],
      ],
    },
  };

  const c = content[lng] || content.en;

  return (
    <div data-testid="privacy-page" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 border border-[#D4FF00]/40 bg-[#D4FF00]/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#D4FF00]">
          <ShieldCheck className="w-3 h-3"/> LEGAL
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight">{c.title}</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-500">Last updated · {updated}</p>
        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{c.intro}</p>
      </div>
      {c.sections.map(([title, body], i) => (
        <Section key={i} title={title}>{body}</Section>
      ))}
    </div>
  );
};

export default PrivacyPage;
