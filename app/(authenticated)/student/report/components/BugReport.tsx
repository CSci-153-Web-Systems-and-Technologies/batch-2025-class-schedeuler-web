// components/BugReport.tsx
"use client";

import { useState } from "react";

type Category = "bug" | "feedback" | "feature" | "ui" | "performance" | "other";

interface BugReportData {
  subject: string;
  category: Category | "";
  message: string;
}

export default function BugReport() {
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
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Report submitted:", formData);
      setIsSubmitted(true);
      setFormData({ subject: "", category: "", message: "" });
    } catch (error) {
      console.error("Error submitting report:", error);
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
      <div className="max-w-xl mx-auto mt-18 p-6 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
        <div className="text-center">
          <div className="text-green-600 dark:text-green-400 text-5xl mb-4">
            ✓
          </div>
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
            Thank You!
          </h3>
          <p className="text-green-700 dark:text-green-400">
            Your report has been submitted successfully. We'll review it and get
            back to you if needed.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors dark:bg-green-700 dark:hover:bg-green-600"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto py-8 px-8 lg:px-12 rounded-3xl shadow-sm dark:border-gray-700"
      style={{
        backgroundColor: "var(--color-components-bg)",
      }}
    >
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Report an Issue
        </h2>
        <p style={{ color: "var(--color-muted-foreground)" }}>
          Found a bug? Have feedback? Let us know below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of the issue"
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Select Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundColor: "var(--color-bar-bg)",
              borderColor: "var(--color-border)",
              color: formData.category
                ? "var(--color-text-primary)"
                : "var(--color-muted)",
            }}
          >
            {categories.map((category) => (
              <option
                key={category.value}
                value={category.value}
                style={{
                  backgroundColor: "var(--color-bar-bg)",
                  color: "var(--color-text-primary)",
                }}
                className="bg-[var(--color-bar-bg)] text-[var(--color-text-primary)]"
              >
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            placeholder="Please provide detailed information about the issue..."
            required
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
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
          className="w-full py-3 px-4 text-white font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>
    </div>
  );
}
