"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Building, Home, Users, CreditCard, DollarSign, TrendingUp, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
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
  const [salesTrend, setSalesTrend] = useState<any[]>([])
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token")
    if (!storedToken) {
      router.push("/login")
    } else {
      setToken(storedToken)
    }
  }, [router])

  useEffect(() => {
    if (!token) return

    const fetchAllData = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }

        const [
          objectsRes,
          apartmentsRes,
          usersRes,
          salesReportRes,
          monthlyPaymentsRes,
          salesTrendRes,
          recentSalesRes,
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/objects/", { headers }),
          fetch("http://127.0.0.1:8000/apartments/", { headers }),
          fetch("http://127.0.0.1:8000/users/", { headers }),
          fetch("http://127.0.0.1:8000/payments/sales_report/", { headers }),
          fetch("http://127.0.0.1:8000/monthly-payments/", { headers }),
          fetch("http://127.0.0.1:8000/payments/sales_trend/", { headers }),
          fetch("http://127.0.0.1:8000/payments/recent_sales/", { headers }),
        ])

        if (!objectsRes.ok) throw new Error(`Objects: ${await objectsRes.text()}`)
        if (!apartmentsRes.ok) throw new Error(`Apartments: ${await apartmentsRes.text()}`)
        if (!usersRes.ok) throw new Error(`Users: ${await usersRes.text()}`)
        if (!salesReportRes.ok) throw new Error(`Sales report: ${await salesReportRes.text()}`)
        if (!monthlyPaymentsRes.ok) throw new Error(`Monthly payments: ${await monthlyPaymentsRes.text()}`)
        if (!salesTrendRes.ok) throw new Error(`Sales trend: ${await salesTrendRes.text()}`)
        if (!recentSalesRes.ok) throw new Error(`Recent sales: ${await recentSalesRes.text()}`)

        const [
          objects,
          apartments,
          users,
          salesReport,
          monthlyPayments,
          salesTrendData,
          recentSalesData,
        ] = await Promise.all([
          objectsRes.json(),
          apartmentsRes.json(),
          usersRes.json(),
          salesReportRes.json(),
          monthlyPaymentsRes.json(),
          salesTrendRes.json(),
          recentSalesRes.json(),
        ])

        // Stats
        const totalProperties = objects.results?.length || 0
        const totalApartments = apartments.results?.length || 0
        const soldApartments = apartments.results?.filter((apt: any) => apt.status === "Sotilgan").length || 0
        const reservedApartments = apartments.results?.filter((apt: any) => apt.status === "Band qilingan").length || 0
        const availableApartments = apartments.results?.filter((apt: any) => apt.status === "Bo‘sh").length || 0
        const totalClients = users.results?.length || 0
        const totalSales = salesReport.total_income || 0
        const totalPayments = monthlyPayments.results
          ?.filter((mp: any) => mp.paid)
          .reduce((sum: number, mp: any) => sum + parseFloat(mp.amount || 0), 0) || 0
        const pendingPayments = salesReport.pending_payments || 0
        const overduePayments = monthlyPayments.results
          ?.filter((mp: any) => !mp.paid && new Date(mp.payment_date) < new Date())
          .reduce((sum: number, mp: any) => sum + parseFloat(mp.amount || 0), 0) || 0

        setStats({
          totalProperties,
          totalApartments,
          soldApartments,
          reservedApartments,
          availableApartments,
          totalClients,
          totalSales,
          totalPayments,
          pendingPayments,
          overduePayments,
        })

        // Properties
        const propertyStats = objects.results?.map((obj: any) => {
          const objApartments = apartments.results?.filter((apt: any) => apt.object?.id === obj.id) || []
          return {
            id: obj.id,
            name: obj.name,
            apartments: objApartments.length,
            sold: objApartments.filter((apt: any) => apt.status === "Sotilgan").length,
            reserved: objApartments.filter((apt: any) => apt.status === "Band qilingan").length,
            available: objApartments.filter((apt: any) => apt.status === "Bo‘sh").length,
          }
        }) || []
        setProperties(propertyStats)

        // Sales Trend va Recent Sales
        setSalesTrend(salesTrendData)
        setRecentSales(recentSalesData)

        setLoading(false)
      } catch (error: any) {
        console.error("Fetch error:", error.message)
        toast({ title: "Xatolik", description: error.message, variant: "destructive" })
        setLoading(false)
        router.push("/login")
      }
    }

    fetchAllData()
  }, [token, router])

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
          <h2 className="text-3xl font-bold tracking-tight">Boshqaruv paneli</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>
              <BarChart className="mr-2 h-4 w-4" />
              Hisobotlar
            </Button>
          </div>
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
                  <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
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
                    {stats.totalApartments
                      ? Math.round((stats.soldApartments / stats.totalApartments) * 100)
                      : 0}
                    % jami xonadonlardan
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
                  <div className="text-2xl font-bold text-red-600">${stats.overduePayments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSales ? Math.round((stats.overduePayments / stats.totalSales) * 100) : 0}% jami
                    sotuvlardan
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
                  <Overview data={salesTrend} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>So'nggi sotuvlar</CardTitle>
                  <CardDescription>Oxirgi 5 ta sotuv</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales data={recentSales} />
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
                    {stats.totalApartments
                      ? Math.round((stats.availableApartments / stats.totalApartments) * 100)
                      : 0}
                    % jami xonadonlardan
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
                          src={`/placeholder.svg?height=200&width=400&text=${property.name}`}
                          alt={property.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{property.name}</CardTitle>
                        <CardDescription>Jami xonadonlar: {property.apartments}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sotilgan:</span>
                            <span className="font-medium">
                              {property.sold}{" "}
                              ({property.apartments ? Math.round((property.sold / property.apartments) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  property.apartments ? Math.round((property.sold / property.apartments) * 100) : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Band qilingan:</span>
                            <span className="font-medium">
                              {property.reserved}{" "}
                              ({property.apartments ? Math.round((property.reserved / property.apartments) * 100) : 0}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-yellow-500 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  property.apartments
                                    ? Math.round((property.reserved / property.apartments) * 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bo'sh:</span>
                            <span className="font-medium">
                              {property.available}{" "}
                              ({property.apartments ? Math.round((property.available / property.apartments) * 100) : 0}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-500 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  property.apartments
                                    ? Math.round((property.available / property.apartments) * 100)
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => router.push(`/properties/${property.id}`)}
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
                  <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
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
                    ${stats.soldApartments ? Math.round(stats.totalSales / stats.soldApartments).toLocaleString() : 0}
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
                <RecentSales data={recentSales} extended />
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
                  <div className="text-2xl font-bold">${stats.totalPayments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSales ? Math.round((stats.totalPayments / stats.totalSales) * 100) : 0}% jami
                    sotuvlardan
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kutilayotgan to'lovlar</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">${stats.pendingPayments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSales ? Math.round((stats.pendingPayments / stats.totalSales) * 100) : 0}% jami
                    sotuvlardan
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Muddati o'tgan to'lovlar</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${stats.overduePayments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSales ? Math.round((stats.overduePayments / stats.totalSales) * 100) : 0}% jami
                    sotuvlardan
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
                    ${(stats.totalSales - stats.totalPayments).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSales
                      ? Math.round(((stats.totalSales - stats.totalPayments) / stats.totalSales) * 100)
                      : 0}
                    % jami sotuvlardan
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
                        <span className="font-medium">${stats.totalPayments.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">
                          {stats.totalSales ? Math.round((stats.totalPayments / stats.totalSales) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${stats.totalSales ? Math.round((stats.totalPayments / stats.totalSales) * 100) : 0}%`,
                        }}
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
                        <span className="font-medium">${stats.pendingPayments.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">
                          {stats.totalSales ? Math.round((stats.pendingPayments / stats.totalSales) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            stats.totalSales ? Math.round((stats.pendingPayments / stats.totalSales) * 100) : 0
                          }%`,
                        }}
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
                        <span className="font-medium">${stats.overduePayments.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">
                          {stats.totalSales ? Math.round((stats.overduePayments / stats.totalSales) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            stats.totalSales ? Math.round((stats.overduePayments / stats.totalSales) * 100) : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}