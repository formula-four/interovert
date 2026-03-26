import env from '../config/env.js';
import { sendHtmlEmail } from './authService.js';

function appBaseUrl() {
  return (env.publicAppUrl || env.frontendUrl || 'http://localhost:5173').replace(/\/$/, '');
}
//test comment
function fmtWhen(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(d);
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Notify event host and booker after a confirmed spot (free join or paid verification).
 * Fire-and-forget from callers; logs failures only.
 */
export async function sendBookingConfirmationEmails({
  event,
  ownerEmail,
  bookerEmail,
  bookerName,
  paidAmount,
}) {
  if (!event?.name) return;

  const base = appBaseUrl();
  const eventUrl = `${base}/event/${event._id}`;
  const when = fmtWhen(event.datetime);
  const name = bookerName || 'A participant';
  const paidLine =
    paidAmount != null && Number(paidAmount) > 0
      ? `<p>Amount paid: <strong>₹${Number(paidAmount).toLocaleString('en-IN')}</strong></p>`
      : '<p>This booking is for a <strong>free</strong> event.</p>';

  const ownerSubject = `New booking: ${event.name}`;
  const ownerHtml = `
    <p>Hi,</p>
    <p><strong>${escapeHtml(name)}</strong> booked a spot in your event <strong>${escapeHtml(event.name)}</strong>.</p>
    <p><strong>When:</strong> ${escapeHtml(when)}</p>
    ${paidLine}
    <p><a href="${escapeHtml(eventUrl)}">Open event</a></p>
    <p style="color:#666;font-size:13px;">Find My Buddy</p>
  `;

  const bookerSubject = `You're in: ${event.name}`;
  const bookerHtml = `
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your spot for <strong>${escapeHtml(event.name)}</strong> is confirmed.</p>
    <p><strong>When:</strong> ${escapeHtml(when)}</p>
    ${paidLine}
    <p><a href="${escapeHtml(eventUrl)}">View event details</a></p>
    <p style="color:#666;font-size:13px;">Find My Buddy</p>
  `;

  await Promise.all([
    ownerEmail ? sendHtmlEmail(ownerEmail, ownerSubject, ownerHtml) : Promise.resolve(false),
    bookerEmail ? sendHtmlEmail(bookerEmail, bookerSubject, bookerHtml) : Promise.resolve(false),
  ]);
}
