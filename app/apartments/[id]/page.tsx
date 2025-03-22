"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Building, Home, User, FileText, CreditCard } from "lucide-react"
import Link from "next/link"

export default function ApartmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [apartment, setApartment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("Token topilmadi. Iltimos, login qiling.")
        }

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }

        const apartmentId = params.id
        const response = await fetch(`https://ahlanapi.pythonanywhere.com/apartments/${apartmentId}/`, { headers })
        if (!response.ok) {
          const text = await response.text()
          throw new Error(`Apartment endpoint xatoligi: ${text}`)
        }

        const data = await response.json()
        setApartment({
          id: data.id,
          propertyId: data.object.id,
          propertyName: data.object.name,
          number: data.roomNumber,
          floor: data.floor,
          rooms: data.rooms,
          area: data.area,
          price: parseFloat(data.price),
          status: data.status,
          description: data.description,
          secret_code: data.secret_code,
          client: null, // Modelda user yo‘q, agar qo‘shilsa, keyin yangilanadi
          reservationDate: data.status === "Band qilingan" ? new Date().toISOString() : null, // Agar reservation_date qo‘shilsa, o‘zgartiramiz
          soldDate: data.status === "Sotilgan" ? new Date().toISOString() : null, // Agar sold_date qo‘shilsa, o‘zgartiramiz
          features: data.features || [], // Agar modelda features bo‘lsa, qo‘shamiz
          images: data.images || ["/placeholder.svg?height=300&width=500"], // Agar modelda images bo‘lsa, qo‘shamiz
          payments: data.payments || [], // Agar Payment modeli bo‘lsa, keyin ulaymiz
          documents: data.documents || [], // Agar Document modeli bo‘lsa, keyin ulaymiz
        })
        setLoading(false)
      } catch (err: any) {
        console.error("Xonadon ma'lumotlarini yuklashda xatolik:", err.message)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchApartment()
  }, [params.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Bo‘sh":
        return <Badge className="bg-blue-500">Bo'sh</Badge>
      case "Band qilingan":
        return <Badge className="bg-yellow-500">Band</Badge>
      case "Sotilgan":
        return <Badge className="bg-green-500">Sotilgan</Badge>
      default:
        return <Badge className="bg-gray-500">Noma'lum</Badge>
    }
  }

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

  if (error) {
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
          <div className="flex items-center justify-center h-[80vh] text-red-600">
            Xatolik yuz berdi: {error}. <br />
            <Button onClick={() => router.push("/login")}>Login qilish</Button>
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
            <h2 className="text-3xl font-bold tracking-tight">Xonadon № {apartment.number}</h2>
            <p className="text-muted-foreground">{apartment.propertyName}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/apartments")}>
              <Home className="mr-2 h-4 w-4" />
              Barcha xonadonlar
            </Button>
            <Link href={`/properties/${apartment.propertyId}`}>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Obyekt sahifasi
              </Button>
            </Link>
            {apartment.status === "Bo‘sh" && (
              <Button onClick={() => router.push(`/apartments/${apartment.id}/reserve`)}>
                <User className="mr-2 h-4 w-4" />
                Band qilish
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-[300px]">
                  <img
                    src={apartment.images[0]}
                    alt={`Xonadon № ${apartment.number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">{getStatusBadge(apartment.status)}</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Qavat</span>
                      <span className="text-lg font-medium">{apartment.floor}-qavat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Xonalar</span>
                      <span className="text-lg font-medium">{apartment.rooms} xona</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Maydon</span>
                      <span className="text-lg font-medium">{apartment.area} m²</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Narx</span>
                      <span className="text-lg font-medium">${apartment.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-2">Tavsif</h3>
                  <p className="text-muted-foreground mb-4">{apartment.description}</p>

                  {apartment.features.length > 0 && (
                    <>
                      <h3 className="text-lg font-bold mb-2">Qulayliklar</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {apartment.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="mr-2 h-4 w-4 text-green-500"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Xonadon holati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Holati:</span>
                    <span>{getStatusBadge(apartment.status)}</span>
                  </div>

                  {apartment.status !== "Bo‘sh" && apartment.client && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Mijoz:</span>
                        <span>{apartment.client.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span>{apartment.client.phone}</span>
                      </div>
                    </>
                  )}

                  {apartment.status === "Band qilingan" && apartment.reservationDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Band qilingan sana:</span>
                      <span>{new Date(apartment.reservationDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {apartment.status === "Sotilgan" && apartment.soldDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sotilgan sana:</span>
                      <span>{new Date(apartment.soldDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {apartment.status === "Bo‘sh" && (
                    <Button className="w-full" onClick={() => router.push(`/apartments/${apartment.id}/reserve`)}>
                      <User className="mr-2 h-4 w-4" />
                      Band qilish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {apartment.status !== "Bo‘sh" && (
              <Card>
                <CardHeader>
                  <CardTitle>To'lovlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apartment.payments.length > 0 ? (
                      apartment.payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {payment.type === "initial" ? "Boshlang'ich to'lov" : "Oylik to'lov"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${payment.amount.toLocaleString()}</div>
                            <div>
                              {payment.status === "paid" ? (
                                <Badge className="bg-green-500">To'langan</Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                  Kutilmoqda
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">To'lovlar mavjud emas</p>
                    )}
                    <Button className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      To'lov qo'shish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {apartment.status !== "Bo‘sh" && (
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
              <TabsTrigger value="payments">To'lovlar jadvali</TabsTrigger>
              <TabsTrigger value="history">Tarix</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hujjatlar</CardTitle>
                  <CardDescription>Xonadon bilan bog'liq barcha hujjatlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apartment.documents.length > 0 ? (
                      apartment.documents.map((document: any) => (
                        <div key={document.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{document.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(document.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Yuklab olish
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Hujjatlar mavjud emas</p>
                    )}
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Yangi hujjat qo'shish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>To'lovlar jadvali</CardTitle>
                  <CardDescription>Xonadon uchun to'lovlar jadvali</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center border rounded">
                    <p className="text-muted-foreground">To'lovlar jadvali ma'lumotlari yuklanmoqda...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tarix</CardTitle>
                  <CardDescription>Xonadon bilan bog'liq barcha o'zgarishlar tarixi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center border rounded">
                    <p className="text-muted-foreground">Tarix ma'lumotlari yuklanmoqda...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}