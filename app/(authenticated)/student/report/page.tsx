// app/page.tsx (or any other page)
import BugReport from './components/BugReport';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';

export default function Home() {
  return (
    <main
      className="min-h-screen py-4 px-2 sm:py-6 sm:px-6 lg:py-6 lg:px-12"
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      <BugReport />
    </main>
  );
}