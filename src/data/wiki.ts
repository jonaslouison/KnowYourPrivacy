/**
 * Wiki data module - Maps categories to markdown content and service metadata
 */

export interface WikiService {
  id: string
  name: string
  description: string
  logo?: string
  homepage?: string
  privacyPolicy?: string
  sourceCode?: string
}

export interface WikiCategory {
  id: string
  label: string
  questionId: string
  icon: string
  description: string
  services: WikiService[]
  content: string
}

// Email Services
const emailContent = `
## Email Services

Email services that prioritize your privacy with end-to-end encryption and minimal data collection.

### Why Email Privacy Matters

Email is often the central hub of your digital identity - used for account recovery, sensitive communications, and personal correspondence. Standard email providers like Gmail scan your messages for advertising purposes and store your data indefinitely.

### What to Look For

- **End-to-end encryption**: Only you and your recipient can read your messages
- **Zero-access encryption**: The provider cannot read your stored emails
- **Open source clients**: Code can be audited for security
- **Anonymous signup**: No phone number or personal info required
- **Based in privacy-friendly jurisdiction**: Protection from surveillance laws
`

const emailServices: WikiService[] = [
  {
    id: 'proton-mail',
    name: 'Proton Mail',
    description: 'Proton Mail is an encrypted email service based in Switzerland. End-to-end encryption and zero-access encryption protect your messages. Open source apps are available for all platforms.',
    homepage: 'https://proton.me/mail'
  },
  {
    id: 'mailbox',
    name: 'Mailbox.org',
    description: 'Mailbox.org is an email service with a focus on being secure, ad-free, and privately powered by 100% eco-friendly energy. They support IMAP, POP3, and Exchange protocols.',
    homepage: 'https://mailbox.org'
  },
  {
    id: 'tuta',
    name: 'Tuta',
    description: 'Tuta (formerly Tutanota) is an encrypted email service focused on security and privacy. All data is encrypted on device with quantum-resistant algorithms.',
    homepage: 'https://tuta.com'
  }
]

// Cloud Storage
const cloudContent = `
## Cloud Storage

Secure cloud storage providers that implement end-to-end encryption to protect your files from unauthorized access.

### Why Cloud Storage Privacy Matters

Most mainstream cloud providers can access your files and may scan them for various purposes. They may also comply with government requests for your data without your knowledge.

### What to Look For

- **End-to-end encryption**: Files encrypted before leaving your device
- **Zero-knowledge architecture**: Provider cannot access your data
- **Open source clients**: Transparency and auditability
- **Secure sharing**: Share files without compromising privacy
`

const cloudServices: WikiService[] = [
  {
    id: 'proton-drive',
    name: 'Proton Drive',
    description: 'Proton Drive is an encrypted cloud storage provider from Proton. All files are end-to-end encrypted, meaning even Proton cannot access your data.',
    homepage: 'https://proton.me/drive'
  },
  {
    id: 'tresorit',
    name: 'Tresorit',
    description: 'Tresorit is a Swiss-Hungarian encrypted cloud storage provider. All data is protected with end-to-end encryption and the service has been independently audited.',
    homepage: 'https://tresorit.com'
  },
  {
    id: 'peergos',
    name: 'Peergos',
    description: 'Peergos is a decentralized protocol and open-source platform for storage. It provides quantum-resistant end-to-end encryption and can be self-hosted.',
    homepage: 'https://peergos.org'
  }
]

// Password Managers
const passwordContent = `
## Password Managers

Password managers allow you to securely store and manage passwords and other credentials with a master password.

### Why Password Managers Matter

Using unique, strong passwords for every account is the most effective way to protect yourself from data breaches. A password manager makes this practical by securely storing all your credentials.

### What to Look For

- **End-to-end encryption**: Your vault is encrypted with your master password
- **Zero-knowledge architecture**: Provider cannot access your passwords
- **Cross-platform support**: Access your passwords on all devices
- **Security audits**: Independent verification of security claims
- **Two-factor authentication**: Additional protection for your vault
`

const passwordServices: WikiService[] = [
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    description: 'Bitwarden is a free and open-source password manager. It aims to solve password management problems for individuals, teams, and business organizations.',
    homepage: 'https://bitwarden.com'
  },
  {
    id: '1password',
    name: '1Password',
    description: '1Password is a password manager with a focus on security and ease of use. It uses strong end-to-end encryption and has been independently audited.',
    homepage: 'https://1password.com'
  },
  {
    id: 'proton-pass',
    name: 'Proton Pass',
    description: 'Proton Pass is an open-source password manager from Proton. It features end-to-end encryption and integrates with other Proton services.',
    homepage: 'https://proton.me/pass'
  },
  {
    id: 'keepassxc',
    name: 'KeePassXC',
    description: 'KeePassXC is a community fork of KeePassX, a native cross-platform port of KeePass Password Safe. Your database is stored locally and encrypted with your master password.',
    homepage: 'https://keepassxc.org'
  }
]

