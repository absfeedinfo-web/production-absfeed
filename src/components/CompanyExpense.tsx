import { Expense, ExpenseCategory, UserRole } from "@/lib/types";
import {
    Banknote,
    Calendar,
    CreditCard,
    FileText,
    Info,
    Loader2,
    Plus,
    Printer,
    Trash2,
    Wallet,
} from "lucide-react";
import React, { useState } from "react";

interface CompanyExpenseProps {
    expenses: Expense[];
    onAddExpense: (expense: Expense) => void;
    onDeleteExpense: (id: string) => void;
    userRole: UserRole | null;
}

export const CompanyExpense: React.FC<CompanyExpenseProps> = ({
    expenses,
    onAddExpense,
    onDeleteExpense,
    userRole,
}) => {
    const categories: ExpenseCategory[] = [
        "Transport",
        "Food",
        "Labor",
        "Salary",
        "Permanent Asset",
        "Event",
        "Others",
    ];

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        category: categories[0],
        amount: 0,
        description: "",
        paymentMethod: "Cash" as const,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0 || saving) return;

        setSaving(true);

        try {
            await onAddExpense({
                ...formData,
                id: crypto.randomUUID(),
            });

            setFormData({
                ...formData,
                amount: 0,
                description: "",
            });
        } catch (error) {
            console.error("Failed to add expense:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Add Expense Form or Visitor Banner */}
            {userRole === "visitor" ? (
                <section className="no-print bg-[#800000]/5 rounded-xl border-2 border-dashed border-[#800000]/20 p-12 text-center flex flex-col items-center justify-center">
                    <Info className="text-[#800000]/40 mb-4" size={48} />
                    <h3 className="text-[#800000] font-black uppercase tracking-widest text-lg">
                        Visitor Mode
                    </h3>
                    <p className="text-stone-500 text-xs mt-2 font-medium">
                        You have view-only access. Addition and editing are disabled.
                    </p>
                </section>
            ) : (
                <section className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden no-print">
                    <div className="bg-[#800000] px-6 py-4 border-b border-[#a00000] flex items-center gap-2">
                        <Plus className="text-orange-300" size={20} />
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                            Add New Expense
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1">
                                    <Calendar size={12} /> Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#800000] outline-none"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase">
                                    Expense Category
                                </label>
                                <select
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#800000] outline-none font-bold"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value as ExpenseCategory,
                                        })
                                    }
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1">
                                    <Banknote size={12} /> Amount
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="0.00"
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#800000] outline-none font-black text-lg"
                                    value={formData.amount || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: Number(e.target.value) })
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1">
                                    <CreditCard size={12} /> Payment Method
                                </label>
                                <select
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#800000] outline-none font-bold"
                                    value={formData.paymentMethod}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            paymentMethod: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank">Bank</option>
                                    <option value="Mobile Banking">Mobile Banking</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-[10px] font-black text-stone-500 uppercase flex items-center gap-1 mb-1">
                                <FileText size={12} /> Description (Optional)
                            </label>
                            <textarea
                                className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#800000] outline-none min-h-[80px]"
                                placeholder="Write more about the expense..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                disabled={saving}
                                type="submit"
                                className="bg-[#800000] hover:bg-[#a00000] text-white font-black py-3 px-10 rounded-xl shadow-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />{" "}
                                {saving ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    "Save Expense"
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Expense History Table */}
            <section className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden no-print">
                <div className="bg-[#800000] text-white px-6 py-4 flex items-center justify-between border-b border-[#a00000]">
                    <div className="flex items-center gap-2">
                        <Wallet className="opacity-50" />
                        <h3 className="text-lg font-bold">Expense Log History</h3>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all shadow-md"
                    >
                        <Printer size={14} /> PRINT EXPENSE REPORT (A4)
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 text-[10px] uppercase text-stone-600 font-black tracking-widest border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">Amount (৳)</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {expenses.map((ex) => (
                                <tr
                                    key={ex.id}
                                    className="hover:bg-stone-50 border-b border-stone-100 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-stone-500 whitespace-nowrap">
                                        {ex.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                ex.category === "Salary"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : ex.category === "Permanent Asset"
                                                      ? "bg-purple-100 text-purple-700"
                                                      : ex.category === "Transport"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-stone-100 text-stone-700"
                                            }`}
                                        >
                                            {ex.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ex.description ? (
                                            <div className="max-w-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-medium text-stone-600 shadow-inner leading-relaxed">
                                                {ex.description}
                                            </div>
                                        ) : (
                                            <span className="text-stone-300 italic text-xs">
                                                No description
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-stone-400">
                                        {ex.paymentMethod}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-red-600">
                                        ৳{ex.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onDeleteExpense(ex.id)}
                                            disabled={userRole === "visitor"}
                                            className="p-2 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-24 text-center text-stone-300 italic"
                                    >
                                        No data recorded yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {expenses.length > 0 && (
                            <tfoot className="bg-stone-50 border-t-2 border-stone-200">
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-right font-black uppercase text-stone-500"
                                    >
                                        Total Company Expense:
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-xl text-red-700">
                                        ৳
                                        {expenses
                                            .reduce((sum, ex) => sum + ex.amount, 0)
                                            .toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </section>

            {/* EXPENSE REPORT PRINT VIEW (A4) */}
            <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999] p-8">
                <div className="max-w-[1000px] mx-auto text-stone-900 h-full flex flex-col">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-[#800000]">
                            ABS FEED INDUSTRIES LTD.
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-stone-600">
                            Company Expense Report
                        </p>
                        <div className="h-1 bg-[#800000] w-full my-3"></div>
                        <h2 className="text-xl font-black uppercase underline">
                            Monthly Expenditure Summary
                        </h2>
                        <p className="text-xs mt-2">
                            Print Date: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <table className="w-full border-collapse border-2 border-stone-900 text-[11px]">
                        <thead className="bg-stone-100">
                            <tr>
                                <th className="border border-stone-900 p-2">Date</th>
                                <th className="border border-stone-900 p-2">Category</th>
                                <th className="border border-stone-900 p-2 text-left">
                                    Description
                                </th>
                                <th className="border border-stone-900 p-2 text-center">Payment</th>
                                <th className="border border-stone-900 p-2 text-right">
                                    Amount (৳)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((ex) => (
                                <tr key={ex.id} style={{ pageBreakInside: "avoid" }}>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {ex.date}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {ex.category}
                                    </td>
                                    <td className="border border-stone-900 p-2">
                                        {ex.description || "---"}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {ex.paymentMethod}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-right font-bold">
                                        ৳{ex.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-stone-50 font-black">
                            <tr>
                                <td
                                    colSpan={4}
                                    className="border border-stone-900 p-2 text-right uppercase"
                                >
                                    Grand Total Expense:
                                </td>
                                <td className="border border-stone-900 p-2 text-right text-lg text-red-700">
                                    ৳{expenses.reduce((s, ex) => s + ex.amount, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-auto pt-20 flex justify-between px-10">
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-[10px] font-bold uppercase">
                            Prepared By
                        </div>
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-[10px] font-bold uppercase">
                            Accounts Officer
                        </div>
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-[10px] font-bold uppercase text-[#800000]">
                            Authorized Signature
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
