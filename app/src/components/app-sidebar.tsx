"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  BarChart3,
  Target,
  Layers,
  Settings,
  GraduationCap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const ITENS_MENU = [
  { titulo: "Dashboard", url: "/dashboard", icone: LayoutDashboard },
  { titulo: "Calendário", url: "/calendario", icone: CalendarDays },
  { titulo: "Cronômetro", url: "/cronometro", icone: Timer },
  { titulo: "Estatísticas", url: "/estatisticas", icone: BarChart3 },
  { titulo: "Metas", url: "/metas", icone: Target },
  { titulo: "Flashcards", url: "/flashcards", icone: Layers },
  { titulo: "Configurações", url: "/configuracoes", icone: Settings },
];

export function AppSidebar({
  usuario,
}: {
  usuario: { email: string; nome?: string | null; avatarUrl?: string | null };
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Site de Estudos</span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITENS_MENU.map((item) => {
                const ativo = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={ativo}
                      tooltip={item.titulo}
                      render={
                        <Link href={item.url}>
                          <item.icone />
                          <span>{item.titulo}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <NavUser usuario={usuario} />
    </Sidebar>
  );
}
