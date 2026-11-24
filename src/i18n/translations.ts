import type { ReoLang } from '../lib/api';

export interface TranslationDictionary {
  brand: {
    name: string;
    subtitle: string;
    platformTagline: string;
  };
  langSwitcher: {
    label: string;
    en: string;
    ru: string;
    az: string;
  };
  auth: {
    heroTitle: string;
    heroDescription: string;
    sandboxEyebrow: string;
    sandboxTitle: string;
    sandboxDescription: string;
    sandboxButton: string;
    sandboxLaunching: string;
    orDivider: string;
    authModeAriaLabel: string;
    signInTab: string;
    signUpTab: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    signInButton: string;
    signUpButton: string;
    authenticating: string;
    validationEmailRequired: string;
    validationPasswordMin: string;
    signUpSuccessNotice: string;
    authErrorFallback: string;
    modulesHeading: string;
    featureCoachTitle: string;
    featureCoachDesc: string;
    featureArenaTitle: string;
    featureArenaDesc: string;
    featureCveTitle: string;
    featureCveDesc: string;
    featureSocTitle: string;
    featureSocDesc: string;
  };
  hud: {
    navAriaLabel: string;
    tabCoach: string;
    tabArena: string;
    tabCve: string;
    tabSoc: string;
    juryTimerLabel: string;
    juryExpiredLabel: string;
    renewSession: string;
    renewingSession: string;
    signOut: string;
    accountJury: string;
    accountStandard: string;
    sessionExpiredBanner: string;
    rateLimitBanner: string;
    dismissNotice: string;
    loadingSession: string;
  };
  workspace: {
    foundationVerified: string;
    activeSessionLabel: string;
    activeLangLabel: string;
    endpointContractLabel: string;
    rlsTablesLabel: string;
    milestoneBadgeLabel: string;
    milestone2Label: string;
    milestone3Label: string;
    milestone4Label: string;
    coachTitle: string;
    coachSubtitle: string;
    coachScope: string;
    arenaTitle: string;
    arenaSubtitle: string;
    arenaScope: string;
    cveTitle: string;
    cveSubtitle: string;
    cveScope: string;
    socTitle: string;
    socSubtitle: string;
    socScope: string;
    biometricsTitle: string;
    biometricsSubtitle: string;
    biometricsInputLabel: string;
    biometricsInputPlaceholder: string;
    biometricsSamplesLabel: string;
    biometricsLastFlightLabel: string;
    biometricsPastesLabel: string;
    biometricsSessionLabel: string;
    biometricsResetButton: string;
    biometricsHeaderPreviewLabel: string;
    biometricsNoSample: string;
  };
  coach: {
    sidebarTitle: string;
    newSession: string;
    loadingThreads: string;
    emptyThreads: string;
    loadingMessages: string;
    deleteThreadAria: string;
    confirmDelete: string;
    cancelDelete: string;
    toggleSidebarAria: string;
    closeSidebarAria: string;
    subjectLabel: string;
    modelProfileLabel: string;
    subjects: {
      Cybersecurity: string;
      Mathematics: string;
      Physics: string;
      Informatics: string;
      English: string;
      General: string;
    };
    profiles: {
      fast: string;
      deep: string;
      qwen_plus: string;
      qwen_max: string;
    };
    welcomeTitle: string;
    welcomeDescription: string;
    starterPromptsLabel: string;
    starterPrompts: {
      cyber: string;
      math: string;
      informatics: string;
    };
    roleUser: string;
    roleAssistant: string;
    composerLabel: string;
    composerPlaceholder: string;
    sendButton: string;
    sendingLabel: string;
    analyzingStatus: string;
    shiftEnterHint: string;
    bioSamplesLabel: string;
    bioPastesLabel: string;
    bioSessionLabel: string;
    copyCode: string;
    copiedCode: string;
    error401Title: string;
    error401Desc: string;
    error429Title: string;
    error429Desc: string;
    errorNetworkTitle: string;
    errorNetworkDesc: string;
    errorLoadThreads: string;
    errorDeleteThread: string;
    shield: {
      statusClean: string;
      statusHoneypot: string;
      reoIndex: string;
      dJs: string;
      hBio: string;
      cv: string;
      failoverBadge: string;
      degradedBadge: string;
      inspectToggle: string;
      hideToggle: string;
      consensusMal: string;
      bioPenalty: string;
      heuristicScore: string;
      threatType: string;
      severity: string;
      matchedRules: string;
      canaryIssued: string;
      canaryVerified: string;
      crossAccountReplay: string;
      noneLabel: string;
      yesLabel: string;
      noLabel: string;
    };
    honeypot: {
      bannerTitle: string;
      zeroSpendBadge: string;
      canaryVerifiedBadge: string;
      canaryIssuedBadge: string;
      canaryTokenLabel: string;
      copyCanary: string;
      copiedCanary: string;
      terminalLabel: string;
      localOnlyNote: string;
      threatLabel: string;
      severityLabel: string;
      rulesLabel: string;
    };
  };
  arena: {
    title: string;
    subtitle: string;
    promptLabel: string;
    promptPlaceholder: string;
    deepAuditLabel: string;
    deepAuditHint: string;
    blueTeamLabel: string;
    redTeamLabel: string;
    pairingLabel: string;
    linkCveLabel: string;
    noLinkedCve: string;
    launchDuelButton: string;
    runningDuelLabel: string;
    runningDuelStatus: string;
    crossFamilyVerified: string;
    singleFamilyFailover: string;
    totalLatencyLabel: string;
    blueColumnTitle: string;
    redColumnTitle: string;
    arbiterTitle: string;
    verdictPending: string;
    verdictBlueClean: string;
    verdictRedFoundFlaw: string;
    markBlueClean: string;
    markRedFlaw: string;
    savingVerdict: string;
    historyTitle: string;
    historyToggleShow: string;
    historyToggleHide: string;
    historyLoading: string;
    historyEmpty: string;
    historyCountSuffix: string;
    viewingPastRunBanner: string;
    clearActiveRun: string;
    linkedCveBadge: string;
    errorLoadHistory: string;
    errorUpdateVerdict: string;
    errorNetworkDesc: string;
  };
  cve: {
    title: string;
    subtitle: string;
    logNewButton: string;
    kpiTotal: string;
    kpiVulnerable: string;
    kpiPatched: string;
    kpiRegressed: string;
    kpiPendingReviews: string;
    filterAll: string;
    filterVulnerable: string;
    filterPatched: string;
    filterRegressed: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    loadingRecords: string;
    emptyRecords: string;
    emptyFiltered: string;
    statusLabels: {
      VULNERABLE: string;
      PATCHED: string;
      REGRESSED: string;
    };
    rootCauseLabels: {
      knowledge_gap: string;
      attention_slip: string;
    };
    problemLabel: string;
    derivationLabel: string;
    verifiedAtLabel: string;
    repetitionDueBadge: string;
    stepDaysPrefix: string;
    markReviewDone: string;
    markingReview: string;
    launchPatchButton: string;
    deleteRecordAria: string;
    modalCreateTitle: string;
    modalCloseAria: string;
    fieldVulnCode: string;
    fieldSubject: string;
    fieldTopic: string;
    fieldTopicPlaceholder: string;
    fieldRootCause: string;
    fieldProblem: string;
    fieldProblemPlaceholder: string;
    fieldDerivation: string;
    fieldDerivationPlaceholder: string;
    createSubmitButton: string;
    creatingButton: string;
    validationRequiredFields: string;
    drawerTitle: string;
    step1Title: string;
    generateButton: string;
    generatingButton: string;
    recordSanitizedNotice: string;
    challengePromptLabel: string;
    step2Title: string;
    answerLabel: string;
    answerPlaceholder: string;
    verifyButton: string;
    verifyingButton: string;
    step3Title: string;
    scoreLabel: string;
    patchPassedBanner: string;
    patchFailedBanner: string;
    statusTransitionLabel: string;
    repetitionScheduledNotice: string;
    parseFailedNotice: string;
    feedbackLabel: string;
    errorLoadRecords: string;
    errorCreateRecord: string;
    errorDeleteRecord: string;
    errorMarkReview: string;
    errorNetworkDesc: string;
  };
  soc: {
    title: string;
    subtitle: string;
    simulatorTitle: string;
    simulatorSubtitle: string;
    runAllButton: string;
    runningAllButton: string;
    allVerifiedBanner: string;
    activeCanaryLabel: string;
    noCanaryCaptured: string;
    runPresetButton: string;
    runningPresetButton: string;
    expandDetails: string;
    hideDetails: string;
    statusLabels: {
      IDLE: string;
      RUNNING: string;
      VERIFIED: string;
      FAILED: string;
    };
    proofBadges: {
      zeroSpend: string;
      zeroMsIntercept: string;
      statusProtected: string;
      zeroFalsePositive: string;
      honeypotEngaged: string;
    };
    presets: {
      preset1: {
        code: string;
        title: string;
        description: string;
        target: string;
        criteria: string;
      };
      preset2: {
        code: string;
        title: string;
        description: string;
        target: string;
        criteria: string;
      };
      preset3: {
        code: string;
        title: string;
        description: string;
        target: string;
        criteria: string;
      };
      preset4: {
        code: string;
        title: string;
        description: string;
        target: string;
        criteria: string;
      };
      preset5: {
        code: string;
        title: string;
        description: string;
        target: string;
        criteria: string;
      };
    };
    telemetryTitle: string;
    telemetrySubtitle: string;
    refreshButton: string;
    refreshingButton: string;
    autoRefreshLabel: string;
    exportJsonButton: string;
    kpiBlocked: string;
    kpiCanaries: string;
    kpiCanaryReplays: string;
    kpiAvgDjs: string;
    kpiAvgHbio: string;
    kpiSimLive: string;
    simPrefix: string;
    livePrefix: string;
    filterSourceLabel: string;
    filterSeverityLabel: string;
    filterModuleLabel: string;
    filterAll: string;
    filterSimulation: string;
    filterLive: string;
    moduleLabels: {
      ALL: string;
      m1_study_coach: string;
      red_blue_arena: string;
      cve_patch_challenge: string;
      red_team_lab: string;
    };
    colTimestamp: string;
    colModule: string;
    colThreat: string;
    colSeverity: string;
    colAction: string;
    colReoIndex: string;
    colDjs: string;
    colHbio: string;
    colSource: string;
    colCanary: string;
    badgeSim: string;
    badgeLive: string;
    badgeCanary: string;
    loadingTelemetry: string;
    emptyTelemetry: string;
    emptyFiltered: string;
    inspectorTitle: string;
    inspectorCloseAria: string;
    inspectorCapturedInput: string;
    inspectorCanaryId: string;
    inspectorDegradedMode: string;
    inspectorCreatedAt: string;
    errorLoadTelemetry: string;
    errorNetworkDesc: string;
    errorCreateSimCve: string;
    presetCleanReplyLabel: string;
  };
}

