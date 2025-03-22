"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Textarea } from "@/components/ui/textarea"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Home } from "lucide-react"

export default function ReserveApartmentPage() {
  const params = useParams()
  const router = useRouter()
  const [apartment, setApartment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [paymentType, setPaymentType] = useState("cash")
  const [formData, setFormData] = useState({
    clientId: "",
    initialPayment: "",
    totalMonths: "12",
    comments: "",
  })

  useEffect(() => {
    // Simulate API call for apartment
    setTimeout(() => {
      const apartmentId = Number(params.id)

      // Mock apartment data
      const mockApartment = {
        id: apartmentId,
        propertyId: Math.floor(Math.random() * 3) + 1,
        propertyName: ["Navoiy 108K", "Navoiy 108L", "Baqachorsu"][Math.floor(Math.random() * 3)],
        number: `${Math.floor(Math.random() * 16) + 1}${String(Math.floor(Math.random() * 4) + 1).padStart(2, "0")}`,
        floor: Math.floor(Math.random() * 16) + 1,
        rooms: Math.floor(Math.random() * 3) + 1,
        area: 50 + Math.floor(Math.random() * 50),
        price: (50 + Math.floor(Math.random() * 50)) * 1000 + Math.floor(Math.random() * 10000),
        status: "available",
        description: "Zamonaviy ta'mirlangan, yorug' va shinam xonadon. Barcha qulayliklar mavjud.",
      }

      setApartment(mockApartment)

      // Mock clients data
      const mockClients = Array.from({ length: 5 }, (_, i) => {
        return {
          id: i + 1,
          name: `Mijoz ${i + 1}`,
          phone: `+998 9${i} 123 45 67`,
          email: `client${i + 1}@example.com`,
          passport: `AA${1000000 + i}`,
        }
      })

      setClients(mockClients)
      setLoading(false)

      // Set default initial payment (30% of price)
      setFormData((prev) => ({
        ...prev,
        initialPayment: Math.round(mockApartment.price * 0.3).toString(),
      }))
    }, 1000)
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      toast({
        title: "Xonadon band qilindi",
        description: "Xonadon muvaffaqiyatli band qilindi",
      })
      router.push(`/apartments/${apartment.id}`)
    }, 1500)
  }

  const calculateMonthlyPayment = () => {
    if (!apartment || !formData.initialPayment || !formData.totalMonths) return 0

    const remainingAmount = apartment.price - Number.parseInt(formData.initialPayment)
    return remainingAmount / Number.parseInt(formData.totalMonths)
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
            <h2 className="text-3xl font-bold tracking-tight">Xonadon band qilish</h2>
            <p className="text-muted-foreground">
              Xonadon № {apartment.number}, {apartment.propertyName}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/apartments/${apartment.id}`)}>
              <Home className="mr-2 h-4 w-4" />
              Xonadon sahifasi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Band qilish ma'lumotlari</CardTitle>
                <CardDescription>Xonadonni band qilish uchun ma'lumotlarni kiriting</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="existing" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="existing">Mavjud mijoz</TabsTrigger>
                      <TabsTrigger value="new">Yangi mijoz</TabsTrigger>
                    </TabsList>
                    <TabsContent value="existing">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientId">Mijozni tanlang</Label>
                          <Select
                            value={formData.clientId}
                            onValueChange={(value) => handleSelectChange("clientId", value)}
                            required
                          >
                            <SelectTrigger id="clientId">
                              <SelectValue placeholder="Mijozni tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.name} - {client.phone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="new">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">F.I.O.</Label>
                          <Input id="name" placeholder="Mijoz F.I.O." required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon raqami</Label>
                          <Input id="phone" placeholder="+998 90 123 45 67" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="mijoz@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passport">Passport ma'lumotlari</Label>
                          <Input id="passport" placeholder="AA1234567" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Manzil</Label>
                          <Input id="address" placeholder="Mijoz manzili" />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold mb-4">To'lov ma'lumotlari</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentType">To'lov turi</Label>
                          <Select value={paymentType} onValueChange={setPaymentType}>
                            <SelectTrigger id="paymentType">
                              <SelectValue placeholder="To'lov turini tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Naqd pul</SelectItem>
                              <SelectItem value="installment">Muddatli to'lov</SelectItem>
                              <SelectItem value="mortgage">Ipoteka</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {paymentType === "installment" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="initialPayment">Boshlang'ich to'lov ($)</Label>
                            <Input
                              id="initialPayment"
                              name="initialPayment"
                              type="number"
                              value={formData.initialPayment}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="totalMonths">To'lov muddati (oy)</Label>
                            <Select
                              value={formData.totalMonths}
                              onValueChange={(value) => handleSelectChange("totalMonths", value)}
                            >
                              <SelectTrigger id="totalMonths">
                                <SelectValue placeholder="Muddatni tanlang" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">6 oy</SelectItem>
                                <SelectItem value="12">12 oy</SelectItem>
                                <SelectItem value="24">24 oy</SelectItem>
                                <SelectItem value="36">36 oy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="comments">Qo'shimcha ma'lumot</Label>
                        <Textarea
                          id="comments"
                          name="comments"
                          placeholder="Qo'shimcha ma'lumot"
                          value={formData.comments}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.push(`/apartments/${apartment.id}`)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saqlanmoqda..." : "Band qilish"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Xonadon ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Obyekt:</span>
                    <span>{apartment.propertyName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Xonadon №:</span>
                    <span>{apartment.number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Qavat:</span>
                    <span>{apartment.floor}-qavat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Xonalar:</span>
                    <span>{apartment.rooms} xona</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maydon:</span>
                    <span>{apartment.area} m²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Narx:</span>
                    <span className="font-bold">${apartment.price.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentType === "installment" && (
              <Card>
                <CardHeader>
                  <CardTitle>To'lov kalkulyatori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Umumiy narx:</span>
                      <span>${apartment.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Boshlang'ich to'lov:</span>
                      <span>${Number.parseInt(formData.initialPayment || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Qolgan summa:</span>
                      <span>
                        ${(apartment.price - Number.parseInt(formData.initialPayment || "0")).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">To'lov muddati:</span>
                      <span>{formData.totalMonths} oy</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>Oylik to'lov:</span>
                      <span>${Math.round(calculateMonthlyPayment()).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

