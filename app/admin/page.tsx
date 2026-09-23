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
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/30",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmé",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  NO_ANSWER: {
    label: "Pas de réponse",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-300",
    badgeBorder: "border-orange-500/30",
    icon: PhoneOff,
  },
  SHIPPED: {
    label: "Expédié",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/30",
    icon: Truck,
  },
  DELIVERED: {
    label: "Livré & Encaissé",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-200",
    badgeBorder: "border-emerald-500/40",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Annulé",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-500/30",
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* Top Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/40"
              : "bg-rose-950/95 text-rose-200 border-rose-800/60"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Logo size="sm" isDark={true} />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin COD Portal
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors shadow-xs"
            >
              <span>Boutique en direct</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <a
              href={`/api/admin/export${activeTab !== "ALL" ? `?status=${activeTab}` : ""}`}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-950/50 cursor-pointer active:scale-95"
              title="Exporter pour livreur (Excel / CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export Livreur (CSV)</span>
            </a>

            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer shadow-xs ${
                isRefreshing ? "animate-spin text-emerald-400" : ""
              }`}
              title="Actualiser les commandes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 transition-colors cursor-pointer"
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
        {/* KPI Metrics Grid (Linear/Vercel Dark Sleek Cards) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Revenue */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Chiffre d'Affaires COD</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {metrics ? metrics.totalRevenue.toLocaleString("fr-FR") : 0}{" "}
              <span className="text-xs sm:text-sm font-bold text-emerald-400">DH</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Livrées + Confirmées</p>
          </div>

          {/* Confirmation Rate */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Taux de Confirmation</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {metrics ? metrics.confirmationRate : 0}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${metrics ? metrics.confirmationRate : 0}%` }}
              />
            </div>
          </div>

          {/* Pending Calls / Speed to Lead */}
          <div className="bg-gradient-to-br from-slate-900/80 to-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 hover:border-amber-500/50 transition-all relative overflow-hidden backdrop-blur-xs">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold mb-2">
              <span>À Confirmer (Urgents)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/40 animate-pulse">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
              <span>{metrics ? metrics.pendingCount : 0}</span>
              {(metrics?.pendingCount || 0) > 0 && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Appelez vite !
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-400/70 mt-1">Appel dans les 15 min recommandé</p>
          </div>

          {/* Total Orders */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span>Total Commandes</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {metrics ? metrics.totalOrders : 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics ? metrics.deliveredCount : 0} livrées avec succès
            </p>
          </div>
        </section>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom client, numéro de téléphone (06...), ville ou ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 shadow-inner transition-all"
            />
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-slate-800 text-white border-slate-600 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              Toutes ({metrics?.totalOrders || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NEW")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NEW"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-amber-500/30 hover:text-amber-300"
              }`}
            >
              🟡 À Confirmer ({metrics?.pendingCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CONFIRMED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CONFIRMED"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-emerald-500/30 hover:text-emerald-300"
              }`}
            >
              🟢 Confirmé ({metrics?.confirmedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NO_ANSWER")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NO_ANSWER"
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-orange-500/30 hover:text-orange-300"
              }`}
            >
              📞 Pas de réponse ({metrics?.noAnswerCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SHIPPED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "SHIPPED"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-sky-500/30 hover:text-sky-300"
              }`}
            >
              🚚 Expédié ({metrics?.shippedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DELIVERED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "DELIVERED"
                  ? "bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-emerald-500/30 hover:text-emerald-300"
              }`}
            >
              ✅ Livré ({metrics?.deliveredCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CANCELLED")}
              className={`px-3.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CANCELLED"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-rose-500/30 hover:text-rose-300"
              }`}
            >
              ❌ Annulé ({metrics?.cancelledCount || 0})
            </button>
          </div>
        </div>

        {/* Orders Listing */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Chargement des commandes...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-xl shadow-black/20">
            <Package className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 hover:border-slate-700/80 transition-all space-y-4 shadow-xl shadow-black/20 backdrop-blur-xs"
                >
                  {/* Top Line: ID, Date, and Status Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                        {order.id}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
                          <option value="NEW" className="bg-slate-900 text-white">🟡 À Confirmer</option>
                          <option value="CONFIRMED" className="bg-slate-900 text-white">🟢 Confirmé</option>
                          <option value="NO_ANSWER" className="bg-slate-900 text-white">📞 Pas de réponse</option>
                          <option value="SHIPPED" className="bg-slate-900 text-white">🚚 Expédié</option>
                          <option value="DELIVERED" className="bg-slate-900 text-white">✅ Livré & Encaissé</option>
                          <option value="CANCELLED" className="bg-slate-900 text-white">❌ Annulé</option>
                        </select>
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 absolute right-2.5 animate-spin text-slate-400 pointer-events-none" />
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
                      <h4 className="font-bold text-white text-base leading-tight">
                        {order.fullName}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono font-semibold">
                        <span>📱 {order.phone}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-200">{order.city}</strong>: {order.address}
                        </span>
                      </div>
                    </div>

                    {/* Product & Price Column (4 cols) */}
                    <div className="md:col-span-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                      <div className="text-slate-400 font-medium">Produit :</div>
                      <div className="font-bold text-slate-200 line-clamp-1">
                        {order.productTitle || order.productId}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-semibold">
                        <span className="text-slate-400">Quantité: {order.quantity}</span>
                        <span className="text-emerald-400 font-black text-sm">
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
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/50 cursor-pointer active:scale-95"
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
                          className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer active:scale-95"
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
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                            title="Confirmer la commande en 1 clic"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>✓ Confirmer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, "NO_ANSWER")}
                            disabled={isUpdating}
                            className="bg-orange-950/40 hover:bg-orange-900/50 text-orange-300 font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 border border-orange-800/50 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
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
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                          title="Marquer comme livré et encaissé"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>✅ Marquer Livré & Encaissé</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Line: Notes & Delete Option */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/70 text-xs text-slate-400">
                    <div className="flex-1">
                      {editingNotesId === order.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Ex: Rappeler à 18h, Livreur Cathedis..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Sauvegarder
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="text-slate-400 hover:text-slate-200 px-2 py-1 text-xs cursor-pointer"
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
                          className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 group"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                          <span className="italic">
                            {order.notes ? `Note: "${order.notes}"` : "+ Ajouter une note interne..."}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
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
