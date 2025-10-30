
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { BarChart, Users, Church, HelpCircle, History } from "lucide-react"
import { Button } from "../ui/button"
import LogoutButton from "./logout-button"


function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between gap-2 p-2">
                 <Button asChild variant="ghost" size="icon" className="text-sidebar-foreground">
                    <Link href="/">
                        <Church />
                    </Link>
                </Button>
                <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                    Painel TF2k26
                </h2>
                <div className="group-data-[collapsible=icon]:hidden">
                    <LogoutButton />
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname === "/admin/dashboard"}
                onClick={() => setOpenMobile(false)}
              >
                <Link href="/admin/dashboard">
                    <BarChart />
                    Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname === "/admin"}
                onClick={() => setOpenMobile(false)}
              >
                <Link href="/admin">
                    <Users />
                    Inscrições
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname.startsWith("/admin/questions")}
                onClick={() => setOpenMobile(false)}
              >
                <Link href="/admin/questions">
                    <HelpCircle />
                    Dúvidas
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={pathname.startsWith("/admin/logs")}
                onClick={() => setOpenMobile(false)}
              >
                <Link href="/admin/logs">
                    <History />
                    Logs de Atividade
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <div className="p-4 mt-auto group-data-[collapsible=icon]:p-2">
            <div className="hidden group-data-[collapsible=icon]:block">
                 <LogoutButton />
            </div>
        </div>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center justify-between md:hidden p-4 sm:p-6 md:p-8 pb-0">
            <h2 className="text-xl font-bold">Painel TF2k26</h2>
            <SidebarTrigger />
        </div>
        <div className="p-4 sm:p-6 md:p-8">
            {children}
        </div>
      </SidebarInset>
    </>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}
// Trigger commit
