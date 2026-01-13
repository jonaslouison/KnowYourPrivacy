import { DEVICE_SELECTION_OPTIONS, type DeviceType } from './devices'

export interface QuizOption {
  label: string
  value: string
  score: number
  threat?: string | null
}

export type QuizQuestionDevice = DeviceType | 'mobile'

export interface QuizQuestion {
  id: string
  category: string
  question: string
  options: QuizOption[]
  device?: QuizQuestionDevice
}

export interface Recommendations {
  [key: string]: {
    [key: string]: string[]
  }
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'device-selection',
    category: 'Setup',
    question: 'What devices are you using?',
    options: DEVICE_SELECTION_OPTIONS.map((option) => ({
      label: option.label,
      value: option.id,
      score: 0
    }))
  },
  // App Usage Questions
  {
    id: 'browser-desktop',
    category: 'App Usage - Browser',
    question: 'What browser do you use on desktop?',
    device: 'pc',
    options: [
      { label: 'Google Chrome', value: 'chrome', score: 30 },
      { label: 'Microsoft Edge', value: 'edge', score: 35 },
      { label: 'Safari', value: 'safari', score: 50 },
      { label: 'Firefox', value: 'firefox', score: 75 },
      { label: 'Brave', value: 'brave', score: 90 },
      { label: 'Tor Browser', value: 'tor', score: 100 },
      { label: 'Other privacy-focused browser', value: 'other-privacy', score: 85 },
      { label: 'Other non-privacy-focused browser', value: 'other-non-privacy', score: 20 }
    ]
  },
  {
    id: 'browser-mobile',
    category: 'App Usage - Browser',
    question: 'What browser do you use on mobile?',
    device: 'phone',
    options: [
      { label: 'Google Chrome', value: 'chrome', score: 30 },
      { label: 'Safari', value: 'safari', score: 50 },
      { label: 'Firefox', value: 'firefox', score: 75 },
      { label: 'Brave', value: 'brave', score: 90 },
      { label: 'DuckDuckGo Browser', value: 'ddg', score: 85 },
      { label: 'Other privacy-focused browser', value: 'other-privacy', score: 80 },
      { label: 'Other non-privacy-focused browser', value: 'other-non-privacy', score: 20 }
    ]
  },
  {
    id: 'browser-tablet',
    category: 'App Usage - Browser',
    question: 'What browser do you use on your tablet?',
    device: 'tablet',
    options: [
      { label: 'Google Chrome', value: 'chrome', score: 30 },
      { label: 'Safari', value: 'safari', score: 50 },
      { label: 'Firefox', value: 'firefox', score: 75 },
      { label: 'Brave', value: 'brave', score: 90 },
      { label: 'DuckDuckGo Browser', value: 'ddg', score: 85 },
      { label: 'Other privacy-focused browser', value: 'other-privacy', score: 80 },
      { label: 'Other non-privacy-focused browser', value: 'other-non-privacy', score: 20 }
    ]
  },
  {
    id: 'email-provider',
    category: 'App Usage - Email',
    question: 'What email provider do you use?',
    options: [
      { label: 'Gmail', value: 'gmail', score: 30 },
      { label: 'Outlook/Hotmail', value: 'outlook', score: 35 },
      { label: 'iCloud Mail', value: 'icloud-mail', score: 50 },
      { label: 'Yahoo Mail', value: 'yahoo', score: 30 },
      { label: 'ProtonMail', value: 'protonmail', score: 95 },
      { label: 'Tutanota', value: 'tutanota', score: 95 },
      { label: 'Other privacy-focused provider', value: 'other-privacy', score: 85 },
      { label: 'Other non-privacy-focused provider', value: 'other-non-privacy', score: 20 }
    ]
  },
  {
    id: 'search-engine',
    category: 'App Usage - Search',
    question: 'What search engine do you use?',
    options: [
      { label: 'Google', value: 'google', score: 20 },
      { label: 'Bing', value: 'bing', score: 30 },
      { label: 'DuckDuckGo', value: 'duckduckgo', score: 90 },
      { label: 'Startpage', value: 'startpage', score: 90 },
      { label: 'Brave Search', value: 'brave-search', score: 85 },
      { label: 'Other privacy-focused search', value: 'other-privacy', score: 80 },
      { label: 'Other non-privacy-focused search', value: 'other-non-privacy', score: 20 }
    ]
  },
  {
    id: 'messaging-app',
    category: 'App Usage - Messaging',
    question: 'What messaging app do you primarily use?',
    options: [
      { label: 'WhatsApp', value: 'whatsapp', score: 40 },
      { label: 'Facebook Messenger', value: 'messenger', score: 20 },
      { label: 'Telegram', value: 'telegram', score: 50 },
      { label: 'Signal', value: 'signal', score: 100 },
      { label: 'iMessage', value: 'imessage', score: 70 },
      { label: 'Discord', value: 'discord', score: 25 },
      { label: 'SMS / Text Messages', value: 'sms', score: 15 },
      { label: 'Session', value: 'session', score: 95 },
      { label: 'SimpleX Chat', value: 'simplex', score: 98 },
      { label: 'Threema', value: 'threema', score: 90 },
      { label: 'Other', value: 'other', score: 50 }
    ]
  },
  {
    id: 'cloud-storage',
    category: 'App Usage - Cloud Storage',
    question: 'What cloud storage service do you use?',
    options: [
      { label: 'Google Drive', value: 'gdrive', score: 30 },
      { label: 'Dropbox', value: 'dropbox', score: 40 },
      { label: 'OneDrive', value: 'onedrive', score: 35 },
      { label: 'iCloud', value: 'icloud', score: 50 },
      { label: 'Nextcloud (self-hosted)', value: 'nextcloud', score: 100 },
      { label: 'ProtonDrive', value: 'protondrive', score: 95 },
      { label: 'Don\'t use cloud storage', value: 'none', score: 90 },
      { label: 'Other privacy-focused cloud storage', value: 'other-privacy', score: 95 }
    ]
  },
  {
    id: 'password-manager',
    category: 'App Usage - Security',
    question: 'Do you use a password manager?',
    options: [
      { label: 'No, I reuse passwords', value: 'none-reuse', score: 0 },
      { label: 'No, but I use unique passwords', value: 'none-unique', score: 40 },
      { label: 'Yes, browser built-in', value: 'browser', score: 60 },
      { label: 'Yes, Bitwarden', value: 'bitwarden', score: 95 },
      { label: 'Yes, 1Password', value: '1password', score: 90 },
      { label: 'Yes, KeePass/KeePassXC', value: 'keepass', score: 100 },
      { label: 'Yes, other password manager', value: 'other', score: 80 }
    ]
  },
  {
    id: 'vpn-usage',
    category: 'App Usage - Security',
    question: 'Do you use a VPN?',
    options: [
      { label: 'No', value: 'no', score: 30 },
      { label: 'Yes, free VPN', value: 'free', score: 40 },
      { label: 'Yes, paid VPN (Mullvad, IVPN, ProtonVPN)', value: 'paid-privacy', score: 100 },
      { label: 'Yes, other paid VPN', value: 'paid-other', score: 70 },
      { label: 'Yes, self-hosted VPN', value: 'selfhosted', score: 90 }
    ]
  },

  {
    id: 'os-desktop',
    category: 'App Usage - Operating System',
    question: 'What operating system powers your desktop device?',
    device: 'pc',
    options: [
      { label: 'Windows 11/10', value: 'windows', score: 50 },
      { label: 'macOS', value: 'macos', score: 70 },
      { label: 'Linux (Ubuntu, Fedora, etc.)', value: 'linux', score: 90 },
      { label: 'Other (BSD, self-built)', value: 'other-desktop', score: 80 }
    ]
  },
  {
    id: 'os-mobile',
    category: 'App Usage - Operating System',
    question: 'What OS do you run on your phone?',
    device: 'phone',
    options: [
      { label: 'Android', value: 'android', score: 60 },
      { label: 'iOS', value: 'ios', score: 80 },
      { label: 'Other (feature phone, custom ROM)', value: 'other-mobile', score: 70 }
    ]
  },
  {
    id: 'os-tablet',
    category: 'App Usage - Operating System',
    question: 'What OS runs on your tablet?',
    device: 'tablet',
    options: [
      { label: 'iPadOS', value: 'ipados', score: 80 },
      { label: 'Android', value: 'android-tablet', score: 60 },
      { label: 'Other (dedicated OS or Linux)', value: 'other-tablet', score: 75 }
    ]
  },

  // Threat Model Questions
  {
    id: 'threat-surveillance',
    category: 'Threat Model',
    question: 'Are you concerned about surveillance capitalism (companies tracking you for ads)?',
    options: [
      { label: 'Not concerned', value: 'no', score: 0, threat: null },
      { label: 'Somewhat concerned', value: 'somewhat', score: 50, threat: 'Surveillance Capitalism' },
      { label: 'Very concerned', value: 'yes', score: 100, threat: 'Surveillance Capitalism' }
    ]
  },
  {
    id: 'threat-fingerprinting',
    category: 'Threat Model',
    question: 'Are you concerned about online fingerprinting and tracking?',
    options: [
      { label: 'Not concerned', value: 'no', score: 0, threat: null },
      { label: 'Somewhat concerned', value: 'somewhat', score: 50, threat: 'Online Fingerprinting' },
      { label: 'Very concerned', value: 'yes', score: 100, threat: 'Online Fingerprinting' }
    ]
  },
  {
    id: 'threat-government',
    category: 'Threat Model',
    question: 'Are you concerned about government surveillance?',
    options: [
      { label: 'Not concerned', value: 'no', score: 0, threat: null },
      { label: 'Somewhat concerned', value: 'somewhat', score: 50, threat: 'Government Surveillance' },
      { label: 'Very concerned', value: 'yes', score: 100, threat: 'Government Surveillance' }
    ]
  },
  {
    id: 'threat-data-breaches',
    category: 'Threat Model',
    question: 'Are you concerned about data breaches?',
    options: [
      { label: 'Not concerned', value: 'no', score: 0, threat: null },
      { label: 'Somewhat concerned', value: 'somewhat', score: 50, threat: 'Data Breaches' },
      { label: 'Very concerned', value: 'yes', score: 100, threat: 'Data Breaches' }
    ]
  },
  {
    id: 'threat-identity-theft',
    category: 'Threat Model',
    question: 'Are you concerned about identity theft?',
    options: [
      { label: 'Not concerned', value: 'no', score: 0, threat: null },
      { label: 'Somewhat concerned', value: 'somewhat', score: 50, threat: 'Identity Theft' },
      { label: 'Very concerned', value: 'yes', score: 100, threat: 'Identity Theft' }
    ]
  },
  {
    id: 'threat-priorities',
    category: 'Threat Model',
    question: 'Order the threats that concern you most',
    options: []
  }
]

