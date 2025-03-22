"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { Building, Home, Plus, FileText, CreditCard, BarChart3 } from "lucide-react"
import { ApartmentGrid } from "@/components/apartment-grid"
import { PropertyExpenses } from "@/components/property-expenses"
import Link from "next/link"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const propertyId = Number(params.id)

      // Mock data
      const mockProperty = {
        id: propertyId,
        name: propertyId === 1 ? "Navoiy 108K" : propertyId === 2 ? "Navoiy 108L" : "Baqachorsu",
        address:
          propertyId === 1
            ? "Navoiy ko'chasi 108K, Toshkent"
            : propertyId === 2
              ? "Navoiy ko'chasi 108L, Toshkent"
              : "Baqachorsu mavzesi, Toshkent",
        description: "Zamonaviy qurilish texnologiyalari asosida qurilgan ko'p qavatli turar-joy binosi",
        totalFloors: 16,
        totalApartments: propertyId === 1 ? 120 : propertyId === 2 ? 80 : 150,
        soldApartments: propertyId === 1 ? 85 : propertyId === 2 ? 45 : 100,
        reservedApartments: propertyId === 1 ? 15 : propertyId === 2 ? 10 : 20,
        availableApartments: propertyId === 1 ? 20 : propertyId === 2 ? 25 : 30,
        startDate: "2022-03-15",
        endDate: "2023-12-30",
        image: "/placeholder.svg?height=300&width=600",
      }

      setProperty(mockProperty)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
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
          <div className="flex items-center justify-center h-[80vh]">
            <p className="text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    )
  }

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
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{property.name}</h2>
            <p className="text-muted-foreground">{property.address}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/properties")}>
              <Building className="mr-2 h-4 w-4" />
              Barcha obyektlar
            </Button>
            <Link href={`/apartments/add?propertyId=${property.id}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi xonadon qo'shish
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami xonadonlar</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.totalApartments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sotilgan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{property.soldApartments}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((property.soldApartments / property.totalApartments) * 100)}% sotilgan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Band qilingan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{property.reservedApartments}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((property.reservedApartments / property.totalApartments) * 100)}% band
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bo'sh</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{property.availableApartments}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((property.availableApartments / property.totalApartments) * 100)}% bo'sh
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-xl">
          <img src={property.image || "/placeholder.svg"} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white max-w-3xl">
              <p className="text-lg">{property.description}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <span>Qavatlar: {property.totalFloors}</span>
                <span>Qurilish boshlangan: {new Date(property.startDate).toLocaleDateString()}</span>
                <span>Tugash sanasi: {new Date(property.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="apartments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="apartments">Xonadonlar</TabsTrigger>
            <TabsTrigger value="expenses">Xarajatlar</TabsTrigger>
            <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitika</TabsTrigger>
          </TabsList>
          <TabsContent value="apartments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Xonadonlar ro'yxati</h3>
              <Link href={`/apartments/add?propertyId=${property.id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi xonadon qo'shish
                </Button>
              </Link>
            </div>
            <ApartmentGrid propertyId={property.id} />
          </TabsContent>
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Xarajatlar</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi xarajat qo'shish
              </Button>
            </div>
            <PropertyExpenses propertyId={property.id} />
          </TabsContent>
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hujjatlar</CardTitle>
                <CardDescription>Obyekt bilan bog'liq barcha hujjatlar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded">
                  <p className="text-muted-foreground">Hujjatlar ro'yxati yuklanmoqda...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analitika</CardTitle>
                <CardDescription>Obyekt bo'yicha batafsil analitika</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border rounded">
                  <p className="text-muted-foreground">Analitika ma'lumotlari yuklanmoqda...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

