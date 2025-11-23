import { invoke } from '@tauri-apps/api/core';

/**
 * Tauri Commands - Type-safe wrappers for Tauri IPC commands
 *
 * This module provides typed wrappers around Tauri invoke() calls,
 * ensuring type safety and centralized command management.
 */

// Auth Commands
export interface LoginResult {
  success: boolean;
  userId?: number;
  token?: string;
  error?: string;
}

export async function verifyPin(userId: number, pin: string): Promise<boolean> {
  return invoke<boolean>('verify_pin', { userId, pin });
}

export async function hashPin(pin: string): Promise<string> {
  return invoke<string>('hash_pin', { pin });
}

// DTE Commands
export interface SignDTEInput {
  dteType: string;
  jsonData: string;
}

export interface SignDTEResult {
  success: boolean;
  signedData?: string;
  codigoGeneracion?: string;
  numeroControl?: string;
  error?: string;
}

export async function signDTE(input: SignDTEInput): Promise<SignDTEResult> {
  return invoke<SignDTEResult>('sign_dte', { payload: input });
}

// System Commands
export interface SystemInfo {
  platform: string;
  version: string;
  arch: string;
  hostname: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>('get_system_info');
}

export async function openExternal(url: string): Promise<void> {
  return invoke('open_external', { url });
}

// Certificate Commands
export async function loadCertificate(path: string, password: string): Promise<boolean> {
  return invoke<boolean>('load_certificate', { path, password });
}

export async function isCertificateLoaded(): Promise<boolean> {
  return invoke<boolean>('is_certificate_loaded');
}
