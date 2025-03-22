"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { User, Phone, MapPin, Home, CreditCard, FileText, Plus, Check } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openPayment, setOpenPayment] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    payment_type: "Naqd",
    initial_payment: "",
    payment_term: "",
    interest_rate: "",
  })

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

        const headers = { "Authorization": `Bearer ${token}` }
        const clientId = Number(params.id)

        // Mijoz ma'lumotlari
        const clientResponse = await fetch(`http://127.0.0.1:8000/clients/${clientId}/`, { headers })
        if (!clientResponse.ok) throw new Error(`Mijoz ma'lumotlarini yuklashda xatolik: ${clientResponse.status}`)
        const clientData = await clientResponse.json()

        // To'lovlar
        const paymentsResponse = await fetch(`http://127.0.0.1:8000/payments/?user=${clientId}&page_size=10`, { headers })
        if (!paymentsResponse.ok) throw new Error(`To'lovlarni yuklashda xatolik: ${paymentsResponse.status}`)
        const paymentsData = await paymentsResponse.json()

        // Oylik to'lovlar
        const monthlyPaymentsResponse = await fetch(`http://127.0.0.1:8000/monthly-payments/?payment__user=${clientId}&page_size=10`, { headers })
        if (!monthlyPaymentsResponse.ok) throw new Error(`Oylik to'lovlarni yuklashda xatolik: ${monthlyPaymentsResponse.status}`)
        const monthlyPaymentsData = await monthlyPaymentsResponse.json()

        // To'lov tarixi
        const paymentHistoryResponse = await fetch(`http://127.0.0.1:8000/payment-history/?user=${clientId}&page_size=10`, { headers })
        if (!paymentHistoryResponse.ok) throw new Error(`To'lov tarixini yuklashda xatolik: ${paymentHistoryResponse.status}`)
        const paymentHistoryData = await paymentHistoryResponse.json()

        // Hujjatlar
        const documentsResponse = await fetch(`http://127.0.0.1:8000/documents/?user=${clientId}&page_size=10`, { headers })
        if (!documentsResponse.ok) throw new Error(`Hujjatlarni yuklashda xatolik: ${documentsResponse.status}`)
        const documentsData = await documentsResponse.json()

        const formattedClient = {
          id: clientData.id,
          name: clientData.fio,
          phone: clientData.phone_number,
          address: clientData.address,
          property_id: clientData.object_id,
          property_name: clientData.object_name || "Noma'lum",
          apartment_id: clientData.apartment_id,
          apartment_number: clientData.apartment_number || "Noma'lum",
          balance: parseFloat(clientData.balance),
          payments: paymentsData.results.map((payment: any) => ({
            id: payment.id,
            apartment_id: payment.apartment?.id,
            object_id: payment.object?.id,
            total_amount: parseFloat(payment.total_amount),
            initial_payment: parseFloat(payment.initial_payment || 0),
            monthly_payment: parseFloat(payment.monthly_payment || 0),
            payment_term: payment.payment_term,
            payment_type: payment.payment_type,
            description: payment.description,
            paid: payment.paid,
          })),
          monthly_payments: monthlyPaymentsData.results.map((mp: any) => ({
            id: mp.id,
            payment_id: mp.payment,
            amount: parseFloat(mp.amount),
            payment_date: mp.payment_date,
            paid: mp.paid,
          })),
          payment_history: paymentHistoryData.results.map((ph: any) => ({
            id: ph.id,
            amount: parseFloat(ph.amount),
            payment_date: ph.payment_date,
            payment_type: ph.payment_type,
          })),
          documents: documentsData.results.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            date: doc.date,
            file_url: doc.file_url,
          })),
        }

        setClient(formattedClient)
        setLoading(false)
      } catch (err: any) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err.message)
        toast({ title: "Xatolik", description: err.message, variant: "destructive" })
        setLoading(false)
      }
    }

    fetchClientData()
  }, [params.id])

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPaymentFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSelectChange = (name: string, value: string) => {
    setPaymentFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

      const clientId = Number(params.id)
      const payload = {
        user: clientId,
        apartment: client.apartment_id,
        object: client.property_id,
        total_amount: parseFloat(paymentFormData.amount),
        initial_payment: paymentFormData.payment_type === "Muddatli" ? parseFloat(paymentFormData.initial_payment) : null,
        payment_term: paymentFormData.payment_type === "Muddatli" ? parseInt(paymentFormData.payment_term) : null,
        interest_rate: paymentFormData.payment_type === "Muddatli" ? parseFloat(paymentFormData.interest_rate) : null,
        payment_type: paymentFormData.payment_type,
        description: paymentFormData.description,
        paid: paymentFormData.payment_type !== "Muddatli",
      }

      const response = await fetch("http://127.0.0.1:8000/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`To'lov qo'shishda xatolik: ${errorData.detail || JSON.stringify(errorData)}`)
      }

      const newPayment = await response.json()
      const updatedClient = {
        ...client,
        payments: [
          {
            id: newPayment.id,
            apartment_id: newPayment.apartment?.id,
            object_id: newPayment.object?.id,
            total_amount: parseFloat(newPayment.total_amount),
            initial_payment: parseFloat(newPayment.initial_payment || 0),
            monthly_payment: parseFloat(newPayment.monthly_payment || 0),
            payment_term: newPayment.payment_term,
            payment_type: newPayment.payment_type,
            description: newPayment.description,
            paid: newPayment.paid,
          },
          ...client.payments,
        ],
      }

      setClient(updatedClient)
      setPaymentFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        payment_type: "Naqd",
        initial_payment: "",
        payment_term: "",
        interest_rate: "",
      })
      setOpenPayment(false)

      toast({
        title: "To'lov qo'shildi",
        description: "Yangi to'lov muvaffaqiyatli qo'shildi",
      })
    } catch (err: any) {
      console.error("To'lov qo‘shishda xatolik:", err.message)
      toast({ title: "Xatolik", description: err.message, variant: "destructive" })
    }
  }

  const handleMonthlyPaymentConfirm = async (monthlyPaymentId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("Token topilmadi. Iltimos, login qiling.")

      const payload = {
        user_id: Number(params.id),
        monthly_payment_id: monthlyPaymentId,
      }

      const response = await fetch("http://127.0.0.1:8000/monthly-payments/pay_monthly/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Oylik to'lov tasdiqlashda xatolik: ${errorData.error || JSON.stringify(errorData)}`)
      }

      const updatedMonthlyPayments = client.monthly_payments.map((mp: any) =>
        mp.id === monthlyPaymentId ? { ...mp, paid: true } : mp
      )
      const allPaid = updatedMonthlyPayments.every((mp: any) => mp.paid)
      setClient({
        ...client,
        monthly_payments: updatedMonthlyPayments,
        payments: client.payments.map((p: any) =>
          p.id === updatedMonthlyPayments[0].payment_id ? { ...p, paid: allPaid } : p
        ),
      })

      toast({
        title: "Oylik to'lov tasdiqlandi",
        description: "To'lov muvaffaqiyatli tasdiqlandi",
      })
    } catch (err: any) {
      console.error("Oylik to'lov tasdiqlashda xatolik:", err.message)
      toast({ title: "Xatolik", description: err.message, variant: "destructive" })
    }
  }

  const getStatusBadge = (paid: boolean) => {
    return paid ? <Badge className="bg-green-500">To'langan</Badge> : <Badge className="bg-yellow-500">Kutilmoqda</Badge>
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "Naqd":
        return "Naqd pul"
      case "Muddatli":
        return "Muddatli to'lov"
      case "Karta":
        return "Karta"
      case "Bank":
        return "Bank o'tkazmasi"
      default:
        return type
    }
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
            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            <p className="text-muted-foreground">Mijoz ma'lumotlari</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/clients")}>
              <User className="mr-2 h-4 w-4" />
              Barcha mijozlar
            </Button>
            <Dialog open={openPayment} onOpenChange={setOpenPayment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi to'lov
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handlePaymentSubmit}>
                  <DialogHeader>
                    <DialogTitle>Yangi to'lov qo'shish</DialogTitle>
                    <DialogDescription>Yangi to'lov ma'lumotlarini kiriting</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Jami summa</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          value={paymentFormData.amount}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Sana</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={paymentFormData.date}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_type">To'lov turi</Label>
                      <Select
                        value={paymentFormData.payment_type}
                        onValueChange={(value) => handlePaymentSelectChange("payment_type", value)}
                      >
                        <SelectTrigger id="payment_type">
                          <SelectValue placeholder="To'lov turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Naqd">Naqd pul</SelectItem>
                          <SelectItem value="Muddatli">Muddatli to'lov</SelectItem>
                          <SelectItem value="Karta">Karta</SelectItem>
                          <SelectItem value="Bank">Bank o'tkazmasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {paymentFormData.payment_type === "Muddatli" && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="initial_payment">Boshlang‘ich to‘lov</Label>
                          <Input
                            id="initial_payment"
                            name="initial_payment"
                            type="number"
                            value={paymentFormData.initial_payment}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment_term">Muddat (oy)</Label>
                          <Input
                            id="payment_term"
                            name="payment_term"
                            type="number"
                            value={paymentFormData.payment_term}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interest_rate">Foiz stavkasi (%)</Label>
                          <Input
                            id="interest_rate"
                            name="interest_rate"
                            type="number"
                            value={paymentFormData.interest_rate}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="description">Tavsif</Label>
                      <Input
                        id="description"
                        name="description"
                        value={paymentFormData.description}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Saqlash</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mijoz ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span>
                      {client.property_name}, Xonadon {client.apartment_number}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Umumiy ma'lumotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Balans</p>
                    {client.balance >= 0 ? (
                      <p className="text-2xl font-bold text-green-600">{client.balance.toLocaleString()} so‘m</p>
                    ) : (
                      <p className="text-2xl font-bold text-red-600">-{Math.abs(client.balance).toLocaleString()} so‘m</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Jami to‘lovlar</p>
                    <p className="text-2xl font-bold">
                      {client.payment_history.reduce((sum: number, ph: any) => sum + ph.amount, 0).toLocaleString()} so‘m
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">So'nggi to'lov</p>
                    <p className="text-2xl font-bold">
                      {client.payment_history.length > 0 ? new Date(client.payment_history[0].payment_date).toLocaleDateString() : "Yo‘q"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
            <TabsTrigger value="monthly_payments">Oylik to‘lovlar</TabsTrigger>
            <TabsTrigger value="payment_history">To‘lov tarixi</TabsTrigger>
            <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>To'lovlar</CardTitle>
                <CardDescription>Mijozning umumiy to'lovlari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tavsif</TableHead>
                        <TableHead>To'lov turi</TableHead>
                        <TableHead>Jami summa</TableHead>
                        <TableHead>Boshlang‘ich to‘lov</TableHead>
                        <TableHead>Oylik to‘lov</TableHead>
                        <TableHead>Muddat (oy)</TableHead>
                        <TableHead>Holati</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.description || "Noma'lum"}</TableCell>
                          <TableCell>{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                          <TableCell>{payment.total_amount.toLocaleString()} so‘m</TableCell>
                          <TableCell>{payment.initial_payment ? payment.initial_payment.toLocaleString() : "0"} so‘m</TableCell>
                          <TableCell>{payment.monthly_payment ? payment.monthly_payment.toLocaleString() : "0"} so‘m</TableCell>
                          <TableCell>{payment.payment_term || "Yo‘q"}</TableCell>
                          <TableCell>{getStatusBadge(payment.paid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="monthly_payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Oylik to‘lovlar</CardTitle>
                <CardDescription>Mijozning muddatli to‘lov jadvali</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sana</TableHead>
                        <TableHead>Summa</TableHead>
                        <TableHead>Holati</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.monthly_payments.map((mp: any) => (
                        <TableRow key={mp.id}>
                          <TableCell>{new Date(mp.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>{mp.amount.toLocaleString()} so‘m</TableCell>
                          <TableCell>{getStatusBadge(mp.paid)}</TableCell>
                          <TableCell className="text-right">
                            {!mp.paid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMonthlyPaymentConfirm(mp.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment_history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>To‘lov tarixi</CardTitle>
                <CardDescription>Mijozning to‘langan to‘lovlari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sana</TableHead>
                        <TableHead>Summa</TableHead>
                        <TableHead>To'lov turi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.payment_history.map((ph: any) => (
                        <TableRow key={ph.id}>
                          <TableCell>{new Date(ph.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>{ph.amount.toLocaleString()} so‘m</TableCell>
                          <TableCell>{getPaymentTypeLabel(ph.payment_type)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hujjatlar</CardTitle>
                <CardDescription>Mijoz bilan bog'liq barcha hujjatlar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hujjat nomi</TableHead>
                        <TableHead>Turi</TableHead>
                        <TableHead>Sana</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.documents.map((document: any) => (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{getDocumentTypeLabel(document.type)}</TableCell>
                          <TableCell>{new Date(document.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}