// VPN Services
const vpnContent = `
## VPN Services

A Virtual Private Network (VPN) extends a private network across a public network, enabling you to send and receive data across the internet more securely.

### Why VPNs Matter

VPNs protect your internet traffic from surveillance on the local network, hide your IP address from websites, and can help bypass censorship.

### What to Look For

- **No-logs policy**: Provider doesn't store your activity or connection data
- **Strong encryption**: Modern protocols like WireGuard or OpenVPN
- **Independent audits**: Third-party verification of no-logs claims
- **Owned infrastructure**: Provider controls their servers
- **Privacy-friendly jurisdiction**: Based in a country with strong privacy laws
`

const vpnServices: WikiService[] = [
  {
    id: 'proton-vpn',
    name: 'Proton VPN',
    description: 'Proton VPN is a VPN provider with a focus on privacy and security. Based in Switzerland with a no-logs policy that has been independently audited.',
    homepage: 'https://protonvpn.com'
  },
  {
    id: 'ivpn',
    name: 'IVPN',
    description: 'IVPN is a premium VPN provider founded in 2009. Based in Gibraltar with a strict no-logs policy. Open-source apps and independent audits.',
    homepage: 'https://ivpn.net'
  },
  {
    id: 'mullvad',
    name: 'Mullvad',
    description: 'Mullvad is a VPN provider based in Sweden. They accept anonymous payments and don\'t require any personal information to sign up.',
    homepage: 'https://mullvad.net'
  }
]

// Messaging Apps
const messagingContent = `
## Messaging Apps

Encrypted instant messengers that protect your conversations from surveillance and unauthorized access.

### Why Encrypted Messaging Matters

Standard SMS and many popular messaging apps don't provide end-to-end encryption, meaning your messages can be read by the provider, governments, or hackers.

### What to Look For

- **End-to-end encryption by default**: All messages encrypted automatically
- **Open source**: Code can be audited for backdoors
- **Minimal metadata collection**: Provider doesn't store who you talk to or when
- **Forward secrecy**: Past messages stay secure even if keys are compromised
- **No phone number required**: Anonymous signup options
`

const messagingServices: WikiService[] = [
  {
    id: 'signal',
    name: 'Signal',
    description: 'Signal is an instant messenger developed by Signal Messenger LLC. The app provides instant messaging and calls secured with the Signal protocol, an extremely secure encryption protocol.',
    homepage: 'https://signal.org'
  },
  {
    id: 'simplex',
    name: 'SimpleX Chat',
    description: 'SimpleX Chat is an instant messenger that doesn\'t depend on any unique identifiers such as phone numbers or usernames. Its decentralized network provides strong metadata protection.',
    homepage: 'https://simplex.chat'
  },
  {
    id: 'briar',
    name: 'Briar',
    description: 'Briar is an encrypted instant messenger that connects to other clients using the Tor network. It can also connect via Wi-Fi or Bluetooth when in local proximity.',
    homepage: 'https://briarproject.org'
  }
]

// Desktop Browsers
const desktopBrowserContent = `
## Desktop Browsers

Web browsers that respect your privacy and protect you from tracking across the internet.

### Why Browser Privacy Matters

Your browser is your window to the internet and potentially your biggest privacy risk. Mainstream browsers track your activity for advertising and share data with third parties.

### What to Look For

- **Built-in tracking protection**: Blocks trackers and fingerprinting by default
- **Privacy-focused defaults**: Settings configured for privacy out of the box
- **Regular security updates**: Quick patches for vulnerabilities
- **Open source**: Transparent and auditable code
- **No telemetry**: Doesn't phone home with your browsing data
`

const desktopBrowserServices: WikiService[] = [
  {
    id: 'firefox',
    name: 'Firefox',
    description: 'Firefox is a fast, lightweight, privacy-focused browser from Mozilla, a non-profit organization. Enhanced Tracking Protection blocks many trackers by default.',
    homepage: 'https://firefox.com'
  },
  {
    id: 'brave',
    name: 'Brave',
    description: 'Brave includes a built-in content blocker and privacy features, many of which are enabled by default. Built upon Chromium for good website compatibility.',
    homepage: 'https://brave.com'
  },
  {
    id: 'mullvad-browser',
    name: 'Mullvad Browser',
    description: 'Mullvad Browser is a privacy-focused browser developed in partnership between Mullvad VPN and the Tor Project. Designed to minimize fingerprinting.',
    homepage: 'https://mullvad.net/browser'
  },
  {
    id: 'tor-browser',
    name: 'Tor Browser',
    description: 'Tor Browser is the only way to truly browse the internet anonymously. It routes your traffic through multiple relays and includes strong anti-fingerprinting measures.',
    homepage: 'https://www.torproject.org'
  }
]

