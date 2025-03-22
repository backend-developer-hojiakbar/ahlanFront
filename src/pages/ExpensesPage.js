"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Calendar } from "../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { DollarSign, Plus, Search, MoreVertical, Edit, Trash2, Download, CalendarIcon, Filter, X } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { toast } from "../components/ui/use-toast"
import { formatCurrency, formatDate, getExpenseTypeText, downloadCSV } from "../lib/utils"

const ExpensesPage = () => {
  const navigate = useNavigate()
  const { isAdmin, isAccountant } = useAuth()
  const { expenses, properties, suppliers, addExpense, updateExpense, deleteExpense, getExpenseStatistics } = useData()

  // State for expenses
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // State for filters
  const [filters, setFilters] = useState({
    propertyId: "",
    supplierId: "",
    expenseType: "",
    startDate: null,
    endDate: null,
    minAmount: "",
    maxAmount: "",
  })

  // State for expense form
  const [expenseForm, setExpenseForm] = useState({
    propertyId: "",
    supplierId: "",
    amount: "",
    expenseType: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
    invoiceNumber: "",
  })

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  // State for date picker
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  })

  // State for statistics
  const [stats, setStats] = useState({
    totalExpenses: 0,
    expensesByType: {},
    expensesByProperty: {},
  })

  // Load expenses and apply filters
  useEffect(() => {
    if (expenses.length > 0) {
      applyFilters()
      updateStats()
    }
  }, [expenses, filters])

  // Update statistics
  const updateStats = () => {
    const propertyId = filters.propertyId ? Number.parseInt(filters.propertyId) : null
    const dateRange =
      filters.startDate && filters.endDate ? { from: new Date(filters.startDate), to: new Date(filters.endDate) } : null

    const stats = getExpenseStatistics(propertyId, dateRange)
    setStats(stats)
  }

  // Apply filters to expenses
  const applyFilters = () => {
    let filtered = [...expenses]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          expense.invoiceNumber.toLowerCase().includes(query) ||
          expense.propertyName.toLowerCase().includes(query) ||
          expense.supplierName.toLowerCase().includes(query),
      )
    }

    // Apply property filter
    if (filters.propertyId) {
      filtered = filtered.filter((expense) => expense.propertyId === Number.parseInt(filters.propertyId))
    }

    // Apply supplier filter
    if (filters.supplierId) {
      filtered = filtered.filter((expense) => expense.supplierId === Number.parseInt(filters.supplierId))
    }

    // Apply expense type filter
    if (filters.expenseType) {
      filtered = filtered.filter((expense) => expense.expenseType === filters.expenseType)
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter((expense) => new Date(expense.expenseDate) >= new Date(filters.startDate))
    }

    if (filters.endDate) {
      filtered = filtered.filter((expense) => new Date(expense.expenseDate) <= new Date(filters.endDate))
    }

    // Apply amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter((expense) => expense.amount >= Number.parseFloat(filters.minAmount))
    }

    if (filters.maxAmount) {
      filtered = filtered.filter((expense) => expense.amount <= Number.parseFloat(filters.maxAmount))
    }

    // Sort expenses by date (newest first)
    filtered.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))

    setFilteredExpenses(filtered)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
    setTimeout(() => {
      applyFilters()
    }, 300)
  }

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range)

    if (range.from) {
      handleFilterChange("startDate", range.from.toISOString().split("T")[0])
    }

    if (range.to) {
      handleFilterChange("endDate", range.to.toISOString().split("T")[0])
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyId: "",
      supplierId: "",
      expenseType: "",
      startDate: null,
      endDate: null,
      minAmount: "",
      maxAmount: "",
    })
    setDateRange({ from: null, to: null })
    setSearchQuery("")
    setCurrentPage(1)
  }

  // Handle expense form change
  const handleExpenseFormChange = (name, value) => {
    setExpenseForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle add expense
  const handleAddExpense = () => {
    try {
      // Validate form
      if (!expenseForm.propertyId) {
        toast({
          title: "Xatolik",
          description: "Obyektni tanlang",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.supplierId) {
        toast({
          title: "Xatolik",
          description: "Yetkazib beruvchini tanlang",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.amount || isNaN(expenseForm.amount) || Number.parseFloat(expenseForm.amount) <= 0) {
        toast({
          title: "Xatolik",
          description: "Summani to'g'ri kiriting",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.expenseType) {
        toast({
          title: "Xatolik",
          description: "Xarajat turini tanlang",
          variant: "destructive",
        })
        return
      }

      // Add property and supplier names
      const property = properties.find((p) => p.id === Number.parseInt(expenseForm.propertyId))
      const supplier = suppliers.find((s) => s.id === Number.parseInt(expenseForm.supplierId))

      const newExpense = {
        ...expenseForm,
        propertyId: Number.parseInt(expenseForm.propertyId),
        supplierId: Number.parseInt(expenseForm.supplierId),
        amount: Number.parseFloat(expenseForm.amount),
        propertyName: property ? property.name : "",
        supplierName: supplier ? supplier.name : "",
      }

      addExpense(newExpense)

      // Reset form and close dialog
      setExpenseForm({
        propertyId: "",
        supplierId: "",
        amount: "",
        expenseType: "",
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
        invoiceNumber: "",
      })

      setAddDialogOpen(false)

      toast({
        title: "Muvaffaqiyatli",
        description: "Xarajat qo'shildi",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error.message || "Xarajatni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  // Handle edit expense
  const handleEditExpense = () => {
    try {
      if (!currentExpense) return

      // Validate form
      if (!expenseForm.propertyId) {
        toast({
          title: "Xatolik",
          description: "Obyektni tanlang",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.supplierId) {
        toast({
          title: "Xatolik",
          description: "Yetkazib beruvchini tanlang",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.amount || isNaN(expenseForm.amount) || Number.parseFloat(expenseForm.amount) <= 0) {
        toast({
          title: "Xatolik",
          description: "Summani to'g'ri kiriting",
          variant: "destructive",
        })
        return
      }

      if (!expenseForm.expenseType) {
        toast({
          title: "Xatolik",
          description: "Xarajat turini tanlang",
          variant: "destructive",
        })
        return
      }

      // Add property and supplier names
      const property = properties.find((p) => p.id === Number.parseInt(expenseForm.propertyId))
      const supplier = suppliers.find((s) => s.id === Number.parseInt(expenseForm.supplierId))

      const updatedExpense = {
        ...expenseForm,
        propertyId: Number.parseInt(expenseForm.propertyId),
        supplierId: Number.parseInt(expenseForm.supplierId),
        amount: Number.parseFloat(expenseForm.amount),
        propertyName: property ? property.name : "",
        supplierName: supplier ? supplier.name : "",
      }

      updateExpense(currentExpense.id, updatedExpense)

      // Reset form and close dialog
      setCurrentExpense(null)
      setExpenseForm({
        propertyId: "",
        supplierId: "",
        amount: "",
        expenseType: "",
        expenseDate: new Date().toISOString().split("T")[0],
        description: "",
        invoiceNumber: "",
      })

      setEditDialogOpen(false)

      toast({
        title: "Muvaffaqiyatli",
        description: "Xarajat yangilandi",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error.message || "Xarajatni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  // Handle delete expense
  const handleDeleteExpense = () => {
    try {
      if (!currentExpense) return

      deleteExpense(currentExpense.id)

      // Reset and close dialog
      setCurrentExpense(null)
      setDeleteDialogOpen(false)

      toast({
        title: "Muvaffaqiyatli",
        description: "Xarajat o'chirildi",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error.message || "Xarajatni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (expense) => {
    setCurrentExpense(expense)
    setExpenseForm({
      propertyId: expense.propertyId.toString(),
      supplierId: expense.supplierId.toString(),
      amount: expense.amount.toString(),
      expenseType: expense.expenseType,
      expenseDate: expense.expenseDate.split("T")[0],
      description: expense.description,
      invoiceNumber: expense.invoiceNumber,
    })
    setEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (expense) => {
    setCurrentExpense(expense)
    setDeleteDialogOpen(true)
  }

  // Export expenses to CSV
  const exportToCSV = () => {
    const data = filteredExpenses.map((expense) => ({
      Sana: formatDate(expense.expenseDate),
      Obyekt: expense.propertyName,
      "Yetkazib beruvchi": expense.supplierName,
      Summa: expense.amount,
      "Xarajat turi": getExpenseTypeText(expense.expenseType),
      "Hisob-faktura": expense.invoiceNumber,
      Tavsif: expense.description,
    }))

    downloadCSV(data, "xarajatlar.csv")

    toast({
      title: "Muvaffaqiyatli",
      description: "Xarajatlar CSV formatida yuklab olindi",
    })
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Xarajatlar</h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtrlar
          </Button>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Eksport
          </Button>

          {(isAdmin || isAccountant) && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yangi xarajat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yangi xarajat qo'shish</DialogTitle>
                  <DialogDescription>Yangi xarajat ma'lumotlarini kiriting</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyId">Obyekt</Label>
                      <Select
                        value={expenseForm.propertyId}
                        onValueChange={(value) => handleExpenseFormChange("propertyId", value)}
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
                        value={expenseForm.supplierId}
                        onValueChange={(value) => handleExpenseFormChange("supplierId", value)}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Summa</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0"
                          className="pl-8"
                          value={expenseForm.amount}
                          onChange={(e) => handleExpenseFormChange("amount", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expenseType">Xarajat turi</Label>
                      <Select
                        value={expenseForm.expenseType}
                        onValueChange={(value) => handleExpenseFormChange("expenseType", value)}
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expenseDate">Sana</Label>
                      <Input
                        id="expenseDate"
                        type="date"
                        value={expenseForm.expenseDate}
                        onChange={(e) => handleExpenseFormChange("expenseDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Hisob-faktura raqami</Label>
                      <Input
                        id="invoiceNumber"
                        placeholder="INV-12345"
                        value={expenseForm.invoiceNumber}
                        onChange={(e) => handleExpenseFormChange("invoiceNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Tavsif</Label>
                    <Input
                      id="description"
                      placeholder="Xarajat tavsifi"
                      value={expenseForm.description}
                      onChange={(e) => handleExpenseFormChange("description", e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleAddExpense}>Qo'shish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." className="pl-8" value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Jadval</TabsTrigger>
          <TabsTrigger value="stats">Statistika</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sana</TableHead>
                    <TableHead>Obyekt</TableHead>
                    <TableHead>Yetkazib beruvchi</TableHead>
                    <TableHead>Xarajat turi</TableHead>
                    <TableHead className="text-right">Summa</TableHead>
                    <TableHead>Hisob-faktura</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>{expense.propertyName}</TableCell>
                        <TableCell>{expense.supplierName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getExpenseTypeText(expense.expenseType)}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>{expense.invoiceNumber}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Tahrirlash</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(expense)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>O'chirish</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Xarajatlar topilmadi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Jami: {filteredExpenses.length} ta xarajat</div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                      )
                      .map((page, i, array) => {
                        if (i > 0 && array[i - 1] !== page - 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink onClick={() => paginate(page)} isActive={page === currentPage}>
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          )
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink onClick={() => paginate(page)} isActive={page === currentPage}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami xarajatlar</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Xarajat turlari bo'yicha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.expensesByType).map(([type, amount]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{getExpenseTypeText(type)}</span>
                      <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(amount / stats.totalExpenses) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Obyektlar bo'yicha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.expensesByProperty).map(([propertyId, amount]) => {
                  const property = properties.find((p) => p.id === Number.parseInt(propertyId))
                  return (
                    <div key={propertyId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{property ? property.name : "Noma'lum"}</span>
                        <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(amount / stats.totalExpenses) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xarajatni tahrirlash</DialogTitle>
            <DialogDescription>Xarajat ma'lumotlarini tahrirlang</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-propertyId">Obyekt</Label>
                <Select
                  value={expenseForm.propertyId}
                  onValueChange={(value) => handleExpenseFormChange("propertyId", value)}
                >
                  <SelectTrigger id="edit-propertyId">
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
                <Label htmlFor="edit-supplierId">Yetkazib beruvchi</Label>
                <Select
                  value={expenseForm.supplierId}
                  onValueChange={(value) => handleExpenseFormChange("supplierId", value)}
                >
                  <SelectTrigger id="edit-supplierId">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Summa</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    placeholder="0"
                    className="pl-8"
                    value={expenseForm.amount}
                    onChange={(e) => handleExpenseFormChange("amount", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expenseType">Xarajat turi</Label>
                <Select
                  value={expenseForm.expenseType}
                  onValueChange={(value) => handleExpenseFormChange("expenseType", value)}
                >
                  <SelectTrigger id="edit-expenseType">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expenseDate">Sana</Label>
                <Input
                  id="edit-expenseDate"
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(e) => handleExpenseFormChange("expenseDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNumber">Hisob-faktura raqami</Label>
                <Input
                  id="edit-invoiceNumber"
                  placeholder="INV-12345"
                  value={expenseForm.invoiceNumber}
                  onChange={(e) => handleExpenseFormChange("invoiceNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Tavsif</Label>
              <Input
                id="edit-description"
                placeholder="Xarajat tavsifi"
                value={expenseForm.description}
                onChange={(e) => handleExpenseFormChange("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleEditExpense}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Expense Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xarajatni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Siz rostdan ham bu xarajatni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense} className="bg-destructive text-destructive-foreground">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrlar</DialogTitle>
            <DialogDescription>Xarajatlarni filtrlash uchun parametrlarni tanlang</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-propertyId">Obyekt</Label>
                <Select value={filters.propertyId} onValueChange={(value) => handleFilterChange("propertyId", value)}>
                  <SelectTrigger id="filter-propertyId">
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
                <Label htmlFor="filter-supplierId">Yetkazib beruvchi</Label>
                <Select value={filters.supplierId} onValueChange={(value) => handleFilterChange("supplierId", value)}>
                  <SelectTrigger id="filter-supplierId">
                    <SelectValue placeholder="Barcha yetkazib beruvchilar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha yetkazib beruvchilar</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-expenseType">Xarajat turi</Label>
              <Select value={filters.expenseType} onValueChange={(value) => handleFilterChange("expenseType", value)}>
                <SelectTrigger id="filter-expenseType">
                  <SelectValue placeholder="Barcha xarajat turlari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha xarajat turlari</SelectItem>
                  <SelectItem value="construction_materials">Qurilish materiallari</SelectItem>
                  <SelectItem value="labor">Ishchi kuchi</SelectItem>
                  <SelectItem value="equipment">Jihozlar</SelectItem>
                  <SelectItem value="utilities">Kommunal xizmatlar</SelectItem>
                  <SelectItem value="other">Boshqa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sana oralig'i</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                        </>
                      ) : (
                        formatDate(dateRange.from)
                      )
                    ) : (
                      "Sana tanlang"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-minAmount">Minimal summa</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="filter-minAmount"
                    type="number"
                    placeholder="0"
                    className="pl-8"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-maxAmount">Maksimal summa</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="filter-maxAmount"
                    type="number"
                    placeholder="0"
                    className="pl-8"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={resetFilters} className="mr-auto">
              <X className="mr-2 h-4 w-4" />
              Tozalash
            </Button>
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>Qo'llash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ExpensesPage

