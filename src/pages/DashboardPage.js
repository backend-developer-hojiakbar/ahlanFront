"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../contexts/DataContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Building, Home, Users, CreditCard, DollarSign, TrendingUp, BarChart } from "lucide-react"
import { formatCurrency } from "../lib/utils"

// Components
import { Overview } from "../components/Overview"
import { RecentSales } from "../components/RecentSales"

const DashboardPage = () => {
  const navigate = useNavigate()
  const { properties, apartments, clients, payments, expenses, getPropertyStatistics } = useData()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalApartments: 0,
    soldApartments: 0,
    reservedApartments: 0,
    availableApartments: 0,
    totalClients: 0,
    totalSales: 0,
    totalPayments: 0,
    pendingPayments: 0,
    overduePayments: 0,
  })

  useEffect(() => {
    if (properties.length > 0 && apartments.length > 0 && clients.length > 0 && payments.length > 0) {
      // Calculate statistics
      const propertyStats = getPropertyStatistics()

      const totalSales = apartments
        .filter((a) => a.status === "sold")
        .reduce((total, apartment) => total + apartment.price, 0)

      const totalPayments = payments.reduce((total, payment) => total + payment.amount, 0)

      const pendingPayments = payments
        .filter((p) => p.status === "pending")
        .reduce((total, payment) => total + payment.amount, 0)

      const overduePayments = payments
        .filter((p) => p.status === "overdue")
        .reduce((total, payment) => total + payment.amount, 0)

      setStats({
        totalProperties: properties.length,
        totalApartments: apartments.length,
        soldApartments: apartments.filter((a) => a.status === "sold").length,
        reservedApartments: apartments.filter((a) => a.status === "reserved").length,
        availableApartments: apartments.filter((a) => a.status === "available").length,
        totalClients: clients.length,
        totalSales,
        totalPayments,
        pendingPayments,
        overduePayments,
      })

      setLoading(false)
    }
  }, [properties, apartments, clients, payments, getPropertyStatistics])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Boshqaruv paneli</h2>
        <Button onClick={() => navigate("/reports")}>
          <BarChart className="mr-2 h-4 w-4" />
          Hisobotlar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
          <TabsTrigger value="properties">Obyektlar</TabsTrigger>
          <TabsTrigger value="sales">Sotuvlar</TabsTrigger>
          <TabsTrigger value="payments">To'lovlar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami sotuvlar</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
                <p className="text-xs text-muted-foreground">+20.1% o'tgan oyga nisbatan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sotilgan xonadonlar</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.soldApartments}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.soldApartments / stats.totalApartments) * 100)}% jami xonadonlardan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mijozlar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">+12% o'tgan oyga nisbatan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muddati o'tgan to'lovlar</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overduePayments)}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.overduePayments / stats.totalSales) * 100)}% jami sotuvlardan
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sotuvlar dinamikasi</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>So'nggi sotuvlar</CardTitle>
                <CardDescription>Oxirgi 5 ta sotuv</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami obyektlar</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami xonadonlar</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApartments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bo'sh xonadonlar</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableApartments}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.availableApartments / stats.totalApartments) * 100)}% jami xonadonlardan
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Obyektlar</CardTitle>
              <CardDescription>Barcha obyektlar ro'yxati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video w-full bg-gray-100 relative">
                      <img
                        src={property.image || `/placeholder.svg?height=200&width=400&text=${property.name}`}
                        alt={property.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{property.name}</CardTitle>
                      <CardDescription>Jami xonadonlar: {property.totalApartments}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Calculate property-specific stats */}
                        {(() => {
                          const propertyApartments = apartments.filter((a) => a.propertyId === property.id)
                          const sold = propertyApartments.filter((a) => a.status === "sold").length
                          const reserved = propertyApartments.filter((a) => a.status === "reserved").length
                          const available = propertyApartments.filter((a) => a.status === "available").length

                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Sotilgan:</span>
                                <span className="font-medium">
                                  {sold} ({Math.round((sold / property.totalApartments) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{ width: `${Math.round((sold / property.totalApartments) * 100)}%` }}
                                ></div>
                              </div>

                              <div className="flex justify-between text-sm">
                                <span>Band qilingan:</span>
                                <span className="font-medium">
                                  {reserved} ({Math.round((reserved / property.totalApartments) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-yellow-500 h-2.5 rounded-full"
                                  style={{ width: `${Math.round((reserved / property.totalApartments) * 100)}%` }}
                                ></div>
                              </div>

                              <div className="flex justify-between text-sm">
                                <span>Bo'sh:</span>
                                <span className="font-medium">
                                  {available} ({Math.round((available / property.totalApartments) * 100)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-500 h-2.5 rounded-full"
                                  style={{ width: `${Math.round((available / property.totalApartments) * 100)}%` }}
                                ></div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        Batafsil
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami sotuvlar</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sotilgan xonadonlar</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.soldApartments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Band qilingan xonadonlar</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reservedApartments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">O'rtacha narx</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.soldApartments > 0 ? Math.round(stats.totalSales / stats.soldApartments) : 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>So'nggi sotuvlar</CardTitle>
              <CardDescription>Oxirgi 10 ta sotuv</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales extended />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami to'lovlar</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalPayments)}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.totalPayments / stats.totalSales) * 100)}% jami sotuvlardan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kutilayotgan to'lovlar</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingPayments)}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.pendingPayments / stats.totalSales) * 100)}% jami sotuvlardan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muddati o'tgan to'lovlar</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overduePayments)}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.overduePayments / stats.totalSales) * 100)}% jami sotuvlardan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">To'lov qilinishi kerak</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalSales - stats.totalPayments)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((stats.totalSales - stats.totalPayments) / stats.totalSales) * 100)}% jami sotuvlardan
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>To'lovlar holati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span>To'langan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(stats.totalPayments)}</span>
                      <span className="text-muted-foreground text-sm">
                        {Math.round((stats.totalPayments / stats.totalSales) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${Math.round((stats.totalPayments / stats.totalSales) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Kutilayotgan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(stats.pendingPayments)}</span>
                      <span className="text-muted-foreground text-sm">
                        {Math.round((stats.pendingPayments / stats.totalSales) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{ width: `${Math.round((stats.pendingPayments / stats.totalSales) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                      <span>Muddati o'tgan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(stats.overduePayments)}</span>
                      <span className="text-muted-foreground text-sm">
                        {Math.round((stats.overduePayments / stats.totalSales) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{ width: `${Math.round((stats.overduePayments / stats.totalSales) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DashboardPage

