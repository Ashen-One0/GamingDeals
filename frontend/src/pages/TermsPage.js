import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Mail } from "lucide-react";

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
    <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-2">{children}</div>
  </section>
);

const TermsPage = () => {
  const { i18n } = useTranslation();
  const lng = i18n.language?.slice(0, 2) || "en";
  const updated = "February 2026";

  const content = {
    en: {
      title: "Terms of Service",
      intro: "By using GamingDeals you agree to these terms. Please read them carefully.",
      sections: [
        ["1. The Service",
         <p>GamingDeals aggregates publicly available game deals from third-party stores via the CheapShark API. We are not a reseller and do not handle game keys or downloads. All purchases happen on the respective store's website.</p>],
        ["2. Accounts",
         <p>You are responsible for keeping your password confidential. Provide accurate information when registering. We may suspend accounts that abuse the service (e.g. automated scraping, payment fraud).</p>],
        ["3. Pro Subscriptions",
         <ul className="list-disc ps-5 space-y-1">
           <li>Monthly ($4.99) and Yearly ($39.99) plans, billed in USD via Stripe.</li>
           <li>Auto-renews until cancelled.</li>
           <li>Cancel anytime — access continues until the end of the paid period.</li>
           <li>Refunds: 14-day money-back for first-time subscribers; otherwise no refunds for partial periods.</li>
         </ul>],
        ["4. Affiliate Links",
         <p>"View Deal" buttons are affiliate links. We may earn a commission when you purchase. This does not affect price or the deals you see — full disclosure in our Privacy Policy.</p>],
        ["5. Prohibited Use",
         <p>You may not: scrape the site automatically, resell the service, attempt to bypass payment, or use the service for illegal purposes.</p>],
        ["6. Disclaimer",
         <p>Prices, discounts and availability come from third parties and may be inaccurate or outdated. Always verify on the store's site before purchasing. GamingDeals is provided "as is" without warranty.</p>],
        ["7. Limitation of Liability",
         <p>To the maximum extent permitted by law, GamingDeals is not liable for any indirect or consequential damages arising from use of the service.</p>],
        ["8. Changes",
         <p>We may update these terms; significant changes will be notified by email or in-app banner.</p>],
        ["9. Contact",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:Gamingdeals01@gmail.com">Gamingdeals01@gmail.com</a></p>],
      ],
    },
    ar: {
      title: "شروط الخدمة",
      intro: "باستخدامك GamingDeals فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية.",
      sections: [
        ["1. الخدمة",
         <p>تجمع GamingDeals صفقات الألعاب المتاحة للعموم من متاجر طرف ثالث عبر CheapShark API. لسنا متجراً ولا نتعامل مع مفاتيح الألعاب — كل عملية شراء تتم على موقع المتجر المعني.</p>],
        ["2. الحسابات",
         <p>أنت مسؤول عن سرية كلمة المرور. قدّم بيانات دقيقة عند التسجيل. قد نُعلّق الحسابات التي تسيء استخدام الخدمة.</p>],
        ["3. اشتراكات Pro",
         <ul className="list-disc ps-5 space-y-1">
           <li>خطة شهرية ($4.99) وسنوية ($39.99) بالدولار عبر Stripe.</li>
           <li>تتجدد تلقائياً حتى الإلغاء.</li>
           <li>الإلغاء في أي وقت — الوصول مستمر حتى نهاية الفترة المدفوعة.</li>
           <li>الاسترداد: 14 يوماً للمشتركين لأول مرة فقط.</li>
         </ul>],
        ["4. روابط Affiliate",
         <p>أزرار "View Deal" هي روابط affiliate. قد نحصل على عمولة عند الشراء — دون أي تكلفة إضافية عليك.</p>],
        ["5. الاستخدامات المحظورة",
         <p>يُحظر: السكرابينج الآلي، إعادة بيع الخدمة، تجاوز الدفع، أو استخدامها لأغراض غير قانونية.</p>],
        ["6. إخلاء المسؤولية",
         <p>الأسعار والخصومات تأتي من أطراف ثالثة وقد تكون قديمة أو غير دقيقة. تحقّق دائماً على موقع المتجر قبل الشراء.</p>],
        ["7. تحديد المسؤولية",
         <p>إلى أقصى حد يسمح به القانون، GamingDeals غير مسؤولة عن أي أضرار غير مباشرة.</p>],
        ["8. التغييرات",
         <p>قد نحدّث هذه الشروط — التغييرات الجوهرية يتم إعلامك بها عبر البريد أو إشعار داخل التطبيق.</p>],
        ["9. التواصل",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:Gamingdeals01@gmail.com">Gamingdeals01@gmail.com</a></p>],
      ],
    },
    es: {
      title: "Términos de Servicio",
      intro: "Al usar GamingDeals aceptas estos términos. Léelos detenidamente.",
      sections: [
        ["1. El Servicio",
         <p>GamingDeals agrupa ofertas públicas de tiendas externas vía CheapShark API. No somos revendedores; toda compra ocurre en la web del minorista.</p>],
        ["2. Cuentas",
         <p>Eres responsable de mantener tu contraseña segura. Podemos suspender cuentas que abusen del servicio.</p>],
        ["3. Suscripciones Pro",
         <ul className="list-disc ps-5 space-y-1">
           <li>Plan Mensual ($4.99) y Anual ($39.99) vía Stripe.</li>
           <li>Renovación automática hasta cancelación.</li>
           <li>Cancela cuando quieras — acceso hasta el fin del periodo.</li>
           <li>Reembolsos: 14 días para primeros suscriptores.</li>
         </ul>],
        ["4. Enlaces de Afiliados",
         <p>Los botones "Ver oferta" son enlaces de afiliados. Podemos ganar comisión por tu compra sin costo extra para ti.</p>],
        ["5. Uso Prohibido",
         <p>No se permite scraping automático, reventa, eludir pagos, ni uso ilícito.</p>],
        ["6. Descargo",
         <p>Los precios provienen de terceros y pueden ser inexactos. Verifica en la tienda antes de comprar.</p>],
        ["7. Limitación de Responsabilidad",
         <p>GamingDeals no se hace responsable por daños indirectos en la medida permitida por la ley.</p>],
        ["8. Cambios",
         <p>Podemos actualizar estos términos — cambios importantes se notificarán.</p>],
        ["9. Contacto",
         <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> <a className="text-[#D4FF00] underline" href="mailto:Gamingdeals01@gmail.com">Gamingdeals01@gmail.com</a></p>],
      ],
    },
  };

  const c = content[lng] || content.en;

  return (
    <div data-testid="terms-page" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 border border-[#D4FF00]/40 bg-[#D4FF00]/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#D4FF00]">
          <FileText className="w-3 h-3"/> LEGAL
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

export default TermsPage;