// Privacy recommendations by category
export const recommendations: Recommendations = {
  'browser-desktop': {
    chrome: ['Firefox', 'Brave', 'Mullvad Browser'],
    edge: ['Firefox', 'Brave', 'Mullvad Browser'],
    safari: ['Firefox', 'Brave'],
    firefox: ['Consider hardening with privacy extensions'],
    brave: ['Already excellent choice!'],
    tor: ['Perfect for maximum anonymity!'],
    'other-privacy': ['Great choice!']
    ,
    'other-non-privacy': ['Consider switching to Firefox, Brave, or Mullvad Browser']
  },
  'browser-mobile': {
    chrome: ['Firefox Focus', 'Brave', 'DuckDuckGo Browser'],
    safari: ['Firefox Focus', 'Brave', 'DuckDuckGo Browser'],
    firefox: ['Consider Firefox Focus for mobile'],
    brave: ['Excellent choice!'],
    ddg: ['Great choice!'],
    'other-privacy': ['Great choice!']
    ,
    'other-non-privacy': ['Consider Firefox Focus, Brave, or DuckDuckGo Browser']
  },
  'browser-tablet': {
    chrome: ['Firefox', 'Brave', 'DuckDuckGo Browser'],
    safari: ['Firefox', 'Brave', 'DuckDuckGo Browser'],
    firefox: ['Great choice for tablets!'],
    brave: ['Excellent choice!'],
    ddg: ['Great choice!'],
    'other-privacy': ['Great choice!'],
    'other-non-privacy': ['Consider Firefox, Brave, or DuckDuckGo Browser']
  },
  'email-provider': {
    gmail: ['ProtonMail', 'Tutanota', 'Mailbox.org'],
    outlook: ['ProtonMail', 'Tutanota', 'Mailbox.org'],
    yahoo: ['ProtonMail', 'Tutanota', 'Mailbox.org'],
    protonmail: ['Excellent choice!'],
    tutanota: ['Excellent choice!'],
    'other-privacy': ['Great choice!']
    ,
    'icloud-mail': ['Consider ProtonMail, Tutanota, or Mailbox.org'],
    'other-non-privacy': ['Consider ProtonMail or Tutanota for better privacy']
  },
  'search-engine': {
    google: ['DuckDuckGo', 'Startpage', 'Brave Search'],
    bing: ['DuckDuckGo', 'Startpage', 'Brave Search'],
    duckduckgo: ['Excellent choice!'],
    startpage: ['Excellent choice!'],
    'brave-search': ['Great choice!'],
    'other-privacy': ['Great choice!']
    ,
    'other-non-privacy': ['Consider DuckDuckGo, Startpage, or Brave Search']
  },
  'messaging-app': {
    whatsapp: ['Signal', 'Session', 'SimpleX Chat'],
    messenger: ['Signal', 'Session', 'SimpleX Chat'],
    telegram: ['Signal - E2E encrypted by default'],
    signal: ['Perfect choice!'],
    imessage: ['Good, but consider Signal for cross-platform'],
    discord: ['Signal', 'Session', 'SimpleX Chat'],
    sms: ['Signal', 'Session', 'Any encrypted messenger'],
    session: ['Excellent choice!'],
    simplex: ['Perfect choice! Maximum privacy'],
    threema: ['Excellent choice!'],
    other: ['Consider Signal or Session']
  },
  'cloud-storage': {
    gdrive: ['Nextcloud', 'ProtonDrive', 'Cryptomator + any cloud'],
    dropbox: ['Nextcloud', 'ProtonDrive', 'Cryptomator + any cloud'],
    onedrive: ['Nextcloud', 'ProtonDrive', 'Cryptomator + any cloud'],
    icloud: ['Nextcloud', 'ProtonDrive', 'Consider encryption'],
    nextcloud: ['Perfect for self-hosting!'],
    protondrive: ['Excellent choice!'],
    none: ['Good for privacy!'],
    'other-privacy': ['Great choice!']
  },
  'password-manager': {
    'none-reuse': ['URGENT: Use Bitwarden, KeePassXC, or 1Password'],
    'none-unique': ['Consider Bitwarden or KeePassXC'],
    browser: ['Consider Bitwarden or KeePassXC for better security'],
    bitwarden: ['Excellent choice!'],
    '1password': ['Great choice!'],
    keepass: ['Perfect for offline security!'],
    other: ['Good choice!']
  },
  'vpn-usage': {
    no: ['Consider Mullvad, IVPN, or ProtonVPN'],
    free: ['Upgrade to paid: Mullvad, IVPN, or ProtonVPN'],
    'paid-privacy': ['Excellent choice!'],
    'paid-other': ['Consider Mullvad, IVPN, or ProtonVPN'],
    selfhosted: ['Great for control!']
  },
  'os-desktop': {
    windows: ['Explore Linux distros (Fedora, Pop!_OS) or Hardened Windows guides'],
    macos: ['Harden macOS privacy settings and enable full-disk encryption'],
    linux: ['Keep the kernel updated and use distro-specific repos'],
    'other-desktop': ['Document your stack and keep packages trimmed to essentials']
  },
  'os-mobile': {
    android: ['Use privacy forks (Graphene, /e/ OS) and audit app permissions'],
    ios: ['Disable analytics, limit ad tracking, and lock down Siri data'],
    'other-mobile': ['Keep firmware patched and avoid untrusted stores'],
    grapheneos: ['Excellent choice! GrapheneOS is privacy-focused and hardened']
  },
  'os-tablet': {
    ipados: ['Lock iPadOS with screen time passcode and use Privacy Relay'],
    'android-tablet': ['Pair with a privacy-friendly launcher and audit apps'],
    'other-tablet': ['Document firmware sources and update channels carefully']
  }
}
