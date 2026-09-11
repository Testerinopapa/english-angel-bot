export type SupportedLang = "en" | "pt" | "es";

export interface TranslationSchema {
  nav: {
    blog: string;
    plans: string;
    howItWorks: string;
    practice: string;
    faq: string;
    contact: string;
    admin: string;
    chatOnWhatsApp: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight1: string;
    titleHighlight2: string;
    subtitle: string;
    getStarted: string;
    seeHowItWorks: string;
    inputPlaceholder: string;
    whyButton: string;
    grammarRuleTitle: string;
    grammarRuleHero: string;
    instantAi: string;
    contextAi: string;
    liveAiEvaluation: string;
    practiceOnWhatsApp: string;
  };
  simulator: {
    heading: string;
    subtitle: string;
    preset1: string;
    preset2: string;
    preset3: string;
    button: string;
  };
  immersion: {
    titleLine1: string;
    titleLine2: string;
    point1: string;
    point2: string;
    point3: string;
    cta: string;
  };
  vocabulary: {
    titleLine1: string;
    titleLine2: string;
    question: string;
    description: string;
    cta: string;
    userMixSentence: string;
    botCorrectionPrefix: string;
    botCorrection: string;
    vocabRuleTitle: string;
    vocabRuleExplanation: string;
    bottomTag: string;
  };
  transition1: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
  };
  transition2: {
    line1: string;
    line2: string;
    line3: string;
  };
  howItWorks: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    cta: string;
  };
  whyItWorks: {
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  plans: {
    title: string;
    monthlyTitle: string;
    monthlyPrice: string;
    perMonth: string;
    monthlyBilling: string;
    monthlyAnnualTotal: string;
    getMonthly: string;
    semiTitle: string;
    semiPrice: string;
    semiBilling: string;
    semiAnnualTotal: string;
    save20: string;
    getSemi: string;
    yearlyTitle: string;
    yearlyPrice: string;
    yearlyBilling: string;
    yearlyAnnualTotal: string;
    save40: string;
    bestValue: string;
    getYearly: string;
    guarantee: string;
    choosePlan: string;
  };
  footer: {
    freePractice: string;
    bookLesson: string;
    blogTips: string;
    faq: string;
    trial: string;
    terms: string;
    privacy: string;
    contactWa: string;
    adminPortal: string;
    copyright: string;
  };
  faqModal: {
    title: string;
    subtitle: string;
    differentQuestion: string;
    askWa: string;
    items: Array<{ q: string; a: string }>;
  };
  blogModal: {
    title: string;
    subtitle: string;
    readMore: string;
    discussWa: string;
    readyPrompt: string;
    startFree: string;
    posts: Array<{
      title: string;
      date: string;
      readTime: string;
      tag: string;
      summary: string;
    }>;
  };
  whatsappMessages: {
    greeting: string;
    freePractice: string;
    trial: string;
    immersion: string;
    vocab: string;
    howItWorks: string;
    monthly: string;
    semi: string;
    yearly: string;
    faq: string;
    contact: string;
    lesson: string;
  };
}

