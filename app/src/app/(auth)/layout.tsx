import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-[0.15] blur-3xl"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      />
      <div className="flex items-center gap-2 text-lg font-heading font-semibold">
        <div
          className="flex size-9 items-center justify-center rounded-xl text-white shadow-lg shadow-primary/20"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <GraduationCap className="size-5" />
        </div>
        Site de Estudos
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
