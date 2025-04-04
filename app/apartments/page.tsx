"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { Search } from "@/components/search";
import { UserNav } from "@/components/user-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, DollarSign, User, Calendar, Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ApartmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get("propertyId");

  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    rooms: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    floor: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
  });

  const API_BASE_URL = "http://api.ahlan.uz";

  const getAuthHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      setAccessToken(token);
    }
  }, []);

  const fetchApartments = async (page = 1) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/apartments/`;
      const queryParams = new URLSearchParams();

      if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.rooms && filters.rooms !== "all") queryParams.append("rooms", filters.rooms);
      if (filters.minPrice) queryParams.append("price__gte", filters.minPrice);
      if (filters.maxPrice) queryParams.append("price__lte", filters.maxPrice);
      if (filters.minArea) queryParams.append("area__gte", filters.minArea);
      if (filters.maxArea) queryParams.append("area__lte", filters.maxArea);
      if (filters.floor && filters.floor !== "all") queryParams.append("floor", filters.floor);
      if (filters.search) queryParams.append("search", filters.search);
      queryParams.append("page", page.toString());
      queryParams.append("page_size", pagination.pageSize.toString());

      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const confirmLogout = window.confirm("Sessiya tugagan. Qayta kirishni xohlaysizmi?");
          if (confirmLogout) {
            router.push("/login");
          }
          throw new Error("Sessiya tugagan, qayta kirish kerak");
        }
        throw new Error(`Xonadonlarni olishda xatolik: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const apartmentsList = data.results || [];
      setApartments(apartmentsList);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(data.count / pagination.pageSize),
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadonlarni olishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createApartment = async (apartmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(apartmentData),
      });

      if (!response.ok) {
        throw new Error("Xonadon qo‘shishda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xonadon muvaffaqiyatli qo‘shildi",
      });
      fetchApartments(pagination.currentPage);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadon qo‘shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const updateApartment = async (id: number, apartmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(apartmentData),
      });

      if (!response.ok) {
        throw new Error("Xonadonni yangilashda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xonadon muvaffaqiyatli yangilandi",
      });
      fetchApartments(pagination.currentPage);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadonni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const partialUpdateApartment = async (id: number, apartmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(apartmentData),
      });

      if (!response.ok) {
        throw new Error("Xonadonni qisman yangilashda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xonadon qisman yangilandi",
      });
      fetchApartments(pagination.currentPage);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadonni qisman yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const deleteApartment = async (id: number) => {
    if (!window.confirm("Bu xonadonni o‘chirishni tasdiqlaysizmi?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Xonadonni o‘chirishda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xonadon muvaffaqiyatli o‘chirildi",
      });
      fetchApartments(pagination.currentPage);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadonni o‘chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (accessToken === null) return;

    if (!accessToken) {
      toast({
        title: "Xatolik",
        description: "Tizimga kirish talab qilinadi",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    fetchApartments();
  }, [accessToken, filters, router, propertyIdParam]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    fetchApartments(page);
  };

  const uniqueStatuses = Array.from(
    new Set(apartments.map((apt) => apt.status).filter((status) => status !== undefined && status !== null))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "bosh":
        return <Badge className="bg-blue-500">Bo'sh</Badge>;
      case "band":
        return <Badge className="bg-yellow-500">Band</Badge>;
      case "sold":
        return <Badge className="bg-green-500">Sotilgan</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Xonadonlar</h2>
          <Link href="/apartments/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yangi xonadon qo‘shish
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Holati</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Barcha holatlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha holatlar</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "bosh" ? "Bo'sh" : status === "band" ? "Band" : status === "sold" ? "Sotilgan" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Xonalar soni</Label>
                <Select
                  value={filters.rooms}
                  onValueChange={(value) => handleFilterChange("rooms", value)}
                >
                  <SelectTrigger id="rooms">
                    <SelectValue placeholder="Barcha xonalar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha xonalar</SelectItem>
                    <SelectItem value="1">1 xona</SelectItem>
                    <SelectItem value="2">2 xona</SelectItem>
                    <SelectItem value="3">3 xona</SelectItem>
                    <SelectItem value="4">4 xona</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Qavat</Label>
                <Select
                  value={filters.floor}
                  onValueChange={(value) => handleFilterChange("floor", value)}
                >
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="Barcha qavatlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha qavatlar</SelectItem>
                    {Array.from({ length: 16 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}-qavat
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Qidiruv</Label>
                <Input
                  id="search"
                  placeholder="Xonadon raqami bo‘yicha qidirish..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimal narx</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Minimal narx"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maksimal narx</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Maksimal narx"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minArea">Minimal maydon</Label>
                <Input
                  id="minArea"
                  type="number"
                  placeholder="Minimal maydon"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange("minArea", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxArea">Maksimal maydon</Label>
                <Input
                  id="maxArea"
                  type="number"
                  placeholder="Maksimal maydon"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-24 mb-3" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-36 mb-2" />
                  <div className="mt-4 pt-3 border-t flex space-x-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : apartments.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] border rounded-md">
            <p className="text-muted-foreground">Xonadonlar mavjud emas</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apartments.map((apartment) => (
                <Card
                  key={apartment.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/apartments/${apartment.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold">№ {apartment.room_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {apartment.object_name || "Noma‘lum obyekt"}
                        </p>
                      </div>
                      {getStatusBadge(apartment.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {apartment.rooms} xona, {apartment.area} m², {apartment.floor}-qavat
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {Number(apartment.price).toLocaleString("uz-UZ", {
                            style: "currency",
                            currency: "UZS",
                          })}
                        </span>
                      </div>

                      {apartment.status !== "bosh" && apartment.client && (
                        <div className="flex items-center text-sm">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{apartment.client?.name || "Noma‘lum mijoz"}</span>
                        </div>
                      )}

                      {apartment.status === "band" && apartment.reservation_date && (
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Band: {new Date(apartment.reservation_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {apartment.status === "sold" && apartment.sold_date && (
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Sotilgan: {new Date(apartment.sold_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/apartments/${apartment.id}`);
                        }}
                      >
                        Batafsil
                      </Button>

                      {apartment.status === "bosh" && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/apartments/${apartment.id}/reserve`);
                          }}
                        >
                          Band qilish
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/apartments/${apartment.id}`); // "/edit" qo'shilmaydi
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Yangilash
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteApartment(apartment.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        O‘chirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Oldingi
                </Button>
                <span className="flex items-center">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}