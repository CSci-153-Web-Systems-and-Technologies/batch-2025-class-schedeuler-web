// app/(unauthenticated)/(auth)/signup/components/TermsModal.tsx
"use client";

import React from "react";
import { X, Shield, FileText } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-primary w-5 h-5" /> 
              Terms of Service
            </h2>
            <p className="text-sm text-gray-500">Last updated: December 2025</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-600 leading-relaxed">
            <section>
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText size={16} /> 1. Acceptance of Terms
                </h3>
                <p>
                    By creating an account on SchedEuler, you agree to comply with and be bound by the following terms and conditions. 
                    If you do not agree to these terms, you may not access or use the Service.
                </p>
            </section>

            <section>
                <h3 className="text-base font-bold text-gray-900 mb-2">2. User Accounts</h3>
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials. <strong>Students</strong> allow <strong>Instructors</strong> to view their class schedules for the purpose of conflict detection. 
                    By joining a class, you grant this permission explicitly.
                </p>
            </section>

            <section>
                <h3 className="text-base font-bold text-gray-900 mb-2">3. Acceptable Use</h3>
                <p>
                    You agree not to misuse the Service. This includes, but is not limited to:
                </p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Attempting to access accounts that do not belong to you.</li>
                    <li>Spamming the reporting system.</li>
                    <li>Using the scheduling tools for non-academic illegal activities.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-base font-bold text-gray-900 mb-2">4. Data Privacy</h3>
                <p>
                    We collect your name, email, and scheduling data to provide core functionality. 
                    We do not sell your personal data to third parties. For more details, please contact support.
                </p>
            </section>

            <section>
                <h3 className="text-base font-bold text-gray-900 mb-2">5. Limitation of Liability</h3>
                <p>
                    SchedEuler is provided "as is". We are not liable for any academic issues arising from missed classes or scheduling conflicts, 
                    although we strive to prevent them.
                </p>
            </section>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300"
          >
            Close
          </Button>
          <Button 
            onClick={onAccept}
            className="bg-primary hover:bg-primary/90 text-white px-6"
          >
            I Agree
          </Button>
        </div>

      </div>
    </div>
  );
}