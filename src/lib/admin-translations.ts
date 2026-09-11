export type SupportedLang = "en" | "pt" | "es";

export interface AdminTranslationSchema {
  nav: {
    adminPortal: string;
    superadmin: string;
    viewSite: string;
    signOut: string;
    botLive: string;
    botIncomplete: string;
    botPaused: string;
  };
  auth: {
    backToSite: string;
    adminBadge: string;
    heading: string;
    subheading: string;
    googleBtn: string;
    orEmail: string;
    emailLabel: string;
    passwordLabel: string;
    signInBtn: string;
    signUpBtn: string;
    switchToSignUp: string;
    switchToSignIn: string;
    signOut: string;
    studentAccountBadge: string;
    noAccessTitle: string;
    noAccessDesc: string;
    goHome: string;
    startTrialWithAccount: string;
    signOutAndStartTrial: string;
    signOutAndGoHome: string;
    trialPromptTitle: string;
    trialPromptDesc: string;
  };
  banner: {
    title: string;
    desc: string;
    active: string;
    disabled: string;
  };
  tabs: {
    overview: string;
    messages: string;
    subscribers: string;
    settings: string;
    liveMonitor: string;
    refresh: string;
    refreshing: string;
  };
  overview: {
    kpiMessages: string;
    kpiCorrections: string;
    kpiCorrectionsHighlight: string;
    kpiClean: string;
    kpiCleanHighlight: string;
    kpiFailed: string;
    latestMessages: string;
    openLiveMonitor: string;
    viewDetails: string;
    noMessages: string;
    studyBuddyTitle: string;
    studyBuddySubtitle: string;
    studyBuddyActive: string;
    howConnect: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    watcherTitle: string;
    watcherDesc: string;
    watcherDms: string;
  };
  messages: {
    searchPlaceholder: string;
    chatFeed: string;
    table: string;
    filterAll: string;
    filterCorrected: string;
    filterClean: string;
    filterRooms: string;
    filterFailed: string;
    room: string;
    group: string;
    student: string;
    bot: string;
    youMeant: string;
    why: string;
    cleanFeedback: string;
    roomAction: string;
    noText: string;
    noResultsTitle: string;
    noResultsSearch: string;
    noResultsCategory: string;
    resetFilters: string;
    timeCol: string;
    senderCol: string;
    messageCol: string;
    replyCol: string;
    statusCol: string;
    noTableMessages: string;
  };
  subscribers: {
    activeTitle: string;
    activeSub: string;
    trialsTitle: string;
    trialsSub: string;
    expiredTitle: string;
    expiredSub: string;
    totalTitle: string;
    totalSub: string;
    grantTitle: string;
    grantSubtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    planLabel: string;
    planMonthly: string;
    planYearly: string;
    planLifetime: string;
    unlockBtn: string;
    activatingBtn: string;
    searchPlaceholder: string;
    filterAll: string;
    filterActive: string;
    filterTrial: string;
    filterExpired: string;
    colPhone: string;
    colStatus: string;
    colPlan: string;
    colMessages: string;
    colExpires: string;
    colActions: string;
    btn30Days: string;
    btnVip: string;
    resetCountTooltip: string;
    removeSubTooltip: string;
    neverExpires: string;
    unlimitedMsgs: string;
    noSubscribers: string;
  };
  settings: {
    promptTitle: string;
    promptSubtitle: string;
    savePrompt: string;
    savingPrompt: string;
    resetChanges: string;
    validJsonNote: string;
  };
  statusLabels: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "idle" }>;
}

