"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Home, DollarSign, User, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function ApartmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyIdParam = searchParams.get("propertyId")

  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newApartment, setNewApartment] = useState({
    object: "",
    roomNumber: 0,
    rooms: 0,
    area: 0,
    floor: 0,
    price: 0,
    status: "Bo‘sh",
    description: "",
  })
  const [filters, setFilters] = useState({
    propertyId: propertyIdParam || "",
    status: "",
    rooms: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    floor: "",
  })

  // API’dan ma'lumotlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("Token topilmadi. Iltimos, login qiling.")
        }

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }

        // Obyektlarni yuklash
        const objectsResponse = await fetch("http://127.0.0.1:8000/objects/", { headers })
        if (!objectsResponse.ok) {
          const text = await objectsResponse.text()
          throw new Error(`Objects endpoint xatoligi: ${text}`)
        }
        const objects = await objectsResponse.json()
        setProperties(objects)

        // Xonadonlarni yuklash
        const apartmentsResponse = await fetch("http://127.0.0.1:8000/apartments/", { headers })
        if (!apartmentsResponse.ok) {
          const text = await apartmentsResponse.text()
          throw new Error(`Apartments endpoint xatoligi: ${text}`)
        }
        const apartmentsData = await apartmentsResponse.json()

        // Xonadonlarni formatlash
        const formattedApartments = apartmentsData.map((apt: any) => ({
          id: apt.id,
          propertyId: apt.object.id,
          propertyName: apt.object.name,
          number: apt.roomNumber,
          floor: apt.floor,
          rooms: apt.rooms,
          area: apt.area,
          price: parseFloat(apt.price),
          status: apt.status,
          description: apt.description,
          secret_code: apt.secret_code,
          client: apt.user ? { name: apt.user.username, phone: apt.user.phone || "Noma'lum" } : null,
          reservationDate: apt.status === "Band qilingan" ? new Date().toISOString() : null,
          soldDate: apt.status === "Sotilgan" ? new Date().toISOString() : null,
        }))

        setApartments(formattedApartments)
        setLoading(false)
      } catch (err: any) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err.message)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyIdParam])

  // Yangi xonadon qo‘shish
  const handleAddApartment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Token topilmadi. Iltimos, login qiling.")
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }

      const response = await fetch("http://127.0.0.1:8000/apartments/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          object: parseInt(newApartment.object), // Faqat ID yuboriladi
          roomNumber: newApartment.roomNumber,
          rooms: newApartment.rooms,
          area: newApartment.area,
          floor: newApartment.floor,
          price: newApartment.price,
          status: newApartment.status,
          description: newApartment.description,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Xonadon qo‘shishda xatolik: ${text}`)
      }

      const addedApartment = await response.json()
      setApartments((prev) => [
        ...prev,
        {
          id: addedApartment.id,
          propertyId: addedApartment.object, // Faqat ID sifatida qaytadi
          propertyName: properties.find((p) => p.id === addedApartment.object)?.name || "Noma'lum",
          number: addedApartment.roomNumber,
          floor: addedApartment.floor,
          rooms: addedApartment.rooms,
          area: addedApartment.area,
          price: parseFloat(addedApartment.price),
          status: addedApartment.status,
          description: addedApartment.description,
          secret_code: addedApartment.secret_code,
          client: null,
          reservationDate: null,
          soldDate: null,
        },
      ])
      setNewApartment({
        object: "",
        roomNumber: 0,
        rooms: 0,
        area: 0,
        floor: 0,
        price: 0,
        status: "Bo‘sh",
        description: "",
      })
      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Yangi xonadon qo‘shishda xatolik:", err.message)
      setError(err.message)
    }
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === "all" ? "" : value }))
  }

  const filteredApartments = apartments.filter((apartment) => {
    if (filters.propertyId && apartment.propertyId !== Number.parseInt(filters.propertyId)) return false
    if (filters.status && apartment.status !== filters.status) return false
    if (filters.rooms && apartment.rooms !== Number.parseInt(filters.rooms)) return false
    if (filters.minPrice && apartment.price < Number.parseInt(filters.minPrice)) return false
    if (filters.maxPrice && apartment.price > Number.parseInt(filters.maxPrice)) return false
    if (filters.minArea && apartment.area < Number.parseInt(filters.minArea)) return false
    if (filters.maxArea && apartment.area > Number.parseInt(filters.maxArea)) return false
    if (filters.floor && apartment.floor !== Number.parseInt(filters.floor)) return false
    return true
  })

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        Xatolik yuz berdi: {error}. <br />
        <Button onClick={() => router.push("/login")}>Login qilish</Button>
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
          <h2 className="text-3xl font-bold tracking-tight">Xonadonlar</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi xonadon qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yangi xonadon qo‘shish</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddApartment} className="space-y-4">
                <div>
                  <Label htmlFor="object">Obyekt</Label>
                  <Select
                    value={newApartment.object}
                    onValueChange={(value) => setNewApartment({ ...newApartment, object: value })}
                  >
                    <SelectTrigger id="object">
                      <SelectValue placeholder="Obyekt tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomNumber">Xona raqami</Label>
                  <Input
                    id="roomNumber"
                    type="number"
                    value={newApartment.roomNumber}
                    onChange={(e) =>
                      setNewApartment({ ...newApartment, roomNumber: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Masalan, 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rooms">Xonalar soni</Label>
                  <Input
                    id="rooms"
                    type="number"
                    value={newApartment.rooms}
                    onChange={(e) => setNewApartment({ ...newApartment, rooms: parseInt(e.target.value) || 0 })}
                    placeholder="Masalan, 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Maydon (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={newApartment.area}
                    onChange={(e) => setNewApartment({ ...newApartment, area: parseFloat(e.target.value) || 0 })}
                    placeholder="Masalan, 65.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Qavat</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={newApartment.floor}
                    onChange={(e) => setNewApartment({ ...newApartment, floor: parseInt(e.target.value) || 0 })}
                    placeholder="Masalan, 5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Narx</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newApartment.price}
                    onChange={(e) => setNewApartment({ ...newApartment, price: parseFloat(e.target.value) || 0 })}
                    placeholder="Masalan, 50000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Holati</Label>
                  <Select
                    value={newApartment.status}
                    onValueChange={(value) => setNewApartment({ ...newApartment, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Holatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bo‘sh">Bo'sh</SelectItem>
                      <SelectItem value="Band qilingan">Band</SelectItem>
                      <SelectItem value="Sotilgan">Sotilgan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    value={newApartment.description}
                    onChange={(e) => setNewApartment({ ...newApartment, description: e.target.value })}
                    placeholder="Xonadon haqida qisqacha ma'lumot"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Qo‘shish
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Obyekt</Label>
                <Select value={filters.propertyId} onValueChange={(value) => handleFilterChange("propertyId", value)}>
                  <SelectTrigger id="propertyId">
                    <SelectValue placeholder="Barcha obyektlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha obyektlar</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Holati</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Barcha holatlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha holatlar</SelectItem>
                    <SelectItem value="Bo‘sh">Bo'sh</SelectItem>
                    <SelectItem value="Band qilingan">Band</SelectItem>
                    <SelectItem value="Sotilgan">Sotilgan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Xonalar soni</Label>
                <Select value={filters.rooms} onValueChange={(value) => handleFilterChange("rooms", value)}>
                  <SelectTrigger id="rooms">
                    <SelectValue placeholder="Barcha xonalar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha xonalar</SelectItem>
                    <SelectItem value="1">1 xona</SelectItem>
                    <SelectItem value="2">2 xona</SelectItem>
                    <SelectItem value="3">3 xona</SelectItem>
                    <SelectItem value="4">4 xona</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Qavat</Label>
                <Select value={filters.floor} onValueChange={(value) => handleFilterChange("floor", value)}>
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="Barcha qavatlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha qavatlar</SelectItem>
                    {Array.from({ length: 16 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}-qavat
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimal narx</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Minimal narx"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maksimal narx</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Maksimal narx"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minArea">Minimal maydon</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="Minimal maydon"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange("minArea", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxArea">Maksimal maydon</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="Maksimal maydon"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Xonadonlar ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredApartments.map((apartment) => (
              <Card
                key={apartment.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/apartments/${apartment.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">№ {apartment.number}</h3>
                      <p className="text-sm text-muted-foreground">{apartment.propertyName}</p>
                    </div>
                    {getStatusBadge(apartment.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {apartment.rooms} xona, {apartment.area} m², {apartment.floor}-qavat
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>${apartment.price.toLocaleString()}</span>
                    </div>

                    {apartment.status !== "Bo‘sh" && apartment.client && (
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{apartment.client.name}</span>
                      </div>
                    )}

                    {apartment.status === "Band qilingan" && apartment.reservationDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Band: {new Date(apartment.reservationDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {apartment.status === "Sotilgan" && apartment.soldDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Sotilgan: {new Date(apartment.soldDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/apartments/${apartment.id}`)
                      }}
                    >
                      Batafsil
                    </Button>

                    {apartment.status === "Bo‘sh" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/apartments/${apartment.id}/reserve`)
                        }}
                      >
                        Band qilish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}