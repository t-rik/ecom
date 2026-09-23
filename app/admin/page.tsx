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

const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; text: string; icon: any }> = {
  NEW: {
    label: "À Confirmer (Nouveau)",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmé",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  NO_ANSWER: {
    label: "Pas de réponse",
    bg: "bg-orange-500/15 border-orange-500/30",
    text: "text-orange-400",
    icon: PhoneOff,
  },
  SHIPPED: {
    label: "Expédié (En cours)",
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-400",
    icon: Truck,
  },
  DELIVERED: {
    label: "Livré & Encaissé",
    bg: "bg-green-500/15 border-green-500/30",
    text: "text-green-400",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Annulé",
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-400",
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

  // Notes editing state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

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
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
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
      }
    } catch (err) {
      console.error("Error saving notes:", err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" isDark={true} />
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Admin COD Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Voir la boutique</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <a
              href={`/api/admin/export${activeTab !== "ALL" ? `?status=${activeTab}` : ""}`}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              title="Exporter pour livreur"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export CSV (Livreur)</span>
            </a>

            <button
              type="button"
              onClick={handleRefresh}
              className={`p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all ${
                isRefreshing ? "animate-spin text-emerald-400" : ""
              }`}
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-colors"
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
        {/* KPI Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Revenue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Chiffre d'Affaires COD</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Taux de Confirmation</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>À Confirmer (Urgents)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
              <span>{metrics ? metrics.pendingCount : 0}</span>
              {(metrics?.pendingCount || 0) > 0 && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Appelez vite !
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Appel dans les 15 min recommandé</p>
          </div>

          {/* Total Orders */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Total Commandes</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom client, numéro de téléphone (06...), ville ou ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-slate-100 text-slate-950 border-white shadow-xs"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              Toutes ({metrics?.totalOrders || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NEW")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NEW"
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                  : "bg-slate-900 text-amber-400/90 border-slate-800 hover:border-amber-500/40"
              }`}
            >
              🟡 À Confirmer ({metrics?.pendingCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CONFIRMED")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CONFIRMED"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs"
                  : "bg-slate-900 text-emerald-400/90 border-slate-800 hover:border-emerald-500/40"
              }`}
            >
              🟢 Confirmé ({metrics?.confirmedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NO_ANSWER")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "NO_ANSWER"
                  ? "bg-orange-500 text-slate-950 border-orange-400 shadow-xs"
                  : "bg-slate-900 text-orange-400/90 border-slate-800 hover:border-orange-500/40"
              }`}
            >
              📞 Pas de réponse ({metrics?.noAnswerCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SHIPPED")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "SHIPPED"
                  ? "bg-blue-500 text-slate-950 border-blue-400 shadow-xs"
                  : "bg-slate-900 text-blue-400/90 border-slate-800 hover:border-blue-500/40"
              }`}
            >
              🚚 Expédié ({metrics?.shippedCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DELIVERED")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "DELIVERED"
                  ? "bg-green-500 text-slate-950 border-green-400 shadow-xs"
                  : "bg-slate-900 text-green-400/90 border-slate-800 hover:border-green-500/40"
              }`}
            >
              ✅ Livré ({metrics?.deliveredCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CANCELLED")}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "CANCELLED"
                  ? "bg-red-500 text-slate-950 border-red-400 shadow-xs"
                  : "bg-slate-900 text-red-400/90 border-slate-800 hover:border-red-500/40"
              }`}
            >
              ❌ Annulé ({metrics?.cancelledCount || 0})
            </button>
          </div>
        </div>

        {/* Orders Listing */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-xs">Chargement des commandes...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Aucun résultat ne correspond à votre recherche. Essayez un autre mot-clé."
                : "Les nouvelles commandes des clients apparaîtront ici en temps réel."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusCfg = STATUS_LABELS[order.status] || STATUS_LABELS.NEW;
              const StatusIcon = statusCfg.icon;
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all space-y-4"
                >
                  {/* Top Line: ID, Date, and Status Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {order.id}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="relative inline-flex items-center">
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none transition-all ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        <option value="NEW" className="bg-slate-900 text-amber-400">🟡 À Confirmer</option>
                        <option value="CONFIRMED" className="bg-slate-900 text-emerald-400">🟢 Confirmé</option>
                        <option value="NO_ANSWER" className="bg-slate-900 text-orange-400">📞 Pas de réponse</option>
                        <option value="SHIPPED" className="bg-slate-900 text-blue-400">🚚 Expédié</option>
                        <option value="DELIVERED" className="bg-slate-900 text-green-400">✅ Livré & Encaissé</option>
                        <option value="CANCELLED" className="bg-slate-900 text-red-400">❌ Annulé</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
                    </div>
                  </div>

                  {/* Middle Line: Customer Details & Product info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Customer column (5 cols) */}
                    <div className="md:col-span-5 space-y-1.5">
                      <h4 className="font-bold text-white text-base leading-tight">
                        {order.fullName}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                        <span>📱 {order.phone}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white">{order.city}</strong>: {order.address}
                        </span>
                      </div>
                    </div>

                    {/* Product & Price Column (4 cols) */}
                    <div className="md:col-span-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                      <div className="text-slate-400">Produit:</div>
                      <div className="font-bold text-slate-200 line-clamp-1">
                        {order.productTitle || order.productId}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-semibold">
                        <span className="text-slate-400">Quantité: {order.quantity}</span>
                        <span className="text-emerald-400 font-black text-sm">
                          {order.totalPrice} DH
                        </span>
                      </div>
                    </div>

                    {/* Quick Call & WhatsApp Action Buttons (3 cols) */}
                    <div className="md:col-span-3 flex flex-row md:flex-col gap-2 justify-end">
                      {/* Call Button */}
                      <a
                        href={`tel:${order.phone}`}
                        className="flex-1 md:w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
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
                        className="flex-1 md:w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Ouvrir WhatsApp avec message de confirmation"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Bottom Line: Notes & Delete Option */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
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
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Sauvegarder
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="text-slate-400 hover:text-white px-2 py-1 text-xs"
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
                      className="text-slate-600 hover:text-red-400 p-1 rounded-md transition-colors"
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