// Mobile Browsers
const mobileBrowserContent = `
## Mobile Browsers

Privacy-respecting browsers for your mobile devices that protect you from tracking and surveillance.

### Mobile Privacy Considerations

Mobile browsers face unique challenges including platform restrictions (especially on iOS) and the integration of location services. Choose a browser that respects your privacy by default.

### What to Look For

- **Tracking protection**: Blocks third-party trackers and ads
- **HTTPS everywhere**: Automatically upgrades connections to HTTPS
- **Anti-fingerprinting**: Reduces your unique browser fingerprint
- **Private search**: Uses a privacy-respecting search engine by default
`

const mobileBrowserServices: WikiService[] = [
  {
    id: 'brave-mobile',
    name: 'Brave (Mobile)',
    description: 'Brave Browser includes a built-in content blocker and privacy features on mobile, many enabled by default. Available for both Android and iOS.',
    homepage: 'https://brave.com'
  },
  {
    id: 'firefox-mobile',
    name: 'Firefox (Mobile)',
    description: 'Firefox on mobile provides Enhanced Tracking Protection by default. On Android, it supports extensions like uBlock Origin.',
    homepage: 'https://www.mozilla.org/firefox/mobile'
  },
  {
    id: 'safari-mobile',
    name: 'Safari (iOS)',
    description: 'Safari on iOS includes Intelligent Tracking Prevention and other privacy features. It\'s the only fully-featured browser engine option on iOS due to Apple\'s restrictions.',
    homepage: 'https://www.apple.com/safari'
  },
  {
    id: 'cromite',
    name: 'Cromite (Android)',
    description: 'Cromite is a Chromium fork with ad blocking and privacy enhancements. Available for Android only.',
    homepage: 'https://cromite.org'
  }
]

// Search Engines
const searchContent = `
## Search Engines

Privacy-respecting search engines that don't build an advertising profile based on your searches.

### Why Search Engine Privacy Matters

Search queries reveal your interests, concerns, health issues, and more. Mainstream search engines like Google build detailed profiles from your searches for advertising.

### What to Look For

- **No personal data collection**: Doesn't log your searches with your identity
- **No tracking**: Doesn't follow you across the web
- **Independent index**: Uses its own search index, not just Google results
- **Tor support**: Accessible via Tor for maximum privacy
`

const searchServices: WikiService[] = [
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Brave Search is a search engine developed by Brave. It uses an independent search index and doesn\'t track your searches.',
    homepage: 'https://search.brave.com'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'DuckDuckGo is one of the more mainstream private search engine options. It doesn\'t track you and offers features like bangs for quick searches.',
    homepage: 'https://duckduckgo.com'
  },
  {
    id: 'startpage',
    name: 'Startpage',
    description: 'Startpage is a private search engine that delivers Google results without the tracking. Based in the Netherlands.',
    homepage: 'https://startpage.com'
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    description: 'SearXNG is an open-source, self-hostable metasearch engine. It aggregates results from other search engines without storing your information.',
    homepage: 'https://searxng.org'
  }
]

// Operating Systems - Desktop
const osDesktopContent = `
## Desktop Operating Systems

Operating systems that respect your privacy and give you control over your data.

### Why OS Privacy Matters

Your operating system has access to everything you do on your computer. Mainstream systems like Windows collect telemetry and integrate tracking.

### What to Look For

- **Minimal telemetry**: Doesn't phone home with your activity
- **Open source**: Transparent and auditable code
- **Security updates**: Regular patches for vulnerabilities
- **Full disk encryption**: Protect your data if device is stolen
- **User control**: You decide what runs on your system
`

const osDesktopServices: WikiService[] = [
  {
    id: 'fedora',
    name: 'Fedora Linux',
    description: 'Fedora is a Linux distribution developed by the Fedora Project, sponsored by Red Hat. It focuses on security, innovation, and open source principles.',
    homepage: 'https://fedoraproject.org'
  },
  {
    id: 'linux-mint',
    name: 'Linux Mint',
    description: 'Linux Mint is a community-driven Linux distribution based on Ubuntu. It\'s designed to be easy to use while providing full multimedia support.',
    homepage: 'https://linuxmint.com'
  },
  {
    id: 'macos',
    name: 'macOS',
    description: 'macOS has strong security defaults and better privacy than Windows. Apple has made privacy a marketing focus, though some telemetry is still collected.',
    homepage: 'https://www.apple.com/macos'
  },
  {
    id: 'qubes',
    name: 'Qubes OS',
    description: 'Qubes OS is a security-focused desktop operating system that uses Xen-based virtualization to compartmentalize your digital life into separate "qubes".',
    homepage: 'https://www.qubes-os.org'
  }
]

