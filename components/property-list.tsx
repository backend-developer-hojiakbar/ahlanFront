"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Home, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function PropertyList() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProperty, setNewProperty] = useState({
    name: "",
    total_apartments: 0,
    floors: 0,
    address: "",
    description: "",
    image: "", // ixtiyoriy
  })

  // Obyektlarni API’dan yuklash
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("Token topilmadi. Iltimos, login qiling.")
        }

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }

        const objectsResponse = await fetch("http://127.0.0.1:8000/objects/", { headers })
        if (!objectsResponse.ok) {
          const text = await objectsResponse.text()
          throw new Error(`Objects endpoint xatoligi: ${text}`)
        }
        const objects = await objectsResponse.json()

        const apartmentsResponse = await fetch("http://127.0.0.1:8000/apartments/", { headers })
        if (!apartmentsResponse.ok) {
          const text = await apartmentsResponse.text()
          throw new Error(`Apartments endpoint xatoligi: ${text}`)
        }
        const apartments = await apartmentsResponse.json()

        const propertyList = objects.map((obj: any) => {
          const objApartments = apartments.filter((apt: any) => apt.object?.id === obj.id)
          return {
            id: obj.id,
            name: obj.name || "Noma'lum obyekt",
            totalApartments: obj.total_apartments || 0, // Modeldan keladi
            floors: obj.floors || 0, // Qo‘shimcha ma'lumot sifatida ishlatish mumkin
            address: obj.address || "",
            description: obj.description || "",
            image: obj.image || "/placeholder.svg?height=200&width=300",
            soldApartments: objApartments.filter((apt: any) => apt.status === "Sotilgan").length,
            reservedApartments: objApartments.filter((apt: any) => apt.status === "Band qilingan").length,
            availableApartments: objApartments.filter((apt: any) => apt.status === "Bo‘sh").length,
          }
        })

        propertyList.push({
          id: "add-new",
          name: "Yangi obyekt",
          totalApartments: 0,
          floors: 0,
          address: "",
          description: "",
          image: "",
          soldApartments: 0,
          reservedApartments: 0,
          availableApartments: 0,
          isAddNew: true,
        })

        setProperties(propertyList)
        setLoading(false)
      } catch (err: any) {
        console.error("Obyektlarni yuklashda xatolik:", err.message)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchProperties()
  }, [router])

  // Yangi obyekt qo‘shish funksiyasi
  const handleAddProperty = async (e: React.FormEvent) => {
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

      const response = await fetch("http://127.0.0.1:8000/objects/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newProperty.name,
          total_apartments: newProperty.total_apartments,
          floors: newProperty.floors,
          address: newProperty.address,
          description: newProperty.description,
          image: newProperty.image || null, // ixtiyoriy
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Obyekt qo‘shishda xatolik: ${text}`)
      }

      const addedProperty = await response.json()
      setProperties((prev) => [
        ...prev.filter((p) => !p.isAddNew),
        {
          id: addedProperty.id,
          name: addedProperty.name,
          totalApartments: addedProperty.total_apartments,
          floors: addedProperty.floors,
          address: addedProperty.address,
          description: addedProperty.description,
          image: addedProperty.image || "/placeholder.svg?height=200&width=300",
          soldApartments: 0,
          reservedApartments: 0,
          availableApartments: 0,
        },
        {
          id: "add-new",
          name: "Yangi obyekt",
          totalApartments: 0,
          floors: 0,
          address: "",
          description: "",
          image: "",
          soldApartments: 0,
          reservedApartments: 0,
          availableApartments: 0,
          isAddNew: true,
        },
      ])
      setNewProperty({ name: "", total_apartments: 0, floors: 0, address: "", description: "", image: "" })
      setIsAddDialogOpen(false)
    } catch (err: any) {
      console.error("Yangi obyekt qo‘shishda xatolik:", err.message)
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="p-4">Yuklanmoqda...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Xatolik yuz berdi: {error}. <br />
        <Button onClick={() => router.push("/login")}>Login qilish</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {properties.map((property) => (
        <Card
          key={property.id}
          className={`overflow-hidden ${property.isAddNew ? "border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors" : ""}`}
        >
          {property.isAddNew ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Yangi obyekt qo'shish</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Yangi qurilish obyektini tizimga qo'shish uchun bosing
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yangi obyekt qo‘shish</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProperty} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Obyekt nomi</Label>
                    <Input
                      id="name"
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      placeholder="Masalan, Navoiy 108K"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_apartments">Jami xonadonlar soni</Label>
                    <Input
                      id="total_apartments"
                      type="number"
                      value={newProperty.total_apartments}
                      onChange={(e) => setNewProperty({ ...newProperty, total_apartments: parseInt(e.target.value) || 0 })}
                      placeholder="Masalan, 120"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="floors">Qavatlar soni</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={newProperty.floors}
                      onChange={(e) => setNewProperty({ ...newProperty, floors: parseInt(e.target.value) || 0 })}
                      placeholder="Masalan, 10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Manzil</Label>
                    <Textarea
                      id="address"
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      placeholder="Masalan, Navoiy ko'chasi 108K, Toshkent"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Tavsif</Label>
                    <Textarea
                      id="description"
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                      placeholder="Obyekt haqida qisqacha ma'lumot"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Rasm URL (ixtiyoriy)</Label>
                    <Input
                      id="image"
                      value={newProperty.image}
                      onChange={(e) => setNewProperty({ ...newProperty, image: e.target.value })}
                      placeholder="Masalan, http://example.com/image.jpg"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Qo‘shish
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <div className="relative h-48">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-xl font-bold">{property.name}</h3>
                    <p className="text-sm opacity-90">{property.address}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Jami</span>
                    <span className="text-lg font-medium">{property.totalApartments}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Sotilgan</span>
                    <span className="text-lg font-medium text-green-600">{property.soldApartments}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Band</span>
                    <span className="text-lg font-medium text-yellow-600">{property.reservedApartments}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Bo'sh</span>
                    <span className="text-lg font-medium text-blue-600">{property.availableApartments}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/properties/${property.id}`)}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Batafsil
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/apartments?propertyId=${property.id}`)}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Xonadonlar
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}