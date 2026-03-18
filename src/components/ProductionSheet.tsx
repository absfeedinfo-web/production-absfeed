import { FormulaItem, Product, ProductionEntry, RawMaterial, UserRole } from "@/lib/types";
import {
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Download,
    Edit3,
    FileText,
    Info,
    Loader2,
    PackagePlus,
    Plus,
    Printer,
    Save,
    Search,
    Trash2,
    Truck,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface ProductionSheetProps {
    entries: ProductionEntry[];
    rawMaterials: RawMaterial[];
    products: Product[];
    onAddMaterial: (material: RawMaterial) => void;
    onAddProduct: (product: Product) => void;
    onAddEntry: (entry: ProductionEntry) => void;
    onUpdateEntry: (entry: ProductionEntry) => void;
    onDeleteEntry: (id: string) => void;
    productLoading: boolean;
    materialLoading: boolean;
    userRole: UserRole | null;
}

export const ProductionSheet: React.FC<ProductionSheetProps> = ({
    entries,
    rawMaterials,
    products,
    onAddMaterial,
    onAddProduct,
    onAddEntry,
    onUpdateEntry,
    onDeleteEntry,
    productLoading,
    materialLoading,
    userRole,
}) => {
    const formRef = useRef<HTMLDivElement>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState("");

    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [newProductData, setNewProductData] = useState({
        code: "",
        name: "",
        bagSize: 50,
    });

    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        batchNo: "",
        productCode: "",
        partyName: "",
        bags: 0,
        transportMill: 0,
        transportBuyerDepot: 0,
        bagCardCost: 0,
        millingCharge: 0,
        laborCost: 0,
        commission: 0,
        bakshish: 0,
        additionalCost: 0,
    });

    const [formula, setFormula] = useState<FormulaItem[]>([]);
    const [activePrintEntry, setActivePrintEntry] = useState<ProductionEntry | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const totalKgs = selectedProduct ? formData.bags * selectedProduct.bagSize : 0;

    const totalValue = useMemo(() => {
        const rawMaterialTotal = formula.reduce((sum, item) => sum + item.amount * item.price, 0);
        return (
            rawMaterialTotal +
            formData.transportMill +
            formData.transportBuyerDepot +
            formData.bagCardCost +
            formData.millingCharge +
            formData.laborCost +
            formData.commission +
            formData.bakshish +
            formData.additionalCost
        );
    }, [formula, formData]);

    const costPerKg = useMemo(() => {
        return totalKgs > 0 ? totalValue / totalKgs : 0;
    }, [totalValue, totalKgs]);

    const handleAddFormulaItem = () => {
        if (rawMaterials.length === 0) return;
        setFormula([...formula, { materialId: rawMaterials[0].id, amount: 0, price: 0 }]);
    };

    const handleAddNewMaterial = () => {
        if (!newMaterialName.trim()) return;
        const material: RawMaterial = {
            id: `rm-custom-${Date.now()}`,
            name: newMaterialName,
            unit: "kg",
        };
        onAddMaterial(material);
        setNewMaterialName("");
        setIsAddingMaterial(false);
    };

    const handleAddNewProduct = () => {
        if (!newProductData.code || !newProductData.name) return;
        const product: Product = {
            code: newProductData.code,
            name: newProductData.name,
            bagSize: newProductData.bagSize,
            protein: "N/A",
            category: "Poultry",
        };
        onAddProduct(product);
        setNewProductData({ code: "", name: "", bagSize: 50 });
        setIsAddingProduct(false);
    };

    const handleRemoveFormulaItem = (index: number) => {
        setFormula(formula.filter((_, i) => i !== index));
    };

    const handleUpdateFormulaItem = (index: number, key: keyof FormulaItem, value: any) => {
        const newFormula = [...formula];
        newFormula[index] = { ...newFormula[index], [key]: value };
        setFormula(newFormula);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({
            date: new Date().toISOString().split("T")[0],
            batchNo: "",
            productCode: "",
            partyName: "",
            bags: 0,
            transportMill: 0,
            transportBuyerDepot: 0,
            bagCardCost: 0,
            millingCharge: 0,
            laborCost: 0,
            commission: 0,
            bakshish: 0,
            additionalCost: 0,
        });
        setFormula([]);
    };

    const handleEdit = (entry: ProductionEntry) => {
        setEditId(entry.id);
        setFormData({
            date: entry.date,
            batchNo: entry.batchNo,
            productCode: entry.productCode,
            partyName: entry.partyName,
            bags: entry.bags,
            transportMill: entry.transportMill,
            transportBuyerDepot: entry.transportBuyerDepot,
            bagCardCost: entry.bagCardCost,
            millingCharge: entry.millingCharge || 0,
            laborCost: entry.laborCost || 0,
            commission: entry.commission || 0,
            bakshish: entry.bakshish || 0,
            additionalCost: entry.additionalCost,
        });
        setFormula([...entry.formula]);
        if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || saving) return;

        setSaving(true);

        try {
            const entryData: ProductionEntry = {
                id: editId || crypto.randomUUID(),
                batchNo: formData.batchNo,
                date: formData.date,
                productCode: formData.productCode,
                productName: selectedProduct.name,
                partyName: formData.partyName,
                bags: formData.bags,
                totalKgs,
                transportMill: formData.transportMill,
                transportBuyerDepot: formData.transportBuyerDepot,
                bagCardCost: formData.bagCardCost,
                millingCharge: formData.millingCharge,
                laborCost: formData.laborCost,
                commission: formData.commission,
                bakshish: formData.bakshish,
                additionalCost: formData.additionalCost,
                totalValue,
                formula,
                kgValue: costPerKg,
            };

            if (editId) {
                await onUpdateEntry(entryData);
            } else {
                await onAddEntry(entryData);
            }

            resetForm();
        } catch (error) {
            console.error("Submit failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePrintChallan = (entry: ProductionEntry) => {
        setActivePrintEntry(entry);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleExportCSV = () => {
        if (entries.length === 0) return;
        const headers = [
            "Date",
            "Batch No",
            "Product",
            "Code",
            "Party",
            "Bags",
            "Weight (KG)",
            "Per KG Rate",
            "Total Value",
        ];
        const rows = entries.map((e) => [
            e.date,
            e.batchNo,
            e.productName,
            e.productCode,
            e.partyName,
            e.bags,
            e.totalKgs,
            e.kgValue.toFixed(2),
            e.totalValue,
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8," + [headers, ...rows].map((r) => r.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `ABS_Production_History_${new Date().toLocaleDateString()}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (!formData.productCode || !products.length) return;

        const findProduct = products.find((p) => String(p.code) === String(formData.productCode));

        setSelectedProduct(findProduct);
    }, [formData.productCode, products]);

    return (
        <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
            {/* RIGHT SIDE: Entry Form or Visitor Banner */}
            {userRole === "visitor" ? (
                <section className="no-print w-full lg:w-[480px] bg-[#800000]/5 rounded-xl border-2 border-dashed border-[#800000]/20 p-12 text-center sticky top-24 flex flex-col items-center justify-center">
                    <Info className="text-[#800000]/40 mb-4" size={48} />
                    <h3 className="text-[#800000] font-black uppercase tracking-widest text-lg">
                        Visitor Mode
                    </h3>
                    <p className="text-stone-500 text-xs mt-2 font-medium">
                        You have view-only access. Addition and editing are disabled.
                    </p>
                </section>
            ) : (
                <section
                    ref={formRef}
                    className="no-print w-full lg:w-[480px] bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden sticky top-24"
                >
                    <div
                        className={`${editId ? "bg-orange-600" : "bg-[#800000]"} px-6 py-3 border-b border-black/10 flex justify-between items-center`}
                    >
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {editId ? (
                                <Edit3 size={18} />
                            ) : (
                                <Plus className="text-orange-300" size={18} />
                            )}
                            {editId ? "উৎপাদন ডাটা আপডেট করুন" : "নতুন উৎপাদন এন্ট্রি"}
                        </h3>
                        {editId && (
                            <button
                                onClick={resetForm}
                                className="text-white hover:bg-white/10 p-1 rounded-md text-xs font-bold flex items-center gap-1"
                            >
                                <X size={14} /> বাতিল
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase">
                                    তারিখ
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#800000] outline-none"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase">
                                    ব্যাচ নং
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#800000] outline-none font-bold"
                                    value={formData.batchNo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, batchNo: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* New Product Entry */}
                        <div className="space-y-1 relative">
                            <label className="text-[10px] font-black text-stone-500 uppercase flex justify-between">
                                প্রোডাক্ট কোড
                                <button
                                    type="button"
                                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                                    className="text-[#800000] hover:underline flex items-center gap-0.5"
                                >
                                    <PackagePlus size={10} /> নতুন প্রোডাক্ট
                                </button>
                            </label>
                            {isAddingProduct ? (
                                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-3 mb-2 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="কোড"
                                            className="text-xs p-2 border border-stone-300 rounded"
                                            value={newProductData.code}
                                            onChange={(e) =>
                                                setNewProductData({
                                                    ...newProductData,
                                                    code: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            type="number"
                                            placeholder="সাইজ (KG)"
                                            className="text-xs p-2 border border-stone-300 rounded"
                                            value={newProductData.bagSize}
                                            onChange={(e) =>
                                                setNewProductData({
                                                    ...newProductData,
                                                    bagSize: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="পণ্যের নাম"
                                        className="w-full text-xs p-2 border border-stone-300 rounded"
                                        value={newProductData.name}
                                        onChange={(e) =>
                                            setNewProductData({
                                                ...newProductData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAddNewProduct}
                                            className="flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded font-bold"
                                        >
                                            সেভ করুন
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingProduct(false)}
                                            className="px-3 bg-stone-300 text-xs py-1.5 rounded"
                                        >
                                            বাতিল
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-stone-300 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-[#800000] outline-none font-bold"
                                    placeholder="511, 620..."
                                    value={formData.productCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, productCode: e.target.value })
                                    }
                                />
                                <Search
                                    className="absolute left-3 top-2 text-stone-400"
                                    size={16}
                                />
                                {productLoading && (
                                    <Loader2 className="absolute right-3 top-2 text-gray-400 animate-spin size-4" />
                                )}
                            </div>
                            {selectedProduct && (
                                <div className="text-[10px] font-bold text-[#800000] mt-1 italic">
                                    {selectedProduct.name} ({selectedProduct.bagSize} KG)
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-stone-500 uppercase">
                                পার্টি/মিল নাম
                            </label>
                            <input
                                type="text"
                                className="w-full border border-stone-300 rounded-lg px-3 py-1.5 text-sm outline-none"
                                placeholder="পার্টি নাম"
                                value={formData.partyName}
                                onChange={(e) =>
                                    setFormData({ ...formData, partyName: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-500 uppercase">
                                    ব্যাগ সংখ্যা
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full border border-stone-300 rounded-lg px-3 py-1 text-base font-black outline-none"
                                    value={formData.bags || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, bags: Number(e.target.value) })
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-stone-500 uppercase">
                                    মোট ওজন
                                </label>
                                <div className="text-base font-black py-1">
                                    {totalKgs.toLocaleString()}{" "}
                                    <span className="text-[10px] text-stone-400">KG</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                            <h4 className="text-[10px] font-black text-orange-800 uppercase flex items-center gap-1 border-b border-orange-200 pb-1 mb-2">
                                <Truck size={12} /> পরিবহন ও অন্যান্য চার্জ
                            </h4>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        পরিবহন (মিল)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.transportMill || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                transportMill: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        পরিবহন (ক্রেতা/ডিপো)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.transportBuyerDepot || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                transportBuyerDepot: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        ব্যাগ/কার্ড খরচ
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.bagCardCost || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                bagCardCost: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        মিলিং চার্জ/কন্টাক
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.millingCharge || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                millingCharge: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        লেবার (Labor)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.laborCost || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                laborCost: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        কমিশন (Comm.)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.commission || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                commission: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        বকশিস (Tips)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.bakshish || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                bakshish: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-orange-600 uppercase">
                                        অতিরিক্ত খরচ
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-orange-200 rounded px-2 py-1 text-xs font-bold outline-none"
                                        value={formData.additionalCost || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                additionalCost: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-stone-100">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-[#800000] uppercase">
                                    কাঁচামাল ও ফরমূলা
                                </h4>
                                <div className="flex gap-1">
                                    {isAddingMaterial ? (
                                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded">
                                            <input
                                                type="text"
                                                placeholder="নাম"
                                                className="text-[10px] w-20 px-1 py-1 border border-stone-300 rounded"
                                                value={newMaterialName}
                                                onChange={(e) => setNewMaterialName(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddNewMaterial}
                                                className="bg-emerald-600 text-white p-1 rounded"
                                            >
                                                <Plus size={10} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingMaterial(false)}
                                                className="bg-stone-400 text-white p-1 rounded"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingMaterial(true)}
                                            className="text-[9px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold"
                                        >
                                            + কাঁচামাল
                                        </button>
                                    )}
                                    <button
                                        disabled={materialLoading}
                                        type="button"
                                        onClick={handleAddFormulaItem}
                                        className="text-[9px] bg-stone-800 text-white px-2 py-1 rounded font-bold disabled:opacity-40"
                                    >
                                        {materialLoading ? (
                                            <Loader2 className="size-2 animate-spin" />
                                        ) : (
                                            "+ ফরমূলা আইটেম"
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[250px] overflow-auto pr-1 custom-scrollbar">
                                {formula.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-stone-50 p-2 rounded-lg border border-stone-200 relative group flex flex-col gap-2"
                                    >
                                        <select
                                            className="w-full text-[10px] font-bold text-[#800000] border-b border-stone-200 bg-transparent outline-none pb-1"
                                            value={item.materialId}
                                            onChange={(e) =>
                                                handleUpdateFormulaItem(
                                                    index,
                                                    "materialId",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {rawMaterials.map((rm) => (
                                                <option key={rm.id} value={rm.id}>
                                                    {rm.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="KG"
                                                className="flex-1 text-[10px] p-1.5 border border-stone-200 bg-white rounded font-bold"
                                                value={item.amount || ""}
                                                onChange={(e) =>
                                                    handleUpdateFormulaItem(
                                                        index,
                                                        "amount",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <input
                                                type="number"
                                                placeholder="৳/KG"
                                                className="flex-1 text-[10px] p-1.5 border border-stone-200 bg-emerald-50 rounded font-bold text-emerald-700"
                                                value={item.price || ""}
                                                onChange={(e) =>
                                                    handleUpdateFormulaItem(
                                                        index,
                                                        "price",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFormulaItem(index)}
                                            className="absolute top-1 right-1 text-red-500 hover:bg-red-50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-200">
                            <div className="flex justify-between items-center mb-4 p-3 bg-[#800000] text-white rounded-xl shadow-lg">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase opacity-70">
                                        কেজি দর
                                    </span>
                                    <span className="text-sm font-black italic">
                                        ৳{costPerKg.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold uppercase opacity-70">
                                        সর্বমোট ভ্যালু
                                    </span>
                                    <span className="text-lg font-black italic">
                                        ৳{totalValue.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedProduct || saving}
                                className={`${editId ? "bg-orange-600 hover:bg-orange-700" : "bg-[#800000] hover:bg-black"} w-full text-white font-black py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50`}
                            >
                                <Save size={20} />{" "}
                                {saving ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : editId ? (
                                    "আপডেট করুন"
                                ) : (
                                    "সেভ করুন"
                                )}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* LEFT SIDE: History List */}
            <section className="flex-1 w-full no-print">
                <div className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden mb-8">
                    <div className="bg-[#800000] text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-[#a00000] gap-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="opacity-50" />
                            <h3 className="text-lg font-bold uppercase tracking-tight">
                                Production History
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportCSV}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all shadow-md"
                            >
                                <Download size={14} /> EXCEL
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all shadow-md"
                            >
                                <Printer size={14} /> A4 HISTORY
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-stone-50 text-[10px] uppercase text-stone-600 font-black tracking-widest border-b border-stone-200">
                                <tr>
                                    <th className="px-4 py-4">Date</th>
                                    <th className="px-4 py-4">Batch Info</th>
                                    <th className="px-4 py-4">Product</th>
                                    <th className="px-4 py-4 text-center">Bags</th>
                                    <th className="px-4 py-4 text-center">KG Rate</th>
                                    <th className="px-4 py-4 text-right pr-6">Total Value</th>
                                    <th className="px-4 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {entries?.map((entry) => (
                                    <React.Fragment key={entry.id}>
                                        <tr
                                            className={`hover:bg-stone-50 border-b border-stone-100 transition-colors ${expandedId === entry.id ? "bg-red-50/30" : ""}`}
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap text-stone-500 font-medium">
                                                {entry.date}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-black text-stone-600">
                                                    {entry.batchNo}
                                                </div>
                                                <div className="text-[9px] text-stone-400">
                                                    {entry.partyName || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-black text-[#800000]">
                                                    {entry.productName}
                                                </div>
                                                <div className="text-[9px] text-stone-400 uppercase">
                                                    Code: {entry.productCode}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="font-bold">{entry.bags}</div>
                                                <div className="text-[9px] text-stone-400">
                                                    {entry.totalKgs.toLocaleString()} KG
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-emerald-600">
                                                ৳{entry.kgValue?.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right pr-6 font-black text-emerald-700">
                                                ৳{entry.totalValue.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedId(
                                                                expandedId === entry.id
                                                                    ? null
                                                                    : entry.id,
                                                            )
                                                        }
                                                        className={`p-1.5 rounded ${expandedId === entry.id ? "bg-[#800000] text-white" : "bg-stone-100 text-stone-600"}`}
                                                    >
                                                        {expandedId === entry.id ? (
                                                            <ChevronUp size={14} />
                                                        ) : (
                                                            <ChevronDown size={14} />
                                                        )}
                                                    </button>
                                                    {userRole === "admin" && (
                                                        <>
                                                            {" "}
                                                            <button
                                                                onClick={() => handleEdit(entry)}
                                                                className="p-1.5 rounded bg-stone-100 text-stone-600 hover:bg-orange-100"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    onDeleteEntry(entry.id)
                                                                }
                                                                className="p-1.5 rounded bg-stone-100 text-stone-600 hover:bg-red-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handlePrintChallan(entry)}
                                                        className="p-1.5 rounded border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white transition-colors"
                                                    >
                                                        <Printer size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === entry.id && (
                                            <tr className="bg-white border-b-2 border-[#800000]/20 animate-in slide-in-from-left duration-300">
                                                <td colSpan={7} className="px-8 py-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="text-xs font-black text-[#800000] uppercase mb-4 flex items-center gap-2">
                                                                <FileText size={16} /> Formula
                                                                Details
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {entry.formula.map((f, i) => {
                                                                    const mat = rawMaterials.find(
                                                                        (rm) =>
                                                                            rm.id === f.materialId,
                                                                    );
                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className="flex justify-between items-center text-xs p-2 bg-stone-50 rounded-lg border border-stone-100"
                                                                        >
                                                                            <span className="font-bold text-stone-600">
                                                                                {mat?.name}
                                                                            </span>
                                                                            <div className="text-right">
                                                                                <span className="font-black">
                                                                                    {f.amount} KG
                                                                                </span>
                                                                                <span className="mx-2 text-stone-300">
                                                                                    @
                                                                                </span>
                                                                                <span className="text-emerald-700 font-bold">
                                                                                    ৳{f.price}
                                                                                </span>
                                                                                <span className="ml-3 font-black text-stone-900">
                                                                                    = ৳
                                                                                    {(
                                                                                        f.amount *
                                                                                        f.price
                                                                                    ).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-black text-orange-800 uppercase mb-4 flex items-center gap-2">
                                                                <Truck size={16} /> Cost Breakdown
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        পরিবহন (মিল)
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {entry.transportMill.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        পরিবহন (ক্রেতা/ডিপো)
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {entry.transportBuyerDepot.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        ব্যাগ/কার্ড
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {entry.bagCardCost.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">
                                                                        মিলিং চার্জ/কন্টাক
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {(
                                                                            entry.millingCharge || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        লেবার খরচ
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {(
                                                                            entry.laborCost || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        কমিশন
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {(
                                                                            entry.commission || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-tight">
                                                                        বকশিস
                                                                    </p>
                                                                    <p className="text-sm font-black">
                                                                        ৳
                                                                        {(
                                                                            entry.bakshish || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="p-3 bg-orange-100/50 rounded-lg border border-orange-200">
                                                                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-tight">
                                                                        অতিরিক্ত খরচ
                                                                    </p>
                                                                    <p className="text-sm font-black text-orange-800">
                                                                        ৳
                                                                        {entry.additionalCost.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FULL HISTORY PRINTABLE VIEW (A4) */}
            <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999] p-8">
                <div className="max-w-[1000px] mx-auto text-stone-900 flex flex-col">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-[#800000]">
                            ABS FEED INDUSTRIES LTD.
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-stone-600">
                            এবিএস ফিড ইন্ডাস্ট্রিজ লিমিটেড
                        </p>
                        <div className="h-1 bg-[#800000] w-full my-3"></div>
                        <h2 className="text-xl font-black uppercase underline">
                            Production Summary Report
                        </h2>
                        <p className="text-xs mt-2">
                            Report Date: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <table className="w-full border-collapse border-2 border-stone-900 text-xs">
                        <thead className="bg-stone-100">
                            <tr>
                                <th className="border border-stone-900 p-2">Date</th>
                                <th className="border border-stone-900 p-2">Batch No</th>
                                <th className="border border-stone-900 p-2 text-left">Product</th>
                                <th className="border border-stone-900 p-2">Bags</th>
                                <th className="border border-stone-900 p-2">Weight (KG)</th>
                                <th className="border border-stone-900 p-2 text-right">
                                    Batch Value (৳)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e) => (
                                <tr key={e.id} style={{ pageBreakInside: "avoid" }}>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {e.date}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-center font-bold">
                                        {e.batchNo}
                                    </td>
                                    <td className="border border-stone-900 p-2">
                                        {e.productName} ({e.productCode})
                                    </td>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {e.bags}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-center">
                                        {e.totalKgs.toLocaleString()}
                                    </td>
                                    <td className="border border-stone-900 p-2 text-right font-bold">
                                        ৳{e.totalValue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-stone-50 font-black">
                            <tr>
                                <td
                                    colSpan={3}
                                    className="border border-stone-900 p-2 text-right uppercase"
                                >
                                    Grand Total:
                                </td>
                                <td className="border border-stone-900 p-2 text-center">
                                    {entries.reduce((s, e) => s + e.bags, 0)}
                                </td>
                                <td className="border border-stone-900 p-2 text-center">
                                    {entries.reduce((s, e) => s + e.totalKgs, 0).toLocaleString()}
                                </td>
                                <td className="border border-stone-900 p-2 text-right text-lg text-[#800000]">
                                    ৳
                                    {entries.reduce((s, e) => s + e.totalValue, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-auto pt-20 flex justify-between px-10">
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-xs font-bold uppercase">
                            Prepared By
                        </div>
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-xs font-bold uppercase">
                            Accounts Officer
                        </div>
                        <div className="border-t border-stone-900 pt-2 w-48 text-center text-xs font-bold uppercase text-[#800000]">
                            Authorized Signature
                        </div>
                    </div>
                </div>
            </div>

            {/* SINGLE CHALLAN PRINT VIEW */}
            {activePrintEntry && (
                <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[10000]">
                    <div className="max-w-[850px] mx-auto p-12 text-stone-900 leading-tight min-h-[297mm] flex flex-col">
                        <div className="border-[3px] border-[#800000] p-8 flex flex-col">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-black text-[#800000]">
                                    ABS FEED INDUSTRIES LTD.
                                </h1>
                                <p className="text-xs font-bold uppercase tracking-widest">
                                    এবিএস ফিড ইন্ডাস্ট্রিজ লিমিটেড
                                </p>
                                <div className="h-1 bg-[#800000] w-full my-3"></div>
                                <div className="mt-6 bg-[#800000] text-white py-2 px-14 inline-block font-black text-xl rounded shadow-lg uppercase">
                                    Delivery Challan
                                </div>

                                <div className="flex justify-between items-end mt-8 text-sm">
                                    <div className="text-left font-bold space-y-1">
                                        <p>
                                            Party Name:{" "}
                                            <span className="border-b border-stone-800 px-2">
                                                {activePrintEntry.partyName || "---"}
                                            </span>
                                        </p>
                                        <p>
                                            Product:{" "}
                                            <span className="border-b border-stone-800 px-2">
                                                {activePrintEntry.productName}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right font-bold space-y-1">
                                        <p>Date: {activePrintEntry.date}</p>
                                        <p>
                                            Batch No:{" "}
                                            <span className="text-[#800000]">
                                                {activePrintEntry.batchNo}
                                            </span>
                                        </p>
                                        <p>
                                            Bags: {activePrintEntry.bags} | Weight:{" "}
                                            {activePrintEntry.totalKgs} KG
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full border-collapse border-2 border-stone-900 text-[11px]">
                                <thead>
                                    <tr className="bg-stone-100">
                                        <th className="border-2 border-stone-900 p-2 text-left">
                                            Description (Raw Material)
                                        </th>
                                        <th className="border-2 border-stone-900 p-2 w-24">
                                            Amount (KG)
                                        </th>
                                        <th className="border-2 border-stone-900 p-2 w-24 text-right">
                                            Total (৳)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activePrintEntry.formula.map((f, idx) => {
                                        const mat = rawMaterials.find(
                                            (rm) => rm.id === f.materialId,
                                        );
                                        return (
                                            <tr key={idx}>
                                                <td className="border-2 border-stone-900 px-3 py-1 font-bold">
                                                    {mat?.name}
                                                </td>
                                                <td className="border-2 border-stone-900 text-center">
                                                    {f.amount.toLocaleString()}
                                                </td>
                                                <td className="border-2 border-stone-900 text-right px-3 font-black">
                                                    ৳{(f.amount * f.price).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-stone-50 font-bold">
                                        <td
                                            colSpan={2}
                                            className="border-2 border-stone-900 px-4 py-1 text-right uppercase text-[9px]"
                                        >
                                            Transports, Bags, Labor & Commission:
                                        </td>
                                        <td className="border-2 border-stone-900 text-right px-3 font-black">
                                            ৳
                                            {(
                                                activePrintEntry.transportMill +
                                                activePrintEntry.transportBuyerDepot +
                                                activePrintEntry.bagCardCost +
                                                activePrintEntry.millingCharge +
                                                (activePrintEntry.laborCost || 0) +
                                                (activePrintEntry.commission || 0) +
                                                (activePrintEntry.bakshish || 0) +
                                                activePrintEntry.additionalCost
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr className="h-12 bg-[#800000] text-white">
                                        <td
                                            colSpan={2}
                                            className="border-2 border-stone-900 text-right pr-8 font-black text-2xl italic uppercase text-lg"
                                        >
                                            Grand Total =
                                        </td>
                                        <td className="border-2 border-stone-900 text-right px-3 font-black text-xl">
                                            ৳{activePrintEntry.totalValue.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-auto pt-24 flex justify-between px-4">
                                <div className="w-[280px] border-t-2 border-stone-900 pt-3 text-center text-sm font-black uppercase">
                                    Receiver's Signature
                                </div>
                                <div className="w-[280px] border-t-2 border-stone-900 pt-3 text-center text-sm font-black text-[#800000] uppercase">
                                    Authorized Signature
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
