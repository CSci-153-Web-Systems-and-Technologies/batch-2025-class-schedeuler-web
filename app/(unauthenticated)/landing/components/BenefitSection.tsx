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
    <Card className="p-6 h-full shadow-[0_32px_64px_0_rgba(65,105,225,0.12),_0_8px_24px_0_rgba(65,105,225,0.0784)]">
      <CardContent className="p-0">
        <ul className="flex flex-col gap-4">
          {BENEFITS.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2">
              <strong className="text-lg flex-shrink-0 text-foreground">
                {benefit.feature} —
              </strong>
              <span className="text-foreground/80">{benefit.description}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  const renderComparisonTable = () => (
    <div className="w-full overflow-x-auto rounded-2xl bg-white p-4 shadow-[0_32px_64px_0_rgba(65,105,225,0.12),_0_8px_24px_0_rgba(65,105,225,0.0784)] h-full flex flex-col justify-between">
      <div className="inline-block min-w-full align-middle">
        <Table className="min-w-full border-collapse text-sm md:text-base">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#4169e1] to-[#6a5acd] ">
              <TableHead className="py-3 px-4 text-left font-bold text-white rounded-tl-2xl rounded-bl-2xl">
                Feature
              </TableHead>
              <TableHead className="py-3 px-4 text-center font-bold text-white">
                SchedEuler
              </TableHead> 
              <TableHead className="py-3 px-4 text-center font-bold text-white rounded-tr-2xl rounded-br-2xl">
                Others
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-black bg-white">
            {COMPARISON_DATA.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="py-3 px-4 font-medium">
                  {row.feature}
                </TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <span className="text-green-600 text-xl font-bold">
                    {row.schedEuler}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "py-3 px-4 text-center",
                  row.others === "✕" ? "text-red-500" : "text-foreground"
                )}>
                  <span className={cn(
                    "font-bold",
                    row.others === "✕" ? "text-xl" : "text-base"
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
    <section id={id} className={cn("flex flex-col gap-6 mb-8", className)}>
      <h2 className="text-2xl font-bold">Why Choose SchedEuler?</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {renderBenefitsList()}
        {renderComparisonTable()}
      </div>
    </section>
  );
};

export default BenefitSection;