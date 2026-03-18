"use client";

import { CompanyExpense } from "@/components/CompanyExpense";
import Loader from "@/components/Loader";
import { Login } from "@/components/Login";
import { ProductionSheet } from "@/components/ProductionSheet";
import { RAW_MATERIALS as INITIAL_MATERIALS, PRODUCTS as INITIAL_PRODUCTS } from "@/lib/constants";
import { Expense, Product, ProductionEntry, RawMaterial, Stats, UserRole } from "@/lib/types";
import axios from "@/utils/axiosInstance";
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Package,
    TrendingUp,
    User,
    Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [activeTab, setActiveTab] = useState<"sheet" | "dashboard" | "expense">("sheet");
    const [entries, setEntries] = useState<ProductionEntry[]>([]);
    const [recentEntries, setRecentEntries] = useState<ProductionEntry[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_MATERIALS);
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [stats, setStats] = useState<Stats>();
    const [isClient, setIsClient] = useState(false);

    // loading states
    const [productLoading, setProductLoading] = useState(true);
    const [materialLoading, setMaterialLoading] = useState(true);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [expenseLoading, setExpenseLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Persistence
    useEffect(() => {
        if (!isClient) return;

        const auth = localStorage.getItem("abs_auth");
        const role = localStorage.getItem("abs_role") as UserRole;
        if (auth === "true" && role) {
            setIsLoggedIn(true);
            setUserRole(role);
        }
    }, [isClient]);

    //  FETCH PRODUCTS
    const fetchProducts = async () => {
        try {
            const res = await axios.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setProductLoading(false);
        }
    };
    useEffect(() => {
        fetchProducts();
    }, [isClient]);

    // FETCH RAW MATERIALS
    const fetchMaterials = async () => {
        try {
            const res = await axios.get("/material");
            setRawMaterials(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setMaterialLoading(false);
        }
    };
    useEffect(() => {
        fetchMaterials();
    }, [isClient]);

    // FETCH ENTRIES
    const fetchEntries = async () => {
        try {
            const res = await axios.get("/production");
            setEntries(res.data.production);
        } catch (error) {
            console.log(error);
        } finally {
            setEntriesLoading(false);
        }
    };
    useEffect(() => {
        fetchEntries();
    }, [isClient]);

    // FETCH RECENT ENTRIES
    const fetchRecentEntries = async () => {
        try {
            const res = await axios.get("/recent-production");
            setRecentEntries(res.data.recent_production);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchRecentEntries();
    }, [isClient]);

    // FETCH COMPANY EXPENSES
    const fetchExpenses = async () => {
        try {
            const res = await axios.get("/expense");
            setExpenses(res.data.expenses);
        } catch (error) {
            console.log(error);
        } finally {
            setExpenseLoading(false);
        }
    };
    useEffect(() => {
        fetchExpenses();
    }, [isClient]);

    // FETCH DASHBOARD STATS
    const fetchStats = async () => {
        try {
            const res = await axios.get("/stats");
            setStats(res.data.stats);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchStats();
    }, [isClient]);

    const handleAddEntry = async (entry: ProductionEntry) => {
        try {
            await axios.post("/production", entry);
            toast.success("Entry add successfully");
            fetchEntries();
            fetchStats();
            fetchRecentEntries();
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateEntry = async (updatedEntry: ProductionEntry) => {
        try {
            const res = await axios.put(`/production/${updatedEntry.id}`, updatedEntry);
            toast.success(res.data.message);
            fetchEntries();
            fetchStats();
        } catch (error: any) {
            console.log(error);
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই এন্ট্রিটি মুছে ফেলতে চান?")) {
            try {
                const res = await axios.delete(`/production/${id}`);
                toast.success(res.data.message);
                fetchEntries();
                fetchStats();
                fetchRecentEntries();
            } catch (error: any) {
                console.log(error);
                if (error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        }
    };

    const handleAddExpense = async (expense: Expense) => {
        try {
            const res = await axios.post("/expense", expense);
            toast.success(res.data.message);
            fetchExpenses();
            fetchStats();
        } catch (error: any) {
            console.log(error);
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                const res = await axios.delete(`/expense/${id}`);
                toast.success(res.data.message);
                fetchExpenses();
                fetchStats();
            } catch (error: any) {
                console.log(error);
                if (error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        }
    };

    const handleAddMaterial = async (material: RawMaterial) => {
        try {
            const res = await axios.post("/material", material);
            toast.success(res.data.message);
            fetchMaterials();
        } catch (error: any) {
            console.log(error);
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleAddProduct = async (product: Product) => {
        try {
            const res = await axios.post("/products", product);
            toast.success(res.data.message);
            fetchProducts();
        } catch (error: any) {
            console.log(error);
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        localStorage.removeItem("abs_auth");
        localStorage.removeItem("abs_role");
    };

    const handleLogin = (role: UserRole) => {
        setIsLoggedIn(true);
        setUserRole(role);
        localStorage.setItem("abs_auth", "true");
        localStorage.setItem("abs_role", role);
    };

    if (!isClient) {
        return null; // or a loading spinner
    }

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-stone-50 text-stone-900">
            {/* Sidebar - Maroon Theme */}
            <aside className="no-print w-full md:w-64 bg-[#800000] text-white flex-shrink-0 shadow-xl flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Package className="text-orange-300" />
                        ABS FEED
                    </h1>
                    <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest font-bold">
                        Production Management
                    </p>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab("sheet")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            activeTab === "sheet"
                                ? "bg-white/20 shadow-inner"
                                : "hover:bg-white/10 text-white/80"
                        }`}
                    >
                        <ClipboardList size={20} />
                        Production Sheet
                    </button>
                    <button
                        onClick={() => setActiveTab("expense")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            activeTab === "expense"
                                ? "bg-white/20 shadow-inner"
                                : "hover:bg-white/10 text-white/80"
                        }`}
                    >
                        <Wallet size={20} />
                        Company Expense
                    </button>
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            activeTab === "dashboard"
                                ? "bg-white/20 shadow-inner"
                                : "hover:bg-white/10 text-white/80"
                        }`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2 text-white/60 mb-2">
                        <User size={16} />
                        <span className="text-xs font-bold">
                            {userRole === "admin" ? "Admin User" : "Visitor"}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                <header className="no-print bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h2 className="text-lg font-bold text-[#800000]">
                        {activeTab === "sheet"
                            ? "ডেইলি প্রোডাকশন শীট"
                            : activeTab === "expense"
                              ? "Company Expense Management"
                              : "প্রোডাকশন ড্যাশবোর্ড"}
                    </h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.print()}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-md text-sm font-bold transition-colors border border-stone-200"
                        >
                            Print Report
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {activeTab === "sheet" ? (
                        <ProductionSheet
                            entries={entries}
                            rawMaterials={rawMaterials}
                            products={products}
                            onAddMaterial={handleAddMaterial}
                            onAddProduct={handleAddProduct}
                            onAddEntry={handleAddEntry}
                            onUpdateEntry={handleUpdateEntry}
                            onDeleteEntry={handleDeleteEntry}
                            productLoading={productLoading}
                            materialLoading={materialLoading}
                            userRole={userRole}
                        />
                    ) : activeTab === "expense" ? (
                        <CompanyExpense
                            expenses={expenses}
                            onAddExpense={handleAddExpense}
                            onDeleteExpense={handleDeleteExpense}
                            userRole={userRole}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-t-4 border-t-[#800000]">
                                <div className="flex items-center gap-4 text-stone-500 mb-2">
                                    <TrendingUp size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Total Bags
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-[#800000]">
                                    {stats?.total_bags}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-t-4 border-t-orange-500">
                                <div className="flex items-center gap-4 text-stone-500 mb-2">
                                    <TrendingUp size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Total Weight (KG)
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-orange-600">
                                    {stats?.total_weight}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-t-4 border-t-emerald-600">
                                <div className="flex items-center gap-4 text-stone-500 mb-2">
                                    <TrendingUp size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Total Production Value
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-emerald-700">
                                    ৳ {stats?.total_production_value}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-t-4 border-t-red-600">
                                <div className="flex items-center gap-4 text-stone-500 mb-2">
                                    <Wallet size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Total Expenses
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-red-700">
                                    ৳ {stats?.total_expense}
                                </div>
                            </div>

                            <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                                <h3 className="font-bold mb-4 text-[#800000]">
                                    রিসেন্ট প্রোডাকশন লগ
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b text-stone-500 font-bold bg-stone-50">
                                                <th className="py-3 px-4">তারিখ</th>
                                                <th className="py-3 px-4">ব্যাচ নং</th>
                                                <th className="py-3 px-4">পণ্য</th>
                                                <th className="py-3 px-4">ব্যাগ</th>
                                                <th className="py-3 px-4">মোট কেজি</th>
                                                <th className="py-3 px-4 text-right">মোট টাকা</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentEntries.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="py-12 text-center text-stone-400 italic"
                                                    >
                                                        এখনো কোন তথ্য নেই
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentEntries?.map((entry) => (
                                                    <tr
                                                        key={entry.id}
                                                        className="border-b hover:bg-stone-50 transition-colors"
                                                    >
                                                        <td className="py-3 px-4">{entry.date}</td>
                                                        <td className="py-3 px-4 font-bold text-stone-600">
                                                            {entry.batchNo}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-[#800000]">
                                                            {entry.productName}
                                                        </td>
                                                        <td className="py-3 px-4">{entry.bags}</td>
                                                        <td className="py-3 px-4 font-medium">
                                                            {entry.totalKgs} KG
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-black text-emerald-600">
                                                            ৳{entry.totalValue.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {(entriesLoading || expenseLoading) && (
                <div className="z-50 absolute inset-0 flex justify-center items-center bg-black/60 bg-opacity-30 backdrop-blur-md">
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default App;