// Operating Systems - Mobile
const osMobileContent = `
## Mobile Operating Systems

Mobile operating systems that prioritize privacy and security over data collection.

### Why Mobile OS Privacy Matters

Smartphones are always with us and know our location, contacts, messages, and habits. The default Android and iOS configurations share significant data with Google and Apple respectively.

### What to Look For

- **Minimal Google/Apple services**: Reduced tracking and data collection
- **Security updates**: Regular patches for vulnerabilities
- **App sandboxing**: Apps isolated from each other
- **Permission controls**: Fine-grained control over app permissions
- **Verified boot**: Protection against OS tampering
`

const osMobileServices: WikiService[] = [
  {
    id: 'grapheneos',
    name: 'GrapheneOS',
    description: 'GrapheneOS is a privacy and security focused mobile operating system with Android app compatibility. It provides substantial improvements over stock Android.',
    homepage: 'https://grapheneos.org'
  },
  {
    id: 'calyxos',
    name: 'CalyxOS',
    description: 'CalyxOS is an Android-based operating system with a focus on privacy by default. It includes microG for Play Services compatibility.',
    homepage: 'https://calyxos.org'
  },
  {
    id: 'ios',
    name: 'iOS',
    description: 'iOS provides strong security and privacy features. App Tracking Transparency requires apps to request permission before tracking you across other apps.',
    homepage: 'https://www.apple.com/ios'
  },
  {
    id: 'lineageos',
    name: 'LineageOS',
    description: 'LineageOS is a free and open-source operating system for smartphones, based on Android. It\'s available for a wide range of devices.',
    homepage: 'https://lineageos.org'
  }
]

// Export all categories
export const WIKI_CATEGORIES: WikiCategory[] = [
  {
    id: 'email',
    label: 'Email Provider',
    questionId: 'email-provider',
    icon: '📧',
    description: 'Secure email services with end-to-end encryption',
    services: emailServices,
    content: emailContent
  },
  {
    id: 'cloud',
    label: 'Cloud Storage',
    questionId: 'cloud-storage',
    icon: '☁️',
    description: 'Encrypted cloud storage providers',
    services: cloudServices,
    content: cloudContent
  },
  {
    id: 'passwords',
    label: 'Password Manager',
    questionId: 'password-manager',
    icon: '🔐',
    description: 'Secure password management solutions',
    services: passwordServices,
    content: passwordContent
  },
  {
    id: 'vpn',
    label: 'VPN Service',
    questionId: 'vpn-usage',
    icon: '🛡️',
    description: 'Virtual Private Network services',
    services: vpnServices,
    content: vpnContent
  },
  {
    id: 'messaging',
    label: 'Messaging App',
    questionId: 'messaging-app',
    icon: '💬',
    description: 'Encrypted instant messaging apps',
    services: messagingServices,
    content: messagingContent
  },
  {
    id: 'desktop-browsers',
    label: 'Desktop Browser',
    questionId: 'browser-desktop',
    icon: '🌐',
    description: 'Privacy-focused desktop web browsers',
    services: desktopBrowserServices,
    content: desktopBrowserContent
  },
  {
    id: 'mobile-browsers',
    label: 'Mobile Browser',
    questionId: 'browser-mobile',
    icon: '📱',
    description: 'Privacy-focused mobile web browsers',
    services: mobileBrowserServices,
    content: mobileBrowserContent
  },
  {
    id: 'search-engines',
    label: 'Search Engine',
    questionId: 'search-engine',
    icon: '🔍',
    description: 'Private search engines',
    services: searchServices,
    content: searchContent
  },
  {
    id: 'os-desktop',
    label: 'Desktop OS',
    questionId: 'os-desktop',
    icon: '💻',
    description: 'Privacy-respecting desktop operating systems',
    services: osDesktopServices,
    content: osDesktopContent
  },
  {
    id: 'os-mobile',
    label: 'Mobile OS',
    questionId: 'os-mobile',
    icon: '📲',
    description: 'Privacy-focused mobile operating systems',
    services: osMobileServices,
    content: osMobileContent
  }
]

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
 * Maps an answer value to a wiki service anchor ID
 * This tries to match the answer value to a known service in the category
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
  
  // Try to find a matching service by checking if the answer contains part of the service id or name
  for (const service of category.services) {
    const serviceIdParts = service.id.toLowerCase().split('-')
    const serviceNameParts = service.name.toLowerCase().split(' ')
    
    // Check if answer matches service id parts
    if (serviceIdParts.some(part => lowerAnswer.includes(part) || part.includes(lowerAnswer))) {
      return service.id
    }
    // Check if answer matches service name parts
    if (serviceNameParts.some(part => part.length > 2 && (lowerAnswer.includes(part) || part.includes(lowerAnswer)))) {
      return service.id
    }
  }
  
  return null
}
