"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Plus, CreditCard, FileText, Eye, Edit } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    propertyId: "",
    apartmentId: "",
    amount: "",
    paymentType: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [filters, setFilters] = useState({
    status: "",
    propertyId: "all",
    clientId: "all",
    paymentType: "",
  })

  // Tokenni olish
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token")
    if (!storedToken) {
      router.push("/login")
    } else {
      setToken(storedToken)
    }
  }, [router])

  // Ma'lumotlarni olish
  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }

        // Objects (properties)
        const propertiesResponse = await fetch("http://127.0.0.1:8000/objects/", { headers })
        if (!propertiesResponse.ok) {
          const text = await propertiesResponse.text()
          throw new Error(`Objects endpoint xatoligi: ${propertiesResponse.status} - ${text}`)
        }
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.results || [])

        // Clients (users)
        const clientsResponse = await fetch("http://127.0.0.1:8000/users/", { headers })
        if (!clientsResponse.ok) {
          const text = await clientsResponse.text()
          throw new Error(`Users endpoint xatoligi: ${clientsResponse.status} - ${text}`)
        }
        const clientsData = await clientsResponse.json()
        setClients(clientsData.results || [])

        // Payments
        const paymentsResponse = await fetch("http://127.0.0.1:8000/monthly-payments/", { headers })
        if (!paymentsResponse.ok) {
          const text = await paymentsResponse.text()
          throw new Error(`Payments endpoint xatoligi: ${paymentsResponse.status} - ${text}`)
        }
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.results || [])

        setLoading(false)
      } catch (error: any) {
        console.error("Ma'lumotlarni olishda xatolik:", error.message)
        toast({ title: "Xatolik", description: error.message, variant: "destructive" })
        setLoading(false)
        router.push("/login")
      }
    }

    fetchData()
  }, [token, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast({ title: "Xatolik", description: "Token topilmadi", variant: "destructive" })
      return
    }

    // Formani tekshirish
    if (!formData.clientId || !formData.propertyId || !formData.apartmentId || !formData.amount) {
      toast({ title: "Xatolik", description: "Barcha majburiy maydonlarni to'ldiring", variant: "destructive" })
      return
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }

      const newPayment = {
        client: Number.parseInt(formData.clientId),
        object: Number.parseInt(formData.propertyId),
        apartment: Number.parseInt(formData.apartmentId),
        amount: Number.parseFloat(formData.amount),
        payment_type: formData.paymentType,
        payment_date: formData.paymentDate,
        description: formData.description || "",
        paid: true, // Yangi to'lov default holatda to'langan deb belgilanadi
      }

      console.log("Yuborilayotgan ma'lumotlar:", newPayment)

      const response = await fetch("http://127.0.0.1:8000/monthly-payments/", {
        method: "POST",
        headers,
        body: JSON.stringify(newPayment),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`To'lov qo'shishda xatolik: ${response.status} - ${text}`)
      }

      const addedPayment = await response.json()
      setPayments([addedPayment, ...payments])
      setFormData({
        clientId: "",
        propertyId: "",
        apartmentId: "",
        amount: "",
        paymentType: "cash",
        paymentDate: new Date().toISOString().split("T")[0],
        description: "",
      })
      setOpen(false)

      toast({
        title: "To'lov qo'shildi",
        description: "Yangi to'lov muvaffaqiyatli qo'shildi",
      })
    } catch (error: any) {
      console.error("To'lov qo'shishda xatolik:", error.message)
      toast({ title: "Xatolik", description: error.message, variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string | boolean) => {
    const paid = typeof status === "boolean" ? status : status === "paid"
    if (paid) return <Badge className="bg-green-500">To'langan</Badge>
    return <Badge className="bg-red-500">To'lanmagan</Badge>
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "cash":
        return "Naqd pul"
      case "card":
        return "Karta"
      case "bank_transfer":
        return "Bank o'tkazmasi"
      case "installment":
        return "Muddatli to'lov"
      default:
        return type
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const clientName = clients.find((c) => c.id === payment.client)?.name || ""
    const propertyName = properties.find((p) => p.id === payment.object)?.name || ""
    const status = payment.paid ? "paid" : "pending"

    if (
      searchTerm &&
      !clientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !propertyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !payment.apartment?.toString().includes(searchTerm)
    ) {
      return false
    }
    if (filters.status && status !== filters.status) return false
    if (filters.propertyId !== "all" && payment.object !== Number.parseInt(filters.propertyId)) return false
    if (filters.clientId !== "all" && payment.client !== Number.parseInt(filters.clientId)) return false
    if (filters.paymentType && payment.payment_type !== filters.paymentType) return false
    return true
  })

  const getTotalAmount = (status = "") => {
    return payments
      .filter((p) => (status ? (status === "paid" ? p.paid : !p.paid) : true))
      .reduce((total, payment) => total + Number.parseFloat(payment.amount || 0), 0)
  }

  if (loading || !token) {
    return <div className="flex min-h-screen items-center justify-center">Yuklanmoqda...</div>
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
          <h2 className="text-3xl font-bold tracking-tight">To'lovlar</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi to'lov qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Yangi to'lov qo'shish</DialogTitle>
                  <DialogDescription>Yangi to'lov ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Mijoz</Label>
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
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="apartmentId">Xonadon raqami</Label>
                      <Input
                        id="apartmentId"
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Summa</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentType">To'lov turi</Label>
                      <Select
                        value={formData.paymentType}
                        onValueChange={(value) => handleSelectChange("paymentType", value)}
                      >
                        <SelectTrigger id="paymentType">
                          <SelectValue placeholder="To'lov turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Naqd pul</SelectItem>
                          <SelectItem value="card">Karta</SelectItem>
                          <SelectItem value="bank_transfer">Bank o'tkazmasi</SelectItem>
                          <SelectItem value="installment">Muddatli to'lov</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">To'lov sanasi</Label>
                      <Input
                        id="paymentDate"
                        name="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        required
                      />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami to'lovlar</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalAmount().toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To'langan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${getTotalAmount("paid").toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {getTotalAmount() ? Math.round((getTotalAmount("paid") / getTotalAmount()) * 100) : 0}% to'langan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To'lanmagan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${getTotalAmount("pending").toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {getTotalAmount() ? Math.round((getTotalAmount("pending") / getTotalAmount()) * 100) : 0}% to'lanmagan
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Tabs defaultValue="all" className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <TabsList>
                    <TabsTrigger value="all">Barcha to'lovlar</TabsTrigger>
                    <TabsTrigger value="paid">To'langan</TabsTrigger>
                    <TabsTrigger value="pending">To'lanmagan</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-wrap gap-2">
                    <Input
                      placeholder="To'lovlarni qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />

                    <Select
                      value={filters.propertyId}
                      onValueChange={(value) => handleFilterChange("propertyId", value)}
                    >
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

                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({ status: "", propertyId: "all", clientId: "all", paymentType: "" })
                        setSearchTerm("")
                      }}
                    >
                      Tozalash
                    </Button>
                  </div>
                </div>

                <TabsContent value="all">{renderPaymentsTable(filteredPayments)}</TabsContent>

                <TabsContent value="paid">
                  {renderPaymentsTable(filteredPayments.filter((p) => p.paid))}
                </TabsContent>

                <TabsContent value="pending">
                  {renderPaymentsTable(filteredPayments.filter((p) => !p.paid))}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  function renderPaymentsTable(paymentsToRender: any[]) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">To'lovlar ma'lumotlari yuklanmoqda...</p>
        </div>
      )
    }

    if (paymentsToRender.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] border rounded-md">
          <p className="text-muted-foreground">To'lovlar mavjud emas</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mijoz</TableHead>
              <TableHead>Obyekt</TableHead>
              <TableHead>Xonadon</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>To'lov turi</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsToRender.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {clients.find((c) => c.id === payment.client)?.name || "Noma'lum"}
                </TableCell>
                <TableCell>
                  {properties.find((p) => p.id === payment.object)?.name || "Noma'lum"}
                </TableCell>
                <TableCell>{payment.apartment || "Noma'lum"}</TableCell>
                <TableCell>${Number.parseFloat(payment.amount).toLocaleString()}</TableCell>
                <TableCell>{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(payment.paid)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
}