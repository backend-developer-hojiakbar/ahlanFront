"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainNav } from "@/components/main-nav";
import { Search } from "@/components/search";
import { UserNav } from "@/components/user-nav";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Home, Plus, Printer } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export default function ReserveApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState("naqd");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showKafil, setShowKafil] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [requestReceipt, setRequestReceipt] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    clientId: "",
    initialPayment: "",
    totalMonths: "12",
    interestRate: "0",
    comments: "",
    name: "",
    phone: "",
    email: "",
    passport: "",
    address: "",
    kafilFio: "",
    kafilPhone: "",
    kafilAddress: "",
  });

  const API_BASE_URL = "http://api.ahlan.uz";

  const getAuthHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  // Bu funksiya endi ishlatilmaydi, lekin qoldirilishi mumkin
  const getFileUploadHeaders = () => ({
    Authorization: `Bearer ${accessToken}`,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      setAccessToken(token);
    }
  }, []);

  const fetchData = async () => {
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
      if (!apartmentResponse.ok) throw new Error("Xonadon ma'lumotlarini olishda xatolik");
      const apartmentData = await apartmentResponse.json();
      setApartment(apartmentData);

      const clientsResponse = await fetch(`${API_BASE_URL}/users/?user_type=mijoz`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!clientsResponse.ok) throw new Error("Mijozlarni olishda xatolik");
      const clientsData = await clientsResponse.json();
      setClients(clientsData.results || []);

      setFormData((prev) => ({
        ...prev,
        initialPayment: Math.round(apartmentData.price * 0.3).toString(),
        interestRate: paymentType === "ipoteka" ? "10" : "0",
      }));
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
    fetchData();
  }, [accessToken, params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createClient = async () => {
    const clientData = {
      fio: formData.name,
      phone_number: formData.phone,
      email: formData.email || "",
      passport: formData.passport,
      address: formData.address || "",
      user_type: "mijoz",
      kafil_fio: formData.kafilFio || null,
      kafil_phone_number: formData.kafilPhone || null,
      kafil_address: formData.kafilAddress || null,
      password: formData.passport,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });
      if (!response.ok) throw new Error("Mijoz qo'shishda xatolik");
      const newClient = await response.json();
      return newClient.id;
    } catch (error) {
      throw new Error((error as Error).message || "Mijoz qo'shishda xatolik");
    }
  };

  const calculateMonthlyPayment = () => {
    if (!apartment || !formData.initialPayment || !formData.totalMonths) return 0;

    const principal = apartment.price - Number.parseInt(formData.initialPayment);
    const interestRate = Number(formData.interestRate) / 100;
    const months = Number(formData.totalMonths);

    const totalWithInterest = principal * (1 + interestRate);
    const monthlyPayment = (totalWithInterest / months).toFixed(2);

    const digitsOnly = monthlyPayment.replace(".", "");
    if (digitsOnly.length > 12) {
      throw new Error("Oylik to'lov 12 raqamdan oshib ketdi");
    }

    return Number(monthlyPayment);
  };

  const generateContractText = (paymentId: number, client: any) => {
    const currentDate = new Date().toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const priceInWords = (price: number) => {
      // Bu funksiya raqamni so'zga aylantirish uchun oddiy misol. To'liqroq logika qo'shishingiz mumkin.
      const units = ["", "bir", "ikki", "uch", "to'rt", "besh", "olti", "yetti", "sakkiz", "to'qqiz"];
      const tens = ["", "o'n", "yigirma", "o'ttiz", "qirq", "ellik", "oltmish", "yetmish", "sakson", "to'qson"];
      const hundreds = ["", "yuz", "ming", "million", "milliard"];

      let num = price;
      let words = [];
      let level = 0;

      while (num > 0) {
        let part = num % 1000;
        let partWords = [];

        if (part >= 100) {
          partWords.push(units[Math.floor(part / 100)] + " " + hundreds[1]);
          part %= 100;
        }
        if (part >= 10) {
          partWords.push(tens[Math.floor(part / 10)]);
          part %= 10;
        }
        if (part > 0) {
          partWords.push(units[part]);
        }

        if (partWords.length > 0 && level > 0) {
          partWords.push(hundreds[level]);
        }

        words.unshift(partWords.join(" "));
        num = Math.floor(num / 1000);
        level++;
      }

      return words.join(" ").trim() || "nol";
    };

    const contractText = `
ДАСТЛАБКИ ШАРТНОМА № ${paymentId}
Куп хонадонли турар-жой биноси қуриш ва сотиш тўғрисида
« ${currentDate} » Қўқон шаҳри

Қўқон шаҳар «AXLAN HOUSE» МЧЖ номидан низомга асосан фаолият юритувчи раҳбари SODIQOV XASANJON MUXSINJONOVICH (кейинги ўринларда-«Бажарувчи» деб юритилади) бир томондан ҳамда «${client.fio}» (кейинги ўринларда «Буюртмачи» деб аталади), иккинчи томондан Ўзбекистон Республикасининг «Хўжалик юритувчи субъектлар фаолиятининг шартномавий-хуқуқий базаси тўғрисида»ги қонунига мувофиқ мазкур шартномани қуйидагилар тўғрисида туздик.

I. ШАРТНОМА ПРЕДМЕТИ
1. Томонлар «Буюртмачи» хонадон сотиб олишга розилиги тўғрисида «Бажарувчи»га ариза орқали мурожаат этгандан сўнг, Ўзбекистон Республикаси, Фарғона вилояти, Қўқон шаҳар ${apartment.object_name} да жойлашган ${apartment.floor}-қаватли ${apartment.room_number}-хонадонли турар-жой биносини қуришга, буюртмачи вазифасини бажариш тўғрисида шартномани (кейинги ўринларда - асосий шартнома) тузиш мажбуриятини ўз зиммаларига оладилар.

II. МУҲИМ ШАРТЛАР
1. Томонлар қуйидагиларни асосий шартномани муҳим шартлари деб ҳисоблашга келишиб оладилар:
а) «Буюртмачи»га топшириладиган ${apartment.room_number}-хонадон (${apartment.rooms}-хонали умумий фойдаланиш майдони ${apartment.area} кв м) умумий қийматининг бошланғич нархи ${apartment.price.toLocaleString("uz-UZ")} сўмни ташкил этади ва ушбу нарх томонлар томонидан келишилган ҳолда ўзгариши мумкин;
б) Бажарувчи «тайёр ҳолда топшириш» шартларида турар-жой биносини қуришга бажарувчи вазифасини бажариш мажбуриятини ўз зиммасига олади ва ${apartment.floor}-қаватли ${apartment.room_number}-хонадонли турар-жой биносини лойиҳага мувофиқ қуриш бўйича барча ишларни пудратчиларни жалб қилган ҳолда ва ўз маблағлари ва/ёки жалб этилган маблағлар билан бажариш мажбуриятини, «Буюртмачи» эса шартнома бўйича мажбуриятларни лозим даражада бажариш, шу жумладан шартномада келишилган баҳони тўлаш, шунингдек қурилиш ишлари тугаганда, ўзига тегишли бўлган хонадонни қабул қилиб олиш мажбуриятини олади.
в) Шартномада назарда тутилган қурилишнинг давом этиш вақти ва ишларни бажариш муддатлари ва қиймати бажарувчининг (пудратчи) танлаш натижаларига мувофиқ белгиланади;

III. ҲИСОБ-КИТОБ ТАРТИБИ
1) «Буюртмачи» томонидан мазкур шартнома имзолангач 11 ой давомида яъни 31.12.2025 йилга қадар хонадон қуришга пул ўтказиш йўли орқали банкдаги ҳисоб-варағига хонадон қийматининг 100 фоизи яъни ${apartment.price.toLocaleString("uz-UZ")} (${priceInWords(apartment.price)}) сўм миқдорида пул маблағини ўтказади.

IV. ШАРТНОМАНИНГ АМАЛ ҚИЛИШИ
Мазкур шартнома Томонлар уни имзолаган кундан бошлаб амалга киради ва асосий шартнома тузилгунга қадар амалда бўлади.
Бажарувчининг ташаббуси билан мазкур шартнома қуйидаги ҳолларда бекор қилиниши мумкин:
- «Буюртмачи» томонидан мазкур шартнома тузилгандан кейин 31.12.2025 йилга қадар «Бажарувчининг» банкдаги ҳисоб рақамига шартноманинг 3.1 бандига кўра тўловни амалга оширмаса;

V. ЯКУНИЙ ҚОИДАЛАР
5.1. Томонларнинг ҳар бири ўз мажбуриятларини лозим даражада, мазкур шартнома шартларига мувофиқ бажариши лозим.
5.2. Томонларнинг мазкур шартнома бўйича юзага келган низолари уларнинг келишуви бўйича ҳал этилади, бундай келишувга эришилмаган тақдирда суд томонидан ҳал қилинади.
5.3. Мазкур шартнома уч нусхада тузилган бўлиб, улардан бири Банкка берилади, қолган иккитаси томонларга бир нусхадан топширилади. Барча нусхалар бир хил ва тенг юридик кучга эга.

VI. ТОМОНЛАРНИНГ РЕКВИЗИТЛАРИ ВА ИМЗОЛАРИ

Бажарувчи:                                                                 Буюртмачи:
«AXLAN HOUSE» МЧЖ                                                          «${client.fio}»
Қўқон шаҳар Фарғона Вилояти Қўқон шаҳар                                    Паспорт: ${client.passport}
Адабиёт кўчаси, 25-уй                                                      Телефон: ${client.phone_number}
СТИР: 306997685. ХХТУТ: 61110                                              Манзил: ${client.address || "Кўрсатилмаган"}
Х/р: 20208000205158478001                                                  (имзо)
МФО: 01076 Ипотека банк Қўқон филиали
Тел № (+99833) 701-75 75
(имзо)
    `;

    return contractText.trim();
  };

  const generateContractWordBlob = async (paymentId: number, client: any) => {
    const contractText = generateContractText(paymentId, client);
    const lines = contractText.split("\n");

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 1 inch = 720 twips
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: lines.map((line, index) => {
            if (line.startsWith("ДАСТЛАБКИ ШАРТНОМА №")) {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                    size: 28, // 14pt
                    font: "Times New Roman",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              });
            } else if (line.match(/^(I|II|III|IV|V|VI)\./)) {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman",
                  }),
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              });
            } else if (line.match(/^\d+\./) || line.match(/^[а-я]\)/)) {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24, // 12pt
                    font: "Times New Roman",
                  }),
                ],
                indent: { left: 720 }, // 1 inch indent
                spacing: { after: 100 },
              });
            } else if (line.startsWith("Бажарувчи:") || line.startsWith("Буюртмачи:")) {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    bold: true,
                    size: 24, // 12pt
                    font: "Times New Roman",
                  }),
                ],
                spacing: { before: 400, after: 100 },
              });
            } else if (line.trim() === "") {
              return new Paragraph({
                children: [],
                spacing: { after: 200 },
              });
            } else {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24, // 12pt
                    font: "Times New Roman",
                  }),
                ],
                spacing: { after: 100 },
              });
            }
          }),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  };

  const handleDownloadContractWord = async (paymentId: number, client: any) => {
    const blob = await generateContractWordBlob(paymentId, client);
    saveAs(blob, `contract_${paymentId}.docx`);
  };

  const handlePrintContract = () => {
    if (!requestReceipt || !receiptRef.current) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shartnoma №${requestReceipt.id}</title>
            <style>
              body { font-family: 'Times New Roman', serif; margin: 20px; line-height: 1.6; }
              h1 { text-align: center; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Bu funksiya endi handleSubmit ichida chaqirilmaydi,
  // lekin kerak bo'lsa boshqa joyda ishlatilishi mumkin.
  const createDocument = async (paymentId: number, client: any) => {
    try {
      const wordBlob = await generateContractWordBlob(paymentId, client);

      const formData = new FormData();
      formData.append("payment", paymentId.toString());
      formData.append("doc_file", wordBlob, `contract_${paymentId}.docx`);

      console.log("FormData tarkibi (hujjat uchun, lekin yuborilmaydi):");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      // -------->>> BU QISM O'CHIRILDI <<<---------
      // const response = await fetch(`${API_BASE_URL}/documents/`, {
      //   method: "POST",
      //   headers: getFileUploadHeaders(),
      //   body: formData,
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Hujjat qo'shishda xatolik");
      // }

      // toast({
      //   title: "Muvaffaqiyat",
      //   description: "Hujjat muvaffaqiyatli qo'shildi",
      // });
      // -------------------------------------------

      console.log("Hujjat yaratildi lekin APIga yuborilmadi.");

    } catch (error) {
      console.error("Hujjat yaratishda xatolik (lekin yuborilmadi):", error);
      // Hujjat yuborilmaganligi sababli bu toastni ko'rsatmaslik mumkin
      // toast({
      //   title: "Xatolik",
      //   description: (error as Error).message || "Hujjat yaratishda xatolik yuz berdi",
      //   variant: "destructive",
      // });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setSubmitting(true);
    try {
      let clientId = formData.clientId;
      let clientData;

      if (!clientId) {
        clientId = await createClient();
        clientData = {
          id: clientId,
          fio: formData.name,
          phone_number: formData.phone,
          passport: formData.passport,
          address: formData.address,
        };
      } else {
        clientData = clients.find((c) => c.id.toString() === clientId);
        if (!clientData) {
            // Agar mavjud mijoz tanlansa-yu, lekin clients massivida topilmasa
            throw new Error("Tanlangan mijoz ma'lumotlari topilmadi.");
        }
      }

      let monthlyPayment;
      try {
        monthlyPayment = calculateMonthlyPayment();
      } catch (error) {
        toast({
          title: "Xatolik",
          description: "Oylik to'lov 12 raqamdan oshib ketdi. Iltimos, qiymatlarni kamaytiring.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const paymentData = {
        user: clientId,
        apartment: Number(params.id),
        payment_type: paymentType,
        total_amount: apartment.price,
        initial_payment: formData.initialPayment || "0",
        interest_rate: Number(formData.interestRate),
        duration_months: paymentType === "muddatli" || paymentType === "ipoteka" ? Number(formData.totalMonths) : 0,
        monthly_payment: monthlyPayment.toString(),
        due_date: 15, // Yoki mos qiymat
        paid_amount: "0",
        status: "pending", // Yoki mos status
        additional_info: formData.comments,
      };

      const paymentResponse = await fetch(`${API_BASE_URL}/payments/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("To'lov qo'shish xatoligi:", errorData);
        // Xatolikni aniqroq ko'rsatish
        let errorMessage = "To'lov qo'shishda xatolik";
        if (errorData && typeof errorData === 'object') {
            const firstErrorKey = Object.keys(errorData)[0];
            if (firstErrorKey && Array.isArray(errorData[firstErrorKey])) {
                errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            }
        }
        throw new Error(errorMessage);
      }
      const payment = await paymentResponse.json();

      // -------->>> BU QATOR KOMMENTGA OLINDI <<<---------
      // await createDocument(payment.id, clientData);
      // -------------------------------------------------

      const contractText = generateContractText(payment.id, clientData);
      console.log("Shartnoma matni yaratildi.");

      setRequestReceipt({
        id: payment.id,
        client: clientData,
        contractText,
      });
      setIsReceiptModalOpen(true); // Modalni ochish

       toast({ // Muvaffaqiyat xabarini qo'shish
        title: "Muvaffaqiyat!",
        description: `Xonadon №${apartment.room_number} muvaffaqiyatli band qilindi. To'lov ID: ${payment.id}`,
      });

    } catch (error) {
      console.error("Band qilish jarayonida xatolik:", error);
      toast({
        title: "Xatolik",
        description: (error as Error).message || "Band qilishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
            <h2 className="text-3xl font-bold tracking-tight">Xonadon band qilish</h2>
            <p className="text-muted-foreground">
              {apartment ? `Xonadon № ${apartment.room_number}, ${apartment.object_name}` : "Yuklanmoqda..."}
            </p>
          </div>
          <div className="flex space-x-2">
             {apartment && (
               <Button variant="outline" onClick={() => router.push(`/apartments/${apartment.id}`)}>
                 <Home className="mr-2 h-4 w-4" />
                 Xonadon sahifasi
               </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Band qilish ma'lumotlari</CardTitle>
                <CardDescription>Xonadonni band qilish uchun ma'lumotlarni kiriting</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="existing" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="existing">Mavjud mijoz</TabsTrigger>
                      <TabsTrigger value="new">Yangi mijoz</TabsTrigger>
                    </TabsList>
                    <TabsContent value="existing">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientId">Mijozni tanlang</Label>
                          <Select
                            value={formData.clientId}
                            onValueChange={(value) => {
                              handleSelectChange("clientId", value);
                              // Yangi mijoz ma'lumotlarini tozalash
                              setFormData(prev => ({
                                ...prev,
                                name: "", phone: "", email: "", passport: "", address: "",
                                kafilFio: "", kafilPhone: "", kafilAddress: ""
                              }));
                            }}
                            // Agar yangi mijoz tabida ma'lumot kiritilsa, bu required bo'lmaydi
                            // Required logikasini tabs qiymatiga qarab boshqarish kerak bo'ladi
                            // Hozircha oddiy qoldiramiz, form validation kutubxonasi yaxshiroq
                          >
                            <SelectTrigger id="clientId">
                              <SelectValue placeholder="Mijozni tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  {client.fio} - {client.phone_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="new">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">F.I.O.</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Mijoz F.I.O."
                            value={formData.name}
                            onChange={(e) => {
                                handleChange(e);
                                // Agar yangi mijoz kiritilsa, mavjudni tozalash
                                handleSelectChange("clientId", "");
                            }}
                            // Agar clientId tanlanmagan bo'lsa required
                            required={!formData.clientId}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon raqami</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+998 90 123 45 67"
                            value={formData.phone}
                             onChange={(e) => {
                                handleChange(e);
                                handleSelectChange("clientId", "");
                            }}
                            required={!formData.clientId}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="mijoz@example.com"
                            value={formData.email}
                             onChange={(e) => {
                                handleChange(e);
                                handleSelectChange("clientId", "");
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passport">Passport ma'lumotlari</Label>
                          <Input
                            id="passport"
                            name="passport"
                            placeholder="AA1234567"
                            value={formData.passport}
                             onChange={(e) => {
                                handleChange(e);
                                handleSelectChange("clientId", "");
                            }}
                            required={!formData.clientId}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Manzil</Label>
                          <Input
                            id="address"
                            name="address"
                            placeholder="Mijoz manzili"
                            value={formData.address}
                             onChange={(e) => {
                                handleChange(e);
                                handleSelectChange("clientId", "");
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          {!showKafil ? (
                            <Button
                              variant="outline"
                              type="button" // Form submit bo'lmasligi uchun
                              onClick={() => {
                                  setShowKafil(true);
                                  handleSelectChange("clientId", ""); // Kafil qo'shilsa, yangi mijoz sifatida qaraladi
                              }}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Kafil qo'shish
                            </Button>
                          ) : (
                            <div className="space-y-4 border-t pt-4">
                              <h4 className="text-md font-semibold">Kafil ma'lumotlari</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="kafilFio">Kafil F.I.O.</Label>
                                  <Input
                                    id="kafilFio"
                                    name="kafilFio"
                                    placeholder=" Kafil F.I.O."
                                    value={formData.kafilFio}
                                    onChange={handleChange}
                                    // Agar kafil maydonlari ochilsa, FIOni required qilish mumkin
                                    // required={showKafil}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="kafilPhone">Kafil telefon raqami</Label>
                                  <Input
                                    id="kafilPhone"
                                    name="kafilPhone"
                                    placeholder="+998 90 123 45 67"
                                    value={formData.kafilPhone}
                                    onChange={handleChange}
                                    // required={showKafil}
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="kafilAddress">Kafil manzili</Label>
                                  <Input
                                    id="kafilAddress"
                                    name="kafilAddress"
                                    placeholder="Kafil manzili"
                                    value={formData.kafilAddress}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                               <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() => {
                                    setShowKafil(false);
                                    // Kafil ma'lumotlarini tozalash
                                    setFormData(prev => ({...prev, kafilFio: "", kafilPhone: "", kafilAddress: ""}))
                                }}
                                className="mt-2 text-red-500"
                                >
                                    Kafilni olib tashlash
                                </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold mb-4">To'lov ma'lumotlari</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentType">To'lov turi</Label>
                          <Select value={paymentType} onValueChange={(value) => {
                              setPaymentType(value);
                              // To'lov turi o'zgarganda foizni moslashtirish
                              setFormData(prev => ({
                                  ...prev,
                                  interestRate: value === 'ipoteka' ? '10' : '0',
                                  // Naqd bo'lsa, muddat va foizni nolga tenglash
                                  totalMonths: value === 'naqd' ? '0' : prev.totalMonths,
                                  initialPayment: value === 'naqd' ? apartment?.price.toString() ?? "0" : prev.initialPayment,
                              }));
                          }}>
                            <SelectTrigger id="paymentType">
                              <SelectValue placeholder="To'lov turini tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="naqd">Naqd pul</SelectItem>
                              <SelectItem value="muddatli">Muddatli to'lov</SelectItem>
                              <SelectItem value="ipoteka">Ipoteka</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(paymentType === "muddatli" || paymentType === "ipoteka") && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="initialPayment">Boshlang'ich to'lov (so‘m)</Label>
                            <Input
                              id="initialPayment"
                              name="initialPayment"
                              type="number"
                              min="0"
                              max={apartment?.price} // Maksimal qiymat
                              value={formData.initialPayment}
                              onChange={handleChange}
                              required
                            />
                             {apartment && (
                                <p className="text-xs text-muted-foreground">
                                    Min: 30% = {Math.round(apartment.price * 0.3).toLocaleString('uz-UZ')} so'm
                                </p>
                             )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="totalMonths">To'lov muddati (oy)</Label>
                            <Select
                              value={formData.totalMonths}
                              onValueChange={(value) => handleSelectChange("totalMonths", value)}
                              required // Muddatli/Ipoteka uchun majburiy
                            >
                              <SelectTrigger id="totalMonths">
                                <SelectValue placeholder="Muddatni tanlang" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">6 oy</SelectItem>
                                <SelectItem value="12">12 oy</SelectItem>
                                <SelectItem value="18">18 oy</SelectItem>
                                <SelectItem value="24">24 oy</SelectItem>
                                <SelectItem value="36">36 oy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interestRate">Foiz stavkasi (%)</Label>
                            <Input
                              id="interestRate"
                              name="interestRate"
                              type="number"
                              step="0.1"
                              min="0"
                              value={formData.interestRate}
                              onChange={handleChange}
                              required // Muddatli/Ipoteka uchun majburiy
                              readOnly={paymentType === 'muddatli'} // Muddatli to'lovda o'zgartirib bo'lmasin
                            />
                            {paymentType === 'muddatli' && (
                                <p className="text-xs text-muted-foreground">Muddatli to'lov uchun foiz 0%</p>
                            )}
                          </div>
                        </div>
                      )}
                      {paymentType === "naqd" && apartment && (
                        <div className="space-y-2">
                            <Label>To'lanadigan summa</Label>
                            <Input
                                value={Number(apartment.price).toLocaleString('uz-UZ') + " so'm"}
                                readOnly
                            />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="comments">Qo'shimcha ma'lumot</Label>
                        <Textarea
                          id="comments"
                          name="comments"
                          placeholder="Qo'shimcha ma'lumot yoki izohlar"
                          value={formData.comments}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" disabled={submitting || loading || !apartment}>
                    {submitting ? "Saqlanmoqda..." : "Band qilish"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

         {apartment && ( // Faqat xonadon ma'lumoti yuklanganda ko'rsatish
          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Xonadon ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Obyekt:</span>
                    <span>{apartment.object_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Xonadon №:</span>
                    <span>{apartment.room_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Qavat:</span>
                    <span>{apartment.floor}-qavat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Xonalar:</span>
                    <span>{apartment.rooms} xona</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Maydon:</span>
                    <span>{apartment.area} m²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Narx:</span>
                    <span className="font-bold">
                      {Number(apartment.price).toLocaleString("uz-UZ", { style: "currency", currency: "UZS" })}
                    </span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Holati:</span>
                     <span className={`font-semibold ${apartment.status === 'sotuvda' ? 'text-green-600' : 'text-red-600'}`}>
                        {apartment.status === 'sotuvda' ? 'Sotuvda' : apartment.status === 'band' ? 'Band' : 'Sotilgan'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(paymentType === "muddatli" || paymentType === "ipoteka") && (
              <Card>
                <CardHeader>
                  <CardTitle>To'lov kalkulyatori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Umumiy narx:</span>
                      <span>
                        {Number(apartment.price).toLocaleString("uz-UZ", { style: "currency", currency: "UZS" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Boshlang'ich to'lov:</span>
                      <span>
                        {Number(formData.initialPayment || "0").toLocaleString("uz-UZ", {
                          style: "currency",
                          currency: "UZS",
                        })}
                      </span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Boshlang'ich foiz:</span>
                       <span>
                           {apartment.price > 0 ? ((Number(formData.initialPayment || "0") / apartment.price) * 100).toFixed(1) : 0}%
                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Qolgan summa:</span>
                      <span>
                        {(apartment.price - Number(formData.initialPayment || "0")).toLocaleString("uz-UZ", {
                          style: "currency",
                          currency: "UZS",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Foiz stavkasi:</span>
                      <span>{formData.interestRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">To'lov muddati:</span>
                      <span>{formData.totalMonths} oy</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Oylik to'lov:</span>
                      <span className="text-blue-600">
                        {(() => {
                           try {
                               return calculateMonthlyPayment().toLocaleString("uz-UZ", { style: "currency", currency: "UZS", minimumFractionDigits: 2 });
                           } catch (e) {
                               return <span className="text-red-500 text-sm">Hisoblashda xato</span>;
                           }
                        })()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          )} {/* apartment && */}
        </div>
      </div>

      {isReceiptModalOpen && requestReceipt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold">Shartnoma №{requestReceipt.id}</h2>
                 <Button onClick={() => setIsReceiptModalOpen(false)} variant="ghost" size="sm">X</Button>
             </div>
             <p className="mb-4 text-gray-600">Xonadon muvaffaqiyatli band qilindi. Shartnomani ko'rib chiqing, yuklab oling yoki chop eting.</p>

            <div ref={receiptRef} className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200 overflow-y-auto flex-grow">
              {/* Shartnoma matni pre ichida yaxshiroq ko'rinadi */}
              <pre className="whitespace-pre-wrap text-sm font-sans">{requestReceipt.contractText}</pre>
            </div>

            <div className="flex gap-2 justify-end flex-wrap pt-4 border-t">
              <Button
                onClick={() => handleDownloadContractWord(requestReceipt.id, requestReceipt.client)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                 Word (.docx) yuklash
              </Button>
              <Button
                onClick={handlePrintContract}
                className="bg-gray-600 hover:bg-gray-700"
              >
                <Printer className="h-4 w-4 mr-2" /> Chop etish
              </Button>
              <Button
                onClick={() => {
                  setIsReceiptModalOpen(false);
                   // Xonadon sahifasiga qaytish
                   router.push(`/apartments/${apartment.id}`);
                   // yoki muvaffaqiyat sahifasiga yo'naltirish
                   // router.push('/booking-success');
                }}
                variant="outline"
              >
                Yopish va Xonadonga Qaytish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}