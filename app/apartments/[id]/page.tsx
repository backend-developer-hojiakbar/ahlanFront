"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { Search } from "@/components/search";
import { UserNav } from "@/components/user-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building, Home, User, FileText, CreditCard, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "naqd",
    description: "",
  });
  const [editForm, setEditForm] = useState({
    room_number: "",
    floor: "",
    rooms: "",
    area: "",
    price: "",
    description: "",
    status: "",
  });

  const API_BASE_URL = "https://ahlanapi.cdpos.uz";

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

  const fetchApartmentDetails = async () => {
    if (!accessToken) {
      toast({
        title: "Xatolik",
        description: "Tizimga kirish talab qilinadi",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const apartmentId = params.id;

      const apartmentResponse = await fetch(`${API_BASE_URL}/apartments/${apartmentId}/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!apartmentResponse.ok) {
        if (apartmentResponse.status === 401) {
          const confirmLogout = window.confirm("Sessiya tugagan. Qayta kirishni xohlaysizmi?");
          if (confirmLogout) {
            router.push("/login");
          }
          throw new Error("Sessiya tugagan, qayta kirish kerak");
        }
        throw new Error(`Xonadon ma'lumotlarini olishda xatolik: ${apartmentResponse.status}`);
      }

      const apartmentData = await apartmentResponse.json();

      const paymentsResponse = await fetch(`${API_BASE_URL}/payments/?apartment=${apartmentId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!paymentsResponse.ok) {
        throw new Error("To'lovlarni olishda xatolik");
      }

      const paymentsData = await paymentsResponse.json();
      const payments = paymentsData.results || [];

      const documents = payments.length > 0 ? payments[0].documents || [] : [];

      const clientResponse = await fetch(`${API_BASE_URL}/users/?apartment_id=${apartmentId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const clientData = await clientResponse.json();
      const client = clientData.results?.[0] || null;

      setApartment({
        ...apartmentData,
        payments,
        documents,
        client,
      });

      setEditForm({
        room_number: apartmentData.room_number || "",
        floor: apartmentData.floor || "",
        rooms: apartmentData.rooms || "",
        area: apartmentData.area || "",
        price: apartmentData.price || "",
        description: apartmentData.description || "",
        status: apartmentData.status || "",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Ma'lumotlarni olishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken === null) return;
    fetchApartmentDetails();
  }, [accessToken, params.id]);

  const handleOpenPaymentModal = () => setIsPaymentModalOpen(true);
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentForm({ amount: "", paymentDate: "", paymentType: "naqd", description: "" });
  };

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentTypeChange = (value: string) => {
    setPaymentForm((prev) => ({ ...prev, paymentType: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditStatusChange = (value: string) => {
    setEditForm((prev) => ({ ...prev, status: value }));
  };

  const handleAddPayment = async () => {
    if (!accessToken) return;

    const paymentData = {
      amount: Number(paymentForm.amount),
      payment_date: paymentForm.paymentDate,
      payment_type: paymentForm.paymentType,
      description: paymentForm.description,
      apartment: Number(params.id),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/1/add_balance/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "To‘lov qo‘shishda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "To‘lov muvaffaqiyatli qo‘shildi",
      });
      handleClosePaymentModal();
      fetchApartmentDetails();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "To‘lov qo‘shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleUpdateApartment = async () => {
    if (!accessToken) return;

    const apartmentData = {
      room_number: editForm.room_number,
      floor: Number(editForm.floor),
      rooms: Number(editForm.rooms),
      area: Number(editForm.area),
      price: Number(editForm.price),
      description: editForm.description,
      status: editForm.status,
      object: apartment.object,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${params.id}/`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(apartmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Xonadonni yangilashda xatolik");
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Xonadon muvaffaqiyatli yangilandi",
      });
      handleCloseEditModal();
      fetchApartmentDetails();
    } catch (error) {
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Xonadonni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "bosh":
        return <Badge className="bg-blue-500">Bo‘sh</Badge>;
      case "band":
        return <Badge className="bg-yellow-500">Band</Badge>;
      case "sold":
        return <Badge className="bg-green-500">Sotilgan</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

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
    );
  }

  if (!apartment) {
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
          <p className="text-muted-foreground">Xonadon topilmadi</p>
        </div>
      </div>
    );
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
            <h2 className="text-3xl font-bold tracking-tight">Xonadon № {apartment.room_number}</h2>
            <p className="text-muted-foreground">{apartment.object_name}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/apartments")}>
              <Home className="mr-2 h-4 w-4" />
              Barcha xonadonlar
            </Button>
            <Link href={`/properties/${apartment.object}`}>
              <Button variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Obyekt sahifasi
              </Button>
            </Link>
            {apartment.status === "bosh" && (
              <Button onClick={() => router.push(`/apartments/${apartment.id}/reserve`)}>
                <User className="mr-2 h-4 w-4" />
                Band qilish
              </Button>
            )}
            <Button variant="outline" onClick={handleOpenEditModal}>
              <Edit className="mr-2 h-4 w-4" />
              Tahrirlash
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-[300px]">
                  <img
                    src={apartment.object?.image || "/placeholder.svg?height=300&width=500"}
                    alt={`Xonadon № ${apartment.room_number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">{getStatusBadge(apartment.status)}</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Qavat</span>
                      <span className="text-lg font-medium">{apartment.floor}-qavat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Xonalar</span>
                      <span className="text-lg font-medium">{apartment.rooms} xona</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Maydon</span>
                      <span className="text-lg font-medium">{apartment.area} m²</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Narx</span>
                      <span className="text-lg font-medium">
                        {Number(apartment.price).toLocaleString("uz-UZ", { style: "currency", currency: "UZS" })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-2">Tavsif</h3>
                  <p className="text-muted-foreground mb-4">{apartment.description || "Tavsif mavjud emas"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Xonadon holati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Holati:</span>
                    <span>{getStatusBadge(apartment.status)}</span>
                  </div>

                  {apartment.status !== "bosh" && apartment.client && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Mijoz:</span>
                        <span>{apartment.client.fio || "Noma'lum"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span>{apartment.client.phone_number || "Mavjud emas"}</span>
                      </div>
                    </>
                  )}

                  {apartment.status === "band" && apartment.payments.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Band qilingan sana:</span>
                      <span>{new Date(apartment.payments[0].created_at).toLocaleDateString()}</span>
                    </div>
                  )}

                  {apartment.status === "sold" && apartment.payments.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sotilgan sana:</span>
                      <span>{new Date(apartment.payments[0].created_at).toLocaleDateString()}</span>
                    </div>
                  )}

                  {apartment.status === "bosh" && (
                    <Button className="w-full" onClick={() => router.push(`/apartments/${apartment.id}/reserve`)}>
                      <User className="mr-2 h-4 w-4" />
                      Band qilish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {apartment.status !== "bosh" && (
              <Card>
                <CardHeader>
                  <CardTitle>To‘lovlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apartment.payments.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {payment.payment_type === "naqd"
                              ? "Naqd to‘lov"
                              : payment.payment_type === "muddatli"
                                ? "Muddatli to‘lov"
                                : "Ipoteka"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {Number(payment.monthly_payment || payment.total_amount).toLocaleString("uz-UZ", {
                              style: "currency",
                              currency: "UZS",
                            })}
                          </div>
                          <div>
                            {payment.status === "paid" ? (
                              <Badge className="bg-green-500">To‘langan</Badge>
                            ) : payment.status === "pending" ? (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                Kutilmoqda
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-500 border-red-500">
                                Muddati o‘tgan
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button className="w-full" onClick={handleOpenPaymentModal}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      To‘lov qo‘shish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {apartment.status !== "bosh" && (
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
              <TabsTrigger value="payments">To‘lovlar jadvali</TabsTrigger>
              <TabsTrigger value="history">Tarix</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hujjatlar</CardTitle>
                  <CardDescription>Xonadon bilan bog‘liq barcha hujjatlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apartment.documents.length > 0 ? (
                      apartment.documents.map((document: any) => (
                        <div key={document.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Shartnoma</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(document.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`${API_BASE_URL}/media/${document.pdf_file}`} target="_blank" rel="noopener noreferrer">
                              Yuklab olish
                            </a>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Hujjatlar mavjud emas</p>
                    )}

                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Yangi hujjat qo‘shish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>To‘lovlar jadvali</CardTitle>
                  <CardDescription>Xonadon uchun to‘lovlar jadvali</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apartment.payments.length > 0 ? (
                      apartment.payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="font-medium">{payment.payment_type}</div>
                            <div className="text-sm text-muted-foreground">
                              Har oy {payment.due_date ? payment.due_date : "-"}-kuni
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {Number(payment.monthly_payment || 0).toLocaleString("uz-UZ", {
                                style: "currency",
                                currency: "UZS",
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Umumiy: {Number(payment.total_amount).toLocaleString("uz-UZ", {
                                style: "currency",
                                currency: "UZS",
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">To‘lovlar jadvali mavjud emas</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tarix</CardTitle>
                  <CardDescription>Xonadon bilan bog‘liq barcha o‘zgarishlar tarixi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center border rounded">
                    <p className="text-muted-foreground">Tarix ma'lumotlari hozircha mavjud emas</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* To‘lov qo‘shish uchun modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi to‘lov qo‘shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Summa (so‘m)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={paymentForm.amount}
                onChange={handlePaymentChange}
                placeholder="Summani kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">To‘lov sanasi</Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                value={paymentForm.paymentDate}
                onChange={handlePaymentChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">To‘lov turi</Label>
              <Select value={paymentForm.paymentType} onValueChange={handlePaymentTypeChange}>
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="To‘lov turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="naqd">Naqd pul</SelectItem>
                  <SelectItem value="muddatli">Muddatli to‘lov</SelectItem>
                  <SelectItem value="ipoteka">Ipoteka</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                name="description"
                value={paymentForm.description}
                onChange={handlePaymentChange}
                placeholder="To‘lov haqida qo‘shimcha ma'lumot"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePaymentModal}>
              Bekor qilish
            </Button>
            <Button onClick={handleAddPayment}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Xonadonni tahrirlash uchun modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xonadonni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Xonadon raqami</Label>
              <Input
                id="room_number"
                name="room_number"
                value={editForm.room_number}
                onChange={handleEditChange}
                placeholder="Xonadon raqamini kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Qavat</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                value={editForm.floor}
                onChange={handleEditChange}
                placeholder="Qavatni kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Xonalar soni</Label>
              <Input
                id="rooms"
                name="rooms"
                type="number"
                value={editForm.rooms}
                onChange={handleEditChange}
                placeholder="Xonalar sonini kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Maydon (m²)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                value={editForm.area}
                onChange={handleEditChange}
                placeholder="Maydonni kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Narx (so‘m)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Narxni kiriting"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Tavsifni kiriting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Holati</Label>
              <Select value={editForm.status} onValueChange={handleEditStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Holati tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bosh">Bo‘sh</SelectItem>
                  <SelectItem value="band">Band</SelectItem>
                  <SelectItem value="sold">Sotilgan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpdateApartment}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}