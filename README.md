# SchedEuler 📅

> **Plan with Ease, No Conflicts Please!**

SchedEuler is a modern, intelligent academic scheduling platform designed to bridge the gap between students and instructors. It streamlines class management with real-time conflict detection, role-based dashboards, and productivity tools.

---

## 📑 Table of Contents

- [Features](#-features)
  - [Student Features](#student-features)
  - [Instructor Features](#instructor-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Deployment](#-deployment)
- [Releases](#-releases)
- [Contributing](#-contributing)

---

## 🚀 Features

### **Student Features**
* **Dashboard Overview:** Instant view of today's classes, pending tasks, and active schedule votes.
* **Smart Scheduling:**
    * **Calendar View:** Interactive weekly/monthly/daily calendar supporting drag-and-drop.
    * **Conflict Detection:** Real-time alerts when joining a class or adding a manual subject that overlaps with existing commitments.
    * **Join via Code:** Securely join classes using unique 6-character codes provided by instructors.
* **Productivity Suite:**
    * **Task Management:** Create tasks with priorities, estimates, and a progress slider. Visual deadlines on the dashboard.
    * **Pomodoro Timer:** Built-in focus timer with customizable work/break intervals and audio alerts.
* **Voting System:** Participate in democratic scheduling by voting "Yes" or "No" on schedule changes proposed by instructors.
* **Bug Reporting:** Integrated rate-limited reporting system to send feedback directly to the developer via email.

### **Instructor Features**
* **Class Management:**
    * **Create Classes:** Set detailed schedules including days, times, and "Repeat Until" dates.
    * **Roster Control:** View enrolled students and Approve/Reject join requests.
    * **Generate Codes:** Unique access codes for easy student onboarding.
* **Smart Suggest Algorithm:**
    * Analyzes the busy blocks of *all* enrolled students.
    * Automatically suggests optimal time slots where no student has a conflict.
    * Supports "Pattern Search" (e.g., T/Th slots) and "Merged Fallback" modes.
* **Proposal System:** Initiate votes for schedule changes. Set approval thresholds (e.g., 50%) and automatically apply changes if passed.
* **Analytics & Export:**
    * Dashboard stats for total students, conflicts, and classes.
    * Export schedules to **PDF** or **CSV**.

---

## 🛠 Tech Stack

**Frontend:**
* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom dark/light mode system)
* **Components:** Shadcn UI / Radix UI primitives
* **Calendar:** `react-big-calendar`, `react-datepicker`
* **State Management:** React Context API (`UserContext`, `TaskContext`, `SubjectContext`, `ThemeContext`)

**Backend & Services:**
* **BaaS:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, Storage)
* **Auth:** Supabase Auth (Email/Password + Google OAuth)
* **Email:** Nodemailer (Gmail SMTP) for bug reports
* **PDF Generation:** `jspdf`, `jspdf-autotable`

---

## 🗄 Database Schema

The application relies on the following Supabase tables:

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| **profiles** | User metadata and roles | `id`, `account_type` ('student'/'instructor'), `notify_prefs` |
| **classes** | Official classes created by instructors | `code`, `schedule_settings`, `repeat_days`, `repeat_until` |
| **enrollments** | Student-Class relationships | `student_id`, `class_id`, `status` ('pending'/'approved'), `conflict_report` |
| **events** | Personal student tasks and subjects | `user_id`, `type` ('task'/'subject'), `start_time`, `end_time` |
| **proposals** | Schedule change proposals | `class_id`, `new_time`, `threshold_percent`, `status` |
| **votes** | Student votes on proposals | `proposal_id`, `student_id`, `vote` (bool) |
| **reports** | Bug reports submitted by users | `category`, `message`, `user_id` |
| **notifications** | System alerts | `user_id`, `message`, `type`, `is_read` |

---

## 🏁 Getting Started

### Prerequisites
* Node.js 18+
* A Supabase Project
* A Gmail account (for bug report functionality, requires App Password)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/CSci-153-Web-Systems-and-Technologies/batch-2025-class-schedeuler-web.git
    cd schedeuler
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup:**
    Run the following SQL in your Supabase SQL Editor to ensure schema compatibility:
    ```sql
    -- Essential columns for the "Repeat Until" feature
    ALTER TABLE classes ADD COLUMN IF NOT EXISTS repeat_until TIMESTAMPTZ DEFAULT NULL;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS repeat_until TIMESTAMPTZ DEFAULT NULL;
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory. You must configure these keys for the app to function correctly.

| Variable Name | Description | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | **Yes** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Public API Key | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Key for role synchronization (Bypasses RLS) | **Yes** |
| `GMAIL_USER` | Email address for sending bug reports | **Yes** |
| `GMAIL_APP_PASSWORD` | App Password for the Gmail account above | **Yes** |
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g., `https://schedeuler-web.vercel.app`) | **Yes** |

> **⚠️ Security Note:** Never commit `.env.local` to version control. The `SUPABASE_SERVICE_ROLE_KEY` is highly sensitive and grants full database access.

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**.

### Deployment Checklist
1.  **Push code** to GitHub/GitLab.
2.  **Import project** into Vercel.
3.  **Configure Environment Variables** in the Vercel dashboard (copy all values from `.env.local`).
4.  **Build Command:** `npm run build`
5.  **Output Directory:** `.next` (Default)

### Deployment Table

| Environment | Status | Branch | URL |
| :--- | :--- | :--- | :--- |
| **Production** | 🟢 Live | `main` | [https://schedeuler-web.vercel.app](https://schedeuler-web.vercel.app]) |
| **Staging** | 🟡 Testing | `develop` | *internal* |

---

## 📅 Releases

| Release Version | Date Released | Type |
|-----------------|---------------|------|
| v1.0.3          | 2025-12-14    | Bug Fixes & Realtime Updates |
| v1.0.2          | 2025-12-12    | Optimization & Mobile Support |
| v1.0.1          | 2025-12-11    | Feature Update & UI Fixes |
| v1.0.0          | 2025-12-10    | Initial Deployment (Bug Testing) |

### v1.0.3 Release Notes
**What's New & Fixed**
- **⚡ Real-time Updates:** The Instructor dashboard now instantly reflects status changes (e.g., when a "Conflict" is resolved by editing a schedule).
- **🐛 Smart Suggest Logic Fix:** Corrected an issue where the suggestion engine would propose timeslots that conflicted with a student's existing manual subjects or exams.
- **🚪 Logout UX:** Added a confirmation toast notification upon successful logout for better user feedback.
- **🔒 Security Update:** Refined Row Level Security (RLS) policies to allow instructors to properly clear conflict flags on student enrollments.

### v1.0.2 Release Notes
**What's New**
- **⚡ Dashboard Optimization:**
  - Migrated initial data fetching to Server Components for instant page loads.
  - Added "Skeleton" loading states to eliminate layout shifts.
  - Replaced `moment.js` with `date-fns` to significantly reduce bundle size.
- **📱 Responsive Improvements:**
  - **Instructor Classes:** Now switches to a mobile-friendly Card layout on smaller screens.
  - **Dropdowns:** Fixed layout shifting issues when opening action menus or notifications.
- **🔔 Notifications:** Students now receive system notifications when an Instructor proposes or finalizes a schedule change.
- **🎨 UI Enhancements:** Class cards on the dashboard are now clickable, opening detailed event modals directly.

### v1.0.1 Release Notes
**What's New**
- **Avatar Cropping:** Added a client-side image editor allowing users to zoom and crop their profile pictures before uploading.
- **Smart Suggest Preferences:** Instructors can now filter schedule suggestions by time preference (Morning, Afternoon, or Any).
- **UI Enhancements:**
  - Fixed `DatePicker` width overflow in modals for better mobile visibility.
  - Resolved invisible clock icons in time inputs during Dark Mode.
- **Performance:** Optimized profile saving to prevent redundant database calls when no changes are detected.

### v1.0.0 Release Notes
**What's New**
- **Initial Deployment:** First stable deployment for functionality and bug testing.
- **Core Features:**
  - **Role-Based Access:** Distinct dashboards and workflows for Students and Instructors.
  - **Conflict Detection:** Real-time algorithms to prevent overlapping schedules.
  - **Class Management:** Instructors can create classes; Students can join via code.
  - **Task Manager:** Integrated Kanban-style task list and Pomodoro timer.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add NewFeature'`).
4.  Push to the branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

---

**Current Version:** 1.0.3