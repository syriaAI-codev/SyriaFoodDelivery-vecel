import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-e-transparent text-primary align-[-0.125em]",
        sizeClasses[size],
        className
      )}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        جاري التحميل...
      </span>
    </div>
  );
}