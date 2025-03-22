"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { toast } from "../components/ui/use-toast"

const DataContext = createContext()

export const useData = () => useContext(DataContext)

export const DataProvider = ({ children }) => {
  const [properties, setProperties] = useState([])
  const [apartments, setApartments] = useState([])
  const [clients, setClients] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load data from localStorage or initialize with mock data
    const loadData = async () => {
      try {
        // Check if data exists in localStorage
        const savedProperties = localStorage.getItem("ahlan_properties")
        const savedApartments = localStorage.getItem("ahlan_apartments")
        const savedClients = localStorage.getItem("ahlan_clients")
        const savedSuppliers = localStorage.getItem("ahlan_suppliers")
        const savedExpenses = localStorage.getItem("ahlan_expenses")
        const savedInvoices = localStorage.getItem("ahlan_invoices")
        const savedPayments = localStorage.getItem("ahlan_payments")
        const savedDocuments = localStorage.getItem("ahlan_documents")

        if (
          savedProperties &&
          savedApartments &&
          savedClients &&
          savedSuppliers &&
          savedExpenses &&
          savedInvoices &&
          savedPayments &&
          savedDocuments
        ) {
          // Load data from localStorage
          setProperties(JSON.parse(savedProperties))
          setApartments(JSON.parse(savedApartments))
          setClients(JSON.parse(savedClients))
          setSuppliers(JSON.parse(savedSuppliers))
          setExpenses(JSON.parse(savedExpenses))
          setInvoices(JSON.parse(savedInvoices))
          setPayments(JSON.parse(savedPayments))
          setDocuments(JSON.parse(savedDocuments))
          setLoading(false)
          return
        }

        // Generate mock data if not in localStorage
        // Generate mock properties data
        const mockProperties = [
          {
            id: 1,
            name: "Navoiy 108K",
            address: "Navoiy ko'chasi 108K, Toshkent",
            description: "Zamonaviy qurilish texnologiyalari asosida qurilgan ko'p qavatli turar-joy binosi",
            totalFloors: 16,
            totalApartments: 48,
            startDate: "2022-03-15",
            endDate: "2023-12-30",
            image: "https://via.placeholder.com/600x300?text=Navoiy+108K",
          },
          {
            id: 2,
            name: "Navoiy 108L",
            address: "Navoiy ko'chasi 108L, Toshkent",
            description: "Zamonaviy qurilish texnologiyalari asosida qurilgan ko'p qavatli turar-joy binosi",
            totalFloors: 16,
            totalApartments: 32,
            startDate: "2022-04-20",
            endDate: "2024-01-30",
            image: "https://via.placeholder.com/600x300?text=Navoiy+108L",
          },
          {
            id: 3,
            name: "Baqachorsu",
            address: "Baqachorsu mavzesi, Toshkent",
            description: "Zamonaviy qurilish texnologiyalari asosida qurilgan ko'p qavatli turar-joy binosi",
            totalFloors: 16,
            totalApartments: 40,
            startDate: "2022-05-10",
            endDate: "2024-02-28",
            image: "https://via.placeholder.com/600x300?text=Baqachorsu",
          },
        ]

        // Generate mock apartments
        const mockApartments = []
        mockProperties.forEach((property) => {
          for (let i = 1; i <= property.totalApartments; i++) {
            const floor = Math.ceil(i / 3)
            const status = Math.random() < 0.6 ? "sold" : Math.random() < 0.5 ? "reserved" : "available"
            const rooms = Math.floor(Math.random() * 3) + 1
            const area = 50 + Math.floor(Math.random() * 50)
            const price = area * 1000 + Math.floor(Math.random() * 10000)

            mockApartments.push({
              id: property.id * 100 + i,
              propertyId: property.id,
              propertyName: property.name,
              number: `${floor}${String(i % 4 || 4).padStart(2, "0")}`,
              floor,
              rooms,
              area,
              price,
              status,
              clientId: status !== "available" ? Math.floor(Math.random() * 20) + 1 : null,
              reservationDate: status === "reserved" ? new Date().toISOString() : null,
              soldDate: status === "sold" ? new Date().toISOString() : null,
              description: "Zamonaviy ta'mirlangan, yorug' va shinam xonadon. Barcha qulayliklar mavjud.",
              features: [
                "Markaziy isitish tizimi",
                "Konditsioner",
                "Keng balkon",
                "Yangi ta'mirlangan",
                "Mebel bilan jihozlangan",
                "Lift",
                "Videokuzatuv",
              ],
              images: [
                "https://via.placeholder.com/500x300?text=Apartment+Interior",
                "https://via.placeholder.com/500x300?text=Apartment+Kitchen",
                "https://via.placeholder.com/500x300?text=Apartment+Bathroom",
              ],
            })
          }
        })

        // Generate mock clients
        const mockClients = Array.from({ length: 20 }, (_, i) => {
          const propertyId = Math.floor(Math.random() * 3) + 1
          const apartmentId =
            propertyId * 100 +
            Math.floor(Math.random() * mockProperties.find((p) => p.id === propertyId).totalApartments) +
            1

          return {
            id: i + 1,
            name: `Mijoz ${i + 1}`,
            phone: `+998 9${i % 10} ${100 + i} ${10 + i} ${20 + i}`,
            email: `client${i + 1}@example.com`,
            address: "Toshkent sh., Chilonzor tumani",
            passportNumber: `AA${1000000 + i}`,
            propertyId,
            propertyName: mockProperties.find((p) => p.id === propertyId)?.name || "",
            apartmentId,
            apartmentNumber: mockApartments.find((a) => a.id === apartmentId)?.number || "",
            totalPurchase: Math.floor(Math.random() * 50000) + 10000,
            balance: Math.floor(Math.random() * 10000) - 5000,
            payments: Array.from({ length: 5 }, (_, j) => {
              const statuses = ["paid", "pending", "overdue"]
              const status = statuses[Math.floor(Math.random() * statuses.length)]
              const paymentTypes = ["cash", "card", "bank_transfer", "installment"]
              const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)]
              const date = new Date()
              date.setDate(date.getDate() - Math.floor(Math.random() * 30))

              return {
                id: j + 1,
                date: date.toISOString(),
                amount: Math.floor(Math.random() * 5000) + 1000,
                description: "To'lov",
                paymentType,
                status,
              }
            }),
            documents: Array.from({ length: 3 }, (_, j) => {
              const types = ["contract", "payment_schedule", "acceptance_certificate", "invoice", "other"]
              const type = types[Math.floor(Math.random() * types.length)]
              const date = new Date()
              date.setDate(date.getDate() - Math.floor(Math.random() * 30))

              return {
                id: j + 1,
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
                date: date.toISOString(),
                fileUrl: "#",
              }
            }),
          }
        })

        // Generate mock suppliers
        const mockSuppliers = Array.from({ length: 10 }, (_, i) => {
          return {
            id: i + 1,
            name: `Yetkazib beruvchi ${i + 1}`,
            contactPerson: `Aloqa shaxsi ${i + 1}`,
            phone: `+998 9${i % 10} ${100 + i} ${10 + i} ${20 + i}`,
            email: `supplier${i + 1}@example.com`,
            address: "Toshkent sh., Chilonzor tumani",
            description: "Qurilish materiallari yetkazib beruvchi",
            totalPurchases: Math.floor(Math.random() * 50000) + 10000,
            balance: Math.floor(Math.random() * 10000) - 5000,
            transactions: Array.from({ length: 10 }, (_, j) => {
              const types = ["purchase", "payment"]
              const type = types[Math.floor(Math.random() * types.length)]
              const date = new Date()
              date.setDate(date.getDate() - Math.floor(Math.random() * 30))

              return {
                id: j + 1,
                date: date.toISOString(),
                amount:
                  type === "purchase"
                    ? -(Math.floor(Math.random() * 5000) + 1000)
                    : Math.floor(Math.random() * 5000) + 1000,
                description: type === "purchase" ? "Qurilish materiallari xaridi" : "To'lov",
                type,
                invoiceNumber: type === "purchase" ? `INV-${2023}${String(j + 1).padStart(4, "0")}` : "",
              }
            }),
            invoices: Array.from({ length: 5 }, (_, j) => {
              const statuses = ["paid", "pending", "overdue"]
              const status = statuses[Math.floor(Math.random() * statuses.length)]
              const date = new Date()
              date.setDate(date.getDate() - Math.floor(Math.random() * 30))

              return {
                id: j + 1,
                invoiceNumber: `INV-${2023}${String(j + 1).padStart(4, "0")}`,
                date: date.toISOString(),
                amount: Math.floor(Math.random() * 5000) + 1000,
                status,
                description: "Qurilish materiallari xaridi",
              }
            }),
          }
        })

        // Generate mock expenses
        const mockExpenses = Array.from({ length: 30 }, (_, i) => {
          const expenseTypes = ["construction_materials", "labor", "equipment", "utilities", "other"]
          const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]
          const propertyId = Math.floor(Math.random() * 3) + 1
          const supplierId = Math.floor(Math.random() * 10) + 1
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

        // Generate mock invoices
        const mockInvoices = Array.from({ length: 30 }, (_, i) => {
          const statuses = ["paid", "pending", "overdue"]
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const propertyId = Math.floor(Math.random() * 3) + 1
          const supplierId = Math.floor(Math.random() * 10) + 1
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 30))
          const dueDate = new Date(date)
          dueDate.setDate(date.getDate() + 30)

          return {
            id: i + 1,
            invoiceNumber: `INV-${2023}${String(i + 1).padStart(4, "0")}`,
            propertyId,
            propertyName: mockProperties.find((p) => p.id === propertyId)?.name || "",
            supplierId,
            supplierName: mockSuppliers.find((s) => s.id === supplierId)?.name || "",
            amount: Math.floor(Math.random() * 10000) + 1000,
            status,
            invoiceDate: date.toISOString(),
            dueDate: dueDate.toISOString(),
            description: "Hisob-faktura tavsifi",
          }
        })

        // Generate mock payments
        const mockPayments = Array.from({ length: 30 }, (_, i) => {
          const statuses = ["paid", "pending", "overdue"]
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const paymentTypes = ["cash", "card", "bank_transfer", "installment"]
          const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)]
          const propertyId = Math.floor(Math.random() * 3) + 1
          const clientId = Math.floor(Math.random() * 20) + 1
          const date = new Date()
          date.setDate(date.getDate() - Math.floor(Math.random() * 30))

          return {
            id: i + 1,
            clientId,
            clientName: mockClients.find((c) => c.id === clientId)?.name || "",
            propertyId,
            propertyName: mockProperties.find((p) => p.id === propertyId)?.name || "",
            apartmentId:
              propertyId * 100 +
              Math.floor(Math.random() * mockProperties.find((p) => p.id === propertyId).totalApartments) +
              1,
            apartmentNumber: `${Math.floor(Math.random() * 16) + 1}${String(Math.floor(Math.random() * 4) + 1).padStart(2, "0")}`,
            amount: Math.floor(Math.random() * 10000) + 1000,
            paymentType,
            status,
            paymentDate: date.toISOString(),
            dueDate: status === "overdue" ? new Date(date.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString() : null,
            description: "To'lov tavsifi",
          }
        })

        // Generate mock documents
        const mockDocuments = Array.from({ length: 20 }, (_, i) => {
          const types = ["contract", "payment_schedule", "acceptance_certificate", "invoice", "other"]
          const type = types[Math.floor(Math.random() * types.length)]
          const propertyId = Math.floor(Math.random() * 3) + 1
          const clientId = Math.floor(Math.random() * 20) + 1
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
            apartmentId:
              propertyId * 100 +
              Math.floor(Math.random() * mockProperties.find((p) => p.id === propertyId).totalApartments) +
              1,
            apartmentNumber: `${Math.floor(Math.random() * 16) + 1}${String(Math.floor(Math.random() * 4) + 1).padStart(2, "0")}`,
            date: date.toISOString(),
            description: "Hujjat tavsifi",
            fileUrl: "#",
          }
        })

        setProperties(mockProperties)
        setApartments(mockApartments)
        setClients(mockClients)
        setSuppliers(mockSuppliers)
        setExpenses(mockExpenses)
        setInvoices(mockInvoices)
        setPayments(mockPayments)
        setDocuments(mockDocuments)

        // Save to localStorage
        localStorage.setItem("ahlan_properties", JSON.stringify(mockProperties))
        localStorage.setItem("ahlan_apartments", JSON.stringify(mockApartments))
        localStorage.setItem("ahlan_clients", JSON.stringify(mockClients))
        localStorage.setItem("ahlan_suppliers", JSON.stringify(mockSuppliers))
        localStorage.setItem("ahlan_expenses", JSON.stringify(mockExpenses))
        localStorage.setItem("ahlan_invoices", JSON.stringify(mockInvoices))
        localStorage.setItem("ahlan_payments", JSON.stringify(mockPayments))
        localStorage.setItem("ahlan_documents", JSON.stringify(mockDocuments))

        setLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err.message)
        setLoading(false)

        toast({
          title: "Xatolik",
          description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading && properties.length > 0) {
      localStorage.setItem("ahlan_properties", JSON.stringify(properties))
    }
  }, [properties, loading])

  useEffect(() => {
    if (!loading && apartments.length > 0) {
      localStorage.setItem("ahlan_apartments", JSON.stringify(apartments))
    }
  }, [apartments, loading])

  useEffect(() => {
    if (!loading && clients.length > 0) {
      localStorage.setItem("ahlan_clients", JSON.stringify(clients))
    }
  }, [clients, loading])

  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      localStorage.setItem("ahlan_suppliers", JSON.stringify(suppliers))
    }
  }, [suppliers, loading])

  useEffect(() => {
    if (!loading && expenses.length > 0) {
      localStorage.setItem("ahlan_expenses", JSON.stringify(expenses))
    }
  }, [expenses, loading])

  useEffect(() => {
    if (!loading && invoices.length > 0) {
      localStorage.setItem("ahlan_invoices", JSON.stringify(invoices))
    }
  }, [invoices, loading])

  useEffect(() => {
    if (!loading && payments.length > 0) {
      localStorage.setItem("ahlan_payments", JSON.stringify(payments))
    }
  }, [payments, loading])

  useEffect(() => {
    if (!loading && documents.length > 0) {
      localStorage.setItem("ahlan_documents", JSON.stringify(documents))
    }
  }, [documents, loading])

  // CRUD operations for properties
  const addProperty = (property) => {
    try {
      const newProperty = {
        ...property,
        id: properties.length > 0 ? Math.max(...properties.map((p) => p.id)) + 1 : 1,
      }
      setProperties([...properties, newProperty])

      toast({
        title: "Obyekt qo'shildi",
        description: "Yangi obyekt muvaffaqiyatli qo'shildi",
      })

      return newProperty
    } catch (err) {
      console.error("Error adding property:", err)

      toast({
        title: "Xatolik",
        description: "Obyektni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateProperty = (id, updatedProperty) => {
    try {
      setProperties(properties.map((property) => (property.id === id ? { ...property, ...updatedProperty } : property)))

      toast({
        title: "Obyekt yangilandi",
        description: "Obyekt muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating property:", err)

      toast({
        title: "Xatolik",
        description: "Obyektni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteProperty = (id) => {
    try {
      // Check if property has apartments
      const propertyApartments = apartments.filter((apartment) => apartment.propertyId === id)
      if (propertyApartments.length > 0) {
        throw new Error("Bu obyektda xonadonlar mavjud. Avval xonadonlarni o'chiring.")
      }

      setProperties(properties.filter((property) => property.id !== id))

      toast({
        title: "Obyekt o'chirildi",
        description: "Obyekt muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting property:", err)

      toast({
        title: "Xatolik",
        description: err.message || "Obyektni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for apartments
  const addApartment = (apartment) => {
    try {
      const newApartment = {
        ...apartment,
        id: apartments.length > 0 ? Math.max(...apartments.map((a) => a.id)) + 1 : 1,
      }
      setApartments([...apartments, newApartment])

      toast({
        title: "Xonadon qo'shildi",
        description: "Yangi xonadon muvaffaqiyatli qo'shildi",
      })

      return newApartment
    } catch (err) {
      console.error("Error adding apartment:", err)

      toast({
        title: "Xatolik",
        description: "Xonadonni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateApartment = (id, updatedApartment) => {
    try {
      setApartments(
        apartments.map((apartment) => (apartment.id === id ? { ...apartment, ...updatedApartment } : apartment)),
      )

      toast({
        title: "Xonadon yangilandi",
        description: "Xonadon muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating apartment:", err)

      toast({
        title: "Xatolik",
        description: "Xonadonni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteApartment = (id) => {
    try {
      // Check if apartment is sold or reserved
      const apartment = apartments.find((a) => a.id === id)
      if (apartment && apartment.status !== "available") {
        throw new Error("Bu xonadon sotilgan yoki band qilingan. O'chirib bo'lmaydi.")
      }

      setApartments(apartments.filter((apartment) => apartment.id !== id))

      toast({
        title: "Xonadon o'chirildi",
        description: "Xonadon muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting apartment:", err)

      toast({
        title: "Xatolik",
        description: err.message || "Xonadonni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for clients
  const addClient = (client) => {
    try {
      const newClient = {
        ...client,
        id: clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1,
      }
      setClients([...clients, newClient])

      toast({
        title: "Mijoz qo'shildi",
        description: "Yangi mijoz muvaffaqiyatli qo'shildi",
      })

      return newClient
    } catch (err) {
      console.error("Error adding client:", err)

      toast({
        title: "Xatolik",
        description: "Mijozni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateClient = (id, updatedClient) => {
    try {
      setClients(clients.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)))

      toast({
        title: "Mijoz yangilandi",
        description: "Mijoz muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating client:", err)

      toast({
        title: "Xatolik",
        description: "Mijozni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteClient = (id) => {
    try {
      // Check if client has apartments
      const clientApartments = apartments.filter((apartment) => apartment.clientId === id)
      if (clientApartments.length > 0) {
        throw new Error("Bu mijozning xonadonlari mavjud. Avval xonadonlarni o'chiring.")
      }

      setClients(clients.filter((client) => client.id !== id))

      toast({
        title: "Mijoz o'chirildi",
        description: "Mijoz muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting client:", err)

      toast({
        title: "Xatolik",
        description: err.message || "Mijozni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for suppliers
  const addSupplier = (supplier) => {
    try {
      const newSupplier = {
        ...supplier,
        id: suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1,
      }
      setSuppliers([...suppliers, newSupplier])

      toast({
        title: "Yetkazib beruvchi qo'shildi",
        description: "Yangi yetkazib beruvchi muvaffaqiyatli qo'shildi",
      })

      return newSupplier
    } catch (err) {
      console.error("Error adding supplier:", err)

      toast({
        title: "Xatolik",
        description: "Yetkazib beruvchini qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateSupplier = (id, updatedSupplier) => {
    try {
      setSuppliers(suppliers.map((supplier) => (supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier)))

      toast({
        title: "Yetkazib beruvchi yangilandi",
        description: "Yetkazib beruvchi muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating supplier:", err)

      toast({
        title: "Xatolik",
        description: "Yetkazib beruvchini yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteSupplier = (id) => {
    try {
      // Check if supplier has expenses
      const supplierExpenses = expenses.filter((expense) => expense.supplierId === id)
      if (supplierExpenses.length > 0) {
        throw new Error("Bu yetkazib beruvchining xarajatlari mavjud. Avval xarajatlarni o'chiring.")
      }

      setSuppliers(suppliers.filter((supplier) => supplier.id !== id))

      toast({
        title: "Yetkazib beruvchi o'chirildi",
        description: "Yetkazib beruvchi muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting supplier:", err)

      toast({
        title: "Xatolik",
        description: err.message || "Yetkazib beruvchini o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for expenses
  const addExpense = (expense) => {
    try {
      const newExpense = {
        ...expense,
        id: expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1,
      }
      setExpenses([...expenses, newExpense])

      toast({
        title: "Xarajat qo'shildi",
        description: "Yangi xarajat muvaffaqiyatli qo'shildi",
      })

      return newExpense
    } catch (err) {
      console.error("Error adding expense:", err)

      toast({
        title: "Xatolik",
        description: "Xarajatni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateExpense = (id, updatedExpense) => {
    try {
      setExpenses(expenses.map((expense) => (expense.id === id ? { ...expense, ...updatedExpense } : expense)))

      toast({
        title: "Xarajat yangilandi",
        description: "Xarajat muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating expense:", err)

      toast({
        title: "Xatolik",
        description: "Xarajatni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteExpense = (id) => {
    try {
      setExpenses(expenses.filter((expense) => expense.id !== id))

      toast({
        title: "Xarajat o'chirildi",
        description: "Xarajat muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting expense:", err)

      toast({
        title: "Xatolik",
        description: "Xarajatni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for invoices
  const addInvoice = (invoice) => {
    try {
      const newInvoice = {
        ...invoice,
        id: invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1,
      }
      setInvoices([...invoices, newInvoice])

      toast({
        title: "Hisob-faktura qo'shildi",
        description: "Yangi hisob-faktura muvaffaqiyatli qo'shildi",
      })

      return newInvoice
    } catch (err) {
      console.error("Error adding invoice:", err)

      toast({
        title: "Xatolik",
        description: "Hisob-fakturani qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateInvoice = (id, updatedInvoice) => {
    try {
      setInvoices(invoices.map((invoice) => (invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice)))

      toast({
        title: "Hisob-faktura yangilandi",
        description: "Hisob-faktura muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating invoice:", err)

      toast({
        title: "Xatolik",
        description: "Hisob-fakturani yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteInvoice = (id) => {
    try {
      setInvoices(invoices.filter((invoice) => invoice.id !== id))

      toast({
        title: "Hisob-faktura o'chirildi",
        description: "Hisob-faktura muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting invoice:", err)

      toast({
        title: "Xatolik",
        description: "Hisob-fakturani o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for payments
  const addPayment = (payment) => {
    try {
      const newPayment = {
        ...payment,
        id: payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1,
      }
      setPayments([...payments, newPayment])

      // Update client balance if client exists
      if (payment.clientId) {
        const client = clients.find((c) => c.id === payment.clientId)
        if (client) {
          updateClient(client.id, {
            balance: client.balance + payment.amount,
          })
        }
      }

      toast({
        title: "To'lov qo'shildi",
        description: "Yangi to'lov muvaffaqiyatli qo'shildi",
      })

      return newPayment
    } catch (err) {
      console.error("Error adding payment:", err)

      toast({
        title: "Xatolik",
        description: "To'lovni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updatePayment = (id, updatedPayment) => {
    try {
      const oldPayment = payments.find((p) => p.id === id)

      setPayments(payments.map((payment) => (payment.id === id ? { ...payment, ...updatedPayment } : payment)))

      // Update client balance if amount changed and client exists
      if (oldPayment && updatedPayment.amount && oldPayment.clientId) {
        const client = clients.find((c) => c.id === oldPayment.clientId)
        if (client) {
          updateClient(client.id, {
            balance: client.balance - oldPayment.amount + updatedPayment.amount,
          })
        }
      }

      toast({
        title: "To'lov yangilandi",
        description: "To'lov muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating payment:", err)

      toast({
        title: "Xatolik",
        description: "To'lovni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deletePayment = (id) => {
    try {
      const payment = payments.find((p) => p.id === id)

      setPayments(payments.filter((payment) => payment.id !== id))

      // Update client balance if client exists
      if (payment && payment.clientId) {
        const client = clients.find((c) => c.id === payment.clientId)
        if (client) {
          updateClient(client.id, {
            balance: client.balance - payment.amount,
          })
        }
      }

      toast({
        title: "To'lov o'chirildi",
        description: "To'lov muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting payment:", err)

      toast({
        title: "Xatolik",
        description: "To'lovni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // CRUD operations for documents
  const addDocument = (document) => {
    try {
      const newDocument = {
        ...document,
        id: documents.length > 0 ? Math.max(...documents.map((d) => d.id)) + 1 : 1,
      }
      setDocuments([...documents, newDocument])

      toast({
        title: "Hujjat qo'shildi",
        description: "Yangi hujjat muvaffaqiyatli qo'shildi",
      })

      return newDocument
    } catch (err) {
      console.error("Error adding document:", err)

      toast({
        title: "Xatolik",
        description: "Hujjatni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const updateDocument = (id, updatedDocument) => {
    try {
      setDocuments(documents.map((document) => (document.id === id ? { ...document, ...updatedDocument } : document)))

      toast({
        title: "Hujjat yangilandi",
        description: "Hujjat muvaffaqiyatli yangilandi",
      })
    } catch (err) {
      console.error("Error updating document:", err)

      toast({
        title: "Xatolik",
        description: "Hujjatni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  const deleteDocument = (id) => {
    try {
      setDocuments(documents.filter((document) => document.id !== id))

      toast({
        title: "Hujjat o'chirildi",
        description: "Hujjat muvaffaqiyatli o'chirildi",
      })
    } catch (err) {
      console.error("Error deleting document:", err)

      toast({
        title: "Xatolik",
        description: "Hujjatni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })

      throw err
    }
  }

  // Statistics and reports
  const getPropertyStatistics = (propertyId = null) => {
    try {
      const propertyApartments = propertyId ? apartments.filter((a) => a.propertyId === propertyId) : apartments

      const totalApartments = propertyApartments.length
      const soldApartments = propertyApartments.filter((a) => a.status === "sold").length
      const reservedApartments = propertyApartments.filter((a) => a.status === "reserved").length
      const availableApartments = propertyApartments.filter((a) => a.status === "available").length

      const totalSales = propertyApartments
        .filter((a) => a.status === "sold")
        .reduce((total, apartment) => total + apartment.price, 0)

      const propertyPayments = propertyId ? payments.filter((p) => p.propertyId === propertyId) : payments

      const totalPayments = propertyPayments.reduce((total, payment) => total + payment.amount, 0)
      const pendingPayments = propertyPayments
        .filter((p) => p.status === "pending")
        .reduce((total, payment) => total + payment.amount, 0)
      const overduePayments = propertyPayments
        .filter((p) => p.status === "overdue")
        .reduce((total, payment) => total + payment.amount, 0)

      return {
        totalApartments,
        soldApartments,
        reservedApartments,
        availableApartments,
        totalSales,
        totalPayments,
        pendingPayments,
        overduePayments,
      }
    } catch (err) {
      console.error("Error getting property statistics:", err)
      return {
        totalApartments: 0,
        soldApartments: 0,
        reservedApartments: 0,
        availableApartments: 0,
        totalSales: 0,
        totalPayments: 0,
        pendingPayments: 0,
        overduePayments: 0,
      }
    }
  }

  const getExpenseStatistics = (propertyId = null, dateRange = null) => {
    try {
      let filteredExpenses = expenses

      if (propertyId) {
        filteredExpenses = filteredExpenses.filter((e) => e.propertyId === propertyId)
      }

      if (dateRange) {
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
        }

        filteredExpenses = filteredExpenses.filter((e) => new Date(e.expenseDate) >= startDate)
      }

      const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0)

      const expensesByType = {}
      filteredExpenses.forEach((expense) => {
        if (!expensesByType[expense.expenseType]) {
          expensesByType[expense.expenseType] = 0
        }
        expensesByType[expense.expenseType] += expense.amount
      })

      const expensesByProperty = {}
      filteredExpenses.forEach((expense) => {
        if (!expensesByProperty[expense.propertyId]) {
          expensesByProperty[expense.propertyId] = 0
        }
        expensesByProperty[expense.propertyId] += expense.amount
      })

      return {
        totalExpenses,
        expensesByType,
        expensesByProperty,
      }
    } catch (err) {
      console.error("Error getting expense statistics:", err)
      return {
        totalExpenses: 0,
        expensesByType: {},
        expensesByProperty: {},
      }
    }
  }

  const value = {
    loading,
    error,
    properties,
    apartments,
    clients,
    suppliers,
    expenses,
    invoices,
    payments,
    documents,
    addProperty,
    updateProperty,
    deleteProperty,
    addApartment,
    updateApartment,
    deleteApartment,
    addClient,
    updateClient,
    deleteClient,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addExpense,
    updateExpense,
    deleteExpense,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    updatePayment,
    deletePayment,
    addDocument,
    updateDocument,
    deleteDocument,
    getPropertyStatistics,
    getExpenseStatistics,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

