import { useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  LogOut, 
  Search, 
  Package, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Filter, 
  Check, 
  PlusCircle, 
  SlidersHorizontal, 
  Sparkles, 
  UploadCloud, 
  ImagePlus, 
  Loader2,
  FileText
} from "lucide-react";
import { AdminReclamaciones } from "../components/admin/AdminReclamaciones";
import {
  parsePrice,
  PERIPHERAL_SUBCATEGORIES,
  PC_SUBCATEGORIES,
  resolveProductImage,
  resolveProductTitle,
  resolveProductSubcategory,
  normalizeDocumentData,
} from "../utils/productUtils";

export async function uploadImageFile(file: File): Promise<string> {
  // 1. Catbox.moe (gratuito, sin límite de expiración, permanente)
  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", file);

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith("http")) {
        return url;
      }
    }
  } catch (err) {
    console.warn("Fallo subida a Catbox, probando alternativa...", err);
  }

  // 2. ImgBB con API key si estuviera habilitada
  try {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (apiKey) {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.data?.url) {
        return data.data.url;
      }
    }
  } catch (err) {
    console.warn("Fallo subida a ImgBB...", err);
  }

  // 3. Fallback: Base64 directo si es menor a 500KB
  if (file.size < 500 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  throw new Error("No se pudo subir la imagen. Por favor intenta con otra foto o pega el enlace URL.");
}

