import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { PropertyList } from "@/components/property-list"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Ahlan House - Obyektlar",
  description: "Ko'p qavatli uylar sotuvini avtomatlashtirish tizimi - Obyektlar",
}

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Obyektlar</h2>
          <Link href="/properties/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yangi obyekt qo'shish
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <PropertyList />
        </div>
      </div>
    </div>
  )
}

