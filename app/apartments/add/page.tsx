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
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function AddApartmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyIdParam = searchParams.get("propertyId")

  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [formData, setFormData] = useState({
    propertyId: propertyIdParam || "",
    number: "",
    floor: "",
    rooms: "",
    area: "",
    price: "",
    description: "",
  })

  useEffect(() => {
    // Simulate API call for properties
    setTimeout(() => {
      const mockProperties = [
        { id: 1, name: "Navoiy 108K" },
        { id: 2, name: "Navoiy 108L" },
        { id: 3, name: "Baqachorsu" },
      ]

      setProperties(mockProperties)
    }, 500)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Xonadon qo'shildi",
        description: "Yangi xonadon muvaffaqiyatli qo'shildi",
      })
      router.push("/apartments")
    }, 1500)
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
          <h2 className="text-3xl font-bold tracking-tight">Yangi xonadon qo'shish</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Xonadon ma'lumotlari</CardTitle>
            <CardDescription>Yangi xonadon haqida asosiy ma'lumotlarni kiriting</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Obyekt</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(value) => handleSelectChange("propertyId", value)}
                    required
                  >
                    <SelectTrigger id="propertyId">
                      <SelectValue placeholder="Obyektni tanlang" />
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
                <div className="space-y-2">
                  <Label htmlFor="number">Xonadon raqami</Label>
                  <Input
                    id="number"
                    name="number"
                    placeholder="Masalan: 1001"
                    value={formData.number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Qavat</Label>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    placeholder="Masalan: 10"
                    value={formData.floor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">Xonalar soni</Label>
                  <Input
                    id="rooms"
                    name="rooms"
                    type="number"
                    placeholder="Masalan: 3"
                    value={formData.rooms}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Maydon (m²)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    placeholder="Masalan: 75"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Narx ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Masalan: 50000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Xonadon haqida qo'shimcha ma'lumot"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/apartments")}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

