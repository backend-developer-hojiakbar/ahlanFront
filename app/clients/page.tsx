"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Plus, Eye, Edit, Trash, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    fio: "",
    phone_number: "",
    address: "",
    password: "",
    object_id: "",
    apartment_id: "",
    kafil_fio: "",
    kafil_phone_number: "",
    kafil_address: "",
    kafil_password: "",
  })
  const [properties, setProperties] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [filters, setFilters] = useState({ object_id: "" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

        const headers = { "Authorization": `Bearer ${token}` }

        // Obyektlarni yuklash
        const propertiesResponse = await fetch("https://ahlanapi.pythonanywhere.com/objects/", { headers })
        if (!propertiesResponse.ok) throw new Error(`Objects endpoint xatoligi: ${propertiesResponse.status}`)
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData)

        // Xonadonlarni yuklash
        const apartmentsResponse = await fetch("https://ahlanapi.pythonanywhere.com/apartments/", { headers })
        if (!apartmentsResponse.ok) throw new Error(`Apartments endpoint xatoligi: ${apartmentsResponse.status}`)
        const apartmentsData = await apartmentsResponse.json()
        setApartments(apartmentsData)

        // Mijozlarni yuklash
        const clientsResponse = await fetch("https://ahlanapi.pythonanywhere.com/clients/", { headers })
        if (!clientsResponse.ok) throw new Error(`Clients endpoint xatoligi: ${clientsResponse.status}`)
        const clientsData = await clientsResponse.json()
        const formattedClients = clientsData.map((client: any) => ({
          id: client.id,
          fio: client.fio,
          phone_number: client.phone_number,
          address: client.address,
          object_id: client.object_id,
          object_name: client.object_name || propertiesData.find((p: any) => p.id === client.object_id)?.name || "Noma'lum",
          apartment_id: client.apartment_id,
          apartment_number: client.apartment_number || apartmentsData.find((a: any) => a.id === client.apartment_id)?.roomNumber || "Noma'lum",
          balance: parseFloat(client.balance),
          kafil_fio: client.kafil_fio,
          kafil_phone_number: client.kafil_phone_number,
        }))
        setClients(formattedClients)
        setLoading(false)
      } catch (err: any) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err.message)
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value === "all" ? "" : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

      const payload = {
        fio: formData.fio,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password,
        object_id: formData.object_id ? parseInt(formData.object_id) : null,
        apartment_id: formData.apartment_id ? parseInt(formData.apartment_id) : null,
        kafil_fio: formData.kafil_fio || null,
        kafil_phone_number: formData.kafil_phone_number || null,
        kafil_address: formData.kafil_address || null,
        kafil_password: formData.kafil_password || null,
      }

      console.log("Yuborilayotgan ma'lumotlar:", JSON.stringify(payload)) // Debugging uchun

      const response = await fetch("https://ahlanapi.pythonanywhere.com/clients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || JSON.stringify(errorData) || "Noma'lum xatolik"
        throw new Error(`Mijoz qo‘shishda xatolik: ${errorMessage}`)
      }

      const newClient = await response.json()
      const objectName = properties.find(p => p.id === newClient.object_id)?.name || "Noma'lum"
      const apartmentNumber = apartments.find(a => a.id === newClient.apartment_id)?.roomNumber || "Noma'lum"

      setClients(prev => [{
        id: newClient.id,
        fio: newClient.fio,
        phone_number: newClient.phone_number,
        address: newClient.address,
        object_id: newClient.object_id,
        object_name: newClient.object_name || objectName,
        apartment_id: newClient.apartment_id,
        apartment_number: newClient.apartment_number || apartmentNumber,
        balance: parseFloat(newClient.balance),
        kafil_fio: newClient.kafil_fio,
        kafil_phone_number: newClient.kafil_phone_number,
      }, ...prev])

      setFormData({
        fio: "",
        phone_number: "",
        address: "",
        password: "",
        object_id: "",
        apartment_id: "",
        kafil_fio: "",
        kafil_phone_number: "",
        kafil_address: "",
        kafil_password: "",
      })
      setOpen(false)
      toast({ title: "Mijoz qo'shildi", description: "Yangi mijoz muvaffaqiyatli qo'shildi" })
    } catch (err: any) {
      console.error("Mijoz qo‘shishda xatolik:", err.message)
      toast({ title: "Xatolik", description: err.message, variant: "destructive" })
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === "" || 
      client.fio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone_number.includes(searchTerm) ||
      (client.kafil_fio && client.kafil_fio.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = !filters.object_id || client.object_id === parseInt(filters.object_id)
    return matchesSearch && matchesFilter
  })

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
          <h2 className="text-3xl font-bold tracking-tight">Mijozlar</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi mijoz qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Yangi mijoz qo'shish</DialogTitle>
                  <DialogDescription>Yangi mijoz ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fio">F.I.O.</Label>
                      <Input id="fio" name="fio" value={formData.fio} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Telefon</Label>
                      <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Manzil</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Parol</Label>
                      <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="object_id">Obyekt</Label>
                      <Select value={formData.object_id} onValueChange={(value) => handleSelectChange("object_id", value)}>
                        <SelectTrigger id="object_id">
                          <SelectValue placeholder="Obyektni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map(property => (
                            <SelectItem key={property.id} value={property.id.toString()}>{property.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment_id">Xonadon</Label>
                      <Select value={formData.apartment_id} onValueChange={(value) => handleSelectChange("apartment_id", value)}>
                        <SelectTrigger id="apartment_id">
                          <SelectValue placeholder="Xonadonni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {apartments.map(apartment => (
                            <SelectItem key={apartment.id} value={apartment.id.toString()}>{apartment.roomNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kafil_fio">Kafil F.I.O.</Label>
                      <Input id="kafil_fio" name="kafil_fio" value={formData.kafil_fio} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kafil_phone_number">Kafil Telefon</Label>
                      <Input id="kafil_phone_number" name="kafil_phone_number" value={formData.kafil_phone_number} onChange={handleChange} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="kafil_address">Kafil Manzil</Label>
                      <Input id="kafil_address" name="kafil_address" value={formData.kafil_address} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kafil_password">Kafil Parol</Label>
                      <Input id="kafil_password" name="kafil_password" type="password" value={formData.kafil_password} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Saqlash</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Input 
                  placeholder="Mijozlarni qidirish..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Select value={filters.object_id} onValueChange={(value) => handleFilterChange("object_id", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Obyekt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha obyektlar</SelectItem>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id.toString()}>{property.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setFilters({ object_id: "" })}>
                    Tozalash
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">Mijozlar ma'lumotlari yuklanmoqda...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>F.I.O.</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Obyekt</TableHead>
                        <TableHead>Xonadon</TableHead>
                        <TableHead>Balans</TableHead>
                        <TableHead>Kafil F.I.O.</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.fio}</TableCell>
                          <TableCell>{client.phone_number}</TableCell>
                          <TableCell>{client.object_name}</TableCell>
                          <TableCell>
                            {client.apartment_id ? (
                              <Button variant="link" onClick={() => router.push(`/apartments/${client.apartment_id}`)}>
                                {client.apartment_number}
                              </Button>
                            ) : "Noma'lum"}
                          </TableCell>
                          <TableCell>
                            {client.balance >= 0 ? (
                              <span className="text-green-600">{client.balance.toLocaleString()} so‘m</span>
                            ) : (
                              <span className="text-red-600">-{Math.abs(client.balance).toLocaleString()} so‘m</span>
                            )}
                          </TableCell>
                          <TableCell>{client.kafil_fio || "Yo‘q"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => router.push(`/clients/${client.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}