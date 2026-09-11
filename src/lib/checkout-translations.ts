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
    trialPlanName: string;
    trialPrice: string;
    trialPeriod: string;
    trialDesc: string;
    trialCta: string;
    trialBadge: string;
    trialPhoneNotice: string;
    trialCardHeader: string;
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
    emailOptional: string;
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
    trialStep2Title: string;
    trialStep2Desc: string;
    trialNoPaymentNeeded: string;
    trialOnePhoneAlert: string;
    trialSubmitBtn: string;
    trialReceiptBadge: string;
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
    trialActivatedTitle: string;
    trialActivatedSub: string;
    trialOpenWhatsAppBtn: string;
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
      subheading: "Chat naturally in English every day on WhatsApp. Instant AI corrections, whisper grammar hints, and study rooms.",
      billingCycleLabel: "Billing cycle:",
      billingMonthly: "Monthly",
      billingSemi: "6 Months",
      billingYearly: "Annual (Save 40%)",
      save40Badge: "SAVE 40%",
      save20Badge: "SAVE 20%",
      popularBadge: "Most Popular",
      bestValueBadge: "Best Value",
      trialPlanName: "15-Day Free Trial",
      trialPrice: "R$ 0",
      trialPeriod: "/ 15 days",
      trialDesc: "Full access for 15 days to activate 1 WhatsApp phone. Zero payment or credit card required.",
      trialCta: "Start 15-Day Free Trial",
      trialBadge: "100% FREE",
      trialPhoneNotice: "Allows 1 WhatsApp phone number to activate the bot",
      trialCardHeader: "Want to try first? Get 15 days completely free.",
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
      comparisonSub: "See what is included in the 15-day trial vs ongoing premium",
      compColFeature: "Feature",
      compColTrial: "15-Day Free Trial",
      compColPremium: "Premium Plan",
      compRows: [
        { name: "Activated Phone Numbers", trial: "1 WhatsApp Number", premium: "1 WhatsApp Number (Changeable)" },
        { name: "Trial Duration", trial: "15 Days Full Access", premium: "Unlimited (Monthly / Annual)" },
        { name: "1-on-1 AI Conversation", trial: "Included for 15 Days", premium: "Unlimited 365 Days" },
        { name: "Discreet Grammar Whispers", trial: "Included", premium: "Included" },
        { name: "Interactive [Why? 💡] Grammar Cards", trial: "Included", premium: "Comprehensive with rules" },
        { name: "Study Buddy Rooms (/join 101)", trial: "Included", premium: "Unlimited rooms & partners" },
        { name: "Voice Note Audio Corrections", trial: "Included", premium: "Included" },
        { name: "Bilingual Portuguese/Spanish Help", trial: "Included", premium: "Included" },
        { name: "15-Day Money-Back Guarantee", trial: "N/A (Free)", premium: "100% Risk Free Refund" },
      ],
      guaranteeTitle: "15-Day 100% Money-Back Guarantee",
      guaranteeDesc: "Try Talk'n'Bit for 15 days. If you don't feel noticeably more confident speaking English, send a WhatsApp message or email support@talknbit.com and we will refund every penny immediately.",
      faqHeading: "Frequently Asked Questions",
      faqSub: "Quick answers about plans, billing, and how Talk'n'Bit works.",
      faqs: [
        {
          q: "How does the 15-day free trial work?",
          a: "You select the 15-Day Free Trial plan, enter your name, email, and 1 WhatsApp phone number. Your number is instantly activated in our system with zero charge. No credit card is required.",
        },
        {
          q: "How many phone numbers can I activate with the free trial?",
          a: "The free trial allows exactly 1 phone number to activate the bot. Once that number has completed its 15-day trial, you can upgrade to a monthly or yearly plan to keep practicing.",
        },
        {
          q: "How soon do I get access after sign-up?",
          a: "Immediately! Your WhatsApp number is automatically activated in our system. You can start texting the bot within seconds.",
        },
        {
          q: "Do I need to download any apps?",
          a: "No. Talk'n'Bit works completely inside the WhatsApp you already have installed on your phone.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can cancel your paid subscription at any time with zero penalty or hidden fees.",
        },
        {
          q: "What payment methods are supported for paid plans?",
          a: "We support instant Pix (with zero wait time) and all major Credit Cards with installments up to 12x.",
        },
      ],
    },
    checkout: {
      badge: "Fast & Secure Activation",
      heading: "Activate Your English Coach",
      subheading: "Takes less than 1 minute. Direct WhatsApp bot activation.",
      step1Title: "1. Student Contact Information",
      whatsappLabel: "WhatsApp Phone Number (1 Phone)",
      whatsappHelp: "This single phone number will be authorized to chat with the bot.",
      whatsappPlaceholder: "(13) 99187-8104",
      nameLabel: "Your Full Name",
      namePlaceholder: "e.g. Maria Silva",
      emailLabel: "Email Address",
      emailOptional: "optional",
      emailPlaceholder: "maria@example.com",
      step2Title: "2. Payment Method",
      tabPix: "Pix (Instant)",
      tabCard: "Credit Card",
      pixInstructions: "Scan the QR code in your banking app or copy the Pix code below:",
      pixCopyBtn: "Copy Pix Code",
      pixCopiedBtn: "Copied to Clipboard!",
      pixExpiryNote: "Pix QR code valid for 30 minutes. Instant bot activation upon confirmation.",
      cardNumberLabel: "Card Number",
      cardNameLabel: "Cardholder Name (as printed on card)",
      cardExpiryLabel: "Expiry Date",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Installments",
      installmentSingle: "1x (Full amount)",
      installmentOption: "Installments",
      orderSummaryTitle: "Order Summary",
      switchPlanLabel: "Switch Plan:",
      subtotalLabel: "Subtotal",
      discountLabel: "Savings",
      totalLabel: "Total Due Today",
      submitBtn: "Complete Payment & Activate WhatsApp →",
      processingBtn: "Activating Your WhatsApp...",
      guaranteeNotice: "15-day unconditional money-back guarantee. Cancel anytime.",
      instantActivationNotice: "Instant bot activation on WhatsApp upon confirmation.",
      trialStep2Title: "2. Zero Payment Required",
      trialStep2Desc: "Your 15-day free trial gives full 1-on-1 English coaching to 1 WhatsApp phone number. No credit card or Pix needed.",
      trialNoPaymentNeeded: "🎉 Free Trial: You will not be charged anything today.",
      trialOnePhoneAlert: "⚠️ Note: Exactly 1 WhatsApp phone number is allowed per free trial.",
      trialSubmitBtn: "Activate 15-Day Free Trial (1 Phone) →",
      trialReceiptBadge: "15-Day Free Trial",
    },
    confirmation: {
      celebration: "Payment Confirmed! 🚀",
      heading: "You're All Set to Speak English!",
      subheading: "Your WhatsApp number is active in our system. You can now chat 1-on-1 with Talk'n'Bit.",
      receiptTitle: "Subscription Receipt",
      orderIdLabel: "Order Reference",
      statusLabel: "Status",
      statusActive: "Active & Ready",
      phoneLabel: "Activated WhatsApp",
      planLabel: "Plan",
      expiresLabel: "Active Until",
      paymentMethodLabel: "Payment Method",
      openWhatsAppBtn: "Open WhatsApp & Say Hello →",
      nextStepsTitle: "How to Begin in 3 Steps:",
      step1: "Click the green button above to open WhatsApp on your phone or desktop.",
      step2: "Send your first message or voice note in English (e.g. 'Hi, I'm ready to learn!').",
      step3: "Receive your first AI correction card and grammar assessment within seconds.",
      needHelp: "Need help getting started?",
      contactSupport: "Chat with Talk'n'Bit Support on WhatsApp",
      homeBtn: "Return to Homepage",
      trialActivatedTitle: "15-Day Free Trial Activated! 🎉",
      trialActivatedSub: "Your WhatsApp phone number has been activated for 15 days of unlimited English coaching.",
      trialOpenWhatsAppBtn: "Open WhatsApp & Start 15-Day Trial →",
    },
  },

  pt: {
    common: {
      brandName: "Talk'n'Bit",
      tagline: "Seu Mentor de Inglês no WhatsApp com IA",
      backHome: "Voltar para o Início",
      plansNav: "Planos",
      checkoutNav: "Finalizar Inscrição",
      guaranteeRibbon: "Garantia de 15 Dias • 100% Livre de Riscos",
      secureCheckout: "Criptografia SSL de 256 Bits • 100% Seguro",
    },
    pricing: {
      badge: "Planos Simples e Transparentes",
      heading: "Invista na Sua Fluência em Inglês",
      subheading: "Converse naturalmente em inglês todos os dias no WhatsApp. Correções imediatas por IA, sussurros gramaticais e salas de estudo.",
      billingCycleLabel: "Ciclo de cobrança:",
      billingMonthly: "Mensal",
      billingSemi: "6 Meses",
      billingYearly: "Anual (Economize 40%)",
      save40Badge: "ECONOMIZE 40%",
      save20Badge: "ECONOMIZE 20%",
      popularBadge: "Mais Escolhido",
      bestValueBadge: "Melhor Custo-Benefício",
      trialPlanName: "Teste Grátis de 15 Dias",
      trialPrice: "R$ 0",
      trialPeriod: "/ 15 dias",
      trialDesc: "Acesso completo por 15 dias para ativar 1 número de WhatsApp. Nenhum pagamento ou cartão de crédito necessário.",
      trialCta: "Começar Teste de 15 Dias",
      trialBadge: "100% GRÁTIS",
      trialPhoneNotice: "Permite ativar apenas 1 número de WhatsApp no bot",
      trialCardHeader: "Quer testar primeiro? Tenha 15 dias totalmente grátis.",
      monthlyPlanName: "Plano Mensal",
      monthlyPrice: "R$ 36",
      monthlyPeriod: "/ mês",
      monthlyDesc: "Cobrança mensal. Cancele quando quiser com 1 clique.",
      monthlyCta: "Escolher Mensal",
      semiPlanName: "Plano Semestral",
      semiPrice: "R$ 29",
      semiPeriod: "/ mês",
      semiDesc: "Cobrado R$ 174 a cada 6 meses. Economize R$ 84 (20%).",
      semiCta: "Escolher Semestral",
      yearlyPlanName: "Plano Anual",
      yearlyPrice: "R$ 21",
      yearlyPeriod: "/ mês",
      yearlyDesc: "Cobrado R$ 252 uma vez ao ano. Economize R$ 180 (40%).",
      yearlyCta: "Escolher Anual (Melhor Oferta)",
      featuresHeading: "Tudo Incluído em Todos os Planos:",
      featuresList: [
        "Prática individual de inglês ilimitada com IA",
        "Sussurros discretos de correção gramatical",
        "Cards explicativos interativos [Por quê? 💡]",
        "Salas de Estudo (Study Buddy) com IA observadora",
        "Tira-dúvidas bilíngue (pergunte em português ou espanhol)",
        "Correções de áudios e mensagens de voz",
        "Tópicos de conversa diários personalizados",
        "Zero instalação de apps — 100% direto no WhatsApp",
      ],
      comparisonHeading: "Compare Teste Grátis com Premium",
      comparisonSub: "Veja o que está incluído no teste de 15 dias e no plano premium",
      compColFeature: "Recurso",
      compColTrial: "Teste Grátis 15 Dias",
      compColPremium: "Plano Premium",
      compRows: [
        { name: "Números de WhatsApp Ativados", trial: "1 Número de WhatsApp", premium: "1 Número (Alterável)" },
        { name: "Duração do Acesso", trial: "15 Dias de Acesso Completo", premium: "Ilimitado (Mensal / Anual)" },
        { name: "Conversação 1-a-1 com IA", trial: "Incluído por 15 Dias", premium: "Ilimitado 365 Dias" },
        { name: "Sussurros de Correção", trial: "Incluído", premium: "Incluído" },
        { name: "Cards [Por quê? 💡]", trial: "Incluído", premium: "Completo com regras" },
        { name: "Salas Study Buddy (/join 101)", trial: "Incluído", premium: "Salas e parceiros ilimitados" },
        { name: "Correção de Mensagens de Voz", trial: "Incluído", premium: "Incluído" },
        { name: "Ajuda Bilíngue em Português", trial: "Incluído", premium: "Incluído" },
        { name: "Garantia de Reembolso em 15 Dias", trial: "N/A (Já é Grátis)", premium: "100% Sem Risco" },
      ],
      guaranteeTitle: "Garantia Incondicional de 15 Dias",
      guaranteeDesc: "Experimente o Talk'n'Bit por 15 dias. Se você não sentir uma melhora nítida na sua confiança ao falar inglês, envie uma mensagem no WhatsApp ou e-mail para support@talknbit.com e devolveremos 100% do seu dinheiro imediatamente.",
      faqHeading: "Perguntas Frequentes",
      faqSub: "Respostas rápidas sobre planos, pagamentos e funcionamento.",
      faqs: [
        {
          q: "Como funciona o teste grátis de 15 dias?",
          a: "Você escolhe o plano de Teste Grátis de 15 Dias, informa seu nome, e-mail e 1 número de WhatsApp. Seu número é ativado imediatamente no sistema com custo zero. Sem cartão de crédito.",
        },
        {
          q: "Quantos números posso cadastrar no teste grátis?",
          a: "O teste gratuito permite cadastrar exatamente 1 número de WhatsApp para ativar o bot. Ao concluir os 15 dias, você poderá escolher um plano mensal ou anual para continuar.",
        },
        {
          q: "Em quanto tempo meu acesso é liberado?",
          a: "Imediatamente! Assim que concluir seu cadastro, seu número de WhatsApp é ativado pelo nosso sistema. Você já pode enviar mensagem ao bot em poucos segundos.",
        },
        {
          q: "Preciso baixar algum aplicativo?",
          a: "Não. O Talk'n'Bit funciona 100% dentro do WhatsApp que você já usa no seu celular ou computador.",
        },
        {
          q: "Posso cancelar quando quiser?",
          a: "Sim, você pode cancelar sua assinatura paga a qualquer momento com zero burocracia ou taxas de cancelamento.",
        },
        {
          q: "Quais são as formas de pagamento para planos pagos?",
          a: "Aceitamos Pix imediato (sem tempo de espera) e todos os cartões de crédito em até 12x.",
        },
      ],
    },
    checkout: {
      badge: "Ativação Rápida e Segura",
      heading: "Ative Seu Mentor de Inglês",
      subheading: "Leva menos de 1 minuto. Ativação direta do bot no WhatsApp.",
      step1Title: "1. Dados do Aluno",
      whatsappLabel: "Número do WhatsApp (1 Telefone)",
      whatsappHelp: "Este único número será autorizado para praticar com o bot.",
      whatsappPlaceholder: "(13) 99187-8104",
      nameLabel: "Seu Nome Completo",
      namePlaceholder: "ex: Maria Silva",
      emailLabel: "Endereço de E-mail",
      emailOptional: "opcional",
      emailPlaceholder: "maria@exemplo.com",
      step2Title: "2. Forma de Pagamento",
      tabPix: "Pix (Imediato)",
      tabCard: "Cartão de Crédito",
      pixInstructions: "Abra o aplicativo do seu banco, escolha Pix Copia e Cola ou escaneie o QR code:",
      pixCopyBtn: "Copiar Código Pix",
      pixCopiedBtn: "Código Copiado!",
      pixExpiryNote: "Código Pix válido por 30 minutos. Ativação instantânea do bot no WhatsApp.",
      cardNumberLabel: "Número do Cartão",
      cardNameLabel: "Nome Impresso no Cartão",
      cardExpiryLabel: "Validade",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Parcelamento",
      installmentSingle: "1x (À vista)",
      installmentOption: "Parcelas",
      orderSummaryTitle: "Resumo do Pedido",
      switchPlanLabel: "Mudar Plano:",
      subtotalLabel: "Subtotal",
      discountLabel: "Desconto",
      totalLabel: "Total a Pagar Hoje",
      submitBtn: "Concluir Pagamento e Ativar no WhatsApp →",
      processingBtn: "Ativando Seu WhatsApp...",
      guaranteeNotice: "Garantia incondicional de 15 dias. Cancele quando quiser.",
      instantActivationNotice: "Ativação imediata do bot no WhatsApp após a confirmação.",
      trialStep2Title: "2. Nenhum Pagamento Necessário",
      trialStep2Desc: "Seu teste grátis de 15 dias oferece mentoria ilimitada de inglês para 1 número de WhatsApp. Sem cartão ou Pix.",
      trialNoPaymentNeeded: "🎉 Teste Grátis: Você não será cobrado de absolutamente nada hoje.",
      trialOnePhoneAlert: "⚠️ Aviso: É permitido exatamente 1 número de WhatsApp por teste grátis.",
      trialSubmitBtn: "Ativar Teste Grátis de 15 Dias (1 Telefone) →",
      trialReceiptBadge: "Teste Grátis de 15 Dias",
    },
    confirmation: {
      celebration: "Pagamento Confirmado! 🚀",
      heading: "Tudo Pronto para Praticar Inglês!",
      subheading: "Seu número de WhatsApp já está ativo no nosso sistema. Você já pode conversar com o Talk'n'Bit.",
      receiptTitle: "Comprovante de Inscrição",
      orderIdLabel: "Código do Pedido",
      statusLabel: "Status",
      statusActive: "Ativo e Liberado",
      phoneLabel: "WhatsApp Ativado",
      planLabel: "Plano",
      expiresLabel: "Ativo Até",
      paymentMethodLabel: "Forma de Pagamento",
      openWhatsAppBtn: "Abrir WhatsApp e Começar →",
      nextStepsTitle: "Como Começar em 3 Passos:",
      step1: "Toque no botão verde acima para abrir a conversa no seu WhatsApp.",
      step2: "Envie sua primeira frase ou áudio em inglês (ex: 'Hi, I'm ready to learn!').",
      step3: "Receba em segundos seu primeiro card de correção e avaliação de fluência.",
      needHelp: "Precisa de ajuda para começar?",
      contactSupport: "Falar com o Suporte Talk'n'Bit no WhatsApp",
      homeBtn: "Voltar para a Página Inicial",
      trialActivatedTitle: "Teste Grátis de 15 Dias Ativado! 🎉",
      trialActivatedSub: "Seu número de WhatsApp foi ativado com sucesso pelos próximos 15 dias de mentoria.",
      trialOpenWhatsAppBtn: "Abrir WhatsApp e Começar Teste de 15 Dias →",
    },
  },

  es: {
    common: {
      brandName: "Talk'n'Bit",
      tagline: "Tu Tutor de Inglés con IA en WhatsApp",
      backHome: "Volver al Inicio",
      plansNav: "Planes",
      checkoutNav: "Completar Registro",
      guaranteeRibbon: "Garantía de 15 Días • 100% Libre de Riesgo",
      secureCheckout: "Encriptación SSL de 256 Bits • 100% Seguro",
    },
    pricing: {
      badge: "Planes Simples y Transparentes",
      heading: "Invierte en Tu Fluidez en Inglés",
      subheading: "Practica inglés todos los días de forma natural en WhatsApp. Correcciones instantáneas con IA, susurros de gramática y salas de estudio.",
      billingCycleLabel: "Ciclo de facturación:",
      billingMonthly: "Mensual",
      billingSemi: "6 Meses",
      billingYearly: "Anual (Ahorra 40%)",
      save40Badge: "AHORRA 40%",
      save20Badge: "AHORRA 20%",
      popularBadge: "Más Elegido",
      bestValueBadge: "Mejor Valor",
      trialPlanName: "Prueba Gratis de 15 Días",
      trialPrice: "R$ 0",
      trialPeriod: "/ 15 días",
      trialDesc: "Acceso completo durante 15 días para activar 1 número de WhatsApp. Sin pago ni tarjeta de crédito.",
      trialCta: "Comenzar Prueba de 15 Días",
      trialBadge: "100% GRATIS",
      trialPhoneNotice: "Permite vincular solo 1 número de WhatsApp para activar el bot",
      trialCardHeader: "¿Quieres probar primero? Obtén 15 días totalmente gratis.",
      monthlyPlanName: "Plan Mensual",
      monthlyPrice: "R$ 36",
      monthlyPeriod: "/ mes",
      monthlyDesc: "Cobro mensual. Cancela cuando quieras con 1 solo clic.",
      monthlyCta: "Elegir Mensual",
      semiPlanName: "Plan Semestral",
      semiPrice: "R$ 29",
      semiPeriod: "/ mes",
      semiDesc: "Facturado R$ 174 cada 6 meses. Ahorra R$ 84 (20%).",
      semiCta: "Elegir Semestral",
      yearlyPlanName: "Plan Anual",
      yearlyPrice: "R$ 21",
      yearlyPeriod: "/ mes",
      yearlyDesc: "Facturado R$ 252 una vez al año. Ahorra R$ 180 (40%).",
      yearlyCta: "Elegir Anual (Mejor Oferta)",
      featuresHeading: "Todo Incluido en Cada Plan:",
      featuresList: [
        "Práctica individual de inglés ilimitada con IA",
        "Susurros discretos de corrección gramatical",
        "Tarjetas interactivas con explicaciones [¿Por qué? 💡]",
        "Salas de práctica Study Buddy con IA observadora",
        "Respuestas bilingües (pregunta en español o portugués)",
        "Correcciones de notas de voz y mensajes de audio",
        "Temas diarios de conversación personalizados",
        "Sin descargas de aplicaciones — 100% en WhatsApp",
      ],
      comparisonHeading: "Compara Prueba Gratis con Premium",
      comparisonSub: "Descubre todo lo incluido en la prueba de 15 días frente al plan premium",
      compColFeature: "Característica",
      compColTrial: "Prueba Gratis 15 Días",
      compColPremium: "Plan Premium",
      compRows: [
        { name: "Números de WhatsApp Activados", trial: "1 Número de WhatsApp", premium: "1 Número (Modificable)" },
        { name: "Duración del Acceso", trial: "15 Días de Acceso Completo", premium: "Ilimitado (Mensual / Anual)" },
        { name: "Conversación 1-a-1 con IA", trial: "Incluido por 15 Días", premium: "Ilimitado 365 Días" },
        { name: "Susurros de Corrección", trial: "Incluido", premium: "Incluido" },
        { name: "Tarjetas [¿Por qué? 💡]", trial: "Incluido", premium: "Completo con reglas" },
        { name: "Salas Study Buddy (/join 101)", trial: "Incluido", premium: "Salas y compañeros ilimitados" },
        { name: "Corrección de Mensajes de Voz", trial: "Incluido", premium: "Incluido" },
        { name: "Ayuda Bilingüe en Español", trial: "Incluido", premium: "Incluido" },
        { name: "Garantía de Reembolso de 15 Días", trial: "N/A (Ya es Gratis)", premium: "100% Sin Riesgo" },
      ],
      guaranteeTitle: "Garantía Incondicional de 15 Días",
      guaranteeDesc: "Prueba Talk'n'Bit durante 15 días. Si no notas una mejora clara en tu confianza al hablar inglés, envíanos un WhatsApp o correo a support@talknbit.com y te reembolsaremos el 100% de tu dinero inmediatamente.",
      faqHeading: "Preguntas Frecuentes",
      faqSub: "Respuestas directas sobre planes, pagos y cómo funciona el servicio.",
      faqs: [
        {
          q: "¿Cómo funciona la prueba gratuita de 15 días?",
          a: "Eliges el plan Prueba Gratis de 15 Días, ingresas tu nombre, correo y 1 número de WhatsApp. Tu número queda activado al instante en nuestro sistema sin costo alguno. No requiere tarjeta.",
        },
        {
          q: "¿Cuántos números de teléfono puedo activar con la prueba gratis?",
          a: "La prueba gratuita permite activar exactamente 1 número de WhatsApp para usar el bot. Al finalizar los 15 días, podrás actualizar a un plan mensual o anual para continuar practicando.",
        },
        {
          q: "¿En cuánto tiempo recibo acceso tras registrarme?",
          a: "¡De inmediato! Tu número de WhatsApp se activa automáticamente en nuestro sistema. Podrás enviarle mensajes al bot en cuestión de segundos.",
        },
        {
          q: "¿Debo descargar alguna app?",
          a: "No. Talk'n'Bit funciona completamente dentro del WhatsApp que ya tienes instalado en tu celular.",
        },
        {
          q: "¿Puedo cancelar en cualquier momento?",
          a: "Sí, puedes cancelar tu suscripción de pago cuando quieras sin ningún tipo de penalidad ni cargos ocultos.",
        },
        {
          q: "¿Cuáles son los métodos de pago para planes de pago?",
          a: "Aceptamos Pix instantáneo (sin esperas) y todas las tarjetas de crédito hasta en 12 cuotas.",
        },
      ],
    },
    checkout: {
      badge: "Activación Rápida y Segura",
      heading: "Activa Tu Tutor de Inglés",
      subheading: "Toma menos de 1 minuto. Activación directa del bot en WhatsApp.",
      step1Title: "1. Datos del Estudiante",
      whatsappLabel: "Número de WhatsApp (1 Teléfono)",
      whatsappHelp: "Este único número será autorizado para chatear con el bot.",
      whatsappPlaceholder: "(13) 99187-8104",
      nameLabel: "Tu Nombre Completo",
      namePlaceholder: "ej: María Silva",
      emailLabel: "Correo Electrónico",
      emailOptional: "opcional",
      emailPlaceholder: "maria@ejemplo.com",
      step2Title: "2. Método de Pago",
      tabPix: "Pix (Instantáneo)",
      tabCard: "Tarjeta de Crédito",
      pixInstructions: "Abre la aplicación de tu banco, escanea el código QR o copia el código Pix abajo:",
      pixCopyBtn: "Copiar Código Pix",
      pixCopiedBtn: "¡Código Copiado!",
      pixExpiryNote: "Código Pix válido por 30 minutos. Activación instantánea en WhatsApp tras confirmación.",
      cardNumberLabel: "Número de Tarjeta",
      cardNameLabel: "Nombre como figura en la Tarjeta",
      cardExpiryLabel: "Vencimiento",
      cardCvvLabel: "CVV",
      cardInstallmentsLabel: "Cuotas",
      installmentSingle: "1x (Pago único)",
      installmentOption: "Cuotas",
      orderSummaryTitle: "Resumen del Pedido",
      switchPlanLabel: "Cambiar Plan:",
      subtotalLabel: "Subtotal",
      discountLabel: "Ahorro",
      totalLabel: "Total a Pagar Hoy",
      submitBtn: "Completar Pago y Activar en WhatsApp →",
      processingBtn: "Activando Tu WhatsApp...",
      guaranteeNotice: "Garantía incondicional de 15 días. Cancela cuando quieras.",
      instantActivationNotice: "Activación instantánea del bot en WhatsApp al confirmarse.",
      trialStep2Title: "2. Cero Pago Requerido",
      trialStep2Desc: "Tu prueba gratuita de 15 días brinda tutoría completa de inglés para 1 número de WhatsApp. Sin tarjeta ni Pix.",
      trialNoPaymentNeeded: "🎉 Prueba Gratis: No se te cobrará absolutamente nada hoy.",
      trialOnePhoneAlert: "⚠️ Aviso: Se permite exactamente 1 número de WhatsApp por prueba gratuita.",
      trialSubmitBtn: "Activar Prueba Gratis de 15 Días (1 Teléfono) →",
      trialReceiptBadge: "Prueba Gratis de 15 Días",
    },
    confirmation: {
      celebration: "¡Pago Confirmado! 🚀",
      heading: "¡Todo Listo para Hablar Inglés!",
      subheading: "Tu número de WhatsApp ya está activo en nuestro sistema. Ya puedes chatear 1 a 1 con Talk'n'Bit.",
      receiptTitle: "Comprobante de Registro",
      orderIdLabel: "Referencia del Pedido",
      statusLabel: "Estado",
      statusActive: "Activo y Listo",
      phoneLabel: "WhatsApp Activado",
      planLabel: "Plan",
      expiresLabel: "Activo Hasta",
      paymentMethodLabel: "Método de Pago",
      openWhatsAppBtn: "Abrir WhatsApp y Saludar →",
      nextStepsTitle: "Cómo Comenzar en 3 Pasos:",
      step1: "Toca el botón verde arriba para abrir WhatsApp en tu celular o computadora.",
      step2: "Envía tu primer mensaje o nota de voz en inglés (ej: 'Hi, I'm ready to learn!').",
      step3: "Recibe en segundos tu primera tarjeta de corrección y evaluación de fluidez.",
      needHelp: "¿Necesitas ayuda para comenzar?",
      contactSupport: "Hablar con Soporte de Talk'n'Bit en WhatsApp",
      homeBtn: "Volver a la Página Principal",
      trialActivatedTitle: "¡Prueba Gratis de 15 Días Activada! 🎉",
      trialActivatedSub: "Tu número de WhatsApp ha sido activado con éxito para los próximos 15 días de tutoría.",
      trialOpenWhatsAppBtn: "Abrir WhatsApp y Comenzar Prueba de 15 Días →",
    },
  },
};
