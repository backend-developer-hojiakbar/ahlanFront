"use client"

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
import { Plus, DollarSign, Building, FileText, Eye, Edit, User, PenTool } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)
  const [properties, setProperties] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    propertyId: "",
    supplierId: "",
    amount: "",
    expenseType: "construction_materials",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    invoiceNumber: "",
  })
  const [filters, setFilters] = useState({
    propertyId: "",
    expenseType: "",
    dateRange: "all",
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

      // Generate mock suppliers data
      const mockSuppliers = Array.from({ length: 5 }, (_, i) => {
        return {
          id: i + 1,
          name: `Yetkazib beruvchi ${i + 1}`,
        }
      })

      // Generate mock expenses data
      const mockExpenses = Array.from({ length: 30 }, (_, i) => {
        const expenseTypes = ["construction_materials", "labor", "equipment", "utilities", "other"]
        const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]
        const propertyId = Math.floor(Math.random() * 3) + 1
        const supplierId = Math.floor(Math.random() * 5) + 1
        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 30))

        return {
          id: i + 1,
          propertyId,
          propertyName: mockProperties.find((p) => p.id === propertyId)?.name || "",
          supplierId,
          supplierName: mockSuppliers.find((s) => s.id === supplierId)?.name || "",
          amount: Math.floor(Math.random() * 10000) + 1000,
          expenseType,
          expenseDate: date.toISOString(),
          description: "Xarajat tavsifi",
          invoiceNumber: `INV-${2023}${String(i + 1).padStart(4, "0")}`,
        }
      })

      setProperties(mockProperties)
      setSuppliers(mockSuppliers)
      setExpenses(mockExpenses)
      setLoading(false)
    }, 1000)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Simulate API call
    setTimeout(() => {
      const propertyName = properties.find((p) => p.id === Number(formData.propertyId))?.name || ""
      const supplierName = suppliers.find((s) => s.id === Number(formData.supplierId))?.name || ""

      const newExpense = {
        id: expenses.length + 1,
        propertyId: Number(formData.propertyId),
        propertyName,
        supplierId: Number(formData.supplierId),
        supplierName,
        amount: Number(formData.amount),
        expenseType: formData.expenseType,
        expenseDate: formData.expenseDate,
        description: formData.description,
        invoiceNumber: formData.invoiceNumber,
      }

      setExpenses([newExpense, ...expenses])
      setFormData({
        propertyId: "",
        supplierId: "",
        amount: "",
        expenseType: "construction_materials",
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
        invoiceNumber: "",
      })
      setOpen(false)

      toast({
        title: "Xarajat qo'shildi",
        description: "Yangi xarajat muvaffaqiyatli qo'shildi",
      })
    }, 500)
  }

  const getExpenseTypeLabel = (type) => {
    switch (type) {
      case "construction_materials":
        return <Badge className="bg-blue-500">Qurilish materiallari</Badge>
      case "labor":
        return <Badge className="bg-green-500">Ishchi kuchi</Badge>
      case "equipment":
        return <Badge className="bg-purple-500">Jihozlar</Badge>
      case "utilities":
        return <Badge className="bg-yellow-500">Kommunal xizmatlar</Badge>
      case "other":
        return <Badge>Boshqa</Badge>
      default:
        return null
    }
  }

  const getExpenseTypeText = (type) => {
    switch (type) {
      case "construction_materials":
        return "Qurilish materiallari"
      case "labor":
        return "Ishchi kuchi"
      case "equipment":
        return "Jihozlar"
      case "utilities":
        return "Kommunal xizmatlar"
      case "other":
        return "Boshqa"
      default:
        return type
    }
  }

  const filterExpensesByDate = (expenses, dateRange) => {
    if (dateRange === "all") return expenses

    const today = new Date()
    const startDate = new Date()

    switch (dateRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate.setMonth(today.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(today.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        return expenses
    }

    return expenses.filter((expense) => new Date(expense.expenseDate) >= startDate)
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (
      searchTerm &&
      !expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !expense.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !expense.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !expense.invoiceNumber.includes(searchTerm)
    ) {
      return false
    }
    if (filters.propertyId && expense.propertyId !== Number(filters.propertyId)) return false
    if (filters.expenseType && expense.expenseType !== filters.expenseType) return false
    return true
  })

  const dateFilteredExpenses = filterExpensesByDate(filteredExpenses, filters.dateRange)

  const getTotalAmount = (expenses) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getExpensesByType = (expenses) => {
    const expenseTypes = ["construction_materials", "labor", "equipment", "utilities", "other"]

    return expenseTypes.map((type) => {
      const filteredExpenses = expenses.filter((expense) => expense.expenseType === type)
      const total = getTotalAmount(filteredExpenses)
      const percentage = expenses.length > 0 ? (total / getTotalAmount(expenses)) * 100 : 0

      return {
        type,
        label: getExpenseTypeText(type),
        total,
        percentage,
      }
    })
  }

  const expensesByType = getExpensesByType(dateFilteredExpenses)

  function renderExpensesTable(expensesToRender) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Xarajatlar ma'lumotlari yuklanmoqda...</p>
        </div>
      )
    }

    if (expensesToRender.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] border rounded-md">
          <p className="text-muted-foreground">Xarajatlar mavjud emas</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sana</TableHead>
              <TableHead>Obyekt</TableHead>
              <TableHead>Yetkazib beruvchi</TableHead>
              <TableHead>Tavsif</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead>Hisob-faktura</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expensesToRender.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                <TableCell>{expense.propertyName}</TableCell>
                <TableCell>{expense.supplierName}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{getExpenseTypeLabel(expense.expenseType)}</TableCell>
                <TableCell>{expense.invoiceNumber}</TableCell>
                <TableCell>${expense.amount.toLocaleString()}</TableCell>
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
          <h2 className="text-3xl font-bold tracking-tight">Xarajatlar</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi xarajat qo'shish
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Yangi xarajat qo'shish</DialogTitle>
                  <DialogDescription>Yangi xarajat ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="supplierId">Yetkazib beruvchi</Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(value) => handleSelectChange("supplierId", value)}
                      >
                        <SelectTrigger id="supplierId">
                          <SelectValue placeholder="Yetkazib beruvchini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Summa</Label>
                      <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expenseType">Xarajat turi</Label>
                      <Select
                        value={formData.expenseType}
                        onValueChange={(value) => handleSelectChange("expenseType", value)}
                      >
                        <SelectTrigger id="expenseType">
                          <SelectValue placeholder="Xarajat turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construction_materials">Qurilish materiallari</SelectItem>
                          <SelectItem value="labor">Ishchi kuchi</SelectItem>
                          <SelectItem value="equipment">Jihozlar</SelectItem>
                          <SelectItem value="utilities">Kommunal xizmatlar</SelectItem>
                          <SelectItem value="other">Boshqa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expenseDate">Xarajat sanasi</Label>
                      <Input
                        id="expenseDate"
                        name="expenseDate"
                        type="date"
                        value={formData.expenseDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Hisob-faktura raqami</Label>
                      <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Tavsif</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami xarajatlar</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalAmount(dateFilteredExpenses).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qurilish materiallari</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${expensesByType.find((e) => e.type === "construction_materials")?.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(expensesByType.find((e) => e.type === "construction_materials")?.percentage || 0)}% jami
                xarajatlardan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ishchi kuchi</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${expensesByType.find((e) => e.type === "labor")?.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(expensesByType.find((e) => e.type === "labor")?.percentage || 0)}% jami xarajatlardan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jihozlar</CardTitle>
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${expensesByType.find((e) => e.type === "equipment")?.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(expensesByType.find((e) => e.type === "equipment")?.percentage || 0)}% jami xarajatlardan
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
                    <TabsTrigger value="all">Barcha xarajatlar</TabsTrigger>
                    <TabsTrigger value="construction_materials">Qurilish materiallari</TabsTrigger>
                    <TabsTrigger value="labor">Ishchi kuchi</TabsTrigger>
                    <TabsTrigger value="equipment">Jihozlar</TabsTrigger>
                    <TabsTrigger value="utilities">Kommunal</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-wrap gap-2">
                    <Input
                      placeholder="Xarajatlarni qidirish..."
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

                    <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sana oralig'i" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Barcha vaqt</SelectItem>
                        <SelectItem value="today">Bugun</SelectItem>
                        <SelectItem value="week">So'nggi hafta</SelectItem>
                        <SelectItem value="month">So'nggi oy</SelectItem>
                        <SelectItem value="quarter">So'nggi chorak</SelectItem>
                        <SelectItem value="year">So'nggi yil</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({ propertyId: "", expenseType: "", dateRange: "all" })
                        setSearchTerm("")
                      }}
                    >
                      Tozalash
                    </Button>
                  </div>
                </div>

                <TabsContent value="all">{renderExpensesTable(dateFilteredExpenses)}</TabsContent>

                <TabsContent value="construction_materials">
                  {renderExpensesTable(dateFilteredExpenses.filter((e) => e.expenseType === "construction_materials"))}
                </TabsContent>

                <TabsContent value="labor">
                  {renderExpensesTable(dateFilteredExpenses.filter((e) => e.expenseType === "labor"))}
                </TabsContent>

                <TabsContent value="equipment">
                  {renderExpensesTable(dateFilteredExpenses.filter((e) => e.expenseType === "equipment"))}
                </TabsContent>

                <TabsContent value="utilities">
                  {renderExpensesTable(dateFilteredExpenses.filter((e) => e.expenseType === "utilities"))}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