export const ADMIN_TRANSLATIONS: Record<SupportedLang, AdminTranslationSchema> = {
  en: {
    nav: {
      adminPortal: "Admin Portal",
      superadmin: "Superadmin",
      viewSite: "View Site",
      signOut: "Sign out",
      botLive: "Live",
      botIncomplete: "On, incomplete setup",
      botPaused: "Paused",
    },
    auth: {
      backToSite: "Back to site",
      adminBadge: "Admin",
      heading: "Admin Portal",
      subheading: "Sign in to manage bot prompts, rooms, and live telemetry",
      googleBtn: "Continue with Google",
      orEmail: "Or with email",
      emailLabel: "Admin email",
      passwordLabel: "Password",
      signInBtn: "Sign in to Dashboard",
      signUpBtn: "Create Admin Account",
      switchToSignUp: "First time? Create the admin account",
      switchToSignIn: "Already have an account? Sign in",
      signOut: "Sign out",
      studentAccountBadge: "Student Account Active",
      noAccessTitle: "Welcome to Talk'n'Bit!",
      noAccessDesc: "is logged in. This back-office panel is reserved for administrative staff, but your student account is ready to practice English on WhatsApp!",
      goHome: "Return to Home",
      startTrialWithAccount: "Start 15-Day Free Trial with this Account →",
      signOutAndStartTrial: "Sign Off & Start Free Trial →",
      signOutAndGoHome: "Sign Off & Return Home",
      trialPromptTitle: "Ready to Practice English on WhatsApp?",
      trialPromptDesc: "Activate your 15-day free trial on your account! Chat 1-on-1 with Talk'n'Bit and receive private AI grammar whispers in real time. No credit card required.",
    },
    banner: {
      title: "Process Incoming Messages",
      desc: "When enabled, Talk'n'Bit checks student grammar and sends real-time WhatsApp corrections. When paused, messages are logged without replies.",
      active: "Active",
      disabled: "Disabled",
    },
    tabs: {
      overview: "Overview",
      messages: "WhatsApp Messages",
      subscribers: "Subscribers & Paywall",
      settings: "Settings",
      liveMonitor: "Live monitor",
      refresh: "Refresh",
      refreshing: "Refreshing...",
    },
    overview: {
      kpiMessages: "Messages Received",
      kpiCorrections: "Corrections Sent",
      kpiCorrectionsHighlight: "Warm feedback",
      kpiClean: "Clean Messages",
      kpiCleanHighlight: "No errors",
      kpiFailed: "Failed Invocations",
      latestMessages: "Latest WhatsApp Messages",
      openLiveMonitor: "Open Live Monitor →",
      viewDetails: "View details →",
      noMessages: "No messages received yet. Send a WhatsApp message to test!",
      studyBuddyTitle: "Study Buddy Practice Rooms (Secret-Watcher Mode)",
      studyBuddySubtitle: "Two students chat directly via Talk'n'Bit while AI quietly observes and whispers corrections.",
      studyBuddyActive: "Active",
      howConnect: "How Students Connect:",
      step1: "Student A texts",
      step2: "Student B texts",
      step3: "Both are instantly paired and messages relay in real-time",
      step4: "Either partner texts /leave to disconnect",
      watcherTitle: "Secret-Watcher Intelligence",
      watcherDesc: "Neither student sees their partner get corrected in public. Corrections arrive as private whispers with Why? explanations directly from the bot.",
      watcherDms: "Room Private DMs Delivered:",
    },
    messages: {
      searchPlaceholder: "Search WhatsApp messages, numbers, corrections...",
      chatFeed: "Chat Feed",
      table: "Table",
      filterAll: "All Messages",
      filterCorrected: "Mistakes Corrected",
      filterClean: "Natural / No Mistake",
      filterRooms: "Study Buddy Rooms",
      filterFailed: "Issues / Failed",
      room: "Room",
      group: "WhatsApp Group",
      student: "Student:",
      bot: "Bot:",
      youMeant: "You meant:",
      why: "💡 Why?",
      cleanFeedback: "Natural English detected — no correction needed.",
      roomAction: "Executed Study Buddy command",
      noText: "No message text recorded",
      noResultsTitle: "No messages found",
      noResultsSearch: 'No messages matched your search "{query}". Try clearing filters.',
      noResultsCategory: "No messages in this category yet. Send a test WhatsApp message to see it appear live!",
      resetFilters: "Reset Filters",
      timeCol: "Time",
      senderCol: "Sender",
      messageCol: "WhatsApp Message",
      replyCol: "Bot Correction & Reply",
      statusCol: "Status",
      noTableMessages: "No messages match your criteria.",
    },
    subscribers: {
      activeTitle: "Active Subscribers",
      activeSub: "Paying & VIP Members",
      trialsTitle: "Free Trials",
      trialsSub: "24h / 15-msg trials",
      expiredTitle: "Paywalled / Expired",
      expiredSub: "Shown paywall card",
      totalTitle: "Total Users Seen",
      totalSub: "Tracked numbers",
      grantTitle: "Manual Access Grant & Number Activation",
      grantSubtitle: "Instantly activate or extend access for a WhatsApp phone number",
      phoneLabel: "WhatsApp Number (with country code)",
      phonePlaceholder: "e.g. 5513991878104",
      planLabel: "Plan Type",
      planMonthly: "Monthly Plan (30 days)",
      planYearly: "Yearly Plan (365 days)",
      planLifetime: "Lifetime VIP (Unlimited)",
      unlockBtn: "Unlock Number 🚀",
      activatingBtn: "Activating...",
      searchPlaceholder: "Search subscriber by phone digits or plan...",
      filterAll: "all",
      filterActive: "active",
      filterTrial: "trial",
      filterExpired: "expired",
      colPhone: "Phone Number",
      colStatus: "Status",
      colPlan: "Plan",
      colMessages: "Messages Count",
      colExpires: "Access Expires",
      colActions: "Quick Action",
      btn30Days: "+30 Days",
      btnVip: "VIP",
      resetCountTooltip: "Reset Message Count to 0",
      removeSubTooltip: "Remove Subscriber",
      neverExpires: "Never",
      unlimitedMsgs: "Unlimited",
      noSubscribers: "No subscribers match your search filter.",
    },
    settings: {
      promptTitle: "Correction Instructions (System Prompt)",
      promptSubtitle: "Defines how Talk'n'Bit analyzes grammar, context, and crafts friendly corrections and explanations.",
      savePrompt: "Save Prompt",
      savingPrompt: "Saving...",
      resetChanges: "Reset Changes",
      validJsonNote: "Must return valid JSON schema for bot parsing",
    },
    statusLabels: {
      corrected: { label: "Correction Sent", tone: "ok" },
      corrected_group_dm: { label: "Group Correction DM", tone: "ok" },
      relay_corrected: { label: "Relayed + Correction", tone: "ok" },
      relay_ok: { label: "Relayed (No Mistake)", tone: "idle" },
      no_error: { label: "Natural English (Clean)", tone: "idle" },
      confirmed_correct: { label: "Confirmed Natural", tone: "ok" },
      hint_sent: { label: "Grammar Hint Sent", tone: "ok" },
      explanation_sent: { label: "Grammar Explanation", tone: "ok" },
      intro_sent: { label: "Welcome Menu Sent", tone: "ok" },
      capabilities_sent: { label: "How It Works Sent", tone: "ok" },
      starter_sent: { label: "1-on-1 Practice Started", tone: "ok" },
      room_tutorial_sent: { label: "Study Buddy Guide", tone: "ok" },
      room_command: { label: "Study Buddy Command", tone: "idle" },
      try_sentence_prompted: { label: "Practice Prompt Sent", tone: "ok" },
      bilingual_answered: { label: "Bilingual Helper Sent", tone: "ok" },
      paywall_shown: { label: "Trial Paywall Shown", tone: "warn" },
      pay_link_sent: { label: "Checkout Link Sent", tone: "ok" },
      paywall_benefits_sent: { label: "Plan Benefits Sent", tone: "ok" },
      skipped_disabled: { label: "Bot Inactive", tone: "warn" },
      failed: { label: "Processing Error", tone: "bad" },
      received: { label: "Message Received", tone: "idle" },
    },
  },

  pt: {
    nav: {
      adminPortal: "Painel do Administrador",
      superadmin: "Superadmin",
      viewSite: "Ver Site",
      signOut: "Sair",
      botLive: "Ao Vivo",
      botIncomplete: "Ativo, setup incompleto",
      botPaused: "Pausado",
    },
    auth: {
      backToSite: "Voltar para o site",
      adminBadge: "Admin",
      heading: "Painel do Administrador",
      subheading: "Faça login para gerenciar prompts, salas e telemetria ao vivo",
      googleBtn: "Continuar com Google",
      orEmail: "Ou com e-mail",
      emailLabel: "E-mail de administrador",
      passwordLabel: "Senha",
      signInBtn: "Entrar no Painel",
      signUpBtn: "Criar Conta de Administrador",
      switchToSignUp: "Primeira vez? Crie uma conta de administrador",
      switchToSignIn: "Já possui uma conta? Entrar",
      signOut: "Sair da conta",
      studentAccountBadge: "Conta de Aluno Ativa",
      noAccessTitle: "Bem-vindo ao Talk'n'Bit!",
      noAccessDesc: "está conectado. Este painel interno é exclusivo para a equipe de administração, mas sua conta de aluno está pronta para praticar inglês no WhatsApp!",
      goHome: "Voltar para o Início",
      startTrialWithAccount: "Iniciar Teste Grátis de 15 Dias com esta Conta →",
      signOutAndStartTrial: "Sair e Iniciar Teste Grátis →",
      signOutAndGoHome: "Sair e Voltar para o Início",
      trialPromptTitle: "Pronto para Praticar Inglês no WhatsApp?",
      trialPromptDesc: "Ative seu teste grátis de 15 dias na sua conta! Converse no WhatsApp e receba correções discretas da IA em tempo real. Sem cartão de crédito.",
    },
    banner: {
      title: "Processar Mensagens Recebidas",
      desc: "Quando ativado, o Talk'n'Bit analisa a gramática dos alunos e envia correções em tempo real no WhatsApp. Quando pausado, as mensagens são apenas registradas sem resposta.",
      active: "Ativo",
      disabled: "Desativado",
    },
    tabs: {
      overview: "Visão Geral",
      messages: "Mensagens do WhatsApp",
      subscribers: "Assinantes & Paywall",
      settings: "Configurações",
      liveMonitor: "Monitor ao vivo",
      refresh: "Atualizar",
      refreshing: "Atualizando...",
    },
    overview: {
      kpiMessages: "Mensagens Recebidas",
      kpiCorrections: "Correções Enviadas",
      kpiCorrectionsHighlight: "Feedback amigável",
      kpiClean: "Mensagens Corretas",
      kpiCleanHighlight: "Sem erros",
      kpiFailed: "Falhas de Envio",
      latestMessages: "Últimas Mensagens do WhatsApp",
      openLiveMonitor: "Abrir Monitor ao Vivo →",
      viewDetails: "Ver detalhes →",
      noMessages: "Nenhuma mensagem recebida ainda. Envie uma mensagem no WhatsApp para testar!",
      studyBuddyTitle: "Salas de Prática Study Buddy (Modo Observador Secreto)",
      studyBuddySubtitle: "Dois alunos conversam diretamente pelo Talk'n'Bit enquanto a IA observa discretamente e sussurra correções.",
      studyBuddyActive: "Ativo",
      howConnect: "Como os Alunos Conectam:",
      step1: "Aluno A envia",
      step2: "Aluno B envia",
      step3: "Ambos são pareados instantaneamente e mensagens repassadas em tempo real",
      step4: "Qualquer um dos parceiros envia /leave para desconectar",
      watcherTitle: "Inteligência do Observador Secreto",
      watcherDesc: "Nenhum aluno vê o parceiro ser corrigido em público. As correções chegam como sussurros privados com explicações Por quê? 💡 direto do bot.",
      watcherDms: "DMs Privadas Entregues na Sala:",
    },
    messages: {
      searchPlaceholder: "Buscar mensagens do WhatsApp, números, correções...",
      chatFeed: "Feed de Conversa",
      table: "Tabela",
      filterAll: "Todas as Mensagens",
      filterCorrected: "Erros Corrigidos",
      filterClean: "Natural / Sem Erro",
      filterRooms: "Salas Study Buddy",
      filterFailed: "Problemas / Falhas",
      room: "Sala",
      group: "Grupo de WhatsApp",
      student: "Aluno:",
      bot: "Bot:",
      youMeant: "Você quis dizer:",
      why: "💡 Por quê?",
      cleanFeedback: "Inglês natural detectado — nenhuma correção necessária.",
      roomAction: "Comando Study Buddy executado",
      noText: "Nenhum texto de mensagem registrado",
      noResultsTitle: "Nenhuma mensagem encontrada",
      noResultsSearch: 'Nenhuma mensagem correspondeu à sua pesquisa "{query}". Tente limpar os filtros.',
      noResultsCategory: "Nenhuma mensagem nesta categoria ainda. Envie uma mensagem de teste no WhatsApp para vê-la aparecer ao vivo!",
      resetFilters: "Redefinir Filtros",
      timeCol: "Horário",
      senderCol: "Remetente",
      messageCol: "Mensagem do WhatsApp",
      replyCol: "Correção & Resposta do Bot",
      statusCol: "Status",
      noTableMessages: "Nenhuma mensagem corresponde aos seus critérios.",
    },
    subscribers: {
      activeTitle: "Assinantes Ativos",
      activeSub: "Membros Pagantes & VIP",
      trialsTitle: "Testes Gratuitos",
      trialsSub: "Testes de 24h / 15 msgs",
      expiredTitle: "Paywall / Expirados",
      expiredSub: "Viram tela de paywall",
      totalTitle: "Total de Usuários",
      totalSub: "Números registrados",
      grantTitle: "Liberação Manual & Ativação de Número",
      grantSubtitle: "Ative ou estenda o acesso imediatamente para um número de WhatsApp",
      phoneLabel: "Número de WhatsApp (com DDI/DDD)",
      phonePlaceholder: "ex. 5513991878104",
      planLabel: "Tipo de Plano",
      planMonthly: "Plano Mensal (30 dias)",
      planYearly: "Plano Anual (365 dias)",
      planLifetime: "VIP Vitalício (Ilimitado)",
      unlockBtn: "Liberar Número 🚀",
      activatingBtn: "Ativando...",
      searchPlaceholder: "Buscar assinante por dígitos ou plano...",
      filterAll: "todos",
      filterActive: "ativos",
      filterTrial: "teste",
      filterExpired: "expirados",
      colPhone: "Número de Telefone",
      colStatus: "Status",
      colPlan: "Plano",
      colMessages: "Contagem de Mensagens",
      colExpires: "Acesso Expira em",
      colActions: "Ação Rápida",
      btn30Days: "+30 Dias",
      btnVip: "VIP",
      resetCountTooltip: "Zerar Contagem para 0",
      removeSubTooltip: "Remover Assinante",
      neverExpires: "Nunca",
      unlimitedMsgs: "Ilimitado",
      noSubscribers: "Nenhum assinante corresponde ao seu filtro.",
    },
    settings: {
      promptTitle: "Instruções de Correção (System Prompt)",
      promptSubtitle: "Define como o Talk'n'Bit analisa a gramática, contexto e elabora correções e explicações amigáveis.",
      savePrompt: "Salvar Prompt",
      savingPrompt: "Salvando...",
      resetChanges: "Descartar Alterações",
      validJsonNote: "Deve retornar schema JSON válido para o bot processar",
    },
    statusLabels: {
      corrected: { label: "Correção Enviada", tone: "ok" },
      corrected_group_dm: { label: "Correção Privada (Grupo)", tone: "ok" },
      relay_corrected: { label: "Repassado + Correção", tone: "ok" },
      relay_ok: { label: "Repassado (Sem Erro)", tone: "idle" },
      no_error: { label: "Inglês Natural (Correto)", tone: "idle" },
      confirmed_correct: { label: "Confirmado Correto", tone: "ok" },
      hint_sent: { label: "Dica de Gramática Enviada", tone: "ok" },
      explanation_sent: { label: "Explicação Gramatical", tone: "ok" },
      intro_sent: { label: "Menu de Boas-Vindas Enviado", tone: "ok" },
      capabilities_sent: { label: "Guia 'Como Funciona' Enviado", tone: "ok" },
      starter_sent: { label: "Prática 1-a-1 Iniciada", tone: "ok" },
      room_tutorial_sent: { label: "Guia Study Buddy Enviado", tone: "ok" },
      room_command: { label: "Comando Study Buddy", tone: "idle" },
      try_sentence_prompted: { label: "Convite de Frase Enviado", tone: "ok" },
      bilingual_answered: { label: "Ajuda Bilíngue Enviada", tone: "ok" },
      paywall_shown: { label: "Paywall de Teste Exibido", tone: "warn" },
      pay_link_sent: { label: "Link de Pagamento Enviado", tone: "ok" },
      paywall_benefits_sent: { label: "Benefícios do Plano Enviados", tone: "ok" },
      skipped_disabled: { label: "Bot Desativado", tone: "warn" },
      failed: { label: "Erro no Processamento", tone: "bad" },
      received: { label: "Mensagem Recebida", tone: "idle" },
    },
  },

  es: {
    nav: {
      adminPortal: "Panel de Administración",
      superadmin: "Superadmin",
      viewSite: "Ver Sitio",
      signOut: "Cerrar sesión",
      botLive: "En Vivo",
      botIncomplete: "Activo, configuración incompleta",
      botPaused: "Pausado",
    },
    auth: {
      backToSite: "Volver al sitio",
      adminBadge: "Admin",
      heading: "Panel de Administración",
      subheading: "Inicia sesión para gestionar prompts, salas y telemetría en vivo",
      googleBtn: "Continuar con Google",
      orEmail: "O con correo",
      emailLabel: "Correo de administrador",
      passwordLabel: "Contraseña",
      signInBtn: "Entrar al Panel",
      signUpBtn: "Crear Cuenta de Administrador",
      switchToSignUp: "¿Primera vez? Crea la cuenta de administrador",
      switchToSignIn: "¿Ya tienes una cuenta? Iniciar sesión",
      signOut: "Cerrar sesión",
      studentAccountBadge: "Cuenta de Estudiante Activa",
      noAccessTitle: "¡Bienvenido a Talk'n'Bit!",
      noAccessDesc: "ha iniciado sesión. Este panel interno está reservado para el personal administrativo, ¡pero tu cuenta de estudiante está lista para practicar inglés en WhatsApp!",
      goHome: "Volver al Inicio",
      startTrialWithAccount: "Iniciar Prueba Gratis de 15 Días con esta Cuenta →",
      signOutAndStartTrial: "Cerrar Sesión e Iniciar Prueba Gratis →",
      signOutAndGoHome: "Cerrar Sesión y Volver al Inicio",
      trialPromptTitle: "¿Listo para Practicar Inglés en WhatsApp?",
      trialPromptDesc: "¡Activa tu prueba gratis de 15 días en tu cuenta! Chatea en WhatsApp y recibe correcciones privadas de la IA en tiempo real. Sin tarjeta de crédito.",
    },
    banner: {
      title: "Procesar Mensajes Entrantes",
      desc: "Cuando está activado, Talk'n'Bit revisa la gramática de los estudiantes y envía correcciones en tiempo real por WhatsApp. Cuando está en pausa, los mensajes se registran sin respuesta.",
      active: "Activo",
      disabled: "Desactivado",
    },
    tabs: {
      overview: "Visión General",
      messages: "Mensajes de WhatsApp",
      subscribers: "Suscriptores y Paywall",
      settings: "Ajustes",
      liveMonitor: "Monitor en vivo",
      refresh: "Actualizar",
      refreshing: "Actualizando...",
    },
    overview: {
      kpiMessages: "Mensajes Recibidos",
      kpiCorrections: "Correcciones Enviadas",
      kpiCorrectionsHighlight: "Feedback amigable",
      kpiClean: "Mensajes Correctos",
      kpiCleanHighlight: "Sin errores",
      kpiFailed: "Fallos de Envío",
      latestMessages: "Últimos Mensajes de WhatsApp",
      openLiveMonitor: "Abrir Monitor en Vivo →",
      viewDetails: "Ver detalles →",
      noMessages: "No se han recibido mensajes aún. ¡Envía un mensaje por WhatsApp para probar!",
      studyBuddyTitle: "Salas de Práctica Study Buddy (Modo Observador Secreto)",
      studyBuddySubtitle: "Dos estudiantes conversan directamente vía Talk'n'Bit mientras la IA observa discretamente y susurra correcciones.",
      studyBuddyActive: "Activo",
      howConnect: "Cómo se Conectan los Estudiantes:",
      step1: "Estudiante A envía",
      step2: "Estudiante B envía",
      step3: "Ambos se emparejan al instante y los mensajes se retransmiten en tiempo real",
      step4: "Cualquiera de los compañeros envía /leave para desconectarse",
      watcherTitle: "Inteligencia del Observador Secreto",
      watcherDesc: "Ningún estudiante ve a su compañero ser corregido en público. Las correcciones llegan como susurros privados con explicaciones ¿Por qué? 💡 directo del bot.",
      watcherDms: "DMs Privados Entregados en la Sala:",
    },
    messages: {
      searchPlaceholder: "Buscar mensajes de WhatsApp, números, correcciones...",
      chatFeed: "Feed de Chat",
      table: "Tabla",
      filterAll: "Todos los Mensajes",
      filterCorrected: "Errores Corregidos",
      filterClean: "Natural / Sin Error",
      filterRooms: "Salas Study Buddy",
      filterFailed: "Problemas / Fallos",
      room: "Sala",
      group: "Grupo de WhatsApp",
      student: "Estudiante:",
      bot: "Bot:",
      youMeant: "Quisiste decir:",
      why: "💡 ¿Por qué?",
      cleanFeedback: "Inglés natural detectado — no requiere corrección.",
      roomAction: "Comando Study Buddy ejecutado",
      noText: "Ningún texto registrado",
      noResultsTitle: "No se encontraron mensajes",
      noResultsSearch: 'Ningún mensaje coincidió con tu búsqueda "{query}". Intenta limpiar los filtros.',
      noResultsCategory: "No hay mensajes en esta categoría aún. ¡Envía un mensaje de prueba por WhatsApp para verlo en vivo!",
      resetFilters: "Restablecer Filtros",
      timeCol: "Hora",
      senderCol: "Remitente",
      messageCol: "Mensaje de WhatsApp",
      replyCol: "Corrección y Respuesta del Bot",
      statusCol: "Estado",
      noTableMessages: "No hay mensajes que coincidan con tu criterio.",
    },
    subscribers: {
      activeTitle: "Suscriptores Activos",
      activeSub: "Miembros Pagando & VIP",
      trialsTitle: "Pruebas Gratuitas",
      trialsSub: "Pruebas de 24h / 15 msgs",
      expiredTitle: "Paywall / Expirados",
      expiredSub: "Vieron pantalla de paywall",
      totalTitle: "Total de Usuarios",
      totalSub: "Números registrados",
      grantTitle: "Activación Manual & Desbloqueo de Número",
      grantSubtitle: "Activa o extiende el acceso de inmediato para un número de WhatsApp",
      phoneLabel: "Número de WhatsApp (con código de país)",
      phonePlaceholder: "ej. 5513991878104",
      planLabel: "Tipo de Plan",
      planMonthly: "Plan Mensual (30 días)",
      planYearly: "Plan Anual (365 días)",
      planLifetime: "VIP Vitalicio (Ilimitado)",
      unlockBtn: "Desbloquear Número 🚀",
      activatingBtn: "Activando...",
      searchPlaceholder: "Buscar suscriptor por dígitos o plan...",
      filterAll: "todos",
      filterActive: "activos",
      filterTrial: "prueba",
      filterExpired: "expirados",
      colPhone: "Número de Teléfono",
      colStatus: "Estado",
      colPlan: "Plan",
      colMessages: "Conteo de Mensajes",
      colExpires: "Acceso Expira en",
      colActions: "Acción Rápida",
      btn30Days: "+30 Días",
      btnVip: "VIP",
      resetCountTooltip: "Reiniciar Conteo a 0",
      removeSubTooltip: "Eliminar Suscriptor",
      neverExpires: "Nunca",
      unlimitedMsgs: "Ilimitado",
      noSubscribers: "No hay suscriptores que coincidan con tu filtro.",
    },
    settings: {
      promptTitle: "Instrucciones de Corrección (System Prompt)",
      promptSubtitle: "Define cómo Talk'n'Bit analiza la gramática, contexto y formula correcciones y explicaciones amigables.",
      savePrompt: "Guardar Prompt",
      savingPrompt: "Guardando...",
      resetChanges: "Descartar Cambios",
      validJsonNote: "Debe devolver un esquema JSON válido para el procesamiento del bot",
    },
    statusLabels: {
      corrected: { label: "Corrección Enviada", tone: "ok" },
      corrected_group_dm: { label: "Corrección Privada (Grupo)", tone: "ok" },
      relay_corrected: { label: "Retransmitido + Corrección", tone: "ok" },
      relay_ok: { label: "Retransmitido (Sin Error)", tone: "idle" },
      no_error: { label: "Inglés Natural (Correcto)", tone: "idle" },
      confirmed_correct: { label: "Confirmado Correcto", tone: "ok" },
      hint_sent: { label: "Pista Gramatical Enviada", tone: "ok" },
      explanation_sent: { label: "Explicación Gramatical", tone: "ok" },
      intro_sent: { label: "Menú de Bienvenida Enviado", tone: "ok" },
      capabilities_sent: { label: "Guía 'Cómo Funciona' Enviada", tone: "ok" },
      starter_sent: { label: "Práctica 1-a-1 Iniciada", tone: "ok" },
      room_tutorial_sent: { label: "Guía Study Buddy Enviada", tone: "ok" },
      room_command: { label: "Comando Study Buddy", tone: "idle" },
      try_sentence_prompted: { label: "Invitación de Frase Enviada", tone: "ok" },
      bilingual_answered: { label: "Ayuda Bilingüe Enviada", tone: "ok" },
      paywall_shown: { label: "Paywall de Prueba Mostrado", tone: "warn" },
      pay_link_sent: { label: "Enlace de Pago Enviado", tone: "ok" },
      paywall_benefits_sent: { label: "Beneficios del Plan Enviados", tone: "ok" },
      skipped_disabled: { label: "Bot Desactivado", tone: "warn" },
      failed: { label: "Error de Procesamiento", tone: "bad" },
      received: { label: "Mensaje Recibido", tone: "idle" },
    },
  },
};
