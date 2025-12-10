"use client";

import { useState } from "react";
import { submitBugReport } from "../actions"; 
import { useToast } from "@/app/context/ToastContext";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type Category = "bug" | "feedback" | "feature" | "ui" | "performance" | "other";

interface BugReportData {
  subject: string;
  category: Category | "";
  message: string;
}

export default function BugReport() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<BugReportData>({
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
        showToast("Error", "Please select a category.", "error");
        return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitBugReport({
        subject: formData.subject,
        category: formData.category,
        message: formData.message
      });

      if (result.error) {
        showToast("Submission Failed", result.error, "error");
      } else if (result.warning) {
        setIsSubmitted(true);
        setFormData({ subject: "", category: "", message: "" });
        showToast("Report Saved", result.warning, "warning");
      } else {
        setIsSubmitted(true);
        setFormData({ subject: "", category: "", message: "" });
        showToast("Success", "Report sent successfully!", "success");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      showToast("Error", "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { value: Category; label: string }[] = [
    { value: "bug", label: "Bug Report" },
    { value: "feedback", label: "General Feedback" },
    { value: "feature", label: "Feature Request" },
    { value: "ui", label: "UI/UX Issue" },
    { value: "performance", label: "Performance Issue" },
    { value: "other", label: "Other" },
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-8 sm:mt-12 p-6 sm:p-8 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl dark:bg-green-900/20 dark:border-green-800 shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-400 mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
            Report Received
          </h3>
          <p className="text-sm sm:text-base text-green-700 dark:text-green-400 mb-6">
            Thanks for your help! We've sent a copy to our team.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg dark:bg-green-700 dark:hover:bg-green-600 text-sm sm:text-base"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto py-6 px-4 sm:py-8 sm:px-8 lg:px-12 rounded-2xl sm:rounded-3xl shadow-sm border border-[var(--color-border)] mt-4 sm:mt-6"
      style={{
        backgroundColor: "var(--color-components-bg)",
      }}
    >
      <div className="mb-6 sm:mb-8">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Report an Issue
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm sm:text-lg">
          Found a bug? Have feedback? Let us know below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label
            htmlFor="subject"
            className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description..."
            required
            className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium text-sm sm:text-base"
            style={{
              backgroundColor: "var(--color-bar-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all appearance-none cursor-pointer font-medium text-sm sm:text-base"
              style={{
                backgroundColor: "var(--color-bar-bg)",
                borderColor: "var(--color-border)",
                color: formData.category
                  ? "var(--color-text-primary)"
                  : "var(--color-muted)",
              }}
            >
              <option value="" disabled>Select a category...</option>
              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                  className="bg-[var(--color-components-bg)] text-[var(--color-text-primary)] py-2"
                >
                  {category.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 uppercase tracking-wide"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="Please provide detailed information..."
            required
            className="w-full px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all resize-none font-medium leading-relaxed text-sm sm:text-base"
            style={{
              backgroundColor: "var(--color-bar-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 sm:py-4 px-4 text-white font-bold text-base sm:text-lg rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50 transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: isSubmitting ? "none" : "0 4px 14px 0 rgba(65, 105, 225, 0.39)",
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Sending...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
}