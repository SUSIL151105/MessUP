import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, ShieldCheck, Send, Loader2 } from 'lucide-react';
import { EmailNotificationService, type WelcomeEmailPayload } from '../services/emailService';

interface EmailPreviewModalProps {
  payload: WelcomeEmailPayload | null;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ payload, onClose }) => {
  const [activeTab, setActiveTab] = useState<'HTML' | 'PLAIN'>('HTML');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!payload) return null;

  const adminEmail = payload.senderEmail || 'theweber0000@gmail.com';
  const { subject, html, plainText } = EmailNotificationService.generateEmailTemplate(payload);
  const gmailUrl = EmailNotificationService.getGmailComposeUrl(payload, adminEmail);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDispatchEmail = async () => {
    setIsSending(true);
    try {
      await EmailNotificationService.sendWelcomeEmail(payload);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    } catch (e: any) {
      alert(`Failed to send email: ${e?.message || 'Error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Automated Welcome Email Preview</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {payload.role === 'STUDENT' ? 'Student Resident' : 'Food Incharge'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                From: <span className="font-semibold text-emerald-700">{adminEmail}</span> → To: <span className="font-semibold text-slate-800">{payload.recipientEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Tab Toggle */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl font-semibold">
            <button
              onClick={() => setActiveTab('HTML')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'HTML' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Rich Email View
            </button>
            <button
              onClick={() => setActiveTab('PLAIN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'PLAIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Plain Text & Credentials
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDispatchEmail}
              disabled={isSending}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs ${
                sentSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : sentSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSending ? 'Sending...' : sentSuccess ? 'Sent!' : 'Send Automated Email'}</span>
            </button>

            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Gmail</span>
            </a>
          </div>
        </div>

        {/* Email Subject Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] mr-2">Subject:</span>
          <span className="font-semibold text-slate-800">{subject}</span>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          {activeTab === 'HTML' ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
              <iframe
                title="Email Preview"
                srcDoc={html}
                className="w-full h-[450px] border-none"
              />
            </div>
          ) : (
            <pre className="bg-white p-5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed shadow-xs">
              {plainText}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automated mail sent from Admin: <strong>{adminEmail}</strong></span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
