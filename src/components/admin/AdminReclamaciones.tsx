import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  FileText, 
  Search, 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle,
  Eye,
  X,
  Tag
} from "lucide-react";

interface ClaimRecord {
  id: string;
  claimCode: string;
  createdAt: string;
  fullName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  province: string;
  district: string;
  isMinor: boolean;
  guardianName?: string;
  guardianDoc?: string;
  itemType: "producto" | "servicio";
  claimedAmount: string;
  orderNumber: string;
  itemDescription: string;
  claimType: "reclamo" | "queja";
  detail: string;
  request: string;
  status?: "pendiente" | "en_proceso" | "atendido";
  adminNotes?: string;
}

export function AdminReclamaciones() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [filterType, setFilterType] = useState<"todos" | "reclamo" | "queja">("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "pendiente" | "atendido">("todos");

  useEffect(() => {
    setLoading(true);
    // Escuchar colección de reclamaciones en tiempo real
    const q = query(collection(db, "reclamaciones"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ClaimRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            claimCode: data.claimCode || "SIN-CODIGO",
            createdAt: data.createdAt || "Fecha no registrada",
            fullName: data.fullName || "Consumidor anónimo",
            docType: data.docType || "DNI",
            docNumber: data.docNumber || "-",
            phone: data.phone || "-",
            email: data.email || "-",
            address: data.address || "-",
            department: data.department || "-",
            province: data.province || "-",
            district: data.district || "-",
            isMinor: !!data.isMinor,
            guardianName: data.guardianName,
            guardianDoc: data.guardianDoc,
            itemType: data.itemType || "producto",
            claimedAmount: data.claimedAmount || "",
            orderNumber: data.orderNumber || "",
            itemDescription: data.itemDescription || "-",
            claimType: data.claimType || "reclamo",
            detail: data.detail || "",
            request: data.request || "",
            status: data.status || "pendiente",
            adminNotes: data.adminNotes || "",
          });
        });
        setClaims(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener libro de reclamaciones:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "pendiente" | "en_proceso" | "atendido") => {
    try {
      await updateDoc(doc(db, "reclamaciones", id), {
        status: newStatus,
      });
      if (selectedClaim && selectedClaim.id === id) {
        setSelectedClaim(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const handleDeleteClaim = async (id: string, code: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de reclamación #${code}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "reclamaciones", id));
      if (selectedClaim?.id === id) {
        setSelectedClaim(null);
      }
    } catch (err) {
      console.error("Error al eliminar reclamación:", err);
    }
  };

  const filteredClaims = claims.filter((claim) => {
    const term = search.toLowerCase();
    const matchSearch =
      claim.claimCode.toLowerCase().includes(term) ||
      claim.fullName.toLowerCase().includes(term) ||
      claim.docNumber.toLowerCase().includes(term) ||
      claim.email.toLowerCase().includes(term);

    const matchType = filterType === "todos" || claim.claimType === filterType;
    const matchStatus = statusFilter === "todos" || (claim.status || "pendiente") === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, nombre, DNI o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="todos">Todos los tipos</option>
            <option value="reclamo">Reclamos</option>
            <option value="queja">Quejas</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="atendido">Atendidos</option>
          </select>
        </div>
      </div>

      {/* Lista de Reclamaciones */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">Cargando Libro de Reclamaciones...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">No hay registros de reclamaciones que coincidan</p>
          <p className="text-slate-400 text-xs mt-1">Los reclamos y quejas ingresados en la tienda aparecerán en este módulo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Código / Fecha</th>
                  <th className="px-5 py-3.5">Consumidor</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Monto / Pedido</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block text-xs">
                        {claim.claimCode}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {claim.createdAt}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {claim.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {claim.docType}: {claim.docNumber} • {claim.phone}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          claim.claimType === "reclamo"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {claim.claimType}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      {claim.claimedAmount ? (
                        <span className="font-bold text-slate-800 block">S/ {claim.claimedAmount}</span>
                      ) : (
                        <span className="text-slate-400 block">-</span>
                      )}
                      <span className="text-[11px] text-slate-400 block">
                        {claim.orderNumber ? `Ped: ${claim.orderNumber}` : "Sin pedido"}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          claim.status === "atendido"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {claim.status === "atendido" ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Atendido
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-500" /> Pendiente
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClaim(claim.id, claim.claimCode)}
                        className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detalle de Hoja de Reclamación */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-[#e81950] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Hoja de Reclamación #{selectedClaim.claimCode}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Registrado el {selectedClaim.createdAt}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm">
              {/* Bloque 1: Identificación del Consumidor */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Datos del Consumidor
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nombre completo:</span>
                    <strong className="text-slate-800 text-sm">{selectedClaim.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Documento:</span>
                    <strong className="text-slate-800">{selectedClaim.docType}: {selectedClaim.docNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teléfono / Celular:</span>
                    <span className="text-slate-700">{selectedClaim.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Correo electrónico:</span>
                    <span className="text-slate-700">{selectedClaim.email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Dirección completa:</span>
                    <span className="text-slate-700">
                      {selectedClaim.address}, {selectedClaim.district}, {selectedClaim.province}, {selectedClaim.department}
                    </span>
                  </div>
                  {selectedClaim.isMinor && (
                    <div className="sm:col-span-2 p-2 bg-amber-50 rounded border border-amber-200 text-amber-900">
                      <strong>Menor de edad:</strong> Apoderado {selectedClaim.guardianName || "-"} (Doc: {selectedClaim.guardianDoc || "-"})
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 2: Detalle del Bien Contratado */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-400" /> Bien Contratado
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Tipo:</span>
                    <strong className="text-slate-800 uppercase">{selectedClaim.itemType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Monto Reclamado:</span>
                    <strong className="text-slate-800">{selectedClaim.claimedAmount ? `S/ ${selectedClaim.claimedAmount}` : "No indicado"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">N° Pedido / Boleta:</span>
                    <span className="text-slate-700">{selectedClaim.orderNumber || "No indicado"}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-slate-400 block">Descripción del bien:</span>
                    <p className="text-slate-800 mt-1">{selectedClaim.itemDescription}</p>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Reclamación y Pedido */}
              <div className="space-y-3">
                <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-100">
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                    Detalle de la {selectedClaim.claimType.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedClaim.detail}
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                    Pedido Concreto del Consumidor
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedClaim.request}
                  </p>
                </div>
              </div>

              {/* Bloque 4: Gestión del Estado */}
              <div className="p-4 bg-slate-100/70 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Estado del caso legal:</span>
                  <span className="text-[11px] text-slate-500">Respuesta obligatoria por ley en 15 días hábiles</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, "pendiente")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedClaim.status === "pendiente"
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-300"
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedClaim.id, "atendido")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedClaim.status === "atendido"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300"
                    }`}
                  >
                    Marcar Atendido
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
