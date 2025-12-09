"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/app/components/ui/Breadcrumb"
import { usePathname } from "next/navigation";

export default function AppBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const toTitleCase = (str: string) =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Get user type (student/instructor) from first segment
  const userType = segments[0];
  const dashboardHref = `/${userType}/dashboard`;

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        {/* Always show Dashboard as the first breadcrumb */}
        <BreadcrumbItem>
          <BreadcrumbLink 
            href={dashboardHref}
            style={{
              color: 'var(--color-breadcrumb-text)',
            }}
            className="hover:opacity-80 transition-opacity duration-200"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-breadcrumb-text-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-breadcrumb-text)';
            }}
          >
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Show current page if not on dashboard */}
        {segments[1] && segments[1] !== 'dashboard' && (
          <>
            <BreadcrumbSeparator 
              style={{
                color: 'var(--color-breadcrumb-separator)',
              }}
            />
            <BreadcrumbItem>
              <BreadcrumbPage 
                style={{
                  color: 'var(--color-breadcrumb-current)',
                }}
                className="font-medium"
              >
                {toTitleCase(segments[1])}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}