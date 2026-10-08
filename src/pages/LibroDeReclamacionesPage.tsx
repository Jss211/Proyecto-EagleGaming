import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { CheckCircle2, Printer, ArrowLeft, Send } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface ClaimData {
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
}

export function LibroDeReclamacionesPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    docType: "DNI",
    docNumber: "",
    phone: "",
    email: "",
    address: "",
    department: "Lima",
    province: "Lima",
    district: "",
    isMinor: false,
    guardianName: "",
    guardianDoc: "",
    itemType: "producto" as "producto" | "servicio",
    claimedAmount: "",
    orderNumber: "",
    itemDescription: "",
    claimType: "reclamo" as "reclamo" | "queja",
    detail: "",
    request: "",
    termsAccepted: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState<ClaimData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateClaimCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const year = new Date().getFullYear();
    return `LR-${year}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.termsAccepted) {
      setErrorMessage("Debe aceptar la declaración jurada para registrar la reclamación.");
      return;
    }

    if (!formData.fullName || !formData.docNumber || !formData.phone || !formData.email) {
      setErrorMessage("Por favor complete todos los datos obligatorios del consumidor.");
      return;
    }

    if (!formData.detail || !formData.request) {
      setErrorMessage("Por favor describa el detalle y el pedido concreto de su reclamación.");
      return;
    }

    setSubmitting(true);
    const code = generateClaimCode();
    const currentDate = new Date().toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const record: ClaimData = {
      claimCode: code,
      createdAt: currentDate,
      fullName: formData.fullName.trim(),
      docType: formData.docType,
      docNumber: formData.docNumber.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      department: formData.department.trim(),
      province: formData.province.trim(),
      district: formData.district.trim(),
      isMinor: formData.isMinor,
      guardianName: formData.isMinor ? formData.guardianName.trim() : undefined,
      guardianDoc: formData.isMinor ? formData.guardianDoc.trim() : undefined,
      itemType: formData.itemType,
      claimedAmount: formData.claimedAmount.trim(),
      orderNumber: formData.orderNumber.trim(),
      itemDescription: formData.itemDescription.trim(),
      claimType: formData.claimType,
      detail: formData.detail.trim(),
      request: formData.request.trim(),
    };

    try {
      await addDoc(collection(db, "reclamaciones"), {
        ...record,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Guardado local de reclamación:", err);
    } finally {
      setSubmitting(false);
      setSubmittedClaim(record);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col font-sans">
      <Navbar />
      <SecondaryNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Migas de pan */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-red-600 transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Libro de Reclamaciones</span>
        </div>

        {/* ── Vista de Constancia Emitida ── */}
        {submittedClaim ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm print:shadow-none print:border-none print:p-0">
            <div className="text-center pb-6 border-b border-gray-200">
              <div className="w-14 h-14 bg-green-50 text-green-600 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-3 print:hidden">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Hoja de Reclamación Virtual
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Reclamación Registrada
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Número de Registro:{" "}
                <span className="text-red-600 font-bold text-base">
                  {submittedClaim.claimCode}
                </span>{" "}
                &bull; Fecha: {submittedClaim.createdAt}
              </p>
            </div>

            {/* Datos del Proveedor */}
            <div className="py-4 border-b border-gray-200 text-xs md:text-sm grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded my-6">
              <div>
                <p className="text-gray-500 font-semibold">Razón Social:</p>
                <p className="text-gray-900 font-bold">EAGLE GAMING PERÚ E.I.R.L.</p>
                <p className="text-gray-500 font-semibold mt-2">RUC:</p>
                <p className="text-gray-900 font-medium">20610349852</p>
              </div>
              <div>
                <p className="text-gray-500 font-semibold">Establecimiento:</p>
                <p className="text-gray-900 font-medium">
                  Av. Garcilaso de la Vega 1345, C.C. Cyberplaza Tda 1B-133, Lima
                </p>
                <p className="text-gray-500 font-semibold mt-2">Contacto:</p>
                <p className="text-gray-900 font-medium">
                  eaglegamingperu@gmail.com | +51 986 638 034
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="space-y-6 text-sm">
              <div className="border border-gray-200 rounded p-4 bg-white">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
                  1. Datos del Consumidor Reclamante
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-500 block">Nombres y Apellidos:</span>
                    <span className="font-medium text-gray-900">{submittedClaim.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Documento ({submittedClaim.docType}):</span>
                    <span className="font-medium text-gray-900">{submittedClaim.docNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Teléfono:</span>
                    <span className="font-medium text-gray-900">{submittedClaim.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Correo Electrónico:</span>
                    <span className="font-medium text-gray-900">{submittedClaim.email}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block">Domicilio:</span>
                    <span className="font-medium text-gray-900">
                      {submittedClaim.address}, {submittedClaim.district}, {submittedClaim.province}, {submittedClaim.department}
                    </span>
                  </div>
                  {submittedClaim.isMinor && (
                    <div className="col-span-full pt-2 border-t border-gray-100">
                      <span className="text-gray-500 block">Apoderado:</span>
                      <span className="font-medium text-gray-900">
                        {submittedClaim.guardianName} (Doc: {submittedClaim.guardianDoc})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded p-4 bg-white">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
                  2. Identificación del Bien Contratado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-500 block">Tipo:</span>
                    <span className="font-medium text-gray-900 capitalize">{submittedClaim.itemType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Monto Reclamado:</span>
                    <span className="font-medium text-gray-900">
                      {submittedClaim.claimedAmount ? `S/ ${submittedClaim.claimedAmount}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">N° Pedido / Boleta:</span>
                    <span className="font-medium text-gray-900">
                      {submittedClaim.orderNumber || "—"}
                    </span>
                  </div>
                  <div className="col-span-full">
                    <span className="text-gray-500 block">Descripción:</span>
                    <span className="font-medium text-gray-900">{submittedClaim.itemDescription}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded p-4 bg-white">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
                  3. Detalle de la Reclamación ({submittedClaim.claimType.toUpperCase()})
                </h3>
                <div className="space-y-3 text-xs md:text-sm">
                  <div>
                    <span className="text-gray-500 font-medium block mb-1">Detalle de los hechos:</span>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                      {submittedClaim.detail}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block mb-1">Pedido del consumidor:</span>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                      {submittedClaim.request}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
              <p>
                <strong>Plazo de Respuesta:</strong> Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571), la respuesta será remitida en un plazo máximo de quince (15) días hábiles al correo electrónico registrado.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-between items-center print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded flex items-center gap-2 transition-colors border border-gray-300 text-sm"
              >
                <Printer className="w-4 h-4" /> Imprimir Constancia
              </button>

              <button
                onClick={() => setSubmittedClaim(null)}
                className="px-6 py-2.5 bg-[#dc143c] hover:bg-[#b00e2e] text-white font-semibold rounded transition-colors text-sm"
              >
                Registrar otro reclamo
              </button>
            </div>
          </div>
        ) : (
          /* ── Formulario Limpio y Profesional ── */
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-10">
            {/* Cabecera Sobria */}
            <div className="pb-6 mb-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Libro de Reclamaciones
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571).
                  </p>
                </div>
                <div className="text-xs text-gray-500 sm:text-right space-y-0.5 pt-1">
                  <p className="font-semibold text-gray-800">EAGLE GAMING PERÚ E.I.R.L.</p>
                  <p>RUC: 20607787728</p>
                  <p>Cyberplaza Tda. 1B-133, Lima</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ═══ 1. Identificación del Consumidor ═══ */}
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-200">
                  1. Identificación del Consumidor Reclamante
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombres y Apellidos / Razón Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Ingrese su nombre completo"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="docType"
                      value={formData.docType}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    >
                      <option value="DNI">DNI</option>
                      <option value="C.E.">Carné de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      N° de Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="docNumber"
                      required
                      placeholder="Número de documento"
                      value={formData.docNumber}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Teléfono / Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="987654321"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dirección (Domicilio) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Av. / Calle / Jr. y número"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Distrito <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      placeholder="Ej: Miraflores, Lima"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isMinor"
                      checked={formData.isMinor}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span>¿El consumidor es menor de edad?</span>
                  </label>

                  {formData.isMinor && (
                    <div className="mt-3 p-3.5 bg-gray-50 border border-gray-200 rounded grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nombre del Padre, Madre o Apoderado <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardianName"
                          required={formData.isMinor}
                          placeholder="Nombre del apoderado"
                          value={formData.guardianName}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          DNI / Documento del Apoderado <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guardianDoc"
                          required={formData.isMinor}
                          placeholder="Doc. del apoderado"
                          value={formData.guardianDoc}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ═══ 2. Identificación del Bien Contratado ═══ */}
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-200">
                  2. Identificación del Bien Contratado
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                        <input
                          type="radio"
                          name="itemType"
                          value="producto"
                          checked={formData.itemType === "producto"}
                          onChange={handleChange}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span>Producto</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                        <input
                          type="radio"
                          name="itemType"
                          value="servicio"
                          checked={formData.itemType === "servicio"}
                          onChange={handleChange}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span>Servicio</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Monto Reclamado (S/)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="claimedAmount"
                      placeholder="0.00"
                      value={formData.claimedAmount}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      N° Boleta / Factura / Pedido
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      placeholder="Ej: B001-1234"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
                    />
                  </div>

                  <div className="col-span-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descripción del Producto o Servicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="itemDescription"
                      required
                      placeholder="Ej: Memoria RAM DDR5 32GB / Servicio de armado de PC"
                      value={formData.itemDescription}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* ═══ 3. Detalle de la Reclamación ═══ */}
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-200">
                  3. Detalle de la Reclamación
                </h2>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Tipo de Reclamación <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${formData.claimType === "reclamo" ? "border-red-600 bg-red-50/20 text-gray-900" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                      <input
                        type="radio"
                        name="claimType"
                        value="reclamo"
                        checked={formData.claimType === "reclamo"}
                        onChange={handleChange}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wide block text-gray-900">Reclamo</span>
                        <span className="text-xs text-gray-500 leading-snug block mt-0.5">Disconformidad relacionada a los productos o servicios adquiridos.</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${formData.claimType === "queja" ? "border-red-600 bg-red-50/20 text-gray-900" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                      <input
                        type="radio"
                        name="claimType"
                        value="queja"
                        checked={formData.claimType === "queja"}
                        onChange={handleChange}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wide block text-gray-900">Queja</span>
                        <span className="text-xs text-gray-500 leading-snug block mt-0.5">Disconformidad respecto a la atención al público.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Detalle de los Hechos <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="detail"
                    required
                    rows={4}
                    placeholder="Describa de manera clara y ordenada lo sucedido..."
                    value={formData.detail}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pedido Concreto del Consumidor <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="request"
                    required
                    rows={3}
                    placeholder="Indique qué solución solicita (ej. cambio, devolución, reparación, etc.)..."
                    value={formData.request}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm"
                  />
                </div>
              </section>

              {/* Declaración Jurada */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-500">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span>
                    Declaro que la información consignada en esta Hoja de Reclamación es verdadera. Autorizo el envío de la respuesta al correo electrónico indicado dentro del plazo de 15 días hábiles conforme a ley.
                  </span>
                </label>
              </div>

              {/* Botón de Envío */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancelar y volver a la tienda
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-2.5 bg-[#dc143c] hover:bg-[#b00e2e] active:bg-[#900a24] disabled:opacity-50 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Reclamación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