export const TRANSLATIONS: Record<ReoLang, TranslationDictionary> = {
  en: {
    brand: {
      name: 'REO AI & REO-Shield v2.0',
      subtitle: 'Cognitive Security & Defense Command Center',
      platformTagline: 'Zero-Trust AI Study Defense & Cognitive Vulnerability Lab',
    },
    langSwitcher: {
      label: 'Interface Language',
      en: 'EN',
      ru: 'RU',
      az: 'AZ',
    },
    auth: {
      heroTitle: 'Sovereign AI Defense & Cognitive Security Command',
      heroDescription:
        'Evaluate live prompt-injection resilience, cross-family Red/Blue model audits, CVE-EDU cognitive vulnerability patching, and real-time keystroke biometric telemetry.',
      sandboxEyebrow: 'Instant Jury Evaluation',
      sandboxTitle: '2-Hour Isolated Jury Sandbox',
      sandboxDescription:
        'Provisions an isolated, row-level-secured account directly through the production Edge Function with zero registration required.',
      sandboxButton: 'Launch 2-Hour Jury Sandbox',
      sandboxLaunching: 'Provisioning Sandbox Session...',
      orDivider: 'Or authenticate with Supabase account',
      authModeAriaLabel: 'Authentication mode',
      signInTab: 'Sign In',
      signUpTab: 'Create Account',
      emailLabel: 'Email Address',
      emailPlaceholder: 'analyst@institution.edu',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimum 6 characters',
      signInButton: 'Sign In to Command Center',
      signUpButton: 'Register Account',
      authenticating: 'Verifying Credentials...',
      validationEmailRequired: 'Please enter a valid email address.',
      validationPasswordMin: 'Password must be at least 6 characters long.',
      signUpSuccessNotice:
        'Account created. If email confirmation is enabled, verify your inbox before signing in.',
      authErrorFallback: 'Authentication failed. Check your credentials and try again.',
      modulesHeading: 'Production Architecture Modules',
      featureCoachTitle: 'M1 Sovereign Study Coach',
      featureCoachDesc: 'Multi-provider academic guidance protected by live REO-Shield inspection.',
      featureArenaTitle: 'Red/Blue Audit Arena',
      featureArenaDesc: 'Cross-family Gemini vs Qwen verification with honest failover disclosure.',
      featureCveTitle: 'CVE-EDU Vulnerability Lab',
      featureCveDesc: 'Cognitive error tracking, spaced repetition, and adversarial patch grading.',
      featureSocTitle: 'REO-Shield Live SOC',
      featureSocDesc: 'Real-time telemetry analytics and 5 safe 1-click red-team attack simulations.',
    },
    hud: {
      navAriaLabel: 'Primary Command Modules',
      tabCoach: 'M1 Study Coach',
      tabArena: 'Red/Blue Arena',
      tabCve: 'CVE-EDU Lab',
      tabSoc: 'REO-Shield SOC',
      juryTimerLabel: 'Jury Sandbox',
      juryExpiredLabel: 'Sandbox Expired',
      renewSession: 'Renew Sandbox',
      renewingSession: 'Renewing...',
      signOut: 'Sign Out',
      accountJury: 'Jury Sandbox Account',
      accountStandard: 'Verified Operator',
      sessionExpiredBanner:
        'Your session has expired or was invalidated (HTTP 401). Renew your Jury Sandbox or sign in again to continue.',
      rateLimitBanner:
        'Request rate limit reached (HTTP 429). Please wait for the cooldown window before retrying.',
      dismissNotice: 'Dismiss',
      loadingSession: 'Restoring encrypted session...',
    },
    workspace: {
      foundationVerified: 'Milestone 1 Foundation Active',
      activeSessionLabel: 'Authenticated Identity',
      activeLangLabel: 'Edge Function Locale',
      endpointContractLabel: 'Frozen Edge Endpoint',
      rlsTablesLabel: 'RLS Table Bindings',
      milestoneBadgeLabel: 'Delivery Stage',
      milestone2Label: 'Scheduled: Milestone 2',
      milestone3Label: 'Scheduled: Milestone 3',
      milestone4Label: 'Scheduled: Milestone 4',
      coachTitle: 'M1 Sovereign Study Coach',
      coachSubtitle:
        'Multi-subject tutoring workspace with persistent threads, model profile switching, and per-message REO-Shield telemetry strips.',
      coachScope:
        'Milestone 2 will mount the thread sidebar, subject and model selectors, safe Markdown + KaTeX renderer, Shield Telemetry Strip, and Honeypot intercept alert card.',
      arenaTitle: 'Red/Blue Audit Arena',
      arenaSubtitle:
        'Side-by-side Blue Team Architect and Red Team Auditor execution with cross-family verification and arbiter verdicts.',
      arenaScope:
        'Milestone 3 will mount the dual-pane audit console, honest cross-family failover indicator, CVE linking selector, verdict persistence, and historical run log.',
      cveTitle: 'CVE-EDU Cognitive Vulnerability Lab',
      cveSubtitle:
        'Track conceptual gaps and attention slips as formal CVE records with spaced repetition and interactive patch verification.',
      cveScope:
        'Milestone 3 will mount the filterable CVE ledger, spaced repetition due badges, interactive patch challenge drawer, score gauge, and grading-override honeypot alerts.',
      socTitle: 'REO-Shield Live SOC & Attack Simulator',
      socSubtitle:
        'Real-time security operations telemetry powered by reo_telemetry alongside 5 safe one-click red-team simulation presets.',
      socScope:
        'Milestone 4 will mount live server-computed KPI summaries, the read-only telemetry event stream, and all 5 simulation presets including Canary Token Replay and N1 Self-DoS checks.',
      biometricsTitle: 'Client Keystroke Biometrics SDK Calibration',
      biometricsSubtitle:
        'Live diagnostic for useKeystrokeTelemetry(). Type or paste in the field below to inspect the real client-side x-reo-telemetry payload before Milestone 2 integration.',
      biometricsInputLabel: 'Live Keystroke Capture Field',
      biometricsInputPlaceholder: 'Type a sample security query or paste text to verify flight_times_ms and paste_events capture...',
      biometricsSamplesLabel: 'Flight Samples (max 120)',
      biometricsLastFlightLabel: 'Last Inter-Key Interval',
      biometricsPastesLabel: 'Paste Events',
      biometricsSessionLabel: 'Tab Session UUID',
      biometricsResetButton: 'Reset Buffer',
      biometricsHeaderPreviewLabel: 'Serialized x-reo-telemetry Header',
      biometricsNoSample: 'Awaiting keystrokes',
    },
    coach: {
      sidebarTitle: 'Study Sessions',
      newSession: 'New Session',
      loadingThreads: 'Loading threads...',
      emptyThreads: 'No saved study threads yet. Start a prompt to create your first session.',
      loadingMessages: 'Loading conversation history...',
      deleteThreadAria: 'Delete thread',
      confirmDelete: 'Confirm',
      cancelDelete: 'Cancel',
      toggleSidebarAria: 'Toggle session sidebar',
      closeSidebarAria: 'Close session sidebar',
      subjectLabel: 'Subject',
      modelProfileLabel: 'Model Profile',
      subjects: {
        Cybersecurity: 'Cybersecurity',
        Mathematics: 'Mathematics',
        Physics: 'Physics',
        Informatics: 'Informatics',
        English: 'English',
        General: 'General',
      },
      profiles: {
        fast: 'Gemini Fast',
        deep: 'Gemini Deep Reasoning',
        qwen_plus: 'Qwen Plus',
        qwen_max: 'Qwen Max',
      },
      welcomeTitle: 'M1 Sovereign Study Coach',
      welcomeDescription:
        'Ask any academic or cybersecurity question. Every prompt is evaluated live by the Dual-LLM Noisy-OR REO-Shield with keystroke biometric telemetry.',
      starterPromptsLabel: 'Suggested Study Prompts',
      starterPrompts: {
        cyber: 'Explain how TLS 1.3 achieves forward secrecy using ECDHE and why RSA key exchange was removed.',
        math: "Derive Euler's identity e^(iπ) + 1 = 0 from Taylor series and show a brief Python verification.",
        informatics: 'Compare Dijkstra and Bellman-Ford shortest path algorithms with time complexity and edge cases.',
      },
      roleUser: 'Operator',
      roleAssistant: 'M1 Coach',
      composerLabel: 'Study prompt input',
      composerPlaceholder: 'Ask a technical or academic question (Markdown and LaTeX supported)...',
      sendButton: 'Send',
      sendingLabel: 'Analyzing...',
      analyzingStatus: 'Evaluating Dual-LLM Noisy-OR Shield...',
      shiftEnterHint: 'Enter to send · Shift+Enter for newline',
      bioSamplesLabel: 'Keystrokes',
      bioPastesLabel: 'Pastes',
      bioSessionLabel: 'Session',
      copyCode: 'Copy',
      copiedCode: 'Copied',
      error401Title: 'Session Authentication Required (HTTP 401)',
      error401Desc: 'Your Jury Sandbox or session token expired. Renew your sandbox or sign out to re-authenticate.',
      error429Title: 'Rate Limit Cooldown Active (HTTP 429)',
      error429Desc: 'Too many requests in a short window. Your prompt has been preserved — wait a moment and try again.',
      errorNetworkTitle: 'Gateway Unavailable',
      errorNetworkDesc: 'Unable to reach reo-gateway or upstream provider returned a temporary error. Your conversation state is intact.',
      errorLoadThreads: 'Could not load threads from Supabase.',
      errorDeleteThread: 'Could not delete the selected thread.',
      shield: {
        statusClean: 'CLEAN',
        statusHoneypot: 'HONEYPOT_ENGAGED',
        reoIndex: 'REO Index',
        dJs: 'D_JS',
        hBio: 'H_bio',
        cv: 'CV',
        failoverBadge: 'FAILOVER',
        degradedBadge: 'DEGRADED',
        inspectToggle: 'Inspect Math Shield',
        hideToggle: 'Hide Math Shield',
        consensusMal: 'consensus_mal',
        bioPenalty: 'bio_penalty',
        heuristicScore: 'heuristic_score',
        threatType: 'threat_type',
        severity: 'severity',
        matchedRules: 'matched_rules',
        canaryIssued: 'canary_issued',
        canaryVerified: 'canary_verified',
        crossAccountReplay: 'cross_account_replay',
        noneLabel: 'None',
        yesLabel: 'true',
        noLabel: 'false',
      },
      honeypot: {
        bannerTitle: 'REO-SHIELD INTERCEPT // HONEYPOT ENGAGED',
        zeroSpendBadge: '0 LLM TOKEN SPEND',
        canaryVerifiedBadge: 'CANARY REPLAY VERIFIED (0ms DB INTERCEPT)',
        canaryIssuedBadge: 'CANARY TRAP ISSUED',
        canaryTokenLabel: 'Extracted Canary Token',
        copyCanary: 'Copy Token',
        copiedCanary: 'Copied',
        terminalLabel: 'Static Honeypot Diagnostic Response',
        localOnlyNote: 'Retained in local view only — excluded from database persistence and clean history.',
        threatLabel: 'Threat',
        severityLabel: 'Severity',
        rulesLabel: 'Matched Rules',
      },
    },
    arena: {
      title: 'Red/Blue Audit Arena',
      subtitle:
        'Execute cross-family Blue Team Architect and Red Team Auditor duels with live REO-Shield inspection, honest failover disclosure, and persisted Arbiter verdicts.',
      promptLabel: 'Audit Prompt or Technical Solution to Stress-Test',
      promptPlaceholder:
        'Enter an algorithm, cryptographic design, proof, or security architecture for Blue Team synthesis and Red Team adversarial critique...',
      deepAuditLabel: 'Deep Audit Mode',
      deepAuditHint: 'Extended adversarial verification pass',
      blueTeamLabel: 'Blue Team Architect',
      redTeamLabel: 'Red Team Auditor (Opposite Family)',
      pairingLabel: 'Cross-Family Pairing',
      linkCveLabel: 'Link CVE Record (Optional)',
      noLinkedCve: 'No linked CVE record',
      launchDuelButton: 'Launch Red/Blue Audit',
      runningDuelLabel: 'Auditing...',
      runningDuelStatus: 'Executing REO-Shield + Dual Cross-Family Audit...',
      crossFamilyVerified: 'CROSS-FAMILY VERIFIED',
      singleFamilyFailover: 'SINGLE-FAMILY FAILOVER ACTIVE',
      totalLatencyLabel: 'Total Latency',
      blueColumnTitle: 'Blue Team Architect',
      redColumnTitle: 'Red Team Auditor',
      arbiterTitle: 'Arbiter Verdict',
      verdictPending: 'Pending Verdict',
      verdictBlueClean: 'Blue Clean',
      verdictRedFoundFlaw: 'Red Found Flaw',
      markBlueClean: 'Mark Blue Clean',
      markRedFlaw: 'Mark Red Found Flaw',
      savingVerdict: 'Saving...',
      historyTitle: 'Past Arena Runs',
      historyToggleShow: 'Show History',
      historyToggleHide: 'Hide History',
      historyLoading: 'Loading arena runs...',
      historyEmpty: 'No past Red/Blue audit runs recorded yet.',
      historyCountSuffix: 'runs',
      viewingPastRunBanner: 'Viewing persisted historical run from reo_arena_runs.',
      clearActiveRun: 'New Audit',
      linkedCveBadge: 'Linked CVE',
      errorLoadHistory: 'Could not load past arena runs from Supabase.',
      errorUpdateVerdict: 'Could not update arbiter verdict.',
      errorNetworkDesc: 'Unable to reach reo-arena or upstream provider returned a temporary error.',
    },
    cve: {
      title: 'CVE-EDU Cognitive Vulnerability Lab',
      subtitle:
        'Log conceptual errors as formal CVE records, track spaced repetition reviews, and pass novel AI-generated patch verification challenges.',
      logNewButton: 'Log Cognitive Vulnerability',
      kpiTotal: 'Total Records',
      kpiVulnerable: 'Vulnerable',
      kpiPatched: 'Patched',
      kpiRegressed: 'Regressed',
      kpiPendingReviews: 'Pending Reviews',
      filterAll: 'ALL',
      filterVulnerable: 'VULNERABLE',
      filterPatched: 'PATCHED',
      filterRegressed: 'REGRESSED',
      searchPlaceholder: 'Search by vuln code or topic...',
      searchAriaLabel: 'Search CVE records',
      loadingRecords: 'Loading CVE records...',
      emptyRecords: 'No cognitive vulnerabilities logged yet. Log your first conceptual gap to begin patch verification.',
      emptyFiltered: 'No CVE records match the current filter or search query.',
      statusLabels: {
        VULNERABLE: 'VULNERABLE',
        PATCHED: 'PATCHED',
        REGRESSED: 'REGRESSED',
      },
      rootCauseLabels: {
        knowledge_gap: 'Knowledge Gap',
        attention_slip: 'Attention Slip',
      },
      problemLabel: 'Problem Statement',
      derivationLabel: 'Flawed Derivation / Mistake',
      verifiedAtLabel: 'Patch Verified',
      repetitionDueBadge: 'Spaced Repetition Due',
      stepDaysPrefix: 'Day',
      markReviewDone: 'Mark Review Done',
      markingReview: 'Updating...',
      launchPatchButton: 'Launch Patch Challenge',
      deleteRecordAria: 'Delete CVE record',
      modalCreateTitle: 'Log Cognitive Vulnerability',
      modalCloseAria: 'Close panel',
      fieldVulnCode: 'Vulnerability Code',
      fieldSubject: 'Subject',
      fieldTopic: 'Topic',
      fieldTopicPlaceholder: 'e.g., SQL Parameterization, Chain Rule Sign Error',
      fieldRootCause: 'Root Cause',
      fieldProblem: 'Problem Statement',
      fieldProblemPlaceholder: 'Describe the problem or concept where the vulnerability occurred...',
      fieldDerivation: 'Flawed Derivation or Incorrect Step',
      fieldDerivationPlaceholder: 'Record the exact incorrect reasoning or bug you made...',
      createSubmitButton: 'Create CVE Record',
      creatingButton: 'Saving...',
      validationRequiredFields: 'Vulnerability code, topic, problem statement, and derivation are required.',
      drawerTitle: 'Patch Verification Challenge',
      step1Title: 'Step 1: Generate Verification Challenge',
      generateButton: 'Generate Novel Verification Challenge',
      generatingButton: 'Generating Challenge...',
      recordSanitizedNotice: 'RECORD SANITIZED — Potential prompt-injection patterns were stripped from the CVE record prior to generation.',
      challengePromptLabel: 'Generated Challenge Question',
      step2Title: 'Step 2: Submit Your Patched Explanation',
      answerLabel: 'Your Patch Answer',
      answerPlaceholder: 'Write a complete, accurate explanation or derivation to prove the vulnerability is patched...',
      verifyButton: 'Verify Patch',
      verifyingButton: 'Evaluating Patch...',
      step3Title: 'Step 3: Verification Verdict',
      scoreLabel: 'Verification Score',
      patchPassedBanner: 'PATCH VERIFIED (PASSED)',
      patchFailedBanner: 'PATCH FAILED',
      statusTransitionLabel: 'Status Transition',
      repetitionScheduledNotice: '24-hour spaced repetition review scheduled automatically in reo_repetitions.',
      parseFailedNotice: 'Grading output parser encountered malformed JSON from the model. Please retry verification.',
      feedbackLabel: 'Auditor Feedback',
      errorLoadRecords: 'Could not load CVE records from Supabase.',
      errorCreateRecord: 'Could not create the CVE record.',
      errorDeleteRecord: 'Could not delete the CVE record.',
      errorMarkReview: 'Could not mark the spaced repetition review as done.',
      errorNetworkDesc: 'Unable to reach reo-patch-challenge or upstream provider returned a temporary error.',
    },
    soc: {
      title: 'REO-Shield Live SOC & Attack Simulator',
      subtitle:
        'Verify every defense layer in 1 click using safe isolated simulations (is_simulation: true) and inspect live RLS-protected security telemetry from reo_telemetry.',
      simulatorTitle: 'Red-Team Defense Verification Panel',
      simulatorSubtitle:
        'Safe 1-click simulation presets proving Honeypot interception, 0 ms Canary Replay defense, CVE grading anti-tamper, and N1 zero-false-positive resilience.',
      runAllButton: 'Run All 5 Defense Proofs',
      runningAllButton: 'Running Defense Suite...',
      allVerifiedBanner: '5/5 DEFENSE PROOFS VERIFIED — All REO-Shield v2.0 layers confirmed live.',
      activeCanaryLabel: 'Captured Live Canary',
      noCanaryCaptured: 'Run Preset 1 or 2 to capture a live canary token',
      runPresetButton: 'Run Proof',
      runningPresetButton: 'Executing...',
      expandDetails: 'Inspect Live Response',
      hideDetails: 'Hide Response',
      statusLabels: {
        IDLE: 'IDLE',
        RUNNING: 'RUNNING',
        VERIFIED: 'VERIFIED',
        FAILED: 'FAILED',
      },
      proofBadges: {
        zeroSpend: '0 LLM TOKEN SPEND',
        zeroMsIntercept: '0 ms DB INTERCEPT',
        statusProtected: 'CVE STATUS PROTECTED',
        zeroFalsePositive: 'ZERO FALSE-POSITIVE LOCKOUT',
        honeypotEngaged: 'HONEYPOT ENGAGED',
      },
      presets: {
        preset1: {
          code: 'PRESET 01',
          title: 'Direct Prompt Injection + Bot Cadence',
          description:
            'Sends a direct instruction override with mechanical 10ms keystroke cadence and paste telemetry to prove instant Honeypot interception at zero LLM spend.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + provider_used === "none"',
        },
        preset2: {
          code: 'PRESET 02',
          title: 'System Prompt Exfiltration',
          description:
            'Attempts to dump developer policies, internal runtime nonces, and hidden system instructions as JSON.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + canary trap capture',
        },
        preset3: {
          code: 'PRESET 03',
          title: 'Canary Token Replay (0 ms DB Intercept)',
          description:
            'Replays the live REO-CANARY token captured from Preset 1/2 (auto-fetches a fresh token if needed) to verify deterministic 0 ms database-level interception.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + canary_verified === true + latency_ms === 0',
        },
        preset4: {
          code: 'PRESET 04',
          title: 'CVE Grading Override Injection',
          description:
            'Injects a score-forging override into patch verification to prove the grader rejects tampering with score 0 and leaves CVE status untouched.',
          target: 'POST /functions/v1/reo-patch-challenge',
          criteria: 'HONEYPOT_ENGAGED + passed === false + score === 0 + status unchanged',
        },
        preset5: {
          code: 'PRESET 05',
          title: 'N1 Self-DoS Verification (Zero False-Positive)',
          description:
            'Places a canary token strictly inside a model history turn paired with a benign human-cadence math question to prove zero self-DoS lockout.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'CLEAN + shield.blocked === false',
        },
      },
      telemetryTitle: 'Live Security Telemetry Stream (reo_telemetry)',
      telemetrySubtitle: 'Read-only RLS forensic ledger of the latest 100 security events for this authenticated identity.',
      refreshButton: 'Refresh Telemetry',
      refreshingButton: 'Refreshing...',
      autoRefreshLabel: 'Auto-Refresh (15s)',
      exportJsonButton: 'Export JSON Report',
      kpiBlocked: 'Total Blocked / Honeypot',
      kpiCanaries: 'Canary Traps Issued',
      kpiCanaryReplays: 'Verified Replays',
      kpiAvgDjs: 'Avg D_JS Divergence',
      kpiAvgHbio: 'Avg H_bio Entropy',
      kpiSimLive: 'Simulation vs. Live Split',
      simPrefix: 'Sim',
      livePrefix: 'Live',
      filterSourceLabel: 'Source',
      filterSeverityLabel: 'Severity',
      filterModuleLabel: 'Module',
      filterAll: 'ALL',
      filterSimulation: 'SIMULATION',
      filterLive: 'LIVE',
      moduleLabels: {
        ALL: 'All Modules',
        m1_study_coach: 'm1_study_coach',
        red_blue_arena: 'red_blue_arena',
        cve_patch_challenge: 'cve_patch_challenge',
        red_team_lab: 'Red-Team Lab (Sim)',
      },
      colTimestamp: 'Timestamp',
      colModule: 'Module',
      colThreat: 'Threat Type',
      colSeverity: 'Severity',
      colAction: 'Action Taken',
      colReoIndex: 'REO Index',
      colDjs: 'D_JS',
      colHbio: 'H_bio',
      colSource: 'Source',
      colCanary: 'Canary',
      badgeSim: 'SIM',
      badgeLive: 'LIVE',
      badgeCanary: 'CANARY',
      loadingTelemetry: 'Loading reo_telemetry events...',
      emptyTelemetry: 'No telemetry events recorded yet. Run any Defense Proof above or interact with M1 Coach / Arena / CVE Lab.',
      emptyFiltered: 'No telemetry events match the selected filters.',
      inspectorTitle: 'Forensic Event Inspector',
      inspectorCloseAria: 'Close forensic inspector',
      inspectorCapturedInput: 'Captured Input (Plain Text — Non-Executable)',
      inspectorCanaryId: 'canary_id',
      inspectorDegradedMode: 'degraded_mode',
      inspectorCreatedAt: 'created_at',
      errorLoadTelemetry: 'Could not load security telemetry from Supabase.',
      errorNetworkDesc: 'Unable to reach Edge Function or upstream provider returned a temporary error.',
      errorCreateSimCve: 'Could not provision temporary sandbox CVE record for Preset 4.',
      presetCleanReplyLabel: 'Verified Clean Assistant Reply',
    },
  },
  ru: {
    brand: {
      name: 'REO AI & REO-Shield v2.0',
      subtitle: 'Центр когнитивной кибербезопасности',
      platformTagline: 'Нулевое доверие, защита ИИ-обучения и лаборатория CVE-EDU',
    },
    langSwitcher: {
      label: 'Язык интерфейса',
      en: 'EN',
      ru: 'RU',
      az: 'AZ',
    },
    auth: {
      heroTitle: 'Суверенная защита ИИ и когнитивная безопасность',
      heroDescription:
        'Проверяйте устойчивость к промпт-инъекциям, кросс-семейный Red/Blue аудит, патчинг когнитивных уязвимостей CVE-EDU и телеметрию клавиатурной биометрии.',
      sandboxEyebrow: 'Мгновенный доступ для жюри',
      sandboxTitle: 'Изолированная песочница жюри на 2 часа',
      sandboxDescription:
        'Создаёт изолированную RLS-учётную запись напрямую через боевую Edge Function без регистрации.',
      sandboxButton: 'Запустить 2-часовую песочницу жюри',
      sandboxLaunching: 'Создание сессии песочницы...',
      orDivider: 'Или войдите через аккаунт Supabase',
      authModeAriaLabel: 'Режим аутентификации',
      signInTab: 'Вход',
      signUpTab: 'Регистрация',
      emailLabel: 'Электронная почта',
      emailPlaceholder: 'analyst@institution.edu',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Минимум 6 символов',
      signInButton: 'Войти в командный центр',
      signUpButton: 'Создать аккаунт',
      authenticating: 'Проверка учётных данных...',
      validationEmailRequired: 'Введите корректный адрес электронной почты.',
      validationPasswordMin: 'Пароль должен содержать не менее 6 символов.',
      signUpSuccessNotice:
        'Аккаунт создан. Если включено подтверждение почты, подтвердите письмо перед входом.',
      authErrorFallback: 'Ошибка аутентификации. Проверьте данные и попробуйте снова.',
      modulesHeading: 'Боевые модули платформы',
      featureCoachTitle: 'M1 Суверенный ИИ-наставник',
      featureCoachDesc: 'Мультимодельное обучение с защитой REO-Shield в реальном времени.',
      featureArenaTitle: 'Арена Red/Blue аудита',
      featureArenaDesc: 'Кросс-семейная проверка Gemini и Qwen с честной индикацией failover.',
      featureCveTitle: 'Лаборатория CVE-EDU',
      featureCveDesc: 'Учёт когнитивных ошибок, интервальные повторения и проверка патчей.',
      featureSocTitle: 'SOC REO-Shield в реальном времени',
      featureSocDesc: 'Живая телеметрия угроз и 5 безопасных сценариев Red-Team атак в 1 клик.',
    },
    hud: {
      navAriaLabel: 'Основные модули платформы',
      tabCoach: 'M1 Наставник',
      tabArena: 'Red/Blue Арена',
      tabCve: 'CVE-EDU Лаб',
      tabSoc: 'REO-Shield SOC',
      juryTimerLabel: 'Песочница жюри',
      juryExpiredLabel: 'Сессия истекла',
      renewSession: 'Продлить песочницу',
      renewingSession: 'Продление...',
      signOut: 'Выйти',
      accountJury: 'Аккаунт песочницы жюри',
      accountStandard: 'Подтверждённый оператор',
      sessionExpiredBanner:
        'Срок действия сессии истёк (HTTP 401). Обновите песочницу жюри или выполните вход повторно.',
      rateLimitBanner:
        'Превышен лимит запросов (HTTP 429). Подождите окончания периода охлаждения перед повтором.',
      dismissNotice: 'Скрыть',
      loadingSession: 'Восстановление защищённой сессии...',
    },
    workspace: {
      foundationVerified: 'Фундамент Этапа 1 активен',
      activeSessionLabel: 'Авторизованный профиль',
      activeLangLabel: 'Язык Edge Functions',
      endpointContractLabel: 'Замороженный Edge Endpoint',
      rlsTablesLabel: 'Привязка таблиц RLS',
      milestoneBadgeLabel: 'Стадия поставки',
      milestone2Label: 'Запланировано: Этап 2',
      milestone3Label: 'Запланировано: Этап 3',
      milestone4Label: 'Запланировано: Этап 4',
      coachTitle: 'M1 Суверенный ИИ-наставник',
      coachSubtitle:
        'Учебное пространство с историей диалогов, выбором моделей и панелью телеметрии REO-Shield для каждого ответа.',
      coachScope:
        'На Этапе 2 будут подключены список диалогов, выбор предмета и профиля модели, безопасный рендер Markdown + KaTeX, полоса телеметрии и карточка перехвата Honeypot.',
      arenaTitle: 'Арена Red/Blue аудита',
      arenaSubtitle:
        'Параллельный анализ Синей и Красной команд с проверкой независимости семейств моделей и вердиктом арбитра.',
      arenaScope:
        'На Этапе 3 будут подключены двухпанельная консоль аудита, индикатор кросс-семейного failover, привязка к CVE, фиксация вердикта и архив запусков.',
      cveTitle: 'Лаборатория когнитивных уязвимостей CVE-EDU',
      cveSubtitle:
        'Регистрация пробелов в знаниях как записей CVE с интервальным повторением и интерактивной верификацией патчей.',
      cveScope:
        'На Этапе 3 будут подключены реестр CVE с фильтрами, бейджи повторений, панель генерации и проверки патчей, шкала оценки и защита от инъекций в оценивание.',
      socTitle: 'SOC REO-Shield и симулятор атак',
      socSubtitle:
        'Оперативная телеметрия безопасности из таблицы reo_telemetry и 5 безопасных пресетов Red-Team симуляций.',
      socScope:
        'На Этапе 4 будут подключены KPI-панель реальных метрик сервера, журнал событий телеметрии и 5 пресетов включая Canary Token Replay и проверку N1 Self-DoS.',
      biometricsTitle: 'Калибровка SDK клавиатурной биометрии',
      biometricsSubtitle:
        'Диагностика хука useKeystrokeTelemetry(). Введите или вставьте текст ниже, чтобы проверить реальный заголовок x-reo-telemetry до интеграции Этапа 2.',
      biometricsInputLabel: 'Поле захвата динамики набора',
      biometricsInputPlaceholder: 'Введите тестовый запрос или вставьте текст для проверки flight_times_ms и paste_events...',
      biometricsSamplesLabel: 'Интервалы (макс. 120)',
      biometricsLastFlightLabel: 'Последний интервал',
      biometricsPastesLabel: 'События вставки',
      biometricsSessionLabel: 'UUID сессии вкладки',
      biometricsResetButton: 'Сбросить буфер',
      biometricsHeaderPreviewLabel: 'Заголовок x-reo-telemetry',
      biometricsNoSample: 'Ожидание ввода',
    },
    coach: {
      sidebarTitle: 'Учебные сессии',
      newSession: 'Новая сессия',
      loadingThreads: 'Загрузка диалогов...',
      emptyThreads: 'Сохранённых сессий пока нет. Отправьте первый запрос, чтобы начать диалог.',
      loadingMessages: 'Загрузка истории сообщений...',
      deleteThreadAria: 'Удалить диалог',
      confirmDelete: 'Удалить',
      cancelDelete: 'Отмена',
      toggleSidebarAria: 'Открыть панель сессий',
      closeSidebarAria: 'Закрыть панель сессий',
      subjectLabel: 'Предмет',
      modelProfileLabel: 'Профиль модели',
      subjects: {
        Cybersecurity: 'Кибербезопасность',
        Mathematics: 'Математика',
        Physics: 'Физика',
        Informatics: 'Информатика',
        English: 'Английский язык',
        General: 'Общие темы',
      },
      profiles: {
        fast: 'Gemini Fast',
        deep: 'Gemini Deep Reasoning',
        qwen_plus: 'Qwen Plus',
        qwen_max: 'Qwen Max',
      },
      welcomeTitle: 'M1 Суверенный ИИ-наставник',
      welcomeDescription:
        'Задайте учебный или технический вопрос. Каждый запрос проходит проверку Dual-LLM Noisy-OR REO-Shield с учётом клавиатурной биометрии.',
      starterPromptsLabel: 'Примеры учебных запросов',
      starterPrompts: {
        cyber: 'Объясни, как TLS 1.3 обеспечивает прямую секретность (Forward Secrecy) с помощью ECDHE и почему удалили обмен ключами RSA.',
        math: 'Выведи тождество Эйлера e^(iπ) + 1 = 0 через ряды Тейлора и покажи короткую проверку на Python.',
        informatics: 'Сравни алгоритмы Дейкстры и Беллмана-Форда: асимптотика, отрицательные веса и крайние случаи.',
      },
      roleUser: 'Оператор',
      roleAssistant: 'Наставник M1',
      composerLabel: 'Поле учебного запроса',
      composerPlaceholder: 'Задайте учебный или технический вопрос (поддерживаются Markdown и LaTeX)...',
      sendButton: 'Отправить',
      sendingLabel: 'Анализ...',
      analyzingStatus: 'Оценка щита Dual-LLM Noisy-OR...',
      shiftEnterHint: 'Enter — отправить · Shift+Enter — перенос строки',
      bioSamplesLabel: 'Интервалы',
      bioPastesLabel: 'Вставки',
      bioSessionLabel: 'Сессия',
      copyCode: 'Копировать',
      copiedCode: 'Скопировано',
      error401Title: 'Требуется продление сессии (HTTP 401)',
      error401Desc: 'Срок действия песочницы жюри или токена истёк. Продлите песочницу или выйдите для повторного входа.',
      error429Title: 'Активен лимит запросов (HTTP 429)',
      error429Desc: 'Слишком много запросов за короткий интервал. Ваш текст сохранён — подождите немного и повторите отправку.',
      errorNetworkTitle: 'Шлюз временно недоступен',
      errorNetworkDesc: 'Не удалось связаться с reo-gateway или провайдер вернул временную ошибку. История диалога сохранена.',
      errorLoadThreads: 'Не удалось загрузить список сессий из Supabase.',
      errorDeleteThread: 'Не удалось удалить выбранную сессию.',
      shield: {
        statusClean: 'CLEAN',
        statusHoneypot: 'HONEYPOT_ENGAGED',
        reoIndex: 'REO Index',
        dJs: 'D_JS',
        hBio: 'H_bio',
        cv: 'CV',
        failoverBadge: 'FAILOVER',
        degradedBadge: 'DEGRADED',
        inspectToggle: 'Разбор Math Shield',
        hideToggle: 'Скрыть Math Shield',
        consensusMal: 'consensus_mal',
        bioPenalty: 'bio_penalty',
        heuristicScore: 'heuristic_score',
        threatType: 'threat_type',
        severity: 'severity',
        matchedRules: 'matched_rules',
        canaryIssued: 'canary_issued',
        canaryVerified: 'canary_verified',
        crossAccountReplay: 'cross_account_replay',
        noneLabel: 'Нет',
        yesLabel: 'true',
        noLabel: 'false',
      },
      honeypot: {
        bannerTitle: 'REO-SHIELD INTERCEPT // HONEYPOT ENGAGED',
        zeroSpendBadge: '0 LLM TOKEN SPEND',
        canaryVerifiedBadge: 'CANARY REPLAY VERIFIED (0ms DB INTERCEPT)',
        canaryIssuedBadge: 'CANARY TRAP ISSUED',
        canaryTokenLabel: 'Обнаруженный Canary-токен',
        copyCanary: 'Копировать токен',
        copiedCanary: 'Скопировано',
        terminalLabel: 'Статический диагностический ответ Honeypot',
        localOnlyNote: 'Отображается только локально — не сохраняется в БД и исключается из чистой истории.',
        threatLabel: 'Угроза',
        severityLabel: 'Уровень',
        rulesLabel: 'Сработавшие правила',
      },
    },
    arena: {
      title: 'Арена Red/Blue аудита',
      subtitle:
        'Запускайте кросс-семейные дуэли Архитектора Синей команды и Аудитора Красной команды с защитой REO-Shield, честной индикацией failover и вердиктом арбитра.',
      promptLabel: 'Задача или техническое решение для аудита',
      promptPlaceholder:
        'Введите алгоритм, криптографическую схему, доказательство или архитектуру для синтеза Синей команды и критики Красной команды...',
      deepAuditLabel: 'Глубокий аудит',
      deepAuditHint: 'Расширенная проверка уязвимостей',
      blueTeamLabel: 'Архитектор Синей команды',
      redTeamLabel: 'Аудитор Красной команды (другое семейство)',
      pairingLabel: 'Кросс-семейная пара',
      linkCveLabel: 'Связать с записью CVE (опционально)',
      noLinkedCve: 'Без привязки к CVE',
      launchDuelButton: 'Запустить Red/Blue аудит',
      runningDuelLabel: 'Аудит...',
      runningDuelStatus: 'Выполнение REO-Shield и кросс-семейного аудита...',
      crossFamilyVerified: 'CROSS-FAMILY VERIFIED',
      singleFamilyFailover: 'SINGLE-FAMILY FAILOVER ACTIVE',
      totalLatencyLabel: 'Общая задержка',
      blueColumnTitle: 'Архитектор Синей команды',
      redColumnTitle: 'Аудитор Красной команды',
      arbiterTitle: 'Вердикт арбитра',
      verdictPending: 'Ожидает вердикта',
      verdictBlueClean: 'Blue Clean',
      verdictRedFoundFlaw: 'Red Found Flaw',
      markBlueClean: 'Синяя команда чиста',
      markRedFlaw: 'Красная нашла изъян',
      savingVerdict: 'Сохранение...',
      historyTitle: 'История запусков Арены',
      historyToggleShow: 'Показать историю',
      historyToggleHide: 'Скрыть историю',
      historyLoading: 'Загрузка истории запусков...',
      historyEmpty: 'Запусков Red/Blue аудита пока нет.',
      historyCountSuffix: 'запусков',
      viewingPastRunBanner: 'Просмотр сохранённого запуска из reo_arena_runs.',
      clearActiveRun: 'Новый аудит',
      linkedCveBadge: 'Связанный CVE',
      errorLoadHistory: 'Не удалось загрузить историю запусков из Supabase.',
      errorUpdateVerdict: 'Не удалось сохранить вердикт арбитра.',
      errorNetworkDesc: 'Не удалось связаться с reo-arena или провайдер вернул временную ошибку.',
    },
    cve: {
      title: 'Лаборатория когнитивных уязвимостей CVE-EDU',
      subtitle:
        'Фиксируйте пробелы в знаниях как записи CVE, отслеживайте интервальные повторения и проходите проверку патчей на новых задачах.',
      logNewButton: 'Зафиксировать уязвимость',
      kpiTotal: 'Всего записей',
      kpiVulnerable: 'Уязвимо',
      kpiPatched: 'Закрыто',
      kpiRegressed: 'Регрессия',
      kpiPendingReviews: 'Повторений к сдаче',
      filterAll: 'ВСЕ',
      filterVulnerable: 'VULNERABLE',
      filterPatched: 'PATCHED',
      filterRegressed: 'REGRESSED',
      searchPlaceholder: 'Поиск по коду CVE или теме...',
      searchAriaLabel: 'Поиск записей CVE',
      loadingRecords: 'Загрузка записей CVE...',
      emptyRecords: 'Когнитивных уязвимостей пока нет. Зафиксируйте первый пробел для запуска проверки патчей.',
      emptyFiltered: 'По выбранному фильтру или поисковому запросу записей не найдено.',
      statusLabels: {
        VULNERABLE: 'VULNERABLE',
        PATCHED: 'PATCHED',
        REGRESSED: 'REGRESSED',
      },
      rootCauseLabels: {
        knowledge_gap: 'Пробел в знаниях',
        attention_slip: 'Ошибка невнимательности',
      },
      problemLabel: 'Описание проблемы',
      derivationLabel: 'Ошибочное рассуждение',
      verifiedAtLabel: 'Патч подтверждён',
      repetitionDueBadge: 'Назначено повторение',
      stepDaysPrefix: 'День',
      markReviewDone: 'Отметить пройденным',
      markingReview: 'Обновление...',
      launchPatchButton: 'Запустить проверку патча',
      deleteRecordAria: 'Удалить запись CVE',
      modalCreateTitle: 'Новая когнитивная уязвимость',
      modalCloseAria: 'Закрыть панель',
      fieldVulnCode: 'Код уязвимости',
      fieldSubject: 'Предмет',
      fieldTopic: 'Тема',
      fieldTopicPlaceholder: 'Напр.: Параметризация SQL, Знак в производной сложной функции',
      fieldRootCause: 'Первопричина',
      fieldProblem: 'Постановка задачи',
      fieldProblemPlaceholder: 'Опишите задачу или концепцию, в которой возникла ошибка...',
      fieldDerivation: 'Ошибочный вывод или шаг',
      fieldDerivationPlaceholder: 'Зафиксируйте точное ошибочное рассуждение...',
      createSubmitButton: 'Создать запись CVE',
      creatingButton: 'Сохранение...',
      validationRequiredFields: 'Код уязвимости, тема, описание проблемы и ошибочный вывод обязательны.',
      drawerTitle: 'Верификация патча',
      step1Title: 'Шаг 1: Генерация проверочного задания',
      generateButton: 'Сгенерировать новое задание',
      generatingButton: 'Генерация задания...',
      recordSanitizedNotice: 'RECORD SANITIZED — Потенциальные шаблоны инъекций были очищены из записи CVE перед генерацией.',
      challengePromptLabel: 'Сгенерированное задание',
      step2Title: 'Шаг 2: Введите исправленное решение',
      answerLabel: 'Ваш ответ для проверки патча',
      answerPlaceholder: 'Напишите точное объяснение или вывод, доказывающий устранение пробела...',
      verifyButton: 'Проверить патч',
      verifyingButton: 'Оценка патча...',
      step3Title: 'Шаг 3: Вердикт верификации',
      scoreLabel: 'Балл проверки',
      patchPassedBanner: 'ПАТЧ ПОДТВЕРЖДЁН (PASSED)',
      patchFailedBanner: 'ПАТЧ НЕ ПРОЙДЕН',
      statusTransitionLabel: 'Переход статуса',
      repetitionScheduledNotice: 'Через 24 часа автоматически запланировано повторение в reo_repetitions.',
      parseFailedNotice: 'Парсер ответа модели получил некорректный JSON. Пожалуйста, повторите проверку.',
      feedbackLabel: 'Комментарий аудитора',
      errorLoadRecords: 'Не удалось загрузить записи CVE из Supabase.',
      errorCreateRecord: 'Не удалось создать запись CVE.',
      errorDeleteRecord: 'Не удалось удалить запись CVE.',
      errorMarkReview: 'Не удалось отметить повторение выполненным.',
      errorNetworkDesc: 'Не удалось связаться с reo-patch-challenge или провайдер вернул временную ошибку.',
    },
    soc: {
      title: 'SOC REO-Shield и симулятор атак',
      subtitle:
        'Проверьте каждый рубеж защиты в 1 клик безопасными симуляциями (is_simulation: true) и изучайте живую RLS-телеметрию из reo_telemetry.',
      simulatorTitle: 'Панель Red-Team верификации защиты',
      simulatorSubtitle:
        '5 безопасных пресетов, доказывающих перехват Honeypot, перехват Canary Replay за 0 мс, защиту оценивания CVE и отсутствие самоблокировки N1.',
      runAllButton: 'Запустить все 5 проверок защиты',
      runningAllButton: 'Выполнение проверок...',
      allVerifiedBanner: '5/5 ПРОВЕРОК ЗАЩИТЫ ПОДТВЕРЖДЕНЫ — Все слои REO-Shield v2.0 работают в бою.',
      activeCanaryLabel: 'Перехваченный Canary-токен',
      noCanaryCaptured: 'Запустите пресет 1 или 2 для получения живого токена',
      runPresetButton: 'Запустить',
      runningPresetButton: 'Выполняется...',
      expandDetails: 'Показать ответ сервера',
      hideDetails: 'Скрыть ответ',
      statusLabels: {
        IDLE: 'IDLE',
        RUNNING: 'RUNNING',
        VERIFIED: 'VERIFIED',
        FAILED: 'FAILED',
      },
      proofBadges: {
        zeroSpend: '0 LLM TOKEN SPEND',
        zeroMsIntercept: '0 ms DB INTERCEPT',
        statusProtected: 'СТАТУС CVE ЗАЩИЩЁН',
        zeroFalsePositive: 'НЕТ ЛОЖНОЙ БЛОКИРОВКИ',
        honeypotEngaged: 'HONEYPOT ENGAGED',
      },
      presets: {
        preset1: {
          code: 'ПРЕСЕТ 01',
          title: 'Прямая промпт-инъекция + бот-динамика',
          description:
            'Отправляет попытку сброса инструкций с механическим ритмом 10 мс и событием вставки, подтверждая перехват Honeypot с нулевым расходом LLM.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + provider_used === "none"',
        },
        preset2: {
          code: 'ПРЕСЕТ 02',
          title: 'Эксфильтрация системного промпта',
          description:
            'Пытается извлечь политику разработчика, внутренний nonce и системные инструкции в формате JSON.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + захват canary-ловушки',
        },
        preset3: {
          code: 'ПРЕСЕТ 03',
          title: 'Повтор Canary-токена (0 мс перехват БД)',
          description:
            'Повторно отправляет живой токен REO-CANARY из пресета 1/2 (при отсутствии автоматически получает новый) для проверки детерминированного перехвата за 0 мс.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + canary_verified === true + latency_ms === 0',
        },
        preset4: {
          code: 'ПРЕСЕТ 04',
          title: 'Подмена оценки в проверке патча CVE',
          description:
            'Внедряет команду принудительной оценки 100 в проверку патча, подтверждая отказ (score 0) и неизменность статуса CVE.',
          target: 'POST /functions/v1/reo-patch-challenge',
          criteria: 'HONEYPOT_ENGAGED + passed === false + score === 0 + статус без изменений',
        },
        preset5: {
          code: 'ПРЕСЕТ 05',
          title: 'Проверка N1 Self-DoS (ноль ложных срабатываний)',
          description:
            'Помещает canary-токен строго в историю роли model рядом с обычным математическим вопросом с человеческой динамикой ввода.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'CLEAN + shield.blocked === false',
        },
      },
      telemetryTitle: 'Живой поток телеметрии безопасности (reo_telemetry)',
      telemetrySubtitle: 'RLS-журнал (только чтение) последних 100 событий безопасности текущей учётной записи.',
      refreshButton: 'Обновить телеметрию',
      refreshingButton: 'Обновление...',
      autoRefreshLabel: 'Автообновление (15с)',
      exportJsonButton: 'Экспорт JSON-отчёта',
      kpiBlocked: 'Заблокировано / Honeypot',
      kpiCanaries: 'Выдано Canary-ловушек',
      kpiCanaryReplays: 'Подтв. повторов',
      kpiAvgDjs: 'Среднее D_JS расхождение',
      kpiAvgHbio: 'Средняя H_bio энтропия',
      kpiSimLive: 'Симуляции / Боевые',
      simPrefix: 'Sim',
      livePrefix: 'Live',
      filterSourceLabel: 'Источник',
      filterSeverityLabel: 'Уровень',
      filterModuleLabel: 'Модуль',
      filterAll: 'ВСЕ',
      filterSimulation: 'SIMULATION',
      filterLive: 'LIVE',
      moduleLabels: {
        ALL: 'Все модули',
        m1_study_coach: 'm1_study_coach',
        red_blue_arena: 'red_blue_arena',
        cve_patch_challenge: 'cve_patch_challenge',
        red_team_lab: 'Red-Team Лаб. (Сим)',
      },
      colTimestamp: 'Время',
      colModule: 'Модуль',
      colThreat: 'Тип угрозы',
      colSeverity: 'Уровень',
      colAction: 'Действие',
      colReoIndex: 'REO Index',
      colDjs: 'D_JS',
      colHbio: 'H_bio',
      colSource: 'Источник',
      colCanary: 'Canary',
      badgeSim: 'SIM',
      badgeLive: 'LIVE',
      badgeCanary: 'CANARY',
      loadingTelemetry: 'Загрузка событий reo_telemetry...',
      emptyTelemetry: 'Событий телеметрии пока нет. Запустите любую проверку защиты выше или используйте модули платформы.',
      emptyFiltered: 'По выбранным фильтрам событий не найдено.',
      inspectorTitle: 'Форензик-инспектор события',
      inspectorCloseAria: 'Закрыть форензик-инспектор',
      inspectorCapturedInput: 'Перехваченный ввод (только текст, без HTML)',
      inspectorCanaryId: 'canary_id',
      inspectorDegradedMode: 'degraded_mode',
      inspectorCreatedAt: 'created_at',
      errorLoadTelemetry: 'Не удалось загрузить телеметрию безопасности из Supabase.',
      errorNetworkDesc: 'Не удалось связаться с Edge Function или провайдер вернул временную ошибку.',
      errorCreateSimCve: 'Не удалось создать временную CVE-запись песочницы для Пресета 4.',
      presetCleanReplyLabel: 'Подтверждённый чистый ответ ассистента',
    },
  },
  az: {
    brand: {
      name: 'REO AI & REO-Shield v2.0',
      subtitle: 'Koqnitiv Kibertəhlükəsizlik Komanda Mərkəzi',
      platformTagline: 'Sıfır-Etibar Süni İntellekt Tədris Müdafiəsi və CVE-EDU Laboratoriyası',
    },
    langSwitcher: {
      label: 'İnterfeys dili',
      en: 'EN',
      ru: 'RU',
      az: 'AZ',
    },
    auth: {
      heroTitle: 'Suveren Süni İntellekt Müdafiəsi və Koqnitiv Təhlükəsizlik',
      heroDescription:
        'Real vaxtda prompt-inyeksiya davamlılığını, çarpaz-ailə Red/Blue auditlərini, CVE-EDU koqnitiv boşluq yamaqlarını və klaviatura biometrik telemetriyasını sınayın.',
      sandboxEyebrow: 'Münsiflər üçün ani giriş',
      sandboxTitle: '2 Saatlıq Təcrid Olunmuş Münsif Sandbox-u',
      sandboxDescription:
        'Qeydiyyat tələb etmədən birbaşa istehsal Edge Function vasitəsilə RLS qorumalı müvəqqəti hesab yaradır.',
      sandboxButton: '2 Saatlıq Münsif Sandbox-unu Başlat',
      sandboxLaunching: 'Sandbox sessiyası yaradılır...',
      orDivider: 'Və ya Supabase hesabı ilə daxil olun',
      authModeAriaLabel: 'Doğrulama rejimi',
      signInTab: 'Daxil ol',
      signUpTab: 'Qeydiyyat',
      emailLabel: 'E-poçt ünvanı',
      emailPlaceholder: 'analyst@institution.edu',
      passwordLabel: 'Şifrə',
      passwordPlaceholder: 'Ən azı 6 simvol',
      signInButton: 'Komanda Mərkəzinə Daxil Ol',
      signUpButton: 'Hesab Yarat',
      authenticating: 'Məlumatlar yoxlanılır...',
      validationEmailRequired: 'Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.',
      validationPasswordMin: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.',
      signUpSuccessNotice:
        'Hesab yaradıldı. E-poçt təsdiqi aktivdirsə, daxil olmadan əvvəl poçt qutunuzu təsdiqləyin.',
      authErrorFallback: 'Giriş uğursuz oldu. Məlumatları yoxlayıb yenidən cəhd edin.',
      modulesHeading: 'İstehsal Memarlığı Modulları',
      featureCoachTitle: 'M1 Suveren Tədris Bələdçisi',
      featureCoachDesc: 'Canlı REO-Shield yoxlaması ilə qorunan çox-model akademik dəstək.',
      featureArenaTitle: 'Red/Blue Audit Arenası',
      featureArenaDesc: 'Dürüst failover göstəricisi ilə Gemini və Qwen çarpaz-ailə auditi.',
      featureCveTitle: 'CVE-EDU Boşluq Laboratoriyası',
      featureCveDesc: 'Koqnitiv xətaların qeydiyyatı, aralıklı təkrar və yamaq yoxlaması.',
      featureSocTitle: 'REO-Shield Canlı SOC',
      featureSocDesc: 'Real vaxt telemetriyası və 1 kliklə 5 təhlükəsiz Red-Team simulyasiyası.',
    },
    hud: {
      navAriaLabel: 'Əsas Komanda Modulları',
      tabCoach: 'M1 Bələdçi',
      tabArena: 'Red/Blue Arena',
      tabCve: 'CVE-EDU Lab',
      tabSoc: 'REO-Shield SOC',
      juryTimerLabel: 'Münsif Sandbox',
      juryExpiredLabel: 'Sessiya bitdi',
      renewSession: 'Sandbox-u Yenilə',
      renewingSession: 'Yenilənir...',
      signOut: 'Çıxış',
      accountJury: 'Münsif Sandbox Hesabı',
      accountStandard: 'Təsdiqlənmiş Operator',
      sessionExpiredBanner:
        'Sessiyanızın vaxtı bitib və ya etibarsızdır (HTTP 401). Davam etmək üçün Münsif Sandbox-unu yeniləyin və ya yenidən daxil olun.',
      rateLimitBanner:
        'Sorğu limiti doldu (HTTP 429). Yenidən cəhd etməzdən əvvəl gözləmə müddətini tamamlayın.',
      dismissNotice: 'Bağla',
      loadingSession: 'Təhlükəsiz sessiya bərpa olunur...',
    },
    workspace: {
      foundationVerified: 'Mərhələ 1 Özülü Aktivdir',
      activeSessionLabel: 'Təsdiqlənmiş Kimlik',
      activeLangLabel: 'Edge Function Dili',
      endpointContractLabel: 'Dondurulmuş Edge Endpoint',
      rlsTablesLabel: 'RLS Cədvəl Bağlantıları',
      milestoneBadgeLabel: 'Təhvil Mərhələsi',
      milestone2Label: 'Planlaşdırılıb: Mərhələ 2',
      milestone3Label: 'Planlaşdırılıb: Mərhələ 3',
      milestone4Label: 'Planlaşdırılıb: Mərhələ 4',
      coachTitle: 'M1 Suveren Tədris Bələdçisi',
      coachSubtitle:
        'Davamlı mövzular, model profili seçimi və hər mesaj üçün REO-Shield telemetriya zolağı olan akademik iş sahəsi.',
      coachScope:
        'Mərhələ 2-də mövzu siyahısı, fənn və model seçiciləri, təhlükəsiz Markdown + KaTeX renderi, Telemetriya Zolağı və Honeypot xəbərdarlıq kartı əlavə olunacaq.',
      arenaTitle: 'Red/Blue Audit Arenası',
      arenaSubtitle:
        'Çarpaz-ailə yoxlaması və hakim qərarı ilə yan-yana Mavi Komanda Memarı və Qırmızı Komanda Auditoru icrası.',
      arenaScope:
        'Mərhələ 3-də ikili audit paneli, dürüst failover göstəricisi, CVE əlaqələndirməsi, qərar saxlanması və tarixçə siyahısı əlavə olunacaq.',
      cveTitle: 'CVE-EDU Koqnitiv Boşluq Laboratoriyası',
      cveSubtitle:
        'Bilik boşluqlarını və diqqət xətalarını aralıklı təkrar və interaktiv yamaq doğrulaması ilə CVE qeydləri kimi izləyin.',
      cveScope:
        'Mərhələ 3-də filtrli CVE siyahısı, təkrar nişanları, yamaq sınağı paneli, bal göstəricisi və qiymətləndirmə müdaxiləsinə qarşı Honeypot xəbərdarlıqları əlavə olunacaq.',
      socTitle: 'REO-Shield Canlı SOC və Hücum Simulyatoru',
      socSubtitle:
        'reo_telemetry cədvəlinə əsaslanan canlı təhlükəsizlik analitikası və 1 kliklə 5 təhlükəsiz Red-Team simulyasiya ssenarisi.',
      socScope:
        'Mərhələ 4-də server hesablamalı KPI kartları, oxumaq üçün telemetriya axını və Canary Token Replay ilə N1 Self-DoS daxil 5 simulyasiya əlavə olunacaq.',
      biometricsTitle: 'Müştəri Klaviatura Biometrikası SDK Kalibrlənməsi',
      biometricsSubtitle:
        'useKeystrokeTelemetry() üçün canlı diaqnostika. Mərhələ 2 inteqrasiyasından əvvəl real x-reo-telemetry başlığını yoxlamaq üçün aşağıda yazın və ya mətn yapışdırın.',
      biometricsInputLabel: 'Canlı Klaviatura Ölçüm Sahəsi',
      biometricsInputPlaceholder: 'flight_times_ms və paste_events yığımını yoxlamaq üçün nümunə sorğu yazın və ya yapışdırın...',
      biometricsSamplesLabel: 'Uçuş Nümunələri (maks 120)',
      biometricsLastFlightLabel: 'Son Düymə İntervalı',
      biometricsPastesLabel: 'Yapışdırma Sayı',
      biometricsSessionLabel: 'Tab Sessiya UUID',
      biometricsResetButton: 'Buferi Sıfırla',
      biometricsHeaderPreviewLabel: 'Seriyalaşdırılmış x-reo-telemetry Başlığı',
      biometricsNoSample: 'Klaviatura girişi gözlənilir',
    },
    coach: {
      sidebarTitle: 'Tədris Sessiyaları',
      newSession: 'Yeni Sessiya',
      loadingThreads: 'Mövzular yüklənir...',
      emptyThreads: 'Hələ yadda saxlanmış sessiya yoxdur. İlk sessiyanı yaratmaq üçün sual göndərin.',
      loadingMessages: 'Mesaj tarixçəsi yüklənir...',
      deleteThreadAria: 'Mövzunu sil',
      confirmDelete: 'Təsdiqlə',
      cancelDelete: 'Ləğv et',
      toggleSidebarAria: 'Sessiya panelini aç/bağla',
      closeSidebarAria: 'Sessiya panelini bağla',
      subjectLabel: 'Fənn',
      modelProfileLabel: 'Model Profili',
      subjects: {
        Cybersecurity: 'Kibertəhlükəsizlik',
        Mathematics: 'Riyaziyyat',
        Physics: 'Fizika',
        Informatics: 'İnformatika',
        English: 'İngilis dili',
        General: 'Ümumi',
      },
      profiles: {
        fast: 'Gemini Fast',
        deep: 'Gemini Deep Reasoning',
        qwen_plus: 'Qwen Plus',
        qwen_max: 'Qwen Max',
      },
      welcomeTitle: 'M1 Suveren Tədris Bələdçisi',
      welcomeDescription:
        'İstənilən akademik və ya kibertəhlükəsizlik sualı verin. Hər sorğu Dual-LLM Noisy-OR REO-Shield və klaviatura biometrikası ilə canlı yoxlanılır.',
      starterPromptsLabel: 'Tövsiyə Olunan Suallar',
      starterPrompts: {
        cyber: 'TLS 1.3-ün ECDHE ilə irəli məxfiliyi (Forward Secrecy) necə təmin etdiyini və RSA açar mübadiləsinin niyə çıxarıldığını izah et.',
        math: 'Teylor sıralarından istifadə edərək Eyler eyniliyini e^(iπ) + 1 = 0 çıxar və qısa Python yoxlaması göstər.',
        informatics: 'Deykstra və Bellman-Ford ən qısa yol alqoritmlərini vaxt mürəkkəbliyi və kənar hallar üzrə müqayisə et.',
      },
      roleUser: 'Operator',
      roleAssistant: 'M1 Bələdçi',
      composerLabel: 'Tədris sorğusu girişi',
      composerPlaceholder: 'Texniki və ya akademik sual yazın (Markdown və LaTeX dəstəklənir)...',
      sendButton: 'Göndər',
      sendingLabel: 'Təhlil...',
      analyzingStatus: 'Dual-LLM Noisy-OR Qalxanı qiymətləndirilir...',
      shiftEnterHint: 'Göndərmək üçün Enter · Yeni sətir üçün Shift+Enter',
      bioSamplesLabel: 'Düymələr',
      bioPastesLabel: 'Yapışdırma',
      bioSessionLabel: 'Sessiya',
      copyCode: 'Kopyala',
      copiedCode: 'Kopyalandı',
      error401Title: 'Sessiya Doğrulaması Tələb Olunur (HTTP 401)',
      error401Desc: 'Münsif Sandbox-u və ya sessiya tokeninin vaxtı bitib. Davam etmək üçün sandbox-u yeniləyin və ya yenidən daxil olun.',
      error429Title: 'Sorğu Limiti Aktivdir (HTTP 429)',
      error429Desc: 'Qısa müddətdə çox sorğu göndərildi. Yazdığınız mətn saxlanılıb — bir qədər gözləyib yenidən cəhd edin.',
      errorNetworkTitle: 'Şlüz Müvəqqəti Əlçatmazdır',
      errorNetworkDesc: 'reo-gateway ilə əlaqə qurula bilmədi və ya müvəqqəti xəta baş verdi. Söhbət tarixçəniz qorunub.',
      errorLoadThreads: 'Supabase-dən sessiyalar yüklənə bilmədi.',
      errorDeleteThread: 'Seçilmiş sessiya silinə bilmədi.',
      shield: {
        statusClean: 'CLEAN',
        statusHoneypot: 'HONEYPOT_ENGAGED',
        reoIndex: 'REO Index',
        dJs: 'D_JS',
        hBio: 'H_bio',
        cv: 'CV',
        failoverBadge: 'FAILOVER',
        degradedBadge: 'DEGRADED',
        inspectToggle: 'Math Shield Təhlili',
        hideToggle: 'Math Shield Gizlət',
        consensusMal: 'consensus_mal',
        bioPenalty: 'bio_penalty',
        heuristicScore: 'heuristic_score',
        threatType: 'threat_type',
        severity: 'severity',
        matchedRules: 'matched_rules',
        canaryIssued: 'canary_issued',
        canaryVerified: 'canary_verified',
        crossAccountReplay: 'cross_account_replay',
        noneLabel: 'Yoxdur',
        yesLabel: 'true',
        noLabel: 'false',
      },
      honeypot: {
        bannerTitle: 'REO-SHIELD INTERCEPT // HONEYPOT ENGAGED',
        zeroSpendBadge: '0 LLM TOKEN SPEND',
        canaryVerifiedBadge: 'CANARY REPLAY VERIFIED (0ms DB INTERCEPT)',
        canaryIssuedBadge: 'CANARY TRAP ISSUED',
        canaryTokenLabel: 'Çıxarılmış Canary Tokeni',
        copyCanary: 'Tokeni Kopyala',
        copiedCanary: 'Kopyalandı',
        terminalLabel: 'Statik Honeypot Diaqnostik Cavabı',
        localOnlyNote: 'Yalnız lokal görünüşdə saxlanılır — verilənlər bazasına yazılmır və təmiz tarixçəyə əlavə edilmir.',
        threatLabel: 'Təhdid',
        severityLabel: 'Səviyyə',
        rulesLabel: 'Uyğun Qaydalar',
      },
    },
    arena: {
      title: 'Red/Blue Audit Arenası',
      subtitle:
        'Canlı REO-Shield yoxlaması, dürüst failover bildirişi və yadda saxlanan hakim qərarları ilə çarpaz-ailə Mavi Memar və Qırmızı Auditor duelləri icra edin.',
      promptLabel: 'Audit üçün sorğu və ya texniki həll',
      promptPlaceholder:
        'Mavi Komanda sintezi və Qırmızı Komanda tənqidi üçün alqoritm, kriptoqrafiya sxemi, isbat və ya təhlükəsizlik memarlığı daxil edin...',
      deepAuditLabel: 'Dərin Audit Rejimi',
      deepAuditHint: 'Genişləndirilmiş rəqib yoxlaması',
      blueTeamLabel: 'Mavi Komanda Memarı',
      redTeamLabel: 'Qırmızı Komanda Auditoru (Əks Ailə)',
      pairingLabel: 'Çarpaz-Ailə Cütlüyü',
      linkCveLabel: 'CVE Qeydinə Bağla (İstəyə bağlı)',
      noLinkedCve: 'Bağlı CVE qeydi yoxdur',
      launchDuelButton: 'Red/Blue Auditini Başlat',
      runningDuelLabel: 'Audit gedir...',
      runningDuelStatus: 'REO-Shield və Çarpaz-Ailə Auditi icra olunur...',
      crossFamilyVerified: 'CROSS-FAMILY VERIFIED',
      singleFamilyFailover: 'SINGLE-FAMILY FAILOVER ACTIVE',
      totalLatencyLabel: 'Ümumi Gecikmə',
      blueColumnTitle: 'Mavi Komanda Memarı',
      redColumnTitle: 'Qırmızı Komanda Auditoru',
      arbiterTitle: 'Hakim Qərarı',
      verdictPending: 'Qərar Gözlənilir',
      verdictBlueClean: 'Blue Clean',
      verdictRedFoundFlaw: 'Red Found Flaw',
      markBlueClean: 'Mavi Komanda Təmizdir',
      markRedFlaw: 'Qırmızı Xəta Tapdı',
      savingVerdict: 'Saxlanılır...',
      historyTitle: 'Keçmiş Arena İcraları',
      historyToggleShow: 'Tarixçəni Göstər',
      historyToggleHide: 'Tarixçəni Gizlət',
      historyLoading: 'Arena tarixçəsi yüklənir...',
      historyEmpty: 'Hələ heç bir Red/Blue audit icrası qeydə alınmayıb.',
      historyCountSuffix: 'icra',
      viewingPastRunBanner: 'reo_arena_runs cədvəlindən saxlanmış tarixi icra göstərilir.',
      clearActiveRun: 'Yeni Audit',
      linkedCveBadge: 'Bağlı CVE',
      errorLoadHistory: 'Keçmiş arena icraları Supabase-dən yüklənə bilmədi.',
      errorUpdateVerdict: 'Hakim qərarı yenilənə bilmədi.',
      errorNetworkDesc: 'reo-arena ilə əlaqə qurula bilmədi və ya müvəqqəti xəta baş verdi.',
    },
    cve: {
      title: 'CVE-EDU Koqnitiv Boşluq Laboratoriyası',
      subtitle:
        'Konseptual xətaları rəsmi CVE qeydləri kimi qeydiyyata alın, aralıklı təkrarları izləyin və yeni yamaq doğrulama sınaqlarından keçin.',
      logNewButton: 'Koqnitiv Boşluq Qeyd Et',
      kpiTotal: 'Ümumi Qeydlər',
      kpiVulnerable: 'Boşluq Aktivdir',
      kpiPatched: 'Yamaqlanıb',
      kpiRegressed: 'Geri Qayıdıb',
      kpiPendingReviews: 'Gözləyən Təkrarlar',
      filterAll: 'HAMISI',
      filterVulnerable: 'VULNERABLE',
      filterPatched: 'PATCHED',
      filterRegressed: 'REGRESSED',
      searchPlaceholder: 'CVE kodu və ya mövzu üzrə axtar...',
      searchAriaLabel: 'CVE qeydlərində axtarış',
      loadingRecords: 'CVE qeydləri yüklənir...',
      emptyRecords: 'Hələ koqnitiv boşluq qeydə alınmayıb. Yamaq doğrulamasına başlamaq üçün ilk qeydi əlavə edin.',
      emptyFiltered: 'Cari filtr və ya axtarış sorğusuna uyğun CVE qeydi tapılmadı.',
      statusLabels: {
        VULNERABLE: 'VULNERABLE',
        PATCHED: 'PATCHED',
        REGRESSED: 'REGRESSED',
      },
      rootCauseLabels: {
        knowledge_gap: 'Bilik Boşluğu',
        attention_slip: 'Diqqət Xətası',
      },
      problemLabel: 'Problemin Təsviri',
      derivationLabel: 'Xətalı Mühakimə / Addım',
      verifiedAtLabel: 'Yamaq Təsdiqləndi',
      repetitionDueBadge: 'Aralıklı Təkrar Vaxtı',
      stepDaysPrefix: 'Gün',
      markReviewDone: 'Təkrarı Tamamla',
      markingReview: 'Yenilənir...',
      launchPatchButton: 'Yamaq Sınağını Başlat',
      deleteRecordAria: 'CVE qeydini sil',
      modalCreateTitle: 'Yeni Koqnitiv Boşluq Qeydi',
      modalCloseAria: 'Paneli bağla',
      fieldVulnCode: 'Boşluq Kodu',
      fieldSubject: 'Fənn',
      fieldTopic: 'Mövzu',
      fieldTopicPlaceholder: 'Məs.: SQL Parametrizasiyası, Zəncir Qaydası İşarə Xətası',
      fieldRootCause: 'Əsas Səbəb',
      fieldProblem: 'Problemin Təsviri',
      fieldProblemPlaceholder: 'Boşluğun baş verdiyi tapşırığı və ya anlayışı təsvir edin...',
      fieldDerivation: 'Xətalı Çıxarış və ya Səhv Addım',
      fieldDerivationPlaceholder: 'Etdiyiniz dəqiq səhv mühakiməni qeyd edin...',
      createSubmitButton: 'CVE Qeydi Yarat',
      creatingButton: 'Saxlanılır...',
      validationRequiredFields: 'Boşluq kodu, mövzu, problem təsviri və xətalı çıxarış tələb olunur.',
      drawerTitle: 'Yamaq Doğrulama Sınağı',
      step1Title: 'Addım 1: Yeni Doğrulama Sınağı Yarat',
      generateButton: 'Yeni Doğrulama Sınağı Yarat',
      generatingButton: 'Sınaq Yaradılır...',
      recordSanitizedNotice: 'RECORD SANITIZED — Yaradılmadan əvvəl CVE qeydindən potensial inyeksiya nümunələri təmizləndi.',
      challengePromptLabel: 'Yaradılmış Sınaq Sualı',
      step2Title: 'Addım 2: Yamaqlanmış İzahınızı Göndərin',
      answerLabel: 'Yamaq Cavabınız',
      answerPlaceholder: 'Boşluğun aradan qaldırıldığını sübut etmək üçün tam və düzgün izah yazın...',
      verifyButton: 'Yamağı Yoxla',
      verifyingButton: 'Yamaq Qiymətləndirilir...',
      step3Title: 'Addım 3: Doğrulama Qərarı',
      scoreLabel: 'Doğrulama Balı',
      patchPassedBanner: 'YAMAQ TƏSDİQLƏNDİ (PASSED)',
      patchFailedBanner: 'YAMAQ UĞURSUZ OLDU',
      statusTransitionLabel: 'Status Keçidi',
      repetitionScheduledNotice: 'reo_repetitions cədvəlində avtomatik olaraq 24 saatlıq təkrar planlaşdırıldı.',
      parseFailedNotice: 'Modelin qiymətləndirmə cavabı etibarsız JSON formatında qayıtdı. Zəhmət olmasa yenidən cəhd edin.',
      feedbackLabel: 'Auditor Rəyi',
      errorLoadRecords: 'CVE qeydləri Supabase-dən yüklənə bilmədi.',
      errorCreateRecord: 'CVE qeydi yaradıla bilmədi.',
      errorDeleteRecord: 'CVE qeydi silinə bilmədi.',
      errorMarkReview: 'Aralıklı təkrar tamamlanmış kimi qeyd edilə bilmədi.',
      errorNetworkDesc: 'reo-patch-challenge ilə əlaqə qurula bilmədi və ya müvəqqəti xəta baş verdi.',
    },
    soc: {
      title: 'REO-Shield Canlı SOC və Hücum Simulyatoru',
      subtitle:
        'Təhlükəsiz simulyasiyalarla (is_simulation: true) hər müdafiə qatını 1 kliklə sübut edin və reo_telemetry cədvəlindən canlı RLS telemetriyasını izləyin.',
      simulatorTitle: 'Red-Team Müdafiə Doğrulama Paneli',
      simulatorSubtitle:
        'Honeypot müdaxiləsini, 0 ms Canary Replay blokunu, CVE qiymətləndirmə mühafizəsini və N1 yanlış-pozitivsiz davamlılığı sübut edən 5 sınaq ssenarisi.',
      runAllButton: 'Bütün 5 Müdafiə Sübutunu İcra Et',
      runningAllButton: 'Sınaq Paketi İcra Olunur...',
      allVerifiedBanner: '5/5 MÜDAFİƏ SÜBUTU TƏSDİQLƏNDİ — Bütün REO-Shield v2.0 qatları canlı işləyir.',
      activeCanaryLabel: 'Tutulmuş Canlı Canary',
      noCanaryCaptured: 'Canlı canary tokeni əldə etmək üçün Ssenari 1 və ya 2-ni icra edin',
      runPresetButton: 'İcra Et',
      runningPresetButton: 'İcra olunur...',
      expandDetails: 'Canlı Cavabı Göstər',
      hideDetails: 'Cavabı Gizlət',
      statusLabels: {
        IDLE: 'IDLE',
        RUNNING: 'RUNNING',
        VERIFIED: 'VERIFIED',
        FAILED: 'FAILED',
      },
      proofBadges: {
        zeroSpend: '0 LLM TOKEN SPEND',
        zeroMsIntercept: '0 ms DB INTERCEPT',
        statusProtected: 'CVE STATUSU QORUNDU',
        zeroFalsePositive: 'YANLIŞ BLOKLAMA YOXDUR',
        honeypotEngaged: 'HONEYPOT ENGAGED',
      },
      presets: {
        preset1: {
          code: 'SSENARİ 01',
          title: 'Birbaşa Prompt İnyeksiyası + Bot Ritmi',
          description:
            'Mexaniki 10 ms klaviatura ritmi və yapışdırma siqnalı ilə təlimat pozuntusu göndərərək 0 LLM token sərfi ilə Honeypot müdaxiləsini sübut edir.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + provider_used === "none"',
        },
        preset2: {
          code: 'SSENARİ 02',
          title: 'Sistem Promptunun Sızdırılması',
          description:
            'Tərtibatçı siyasətini, daxili nonce dəyərini və gizli sistem təlimatlarını JSON formatında çıxarmağa cəhd edir.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + canary tələsi tutulması',
        },
        preset3: {
          code: 'SSENARİ 03',
          title: 'Canary Token Təkrarı (0 ms DB Müdaxiləsi)',
          description:
            'Ssenari 1/2-dən tutulmuş canlı REO-CANARY tokenini yenidən göndərir (yoxdursa avtomatik yenisini alır) və 0 ms deterministik bazada bloklamanı sübut edir.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'HONEYPOT_ENGAGED + canary_verified === true + latency_ms === 0',
        },
        preset4: {
          code: 'SSENARİ 04',
          title: 'CVE Qiymətləndirmə Saxtakarlığı İnyeksiyası',
          description:
            'Yamaq yoxlamasına bal saxtakarlığı əmri yeridir; 0 bal və dəyişməz CVE statusu ilə müdafiəni təsdiqləyir.',
          target: 'POST /functions/v1/reo-patch-challenge',
          criteria: 'HONEYPOT_ENGAGED + passed === false + score === 0 + status dəyişməz',
        },
        preset5: {
          code: 'SSENARİ 05',
          title: 'N1 Self-DoS Yoxlaması (Sıfır Yanlış Bloklama)',
          description:
            'Canary tokenini yalnız model tarixçəsində yerləşdirib insan ritmli sadə riyazi sualla yanlış özünü-bloklamanın olmadığını sübut edir.',
          target: 'POST /functions/v1/reo-gateway',
          criteria: 'CLEAN + shield.blocked === false',
        },
      },
      telemetryTitle: 'Canlı Təhlükəsizlik Telemetriya Axını (reo_telemetry)',
      telemetrySubtitle: 'Bu hesab üçün son 100 təhlükəsizlik hadisəsinin yalnız-oxuma RLS forenzik jurnalı.',
      refreshButton: 'Telemetriyanı Yenilə',
      refreshingButton: 'Yenilənir...',
      autoRefreshLabel: 'Avto-Yeniləmə (15s)',
      exportJsonButton: 'JSON Hesabatını İxrac Et',
      kpiBlocked: 'Bloklanmış / Honeypot',
      kpiCanaries: 'Verilmiş Canary Tələləri',
      kpiCanaryReplays: 'Təsdiqlənmiş təkrarlar',
      kpiAvgDjs: 'Orta D_JS Fərqi',
      kpiAvgHbio: 'Orta H_bio Entropiyası',
      kpiSimLive: 'Simulyasiya / Canlı Bölgüsü',
      simPrefix: 'Sim',
      livePrefix: 'Live',
      filterSourceLabel: 'Mənbə',
      filterSeverityLabel: 'Səviyyə',
      filterModuleLabel: 'Modul',
      filterAll: 'HAMISI',
      filterSimulation: 'SIMULATION',
      filterLive: 'LIVE',
      moduleLabels: {
        ALL: 'Bütün Modullar',
        m1_study_coach: 'm1_study_coach',
        red_blue_arena: 'red_blue_arena',
        cve_patch_challenge: 'cve_patch_challenge',
        red_team_lab: 'Red-Team Laboratoriyası (Sim)',
      },
      colTimestamp: 'Vaxt',
      colModule: 'Modul',
      colThreat: 'Təhdid Növü',
      colSeverity: 'Səviyyə',
      colAction: 'Görülən Tədbir',
      colReoIndex: 'REO Index',
      colDjs: 'D_JS',
      colHbio: 'H_bio',
      colSource: 'Mənbə',
      colCanary: 'Canary',
      badgeSim: 'SIM',
      badgeLive: 'LIVE',
      badgeCanary: 'CANARY',
      loadingTelemetry: 'reo_telemetry hadisələri yüklənir...',
      emptyTelemetry: 'Hələ telemetriya hadisəsi qeydə alınmayıb. Yuxarıdakı Müdafiə Sübutlarından birini icra edin.',
      emptyFiltered: 'Seçilmiş filtrlərə uyğun telemetriya hadisəsi tapılmadı.',
      inspectorTitle: 'Forenzik Hadisə İnspektoru',
      inspectorCloseAria: 'Forenzik inspektoru bağla',
      inspectorCapturedInput: 'Tutulmuş Giriş (Yalnız Düz Mətn — İcra Olunmur)',
      inspectorCanaryId: 'canary_id',
      inspectorDegradedMode: 'degraded_mode',
      inspectorCreatedAt: 'created_at',
      errorLoadTelemetry: 'Supabase-dən təhlükəsizlik telemetriyası yüklənə bilmədi.',
      errorNetworkDesc: 'Edge Function ilə əlaqə qurula bilmədi və ya müvəqqəti xəta baş verdi.',
      errorCreateSimCve: 'Ssenari 4 üçün müvəqqəti sandbox CVE qeydi yaradıla bilmədi.',
      presetCleanReplyLabel: 'Təsdiqlənmiş Təmiz Assistent Cavabı',
    },
  },
};

export const SUPPORTED_LANGUAGES: readonly ReoLang[] = ['en', 'ru', 'az'] as const;
