"use client"

import type React from "react"
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
import { Plus, Download, Eye, Edit, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    type: "contract",
    propertyId: "",
    clientId: "",
    apartmentId: "",
    description: "",
    file: null as File | null,
  })
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    propertyId: undefined as string | undefined,
    clientId: undefined as string | undefined,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

        const headers = { "Authorization": `Bearer ${token}` }

        // Obyektlarni yuklash
        const propertiesResponse = await fetch("http://127.0.0.1:8000/properties/objects/", { headers })
        if (!propertiesResponse.ok) throw new Error("Obyektlarni yuklashda xatolik")
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.results || propertiesData)

        // Mijozlarni yuklash
        const clientsResponse = await fetch("http://127.0.0.1:8000/clients/", { headers })
        if (!clientsResponse.ok) throw new Error("Mijozlarni yuklashda xatolik")
        const clientsData = await clientsResponse.json()
        setClients(clientsData.results || clientsData)

        // Hujjatlarni yuklash
        const documentsResponse = await fetch("http://127.0.0.1:8000/documents/?page_size=20", { headers })
        if (!documentsResponse.ok) throw new Error("Hujjatlarni yuklashda xatolik")
        const documentsData = await documentsResponse.json()
        const formattedDocuments = documentsData.results.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          propertyId: doc.apartment?.object?.id || null,
          propertyName: doc.apartment?.object?.name || "Noma'lum",
          clientId: doc.user?.id,
          clientName: doc.user?.fio || "Noma'lum",
          apartmentId: doc.apartment?.id || null,
          apartmentNumber: doc.apartment?.number || "Noma'lum",
          date: doc.date,
          description: doc.description || "",
          fileUrl: doc.file_url,
        }))
        setDocuments(formattedDocuments)
        setLoading(false)
      } catch (err: any) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err.message)
        toast({ title: "Xatolik", description: err.message, variant: "destructive" })
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value || undefined }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("type", formData.type)
      if (formData.propertyId && formData.apartmentId) {
        const apartment = await fetchApartmentByPropertyAndNumber(formData.propertyId, formData.apartmentId)
        formDataToSend.append("apartment", apartment.id.toString())
      }
      formDataToSend.append("user", formData.clientId)
      formDataToSend.append("description", formData.description)
      if (formData.file) formDataToSend.append("file", formData.file)

      const response = await fetch("http://127.0.0.1:8000/documents/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Hujjat qo'shishda xatolik: ${errorData.detail || JSON.stringify(errorData)}`)
      }

      const newDocument = await response.json()
      const formattedNewDocument = {
        id: newDocument.id,
        title: newDocument.title,
        type: newDocument.type,
        propertyId: newDocument.apartment?.object?.id || null,
        propertyName: properties.find((p) => p.id === Number(formData.propertyId))?.name || "Noma'lum",
        clientId: Number(formData.clientId),
        clientName: clients.find((c) => c.id === Number(formData.clientId))?.fio || "Noma'lum",
        apartmentId: newDocument.apartment?.id || null,
        apartmentNumber: newDocument.apartment?.number || formData.apartmentId,
        date: newDocument.date,
        description: newDocument.description || "",
        fileUrl: newDocument.file_url,
      }

      setDocuments([formattedNewDocument, ...documents])
      setFormData({
        title: "",
        type: "contract",
        propertyId: "",
        clientId: "",
        apartmentId: "",
        description: "",
        file: null,
      })
      setOpen(false)

      toast({
        title: "Hujjat qo'shildi",
        description: "Yangi hujjat muvaffaqiyatli qo'shildi",
      })
    } catch (err: any) {
      console.error("Hujjat qo‘shishda xatolik:", err.message)
      toast({ title: "Xatolik", description: err.message, variant: "destructive" })
    }
  }

  const fetchApartmentByPropertyAndNumber = async (propertyId: string, apartmentNumber: string) => {
    const token = localStorage.getItem("access_token")
    const response = await fetch(
      `http://127.0.0.1:8000/properties/apartments/?object=${propertyId}&number=${apartmentNumber}`,
      {
        headers: { "Authorization": `Bearer ${token}` },
      }
    )
    if (!response.ok) throw new Error("Xonadon topilmadi")
    const data = await response.json()
    return data.results[0] || { id: apartmentNumber } // Agar topilmasa, mock ID qaytaramiz
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "contract":
        return <Badge className="bg-blue-500">Shartnoma</Badge>
      case "payment_schedule":
        return <Badge className="bg-green-500">To'lov jadvali</Badge>
      case "acceptance_certificate":
        return <Badge className="bg-purple-500">Qabul dalolatnomasi</Badge>
      case "invoice":
        return <Badge className="bg-yellow-500">Hisob-faktura</Badge>
      default:
        return <Badge>Boshqa</Badge>
    }
  }

  const filteredDocuments = documents.filter((document) => {
    if (
      searchTerm &&
      !document.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !document.clientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !document.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    if (filters.type && document.type !== filters.type) return false
    if (filters.propertyId && document.propertyId !== Number(filters.propertyId)) return false
    if (filters.clientId && document.clientId !== Number(filters.clientId)) return false
    return true
  })

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
          <h2 className="text-3xl font-bold tracking-tight">Hujjatlar</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi hujjat qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Yangi hujjat qo'shish</DialogTitle>
                  <DialogDescription>Yangi hujjat ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Hujjat nomi</Label>
                      <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Hujjat turi</Label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Hujjat turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Shartnoma</SelectItem>
                          <SelectItem value="payment_schedule">To'lov jadvali</SelectItem>
                          <SelectItem value="acceptance_certificate">Qabul dalolatnomasi</SelectItem>
                          <SelectItem value="invoice">Hisob-faktura</SelectItem>
                          <SelectItem value="other">Boshqa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyId">Obyekt</Label>
                      <Select
                        value={formData.propertyId}
                        onValueChange={(value) => handleSelectChange("propertyId", value)}
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
                      <Label htmlFor="clientId">Mijoz</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(value) => handleSelectChange("clientId", value)}
                      >
                        <SelectTrigger id="clientId">
                          <SelectValue placeholder="Mijozni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.fio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartmentId">Xonadon raqami</Label>
                      <Input id="apartmentId" name="apartmentId" value={formData.apartmentId} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Fayl</Label>
                      <Input id="file" name="file" type="file" onChange={handleFileChange} required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Tavsif</Label>
                      <Input id="description" name="description" value={formData.description} onChange={handleChange} />
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
                  placeholder="Hujjatlarni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />

                <div className="flex flex-wrap gap-2">
                  <Select value={filters.type || ""} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Hujjat turi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha turlar</SelectItem>
                      <SelectItem value="contract">Shartnoma</SelectItem>
                      <SelectItem value="payment_schedule">To'lov jadvali</SelectItem>
                      <SelectItem value="acceptance_certificate">Qabul dalolatnomasi</SelectItem>
                      <SelectItem value="invoice">Hisob-faktura</SelectItem>
                      <SelectItem value="other">Boshqa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.propertyId || ""} onValueChange={(value) => handleFilterChange("propertyId", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Obyekt" />
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

                  <Select value={filters.clientId || ""} onValueChange={(value) => handleFilterChange("clientId", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mijoz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha mijozlar</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => setFilters({ type: undefined, propertyId: undefined, clientId: undefined })}>
                    Tozalash
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">Hujjatlar ma'lumotlari yuklanmoqda...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hujjat nomi</TableHead>
                        <TableHead>Turi</TableHead>
                        <TableHead>Obyekt</TableHead>
                        <TableHead>Mijoz</TableHead>
                        <TableHead>Xonadon</TableHead>
                        <TableHead>Sana</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{getDocumentTypeLabel(document.type)}</TableCell>
                          <TableCell>{document.propertyName}</TableCell>
                          <TableCell>{document.clientName}</TableCell>
                          <TableCell>{document.apartmentNumber}</TableCell>
                          <TableCell>{new Date(document.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon" asChild>
                                <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={document.fileUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
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