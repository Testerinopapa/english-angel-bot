export type SupportedLang = "en" | "pt" | "es";

export interface CheckoutTranslationSchema {
  common: {
    brandName: string;
    tagline: string;
    backHome: string;
    plansNav: string;
    checkoutNav: string;
    guaranteeRibbon: string;
    secureCheckout: string;
  };
  pricing: {
    badge: string;
    heading: string;
    subheading: string;
    billingCycleLabel: string;
    billingMonthly: string;
    billingSemi: string;
    billingYearly: string;
    save40Badge: string;
    save20Badge: string;
    popularBadge: string;
    bestValueBadge: string;
    monthlyPlanName: string;
    monthlyPrice: string;
    monthlyPeriod: string;
    monthlyDesc: string;
    monthlyCta: string;
    semiPlanName: string;
    semiPrice: string;
    semiPeriod: string;
    semiDesc: string;
    semiCta: string;
    yearlyPlanName: string;
    yearlyPrice: string;
    yearlyPeriod: string;
    yearlyDesc: string;
    yearlyCta: string;
    featuresHeading: string;
    featuresList: string[];
    comparisonHeading: string;
    comparisonSub: string;
    compColFeature: string;
    compColTrial: string;
    compColPremium: string;
    compRows: Array<{ name: string; trial: string; premium: string }>;
    guaranteeTitle: string;
    guaranteeDesc: string;
    faqHeading: string;
    faqSub: string;
    faqs: Array<{ q: string; a: string }>;
  };
  checkout: {
    badge: string;
    heading: string;
    subheading: string;
    step1Title: string;
    whatsappLabel: string;
    whatsappHelp: string;
    whatsappPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    step2Title: string;
    tabPix: string;
    tabCard: string;
    pixInstructions: string;
    pixCopyBtn: string;
    pixCopiedBtn: string;
    pixExpiryNote: string;
    cardNumberLabel: string;
    cardNameLabel: string;
    cardExpiryLabel: string;
    cardCvvLabel: string;
    cardInstallmentsLabel: string;
    installmentSingle: string;
    installmentOption: string;
    orderSummaryTitle: string;
    switchPlanLabel: string;
    subtotalLabel: string;
    discountLabel: string;
    totalLabel: string;
    submitBtn: string;
    processingBtn: string;
    guaranteeNotice: string;
    instantActivationNotice: string;
  };
  confirmation: {
    celebration: string;
    heading: string;
    subheading: string;
    receiptTitle: string;
    orderIdLabel: string;
    statusLabel: string;
    statusActive: string;
    phoneLabel: string;
    planLabel: string;
    expiresLabel: string;
    paymentMethodLabel: string;
    openWhatsAppBtn: string;
    nextStepsTitle: string;
    step1: string;
    step2: string;
    step3: string;
    needHelp: string;
    contactSupport: string;
    homeBtn: string;
  };
}

