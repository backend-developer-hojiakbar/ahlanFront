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
    type: "",
    propertyId: "",
    clientId: "",
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Generate mock properties data
      const mockProperties = [
        { id: 1, name: "Navoiy 108K" },
        { id: 2, name: "Navoiy 108L" },
        { id: 3, name: "Baqachorsu" },
      ]

      // Generate mock clients data
      const mockClients = Array.from({ length: 5 }, (_, i) => {
        return {
          id: i + 1,
          name: `Mijoz ${i + 1}`,
        }
      })

      // Generate mock documents data
      const mockDocuments = Array.from({ length: 20 }, (_, i) => {
        const types = ["contract", "payment_schedule", "acceptance_certificate", "invoice", "other"]
        const type = types[Math.floor(Math.random() * types.length)]
        const propertyId = Math.floor(Math.random() * 3) + 1
        const clientId = Math.floor(Math.random() * 5) + 1
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))

        return {
          id: i + 1,
          title:
            type === "contract"
              ? "Shartnoma"
              : type === "payment_schedule"
                ? "To'lov jadvali"
                : type === "acceptance_certificate"
                  ? "Topshirish-qabul qilish dalolatnomasi"
                  : type === "invoice"
                    ? "Hisob-faktura"
                    : "Boshqa hujjat",
          type,
          propertyId,
          propertyName: mockProperties.find((p) => p.id === propertyId)?.name || "",
          clientId,
          clientName: mockClients.find((c) => c.id === clientId)?.name || "",
          apartmentId: Math.floor(Math.random() * 100) + 1,
          apartmentNumber: `${Math.floor(Math.random() * 16) + 1}${String(Math.floor(Math.random() * 4) + 1).padStart(2, "0")}`,
          date: date.toISOString(),
          description: "Hujjat tavsifi",
          fileUrl: "#",
        }
      })

      setProperties(mockProperties)
      setClients(mockClients)
      setDocuments(mockDocuments)
      setLoading(false)
    }, 1000)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call
    setTimeout(() => {
      const propertyName = properties.find((p) => p.id === Number.parseInt(formData.propertyId))?.name || ""
      const clientName = clients.find((c) => c.id === Number.parseInt(formData.clientId))?.name || ""

      const newDocument = {
        id: documents.length + 1,
        title: formData.title,
        type: formData.type,
        propertyId: Number.parseInt(formData.propertyId),
        propertyName,
        clientId: Number.parseInt(formData.clientId),
        clientName,
        apartmentId: Number.parseInt(formData.apartmentId),
        apartmentNumber: "101", // Mock data
        date: new Date().toISOString(),
        description: formData.description,
        fileUrl: "#",
      }

      setDocuments([newDocument, ...documents])
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
    }, 500)
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
    if (filters.propertyId && document.propertyId !== Number.parseInt(filters.propertyId)) return false
    if (filters.clientId && document.clientId !== Number.parseInt(filters.clientId)) return false
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
                              {client.name}
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
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
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

                  <Select value={filters.propertyId} onValueChange={(value) => handleFilterChange("propertyId", value)}>
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

                  <Select value={filters.clientId} onValueChange={(value) => handleFilterChange("clientId", value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mijoz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha mijozlar</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => setFilters({ type: "", propertyId: "", clientId: "" })}>
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
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
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

