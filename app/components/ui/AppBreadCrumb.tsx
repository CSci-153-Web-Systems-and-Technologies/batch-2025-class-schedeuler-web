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
import Link from "next/link"; 

export default function AppBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const toTitleCase = (str: string) =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const userType = segments[0];
  const dashboardHref = `/${userType}/dashboard`;

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link 
              href={dashboardHref}
              style={{ color: 'var(--color-breadcrumb-text)' }}
              className="hover:opacity-80 transition-opacity duration-200"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-breadcrumb-text-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-breadcrumb-text)'; }}
            >
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments[1] && segments[1] !== 'dashboard' && (
          <>
            <BreadcrumbSeparator style={{ color: 'var(--color-breadcrumb-separator)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage 
                style={{ color: 'var(--color-breadcrumb-current)' }}
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