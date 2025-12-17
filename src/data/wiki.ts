/**
 * Wiki data module - Comprehensive service comparison including mainstream and privacy-focused options
 * Links to Privacy Guides for detailed information on recommended services
 */

// Privacy Guides base URL for external links
const PRIVACY_GUIDES_BASE = 'https://www.privacyguides.org/en'

export interface WikiService {
  id: string
  name: string
  description: string
  logo?: string
  homepage?: string
  privacyPolicy?: string
  /** Privacy rating: 'good' | 'acceptable' | 'caution' | 'avoid' */
  privacyRating: 'good' | 'acceptable' | 'caution' | 'avoid'
  /** Why this rating */
  privacyNote: string
  /** Key privacy concerns or benefits */
  privacyDetails: string[]
  /** Is this recommended by Privacy Guides? */
  privacyGuidesRecommended: boolean
  /** 
   * Difficulty/complexity level for recommendations:
   * 1 = Easy (good for beginners/Normie) - user-friendly, works out of the box
   * 2 = Medium (Aware users) - may require some setup or learning
   * 3 = Advanced (Ghost/Activist) - maximum privacy but requires technical knowledge
   * Only services with rating 'good' should have this field set
   */
  difficulty?: 1 | 2 | 3
}

export interface WikiIntroSection {
  title: string
  description: string
  concerns: {
    heading: string
    points: string[]
  }
  benefits: {
    heading: string
    points: string[]
  }
}

export interface WikiCategory {
  id: string
  label: string
  questionId: string
  icon: string
  description: string
  /** Link to Privacy Guides page for this category */
  privacyGuidesUrl: string
  services: WikiService[]
  /** Structured intro content (replaces markdown) */
  intro: WikiIntroSection
}

// =============================================================================
// EMAIL SERVICES
// =============================================================================

const emailIntro: WikiIntroSection = {
  title: 'Email Providers',
  description: 'Your email is the central hub of your digital identity - used for account recovery, sensitive communications, and personal correspondence.',
  concerns: {
    heading: 'Privacy Concerns with Mainstream Email',
    points: [
      'Standard providers scan messages for advertising',
      'Build detailed profiles about your behavior',
      'Store your data indefinitely',
      'Comply with government surveillance requests'
    ]
  },
  benefits: {
    heading: 'What Privacy-Focused Providers Offer',
    points: [
      'End-to-end encryption - only you and recipient can read',
      'Zero-access encryption - provider cannot read stored emails',
      'No advertising profiles - your data is not monetized',
      'Privacy-friendly jurisdiction - protection from mass surveillance'
    ]
  }
}

