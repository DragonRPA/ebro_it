// Utility functions for file operations
import * as fs from 'fs';
import * as path from 'path';

/** Ensure directory exists, creating recursively if needed */
export function ensureDirSync(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** Write base64 string to file, ensuring directory exists */
export function writeBase64ToFile(filePath: string, base64Data: string): void {
  ensureDirSync(path.dirname(filePath));
  // Remove data URL prefix if present
  const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, buffer);
}
