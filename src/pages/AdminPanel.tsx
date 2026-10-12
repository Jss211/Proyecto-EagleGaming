import { useState, useEffect } from "react";
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { 
  collection, 
  getDocs, 
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
  Sparkles
} from "lucide-react";
import { ensureAdminDocument, parsePrice } from "../utils/admin";

const CATEGORIAS_EAGLE = [
  "Monitores",
  "Case",
  "PC Completa",
  "Disco SSD",
  "Estabilizador",
  "Fuente de poder",
  "Memoria RAM",
  "Periféricos",
  "Placa madre",
  "Tarjetas de video",
  "Procesadores",
  "Laptops",
  "Refrigeración líquida",
];

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
  title: string;
  message: string;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Todas");
  
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
  const [categoria, setCategoria] = useState(CATEGORIAS_EAGLE[0]);
  const [stock, setStock] = useState("10");
  const [imagenesText, setImagenesText] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [specsList, setSpecsList] = useState<SpecRow[]>([]);

  // Función para disparar alertas destacadas simples
  const showToast = (type: "success" | "error", title: string, message?: string) => {
    setToast({ type, title, message: message || "" });
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
        await ensureAdminDocument(u);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "productos"));
      const list: ProductItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({ 
          id: d.id, 
          ...data,
          precio: parsePrice(data.precio) 
        });
      });
      setProducts(list);
    } catch (err: any) {
      console.error("Error al cargar productos:", err);
      showToast("error", "Error al cargar", err?.message || "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCerrarSesion = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitulo("");
    setPrecio("");
    setCategoria(selectedCat !== "Todas" ? selectedCat : CATEGORIAS_EAGLE[0]);
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

    // Normalizar categoría
    const prodCat = product.categoria || product.Categoria || "";
    const matched = CATEGORIAS_EAGLE.find((c) => 
      c.toLowerCase() === prodCat.toLowerCase() || 
      prodCat.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(prodCat.toLowerCase())
    );
    setCategoria(matched || prodCat || CATEGORIAS_EAGLE[0]);

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
    ["url", "url1", "url2", "url3", "url4", "url5"].forEach((k) => {
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
      showToast("error", "Campos Requeridos", "Por favor completa título, precio y categoría.");
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      // Garantizar permisos en Firebase antes de escribir
      if (auth.currentUser) {
        await ensureAdminDocument(auth.currentUser);
      }

      // 1. Procesar URLs de imágenes
      const urls = imagenesText
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      // 2. Construir objeto base con precio numérico seguro
      const parsedPrice = parsePrice(precio);
      const dataToSave: Record<string, any> = {
        titulo: titulo.trim(),
        nombre: titulo.trim(),
        precio: parsedPrice,
        categoria: categoria,
        stock: parseInt(stock, 10) || 0,
        descripcion: descripcion.trim(),
        imagenes: urls.length > 0 ? urls : ["https://placehold.co/600x400?text=Eagle+Gaming"],
        url: urls[0] || "https://placehold.co/600x400?text=Eagle+Gaming",
        actualizadoEn: serverTimestamp(),
      };

      // Mapear url1, url2, url3... para compatibilidad con las vistas existentes
      urls.forEach((u, i) => {
        if (i > 0 && i <= 6) {
          dataToSave[`url${i}`] = u;
        }
      });

      // 3. Guardar CADA especificación limpia y DEDUPLICADA (sin puntos en clave)
      const arraySpecs: string[] = [];
      const savedKeys = new Set<string>();

      specsList.forEach((row) => {
        const cleanKey = row.key.trim().replace(/\./g, " ");
        const cleanVal = row.value.trim();
        const normKey = cleanKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (cleanKey && cleanVal && !savedKeys.has(normKey)) {
          savedKeys.add(normKey);
          dataToSave[cleanKey] = cleanVal;
          arraySpecs.push(`${cleanKey}: ${cleanVal}`);
        }
      });
      dataToSave.especificaciones = arraySpecs;

      // Limpiar cualquier propiedad undefined que pueda provocar error en Firestore
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });

      if (editingId) {
        // ACTUALIZAR PRODUCTO EXISTENTE usando setDoc con merge: true
        await setDoc(doc(db, "productos", editingId), dataToSave, { merge: true });
        showToast(
          "success",
          "Producto actualizado",
          "Los cambios se guardaron exitosamente."
        );
      } else {
        // CREAR PRODUCTO NUEVO
        await addDoc(collection(db, "productos"), {
          ...dataToSave,
          creadoEn: serverTimestamp(),
        });
        showToast(
          "success",
          "Producto publicado",
          "El producto se publicó exitosamente."
        );
      }

      setShowModal(false);
      await fetchProducts();
    } catch (err: any) {
      console.error("Error al guardar en Firebase:", err);
      let errorMsg = "Error al guardar en Firebase.";
      if (err?.code === "permission-denied") {
        errorMsg = "Permiso denegado por Firebase. Asegúrate de tener iniciada tu sesión de administrador.";
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showToast("error", "Error al Guardar", errorMsg);
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
        await ensureAdminDocument(auth.currentUser);
      }
      await deleteDoc(doc(db, "productos", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(
        "success",
        "¡Producto Eliminado Exitosamente!",
        `"${nombreProd || 'El producto'}" fue eliminado de la base de datos.`
      );
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      showToast("error", "Error al Eliminar", err?.message || "No se pudo eliminar el producto de Firebase.");
    }
  };

  // Filtrado por buscador Y categoría
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const name = (p.titulo || p.nombre || "").toLowerCase();
    const cat = (p.categoria || "").toLowerCase();

    const matchesSearch = !q || name.includes(q) || cat.includes(q);

    let matchesCat = true;
    if (selectedCat !== "Todas") {
      const targetCat = selectedCat.toLowerCase();
      matchesCat = cat.includes(targetCat) || targetCat.includes(cat);
    }

    return matchesSearch && matchesCat;
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
            <span className="font-bold text-sm text-white tracking-wide">{toast.title}</span>
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
      <main className="max-w-7xl mx-auto px-6 py-8">
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
        <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-[#e81950]" />
            <span>Filtrar por Categoría</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCat("Todas")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCat === "Todas"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas ({products.length})
            </button>

            {CATEGORIAS_EAGLE.map((cat) => {
              const count = products.filter((p) => {
                const pCat = (p.categoria || "").toLowerCase();
                const tCat = cat.toLowerCase();
                return pCat.includes(tCat) || tCat.includes(pCat);
              }).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedCat === cat
                      ? "bg-[#e81950] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
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
                    const imgUrl = (p.imagenes && p.imagenes[0]) || p.url || "https://placehold.co/60x60?text=IMG";
                    const title = p.titulo || p.nombre || p.título || "Sin título";
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
                          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
                            {p.categoria || "General"}
                          </span>
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
      </main>

      {/* ========================================================================= */}
      {/* MODAL DE EDICIÓN / CREACIÓN COMPLETA CON ESPECIFICACIONES DINÁMICAS */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-2xl">
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
            <form onSubmit={handleGuardarProducto} className="p-6 overflow-y-auto space-y-6 flex-1">
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
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:border-[#e81950] outline-none font-semibold"
                    >
                      {CATEGORIAS_EAGLE.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
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
              </div>

              {/* Sección 2: URLs de Imágenes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    2. Imágenes del Producto
                  </h4>
                  <span className="text-[11px] text-slate-500">Una URL por línea</span>
                </div>

                <textarea
                  rows={3}
                  placeholder={`https://eaglegamingperu.com/foto1.png\nhttps://eaglegamingperu.com/foto2.png`}
                  value={imagenesText}
                  onChange={(e) => setImagenesText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:border-[#e81950] outline-none"
                />

                {/* Previsualización rápida de imágenes */}
                {imagenesText.trim() && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {imagenesText
                      .split(/[\n,]/)
                      .map((u) => u.trim())
                      .filter((u) => u.length > 0)
                      .map((url, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white p-0.5">
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/60x60?text=Inválida";
                            }}
                          />
                          <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] text-white px-1 rounded-tl">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
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
                      <div key={row.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <input
                          type="text"
                          placeholder="Nombre (ej. Pulgadas, Monitor, Procesador)"
                          value={row.key}
                          onChange={(e) => handleUpdateSpec(row.id, "key", e.target.value)}
                          className="w-1/3 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#e81950] outline-none"
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