export const TRANSLATIONS: Record<SupportedLang, TranslationSchema> = {
  en: {
    nav: {
      blog: "blog",
      plans: "plans",
      howItWorks: "how it works",
      practice: "practice",
      faq: "faq",
      contact: "contact",
      admin: "Admin",
      chatOnWhatsApp: "Chat on WhatsApp",
    },
    hero: {
      badge: "Built for busy professionals & students • Zero apps to install",
      titleLine1: "Chat in English",
      titleLine2: "everyday with",
      titleHighlight1: "AI-powered",
      titleHighlight2: "instant feedback",
      subtitle: "Find partners with similar interests and immerse yourself in English directly on WhatsApp.",
      getStarted: "Get Started",
      seeHowItWorks: "See how it works",
      inputPlaceholder: "Type an English sentence...",
      whyButton: "Why? 💡",
      grammarRuleTitle: "Grammar Rule:",
      grammarRuleHero: "In past simple negative with didn't, always use the base verb form (go, not went).",
      instantAi: "Instant AI",
      contextAi: "Context AI",
      liveAiEvaluation: "Live AI Evaluation:",
      practiceOnWhatsApp: "Practice on WhatsApp →",
    },
    simulator: {
      heading: "Try it yourself right now",
      subtitle: "Click any example below or type your own phrase to see instant AI feedback:",
      preset1: "I didn't went to the party yesterday.",
      preset2: "She don't likes spicy food.",
      preset3: "I have 28 years old.",
      button: "Check Sentence",
    },
    immersion: {
      titleLine1: "Experience English",
      titleLine2: "Immersion",
      point1: "No expensive costs",
      point2: "No extra apps needed",
      point3: "Real time feedback from AI",
      cta: "Get Started",
    },
    vocabulary: {
      titleLine1: "Unlock",
      titleLine2: "Vocabulary",
      question: "Don't know how to say it?",
      description: "No more flipping through dictionaries. Our AI shows you instantly. Because when you learn in context, it just clicks.",
      cta: "Get Started",
      userMixSentence: "I need to revisar meu currículo.",
      botCorrectionPrefix: "You meant:",
      botCorrection: '"I need to review my resumé."',
      vocabRuleTitle: "Contextual Vocabulary:",
      vocabRuleExplanation: "In job contexts, currículo translates to resumé (US) or CV (UK). The verb revisar is to review.",
      bottomTag: "Talk'n'Bit Instant Correction",
    },
    transition1: {
      line1: "Connect.",
      line2: "Chat.",
      line3: "Learn English.",
      line4: "All at your fingertips.",
    },
    transition2: {
      line1: "Real conversations.",
      line2: "Real English.",
      line3: "Real progress.",
    },
    howItWorks: {
      title: "How it works",
      step1: "Chat in groups or with your language partner",
      step2: "Receive correction",
      step3: "Improve",
      cta: "Get Started",
    },
    whyItWorks: {
      title: "Why it works",
      subtitle: "Learning English through conversation and instant feedback isn't just convenient. Our methodologies are scientifically proven to be effective. Here's why our method delivers real results:",
      card1Title: "Mistakes accelerate learning",
      card1Desc: "Studies show that making errors and receiving feedback right after strengthens memory and understanding.",
      card2Title: "Immediate feedback means deeper learning",
      card2Desc: "Your brain learns best when it gets corrections in the moment. That's why our system sends feedback instantly via WhatsApp.",
      card3Title: "Daily, bite-sized practice beats long study sessions",
      card3Desc: "Practicing a little every day is more effective than cramming. Our WhatsApp-based model fits naturally into your routine.",
      card4Title: "Personalized, autonomous learning",
      card4Desc: "You're in control. Our AI gives feedback tailored to your messages, at your pace, boosting confidence and motivation.",
    },
    plans: {
      title: "Plans",
      monthlyTitle: "Monthly plan",
      monthlyPrice: "BRL 36",
      perMonth: "per month",
      monthlyBilling: "Paid monthly.",
      monthlyAnnualTotal: "Total annual cost: BRL 432",
      getMonthly: "Get Monthly",
      semiTitle: "Semiannual plan",
      semiPrice: "BRL 29",
      semiBilling: "Paid semiannually.",
      semiAnnualTotal: "Total annual cost: BRL 348",
      save20: "Save R$84 (20%)",
      getSemi: "Get Semiannual",
      yearlyTitle: "Yearly plan",
      yearlyPrice: "BRL 21",
      yearlyBilling: "Paid yearly.",
      yearlyAnnualTotal: "Total annual cost: BRL 252",
      save40: "Save R$180 (40%)",
      bestValue: "Best Value",
      getYearly: "Get Yearly",
      guarantee: "15-day money-back guarantee",
      choosePlan: "Choose a plan",
    },
    footer: {
      freePractice: "Free English Practice →",
      bookLesson: "Book a Lesson",
      blogTips: "Blog & Learning Tips",
      faq: "FAQ",
      trial: "15-Day Free Trial →",
      terms: "Terms of Use",
      privacy: "About & Privacy",
      contactWa: "Contact via WhatsApp",
      adminPortal: "Admin Portal →",
      copyright: "Copyright © 2025 Talk'n'Bit. All rights reserved.",
    },
    faqModal: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about Talk'n'Bit",
      differentQuestion: "Have a different question?",
      askWa: "Ask on WhatsApp",
      items: [
        {
          q: "How does Talk'n'Bit work?",
          a: "Talk'n'Bit is your AI English buddy on WhatsApp. You chat in English naturally—either 1-on-1 with the bot, or with a friend in our secret-watcher practice rooms. When you make a grammatical mistake, the bot privately whispers the correction and gives you an interactive [Why? 💡] button explaining the rule.",
        },
        {
          q: "Do I need to download any new app?",
          a: "No! Everything runs 100% inside your existing WhatsApp. No logins, no passwords, no memory-heavy apps to install. You just send messages like you do every day.",
        },
        {
          q: "What are Study Buddy Practice Rooms?",
          a: "It's our secret-watcher mode! You and a study partner both text `/join <code>` (e.g. `/join 101`) to the bot. All messages are relayed to your partner, but whenever you make a mistake, Talk'n'Bit privately corrects only you. Your partner never sees your mistakes.",
        },
        {
          q: "How does the 15-day money-back guarantee work?",
          a: "Try Talk'n'Bit for up to 15 days risk-free. If you don't feel noticeably more confident speaking English, text our support or email us, and we will issue a full 100% refund immediately.",
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes! There are no long-term contracts. You can pause or cancel your subscription at any time directly through WhatsApp or email with zero hassle.",
        },
        {
          q: "Is Talk'n'Bit suitable for beginners or intermediate learners?",
          a: "Both! Beginners love the zero-pressure environment and contextual Portuguese/Spanish translation help, while intermediate and advanced speakers use it to eliminate recurring grammar bugs and build daily fluency.",
        },
      ],
    },
    blogModal: {
      title: "Talk'n'Bit Blog & Learning Guides",
      subtitle: "Proven tips and science-backed methods for English fluency",
      readMore: "Read guide",
      discussWa: "Discuss on WhatsApp",
      readyPrompt: "Ready to put theory into practice?",
      startFree: "Start Practicing Free",
      posts: [
        {
          title: "Why Micro-Practice on WhatsApp Beats 2-Hour Weekend Classes",
          date: "Sep 2025",
          readTime: "3 min read",
          tag: "Science of Learning",
          summary: "Studies in cognitive neuroscience show that 10 minutes of active daily recall builds permanent neural pathways 3x faster than passive 2-hour weekend study sessions. Discover why WhatsApp chat is the ideal medium for language retention.",
        },
        {
          title: "5 Common Grammar Mistakes Brazilian English Learners Make",
          date: "Aug 2025",
          readTime: "4 min read",
          tag: "Grammar Tips",
          summary: "From 'I have 25 years' to 'I didn't went' and 'revisar meu currículo', we break down the most frequent false friends and literal translations—and how to fix them effortlessly.",
        },
        {
          title: "How the 'Secret Watcher' Method Eliminates Speaking Anxiety",
          date: "Jul 2025",
          readTime: "3 min read",
          tag: "Mindset",
          summary: "The #1 hurdle in language fluency is fear of judgment. Learn how private AI whispering gives you the psychological safety to make mistakes and speak freely without feeling embarrassed in front of peers.",
        },
      ],
    },
    whatsappMessages: {
      greeting: "Hi! I want to practice English with Talk'n'Bit",
      freePractice: "Hi! I want to start my free English practice session",
      trial: "Hi! I'd like to activate my 15-Day Free Trial",
      immersion: "Hi! I want to start my English immersion with Talk'n'Bit",
      vocab: "Hi! I want to expand my English vocabulary with Talk'n'Bit",
      howItWorks: "Hi! I want to start chatting and getting instant corrections",
      monthly: "Hi! I want to subscribe to the Talk'n'Bit Monthly plan (BRL 36/mo)",
      semi: "Hi! I want to subscribe to the Talk'n'Bit Semiannual plan (BRL 29/mo)",
      yearly: "Hi! I want to subscribe to the Talk'n'Bit Yearly plan (BRL 21/mo - Best Value)",
      faq: "Hi! I have a question that isn't in the FAQ",
      contact: "Hi! I'd like to contact the Talk'n'Bit team",
      lesson: "Hi! I'd like to book an English practice session",
    },
  },

  pt: {
    nav: {
      blog: "blog",
      plans: "planos",
      howItWorks: "como funciona",
      practice: "praticar",
      faq: "dúvidas",
      contact: "contato",
      admin: "Admin",
      chatOnWhatsApp: "Conversar no WhatsApp",
    },
    hero: {
      badge: "Feito para profissionais e estudantes ocupados • Sem apps para instalar",
      titleLine1: "Converse em inglês",
      titleLine2: "todos os dias com",
      titleHighlight1: "feedback instantâneo",
      titleHighlight2: "por Inteligência Artificial",
      subtitle: "Encontre parceiros com os mesmos interesses e mergulhe no inglês direto no seu WhatsApp.",
      getStarted: "Começar Agora",
      seeHowItWorks: "Ver como funciona",
      inputPlaceholder: "Digite uma frase em inglês...",
      whyButton: "Por quê? 💡",
      grammarRuleTitle: "Regra Gramatical:",
      grammarRuleHero: "No passado simples negativo com didn't, use sempre o verbo na forma base (go, e não went).",
      instantAi: "IA Instantânea",
      contextAi: "IA Contextual",
      liveAiEvaluation: "Avaliação da IA em Tempo Real:",
      practiceOnWhatsApp: "Praticar no WhatsApp →",
    },
    simulator: {
      heading: "Teste você mesmo agora",
      subtitle: "Clique em um exemplo abaixo ou digite sua própria frase para ver a correção instantânea da IA:",
      preset1: "I didn't went to the party yesterday.",
      preset2: "She don't likes spicy food.",
      preset3: "I have 28 years old.",
      button: "Verificar Frase",
    },
    immersion: {
      titleLine1: "Viva uma Imersão",
      titleLine2: "em Inglês Real",
      point1: "Sem mensalidades abusivas",
      point2: "Sem aplicativos extras para baixar",
      point3: "Feedback imediato com Inteligência Artificial",
      cta: "Começar Agora",
    },
    vocabulary: {
      titleLine1: "Destrave seu",
      titleLine2: "Vocabulário",
      question: "Não sabe exatamente como falar?",
      description: "Chega de perder tempo folheando dicionários. Nossa IA te ensina na hora, dentro do contexto real, para que você memorize com naturalidade.",
      cta: "Começar Agora",
      userMixSentence: "I need to revisar meu currículo.",
      botCorrectionPrefix: "Você quis dizer:",
      botCorrection: '"I need to review my resumé."',
      vocabRuleTitle: "Vocabulário no Contexto:",
      vocabRuleExplanation: "No ambiente de trabalho e carreira, currículo se traduz como resumé (EUA) ou CV (Reino Unido). O verbo revisar é to review.",
      bottomTag: "Correção Instantânea Talk'n'Bit",
    },
    transition1: {
      line1: "Conecte-se.",
      line2: "Converse.",
      line3: "Aprenda inglês.",
      line4: "Na ponta dos seus dedos.",
    },
    transition2: {
      line1: "Conversas reais.",
      line2: "Inglês real.",
      line3: "Progresso de verdade.",
    },
    howItWorks: {
      title: "Como funciona",
      step1: "Converse em grupos ou com seu parceiro de estudo",
      step2: "Receba correções discretas da IA",
      step3: "Evolua sua confiança todos os dias",
      cta: "Começar Agora",
    },
    whyItWorks: {
      title: "Por que funciona",
      subtitle: "Aprender inglês por conversação e feedback imediato não é só conveniente. Nossa metodologia é comprovada pela neurociência da aprendizagem:",
      card1Title: "Erros aceleram o aprendizado",
      card1Desc: "Estudos comprovam que errar e receber feedback imediato consolida conexões neurais e acelera a fluência.",
      card2Title: "Feedback imediato gera fixação profunda",
      card2Desc: "Seu cérebro absorve regras quando corrigido no momento exato da dúvida. O bot responde em poucos segundos no WhatsApp.",
      card3Title: "Micro-prática diária supera aulas longas",
      card3Desc: "Praticar 10 minutos por dia é 3x mais eficiente que 2 horas no fim de semana. Cabe perfeitamente na sua rotina corrida.",
      card4Title: "Aprendizado autônomo e sem constrangimento",
      card4Desc: "Você no comando. A IA sussurra correções no seu privado, eliminando o medo de errar em público e destravando sua fala.",
    },
    plans: {
      title: "Planos",
      monthlyTitle: "Plano Mensal",
      monthlyPrice: "R$ 36",
      perMonth: "por mês",
      monthlyBilling: "Cobrado mensalmente.",
      monthlyAnnualTotal: "Custo total anual: R$ 432",
      getMonthly: "Assinar Mensal",
      semiTitle: "Plano Semestral",
      semiPrice: "R$ 29",
      semiBilling: "Cobrado a cada 6 meses.",
      semiAnnualTotal: "Custo total anual: R$ 348",
      save20: "Economize R$ 84 (20%)",
      getSemi: "Assinar Semestral",
      yearlyTitle: "Plano Anual",
      yearlyPrice: "R$ 21",
      yearlyBilling: "Cobrado anualmente.",
      yearlyAnnualTotal: "Custo total anual: R$ 252",
      save40: "Economize R$ 180 (40%)",
      bestValue: "Mais Popular",
      getYearly: "Assinar Anual",
      guarantee: "Garantia incondicional de 15 dias",
      choosePlan: "Escolha seu plano",
    },
    footer: {
      freePractice: "Prática Gratuita de Inglês →",
      bookLesson: "Agendar uma Sessão",
      blogTips: "Blog e Dicas de Estudo",
      faq: "Perguntas Frequentes",
      trial: "Teste Grátis de 15 Dias →",
      terms: "Termos de Uso",
      privacy: "Sobre e Privacidade",
      contactWa: "Fale no WhatsApp",
      adminPortal: "Portal do Administrador →",
      copyright: "Copyright © 2025 Talk'n'Bit. Todos os direitos reservados.",
    },
    faqModal: {
      title: "Perguntas Frequentes",
      subtitle: "Tudo o que você precisa saber sobre o Talk'n'Bit",
      differentQuestion: "Tem alguma outra dúvida?",
      askWa: "Perguntar no WhatsApp",
      items: [
        {
          q: "Como o Talk'n'Bit funciona?",
          a: "O Talk'n'Bit é seu parceiro de inglês inteligente no WhatsApp. Você conversa naturalmente em inglês — sozinho com o bot ou em salas de prática com um amigo. Quando você erra, a IA te corrige discretamente no privado e disponibiliza um botão interativo [Por quê? 💡] explicando a regra gramatical.",
        },
        {
          q: "Preciso baixar algum aplicativo novo?",
          a: "Não! 100% da experiência acontece dentro do seu WhatsApp já instalado. Sem novos logins, sem senhas e sem ocupar espaço na memória do celular.",
        },
        {
          q: "O que são as Salas de Estudo com Parceiro (Study Buddy Rooms)?",
          a: "É o nosso modo 'secret watcher'! Você e seu amigo enviam `/join <código>` (ex: `/join 101`) para o bot. Suas mensagens são repassadas ao parceiro, mas quando alguém comete um deslize, o Talk'n'Bit corrige somente a pessoa no privado. Seu amigo nunca vê seus erros!",
        },
        {
          q: "Como funciona a garantia de reembolso de 15 dias?",
          a: "Você testa o Talk'n'Bit por até 15 dias com risco zero. Se não sentir evolução na sua confiança para falar inglês, basta nos mandar uma mensagem no WhatsApp ou email e estornamos 100% do seu valor sem burocracia.",
        },
        {
          q: "Posso cancelar minha assinatura a qualquer momento?",
          a: "Sim! Não há contratos de fidelidade. Você pode pausar ou cancelar quando desejar diretamente pelo WhatsApp ou email.",
        },
        {
          q: "O Talk'n'Bit serve para iniciantes ou intermediários?",
          a: "Para ambos! Iniciantes se sentem seguros sem a pressão de falar na frente dos outros e contam com suporte contextual em português. Já intermediários eliminam vícios gramaticais e ganham agilidade de resposta.",
        },
      ],
    },
    blogModal: {
      title: "Blog do Talk'n'Bit e Guias de Estudo",
      subtitle: "Dicas comprovadas e métodos científicos para destravar a fluência",
      readMore: "Ler guia completo",
      discussWa: "Conversar no WhatsApp",
      readyPrompt: "Pronto para colocar a teoria em prática?",
      startFree: "Começar a Praticar Grátis",
      posts: [
        {
          title: "Por que a Micro-Prática no WhatsApp Supera Aulas de 2 Horas",
          date: "Set 2025",
          readTime: "3 min de leitura",
          tag: "Neurociência",
          summary: "Estudos mostram que 10 minutos de prática ativa diária constroem sinapses permanentes 3x mais rápido do que sessões passivas de 2 horas no fim de semana. Entenda por que o WhatsApp é o canal perfeito.",
        },
        {
          title: "Os 5 Erros de Gramática Mais Comuns de Brasileiros no Inglês",
          date: "Ago 2025",
          readTime: "4 min de leitura",
          tag: "Dicas de Gramática",
          summary: "De 'I have 25 years' até 'I didn't went' e falsos cognatos como 'revisar currículo': veja como eliminar esses deslizes de uma vez por todas.",
        },
        {
          title: "Como o Método 'Observador Secreto' Elimina a Ansiedade de Falar",
          date: "Jul 2025",
          readTime: "3 min de leitura",
          tag: "Mentalidade",
          summary: "O maior obstáculo para a fluência é o medo do julgamento alheio. Saiba como o feedback privado da IA proporciona segurança psicológica para errar sem vergonha.",
        },
      ],
    },
    whatsappMessages: {
      greeting: "Oi! Quero praticar inglês com o Talk'n'Bit",
      freePractice: "Oi! Quero iniciar minha sessão gratuita de prática de inglês",
      trial: "Oi! Gostaria de ativar meu teste gratuito de 15 dias",
      immersion: "Oi! Quero começar minha imersão em inglês com o Talk'n'Bit",
      vocab: "Oi! Quero expandir meu vocabulário em inglês com o Talk'n'Bit",
      howItWorks: "Oi! Quero começar a bater papo e receber correções na hora",
      monthly: "Oi! Quero assinar o plano Mensal do Talk'n'Bit (R$ 36/mês)",
      semi: "Oi! Quero assinar o plano Semestral do Talk'n'Bit (R$ 29/mês)",
      yearly: "Oi! Quero assinar o plano Anual do Talk'n'Bit (R$ 21/mês - Mais Econômico)",
      faq: "Oi! Tenho uma dúvida que não encontrei no FAQ",
      contact: "Oi! Gostaria de falar com a equipe do Talk'n'Bit",
      lesson: "Oi! Gostaria de agendar uma sessão de prática de inglês",
    },
  },

  es: {
    nav: {
      blog: "blog",
      plans: "planes",
      howItWorks: "cómo funciona",
      practice: "practicar",
      faq: "preguntas",
      contact: "contacto",
      admin: "Admin",
      chatOnWhatsApp: "Chatear en WhatsApp",
    },
    hero: {
      badge: "Diseñado para profesionales y estudiantes ocupados • Sin apps que instalar",
      titleLine1: "Conversa en inglés",
      titleLine2: "todos los días con",
      titleHighlight1: "retroalimentación instantánea",
      titleHighlight2: "por Inteligencia Artificial",
      subtitle: "Encuentra compañeros con intereses similares y sumérgete en el inglés directamente en WhatsApp.",
      getStarted: "Comenzar Ahora",
      seeHowItWorks: "Ver cómo funciona",
      inputPlaceholder: "Escribe una frase en inglés...",
      whyButton: "¿Por qué? 💡",
      grammarRuleTitle: "Regla Gramatical:",
      grammarRuleHero: "En pasado simple negativo con didn't, usa siempre el verbo en forma base (go, no went).",
      instantAi: "IA Instantánea",
      contextAi: "IA Contextual",
      liveAiEvaluation: "Evaluación de IA en Tiempo Real:",
      practiceOnWhatsApp: "Practicar en WhatsApp →",
    },
    simulator: {
      heading: "Pruébalo tú mismo ahora",
      subtitle: "Haz clic en un ejemplo o escribe tu propia frase para ver la corrección instantánea de la IA:",
      preset1: "I didn't went to the party yesterday.",
      preset2: "She don't likes spicy food.",
      preset3: "I have 28 years old.",
      button: "Verificar Frase",
    },
    immersion: {
      titleLine1: "Vive una Inmersión",
      titleLine2: "en Inglés Real",
      point1: "Sin costos excesivos",
      point2: "Sin apps adicionales que instalar",
      point3: "Retroalimentación en tiempo real por IA",
      cta: "Comenzar Ahora",
    },
    vocabulary: {
      titleLine1: "Desbloquea tu",
      titleLine2: "Vocabulario",
      question: "¿No sabes exactamente cómo decirlo?",
      description: "Basta de perder tiempo en diccionarios. Nuestra IA te muestra en el acto la expresión adecuada en su contexto real para que la recuerdes siempre.",
      cta: "Comenzar Ahora",
      userMixSentence: "I need to revisar mi currículum.",
      botCorrectionPrefix: "Quisiste decir:",
      botCorrection: '"I need to review my resumé."',
      vocabRuleTitle: "Vocabulario en Contexto:",
      vocabRuleExplanation: "En contextos profesionales, currículum se traduce como resumé (EE. UU.) o CV (Reino Unido). El verbo revisar es to review.",
      bottomTag: "Corrección Instantánea Talk'n'Bit",
    },
    transition1: {
      line1: "Conéctate.",
      line2: "Chatea.",
      line3: "Aprende inglés.",
      line4: "Todo al alcance de tu mano.",
    },
    transition2: {
      line1: "Conversaciones reales.",
      line2: "Inglés real.",
      line3: "Progreso verdadero.",
    },
    howItWorks: {
      title: "Cómo funciona",
      step1: "Chatea en grupos o con tu compañero de práctica",
      step2: "Recibe correcciones discretas de la IA",
      step3: "Mejora tu fluidez y seguridad cada día",
      cta: "Comenzar Ahora",
    },
    whyItWorks: {
      title: "Por qué funciona",
      subtitle: "Aprender inglés a través de la conversación y feedback instantáneo no es solo conveniente. Nuestra metodología está respaldada por la ciencia del aprendizaje:",
      card1Title: "Los errores aceleran el aprendizaje",
      card1Desc: "Los estudios demuestran que cometer errores y recibir feedback inmediato consolida la memoria y la comprensión.",
      card2Title: "El feedback inmediato genera fijación profunda",
      card2Desc: "Tu cerebro aprende mejor cuando recibe correcciones al instante. Nuestro bot responde en segundos por WhatsApp.",
      card3Title: "La micro-práctica diaria supera las clases largas",
      card3Desc: "Practicar 10 minutos al día es mucho más efectivo que 2 horas el fin de semana. Se adapta a tu rutina sin esfuerzo.",
      card4Title: "Aprendizaje autónomo y sin vergüenza",
      card4Desc: "Tú tienes el control. La IA te aconseja en privado, eliminando el miedo al ridículo y aumentando tu confianza.",
    },
    plans: {
      title: "Planes",
      monthlyTitle: "Plan Mensual",
      monthlyPrice: "BRL 36",
      perMonth: "al mes",
      monthlyBilling: "Facturado mensualmente.",
      monthlyAnnualTotal: "Costo anual total: BRL 432",
      getMonthly: "Elegir Mensual",
      semiTitle: "Plan Semestral",
      semiPrice: "BRL 29",
      semiBilling: "Facturado semestralmente.",
      semiAnnualTotal: "Costo anual total: BRL 348",
      save20: "Ahorra R$84 (20%)",
      getSemi: "Elegir Semestral",
      yearlyTitle: "Plan Anual",
      yearlyPrice: "BRL 21",
      yearlyBilling: "Facturado anualmente.",
      yearlyAnnualTotal: "Costo anual total: BRL 252",
      save40: "Ahorra R$180 (40%)",
      bestValue: "Mejor Valor",
      getYearly: "Elegir Anual",
      guarantee: "Garantía incondicional de 15 días",
      choosePlan: "Elige un plan",
    },
    footer: {
      freePractice: "Práctica Gratuita de Inglés →",
      bookLesson: "Reservar una Sesión",
      blogTips: "Blog y Consejos de Aprendizaje",
      faq: "Preguntas Frequentes",
      trial: "Prueba Gratis de 15 Días →",
      terms: "Términos de Uso",
      privacy: "Sobre y Privacidad",
      contactWa: "Contacto por WhatsApp",
      adminPortal: "Portal de Administración →",
      copyright: "Copyright © 2025 Talk'n'Bit. Todos los derechos reservados.",
    },
    faqModal: {
      title: "Preguntas Frecuentes",
      subtitle: "Todo lo que necesitas saber sobre Talk'n'Bit",
      differentQuestion: "¿Tienes alguna otra duda?",
      askWa: "Preguntar en WhatsApp",
      items: [
        {
          q: "¿Cómo funciona Talk'n'Bit?",
          a: "Talk'n'Bit es tu compañero inteligente de inglés en WhatsApp. Chateas con naturalidad —a solas con el bot o en salas con un amigo. Cuando cometes un fallo, la IA te corrige en privado con un botón interactivo [¿Por qué? 💡] explicando la regla gramatical.",
        },
        {
          q: "¿Tengo que descargar alguna aplicación adicional?",
          a: "¡No! Todo funciona al 100% dentro de tu WhatsApp existente. Sin contraseñas nuevas, sin registros pesados y sin ocupar memoria en tu teléfono.",
        },
        {
          q: "¿Qué son las Salas de Práctica con Compañero (Study Buddy Rooms)?",
          a: "¡Es nuestro modo 'secret watcher'! Tú y tu compañero envían `/join <código>` (ej. `/join 101`) al bot. Los mensajes se reenvían entre ustedes, pero si cometes un error, Talk'n'Bit te corrige en privado únicamente a ti. Tu compañero nunca ve tus fallos.",
        },
        {
          q: "¿Cómo funciona la garantía de reembolso de 15 días?",
          a: "Prueba Talk'n'Bit durante 15 días sin ningún riesgo. Si no notas un avance evidente en tu fluidez y confianza, escríbenos a soporte o por correo y te reembolsaremos el 100% de inmediato.",
        },
        {
          q: "¿Puedo cancelar mi suscripción en cualquier momento?",
          a: "¡Sí! Sin permanencias ni contratos ocultos. Puedes pausar o cancelar tu membresía en cualquier momento directamente por WhatsApp o email.",
        },
        {
          q: "¿Es adecuado para niveles principiantes o intermedios?",
          a: "¡Para ambos! Los principiantes disfrutan de un espacio seguro sin presión y con apoyo contextual en español, mientras que los intermedios corrigen errores fosilizados y ganan agilidad.",
        },
      ],
    },
    blogModal: {
      title: "Blog de Talk'n'Bit y Guías de Aprendizaje",
      subtitle: "Consejos comprobados y métodos científicos para alcanzar la fluidez",
      readMore: "Leer guía completa",
      discussWa: "Conversar en WhatsApp",
      readyPrompt: "¿Listo para poner la teoría en práctica?",
      startFree: "Comenzar a Practicar Gratis",
      posts: [
        {
          title: "Por qué la micro-práctica en WhatsApp supera a clases de 2 horas",
          date: "Sep 2025",
          readTime: "3 min de lectura",
          tag: "Neurociencia",
          summary: "La neurociencia cognitiva demuestra que 10 minutos de práctica diaria activa fijan recuerdos 3 veces más rápido que 2 horas pasivas el fin de semana. Descubre el poder de WhatsApp.",
        },
        {
          title: "Los 5 errores gramaticales más comunes de hispanohablantes en inglés",
          date: "Ago 2025",
          readTime: "4 min de lectura",
          tag: "Consejos Gramaticales",
          summary: "Desde 'I have 25 years' hasta 'I didn't went' y falsos amigos como 'revisar currículum': descubre cómo corregirlos fácilmente y hablar con naturalidad.",
        },
        {
          title: "Cómo el método 'Observador Secreto' elimina el miedo a hablar",
          date: "Jul 2025",
          readTime: "3 min de lectura",
          tag: "Mentalidad",
          summary: "El mayor obstáculo para la fluidez es el miedo al juicio de los demás. Aprende cómo el feedback privado de la IA te brinda seguridad psicológica total.",
        },
      ],
    },
    whatsappMessages: {
      greeting: "¡Hola! Quiero practicar inglés con Talk'n'Bit",
      freePractice: "¡Hola! Quiero iniciar mi sesión gratuita de práctica de inglés",
      trial: "¡Hola! Me gustaría activar mi prueba gratuita de 15 días",
      immersion: "¡Hola! Quiero comenzar mi inmersión en inglés con Talk'n'Bit",
      vocab: "¡Hola! Quiero expandir mi vocabulario en inglés con Talk'n'Bit",
      howItWorks: "¡Hola! Quiero comenzar a chatear y recibir correcciones instantáneas",
      monthly: "¡Hola! Quiero suscribirme al plan Mensual de Talk'n'Bit (BRL 36/mes)",
      semi: "¡Hola! Quiero suscribirme al plan Semestral de Talk'n'Bit (BRL 29/mes)",
      yearly: "¡Hola! Quiero suscribirme al plan Anual de Talk'n'Bit (BRL 21/mes - Mejor Valor)",
      faq: "¡Hola! Tengo una pregunta que no está en las preguntas frecuentes",
      contact: "¡Hola! Me gustaría comunicarme con el equipo de Talk'n'Bit",
      lesson: "¡Hola! Me gustaría reservar una sesión de práctica de inglés",
    },
  },
};