export function resolveProductCategory(data: Record<string, any>): string {
  let raw = "";
  for (const [k, v] of Object.entries(data)) {
    const cleanK = k.trim().toLowerCase();
    if (
      (cleanK === "categoria" || cleanK === "categorias" || cleanK === "category") &&
      v &&
      typeof v === "string" &&
      v.trim()
    ) {
      raw = v.trim();
      break;
    }
  }

  const norm = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const title = (data.titulo || data.nombre || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Placa Madre (EXACTO: solo placas madre, nunca computadoras completas)
  if (
    norm.includes("placa") ||
    norm.includes("motherboard") ||
    (!norm && (title.includes("placa madre") || title.includes("motherboard")) && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Placa madre";
  }

  // 2. Tarjetas de Video (EXACTO: solo GPUs sueltas, nunca computadoras armadas)
  if (
    norm.includes("tarjeta") ||
    norm.includes("video") ||
    norm.includes("grafica") ||
    (!norm &&
      (title.includes("tarjeta de video") || title.includes("rtx ") || title.includes("gtx ") || title.includes("rx ")) &&
      !title.includes("pc ") &&
      !title.includes("computadora"))
  ) {
    return "Tarjetas de video";
  }

  // 3. Procesadores
  if (
    norm.includes("procesador") ||
    norm.includes("cpu") ||
    (!norm && title.includes("procesador") && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Procesadores";
  }

  // 4. Monitores
  if (
    norm.includes("monitor") ||
    (!norm && title.includes("monitor") && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Monitores";
  }

  // 5. Laptops
  if (norm.includes("laptop") || norm.includes("portatil") || (!norm && title.includes("laptop"))) {
    return "Laptops";
  }

  // 6. Refrigeración líquida
  if (
    norm.includes("refrig") ||
    norm.includes("liquida") ||
    norm.includes("cooler") ||
    (!norm && title.includes("refrigeracion liquida"))
  ) {
    return "Refrigeración líquida";
  }

  // 7. Memoria RAM
  if (
    norm.includes("ram") ||
    (!norm && title.includes("memoria") && title.includes("ddr") && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Memoria RAM";
  }

  // 8. PC Completas (Subdivididas en Gamer, Oficina, Ingenierías)
  if (
    norm.includes("pc") ||
    norm.includes("computadora") ||
    title.includes("pc ") ||
    title.includes("computadora")
  ) {
    if (norm.includes("ingenier") || title.includes("ingenier")) {
      return "PC Completa Ingenierías";
    }
    if (norm.includes("oficina") || title.includes("oficina")) {
      return "PC Completa Oficina";
    }
    if (norm.includes("gamer") || norm.includes("gaming") || title.includes("gamer") || title.includes("gaming")) {
      return "PC Completa Gamer";
    }
    return "PC Completa";
  }

  // 9. Otros componentes
  if (norm.includes("disco") || norm.includes("ssd")) return "Disco SSD";
  if (norm.includes("fuente")) return "Fuente de poder";
  if (norm.includes("case") || norm.includes("gabinete")) return "Case";
  if (norm.includes("estabilizador")) return "Estabilizador";
  if (norm.includes("periferico")) return "Periféricos";

  return raw || "General";
}

export function matchesCategory(p: ProductItem, selected: string): boolean {
  if (selected === "Todas") return true;
  const pCat = (p.categoria || "").trim().toLowerCase();
  
  if (selected === "PC Completa" || selected === "Todas las PC") {
    return pCat.includes("pc");
  }
  
  return pCat === selected.toLowerCase();
}

export function matchesPcSubcat(p: ProductItem, selectedSubcat: string): boolean {
  if (selectedSubcat === "Todas") return true;
  const pSub = (p.subcategoria || "").trim().toUpperCase();
  const pCat = (p.rawCategoria || p.categoria || "").trim().toUpperCase();
  const pTit = (p.titulo || p.nombre || "").trim().toUpperCase();
  const full = `${pSub} ${pCat} ${pTit}`;

  if (selectedSubcat === "PC COMPLETA GAMER" || selectedSubcat === "PC Gamer") {
    return full.includes("GAMER") || full.includes("GAMING") || (!full.includes("OFICINA") && !full.includes("INGENIER"));
  }
  if (selectedSubcat === "PC COMPLETA OFICINA" || selectedSubcat === "PC de Oficina" || selectedSubcat === "PC Oficina") {
    return full.includes("OFICINA");
  }
  if (selectedSubcat === "PC COMPLETA INGENIERIAS" || selectedSubcat === "PC de Ingenierías" || selectedSubcat === "PC Ingenierías") {
    return full.includes("INGENIER");
  }
  return false;
}

export const CATEGORIAS_FILTRO = [
  { id: "PC Completa", label: "PC Completa" },
  { id: "Tarjetas de video", label: "Tarjetas de video" },
  { id: "Procesadores", label: "Procesadores" },
  { id: "Monitores", label: "Monitores" },
  { id: "Placa madre", label: "Placa madre" },
  { id: "Laptops", label: "Laptops" },
  { id: "Memoria RAM", label: "Memoria RAM" },
  { id: "Disco SSD", label: "Disco SSD" },
  { id: "Fuente de poder", label: "Fuente de poder" },
  { id: "Case", label: "Case" },
  { id: "Refrigeración líquida", label: "Refrigeración líquida" },
  { id: "Estabilizador", label: "Estabilizador" },
  { id: "Periféricos", label: "Periféricos" },
];

export function matchesPeripheralSubcat(p: ProductItem, selectedSubcat: string): boolean {
  if (selectedSubcat === "Todas") return true;
  const pSub = (p.subcategoria || "").trim().toUpperCase();
  if (pSub === selectedSubcat.trim().toUpperCase()) return true;

  // Fallback por si la subcategoría aún no está guardada explícitamente
  const normTitle = (p.titulo || p.nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const sub = selectedSubcat.toUpperCase();
  if (sub === "ADAPTADOR" || sub === "ADAPTADORES") return normTitle.includes("adaptador") || normTitle.includes("converter") || normTitle.includes("conversor") || normTitle.includes("dongle");
  if (sub === "AUDIFONOS") return normTitle.includes("audifono") || normTitle.includes("headset") || normTitle.includes("auricular");
  if (sub === "CABLE") return normTitle.includes("cable");
  if (sub === "COOLER") return normTitle.includes("cooler") || normTitle.includes("ventilador") || normTitle.includes("fan");
  if (sub === "KIT TECLADO Y MOUSE") return normTitle.includes("kit") || normTitle.includes("combo teclado") || normTitle.includes("4 en 1");
  if (sub === "MOUSE") return normTitle.includes("mouse") || normTitle.includes("raton");
  if (sub === "PARLANTES") return normTitle.includes("parlante") || normTitle.includes("speaker") || normTitle.includes("bocina");
  if (sub === "TECLADO") return normTitle.includes("teclado") || normTitle.includes("keyboard");
  if (sub === "WEBCAM (CAMARA)") return normTitle.includes("webcam") || normTitle.includes("camara");

  return false;
}

interface SpecRow {
  id: string;
  key: string;
  value: string;
}

interface ProductItem {
  id: string;
  titulo?: string;
  nombre?: string;
  precio?: number | string;
  categoria?: string;
  subcategoria?: string;
  stock?: number;
  imagenes?: string[];
  url?: string;
  url1?: string;
  url2?: string;
  url3?: string;
  url4?: string;
  url5?: string;
  descripcion?: string;
  especificaciones?: string[];
  [key: string]: any;
}

interface ToastNotification {
  type: "success" | "error";
  message: string;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<"productos" | "reclamaciones">("productos");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todas");
  const [selectedSubcatPerifericos, setSelectedSubcatPerifericos] = useState("Todas");
  const [selectedSubcatPc, setSelectedSubcatPc] = useState("Todas");
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Notificaciones y Alertas
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Form Fields
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("PC Completa");
  const [subcategoriaPc, setSubcategoriaPc] = useState<string>("PC COMPLETA GAMER");
  const [subcategoriaPerifericos, setSubcategoriaPerifericos] = useState<string>("AUDIFONOS");
  const [stock, setStock] = useState("10");
  const [imagenesText, setImagenesText] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [specsList, setSpecsList] = useState<SpecRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Alerta simple en verde o rojo
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  // Subir imagen desde el equipo (Descargas, etc.)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadImageFile(file);
        uploadedUrls.push(url);
      }

      setImagenesText((prev) => {
        const current = prev.trim();
        const addition = uploadedUrls.join("\n");
        return current ? `${current}\n${addition}` : addition;
      });

      showToast(
        "success",
        files.length === 1 ? "Imagen subida exitosamente" : `${files.length} imágenes subidas exitosamente`
      );
    } catch (err: any) {
      console.error("Error al subir archivo:", err);
      showToast("error", err?.message || "No se pudo subir la imagen");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Eliminar una imagen directamente desde su miniatura
  const handleRemoveImageUrl = (indexToRemove: number) => {
    const urls = imagenesText
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    urls.splice(indexToRemove, 1);
    setImagenesText(urls.join("\n"));
  };

  // Auto-cerrar toast tras 6 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Vigilar sesión de Firebase y asegurar registro en Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        // verifyAdminDocument(u) -- verificacion solo-lectura, sin auto-crear
      }
    });
    return () => unsubscribe();
  }, []);

  // Sincronización en TIEMPO REAL con Firebase (onSnapshot)
  // Cualquier cambio, creación o eliminación en Firebase Console se refleja al instante en el Admin Panel y viceversa.
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "productos"),
      (snap) => {
        const list: ProductItem[] = [];
        snap.forEach((d) => {
          const rawData = d.data();
          const data = normalizeDocumentData(rawData);
          const canonical = resolveProductCategory(data);
          const subcat = resolveProductSubcategory(data);
          list.push({ 
            id: d.id, 
            ...data,
            categoria: canonical,
            subcategoria: subcat,
            rawCategoria: data.categoria || data.Categoria || canonical,
            precio: parsePrice(data.precio) 
          });
        });
        setProducts(list);
        setLoading(false);
      },
      (err: any) => {
        console.error("Error en tiempo real al sincronizar productos:", err);
        showToast("error", err?.message || "No se pudieron cargar los productos.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCerrarSesion = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitulo("");
    setPrecio("");

    let defaultCat = "PC Completa";
    if (selectedCat !== "Todas") {
      defaultCat = selectedCat;
    }

    setCategoria(defaultCat);
    setSubcategoriaPc(selectedSubcatPc !== "Todas" ? selectedSubcatPc : "PC COMPLETA GAMER");
    setSubcategoriaPerifericos(selectedSubcatPerifericos !== "Todas" ? selectedSubcatPerifericos : "AUDIFONOS");
    setStock("10");
    setImagenesText("");
    setDescripcion("");
    setSpecsList([
      { id: "1", key: "Marca", value: "" },
      { id: "2", key: "Modelo", value: "" },
      { id: "3", key: "Garantía", value: "1 año" },
    ]);
    setShowModal(true);
  };

  const handleOpenEdit = (product: ProductItem) => {
    setEditingId(product.id);
    setTitulo(product.titulo || product.nombre || product.título || "");
    
    // Normalizar precio numéricamente para evitar NaN o comas residuales
    const cleanPrice = parsePrice(product.precio);
    setPrecio(cleanPrice > 0 ? String(cleanPrice) : "");

    // Normalizar categoría para el selector del modal
    const canonical = resolveProductCategory(product);
    setCategoria(canonical);

    if (canonical === "PC Completa") {
      const pcSub = product.subcategoria || resolveProductSubcategory(product) || "PC COMPLETA GAMER";
      setSubcategoriaPc(pcSub);
    }
    if (canonical === "Periféricos") {
      const periSub = product.subcategoria || resolveProductSubcategory(product) || "AUDIFONOS";
      setSubcategoriaPerifericos(periSub);
    }

    setStock(product.stock !== undefined ? String(product.stock) : "10");
    setDescripcion(product.descripcion || product.Descripcion || "");

    // 1. Recolectar TODAS las URLs de imágenes (url, url1, url2... e imagenes[])
    const collectedUrls: string[] = [];
    if (Array.isArray(product.imagenes)) {
      product.imagenes.forEach((u) => {
        if (typeof u === "string" && u.trim() && !collectedUrls.includes(u.trim())) {
          collectedUrls.push(u.trim());
        }
      });
    }
    ["url", "url1", "url2", "url3", "url4", "url5", "url6", "url7", "url8", "url9"].forEach((k) => {
      const val = product[k];
      if (typeof val === "string" && val.trim() && !collectedUrls.includes(val.trim())) {
        collectedUrls.push(val.trim());
      }
    });
    setImagenesText(collectedUrls.join("\n"));

    // 2. Extraer TODAS las Especificaciones DEDUPLICADAS
    const ignoredKeys = new Set([
      "id",
      "titulo",
      "título",
      "nombre",
      "precio",
      "categoria",
      "Categoria",
      "categoría",
      "Categoría",
      "stock",
      "descripcion",
      "Descripcion",
      "imagenes",
      "url",
      "url1",
      "url2",
      "url3",
      "url4",
      "url5",
      "url6",
      "url7",
      "url8",
      "url9",
      "creadoEn",
      "creadoen",
      "actualizadoEn",
      "actualizadoen",
      "especificaciones",
      "caracteristicas",
      "tendencia",
    ]);

    const specsMap = new Map<string, { key: string; value: string }>();

    // A) Primero leer especificaciones guardadas en array (deduplicando por nombre)
    if (Array.isArray(product.especificaciones)) {
      product.especificaciones.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          const parts = item.split(":");
          const rawKey = parts[0].trim();
          const rawVal = parts.slice(1).join(":").trim();
          const normKey = rawKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (normKey && rawVal && !specsMap.has(normKey)) {
            const prettyKey = rawKey.charAt(0).toUpperCase() + rawKey.slice(1);
            specsMap.set(normKey, { key: prettyKey, value: rawVal });
          }
        }
      });
    }

    // B) Luego leer campos directos de Firebase SOLO si no están ya en el mapa
    Object.entries(product).forEach(([k, v]) => {
      const normKey = k.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!ignoredKeys.has(k) && !ignoredKeys.has(normKey) && typeof v === "string" && v.trim() !== "") {
        if (!specsMap.has(normKey)) {
          const prettyKey = k.charAt(0).toUpperCase() + k.slice(1);
          specsMap.set(normKey, { key: prettyKey, value: v.trim() });
        }
      }
    });

    const extractedSpecs: SpecRow[] = Array.from(specsMap.values()).map(({ key, value }) => ({
      id: `spec-${key}-${Math.random().toString(36).substring(2, 7)}`,
      key,
      value,
    }));

    setSpecsList(extractedSpecs);
    setShowModal(true);
  };

  const handleAddSpecRow = () => {
    setSpecsList((prev) => [
      ...prev,
      {
        id: `spec-new-${Date.now()}`,
        key: "",
        value: "",
      },
    ]);
  };

  const handleUpdateSpec = (id: string, field: "key" | "value", val: string) => {
    setSpecsList((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );
  };

  const handleRemoveSpec = (id: string) => {
    setSpecsList((prev) => prev.filter((row) => row.id !== id));
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !precio.trim() || !categoria) {
      showToast("error", "Por favor completa título, precio y categoría.");
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      // Garantizar permisos en Firebase antes de escribir
      if (auth.currentUser) {
        // La autorizaci�n la manejan las Firestore Security Rules
      }

      // 1. Procesar URLs de imágenes (limpias y deduplicadas)
      const rawUrls = imagenesText
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      const uniqueUrls = Array.from(new Set(rawUrls));
      const finalUrls = uniqueUrls.length > 0 ? uniqueUrls : ["https://placehold.co/600x400?text=Eagle+Gaming"];

      // 2. Construir documento limpio idéntico al esquema original de Firebase
      // SIN array 'especificaciones', SIN 'nombre', SIN array 'imagenes'
      const parsedPrice = parsePrice(precio);
      const dataToSave: Record<string, any> = {
        titulo: titulo.trim(),
        precio: parsedPrice,
        categoria: categoria,
        stock: parseInt(stock, 10) || 0,
        descripcion: descripcion.trim(),
        actualizadoEn: serverTimestamp(),
      };

      // Guardar subcategoría si es PC Completa o Periféricos (desglosados)
      if (categoria === "PC Completa") {
        dataToSave.subcategoria = subcategoriaPc;
      } else if (categoria === "Periféricos") {
        dataToSave.subcategoria = subcategoriaPerifericos;
      }

      // Guardar primera imagen en 'url' y adicionales en 'url1', 'url2', 'url3'...
      dataToSave.url = finalUrls[0];
      for (let i = 1; i < finalUrls.length; i++) {
        dataToSave[`url${i}`] = finalUrls[i];
      }

      // 3. Guardar CADA especificación DIRECTAMENTE como campo en el documento
      // (Ej: "Procesador": "Intel Core...", "Memoria RAM": "16GB...", "Garantia": "1 año", etc.)
      const savedKeys = new Set<string>();
      specsList.forEach((row) => {
        const cleanKey = row.key.trim().replace(/\./g, " ");
        const cleanVal = row.value.trim();
        const normKey = cleanKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (cleanKey && cleanVal && !savedKeys.has(normKey)) {
          savedKeys.add(normKey);
          dataToSave[cleanKey] = cleanVal;
        }
      });

      // Limpiar cualquier propiedad undefined
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });

      if (editingId) {
        // Preservar creadoEn y tendencia del producto original si existen
        const existing = products.find((p) => p.id === editingId);
        if (existing?.creadoEn) {
          dataToSave.creadoEn = existing.creadoEn;
        }
        if (existing?.tendencia !== undefined) {
          dataToSave.tendencia = existing.tendencia;
        }

        // Reemplazar documento en Firestore SIN merge: true
        // Esto elimina de raíz los arrays 'especificaciones', 'imagenes' o claves residuales
        await setDoc(doc(db, "productos", editingId), dataToSave);
        showToast("success", "Producto actualizado");
      } else {
        // CREAR PRODUCTO NUEVO
        dataToSave.creadoEn = serverTimestamp();
        await addDoc(collection(db, "productos"), dataToSave);
        showToast("success", "Producto publicado");
      }

      setShowModal(false);
    } catch (err: any) {
      console.error("Error al guardar en Firebase:", err);
      let errorMsg = "Error al guardar en Firebase.";
      if (err?.code === "permission-denied") {
        errorMsg = "Permiso denegado por Firebase. Asegúrate de tener iniciada tu sesión de administrador.";
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showToast("error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarProducto = async (id: string, nombreProd?: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombreProd || 'este producto'}" de la base de datos?`)) {
      return;
    }

    try {
      if (auth.currentUser) {
        // La autorizaci�n la manejan las Firestore Security Rules
      }
      await deleteDoc(doc(db, "productos", id));
      showToast("success", "Producto eliminado");
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      showToast("error", err?.message || "No se pudo eliminar el producto de Firebase.");
    }
  };

  // Filtrado por buscador, categoría Y subcategoría (para PC Completa y Periféricos)
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const name = (p.titulo || p.nombre || "").toLowerCase();
    const cat = (p.categoria || "").toLowerCase();

    const matchesSearch = !q || name.includes(q) || cat.includes(q);
    const matchesCat = matchesCategory(p, selectedCat);

    let matchesSubcat = true;
    if (selectedCat === "PC Completa") {
      matchesSubcat = matchesPcSubcat(p, selectedSubcatPc);
    } else if (selectedCat === "Periféricos") {
      matchesSubcat = matchesPeripheralSubcat(p, selectedSubcatPerifericos);
    }

    return matchesSearch && matchesCat && matchesSubcat;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ========================================================================= */}
      {/* NOTIFICACIÓN FLOTANTE DESTACADA (VERDE PARA ÉXITO) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* NOTIFICACIÓN FLOTANTE SIMPLE EN VERDE (PRODUCTO ACTUALIZADO) */}
      {/* ========================================================================= */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/25 ring-2 ring-emerald-400/30"
                : "bg-red-600 text-white border-red-500 shadow-red-600/25 ring-2 ring-red-400/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            )}
            <span className="font-bold text-sm text-white tracking-wide">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/80 hover:text-white p-0.5 ml-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Superior */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-auto min-h-16 py-2.5 sm:py-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="bg-[#e81950] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase">
                ADMIN
              </span>
              <h1 className="font-extrabold text-lg text-white">Panel Eagle Gaming</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Admin: <strong className="text-slate-200">{currentUser?.email || "eaglegaming@gmail.com"}</strong>
            </span>
            <button
              onClick={handleCerrarSesion}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-red-600/80 text-white text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Pestañas de Navegación del Panel */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 border-b border-slate-200 pb-3 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("productos")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "productos"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reclamaciones")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "reclamaciones"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Libro de Reclamaciones</span>
          </button>
        </div>

        {activeTab === "reclamaciones" ? (
          <AdminReclamaciones />
        ) : (
          <>
        {/* Banner de Error en Página (si ocurriera algún problema) */}
        {statusMsg && statusMsg.type === "error" && (
          <div className="mb-6 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200 border-2 bg-red-50 text-red-950 border-red-400 ring-4 ring-red-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{statusMsg.text}</p>
              </div>
            </div>
            <button 
              onClick={() => setStatusMsg(null)} 
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Productos</h2>
            <p className="text-xs text-slate-500 mt-1">
              {products.length} productos en la base de datos ({filteredProducts.length} filtrados)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 bg-[#e81950] hover:bg-[#c01119] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Categoría */}
        <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
              <Filter className="w-4 h-4 text-[#e81950]" />
              <span>Filtrar por Categoría</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCat("Todas")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCat === "Todas"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Ver Todas ({products.length})
            </button>
          </div>

          {/* Categorías Principales */}
          <div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_FILTRO.map((cat) => {
                const count = products.filter((p) => matchesCategory(p, cat.id)).length;
                const isSelected = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCat(cat.id);
                      if (cat.id === "PC Completa") setSelectedSubcatPc("Todas");
                      if (cat.id === "Periféricos") setSelectedSubcatPerifericos("Todas");
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#e81950] text-white shadow-sm ring-2 ring-[#e81950]/30"
                        : count > 0
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? "bg-white/20 text-white font-black" : "bg-white text-slate-500 font-bold"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategorías SOLO para PC Completa */}
          {selectedCat === "PC Completa" && (
            <div className="pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                <span>Subcategorías de PC Completa:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubcatPc("Todas")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedSubcatPc === "Todas"
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Todas ({products.filter((p) => matchesCategory(p, "PC Completa")).length})</span>
                </button>

                {PC_SUBCATEGORIES.map((subcat) => {
                  const count = products.filter(
                    (p) => matchesCategory(p, "PC Completa") && matchesPcSubcat(p, subcat.id)
                  ).length;
                  const isSelected = selectedSubcatPc === subcat.id;
                  return (
                    <button
                      key={subcat.id}
                      type="button"
                      onClick={() => setSelectedSubcatPc(subcat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{subcat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          isSelected ? "bg-white/20 text-white font-black" : "bg-white text-slate-500 font-bold"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subcategorías SOLO para Periféricos */}
          {selectedCat === "Periféricos" && (
            <div className="pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#e81950] mb-2 flex items-center gap-1.5">
                <span>Subcategorías de Periféricos:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubcatPerifericos("Todas")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedSubcatPerifericos === "Todas"
                      ? "bg-[#e81950] text-white shadow-sm ring-2 ring-[#e81950]/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Todas ({products.filter((p) => matchesCategory(p, "Periféricos")).length})</span>
                </button>

                {PERIPHERAL_SUBCATEGORIES.map((subcat) => {
                  const count = products.filter(
                    (p) => matchesCategory(p, "Periféricos") && matchesPeripheralSubcat(p, subcat)
                  ).length;
                  const isSelected = selectedSubcatPerifericos === subcat;
                  return (
                    <button
                      key={subcat}
                      type="button"
                      onClick={() => setSelectedSubcatPerifericos(subcat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#e81950] text-white shadow-sm ring-2 ring-[#e81950]/30"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{subcat}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                          isSelected ? "bg-white/20 text-white font-black" : "bg-white text-slate-500 font-bold"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder={`Buscar en ${selectedCat}... (por título, modelo o componente)`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#e81950] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">Cargando productos de Firebase...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Package className="w-12 h-12 stroke-[1.5]" />
              <p className="text-base font-bold text-slate-600">No se encontraron productos</p>
              <p className="text-xs text-slate-400">Prueba cambiando la categoría o término de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16">Imagen</th>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Precio</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const imgUrl = resolveProductImage(p, "https://placehold.co/60x60?text=IMG");
                    const title = resolveProductTitle(p);
                    const price = parsePrice(p.precio);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 w-16">
                          <img
                            src={imgUrl}
                            alt={title}
                            className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/60x60?text=Error";
                            }}
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate" title={title}>
                          {title}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
                              {p.categoria || "General"}
                            </span>
                            {p.categoria === "PC Completa" && p.subcategoria && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {p.subcategoria.replace("PC COMPLETA ", "PC ")}
                              </span>
                            )}
                            {p.categoria === "Periféricos" && p.subcategoria && (
                              <span className="bg-rose-50 text-[#e81950] border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {p.subcategoria}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-[#e81950]">
                          S/ {price.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">
                          {p.stock ?? 10}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Editar producto, precio, imágenes y especificaciones"
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/producto/${p.id}`}
                              target="_blank"
                              title="Ver en la tienda"
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleEliminarProducto(p.id, title)}
                              title="Eliminar de Firebase"
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL DE EDICIÓN / CREACIÓN COMPLETA CON ESPECIFICACIONES DINÁMICAS */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#e81950]" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingId ? "Editar Producto y Especificaciones" : "Publicar Nuevo Producto"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Scroll */}
            <form onSubmit={handleGuardarProducto} className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
              {/* Sección 1: Datos Generales */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1">
                  1. Datos Principales
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Título / Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: COMPUTADORA PC INTEL CORE I7 8700 + 16GB RAM..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-[#e81950] focus:ring-1 focus:ring-[#e81950] outline-none font-semibold text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Precio (S/) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="1699.00"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-black text-[#e81950] focus:border-[#e81950] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:border-[#e81950] outline-none font-semibold text-slate-800"
                    >
                      <option value="PC Completa">PC Completa</option>
                      <option value="Tarjetas de video">Tarjetas de video</option>
                      <option value="Procesadores">Procesadores</option>
                      <option value="Monitores">Monitores</option>
                      <option value="Placa madre">Placa madre</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Memoria RAM">Memoria RAM</option>
                      <option value="Disco SSD">Disco SSD</option>
                      <option value="Fuente de poder">Fuente de poder</option>
                      <option value="Case">Case</option>
                      <option value="Refrigeración líquida">Refrigeración líquida</option>
                      <option value="Estabilizador">Estabilizador</option>
                      <option value="Periféricos">Periféricos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-[#e81950] outline-none"
                    />
                  </div>
                </div>

                {/* Subcategoría condicional: SOLO para PC Completa */}
                {categoria === "PC Completa" && (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl animate-in fade-in duration-200">
                    <label className="block text-xs font-extrabold uppercase text-blue-700 mb-1">
                      Subcategoría de PC Completa * (Elegir tipo de combo)
                    </label>
                    <select
                      value={subcategoriaPc}
                      onChange={(e) => setSubcategoriaPc(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-blue-300 rounded-xl text-sm bg-white focus:border-blue-600 outline-none font-bold text-slate-800"
                    >
                      {PC_SUBCATEGORIES.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                          {subcat.label} ({subcat.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Selecciona si esta PC Completa es Gamer, de Oficina o de Ingenierías.
                    </p>
                  </div>
                )}

                {/* Subcategoría condicional: SOLO para Periféricos */}
                {categoria === "Periféricos" && (
                  <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl animate-in fade-in duration-200">
                    <label className="block text-xs font-extrabold uppercase text-[#e81950] mb-1">
                      Subcategoría de Periférico * (Elegir tipo)
                    </label>
                    <select
                      value={subcategoriaPerifericos}
                      onChange={(e) => setSubcategoriaPerifericos(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-rose-300 rounded-xl text-sm bg-white focus:border-[#e81950] outline-none font-bold text-slate-800"
                    >
                      {PERIPHERAL_SUBCATEGORIES.map((subcat) => (
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Selecciona si este periférico es Audífonos, Cooler, Teclado, Mouse, etc. Solo aplica para la categoría Periféricos.
                    </p>
                  </div>
                )}
              </div>

              {/* Sección 2: URLs de Imágenes y Subida desde Equipo */}
              <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <ImagePlus className="w-4 h-4 text-[#e81950]" />
                      <span>2. Imágenes del Producto</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sube fotos desde tu computadora (Descargas, etc.) o escribe enlaces web directos:
                    </p>
                  </div>

                  {/* Botón para subir archivos desde la PC */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 bg-[#e81950] hover:bg-[#c01119] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Subiendo imagen...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Subir Imagen desde tu PC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Enlaces directos de imagen (1 URL por línea):
                    </label>
                    <span className="text-[10px] text-slate-400">
                      La 1era imagen (#1) será la portada principal en la tienda
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={`https://eaglegamingperu.com/foto1.png\nhttps://eaglegamingperu.com/foto2.png`}
                    value={imagenesText}
                    onChange={(e) => setImagenesText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:border-[#e81950] outline-none bg-white"
                  />
                </div>

                {/* Previsualización grande de imágenes */}
                {(() => {
                  const urls = imagenesText
                    .split(/[\n,]/)
                    .map((u) => u.trim())
                    .filter((u) => u.length > 0);

                  if (urls.length === 0) {
                    return (
                      <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        No hay imágenes todavía. Haz clic en <strong>Subir Imagen desde tu PC</strong> o pega enlaces URL arriba.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                        <span>Vista previa de imágenes ({urls.length}):</span>
                        <span className="text-[10px] text-slate-400">Haz clic en la papelera para quitar una foto</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                        {urls.map((url, idx) => (
                          <div
                            key={idx}
                            className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition aspect-square flex flex-col justify-between p-2"
                          >
                            {/* Insignia de orden y botones de acción */}
                            <div className="flex items-center justify-between z-10">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs ${
                                  idx === 0
                                    ? "bg-[#e81950] text-white"
                                    : "bg-slate-800/80 text-white backdrop-blur-xs"
                                }`}
                              >
                                {idx === 0 ? "★ #1 Portada" : `#${idx + 1}`}
                              </span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Ver imagen completa"
                                  className="p-1 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 rounded-md shadow-xs transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageUrl(idx)}
                                  title="Quitar esta foto"
                                  className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-xs transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Imagen grande en el centro */}
                            <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                              <img
                                src={url}
                                alt={`Imagen ${idx + 1}`}
                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition duration-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Error+URL";
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sección 3: ESPECIFICACIONES DINÁMICAS (Pulgadas, Procesador, RAM, GPU, etc.) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#e81950]" />
                      <span>3. Especificaciones Técnicas (Dinámicas)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Edita valores (ej. cambiar 24" por 27", Procesador, RAM, GPU) o añade campos nuevos:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Agregar Característica</span>
                  </button>
                </div>

                {specsList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                    No hay características agregadas todavía. Haz clic en <strong>+ Agregar Característica</strong>.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {specsList.map((row) => (
                      <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <input
                          type="text"
                          placeholder="Nombre (ej. Pulgadas, Monitor, Procesador)"
                          value={row.key}
                          onChange={(e) => handleUpdateSpec(row.id, "key", e.target.value)}
                          className="w-full sm:w-1/3 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#e81950] outline-none"
                        />
                        <span className="text-slate-400 font-bold">:</span>
                        <input
                          type="text"
                          placeholder="Valor (ej. 24 pulgadas, 16GB DDR4)"
                          value={row.value}
                          onChange={(e) => handleUpdateSpec(row.id, "value", e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:border-[#e81950] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(row.id)}
                          title="Eliminar campo"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 4: Descripción / Resumen General */}
              <div className="space-y-1">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    4. Descripción o Resumen del Producto
                  </h4>
                  <span className="text-[11px] text-slate-400">Párrafo descriptivo</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Computadora completa ideal para trabajo, estudios, oficina..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs leading-relaxed focus:border-[#e81950] outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#e81950] hover:bg-[#c01119] text-white text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? "Guardando..." : (editingId ? "Actualizar Producto" : "Publicar Producto")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}