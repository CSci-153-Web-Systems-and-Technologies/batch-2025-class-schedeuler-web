import React from "react";
import { Card, CardContent } from "./Card";
import { cn } from "@/lib/utils";

interface BaseCardProps {
  className?: string;
  children?: React.ReactNode;
}

interface FeatureCardProps extends BaseCardProps {
  variant: "feature";
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepCardProps extends BaseCardProps {
  variant: "step";
  iconText: string;
  iconBgColor: string;
  iconShape: string;
  title: string;
  description: string;
}

type CustomCardProps = FeatureCardProps | StepCardProps;

const CustomCard = (props: CustomCardProps) => {
  const commonClasses = "h-fit transition-all duration-200";

  if (props.variant === "feature") {
    return (
      <Card className={cn(commonClasses, "hover:scale-[1.01] hover:shadow-sm", props.className)}>
        <CardContent className="flex items-center gap-4">
          {/* Icon with background */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {props.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground">
              {props.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {props.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      commonClasses, 
      "text-center flex flex-col group",
      "hover:scale-[1.02] transition-transform duration-200",

      "w-[200px] h-[223px] md:w-[220px] md:h-[245px] lg:w-[240px] lg:h-[267px] xl:w-[260px] xl:h-[290px]",
      "mx-auto", 
      props.className
    )}>
      <CardContent className="p-4 md:p-5 lg:p-6 flex flex-col items-center h-full flex-1 justify-between md:gap-3">
        <div
          className={cn(
            "w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center text-white font-bold flex-shrink-0 transition-all duration-300",
            "shadow-[0_12px_32px_rgba(65,105,225,0.302),_0_4px_12px_rgba(65,105,225,0.2)]",
            "group-hover:scale-120 group-hover:rotate-10",
            "group-hover:shadow-[0_16px_40px_rgba(65,105,225,0.4),_0_6px_16px_rgba(65,105,225,0.25)]",
            props.iconBgColor,
            props.iconShape
          )}
        >
          {props.iconText}
        </div>
        
        <div className="flex flex-col w-full flex-1 justify-center">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3 leading-tight">
            {props.title}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
            {props.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCard;