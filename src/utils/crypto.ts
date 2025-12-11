/**
 * Client-side encryption utilities using Web Crypto API
 * All encryption happens in the browser - no data is sent to servers
 */

/**
 * Derives a cryptographic key from a password
 */
async function deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts data with a password
 */
export async function encryptData(data: any, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await deriveKey(password, salt)
  const encodedData = encoder.encode(JSON.stringify(data))

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  )

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encryptedData), salt.length + iv.length)

  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts data with a password
 */
export async function decryptData(encryptedString: string, password: string): Promise<any> {
  const decoder = new TextDecoder()

  // Convert from base64
  const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0))

  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const encryptedData = combined.slice(28)

  const key = await deriveKey(password, salt)

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedData
  )

  const jsonString = decoder.decode(decryptedData)
  return JSON.parse(jsonString)
}

/**
 * Downloads encrypted data as a file
 */
export function downloadEncryptedFile(encryptedData: string, filename: string = 'knowyourprivacy-data.json'): boolean {
  try {
    const blob = new Blob([encryptedData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Validates if a file is readable (basic file validation)
 */
export async function validateExportFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    // Just check file size and basic properties
    if (file.size === 0) {
      reject(new Error('File is empty'))
      return
    }

    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('File does not appear to be a JSON file'))
      return
    }

    resolve()
  })
}

/**
 * Reads and decrypts a file
 */
export async function readEncryptedFile(file: File, password: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const encryptedString = e.target?.result as string
        const data = await decryptData(encryptedString, password)
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to decrypt file. Wrong password?'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
