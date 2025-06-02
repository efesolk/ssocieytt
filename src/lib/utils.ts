import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Tailwind class birleştirme yardımcısı
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tarihi biçimlendirir (örn: May 31, 2025)
 */
export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return isNaN(dateObj.getTime()) ? 'Invalid date' : format(dateObj, 'MMM d, yyyy');
}

/**
 * Saati biçimlendirir (örn: 5:30 PM)
 */
export function formatTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return isNaN(dateObj.getTime()) ? 'Invalid time' : format(dateObj, 'h:mm a');
}

/**
 * Görece zaman biçimlendirme (örn: 5 dakika önce)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return isNaN(dateObj.getTime()) ? 'Invalid date' : formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Valorant Tracker bağlantısı oluşturur
 */
export function getTrackerLink(username: string): string {
  return `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(username)}/overview`;
}

/**
 * Kullanıcılar arasında sabit bir oda ID'si üretir
 */
export function generateRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('-');
}
