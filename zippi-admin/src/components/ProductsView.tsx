import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle, 
  EyeOff,
  Eye,
  X,
  PackageCheck,
  Upload,
  Download,
  Check,
  Loader2,
  Image as ImageIcon,
  Copy,
  Info
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Product } from "../types";
import { uploadProductImage, getSupabaseClient } from "../lib/supabase";

export const ProductsView: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = usePortal();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination State (20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Form State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formBasePrice, setFormBasePrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formWeightUnit, setFormWeightUnit] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  
  // Toggles
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsFlashDeal, setFormIsFlashDeal] = useState(false);

  // Image Uploading States
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Import States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Notification Banner State
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-calculated discount percent
  const calculatedDiscount = (() => {
    const base = parseFloat(formBasePrice) || 0;
    const sale = parseFloat(formSalePrice) || 0;
    if (base > 0 && sale > 0 && sale < base) {
      return Math.round(((base - sale) / base) * 100);
    }
    return 0;
  })();

  // Reset page when search or filters update
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Show status feedback banners temporarily
  const triggerFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Handle Opening Form for Add
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSku(`ZK-CH-${Math.floor(10 + Math.random() * 90)}`);
    setFormDescription("");
    setFormBrand("");
    setFormCategoryId(categories[0]?.id || "");
    setFormBasePrice("");
    setFormSalePrice("");
    setFormStock("50");
    setFormWeightUnit("500g");
    setFormImages([
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=640"
    ]);
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormIsFlashDeal(false);
    
    setIsModalOpen(true);
  };

  // Handle Opening Form for Edit
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSku(prod.sku);
    setFormDescription(prod.description || "");
    setFormBrand(prod.brand || "");
    setFormCategoryId(prod.categoryId);
    
    // Support previous pricing model safely
    if (prod.comparePrice) {
      setFormBasePrice(prod.comparePrice.toString());
      setFormSalePrice(prod.price.toString());
    } else {
      setFormBasePrice(prod.price.toString());
      setFormSalePrice("");
    }

    setFormStock(prod.stock.toString());
    setFormWeightUnit(prod.weightUnit || "500g");
    
    // Support multiple images fallback
    if (prod.images && prod.images.length > 0) {
      setFormImages(prod.images);
    } else {
      setFormImages([prod.image]);
    }

    setFormIsActive(prod.status === "Active");
    setFormIsFeatured(!!prod.isFeatured);
    setFormIsFlashDeal(!!prod.isFlashDeal);
    
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBasePrice || !formCategoryId) {
      triggerFeedback("Please fulfill all mandated parameters.", "error");
      return;
    }

    const base = parseFloat(formBasePrice);
    const sale = formSalePrice ? parseFloat(formSalePrice) : undefined;
    const stockQty = parseInt(formStock, 10) || 0;

    // Determine final selling price (Sale Price if set, otherwise Base Price)
    const finalPrice = sale && sale > 0 ? sale : base;
    const finalComparePrice = sale && sale > 0 ? base : undefined;

    // Determine active status label based on stock and active checkbox
    let finalStatus: "Active" | "Out of Stock" | "Draft" = "Draft";
    if (formIsActive) {
      finalStatus = stockQty === 0 ? "Out of Stock" : "Active";
    }

    const payload = {
      name: formName,
      sku: formSku,
      price: finalPrice,
      comparePrice: finalComparePrice,
      categoryId: formCategoryId,
      image: formImages[0] || "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=640",
      images: formImages,
      stock: stockQty,
      status: finalStatus,
      description: formDescription,
      brand: formBrand,
      discountPercentage: calculatedDiscount || undefined,
      weightUnit: formWeightUnit,
      isFeatured: formIsFeatured,
      isFlashDeal: formIsFlashDeal
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...payload
      });
      triggerFeedback(`Successfully modified "${formName}" entry!`);
    } else {
      addProduct(payload);
      triggerFeedback(`Successfully introduced "${formName}" into catalog!`);
    }

    setIsModalOpen(false);
  };

  // Handle Drag Events for Image Drop Zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  // Async multiple files processor
  const uploadFiles = async (filesList: FileList) => {
    const currentImagesCount = formImages.length;
    const filesToUpload = Array.from(filesList).slice(0, 5 - currentImagesCount);

    if (filesToUpload.length === 0) {
      triggerFeedback("A maximum of 5 images are permitted per food product item.", "error");
      return;
    }

    setUploadingFiles(filesToUpload.map(f => ({ name: f.name, progress: 10 })));

    for (let i = 0; i < filesToUpload.length; i++) {
      const targetFile = filesToUpload[i];
      try {
        // Callback updates real-time progress inside state
        const res = await uploadProductImage(targetFile, (prog) => {
          setUploadingFiles(prev => prev.map(uf => uf.name === targetFile.name ? { ...uf, progress: prog } : uf));
        });

        setFormImages(prev => [...prev, res.url].slice(0, 5));
        
        if (res.isFallback) {
          triggerFeedback("Successfully saved locally! Configure Supabase credentials to upload to Cloud storage.", "success");
        } else {
          triggerFeedback(`Successfully uploaded "${targetFile.name}" to Cloud Storage!`, "success");
        }
      } catch (err: any) {
        triggerFeedback(`Upload failed for "${targetFile.name}": ${err.message || 'Error'}`, "error");
      }
    }

    // Done uploading
    setUploadingFiles([]);
  };

  // Remove individual image from array index
  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Copy raw image URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerFeedback("Image URL copied to clipboard!", "success");
  };

  // Filter list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || "Uncategorized";
  };

  const formatLKR = (val: number) => {
    return `Rs. ${val.toLocaleString()}`;
  };

  // ════════════════════════════════
  // CSV BULK IMPORT CORE OPERATIONS
  // ════════════════════════════════

  // Generate blank template as structured CSV
  const downloadCsvTemplate = () => {
    const headers = [
      "name",
      "sku",
      "categoryName",
      "price",
      "comparePrice",
      "stock",
      "description",
      "brand",
      "weightUnit",
      "status"
    ].join(",");

    const sampleRow = [
      `"Premium Cheese Kottu Double"`,
      `"ZK-CH-77"`,
      `"Authentic Sri Lankan Kottu"`,
      `"1450"`,
      `"1650"`,
      `"60"`,
      `"Creamy dual layered cheddar kottu tossed in spicy local roasted curry spices"`,
      `"Zippi Hub"`,
      `"650g"`,
      `"Active"`
    ].join(",");

    const sampleRow2 = [
      `"Saffron String Hopper Biryani"`,
      `"ZB-SH-88"`,
      `"Biryani & Rice Delight"`,
      `"1200"`,
      `""`,
      `"15"`,
      `"Mouth watering steamed rice flour noodle layers garnished in cashews and cardamom"`,
      `"Zippi Biryani"`,
      `"500g"`,
      `"Active"`
    ].join(",");

    const csvContent = `${headers}\n${sampleRow}\n${sampleRow2}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "zippi_products_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerFeedback("Product CSV Import template downloaded!");
  };

  // CSV Client side reader and parser
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCsvFile(e.target.files[0]);
    }
  };

  const processCsvFile = (file: File) => {
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length === 0) {
        triggerFeedback("The uploaded CSV appears empty.", "error");
        return;
      }

      // Read columns
      const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
      const parsedRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom comma splitter that respects double-quotes strings
        const values: string[] = [];
        let currentField = "";
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentField.trim().replace(/^["']|["']$/g, ""));
            currentField = "";
          } else {
            currentField += char;
          }
        }
        values.push(currentField.trim().replace(/^["']|["']$/g, ""));

        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] !== undefined ? values[index] : "";
        });

        // Generate a temporary ID so user can deselect/toggle individual rows
        rowObj._importId = `tmp_${Date.now()}_${i}`;
        rowObj._selected = true; // Selected for import by default

        // Map Category Name to matched Category ID in state, or default first
        const categoryNameInput = rowObj.categoryName || "";
        const matchedCat = categories.find(
          c => c.name.toLowerCase().includes(categoryNameInput.toLowerCase()) || 
               categoryNameInput.toLowerCase().includes(c.name.toLowerCase())
        );
        rowObj._mappedCategoryId = matchedCat ? matchedCat.id : (categories[0]?.id || "");
        rowObj._mappedCategoryName = matchedCat ? matchedCat.name : `${categories[0]?.name || 'Uncategorized'} (Fallback)`;
        
        parsedRows.push(rowObj);
      }

      setCsvPreviewRows(parsedRows);
      triggerFeedback(`Successfully parsed ${parsedRows.length} meal rows! Review below.`);
    };

    reader.onerror = () => {
      triggerFeedback("Failing to read CSV file format.", "error");
    };

    reader.readAsText(file);
  };

  // Commit CSV rows to central product storage
  const handleConfirmBulkImport = () => {
    const activeSelectedRows = csvPreviewRows.filter(r => r._selected);
    if (activeSelectedRows.length === 0) {
      triggerFeedback("Please select at least one meal product row to import.", "error");
      return;
    }

    setImportProgress("Importing items...");

    // Simulate short processing cycle
    setTimeout(() => {
      activeSelectedRows.forEach((row) => {
        const price = parseFloat(row.price) || 0;
        const comparePrice = row.comparePrice ? parseFloat(row.comparePrice) : undefined;
        const stock = parseInt(row.stock, 10) || 0;

        const productPayload = {
          name: row.name || "Unnamed Premium Dish",
          sku: row.sku || `ZK-CH-${Math.floor(100 + Math.random() * 900)}`,
          price: price,
          comparePrice: comparePrice,
          categoryId: row._mappedCategoryId,
          image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=640",
          images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=640"],
          stock: stock,
          status: (row.status || "Active") as any,
          description: row.description || "Authentic freshly engineered meal package from Sri Lanka Colombo kitchen hub.",
          brand: row.brand || "Zippi",
          weightUnit: row.weightUnit || "450g",
          isFeatured: false,
          isFlashDeal: false
        };

        addProduct(productPayload);
      });

      setImportProgress(null);
      setIsImportModalOpen(false);
      setCsvPreviewRows([]);
      setCsvFile(null);
      triggerFeedback(`Successfully cataloged ${activeSelectedRows.length} menus from CSV sheet bulk upload!`);
    }, 850);
  };

  // Toggle CSV Row Selection
  const toggleCsvRowSelection = (id: string) => {
    setCsvPreviewRows(prev => prev.map(r => r._importId === id ? { ...r, _selected: !r._selected } : r));
  };

  // Toggle All CSV Rows Selection
  const areAllCsvRowsSelected = csvPreviewRows.every(r => r._selected);
  const toggleAllCsvRows = () => {
    const targetState = !areAllCsvRowsSelected;
    setCsvPreviewRows(prev => prev.map(r => ({ ...r, _selected: targetState })));
  };

  return (
    <div id="products-view" className="space-y-6">
      
      {/* Dynamic Action Feedback Alerts */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-bounce flex items-center gap-2 text-xs font-semibold ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
            : "bg-red-50 border-red-300 text-red-800"
        }`}>
          {feedbackMsg.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 1. MASTER CONTROL BAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-gray-900 leading-tight">Food Menu Catalog</h2>
          <p className="text-xs text-gray-400 mt-1">
            Displaying <span className="font-bold text-gray-600">{filteredProducts.length}</span> individual records tracked inside divisions
          </p>
        </div>

        {/* Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Template Download */}
          <button
            onClick={downloadCsvTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs rounded-lg cursor-pointer transition-all shadow-sm"
            title="Download blank CSV schema for quick edits"
          >
            <Download size={13} />
            <span>Schema CSV</span>
          </button>

          {/* Import CSV Modal Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-sm"
          >
            <Upload size={13} />
            <span>Import CSV</span>
          </button>

          {/* "+ Add Product" yellow button */}
          <button
            id="btn-add-product-modal"
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2 px-4 rounded-lg cursor-pointer shadow-sm transition-all animate-fade-in"
          >
            <Plus size={15} />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT SEARCH FILTERS CARD */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold" />
          <input
            id="input-product-search"
            type="text"
            placeholder="Search kottu, SKU, meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 pl-10 pr-4 rounded-lg outline-none text-gray-900 transition-all font-semibold"
          />
        </div>

        {/* Filters Select boxes */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter SELECT */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0">
            <Filter size={12} className="text-gray-400" />
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-gray-700 font-bold cursor-pointer"
            >
              <option value="all">All Food Fields</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status SELECT */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0">
            <PackageCheck size={12} className="text-gray-400" />
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-gray-700 font-bold cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Draft">Draft Mode</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN PRODUCTS DATABASE TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="products-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Image | Product & SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-right">Selling Price</th>
                <th className="py-4 px-4 text-center">Stock Limit</th>
                <th className="py-4 px-4 text-center">Duty Status</th>
                <th className="py-4 px-6 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 text-xs font-semibold">
                    No matching food products found in this branch catalog
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isLowStock = p.stock > 0 && p.stock < 10;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} id={`product-row-${p.id}`} className="hover:bg-gray-50/30 transition-colors group">
                       {/* Product Image + Details */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 shadow-xs relative">
                            <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                            {p.discountPercentage && p.discountPercentage > 0 ? (
                              <span className="absolute bottom-0 right-0 bg-amber-500 text-black text-[8px] font-extrabold px-1 py-0.2 rounded-tl-md">
                                -{p.discountPercentage}%
                              </span>
                            ) : null}
                          </div>
                          <div className="min-w-0 max-w-[280px]">
                            <div className="flex items-center gap-1.5">
                              <span className="block text-xs font-bold text-slate-900 truncate">{p.name}</span>
                              {p.weightUnit && (
                                <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.2 rounded-full shrink-0 font-medium font-mono">{p.weightUnit}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-mono">{p.sku}</span>
                              {p.brand && <span className="text-[9px] text-gray-400">• Brand: {p.brand}</span>}
                              {p.isFeatured && <span className="text-[9px] text-amber-600 bg-amber-50 px-1.2 py-0.2 rounded font-bold">★ Featured</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category field */}
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded border border-gray-150">
                          {getCategoryName(p.categoryId)}
                        </span>
                      </td>

                      {/* Pricing columns */}
                      <td className="py-3 px-4 text-right">
                        <div>
                          <span className="text-xs font-black text-slate-950 block">{formatLKR(p.price)}</span>
                          {p.comparePrice && (
                            <span className="text-[10px] text-gray-400 line-through block mt-0.5">{formatLKR(p.comparePrice)}</span>
                          )}
                        </div>
                      </td>

                      {/* Stock Level with trigger flags */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-extrabold ${isOut ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-900"} font-mono`}>
                            {p.stock} units
                          </span>
                          {isOut ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-red-600 bg-red-50/50 px-1.5 py-0.5 rounded-md mt-0.5 border border-red-200">
                              <AlertTriangle size={8} /> Sold Out
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50/50 px-1.5 py-0.5 rounded-md mt-0.5 border border-amber-200">
                              <TrendingDown size={8} /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded-md mt-0.5 border border-emerald-200">
                              <Check size={8} /> Sourced ok
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Label */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          p.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.status === "Draft"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {p.status === "Active" && <CheckCircle size={9} />}
                          {p.status === "Draft" && <EyeOff size={9} />}
                          {p.status === "Out of Stock" && <AlertTriangle size={9} />}
                          {p.status}
                        </span>
                      </td>

                      {/* Row operational settings (actions) */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-edit-product-${p.id}`}
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border border-gray-100"
                            title="Edit entry details"
                          >
                            <Edit size={13} className="text-slate-700" />
                          </button>
                          <button
                            id={`btn-delete-product-${p.id}`}
                            onClick={() => {
                              if (confirm(`Remove "${p.name}" from your food menu catalog?`)) {
                                deleteProduct(p.id);
                                triggerFeedback(`Successfully deleted "${p.name}"`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all cursor-pointer border border-gray-100"
                            title="Delete permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        <div className="bg-gray-50/50 p-4 border-t border-gray-150 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="text-xs text-gray-550 font-medium">
            Showing <span className="font-extrabold text-slate-900">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-extrabold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </span>{" "}
            of <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> menu items
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all transition-colors ${
                currentPage === 1 
                  ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" 
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer shadow-xs"
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                  currentPage === pageNum
                    ? "bg-[#F5C518] text-black border-[#F5C518]"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all transition-colors ${
                currentPage >= totalPages 
                  ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" 
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer shadow-xs"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          FULL SCREEN ADD / EDIT MODAL
          ════════════════════════════════ */}
      {isModalOpen && (
        <div 
          id="modal-product-form"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center"
        >
          <div className="bg-white w-full h-full md:h-[95vh] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white text-slate-900 shrink-0 sticky top-0 z-10">
              <div>
                <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest">Colombo Central Kitchen</span>
                <h3 className="font-display font-black text-lg text-slate-950 mt-0.5">
                  {editingProduct ? `Modify: ${editingProduct.name}` : "Launch New Culinary Display"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-black cursor-pointer p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT SECTION: MAIN DETAILS COLUMN (lg:col-span-7) */}
                <div className="space-y-5 lg:col-span-7">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Product Name *</label>
                    <input
                      id="form-product-name"
                      type="text"
                      required
                      placeholder="e.g. Seafood Cheese Kottu Double Large"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-950 font-semibold"
                    />
                  </div>

                  {/* Description field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description *</label>
                    <textarea
                      placeholder="Recount the ingredients, spiciness quotient, chef selections, and taste patterns of this gourmet meal..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-800 font-medium"
                    />
                  </div>

                  {/* SKU, Category & Brand Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SKU Number *</label>
                      <input
                        id="form-product-sku"
                        type="text"
                        required
                        placeholder="e.g. ZK-CH-01"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-900 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category *</label>
                      <select
                        id="form-product-category"
                        required
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand / Kitchen</label>
                      <input
                        type="text"
                        placeholder="e.g. Zippi Special"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Base Price, Sale Price & Auto Calculated Discount Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-150">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">Base Price LKR *</label>
                      <input
                        id="form-product-price"
                        type="number"
                        required
                        min="0"
                        placeholder="1200"
                        value={formBasePrice}
                        onChange={(e) => setFormBasePrice(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-900 font-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sale Price LKR (opt)</label>
                      <input
                        id="form-product-compare"
                        type="number"
                        min="0"
                        placeholder="950"
                        value={formSalePrice}
                        onChange={(e) => setFormSalePrice(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-900 font-bold"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Discount %</span>
                      <div className="bg-white border border-gray-200 text-xs py-2.5 px-3 rounded-lg flex items-center justify-between text-slate-500 font-bold h-[38px]">
                        <span>Auto Math:</span>
                        {calculatedDiscount > 0 ? (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-md font-black shrink-0">
                            Save {calculatedDiscount}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">No discount</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Quantity & Weight/Unit Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="flex items-center gap-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Stock Quantity *</label>
                        <Info size={11} className="text-slate-400 mb-1.5 cursor-help" title="Input the initial count. If 0 items, status maps to Out of Stock dynamically." />
                      </span>
                      <input
                        id="form-product-stock"
                        type="number"
                        min="0"
                        required
                        placeholder="50"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-950 font-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Weight / Unit Label *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 500g, 1L, 6pcs"
                        value={formWeightUnit}
                        onChange={(e) => setFormWeightUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-900 font-bold"
                      />
                      {/* Suggestion pills */}
                      <div className="flex gap-1 mt-1.5 w-full overflow-x-auto whitespace-nowrap py-1">
                        {["250g", "500g", "1kg", "1L", "6pcs", "12pcs"].map(unit => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setFormWeightUnit(unit)}
                            className="bg-slate-100 hover:bg-slate-200 hover:text-black py-0.5 px-2 rounded text-[10px] font-semibold text-slate-500 transition-colors pointer-cursor"
                          >
                            + {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FORM VIEW CONTROLLER TOGGLES */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Display Controls & Targets</h4>
                    
                    {/* Active Toggle (Show in app) */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-xs text-slate-950">Active Status</span>
                        <span className="block text-[10px] text-gray-400">Allow customers to view and order this item on live mobile apps</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          formIsActive ? "bg-[#F5C518] text-black" : "bg-gray-200"
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          formIsActive ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Featured Toggle (Show on home) */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-xs text-slate-950">⭐ Featured Meal Banner</span>
                        <span className="block text-[10px] text-gray-400">Position directly on the home page curated premium sections</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsFeatured(!formIsFeatured)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          formIsFeatured ? "bg-[#F5C518] text-black" : "bg-gray-200"
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          formIsFeatured ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Flash Deal Toggle (Show in flash section) */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-xs text-slate-950">⚡ Flash Discount Deal</span>
                        <span className="block text-[10px] text-gray-400">Bind in high volume flash sales sections with custom ticking timers</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormIsFlashDeal(!formIsFlashDeal)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          formIsFlashDeal ? "bg-[#F5C518] text-black" : "bg-gray-200"
                        }`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                          formIsFlashDeal ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                  </div>

                </div>

                {/* RIGHT COLUMN: PREMIUM IMAGE DRAG ZONE & URL TRACKER (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Image Upload Zone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Visual Media Assets ({formImages.length}/5 max) *
                    </label>

                    {/* Drag and drop wrapper */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-h-[160px] ${
                        dragOver 
                          ? "border-[#F5C518] bg-[#F5C518]/5 scale-102"
                          : "border-gray-300 hover:border-[#F5C518] hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        id="form-product-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <ImageIcon className="text-gray-400 mb-3" size={32} />
                      <span className="block text-xs font-bold text-slate-800">Drag & drop product images, or click</span>
                      <span className="block text-[10px] text-gray-400 mt-1">Multi file selector up to 5 (PNG, JPG accepted)</span>
                      
                      {!getSupabaseClient() && (
                        <span className="inline-block mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          ⚠️ LOCAL PERSISTENCE ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Uploading progress bars list */}
                  {uploadingFiles.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block">Uploading Files...</span>
                      {uploadingFiles.map((uf, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-650 font-bold truncate">
                            <span>{uf.name}</span>
                            <span>{uf.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div style={{ width: `${uf.progress}%` }} className="bg-[#F5C518] h-1 rounded-full transition-all duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Thumbnails Gallery */}
                  {formImages.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Images Gallery</span>
                      
                      <div className="grid grid-cols-5 gap-2.5">
                        {formImages.map((imgUrl, index) => (
                          <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-gray-200 relative group shrink-0">
                            <img src={imgUrl} alt="Thumbnail representation" className="w-full h-full object-cover" />
                            
                            {/* Remove image */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-0.5 rounded-full cursor-pointer transition-colors"
                              title="Discard this media banner"
                            >
                              <X size={10} />
                            </button>
                            
                            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] px-1 py-0.2 rounded font-mono select-none">
                              #{index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show product Image URLs after upload */}
                  {formImages.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-550 block">Cloud Storage Resource URLs</span>
                        <span className="text-[8px] text-gray-400">Click icon to quickly copy</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {formImages.map((imgUrl, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center">
                            <span className="text-[10px] font-bold text-[#F5C518] bg-[#F5C518]/10 w-5 h-5 rounded flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              readOnly
                              value={imgUrl}
                              className="bg-white border select-all border-gray-200 text-[10px] text-gray-500 font-mono py-1 px-2 rounded-lg outline-none flex-1 truncate"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(imgUrl)}
                              className="p-1 px-1.5 border border-gray-200 bg-white hover:bg-gray-100 rounded hover:text-black transition-colors shrink-0 text-slate-650"
                              title="Copy raw path string"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supabase Connection Setup Guidelines */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 flex items-center gap-1">
                      <Info size={11} /> Cloud Storage Guidelines
                    </span>
                    <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
                      To persist meal photos dynamically in a production Cloud Storage bucket:
                    </p>
                    <ol className="list-decimal pl-4 text-[10px] text-amber-950 space-y-1 font-medium">
                      <li>Obtain a Supabase database project reference.</li>
                      <li>Configure a public storage bucket named <code className="bg-white border border-amber-200 px-1 py-0.2 rounded font-bold">products</code>.</li>
                      <li>Set <code className="bg-white border border-amber-200 px-1 py-0.2 rounded font-bold">VITE_SUPABASE_URL</code> and <code className="bg-white border border-amber-200 px-1 py-0.2 rounded font-bold">VITE_SUPABASE_ANON_KEY</code> inside application secrets.</li>
                    </ol>
                  </div>

                </div>

              </div>
              
              {/* Cover Image fallback hidden parameter (maps to existing structural expectations) */}
              <input 
                id="form-product-image"
                type="hidden" 
                value={formImages[0] || ""} 
              />

              {/* Fixed form submit footer */}
              <div className="flex gap-3 justify-end pt-5 border-t border-gray-150 mt-6 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-extrabold text-xs rounded-lg transition-all cursor-pointer border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-product-form"
                  type="submit"
                  className="px-6 py-2.5 bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                >
                  {editingProduct ? "Save Changes" : "Create Product Panel"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ════════════════════════════════
          CSV BULK IMPORT DRAWER / MODAL
          ════════════════════════════════ */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in relative border border-gray-205">
            
            {/* CSV Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between text-slate-900 bg-gray-50/50">
              <div>
                <h3 className="font-display font-black text-base text-slate-950">Bulk Import via CSV Sheet</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Quickly construct menus in bulk using Excel/CSV templates</p>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setCsvPreviewRows([]);
                  setCsvFile(null);
                }} 
                className="text-gray-400 hover:text-black cursor-pointer p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* CSV Modal Content Body */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">

              {/* Upload & Info Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Drag and drop zone */}
                <div className="md:col-span-7">
                  <div
                    onClick={() => importFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#F5C518] hover:bg-slate-50/50 rounded-xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-h-[150px]"
                  >
                    <input
                      type="file"
                      accept=".csv"
                      ref={importFileInputRef}
                      className="hidden"
                      onChange={handleCsvSelect}
                    />
                    <Upload className="text-gray-400 mb-2" size={28} />
                    <span className="block text-xs font-bold text-slate-800">
                      {csvFile ? `Selected: ${csvFile.name}` : "Select CSV menu sheet file"}
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-1">Accepts standard .csv table files with commas</span>
                  </div>
                </div>

                {/* Guidelines description */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-2.5 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C518] block">Step Guide</span>
                  <div className="text-[10.5px] text-slate-650 space-y-1.5 font-medium leading-relaxed">
                    <p>
                      1. Click <strong className="text-slate-900 cursor-pointer underline font-bold" onClick={downloadCsvTemplate}>Download CSV Template</strong> to acquire the exact matching database column mapping.
                    </p>
                    <p>
                      2. Open and fill in names, target categories, inventory stock levels, prices, and status parameters.
                    </p>
                    <p>
                      3. Load the completed document and inspect the mapped validation indicators below before confirming catalog entry.
                    </p>
                  </div>
                </div>

              </div>

              {/* CSV Rows Parser Preview Grid */}
              {csvPreviewRows.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-950 block">Import Preview Checklist</span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {csvPreviewRows.filter(r => r._selected).length} of {csvPreviewRows.length} items checked
                    </span>
                  </div>

                  {/* Spreadsheet Grid container */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto shadow-inner bg-slate-50/50">
                    <table className="w-full text-left text-[11px] border-collapse bg-white">
                      <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 font-bold border-b border-gray-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-10">
                            <input 
                              type="checkbox" 
                              checked={areAllCsvRowsSelected}
                              onChange={toggleAllCsvRows}
                              className="cursor-pointer accent-[#F5C518]"
                            />
                          </th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Mapped Category</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-center">Stock</th>
                          <th className="py-2.5 px-3 text-center">Weight</th>
                          <th className="py-2.5 px-3 text-right">Validation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {csvPreviewRows.map((row) => (
                          <tr key={row._importId} className={`hover:bg-slate-50/50 transition-colors ${row._selected ? "bg-amber-50/5 font-medium" : "opacity-50"}`}>
                            {/* Checkbox selector */}
                            <td className="py-2.5 px-3 text-center">
                              <input 
                                type="checkbox"
                                checked={!!row._selected}
                                onChange={() => toggleCsvRowSelection(row._importId)}
                                className="cursor-pointer accent-[#F5C518]"
                              />
                            </td>
                            {/* Details */}
                            <td className="py-2.5 px-3 text-slate-900 truncate max-w-[150px] font-bold">{row.name || "Unnamed"}</td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-gray-500">{row.sku || "N/A"}</td>
                            
                            {/* Target Category map */}
                            <td className="py-2.5 px-3">
                              <span className="bg-slate-50 border border-gray-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700">
                                {row._mappedCategoryName}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-right font-black">Rs. {parseFloat(row.price) || 0}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-700">{row.stock || 0} units</td>
                            <td className="py-2.5 px-3 text-center text-gray-400">{row.weightUnit || "Unit"}</td>
                            <td className="py-2.5 px-3 text-right">
                              {row.categoryName && categories.some(c => c.name.toLowerCase() === row.categoryName.toLowerCase()) ? (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Category Verified
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200" title="No exact match found. Mapped to default category.">
                                  Defaulting Map
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* CSV Modal Footer Control Bar */}
            <div className="p-4 border-t border-gray-150 flex items-center justify-between text-right bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-extrabold text-slate-700 hover:text-black hover:bg-white border rounded-lg cursor-pointer transition-all"
              >
                <Download size={12} />
                <span>Download Sample Template</span>
              </button>
              
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setCsvPreviewRows([]);
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border text-gray-700 font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Discard All
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkImport}
                  disabled={!!importProgress || csvPreviewRows.filter(r => r._selected).length === 0}
                  className={`px-5 py-2 text-black font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                    importProgress || csvPreviewRows.filter(r => r._selected).length === 0
                      ? "bg-gray-250 text-gray-400 border border-gray-300 cursor-not-allowed"
                      : "bg-[#F5C518] hover:bg-[#E2B616]"
                  }`}
                >
                  {importProgress ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Writing Records...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Confirm Import ({csvPreviewRows.filter(r => r._selected).length} Items)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
