"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { OrderRecord, OrderMetrics, OrderStatus } from "@/lib/orders-db";
import {
  Phone,
  MessageSquare,
  Search,
  RefreshCw,
  Download,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  PhoneOff,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Edit3,
  Trash2,
  ChevronDown,
  Loader2,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeBg: string; badgeText: string; badgeBorder: string; icon: any }
> = {
  NEW: {
    label: "À Confirmer",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmé",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
    icon: CheckCircle2,
  },
  NO_ANSWER: {
    label: "Pas de réponse",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    badgeBorder: "border-orange-200",
    icon: PhoneOff,
  },
  SHIPPED: {
    label: "Expédié",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    badgeBorder: "border-blue-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Livré & Encaissé",
    badgeBg: "bg-green-50",
    badgeText: "text-green-800",
    badgeBorder: "border-green-200",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Annulé",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-800",
    badgeBorder: "border-rose-200",
    icon: XCircle,
  },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [metrics, setMetrics] = useState<OrderMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOrders = useCallback(async () => {
    try {
      const url = activeTab === "ALL"
        ? `/api/admin/orders${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
        : `/api/admin/orders?status=${activeTab}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;

      const res = await fetch(url);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, searchQuery, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        showToast(`✅ Commande mise à jour : ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      } else {
        showToast(data.message || "Impossible de mettre à jour le statut.", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Erreur de connexion au serveur.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: notesText }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, notes: notesText } : o))
        );
        setEditingNotesId(null);
        showToast("Note enregistrée.");
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      showToast("Erreur lors de la sauvegarde de la note.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`Supprimer définitivement la commande ${id} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        showToast("Commande supprimée.");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getWhatsAppGreeting = (order: OrderRecord) => {
    const rawNumber = order.phone.startsWith("0") ? order.phone.substring(1) : order.phone;
    const msg = `Salam ${order.fullName}, m3ak Pratiko Maroc 🇲🇦 bkhousous l-commande dialk N° ${order.id} (${order.productTitle || "Produit"}, montant: ${order.totalPrice} DH). Bghina n-akdou m3ak l-3onwan w l-madina (${order.city}) bach nsiftoha lik m3a l-livreur. Chokran!`;
    return `https://wa.me/212${rawNumber}?text=${encodeURIComponent(msg)}`;
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Logo size="sm" isDark={false} />
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Admin COD Portal
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-200 transition-colors shadow-2xs"
            >
              <span>Boutique en direct</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <a
              href={`/api/admin/export${activeTab !== "ALL" ? `?status=${activeTab}` : ""}`}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Exporter pour livreur (Excel / CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export Livreur (CSV)</span>
            </a>

            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-gray-200 transition-all cursor-pointer shadow-2xs ${
                isRefreshing ? "animate-spin text-emerald-600" : ""
              }`}
              title="Actualiser les commandes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Metrics Grid (Shopify-Style Clean Cards) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Revenue */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span>Chiffre d'Affaires COD</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {metrics ? metrics.totalRevenue.toLocaleString("fr-FR") : 0}{" "}
              <span className="text-xs sm:text-sm font-bold text-emerald-600">DH</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Livrées + Confirmées</p>
          </div>

          {/* Confirmation Rate */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span>Taux de Confirmation</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {metrics ? metrics.confirmationRate : 0}%
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${metrics ? metrics.confirmationRate : 0}%` }}
              />
            </div>
          </div>

          {/* Pending Calls / Speed to Lead */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold mb-2">
              <span>À Confirmer (Urgents)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 animate-pulse">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 flex items-center gap-2">
              <span>{metrics ? metrics.pendingCount : 0}</span>
              {(metrics?.pendingCount || 0) > 0 && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Appelez vite !
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Appel dans les 15 min recommandé</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span>Total Commandes</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {metrics ? metrics.totalOrders : 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {metrics ? metrics.deliveredCount : 0} livrées avec succès
            </p>
          </div>
        </section>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom client, numéro de téléphone (06...), ville ou ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-2xs"
            />
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-gray-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Toutes ({metrics?.totalOrders || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NEW")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NEW"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-amber-800 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              🟡 À Confirmer ({metrics?.pendingCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CONFIRMED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CONFIRMED"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-emerald-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              🟢 Confirmé ({metrics?.confirmedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NO_ANSWER")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NO_ANSWER"
                  ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                  : "bg-white text-orange-800 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
            >
              📞 Pas de réponse ({metrics?.noAnswerCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SHIPPED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "SHIPPED"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-blue-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
              }`}
            >
              🚚 Expédié ({metrics?.shippedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DELIVERED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "DELIVERED"
                  ? "bg-green-700 text-white border-green-700 shadow-xs"
                  : "bg-white text-green-800 border-gray-200 hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              ✅ Livré ({metrics?.deliveredCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CANCELLED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CANCELLED"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white text-rose-800 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50"
              }`}
            >
              ❌ Annulé ({metrics?.cancelledCount || 0})
            </button>
          </div>
        </div>

        {/* Orders Listing */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">Chargement des commandes...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200/90 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-900">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Aucun résultat ne correspond à votre recherche. Essayez un autre mot-clé."
                : "Les nouvelles commandes des clients apparaîtront ici en temps réel."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-xs transition-all space-y-4 shadow-2xs"
                >
                  {/* Top Line: ID, Date, and Status Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {order.id}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Statut :</span>
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none transition-all ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder} hover:opacity-90 disabled:opacity-50`}
                        >
                          <option value="NEW" className="bg-white text-slate-900">🟡 À Confirmer</option>
                          <option value="CONFIRMED" className="bg-white text-slate-900">🟢 Confirmé</option>
                          <option value="NO_ANSWER" className="bg-white text-slate-900">📞 Pas de réponse</option>
                          <option value="SHIPPED" className="bg-white text-slate-900">🚚 Expédié</option>
                          <option value="DELIVERED" className="bg-white text-slate-900">✅ Livré & Encaissé</option>
                          <option value="CANCELLED" className="bg-white text-slate-900">❌ Annulé</option>
                        </select>
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 absolute right-2.5 animate-spin text-slate-500 pointer-events-none" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Line: Customer Details & Product info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Customer column (5 cols) */}
                    <div className="md:col-span-5 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">
                        {order.fullName}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-700 font-mono font-semibold">
                        <span>📱 {order.phone}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-800">{order.city}</strong>: {order.address}
                        </span>
                      </div>
                    </div>

                    {/* Product & Price Column (4 cols) */}
                    <div className="md:col-span-4 bg-slate-50/80 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                      <div className="text-slate-500 font-medium">Produit :</div>
                      <div className="font-bold text-slate-800 line-clamp-1">
                        {order.productTitle || order.productId}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 font-semibold">
                        <span className="text-slate-500">Quantité: {order.quantity}</span>
                        <span className="text-emerald-700 font-black text-sm">
                          {order.totalPrice} DH
                        </span>
                      </div>
                    </div>

                    {/* Quick Call, WhatsApp, and 1-Click Status Buttons (3 cols) */}
                    <div className="md:col-span-3 flex flex-col gap-2 justify-end">
                      <div className="flex gap-2">
                        {/* Call Button */}
                        <a
                          href={`tel:${order.phone}`}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          title="Appeler le client"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Appeler</span>
                        </a>

                        {/* WhatsApp Greeting Button */}
                        <a
                          href={getWhatsAppGreeting(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          title="Ouvrir WhatsApp avec message de confirmation"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* 1-Click Status Quick Actions */}
                      {order.status === "NEW" && (
                        <div className="flex gap-1.5 w-full">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                            disabled={isUpdating}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                            title="Confirmer la commande en 1 clic"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>✓ Confirmer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, "NO_ANSWER")}
                            disabled={isUpdating}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 border border-orange-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Marquer comme pas de réponse"
                          >
                            <PhoneOff className="w-3 h-3" />
                            <span>Pas de réponse</span>
                          </button>
                        </div>
                      )}

                      {order.status === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, "SHIPPED")}
                          disabled={isUpdating}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                          title="Marquer comme expédié avec le livreur"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>🚚 Marquer Expédié</span>
                        </button>
                      )}

                      {order.status === "SHIPPED" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, "DELIVERED")}
                          disabled={isUpdating}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                          title="Marquer comme livré et encaissé"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>✅ Marquer Livré & Encaissé</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Line: Notes & Delete Option */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-slate-500">
                    <div className="flex-1">
                      {editingNotesId === order.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Ex: Rappeler à 18h, Livreur Cathedis..."
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Sauvegarder
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="text-slate-500 hover:text-slate-800 px-2 py-1 text-xs cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(order.id);
                            setNotesText(order.notes || "");
                          }}
                          className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-800 group"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                          <span className="italic">
                            {order.notes ? `Note: "${order.notes}"` : "+ Ajouter une note interne..."}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Supprimer la commande"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