export const CHECKOUT_TRANSLATIONS: Record<SupportedLang, CheckoutTranslationSchema> = {
  en: {
    common: {
      brandName: "Talk'n'Bit",
      tagline: "AI English Coach on WhatsApp",
      backHome: "Back to Home",
      plansNav: "Plans",
      checkoutNav: "Checkout",
      guaranteeRibbon: "15-Day Money-Back Guarantee • 100% Risk Free",
      secureCheckout: "256-Bit SSL Encrypted & Secure",
    },
    pricing: {
      badge: "Simple, Transparent Plans",
      heading: "Invest in Your English Fluency",
      subheading: "Zero apps to download. No stressful classrooms. Just chat naturally on WhatsApp while AI discreetly corrects your mistakes in real-time.",
      billingCycleLabel: "Billing Cycle:",
      billingMonthly: "Monthly",
      billingSemi: "6 Months",
      billingYearly: "Annual (Save 40%)",
      save40Badge: "SAVE 40%",
      save20Badge: "SAVE 20%",
      popularBadge: "Most Popular",
      bestValueBadge: "Best Value",
      monthlyPlanName: "Monthly Plan",
      monthlyPrice: "R$ 36",
      monthlyPeriod: "/ month",
      monthlyDesc: "Billed monthly. Cancel anytime with 1 click.",
      monthlyCta: "Choose Monthly",
      semiPlanName: "Semiannual Plan",
      semiPrice: "R$ 29",
      semiPeriod: "/ month",
      semiDesc: "Billed R$ 174 every 6 months. Save R$ 84 (20%).",
      semiCta: "Choose Semiannual",
      yearlyPlanName: "Yearly Plan",
      yearlyPrice: "R$ 21",
      yearlyPeriod: "/ month",
      yearlyDesc: "Billed R$ 252 once per year. Save R$ 180 (40%).",
      yearlyCta: "Choose Yearly (Best Value)",
      featuresHeading: "Everything Included in Every Plan:",
      featuresList: [
        "Unlimited 1-on-1 English practice with AI",
        "Discreet private grammar correction whispers",
        "Interactive [Why? 💡] grammar explanation cards",
        "Study Buddy Practice Rooms with Secret-Watcher AI",
        "Bilingual Q&A (ask in Portuguese or Spanish)",
        "Voice notes and audio message corrections",
        "Daily tailored conversation topic starters",
        "Zero app downloads — 100% inside WhatsApp",
      ],
      comparisonHeading: "Compare Free Trial vs Premium",
      comparisonSub: "See why thousands of students upgrade to Talk'n'Bit Premium",
      compColFeature: "Feature",
      compColTrial: "Free Trial",
      compColPremium: "Premium Plan",
      compRows: [
        { name: "Daily Message Limit", trial: "15 messages total", premium: "Unlimited (24/7)" },
        { name: "1-on-1 AI Conversation", trial: "24 hours only", premium: "Unlimited 365 Days" },
        { name: "Discreet Grammar Whispers", trial: "Included", premium: "Included" },
        { name: "Interactive [Why? 💡] Grammar Cards", trial: "Basic", premium: "Comprehensive with rules" },
        { name: "Study Buddy Rooms (/join 101)", trial: "Limited to 1 room", premium: "Unlimited rooms & partners" },
        { name: "Voice Note Audio Corrections", trial: "Not included", premium: "Included" },
        { name: "Bilingual Portuguese/Spanish Help", trial: "Included", premium: "Included" },
        { name: "15-Day Money-Back Guarantee", trial: "N/A", premium: "100% Risk Free Refund" },
      ],
      guaranteeTitle: "15-Day 100% Money-Back Guarantee",
      guaranteeDesc: "Try Talk'n'Bit for 15 days. If you don't feel noticeably more confident speaking English, send a WhatsApp message or email support@talknbit.com and we will refund every penny immediately.",
      faqHeading: "Frequently Asked Questions",
      faqSub: "Quick answers about plans, billing, and how Talk'n'Bit works.",
      faqs: [
        {
          q: "How soon do I get access after paying?",
          a: "Immediately! As soon as your payment is confirmed, your WhatsApp number is automatically activated in our system. You can start texting the bot within seconds.",
        },
        {
          q: "Do I need to download any apps?",
          a: "No. Talk'n'Bit works completely inside the WhatsApp you already have installed on your phone.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can cancel your subscription at any time with zero penalty or hidden fees.",
        },
        {
          q: "What payment methods are supported?",
          a: "We support instant Pix (with zero wait time) and all major Credit Cards with installments up to 12x.",
        },
      ],
    },
    checkout: {
      badge: "Fast & Secure Checkout",
      heading: "Activate Your Talk'n'Bit Plan",
      subheading: "Instant WhatsApp English access activated directly for your phone number.",
      step1Title: "1. Student & WhatsApp Information",
      whatsappLabel: "WhatsApp Phone Number (with Country Code)",
      whatsappHelp: "⚡ Crucial: Talk'n'Bit will activate AI English coaching directly on this WhatsApp number.",
      whatsappPlaceholder: "55 13 99187-8104",
      nameLabel: "Your Full Name",
      namePlaceholder: "e.g. Maria Silva",
      emailLabel: "Email Address (for order receipt)",
      emailPlaceholder: "maria@example.com",
      step2Title: "2. Select Payment Method",
      tabPix: "⚡ Pix (Instant Activation)",
      tabCard: "💳 Credit Card",
      pixInstructions: "Pay via your banking app using the QR code or Pix code below. Your Talk'n'Bit access is activated the moment payment clears!",
      pixCopyBtn: "Copy Pix Code",
      pixCopiedBtn: "Pix Code Copied! ✅",
      pixExpiryNote: "Code valid for 15 minutes. Instant confirmation.",
      cardNumberLabel: "Card Number",
      cardNameLabel: "Cardholder Name (as printed)",
      cardExpiryLabel: "Expires (MM/YY)",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Installments",
      installmentSingle: "1x of {amount} (No interest)",
      installmentOption: "{count}x of {amount}",
      orderSummaryTitle: "Order Summary",
      switchPlanLabel: "Change plan:",
      subtotalLabel: "Regular Price",
      discountLabel: "Discount",
      totalLabel: "Total Due Today",
      submitBtn: "Complete Order & Activate WhatsApp 🚀",
      processingBtn: "Activating Your Access...",
      guaranteeNotice: "Protected by our 15-Day 100% Money-Back Guarantee.",
      instantActivationNotice: "Instant bot activation on WhatsApp upon confirmation.",
    },
    confirmation: {
      celebration: "🎉 Payment Confirmed!",
      heading: "Welcome to Talk'n'Bit!",
      subheading: "Your WhatsApp English coaching access is now fully active.",
      receiptTitle: "Order Receipt",
      orderIdLabel: "Order Reference",
      statusLabel: "Status",
      statusActive: "Active & Ready",
      phoneLabel: "Activated WhatsApp Number",
      planLabel: "Selected Plan",
      expiresLabel: "Access Active Until",
      paymentMethodLabel: "Payment Method",
      openWhatsAppBtn: "Open WhatsApp & Say Hello to Talk'n'Bit 💬",
      nextStepsTitle: "Get Started in 3 Easy Steps:",
      step1: "1. Tap the green button above to open WhatsApp.",
      step2: "2. Send your first greeting message (e.g., 'Hello!').",
      step3: "3. Practice daily conversation and get instant private corrections!",
      needHelp: "Need any help with your account?",
      contactSupport: "Contact our WhatsApp support team anytime.",
      homeBtn: "Return to Home Page",
    },
  },

  pt: {
    common: {
      brandName: "Talk'n'Bit",
      tagline: "Seu Parceiro de Inglês com IA no WhatsApp",
      backHome: "Voltar para o Início",
      plansNav: "Planos",
      checkoutNav: "Checkout",
      guaranteeRibbon: "Garantia de 15 Dias • Risco 100% Zero",
      secureCheckout: "Pagamento 256-Bit SSL Criptografado & Seguro",
    },
    pricing: {
      badge: "Planos Simples e Transparentes",
      heading: "Invista na Sua Fluência em Inglês",
      subheading: "Sem novos aplicativos para baixar. Sem aulas chatas. Você apenas conversa no WhatsApp enquanto a IA sussurra correções em tempo real.",
      billingCycleLabel: "Frequência de Pagamento:",
      billingMonthly: "Mensal",
      billingSemi: "Semestral",
      billingYearly: "Anual (40% OFF)",
      save40Badge: "ECONOMIZE 40%",
      save20Badge: "ECONOMIZE 20%",
      popularBadge: "Mais Popular",
      bestValueBadge: "Melhor Custo-Benefício",
      monthlyPlanName: "Plano Mensal",
      monthlyPrice: "R$ 36",
      monthlyPeriod: "/ mês",
      monthlyDesc: "Cobrado mensalmente. Cancele quando quiser sem multas.",
      monthlyCta: "Escolher Plano Mensal",
      semiPlanName: "Plano Semestral",
      semiPrice: "R$ 29",
      semiPeriod: "/ mês",
      semiDesc: "Cobrado R$ 174 a cada 6 meses. Economize R$ 84 (20%).",
      semiCta: "Escolher Plano Semestral",
      yearlyPlanName: "Plano Anual",
      yearlyPrice: "R$ 21",
      yearlyPeriod: "/ mês",
      yearlyDesc: "Cobrado R$ 252 uma vez por ano. Economize R$ 180 (40%).",
      yearlyCta: "Escolher Plano Anual (Mais Popular)",
      featuresHeading: "Tudo o que está incluído no seu plano:",
      featuresList: [
        "Prática 1-a-1 ilimitada em inglês com inteligência artificial",
        "Correções gramaticais discretas e privadas no WhatsApp",
        "Cartões interativos de explicação gramatical [Por quê? 💡]",
        "Salas Study Buddy com modo Observador Secreto",
        "Tire dúvidas em português a qualquer momento",
        "Feedback e correções para áudios e mensagens de voz",
        "Tópicos diários e sugestões de conversa para destravar",
        "100% dentro do WhatsApp, sem ocupar memória do celular",
      ],
      comparisonHeading: "Comparativo: Teste Grátis vs Plano Premium",
      comparisonSub: "Descubra por que milhares de estudantes assinam o Talk'n'Bit Premium",
      compColFeature: "Recurso",
      compColTrial: "Teste Gratuito",
      compColPremium: "Plano Premium",
      compRows: [
        { name: "Limite de Mensagens", trial: "15 mensagens no total", premium: "Ilimitado (24h/7d)" },
        { name: "Conversa 1-a-1 com IA", trial: "Apenas 24 horas", premium: "Ilimitado por 365 Dias" },
        { name: "Sussurros de Correção Privada", trial: "Incluído", premium: "Incluído" },
        { name: "Cartões de Gramática [Por quê? 💡]", trial: "Básico", premium: "Completo com regras e exemplos" },
        { name: "Salas Study Buddy (/join 101)", trial: "Apenas 1 sala", premium: "Salas e parceiros ilimitados" },
        { name: "Correção de Áudios de Voz", trial: "Não incluído", premium: "Incluído" },
        { name: "Ajuda Bilíngue em Português", trial: "Incluído", premium: "Incluído" },
        { name: "Garantia de Reembolso de 15 Dias", trial: "N/A", premium: "Reembolso 100% Sem Burocracia" },
      ],
      guaranteeTitle: "Garantia Incondicional de 15 Dias",
      guaranteeDesc: "Experimente o Talk'n'Bit por 15 dias. Se não sentir evolução na sua segurança para falar inglês, nos mande uma mensagem no WhatsApp ou email para support@talknbit.com e devolveremos 100% do seu dinheiro imediatamente.",
      faqHeading: "Dúvidas Frequentes sobre os Planos",
      faqSub: "Tudo o que você precisa saber sobre ativação, pagamento e cancelamento.",
      faqs: [
        {
          q: "Em quanto tempo meu acesso é liberado após o pagamento?",
          a: "Imediatamente! Assim que o pagamento (Pix ou Cartão) é confirmado, seu número de WhatsApp é ativado automaticamente pelo nosso sistema. Você já pode mandar mensagem pro bot.",
        },
        {
          q: "Preciso baixar algum app novo?",
          a: "Não! O Talk'n'Bit funciona 100% dentro do WhatsApp que você já usa todos os dias no seu celular ou computador.",
        },
        {
          q: "Posso cancelar quando quiser?",
          a: "Sim, você pode cancelar a renovação da sua assinatura a qualquer momento com apenas 1 clique ou nos avisando no WhatsApp.",
        },
        {
          q: "Quais são as formas de pagamento aceitas?",
          a: "Aceitamos Pix instantâneo (aprovação na hora) e Cartão de Crédito com parcelamento em até 12x.",
        },
      ],
    },
    checkout: {
      badge: "Checkout Seguro & Rápido",
      heading: "Ative Seu Plano Talk'n'Bit",
      subheading: "Acesso imediato de inglês ativado diretamente no seu número de WhatsApp.",
      step1Title: "1. Dados do Aluno & WhatsApp",
      whatsappLabel: "Número do WhatsApp (com DDI e DDD)",
      whatsappHelp: "⚡ Importante: O Talk'n'Bit ativará o tutor de inglês diretamente neste número de WhatsApp.",
      whatsappPlaceholder: "55 13 99187-8104",
      nameLabel: "Seu Nome Completo",
      namePlaceholder: "ex: Maria Silva",
      emailLabel: "Endereço de E-mail (para envio do comprovante)",
      emailPlaceholder: "maria@exemplo.com",
      step2Title: "2. Escolha a Forma de Pagamento",
      tabPix: "⚡ Pix (Ativação Imediata)",
      tabCard: "💳 Cartão de Crédito",
      pixInstructions: "Abra o aplicativo do seu banco, escaneie o QR Code ou copie o código Pix abaixo. Seu acesso é liberado instantaneamente!",
      pixCopyBtn: "Copiar Código Pix",
      pixCopiedBtn: "Código Pix Copiado! ✅",
      pixExpiryNote: "Código válido por 15 minutos. Confirmação instantânea.",
      cardNumberLabel: "Número do Cartão",
      cardNameLabel: "Nome impresso no Cartão",
      cardExpiryLabel: "Validade (MM/AA)",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Opções de Parcelamento",
      installmentSingle: "1x de {amount} (Sem juros)",
      installmentOption: "{count}x de {amount}",
      orderSummaryTitle: "Resumo do Pedido",
      switchPlanLabel: "Mudar plano:",
      subtotalLabel: "Preço Padrão",
      discountLabel: "Desconto Promocional",
      totalLabel: "Total a Pagar",
      submitBtn: "Concluir Pedido e Ativar WhatsApp 🚀",
      processingBtn: "Ativando Seu Acesso no WhatsApp...",
      guaranteeNotice: "Protegido por nossa Garantia de 15 Dias 100% Sem Risco.",
      instantActivationNotice: "Ativação imediata do bot no WhatsApp logo após confirmação.",
    },
    confirmation: {
      celebration: "🎉 Pagamento Confirmado!",
      heading: "Bem-vindo(a) ao Talk'n'Bit!",
      subheading: "Seu acesso ao tutor de inglês no WhatsApp já está 100% ativo.",
      receiptTitle: "Comprovante do Pedido",
      orderIdLabel: "Código do Pedido",
      statusLabel: "Status do Acesso",
      statusActive: "Ativo & Pronto",
      phoneLabel: "Número de WhatsApp Ativado",
      planLabel: "Plano Escolhido",
      expiresLabel: "Acesso Válido Até",
      paymentMethodLabel: "Forma de Pagamento",
      openWhatsAppBtn: "Abrir WhatsApp e Começar a Praticar 💬",
      nextStepsTitle: "Como Começar em 3 Passos Simples:",
      step1: "1. Toque no botão verde acima para abrir a conversa no WhatsApp.",
      step2: "2. Envie uma primeira mensagem em inglês (ex: 'Hi!').",
      step3: "3. Receba sua primeira correção da IA e comece a destravar sua fala!",
      needHelp: "Precisa de ajuda com sua conta?",
      contactSupport: "Fale com nossa equipe de suporte no WhatsApp a qualquer momento.",
      homeBtn: "Voltar para a Página Inicial",
    },
  },

  es: {
    common: {
      brandName: "Talk'n'Bit",
      tagline: "Tu Compañero de Inglés con IA en WhatsApp",
      backHome: "Volver al Inicio",
      plansNav: "Planes",
      checkoutNav: "Checkout",
      guaranteeRibbon: "Garantía de 15 Días • 100% Sin Riesgo",
      secureCheckout: "Pago 256-Bit SSL Cifrado y Seguro",
    },
    pricing: {
      badge: "Planes Simples y Transparentes",
      heading: "Invierte en Tu Fluidez en Inglés",
      subheading: "Sin descargar apps adicionales ni horarios complicados. Chatea de forma natural en WhatsApp mientras la IA te susurra correcciones en tiempo real.",
      billingCycleLabel: "Frecuencia de Pago:",
      billingMonthly: "Mensual",
      billingSemi: "Semestral",
      billingYearly: "Anual (40% OFF)",
      save40Badge: "AHORRA 40%",
      save20Badge: "AHORRA 20%",
      popularBadge: "Más Popular",
      bestValueBadge: "Mejor Valor",
      monthlyPlanName: "Plan Mensual",
      monthlyPrice: "BRL 36",
      monthlyPeriod: "/ mes",
      monthlyDesc: "Facturado mensualmente. Cancela cuando quieras sin compromiso.",
      monthlyCta: "Elegir Plan Mensual",
      semiPlanName: "Plan Semestral",
      semiPrice: "BRL 29",
      semiPeriod: "/ mes",
      semiDesc: "Facturado BRL 174 cada 6 meses. Ahorra BRL 84 (20%).",
      semiCta: "Elegir Plan Semestral",
      yearlyPlanName: "Plan Anual",
      yearlyPrice: "BRL 21",
      yearlyPeriod: "/ mes",
      yearlyDesc: "Facturado BRL 252 una vez al año. Ahorra BRL 180 (40%).",
      yearlyCta: "Elegir Plan Anual (Más Popular)",
      featuresHeading: "Todo lo que incluye cada plan:",
      featuresList: [
        "Práctica 1-a-1 ilimitada en inglés con inteligencia artificial",
        "Correcciones gramaticales privadas y discretas en WhatsApp",
        "Tarjetas explicativas interactivas de gramática [¿Por qué? 💡]",
        "Salas Study Buddy con modo Observador Secreto",
        "Resuelve dudas en español en cualquier momento",
        "Corrección de notas de voz y audios",
        "Iniciadores diarios de temas de conversación",
        "100% en WhatsApp, sin ocupar espacio de almacenamiento",
      ],
      comparisonHeading: "Comparativa: Prueba Gratis vs Plan Premium",
      comparisonSub: "Descubre por qué miles de estudiantes eligen Talk'n'Bit Premium",
      compColFeature: "Función",
      compColTrial: "Prueba Gratuita",
      compColPremium: "Plan Premium",
      compRows: [
        { name: "Límite de Mensajes", trial: "15 mensajes en total", premium: "Ilimitado (24/7)" },
        { name: "Conversación 1-a-1 con IA", trial: "Solo 24 horas", premium: "Ilimitado por 365 Días" },
        { name: "Susurros Privados de Corrección", trial: "Incluido", premium: "Incluido" },
        { name: "Tarjetas [¿Por qué? 💡]", trial: "Básico", premium: "Completo con reglas y ejemplos" },
        { name: "Salas Study Buddy (/join 101)", trial: "Solo 1 sala", premium: "Salas y compañeros ilimitados" },
        { name: "Corrección de Audios de Voz", trial: "No incluido", premium: "Incluido" },
        { name: "Ayuda Bilingüe en Español", trial: "Incluido", premium: "Incluido" },
        { name: "Garantía de Reembolso de 15 Días", trial: "N/A", premium: "Reembolso 100% Sin Complicaciones" },
      ],
      guaranteeTitle: "Garantía Incondicional de 15 Días",
      guaranteeDesc: "Prueba Talk'n'Bit durante 15 días. Si no sientes un avance claro en tu confianza para hablar inglés, envíanos un mensaje por WhatsApp o email a support@talknbit.com y te reembolsaremos el 100% de inmediato.",
      faqHeading: "Preguntas Frecuentes sobre los Planes",
      faqSub: "Respuestas claras sobre activación, formas de pago y cancelación.",
      faqs: [
        {
          q: "¿Cuánto tarda en activarse mi acceso tras el pago?",
          a: "¡Al instante! En cuanto se confirma el pago, tu número de WhatsApp queda registrado y activado. Puedes comenzar a chatear con el bot en segundos.",
        },
        {
          q: "¿Necesito descargar alguna app?",
          a: "No. Talk'n'Bit funciona 100% dentro de la aplicación de WhatsApp que ya usas a diario.",
        },
        {
          q: "¿Puedo cancelar en cualquier momento?",
          a: "Sí, puedes cancelar la renovación cuando desees directamente con un mensaje o por email.",
        },
        {
          q: "¿Cuáles son las formas de pago?",
          a: "Aceptamos Pix instantáneo y todas las Tarjetas de Crédito con opción a cuotas.",
        },
      ],
    },
    checkout: {
      badge: "Checkout Rápido y Seguro",
      heading: "Activa Tu Plan Talk'n'Bit",
      subheading: "Acceso inmediato activado directamente en tu número de WhatsApp.",
      step1Title: "1. Datos del Estudiante y WhatsApp",
      whatsappLabel: "Número de WhatsApp (con código de país)",
      whatsappHelp: "⚡ Importante: Talk'n'Bit activará el tutor de inglés directamente en este número de WhatsApp.",
      whatsappPlaceholder: "55 13 99187-8104",
      nameLabel: "Tu Nombre Completo",
      namePlaceholder: "ej: Maria Silva",
      emailLabel: "Correo Electrónico (para el recibo)",
      emailPlaceholder: "maria@ejemplo.com",
      step2Title: "2. Elige la Forma de Pago",
      tabPix: "⚡ Pix (Activación Inmediata)",
      tabCard: "💳 Tarjeta de Crédito",
      pixInstructions: "Abre la app de tu banco, escanea el código QR o copia el código Pix abajo. ¡Tu acceso se activa de inmediato!",
      pixCopyBtn: "Copiar Código Pix",
      pixCopiedBtn: "¡Código Pix Copiado! ✅",
      pixExpiryNote: "Código válido por 15 minutos. Confirmación instantánea.",
      cardNumberLabel: "Número de Tarjeta",
      cardNameLabel: "Nombre impreso en la Tarjeta",
      cardExpiryLabel: "Vencimiento (MM/AA)",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Cuotas",
      installmentSingle: "1 cuota de {amount} (Sin interés)",
      installmentOption: "{count} cuotas de {amount}",
      orderSummaryTitle: "Resumen del Pedido",
      switchPlanLabel: "Cambiar plan:",
      subtotalLabel: "Precio Regular",
      discountLabel: "Descuento Promocional",
      totalLabel: "Total a Pagar",
      submitBtn: "Completar Pedido y Activar WhatsApp 🚀",
      processingBtn: "Activando Tu Acceso en WhatsApp...",
      guaranteeNotice: "Protegido por nuestra Garantía de 15 Días 100% Sin Riesgo.",
      instantActivationNotice: "Activación inmediata del bot en WhatsApp tras confirmar el pago.",
    },
    confirmation: {
      celebration: "🎉 ¡Pago Confirmado!",
      heading: "¡Te Damos la Bienvenida a Talk'n'Bit!",
      subheading: "Tu acceso al tutor de inglés en WhatsApp ya está 100% activo.",
      receiptTitle: "Recibo del Pedido",
      orderIdLabel: "Código del Pedido",
      statusLabel: "Estado",
      statusActive: "Activo y Listo",
      phoneLabel: "Número de WhatsApp Activado",
      planLabel: "Plan Elegido",
      expiresLabel: "Acceso Válido Hasta",
      paymentMethodLabel: "Forma de Pago",
      openWhatsAppBtn: "Abrir WhatsApp y Empezar a Practicar 💬",
      nextStepsTitle: "Empieza en 3 Pasos Sencillos:",
      step1: "1. Toca el botón verde arriba para abrir la conversación en WhatsApp.",
      step2: "2. Envía tu primer mensaje en inglés (ej: 'Hi!').",
      step3: "3. ¡Recibe tu primera corrección y practica todos los días!",
      needHelp: "¿Necesitas ayuda con tu cuenta?",
      contactSupport: "Escríbele a nuestro equipo de soporte por WhatsApp cuando quieras.",
      homeBtn: "Volver a la Página Principal",
    },
  },
};
