import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="size-6" />
        Site de Estudos
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