const emailServices: WikiService[] = [
  // Mainstream Services (Caution/Avoid)
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google\'s free email service with 15GB storage. Widely used with excellent spam filtering and integration with Google services.',
    homepage: 'https://mail.google.com',
    privacyRating: 'avoid',
    privacyNote: 'Google scans emails for advertising and builds detailed user profiles',
    privacyDetails: [
      'Emails scanned for targeted advertising',
      'Data used to build comprehensive user profile',
      'Integrates with Google\'s tracking ecosystem',
      'Subject to US surveillance laws (PRISM)',
      'No end-to-end encryption'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'outlook',
    name: 'Outlook / Hotmail',
    description: 'Microsoft\'s email service with Office integration. Free tier with 15GB storage.',
    homepage: 'https://outlook.com',
    privacyRating: 'caution',
    privacyNote: 'Better than Gmail but still collects significant data',
    privacyDetails: [
      'Scans emails for advertising (can be limited)',
      'Data shared across Microsoft services',
      'Subject to US surveillance laws',
      'No end-to-end encryption by default',
      'Offers some encryption options for business users'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    description: 'Yahoo\'s free email service with 1TB storage. One of the oldest webmail providers.',
    homepage: 'https://mail.yahoo.com',
    privacyRating: 'avoid',
    privacyNote: 'History of security breaches and extensive data collection',
    privacyDetails: [
      'Massive data breaches affecting billions of users',
      'Emails scanned for advertising',
      'Developed tools for government surveillance',
      'No end-to-end encryption',
      'Poor security track record'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'icloud-mail',
    name: 'iCloud Mail',
    description: 'Apple\'s email service included with Apple ID. Integrates with Apple devices.',
    homepage: 'https://www.icloud.com/mail',
    privacyRating: 'caution',
    privacyNote: 'Apple has better privacy practices but emails are not end-to-end encrypted',
    privacyDetails: [
      'Not end-to-end encrypted (Apple can read emails)',
      'Better privacy policies than Google/Microsoft',
      'No email scanning for advertising',
      'Subject to US surveillance laws',
      'iCloud data can be accessed by Apple with warrant'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'proton-mail',
    name: 'Proton Mail',
    description: 'Swiss-based encrypted email with end-to-end encryption. The most popular privacy-focused email provider with free and paid tiers.',
    homepage: 'https://proton.me/mail',
    privacyRating: 'good',
    privacyNote: 'End-to-end encrypted email with zero-access encryption',
    privacyDetails: [
      'End-to-end encryption for all emails to other Proton users',
      'Zero-access encryption for stored emails',
      'Based in Switzerland with strong privacy laws',
      'Open source apps and independently audited',
      'Free tier available with 1GB storage'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'tuta',
    name: 'Tuta (Tutanota)',
    description: 'German encrypted email service with built-in calendar. Focuses on ease of use with strong encryption.',
    homepage: 'https://tuta.com',
    privacyRating: 'good',
    privacyNote: 'End-to-end encrypted email with quantum-resistant encryption',
    privacyDetails: [
      'End-to-end encryption by default',
      'Encrypts subject lines (unlike most providers)',
      'Quantum-resistant encryption in development',
      'Based in Germany with strong privacy laws',
      'Open source and independently audited'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  {
    id: 'mailbox-org',
    name: 'Mailbox.org',
    description: 'German email provider focused on privacy and sustainability. Supports standard protocols like IMAP/POP3.',
    homepage: 'https://mailbox.org',
    privacyRating: 'good',
    privacyNote: 'Privacy-focused with standard email protocol support',
    privacyDetails: [
      'PGP encryption support',
      'Standard protocols (IMAP, POP3, CalDAV)',
      'Powered by 100% renewable energy',
      'Based in Germany',
      'No free tier but affordable'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  }
]

// =============================================================================
// CLOUD STORAGE
// =============================================================================

const cloudIntro: WikiIntroSection = {
  title: 'Cloud Storage',
  description: 'Cloud storage lets you access your files from anywhere, but most providers can read your files and may share them with governments or third parties.',
  concerns: {
    heading: 'Privacy Concerns with Mainstream Cloud',
    points: [
      'Files stored unencrypted on provider servers',
      'Providers can scan and access your files',
      'Data shared with law enforcement on request',
      'Files may be used for AI training'
    ]
  },
  benefits: {
    heading: 'What Privacy-Focused Providers Offer',
    points: [
      'End-to-end encryption before files leave your device',
      'Zero-knowledge architecture - provider cannot access',
      'No file scanning or content analysis',
      'Secure sharing without compromising encryption'
    ]
  }
}

const cloudServices: WikiService[] = [
  // Mainstream Services
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: '15GB free storage integrated with Google Workspace. Widely used for document collaboration.',
    homepage: 'https://drive.google.com',
    privacyRating: 'avoid',
    privacyNote: 'Google can access and scan all your files',
    privacyDetails: [
      'Files are not end-to-end encrypted',
      'Google scans files for various purposes',
      'Data used to build user profiles',
      'Subject to US surveillance laws',
      'Files may be used for AI training'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'icloud-drive',
    name: 'iCloud Drive',
    description: 'Apple\'s cloud storage with 5GB free. Deep integration with Apple devices.',
    homepage: 'https://www.icloud.com',
    privacyRating: 'caution',
    privacyNote: 'Advanced Data Protection available but not default',
    privacyDetails: [
      'Standard: Not end-to-end encrypted (Apple can access)',
      'Advanced Data Protection: E2E encrypted (opt-in)',
      'No file scanning for ads',
      'Subject to US surveillance laws',
      'Better privacy than Google but not perfect by default'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Microsoft\'s cloud storage with 5GB free. Integrated with Windows and Microsoft 365.',
    homepage: 'https://onedrive.com',
    privacyRating: 'caution',
    privacyNote: 'Personal Vault feature offers better security for some files',
    privacyDetails: [
      'Not end-to-end encrypted by default',
      'Personal Vault offers additional protection',
      'Subject to US surveillance laws',
      'Files may be scanned',
      'Business plans offer more encryption options'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Popular cloud storage with 2GB free. Known for easy file syncing and sharing.',
    homepage: 'https://dropbox.com',
    privacyRating: 'caution',
    privacyNote: 'Not end-to-end encrypted; company can access files',
    privacyDetails: [
      'Not end-to-end encrypted',
      'Dropbox can access your files',
      'Has had security breaches in the past',
      'Subject to US surveillance laws',
      'Shares data with third parties'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'proton-drive',
    name: 'Proton Drive',
    description: 'End-to-end encrypted cloud storage from the makers of Proton Mail. Integrates with Proton ecosystem.',
    homepage: 'https://proton.me/drive',
    privacyRating: 'good',
    privacyNote: 'True end-to-end encryption with zero-access architecture',
    privacyDetails: [
      'End-to-end encrypted - Proton cannot access files',
      'Zero-knowledge architecture',
      'Based in Switzerland',
      'Open source and audited',
      'Free tier with 1GB (more with Proton plans)'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'tresorit',
    name: 'Tresorit',
    description: 'Swiss-Hungarian enterprise-grade encrypted cloud storage with strong compliance features.',
    homepage: 'https://tresorit.com',
    privacyRating: 'good',
    privacyNote: 'End-to-end encrypted with independent security audits',
    privacyDetails: [
      'End-to-end encryption',
      'Zero-knowledge architecture',
      'Independently audited',
      'GDPR compliant',
      'No free tier but strong security'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  {
    id: 'cryptomator',
    name: 'Cryptomator',
    description: 'Open-source encryption for any cloud storage. Encrypt files before uploading to Google Drive, Dropbox, etc.',
    homepage: 'https://cryptomator.org',
    privacyRating: 'good',
    privacyNote: 'Add encryption to any existing cloud storage',
    privacyDetails: [
      'Client-side encryption',
      'Works with any cloud provider',
      'Open source and audited',
      'Free for desktop',
      'One-time purchase for mobile'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  }
]

// =============================================================================
// PASSWORD MANAGERS
// =============================================================================

const passwordIntro: WikiIntroSection = {
  title: 'Password Managers',
  description: 'Password managers store all your passwords securely, encrypted with a master password. Using unique, strong passwords for every account is the most effective protection against data breaches.',
  concerns: {
    heading: 'Why You Need a Password Manager',
    points: [
      'Remember one master password instead of hundreds',
      'Generate strong, unique passwords for every account',
      'Protect against phishing with autofill',
      'Securely share passwords when needed'
    ]
  },
  benefits: {
    heading: 'What to Look For',
    points: [
      'End-to-end encryption with your master password',
      'Zero-knowledge - provider cannot access your vault',
      'Regular independent security audits',
      'Cross-platform access on all devices'
    ]
  }
}

const passwordServices: WikiService[] = [
  // Mainstream / Built-in Options
  {
    id: 'chrome-passwords',
    name: 'Chrome Password Manager',
    description: 'Built into Google Chrome browser. Syncs with Google account.',
    homepage: 'https://passwords.google.com',
    privacyRating: 'caution',
    privacyNote: 'Convenient but ties passwords to Google ecosystem',
    privacyDetails: [
      'Tied to Google account and ecosystem',
      'Not zero-knowledge - Google can potentially access',
      'Encryption improved in recent years',
      'Limited features compared to dedicated managers',
      'No secure sharing or organization features'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'apple-keychain',
    name: 'Apple Keychain / Passwords',
    description: 'Built into Apple devices. End-to-end encrypted with iCloud Keychain.',
    homepage: 'https://support.apple.com/guide/iphone/use-the-passwords-app-iphf9219f238/ios',
    privacyRating: 'acceptable',
    privacyNote: 'End-to-end encrypted but limited to Apple ecosystem',
    privacyDetails: [
      'End-to-end encrypted with iCloud Keychain',
      'Zero-knowledge architecture',
      'Limited to Apple devices only',
      'Basic features - no secure sharing',
      'Good for Apple-only users'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'lastpass',
    name: 'LastPass',
    description: 'Popular cloud-based password manager. Has had multiple security breaches.',
    homepage: 'https://lastpass.com',
    privacyRating: 'avoid',
    privacyNote: 'Multiple serious security breaches in 2022-2023',
    privacyDetails: [
      'Major breaches exposed encrypted vaults',
      'Attackers obtained user vault data',
      'Some unencrypted metadata exposed',
      'Trust significantly damaged',
      'Not recommended - switch to alternatives'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'bitwarden',
    name: 'Bitwarden (Self-Hosted)',
    description: 'Open-source password manager with free and premium tiers. Self-hosting gives maximum control.',
    homepage: 'https://bitwarden.com',
    privacyRating: 'good',
    privacyNote: 'Open source, audited - self-hosting for maximum control',
    privacyDetails: [
      'Fully open source client and server',
      'End-to-end encrypted',
      'Regular security audits',
      'Self-hosted for full data control',
      'Recommended for advanced users'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  {
    id: '1password',
    name: '1Password',
    description: 'Premium password manager known for security and user experience. Popular with businesses.',
    homepage: 'https://1password.com',
    privacyRating: 'good',
    privacyNote: 'Strong security with excellent user experience',
    privacyDetails: [
      'End-to-end encrypted with Secret Key',
      'Regular third-party security audits',
      'No free tier but excellent features',
      'Watchtower alerts for breaches',
      'Travel Mode for border crossings'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  {
    id: 'proton-pass',
    name: 'Proton Pass',
    description: 'Password manager from Proton with integrated email aliases. Part of Proton ecosystem.',
    homepage: 'https://proton.me/pass',
    privacyRating: 'good',
    privacyNote: 'End-to-end encrypted with email alias integration',
    privacyDetails: [
      'End-to-end encrypted',
      'Integrated hide-my-email aliases',
      'Open source',
      'Part of Proton ecosystem',
      'Free tier available'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'keepassxc',
    name: 'KeePassXC',
    description: 'Offline password manager. Database stored locally and encrypted. Fully open source.',
    homepage: 'https://keepassxc.org',
    privacyRating: 'good',
    privacyNote: 'Fully offline - you control the encrypted database file',
    privacyDetails: [
      'Completely offline - no cloud dependency',
      'You control the database file',
      'Strong AES-256 encryption',
      'Fully open source',
      'Free forever'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  }
]

// =============================================================================
// VPN SERVICES
// =============================================================================

const vpnIntro: WikiIntroSection = {
  title: 'VPN Services',
  description: 'A VPN encrypts your internet connection and hides your IP address from websites. It protects you on public WiFi and can help bypass geographic restrictions.',
  concerns: {
    heading: 'When You Need a VPN',
    points: [
      'On public WiFi networks',
      'Hiding your IP address from websites',
      'Bypassing censorship or geo-restrictions',
      'Preventing ISP from seeing your browsing'
    ]
  },
  benefits: {
    heading: 'What to Look For',
    points: [
      'No-logs policy - provider does not store activity',
      'Independent audits - third-party verification',
      'Strong encryption with WireGuard or OpenVPN',
      'Owned infrastructure - provider controls servers'
    ]
  }
}

const vpnServices: WikiService[] = [
  // Consumer VPNs with Privacy Concerns
  {
    id: 'nordvpn',
    name: 'NordVPN',
    description: 'Popular VPN with large server network. Heavy marketing presence.',
    homepage: 'https://nordvpn.com',
    privacyRating: 'caution',
    privacyNote: 'Commercial VPN with some privacy concerns',
    privacyDetails: [
      'Owned by Kape Technologies (controversial history)',
      'Has had server breaches in the past',
      'Heavy marketing and affiliate programs',
      'No-logs audits performed',
      'Based in Panama'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    description: 'Premium VPN service. Acquired by Kape Technologies.',
    homepage: 'https://expressvpn.com',
    privacyRating: 'caution',
    privacyNote: 'Concerns after acquisition by Kape Technologies',
    privacyDetails: [
      'Acquired by Kape Technologies in 2021',
      'Previously had good reputation',
      'CTO was linked to UAE surveillance project',
      'Expensive compared to alternatives',
      'Based in British Virgin Islands'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'surfshark',
    name: 'Surfshark',
    description: 'Budget VPN with unlimited connections. Merged with Nord Security.',
    homepage: 'https://surfshark.com',
    privacyRating: 'caution',
    privacyNote: 'Part of Nord Security group',
    privacyDetails: [
      'Merged with Nord Security',
      'Aggressive marketing',
      'Unlimited device connections',
      'Has undergone audits',
      'Based in Netherlands'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'proton-vpn',
    name: 'Proton VPN',
    description: 'Swiss VPN from Proton with a free tier. Strong focus on privacy and transparency.',
    homepage: 'https://protonvpn.com',
    privacyRating: 'good',
    privacyNote: 'Transparent, audited, with a functional free tier',
    privacyDetails: [
      'No-logs policy independently audited',
      'Based in Switzerland',
      'Open source apps',
      'Free tier with no data limits',
      'Part of trusted Proton ecosystem'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'mullvad',
    name: 'Mullvad VPN',
    description: 'Swedish VPN with anonymous accounts. No email or personal info required.',
    homepage: 'https://mullvad.net',
    privacyRating: 'good',
    privacyNote: 'Maximum anonymity with account numbers instead of emails',
    privacyDetails: [
      'Account numbers instead of personal info',
      'Accepts cash payments by mail',
      'No email required',
      'Own server infrastructure',
      'Regular third-party audits'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  {
    id: 'ivpn',
    name: 'IVPN',
    description: 'Premium privacy-focused VPN. Transparent about limitations of VPNs.',
    homepage: 'https://ivpn.net',
    privacyRating: 'good',
    privacyNote: 'Honest and transparent about what VPNs can and cannot do',
    privacyDetails: [
      'Transparent about VPN limitations',
      'Independent security audits',
      'Open source apps',
      'No email required for signup',
      'Based in Gibraltar'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  }
]

// =============================================================================
// MESSAGING APPS
// =============================================================================

const messagingIntro: WikiIntroSection = {
  title: 'Messaging Apps',
  description: 'Your private conversations should stay private. Many popular messaging apps do not offer end-to-end encryption by default, meaning the company can read your messages.',
  concerns: {
    heading: 'Understanding Encryption',
    points: [
      'End-to-end encrypted - only you and recipient can read',
      'Encrypted in transit - company can still read on servers',
      'Not encrypted - anyone with server access can read',
      'Metadata (who, when, how often) also reveals a lot'
    ]
  },
  benefits: {
    heading: 'What to Look For',
    points: [
      'End-to-end encryption enabled by default',
      'Minimal metadata collection',
      'Open source and independently audited',
      'No phone number required (optional)'
    ]
  }
}

const messagingServices: WikiService[] = [
  // Mainstream Messaging Apps
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Most popular messaging app globally. Owned by Meta (Facebook).',
    homepage: 'https://whatsapp.com',
    privacyRating: 'caution',
    privacyNote: 'End-to-end encrypted but owned by Meta with metadata collection',
    privacyDetails: [
      'Messages are end-to-end encrypted',
      'Metadata shared with Meta ecosystem',
      'Phone number required',
      'Cloud backups may not be encrypted by default',
      'Owned by Meta (Facebook) - privacy concerns'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    description: 'Meta\'s messaging platform. E2E encryption is opt-in, not default.',
    homepage: 'https://messenger.com',
    privacyRating: 'avoid',
    privacyNote: 'Not end-to-end encrypted by default; extensive tracking',
    privacyDetails: [
      'E2E encryption only in "Secret Conversations"',
      'Regular chats fully accessible to Meta',
      'Extensive data collection and tracking',
      'Integrated with Facebook\'s ad ecosystem',
      'Very poor privacy choice'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'imessage',
    name: 'iMessage',
    description: 'Apple\'s messaging service. End-to-end encrypted between Apple devices.',
    homepage: 'https://support.apple.com/messages',
    privacyRating: 'acceptable',
    privacyNote: 'End-to-end encrypted but only between Apple devices',
    privacyDetails: [
      'E2E encrypted between Apple devices',
      'Falls back to SMS (unencrypted) with non-Apple',
      'iCloud backup may include messages (unless disabled)',
      'Closed source - not auditable',
      'Good for Apple-to-Apple communication'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Popular messaging app with large groups. NOT end-to-end encrypted by default.',
    homepage: 'https://telegram.org',
    privacyRating: 'caution',
    privacyNote: 'Regular chats NOT encrypted - only Secret Chats are E2E',
    privacyDetails: [
      'Regular chats are NOT end-to-end encrypted',
      'Only "Secret Chats" have E2E (and limited features)',
      'Server stores all regular chat history',
      'Uses custom MTProto (not well-audited)',
      'Often incorrectly believed to be secure'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Popular for gaming and communities. No end-to-end encryption.',
    homepage: 'https://discord.com',
    privacyRating: 'avoid',
    privacyNote: 'No encryption - Discord can read all messages',
    privacyDetails: [
      'No end-to-end encryption',
      'Discord reads messages for moderation',
      'All messages stored on Discord servers',
      'Extensive data collection',
      'Not designed for private communication'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'sms',
    name: 'SMS / Text Messages',
    description: 'Traditional text messaging. Completely unencrypted.',
    homepage: '',
    privacyRating: 'avoid',
    privacyNote: 'Completely unencrypted and easily intercepted',
    privacyDetails: [
      'No encryption whatsoever',
      'Carrier stores all messages',
      'Easily intercepted',
      'Government can access without your knowledge',
      'Only use when no alternative exists'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'signal',
    name: 'Signal',
    description: 'Gold standard for private messaging. Open source, non-profit, minimal metadata.',
    homepage: 'https://signal.org',
    privacyRating: 'good',
    privacyNote: 'Best combination of security, privacy, and usability',
    privacyDetails: [
      'End-to-end encrypted by default',
      'Minimal metadata collection',
      'Signal Protocol is the gold standard',
      'Open source and audited',
      'Non-profit organization'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'simplex',
    name: 'SimpleX Chat',
    description: 'No user identifiers. Doesn\'t use phone numbers, usernames, or any IDs.',
    homepage: 'https://simplex.chat',
    privacyRating: 'good',
    privacyNote: 'Maximum privacy with no user identifiers at all',
    privacyDetails: [
      'No phone number or user ID required',
      'Decentralized architecture',
      'Strongest metadata protection',
      'Open source',
      'Can run your own server'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  {
    id: 'session',
    name: 'Session',
    description: 'Decentralized messenger. No phone number required.',
    homepage: 'https://getsession.org',
    privacyRating: 'good',
    privacyNote: 'Onion-routed messages with no phone number required',
    privacyDetails: [
      'No phone number needed',
      'Onion routing hides metadata',
      'Decentralized network',
      'Open source',
      'Session IDs instead of usernames'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  }
]

// =============================================================================
// DESKTOP BROWSERS
// =============================================================================

const desktopBrowserIntro: WikiIntroSection = {
  title: 'Desktop Browsers',
  description: 'Your browser is your window to the internet - and potentially your biggest privacy risk. Mainstream browsers track your activity for advertising purposes.',
  concerns: {
    heading: 'The Tracking Problem',
    points: [
      'Third-party cookies track you across sites',
      'Browser fingerprinting identifies you uniquely',
      'Telemetry data sent to browser vendor',
      'Every click and search can be logged'
    ]
  },
  benefits: {
    heading: 'What to Look For',
    points: [
      'Built-in tracking protection that blocks by default',
      'Anti-fingerprinting to look like other users',
      'Privacy-focused defaults out of the box',
      'Open source and auditable code'
    ]
  }
}

const desktopBrowserServices: WikiService[] = [
  // Mainstream Browsers
  {
    id: 'chrome',
    name: 'Google Chrome',
    description: 'Most popular browser. Made by Google for the Google advertising ecosystem.',
    homepage: 'https://google.com/chrome',
    privacyRating: 'avoid',
    privacyNote: 'Designed to collect data for Google\'s ad business',
    privacyDetails: [
      'Extensive telemetry sent to Google',
      'Facilitates cross-site tracking',
      'Sync ties browsing to Google account',
      'Removing third-party cookies replaced by Topics API',
      'Not designed with privacy in mind'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    description: 'Default Windows browser. Chromium-based with Microsoft services.',
    homepage: 'https://microsoft.com/edge',
    privacyRating: 'caution',
    privacyNote: 'Slightly better than Chrome but still significant telemetry',
    privacyDetails: [
      'Heavy telemetry to Microsoft',
      'Promotes Microsoft services aggressively',
      'Some tracking protection built-in',
      'Chromium-based with Microsoft additions',
      'Default tracking prevention is weak'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'safari',
    name: 'Safari',
    description: 'Apple\'s browser. Better privacy than Chrome but still some concerns.',
    homepage: 'https://apple.com/safari',
    privacyRating: 'acceptable',
    privacyNote: 'Better privacy than Chrome/Edge but closed source',
    privacyDetails: [
      'Intelligent Tracking Prevention',
      'Privacy Report shows blocked trackers',
      'Closed source - not auditable',
      'Some telemetry to Apple',
      'Good default privacy settings'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'firefox',
    name: 'Firefox',
    description: 'Independent browser from Mozilla. Open source with strong privacy features.',
    homepage: 'https://firefox.com',
    privacyRating: 'good',
    privacyNote: 'Best mainstream browser for privacy with customization options',
    privacyDetails: [
      'Enhanced Tracking Protection by default',
      'Total Cookie Protection isolates sites',
      'Open source and auditable',
      'Independent from big tech',
      'Highly customizable privacy settings'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'brave',
    name: 'Brave',
    description: 'Privacy-focused Chromium browser with built-in ad blocking.',
    homepage: 'https://brave.com',
    privacyRating: 'good',
    privacyNote: 'Strong privacy defaults with Chromium compatibility',
    privacyDetails: [
      'Aggressive tracker and ad blocking',
      'Fingerprinting protection',
      'Chromium base for compatibility',
      'Optional crypto features (can be disabled)',
      'Shields provide easy privacy control'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'mullvad-browser',
    name: 'Mullvad Browser',
    description: 'Tor Browser technology without Tor network. Maximum fingerprinting protection.',
    homepage: 'https://mullvad.net/browser',
    privacyRating: 'good',
    privacyNote: 'Tor Browser anti-fingerprinting without the Tor network',
    privacyDetails: [
      'Based on Tor Browser',
      'Strongest anti-fingerprinting',
      'Designed to look identical to other users',
      'Partnership with Tor Project',
      'No account or login required'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  {
    id: 'tor-browser',
    name: 'Tor Browser',
    description: 'The only truly anonymous browser. Routes traffic through the Tor network.',
    homepage: 'https://torproject.org',
    privacyRating: 'good',
    privacyNote: 'Maximum anonymity through Tor network routing',
    privacyDetails: [
      'Routes all traffic through Tor network',
      'Strong anti-fingerprinting',
      'Hides IP address from all websites',
      'Essential for high-risk users',
      'Slower than regular browsers'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  }
]

// =============================================================================
// MOBILE BROWSERS
// =============================================================================

const mobileBrowserIntro: WikiIntroSection = {
  title: 'Mobile Browsers',
  description: 'Mobile browsers face unique challenges including platform restrictions (especially iOS) and deep integration with location services.',
  concerns: {
    heading: 'iOS Limitations',
    points: [
      'All iOS browsers must use Apple WebKit engine',
      'Safari, Chrome, Firefox, Brave on iOS are all WebKit-based',
      'Privacy differences limited to UI and defaults',
      'Full browser features only available on Android'
    ]
  },
  benefits: {
    heading: 'Android Advantages',
    points: [
      'Android allows full browser engines',
      'Firefox and Brave provide full privacy features',
      'Extension support on Firefox for Android',
      'More control over browser behavior'
    ]
  }
}

const mobileBrowserServices: WikiService[] = [
  // Mainstream Mobile Browsers
  {
    id: 'chrome-mobile',
    name: 'Chrome (Mobile)',
    description: 'Google\'s mobile browser. Same privacy concerns as desktop version.',
    homepage: 'https://google.com/chrome',
    privacyRating: 'avoid',
    privacyNote: 'Same tracking as desktop Chrome, plus location data',
    privacyDetails: [
      'Extensive data collection',
      'Location tracking integrated',
      'Syncs with Google account',
      'Default on many Android devices',
      'Not recommended for privacy'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'safari-mobile',
    name: 'Safari (iOS)',
    description: 'Apple\'s mobile browser and the only full browser engine on iOS.',
    homepage: 'https://apple.com/safari',
    privacyRating: 'acceptable',
    privacyNote: 'Best built-in option on iOS due to platform restrictions',
    privacyDetails: [
      'Intelligent Tracking Prevention',
      'All iOS browsers use Safari\'s engine',
      'Better than Chrome but not perfect',
      'Privacy Report feature',
      'Closed source'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'brave-mobile',
    name: 'Brave (Mobile)',
    description: 'Privacy-focused mobile browser. Full features on Android, WebKit-based on iOS.',
    homepage: 'https://brave.com',
    privacyRating: 'good',
    privacyNote: 'Best privacy on Android; good defaults on iOS',
    privacyDetails: [
      'Built-in ad and tracker blocking',
      'Full Brave engine on Android',
      'Uses WebKit on iOS (Apple requirement)',
      'Easy-to-use Shields toggle',
      'Available on both platforms'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'firefox-mobile',
    name: 'Firefox (Mobile)',
    description: 'Mozilla\'s mobile browser. Full engine on Android with extension support.',
    homepage: 'https://mozilla.org/firefox/mobile',
    privacyRating: 'good',
    privacyNote: 'Full Firefox on Android with uBlock Origin support',
    privacyDetails: [
      'Extension support on Android (uBlock Origin)',
      'Enhanced Tracking Protection',
      'Full Firefox engine on Android',
      'WebKit on iOS (Apple requirement)',
      'Open source'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'duckduckgo-browser',
    name: 'DuckDuckGo Browser',
    description: 'Privacy-focused browser from DuckDuckGo. Simple and effective.',
    homepage: 'https://duckduckgo.com/app',
    privacyRating: 'good',
    privacyNote: 'Simple privacy browser with fire button to clear data',
    privacyDetails: [
      'Tracker blocking built-in',
      'Fire Button clears all data instantly',
      'Email protection integration',
      'Simple and user-friendly',
      'Good for privacy beginners'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'cromite',
    name: 'Cromite (Android)',
    description: 'Chromium fork with ad blocking and privacy enhancements. Android only.',
    homepage: 'https://github.com/nicofrom/nicofrom/releases',
    privacyRating: 'good',
    privacyNote: 'Hardened Chromium with built-in ad blocking',
    privacyDetails: [
      'Based on Chromium',
      'Built-in ad and tracker blocking',
      'Privacy enhancements',
      'Android only',
      'Open source'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  }
]

// =============================================================================
// SEARCH ENGINES
// =============================================================================

const searchIntro: WikiIntroSection = {
  title: 'Search Engines',
  description: 'Your search queries reveal your interests, concerns, health issues, and deepest questions. Mainstream search engines log every search tied to your identity.',
  concerns: {
    heading: 'The Google Problem',
    points: [
      'Logs every search query you make',
      'Links searches to your Google account',
      'Builds detailed profiles for advertising',
      'Tracks you across the web with Google Analytics'
    ]
  },
  benefits: {
    heading: 'Privacy Alternatives',
    points: [
      'Do not log searches at all',
      'Use independent search index (not Google/Bing)',
      'Proxy results from Google without tracking',
      'No advertising profiles built from your searches'
    ]
  }
}

const searchServices: WikiService[] = [
  // Mainstream Search Engines
  {
    id: 'google-search',
    name: 'Google Search',
    description: 'Dominant search engine. Extensive tracking and profiling.',
    homepage: 'https://google.com',
    privacyRating: 'avoid',
    privacyNote: 'Logs all searches and builds advertising profiles',
    privacyDetails: [
      'Logs every search query',
      'Links to Google account',
      'Builds detailed advertising profiles',
      'Search history used across Google services',
      'Tracks you with Google Analytics on other sites'
    ],
    privacyGuidesRecommended: false
  },
  {
    id: 'bing',
    name: 'Bing',
    description: 'Microsoft\'s search engine. Powers Copilot AI.',
    homepage: 'https://bing.com',
    privacyRating: 'caution',
    privacyNote: 'Better than Google but still significant tracking',
    privacyDetails: [
      'Logs searches',
      'Links to Microsoft account',
      'Less pervasive than Google',
      'Powers various search features',
      'Not recommended for privacy'
    ],
    privacyGuidesRecommended: false
  },
  // Privacy-Focused Recommendations
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'Popular private search engine. Doesn\'t track you or build profiles.',
    homepage: 'https://duckduckgo.com',
    privacyRating: 'good',
    privacyNote: 'Doesn\'t track you; good results using Bing index',
    privacyDetails: [
      'Doesn\'t log searches',
      'No user profiles',
      'Uses Bing index primarily',
      'Bangs for quick site searches',
      'Based in US but strong privacy focus'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Independent search index. Doesn\'t track and has its own web index.',
    homepage: 'https://search.brave.com',
    privacyRating: 'good',
    privacyNote: 'Independent index without tracking',
    privacyDetails: [
      'Own independent search index',
      'Doesn\'t track users',
      'No Google/Bing dependency option',
      'Goggles for custom ranking',
      'Growing in quality'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'startpage',
    name: 'Startpage',
    description: 'Google results without tracking. Anonymous View for browsing sites privately.',
    homepage: 'https://startpage.com',
    privacyRating: 'good',
    privacyNote: 'Google results without the tracking',
    privacyDetails: [
      'Proxies Google results anonymously',
      'No logging or tracking',
      'Anonymous View feature',
      'Based in Netherlands (GDPR)',
      'Google-quality results privately'
    ],
    privacyGuidesRecommended: true,
    difficulty: 1
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    description: 'Open-source metasearch engine. Can be self-hosted.',
    homepage: 'https://docs.searxng.org',
    privacyRating: 'good',
    privacyNote: 'Open source and self-hostable metasearch',
    privacyDetails: [
      'Aggregates results from multiple engines',
      'Self-hostable for full control',
      'Open source',
      'No tracking',
      'Many public instances available'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  }
]

// =============================================================================
// DESKTOP OPERATING SYSTEMS
// =============================================================================

const desktopOsIntro: WikiIntroSection = {
  title: 'Desktop Operating Systems',
  description: 'Your operating system is the foundation of your digital privacy. It controls what data is collected, how apps behave, and what telemetry is sent to the vendor.',
  concerns: {
    heading: 'Privacy Concerns with Mainstream Operating Systems',
    points: [
      'Built-in telemetry sends usage data to vendors',
      'Default settings often prioritize convenience over privacy',
      'Integration with cloud services can expose personal data',
      'Advertising IDs and tracking mechanisms built into the system'
    ]
  },
  benefits: {
    heading: 'What Privacy-Focused Operating Systems Offer',
    points: [
      'Minimal or no telemetry - your usage stays private',
      'Open source code - independently verifiable security',
      'User control - you decide what data leaves your device',
      'Strong isolation - compartmentalization of apps and data'
    ]
  }
}

const desktopOsServices: WikiService[] = [
  // Windows
  {
    id: 'windows',
    name: 'Windows 11/10',
    description: 'Microsoft\'s mainstream operating system, widely used for gaming, productivity, and general computing.',
    homepage: 'https://www.microsoft.com/windows',
    privacyRating: 'caution',
    privacyNote: 'Extensive telemetry and data collection enabled by default',
    privacyDetails: [
      'Telemetry cannot be fully disabled in Home edition',
      'Advertising ID used for targeted advertising',
      'Cortana and Bing integration collect usage data',
      'OneDrive backup enabled by default on new installations',
      'Recall feature can screenshot everything you see',
      'Privacy can be improved with Group Policy settings (Pro/Enterprise)'
    ],
    privacyGuidesRecommended: false
  },
  // macOS
  {
    id: 'macos',
    name: 'macOS',
    description: 'Apple\'s desktop operating system for Mac computers, offering strong hardware-software integration and security features.',
    homepage: 'https://www.apple.com/macos',
    privacyRating: 'acceptable',
    privacyNote: 'Better than Windows but still has telemetry concerns',
    privacyDetails: [
      'App revocation checks (OCSP) reveal which apps you open',
      'iCloud integration stores data on Apple servers by default',
      'Siri and Spotlight can send data to Apple',
      'Advanced Data Protection encrypts most iCloud data E2E',
      'FileVault provides strong disk encryption',
      'Gatekeeper and XProtect provide malware protection'
    ],
    privacyGuidesRecommended: false
  },
  // Linux - General
  {
    id: 'linux',
    name: 'Linux (Ubuntu, Fedora, etc.)',
    description: 'Open-source operating system family with many distributions, offering maximum user control and privacy.',
    homepage: 'https://kernel.org',
    privacyRating: 'good',
    privacyNote: 'Open source with minimal telemetry and maximum user control',
    privacyDetails: [
      'Most distributions have no telemetry',
      'Open source - fully auditable code',
      'Full disk encryption with LUKS',
      'User controls all aspects of the system',
      'Flatpak provides app sandboxing',
      'Rolling release distros get faster security updates'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  // Fedora
  {
    id: 'fedora',
    name: 'Fedora Workstation',
    description: 'A cutting-edge Linux distribution sponsored by Red Hat, known for security and latest software.',
    homepage: 'https://fedoraproject.org',
    privacyRating: 'good',
    privacyNote: 'Privacy-focused with SELinux and modern security features',
    privacyDetails: [
      'SELinux mandatory access control enabled by default',
      'ZRAM instead of swap for sensitive memory data',
      'Regular security updates',
      'Wayland display server for better isolation',
      'Microcode updates included by default',
      'Strong community and Red Hat backing'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  // Fedora Silverblue
  {
    id: 'fedora-silverblue',
    name: 'Fedora Silverblue',
    description: 'An immutable variant of Fedora with atomic updates and container-based app delivery.',
    homepage: 'https://fedoraproject.org/silverblue',
    privacyRating: 'good',
    privacyNote: 'Immutable system with atomic updates for reliability and security',
    privacyDetails: [
      'Immutable base system prevents tampering',
      'Atomic updates can be rolled back',
      'Apps run in Flatpak containers',
      'All Fedora security features included',
      'OSTree-based updates',
      'Great for security-conscious users'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  // openSUSE Tumbleweed
  {
    id: 'opensuse-tumbleweed',
    name: 'openSUSE Tumbleweed',
    description: 'A rolling-release Linux distribution with advanced YaST configuration and Btrfs snapshots.',
    homepage: 'https://www.opensuse.org/tumbleweed',
    privacyRating: 'good',
    privacyNote: 'Rolling release with strong security defaults',
    privacyDetails: [
      'SELinux or AppArmor available',
      'Btrfs snapshots for system recovery',
      'Rolling release for latest security fixes',
      'YaST provides easy security configuration',
      'Strong encryption options',
      'Supported by SUSE'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  // Qubes OS
  {
    id: 'qubes',
    name: 'Qubes OS',
    description: 'A security-focused operating system that isolates everything in separate virtual machines (qubes).',
    homepage: 'https://www.qubes-os.org',
    privacyRating: 'good',
    privacyNote: 'Maximum security through compartmentalization',
    privacyDetails: [
      'Each app runs in isolated virtual machine',
      'Compromised qube cannot affect others',
      'Whonix integration for Tor routing',
      'Color-coded security domains',
      'Disposable qubes for untrusted activities',
      'Recommended by security experts'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  // Tails
  {
    id: 'tails',
    name: 'Tails',
    description: 'A portable operating system that routes all traffic through Tor and leaves no trace.',
    homepage: 'https://tails.net',
    privacyRating: 'good',
    privacyNote: 'Amnesic live system for maximum anonymity',
    privacyDetails: [
      'Routes all traffic through Tor',
      'Leaves no trace on host computer',
      'Runs from USB drive',
      'Amnesic - forgets everything on shutdown',
      'Built-in encryption tools',
      'Designed for high-risk users'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  // Whonix
  {
    id: 'whonix',
    name: 'Whonix',
    description: 'A security-hardened Debian-based OS designed to run inside a VM with all traffic routed through Tor.',
    homepage: 'https://www.whonix.org',
    privacyRating: 'good',
    privacyNote: 'Tor-based OS for anonymous computing',
    privacyDetails: [
      'All traffic forced through Tor',
      'IP/DNS leak protection',
      'Stream isolation',
      'Can run inside Qubes OS',
      'Debian-based stability',
      'Protection against even malware revealing IP'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  // Other desktop OS
  {
    id: 'other-desktop',
    name: 'Other (BSD, self-built)',
    description: 'Alternative operating systems like FreeBSD, OpenBSD, or custom-built systems.',
    homepage: 'https://www.openbsd.org',
    privacyRating: 'acceptable',
    privacyNote: 'Privacy depends on specific OS and configuration',
    privacyDetails: [
      'BSD systems known for security focus',
      'OpenBSD prioritizes correctness and security',
      'FreeBSD offers strong security features',
      'Self-built systems require expertise',
      'May lack software compatibility',
      'Often used by security professionals'
    ],
    privacyGuidesRecommended: false
  }
]

// =============================================================================
// MOBILE OPERATING SYSTEMS
// =============================================================================

const mobileOsIntro: WikiIntroSection = {
  title: 'Mobile Operating Systems',
  description: 'Your phone\'s operating system has constant access to your location, contacts, and daily activities. Choosing a privacy-respecting mobile OS is crucial.',
  concerns: {
    heading: 'Privacy Concerns with Mobile Operating Systems',
    points: [
      'Location tracking and movement history',
      'App permissions often over-requested',
      'Cloud sync can expose personal data',
      'Advertising identifiers track you across apps'
    ]
  },
  benefits: {
    heading: 'What Privacy-Focused Mobile Systems Offer',
    points: [
      'Sandboxed Google Play for Android compatibility without Google tracking',
      'Granular permission controls',
      'Minimal data collection and telemetry',
      'Regular security updates without forced account requirements'
    ]
  }
}

const mobileOsServices: WikiService[] = [
  // Stock Android
  {
    id: 'android',
    name: 'Android (Stock)',
    description: 'Google\'s mobile operating system, used on most non-Apple smartphones worldwide.',
    homepage: 'https://www.android.com',
    privacyRating: 'caution',
    privacyNote: 'Strong security but significant Google tracking on stock ROMs',
    privacyDetails: [
      'Google Play Services tracks location and usage',
      'Advertising ID used across all apps',
      'Strong app sandboxing and permissions',
      'Verified boot ensures system integrity',
      'Monthly security updates (for supported devices)',
      'Privacy can be improved with custom ROMs'
    ],
    privacyGuidesRecommended: false
  },
  // iOS
  {
    id: 'ios',
    name: 'iOS',
    description: 'Apple\'s mobile operating system for iPhone, known for strong security and privacy features.',
    homepage: 'https://www.apple.com/ios',
    privacyRating: 'acceptable',
    privacyNote: 'Good privacy defaults but limited user control',
    privacyDetails: [
      'App Tracking Transparency blocks cross-app tracking',
      'Private Relay hides browsing from ISPs (iCloud+)',
      'Strong hardware security with Secure Enclave',
      'Activation Lock requires internet check with Apple',
      'App Store is only source for apps',
      'Telemetry sent even when analytics disabled'
    ],
    privacyGuidesRecommended: false
  },
  // GrapheneOS
  {
    id: 'grapheneos',
    name: 'GrapheneOS',
    description: 'A privacy and security focused mobile OS with Android app compatibility, designed for Pixel devices.',
    homepage: 'https://grapheneos.org',
    privacyRating: 'good',
    privacyNote: 'Hardened Android with sandboxed Google Play option',
    privacyDetails: [
      'Sandboxed Google Play - use Android apps without Google tracking',
      'Hardened memory allocator',
      'Network and sensor permissions',
      'Per-contact permissions',
      'Exploit mitigations beyond stock Android',
      'Regular security updates',
      'No Google account required'
    ],
    privacyGuidesRecommended: true,
    difficulty: 2
  },
  // DivestOS
  {
    id: 'divestos',
    name: 'DivestOS',
    description: 'A privacy-focused Android fork supporting older devices with extended security patches.',
    homepage: 'https://divestos.org',
    privacyRating: 'good',
    privacyNote: 'Security patches for older Android devices',
    privacyDetails: [
      'Supports many older devices',
      'Extended security support',
      'Based on LineageOS',
      'Includes F-Droid by default',
      'Debloated from tracking',
      'Good option for device reuse'
    ],
    privacyGuidesRecommended: true,
    difficulty: 3
  },
  // Other mobile
  {
    id: 'other-mobile',
    name: 'Other (feature phone, custom ROM)',
    description: 'Feature phones, dumb phones, or other custom Android ROMs like LineageOS.',
    homepage: 'https://lineageos.org',
    privacyRating: 'acceptable',
    privacyNote: 'Privacy varies widely depending on choice',
    privacyDetails: [
      'Feature phones have minimal tracking',
      'LineageOS removes Google but lacks verified boot',
      'Custom ROMs may weaken security',
      '/e/OS provides degoogled Android',
      'CalyxOS offers good balance',
      'Research specific ROM security carefully'
    ],
    privacyGuidesRecommended: false
  }
]

// =============================================================================
// TABLET OPERATING SYSTEMS
// =============================================================================

const tabletOsIntro: WikiIntroSection = {
  title: 'Tablet Operating Systems',
  description: 'Tablets often serve as both entertainment and productivity devices, making their OS privacy important for protecting diverse activities.',
  concerns: {
    heading: 'Privacy Concerns with Tablet Operating Systems',
    points: [
      'Same tracking concerns as mobile devices',
      'Often used on shared networks',
      'Children may use family tablets',
      'App permissions can be overly broad'
    ]
  },
  benefits: {
    heading: 'Privacy Improvements for Tablets',
    points: [
      'Apply same mobile OS privacy recommendations',
      'Use privacy-focused browsers on tablets',
      'Review app permissions regularly',
      'Consider dedicated profiles for different users'
    ]
  }
}

const tabletOsServices: WikiService[] = [
  // iPadOS
  {
    id: 'ipados',
    name: 'iPadOS',
    description: 'Apple\'s tablet operating system for iPad, sharing most privacy features with iOS.',
    homepage: 'https://www.apple.com/ipados',
    privacyRating: 'acceptable',
    privacyNote: 'Similar to iOS with same privacy trade-offs',
    privacyDetails: [
      'App Tracking Transparency available',
      'Private Relay with iCloud+',
      'Strong hardware security',
      'Advanced Data Protection for iCloud',
      'Locked to Apple ecosystem',
      'Better than Android tablets for average users'
    ],
    privacyGuidesRecommended: false
  },
  // Android Tablet
  {
    id: 'android-tablet',
    name: 'Android Tablet',
    description: 'Tablets running various Android versions from manufacturers like Samsung, Lenovo, and others.',
    homepage: 'https://www.android.com',
    privacyRating: 'caution',
    privacyNote: 'Same privacy concerns as Android phones',
    privacyDetails: [
      'Google tracking through Play Services',
      'Manufacturer bloatware may add tracking',
      'Advertising ID enabled by default',
      'App sandboxing provides some protection',
      'Privacy settings vary by manufacturer',
      'Consider GrapheneOS on Pixel Tablet'
    ],
    privacyGuidesRecommended: false
  },
  // Other tablet
  {
    id: 'other-tablet',
    name: 'Other (dedicated OS or Linux)',
    description: 'Tablets running alternative operating systems like Linux or specialized OSes.',
    homepage: 'https://ubuntu.com/tablet',
    privacyRating: 'acceptable',
    privacyNote: 'Privacy depends on specific OS choice',
    privacyDetails: [
      'Linux tablets offer good privacy',
      'PineTab and similar hardware available',
      'May lack app ecosystem',
      'Requires technical knowledge',
      'Good for privacy enthusiasts',
      'E-ink tablets often have minimal tracking'
    ],
    privacyGuidesRecommended: false
  }
]

// =============================================================================
// EXPORT ALL CATEGORIES
// =============================================================================

export const WIKI_CATEGORIES: WikiCategory[] = [
  {
    id: 'email',
    label: 'Email Providers',
    questionId: 'email-provider',
    icon: '📧',
    description: 'Compare email providers from Gmail to Proton Mail',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/email/`,
    services: emailServices,
    intro: emailIntro
  },
  {
    id: 'cloud',
    label: 'Cloud Storage',
    questionId: 'cloud-storage',
    icon: '☁️',
    description: 'Compare cloud storage from Google Drive to Proton Drive',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/cloud/`,
    services: cloudServices,
    intro: cloudIntro
  },
  {
    id: 'passwords',
    label: 'Password Managers',
    questionId: 'password-manager',
    icon: '🔐',
    description: 'Compare password managers from Chrome to Bitwarden',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/passwords/`,
    services: passwordServices,
    intro: passwordIntro
  },
  {
    id: 'vpn',
    label: 'VPN Services',
    questionId: 'vpn-usage',
    icon: '🛡️',
    description: 'Compare VPN services from NordVPN to Mullvad',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/vpn/`,
    services: vpnServices,
    intro: vpnIntro
  },
  {
    id: 'messaging',
    label: 'Messaging Apps',
    questionId: 'messaging-app',
    icon: '💬',
    description: 'Compare messaging from WhatsApp to Signal',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/real-time-communication/`,
    services: messagingServices,
    intro: messagingIntro
  },
  {
    id: 'desktop-browsers',
    label: 'Desktop Browsers',
    questionId: 'browser-desktop',
    icon: '🌐',
    description: 'Compare browsers from Chrome to Firefox',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/desktop-browsers/`,
    services: desktopBrowserServices,
    intro: desktopBrowserIntro
  },
  {
    id: 'mobile-browsers',
    label: 'Mobile Browsers',
    questionId: 'browser-mobile',
    icon: '📱',
    description: 'Compare mobile browsers for iOS and Android',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/mobile-browsers/`,
    services: mobileBrowserServices,
    intro: mobileBrowserIntro
  },
  {
    id: 'search-engines',
    label: 'Search Engines',
    questionId: 'search-engine',
    icon: '🔍',
    description: 'Compare search engines from Google to DuckDuckGo',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/search-engines/`,
    services: searchServices,
    intro: searchIntro
  },
  {
    id: 'desktop-os',
    label: 'Desktop Operating Systems',
    questionId: 'os-desktop',
    icon: '🖥️',
    description: 'Compare desktop operating systems from Windows to Linux',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/desktop/`,
    services: desktopOsServices,
    intro: desktopOsIntro
  },
  {
    id: 'mobile-os',
    label: 'Mobile Operating Systems',
    questionId: 'os-mobile',
    icon: '📲',
    description: 'Compare mobile operating systems from Android to GrapheneOS',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/android/distributions/`,
    services: mobileOsServices,
    intro: mobileOsIntro
  },
  {
    id: 'tablet-os',
    label: 'Tablet Operating Systems',
    questionId: 'os-tablet',
    icon: '📟',
    description: 'Compare tablet operating systems for privacy',
    privacyGuidesUrl: `${PRIVACY_GUIDES_BASE}/android/distributions/`,
    services: tabletOsServices,
    intro: tabletOsIntro
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getWikiCategory(categoryId: string): WikiCategory | undefined {
  return WIKI_CATEGORIES.find(c => c.id === categoryId)
}

export function getWikiCategoryByQuestionId(questionId: string): WikiCategory | undefined {
  return WIKI_CATEGORIES.find(c => c.questionId === questionId)
}

export function getCategoryIdFromQuestionId(questionId: string): string | undefined {
  const category = getWikiCategoryByQuestionId(questionId)
  return category?.id
}

/**
 * Get the Privacy Guides URL for a category
 */
export function getPrivacyGuidesUrl(categoryId: string): string | undefined {
  const category = getWikiCategory(categoryId)
  return category?.privacyGuidesUrl
}

/**
 * Get all external links for testing
 */
export function getAllExternalLinks(): { url: string; description: string }[] {
  const links: { url: string; description: string }[] = []
  
  // Privacy Guides category links
  for (const category of WIKI_CATEGORIES) {
    links.push({
      url: category.privacyGuidesUrl,
      description: `Privacy Guides: ${category.label}`
    })
    
    // Service homepages
    for (const service of category.services) {
      if (service.homepage) {
        links.push({
          url: service.homepage,
          description: `${category.label} > ${service.name}`
        })
      }
    }
  }
  
  return links
}

/**
 * Maps an answer value to a wiki service anchor ID
 */
export function getServiceAnchorFromAnswer(questionId: string, answerValue: string): string | null {
  if (!answerValue) return null
  const category = getWikiCategoryByQuestionId(questionId)
  if (!category) return null
  
  return findServiceAnchor(category, answerValue)
}

/**
 * Maps an answer value to a wiki service anchor ID using a category ID directly
 */
export function getServiceAnchorFromCategoryId(categoryId: string, answerValue: string): string | null {
  if (!answerValue) return null
  const category = getWikiCategory(categoryId)
  if (!category) return null
  
  return findServiceAnchor(category, answerValue)
}

function findServiceAnchor(category: WikiCategory, answerValue: string): string | null {
  const lowerAnswer = answerValue.toLowerCase()
  
  for (const service of category.services) {
    const serviceIdParts = service.id.toLowerCase().split('-')
    const serviceNameParts = service.name.toLowerCase().split(' ')
    
    if (serviceIdParts.some(part => lowerAnswer.includes(part) || part.includes(lowerAnswer))) {
      return service.id
    }
    if (serviceNameParts.some(part => part.length > 2 && (lowerAnswer.includes(part) || part.includes(lowerAnswer)))) {
      return service.id
    }
  }
  
  return null
}

/**
 * Get the privacy rating badge color
 */
export function getPrivacyRatingColor(rating: WikiService['privacyRating']): string {
  switch (rating) {
    case 'good': return '#22c55e' // green
    case 'acceptable': return '#eab308'  // yellow
    case 'caution': return '#f97316'     // orange
    case 'avoid': return '#ef4444'       // red
    default: return '#6b7280'            // gray
  }
}

/**
 * Get privacy rating label
 */
export function getPrivacyRatingLabel(rating: WikiService['privacyRating']): string {
  switch (rating) {
    case 'good': return '✓ Good'
    case 'acceptable': return 'Acceptable'
    case 'caution': return '⚠ Caution'
    case 'avoid': return '✗ Avoid'
    default: return 'Unknown'
  }
}

/**
 * Get service by answer value from a category
 * This enables unified lookup across Quiz, Dashboard, and Wiki
 */
export function getServiceByAnswerValue(categoryId: string, answerValue: string): WikiService | undefined {
  const category = getWikiCategory(categoryId)
  if (!category || !answerValue) return undefined
  
  const lowerAnswer = answerValue.toLowerCase()
  
  // Try exact ID match first
  const exactMatch = category.services.find(s => s.id.toLowerCase() === lowerAnswer)
  if (exactMatch) return exactMatch
  
  // Try partial ID match (e.g., 'protonmail' matches 'proton-mail')
  const normalizedAnswer = lowerAnswer.replace(/[-_\s]/g, '')
  const idMatch = category.services.find(s => {
    const normalizedId = s.id.toLowerCase().replace(/[-_\s]/g, '')
    return normalizedId === normalizedAnswer || normalizedId.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedId)
  })
  if (idMatch) return idMatch
  
  // Try name match - only match significant parts (4+ chars to avoid false positives)
  for (const service of category.services) {
    const normalizedName = service.name.toLowerCase().replace(/[-_\s()]/g, '')
    if (normalizedName.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedName.slice(0, 6))) {
      return service
    }
  }
  
  return undefined
}

/**
 * Map quiz score to scoreClass (used in Dashboard tables)
 * This ensures consistency between Quiz scores and visual display
 */
export function mapScoreToClass(score: number): 'good' | 'medium' | 'poor' {
  if (score >= 80) return 'good'
  if (score >= 60) return 'medium'
  return 'poor'
}

/**
 * Map privacy rating to scoreClass (used to unify Wiki and Dashboard)
 */
export function mapPrivacyRatingToScoreClass(rating: WikiService['privacyRating']): 'good' | 'medium' | 'poor' {
  switch (rating) {
    case 'good': return 'good'
    case 'acceptable': return 'medium'
    case 'caution': return 'poor'
    case 'avoid': return 'poor'
    default: return 'poor'
  }
}

/**
 * Map quiz score to privacy rating
 * This enables unified display across all pages
 */
export function mapScoreToPrivacyRating(score: number): WikiService['privacyRating'] {
  if (score >= 80) return 'good'
  if (score >= 60) return 'acceptable'
  if (score >= 40) return 'caution'
  return 'avoid'
}

/**
 * Get unified service info from answer value
 * Returns rating, scoreClass, and other info for Dashboard/Wiki consistency
 */
export function getUnifiedServiceInfo(questionId: string, answerValue: string): {
  name: string
  rating: WikiService['privacyRating']
  scoreClass: 'good' | 'medium' | 'poor'
  privacyNote: string
} | null {
  const categoryId = getCategoryIdFromQuestionId(questionId)
  if (!categoryId) return null
  
  const service = getServiceByAnswerValue(categoryId, answerValue)
  if (!service) return null
  
  return {
    name: service.name,
    rating: service.privacyRating,
    scoreClass: mapPrivacyRatingToScoreClass(service.privacyRating),
    privacyNote: service.privacyNote
  }
}
