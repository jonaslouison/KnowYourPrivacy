/**
 * Client-side encryption utilities using Web Crypto API
 * All encryption happens in the browser - no data is sent to servers
 */

/**
 * Derives a cryptographic key from a password
 * @param {string} password - User's password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} - Derived key
 */
async function deriveKey(password, salt) {
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
 * @param {object} data - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Promise<string>} - Encrypted data as base64 string
 */
export async function encryptData(data, password) {
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
 * @param {string} encryptedString - Base64 encrypted data
 * @param {string} password - Password for decryption
 * @returns {Promise<object>} - Decrypted data
 */
export async function decryptData(encryptedString, password) {
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
 * @param {string} encryptedData - Encrypted data string
 * @param {string} filename - Name for the download file
 */
export function downloadEncryptedFile(encryptedData, filename = 'knowyourprivacy-data.json') {
  const blob = new Blob([encryptedData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Reads and decrypts a file
 * @param {File} file - File to read
 * @param {string} password - Password for decryption
 * @returns {Promise<object>} - Decrypted data
 */
export async function readEncryptedFile(file, password) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const encryptedString = e.target.result
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
