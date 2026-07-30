"use client";

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { sair } from "@/lib/actions/auth";
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
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                />
              }
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
              <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--anchor-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
            >
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
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1 text-xs text-muted-foreground">
                Aparência
              </DropdownMenuLabel>
              <DropdownMenuGroup>
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
              <DropdownMenuItem variant="destructive" onClick={() => sair()}>
                <LogOut /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
