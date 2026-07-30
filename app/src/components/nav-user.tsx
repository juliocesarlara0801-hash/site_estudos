"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { sair } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

function iniciais(nome?: string | null, email?: string) {
  if (nome) {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("");
  }
  return email?.slice(0, 2).toUpperCase() ?? "??";
}

export function NavUser({
  usuario,
}: {
  usuario: { email: string; nome?: string | null; avatarUrl?: string | null };
}) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sairEDeslogar() {
    if (saindo) return;
    setSaindo(true);
    await sair();
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm",
                "h-12 ring-sidebar-ring outline-hidden transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground",
                "focus-visible:ring-2"
              )}
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {iniciais(usuario.nome, usuario.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {usuario.nome ?? "Minha conta"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {usuario.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex flex-col px-1 py-1.5 text-left text-sm">
                    <span className="truncate font-medium">
                      {usuario.nome ?? "Minha conta"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {usuario.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
                  Aparência
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun /> Claro
                  {theme === "light" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon /> Escuro
                  {theme === "dark" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor /> Sistema
                  {theme === "system" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={saindo}
                onClick={sairEDeslogar}
              >
                <LogOut /> {saindo ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
