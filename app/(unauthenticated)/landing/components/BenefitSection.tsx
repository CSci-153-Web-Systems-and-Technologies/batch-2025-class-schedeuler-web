// app/(unauthenticated)/landing/components/BenefitSection.tsx
"use client";

import { Card, CardContent } from "@/app/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/Table";
import { SectionProps } from "@/types/sections";
import { cn } from "@/lib/utils";

interface Benefit {
  feature: string;
  description: string;
}

interface Comparison {
  feature: string;
  schedEuler: string;
  others: string;
}

const BENEFITS: Benefit[] = [
  { feature: "Save Time", description: "No more manual errors or overlaps" },
  { feature: "Boost Productivity", description: "Pomodoro and tasks keep you focused." },
  { feature: "Accessible Anywhere", description: "Works on mobile, tablet, or desktop." },
  { feature: "Secure & Private", description: "Database-protected data and role-based controls." },
];

const COMPARISON_DATA: Comparison[] = [
  { feature: "No Ads / No Paywalls", schedEuler: "✓", others: "✕" },
  { feature: "Real-time Conflicts", schedEuler: "✓", others: "Partial" },
  { feature: "Role-based Access", schedEuler: "✓", others: "Limited" },
];

const BenefitSection = ({ id, className }: SectionProps) => {
  const renderBenefitsList = () => (
    <Card className="p-5 sm:p-6 h-full shadow-[0_32px_64px_0_rgba(65,105,225,0.12),_0_8px_24px_0_rgba(65,105,225,0.0784)]">
      <CardContent className="p-0">
        <ul className="flex flex-col gap-4 sm:gap-5">
          {BENEFITS.map((benefit, index) => (
            <li key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
              <strong className="text-base sm:text-lg text-foreground shrink-0 font-bold">
                {benefit.feature} <span className="hidden sm:inline">—</span>
              </strong>
              <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {benefit.description}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  const renderComparisonTable = () => (
    <div className="w-full overflow-hidden rounded-2xl bg-white p-3 sm:p-4 shadow-[0_32px_64px_0_rgba(65,105,225,0.12),_0_8px_24px_0_rgba(65,105,225,0.0784)] h-full flex flex-col justify-between border border-border/50">
      <div className="inline-block min-w-full align-middle overflow-x-auto">
        <Table className="min-w-full border-collapse text-xs sm:text-sm md:text-base">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#4169e1] to-[#6a5acd] border-none hover:bg-transparent">
              <TableHead className="py-2.5 px-3 md:py-3 md:px-4 text-left font-bold text-white first:rounded-tl-xl md:first:rounded-tl-2xl first:rounded-bl-xl md:first:rounded-bl-2xl w-[40%]">
                Feature
              </TableHead>
              <TableHead className="py-2.5 px-2 md:py-3 md:px-4 text-center font-bold text-white w-[30%]">
                SchedEuler
              </TableHead> 
              <TableHead className="py-2.5 px-2 md:py-3 md:px-4 text-center font-bold text-white last:rounded-tr-xl md:last:rounded-tr-2xl last:rounded-br-xl md:last:rounded-br-2xl w-[30%]">
                Others
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-foreground bg-white">
            {COMPARISON_DATA.map((row, index) => (
              <TableRow key={index} className="border-b border-gray-100 last:border-0 hover:bg-muted/5">
                <TableCell className="py-3 px-3 md:py-4 md:px-4 font-medium align-middle">
                  {row.feature}
                </TableCell>
                <TableCell className="py-3 px-2 md:py-4 md:px-4 text-center align-middle">
                  <span className="text-green-600 text-lg md:text-xl font-bold">
                    {row.schedEuler}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "py-3 px-2 md:py-4 md:px-4 text-center align-middle",
                  row.others === "✕" ? "text-red-500" : "text-muted-foreground"
                )}>
                  <span className={cn(
                    "font-bold",
                    row.others === "✕" ? "text-lg md:text-xl" : "text-xs md:text-sm font-medium"
                  )}>
                    {row.others}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <section id={id} className={cn("flex flex-col gap-8 md:gap-10 mb-12 md:mb-20", className)}>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold lg:text-left text-foreground">
        Why Choose SchedEuler?
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {renderBenefitsList()}
        {renderComparisonTable()}
      </div>
    </section>
  );
};

export default BenefitSection;