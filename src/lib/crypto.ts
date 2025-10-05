// Web Crypto API utilities for hybrid encryption (AES-GCM + RSA-OAEP) with SHA-256 fingerprinting

export interface EncryptedEnvelope {
  filename: string;
  nonce: string;
  tag: string;
  ciphertext: string;
  encAesKey: string;
  sha256: string;
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

// Generate RSA-OAEP key pair (2048 bits)
export async function generateRSAKeyPair(): Promise<KeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  
  return keyPair;
}

// Export key to PEM format
export async function exportKeyToPEM(key: CryptoKey, type: "public" | "private"): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key
  );
  
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = btoa(exportedAsString);
  const pemKey = `-----BEGIN ${type.toUpperCase()} KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END ${type.toUpperCase()} KEY-----`;
  
  return pemKey;
}

// Import PEM key
export async function importKeyFromPEM(pem: string, type: "public" | "private"): Promise<CryptoKey> {
  const pemContents = pem
    .replace(`-----BEGIN ${type.toUpperCase()} KEY-----`, "")
    .replace(`-----END ${type.toUpperCase()} KEY-----`, "")
    .replace(/\s/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const key = await window.crypto.subtle.importKey(
    type === "public" ? "spki" : "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    type === "public" ? ["encrypt"] : ["decrypt"]
  );
  
  return key;
}

// Calculate SHA-256 hash
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Encrypt file with hybrid encryption
export async function encryptFile(
  fileData: ArrayBuffer,
  filename: string,
  publicKey: CryptoKey
): Promise<EncryptedEnvelope> {
  const plaintext = new Uint8Array(fileData);
  
  // Calculate SHA-256 fingerprint
  const sha256 = await sha256Hex(plaintext);
  
  // Generate random AES-256 key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // Generate random IV/nonce (12 bytes for GCM)
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt with AES-GCM
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    plaintext
  );
  
  // Split encrypted data into ciphertext and tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encryptedData);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);
  
  // Export AES key
  const aesKeyData = await window.crypto.subtle.exportKey("raw", aesKey);
  
  // Encrypt AES key with RSA public key
  const encAesKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    aesKeyData
  );
  
  // Create envelope
  const envelope: EncryptedEnvelope = {
    filename,
    nonce: btoa(String.fromCharCode(...nonce)),
    tag: btoa(String.fromCharCode(...tag)),
    ciphertext: btoa(String.fromCharCode(...ciphertext)),
    encAesKey: btoa(String.fromCharCode(...new Uint8Array(encAesKey))),
    sha256,
  };
  
  return envelope;
}

// Decrypt file with hybrid decryption
export async function decryptFile(
  envelope: EncryptedEnvelope,
  privateKey: CryptoKey
): Promise<{ data: Uint8Array; filename: string; sha256Valid: boolean }> {
  // Decode base64 fields
  const nonce = Uint8Array.from(atob(envelope.nonce), c => c.charCodeAt(0));
  const tag = Uint8Array.from(atob(envelope.tag), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(envelope.ciphertext), c => c.charCodeAt(0));
  const encAesKey = Uint8Array.from(atob(envelope.encAesKey), c => c.charCodeAt(0));
  
  // Decrypt AES key with RSA private key
  const aesKeyData = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encAesKey
  );
  
  // Import AES key
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    aesKeyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  
  // Combine ciphertext and tag for GCM
  const encryptedData = new Uint8Array(ciphertext.length + tag.length);
  encryptedData.set(ciphertext, 0);
  encryptedData.set(tag, ciphertext.length);
  
  // Decrypt with AES-GCM
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    encryptedData
  );
  
  const plaintext = new Uint8Array(decryptedData);
  
  // Verify SHA-256
  const actualSha256 = await sha256Hex(plaintext);
  const sha256Valid = actualSha256 === envelope.sha256;
  
  return {
    data: plaintext,
    filename: envelope.filename,
    sha256Valid,
  };
}

// Download helper functions
export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBinary(data: Uint8Array, filename: string) {
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Password-based encryption types
export interface PasswordEncryptedEnvelope {
  filename: string;
  salt: string;
  nonce: string;
  tag: string;
  ciphertext: string;
  sha256: string;
}

// Derive AES key from password using PBKDF2
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

// Encrypt file with password-based encryption
export async function encryptFileWithPassword(
  fileData: ArrayBuffer,
  filename: string,
  password: string
): Promise<PasswordEncryptedEnvelope> {
  const plaintext = new Uint8Array(fileData);
  
  // Calculate SHA-256 fingerprint
  const sha256 = await sha256Hex(plaintext);
  
  // Generate random salt (16 bytes)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Derive AES key from password
  const aesKey = await deriveKeyFromPassword(password, salt);
  
  // Generate random IV/nonce (12 bytes for GCM)
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt with AES-GCM
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    plaintext
  );
  
  // Split encrypted data into ciphertext and tag (last 16 bytes)
  const encryptedArray = new Uint8Array(encryptedData);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);
  
  // Create envelope
  const envelope: PasswordEncryptedEnvelope = {
    filename,
    salt: btoa(String.fromCharCode(...salt)),
    nonce: btoa(String.fromCharCode(...nonce)),
    tag: btoa(String.fromCharCode(...tag)),
    ciphertext: btoa(String.fromCharCode(...ciphertext)),
    sha256,
  };
  
  return envelope;
}

// Decrypt file with password-based decryption
export async function decryptFileWithPassword(
  envelope: PasswordEncryptedEnvelope,
  password: string
): Promise<{ data: Uint8Array; filename: string; sha256Valid: boolean }> {
  // Decode base64 fields
  const salt = Uint8Array.from(atob(envelope.salt), c => c.charCodeAt(0));
  const nonce = Uint8Array.from(atob(envelope.nonce), c => c.charCodeAt(0));
  const tag = Uint8Array.from(atob(envelope.tag), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(envelope.ciphertext), c => c.charCodeAt(0));
  
  // Derive AES key from password
  const aesKey = await deriveKeyFromPassword(password, salt);
  
  // Combine ciphertext and tag for GCM
  const encryptedData = new Uint8Array(ciphertext.length + tag.length);
  encryptedData.set(ciphertext, 0);
  encryptedData.set(tag, ciphertext.length);
  
  // Decrypt with AES-GCM
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    encryptedData
  );
  
  const plaintext = new Uint8Array(decryptedData);
  
  // Verify SHA-256
  const actualSha256 = await sha256Hex(plaintext);
  const sha256Valid = actualSha256 === envelope.sha256;
  
  return {
    data: plaintext,
    filename: envelope.filename,
    sha256Valid,
  };
}
