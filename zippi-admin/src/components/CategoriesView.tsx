import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FolderIcon, 
  CheckCircle, 
  EyeOff,
  Link,
  Upload,
  Layers,
  ChevronRight,
  GripVertical,
  Check,
  AlertTriangle,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Category } from "../types";
import { uploadProductImage } from "../lib/supabase";

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = usePortal();

  // Search local state
  const [searchTerm, setSearchTerm] = useState("");

  // Reorder dragging states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Inputs fields
  const [formName, setFormName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formParentCategoryId, setFormParentCategoryId] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Drag and Drop Cover Banner Upload states
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sort and prep categories list
  // Ensure we sort by sortOrder if available
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.sortOrder !== undefined ? a.sortOrder : 999;
    const orderB = b.sortOrder !== undefined ? b.sortOrder : 999;
    return orderA - orderB;
  });

  const triggerFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=640");
    setFormParentCategoryId("");
    setFormIsActive(true);
    setUploadingProgress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImage(cat.image);
    setFormParentCategoryId(cat.parentCategoryId || "");
    setFormIsActive(cat.status === "Active");
    setUploadingProgress(null);
    setIsModalOpen(true);
  };

  // Submit the Category Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerFeedback("Please specify a category title.", "error");
      return;
    }

    const slug = formName.toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const payload = {
      name: formName.trim(),
      slug,
      image: formImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=640",
      status: (formIsActive ? "Active" : "Inactive") as "Active" | "Inactive",
      parentCategoryId: formParentCategoryId || undefined,
      sortOrder: editingCategory?.sortOrder !== undefined ? editingCategory.sortOrder : categories.length
    };

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        ...payload
      });
      triggerFeedback(`Successfully modified "${formName}"!`);
    } else {
      addCategory(payload);
      triggerFeedback(`Successfully registered "${formName}" category!`);
    }

    setIsModalOpen(false);
  };

  // Drag Cover Banner Upload Handler
  const handleDragOverFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeaveFile = () => {
    setDragOver(false);
  };

  const handleDropFile = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setUploadingProgress(10);
    try {
      const res = await uploadProductImage(file, (prog) => {
        setUploadingProgress(prog);
      });
      setFormImage(res.url);
      if (res.isFallback) {
        triggerFeedback("Banner converted successfully!", "success");
      } else {
        triggerFeedback("Uploaded category banner to cloud storage!", "success");
      }
    } catch (err: any) {
      triggerFeedback(`Upload failed: ${err.message || 'Error'}`, "error");
    } finally {
      setUploadingProgress(null);
    }
  };

  // Toggle Category Active Switch internally from Card
  const toggleActiveStatus = (cat: Category) => {
    const updatedStatus = cat.status === "Active" ? "Inactive" : "Active";
    updateCategory({
      ...cat,
      status: updatedStatus
    });
    triggerFeedback(`"${cat.name}" is now ${updatedStatus === "Active" ? "Visible" : "Hidden"}.`);
  };

  // ════════════════════════════════
  // NATIVE HTML5 DRAG & DROP SORTING
  // ════════════════════════════════
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId !== id) {
      setDraggedOverId(id);
    }
  };

  const handleDragDropItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const items = [...sortedCategories];
    const draggedIdx = items.findIndex(item => item.id === draggedId);
    const targetIdx = items.findIndex(item => item.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    // Splice in place
    const [removed] = items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, removed);

    // Save recalculated sorted sequence numbers
    const updatedWithOrder = items.map((item, idx) => ({
      ...item,
      sortOrder: idx
    }));

    reorderCategories(updatedWithOrder);
    triggerFeedback("Category order rearranged successfully!", "success");

    setDraggedId(null);
    setDraggedOverId(null);
  };

  const handleDragEndGame = () => {
    setDraggedId(null);
    setDraggedOverId(null);
  };

  // Filter Categories
  const filteredCategories = sortedCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    return categories.find(c => c.id === parentId)?.name || null;
  };

  // Avoid circular reference of sub-categories inside Edit modal
  const eligibleParentCategories = categories.filter(c => {
    if (!editingCategory) return true;
    return c.id !== editingCategory.id;
  });

  return (
    <div id="categories-view-wrapper" className="space-y-6">

      {/* Persistent Feedback notifications */}
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

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-gray-905 tracking-tight leading-none">Meal Classifications</h2>
          <p className="text-xs text-gray-400 mt-1">
            Drag cards to rearrange public menu ordering. Configures structural divisions on web and mobile client views.
          </p>
        </div>

        <button
          id="btn-add-category-trigger"
          onClick={openAddModal}
          className="bg-[#F5C518] hover:bg-[#E2B616] text-black font-extrabold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer transition-all shrink-0 uppercase tracking-wider"
        >
          <Plus size={14} className="stroke-[3px]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* CATEGORY BAR FILTER SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            id="input-category-search-bar"
            type="text"
            placeholder="Search categories (e.g. kottu, wraps, sides)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-4 rounded-lg outline-none text-gray-900 font-semibold"
          />
        </div>
        
        <span className="text-[10px] text-gray-400 font-mono hidden md:inline-block">
          ● Drag grip handles to alter sort_order sequence integers.
        </span>
      </div>

      {/* 3-COLUMN RESPONSIVE LAYOUT CONSTRUCT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full bg-white py-16 text-center text-gray-400 text-xs font-semibold rounded-xl border border-gray-200 shadow-sm">
            No matching food categorization divisions trackable inside active database index.
          </div>
        ) : (
          filteredCategories.map((cat, idx) => {
            const isDragging = draggedId === cat.id;
            const isOver = draggedOverId === cat.id;
            const parentName = getParentName(cat.parentCategoryId);

            return (
              <div
                key={cat.id}
                id={`category-item-card-${cat.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, cat.id)}
                onDragOver={(e) => handleDragOverItem(e, cat.id)}
                onDrop={(e) => handleDragDropItem(e, cat.id)}
                onDragEnd={handleDragEndGame}
                className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative group ${
                  isDragging ? "opacity-30 border-dashed border-[#F5C518]" : "border-gray-200"
                } ${isOver ? "border-solid border-2 border-[#F5C518] scale-[1.01]" : ""}`}
              >
                {/* Drag Gird Handle (shows on hover) */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1 rounded border border-gray-200/50 text-slate-500 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} />
                </div>

                <div>
                  {/* Category Image Cover Banner Area */}
                  <div className="relative h-40 w-full bg-slate-100">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-linear-to-b from-gray-50 to-gray-100">
                        <FolderIcon size={32} />
                      </div>
                    )}

                    {/* Numeric Sort Badge overlay */}
                    <span 
                      className="absolute top-3 left-12 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold shadow-sm"
                      title={`Interactive Sort Seq Position: ${cat.sortOrder !== undefined ? cat.sortOrder : idx}`}
                    >
                      Sort Pos: #{cat.sortOrder !== undefined ? cat.sortOrder : idx}
                    </span>

                    {/* Activity Pill */}
                    <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                      cat.status === "Active" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                        : "bg-red-50 text-red-800 border-red-300"
                    }`}>
                      {cat.status}
                    </span>
                  </div>

                  {/* Body Content Details */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-extrabold text-base text-slate-950 truncate" title={cat.name}>
                        {cat.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-gray-400 bg-slate-50 px-2 py-0.5 rounded border border-gray-150 font-mono flex items-center gap-1 shrink-0">
                        <Link size={10} />
                        <span>/{cat.slug}</span>
                      </span>

                      {/* Parent category link indicator */}
                      {parentName && (
                        <span className="text-[9px] font-bold text-slate-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-0.5">
                          <Layers size={9} />
                          <span>Child of: {parentName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lower Statistics counters & Operational Elements */}
                <div className="p-4 bg-slate-50/50 border-t border-gray-150 flex items-center justify-between shrink-0">
                  
                  {/* Left: Product count badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                    <div>
                      <span className="font-display font-black text-sm text-slate-950 block leading-tight">{cat.productCount}</span>
                      <span className="block text-[8px] text-gray-400 uppercase tracking-wider font-extrabold">Active Dishes</span>
                    </div>
                  </div>

                  {/* Right: Toggle + Actions (✏️ | 🗑️) */}
                  <div className="flex items-center gap-3">
                    
                    {/* Active/Inactive Switch Toggle */}
                    <div className="flex items-center gap-1.5" title="Toggle active toggle state">
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Active:</span>
                      <button
                        type="button"
                        onClick={() => toggleActiveStatus(cat)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          cat.status === "Active" ? "bg-[#F5C518]" : "bg-gray-200"
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                          cat.status === "Active" ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </div>

                    <div className="h-5 w-px bg-gray-200" />

                    {/* Operation Icon Clones */}
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-cat-${cat.id}`}
                        onClick={() => openEditModal(cat)}
                        className="p-1 px-1.5 hover:bg-slate-100 text-slate-700 hover:text-black rounded transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                        title="Edit entry params ✏️"
                      >
                        <Edit size={12} className="stroke-[2.5px]" />
                      </button>

                      <button
                        id={`btn-delete-cat-${cat.id}`}
                        onClick={() => {
                          if (cat.productCount > 0) {
                            alert(`Cannot delete non-empty classification "${cat.name}". It still governs ${cat.productCount} food product maps. Pls reassign those culinary items first!`);
                            return;
                          }
                          if (confirm(`Confirm deletion of Category "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                            triggerFeedback(`Removed "${cat.name}" classification from index.`);
                          }
                        }}
                        className="p-1 px-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete permanently 🗑️"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ════════════════════════════════
          ADD / EDIT CATEGORY DIALOG MODAL (COMPLEX FORM WITH COVER IMAGE DRAG DROP UPLOAD)
          ════════════════════════════════ */}
      {isModalOpen && (
        <div 
          id="modal-category-form"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-100">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 shrink-0">
              <div>
                <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest">Colombo Kitchen Portal</span>
                <h3 className="font-display font-black text-base text-slate-950 mt-0.5">
                  {editingCategory ? "Update Classification Module" : "Add Category Division"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-black cursor-pointer p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-150"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form parameters */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] space-y-4">
              
              {/* Category Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category Name *</label>
                <input
                  id="form-category-name"
                  type="text"
                  required
                  placeholder="e.g. Authentic Rice Options, Hot Beverages"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3.5 rounded-lg outline-none text-slate-950 font-semibold"
                />
              </div>

              {/* Cover Banner Image with drag & drop uploader */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Category Banner Image
                </label>

                {/* Drag zone construct */}
                <div
                  onDragOver={handleDragOverFile}
                  onDragLeave={handleDragLeaveFile}
                  onDrop={handleDropFile}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer flex flex-col items-center justify-center min-h-[110px] transition-all mb-2.5 ${
                    dragOver 
                      ? "border-[#F5C518] bg-[#F5C518]/5"
                      : "border-gray-200 hover:border-[#F5C518] bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <input
                    id="form-category-image-uploader"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadingProgress !== null ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 size={24} className="text-[#F5C518] animate-spin" />
                      <span className="text-[10px] font-bold text-gray-500">Uploading: {uploadingProgress}%</span>
                    </div>
                  ) : formImage ? (
                    <div className="w-full h-16 rounded overflow-hidden relative">
                      <img src={formImage} alt="Banner Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
                        <span className="text-[9px] text-white font-extrabold uppercase bg-black/50 px-2 py-0.5 rounded">Change Banner Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-gray-400">
                      <Upload size={18} className="mx-auto" />
                      <p className="text-[10px] font-bold">Drag & drop cover banner, or click to upload</p>
                      <p className="text-[8px]">Accepts standard JPEG, PNG format visuals</p>
                    </div>
                  )}
                </div>

                {/* Fallback Manual URL text-input field */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase shrink-0">Banner URL:</span>
                  <input
                    id="form-category-image"
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:ring-1 focus:ring-[#F5C518] text-[10px] py-1.5 px-2.5 rounded-md outline-none text-gray-650 font-medium truncate"
                  />
                </div>
              </div>

              {/* Selector: Parent Category (optional hierarchy) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Parent Category (Optional)
                </label>
                <select
                  id="form-category-parent"
                  value={formParentCategoryId}
                  onChange={(e) => setFormParentCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 focus:ring-2 focus:ring-[#F5C518] text-xs py-2.5 px-3 rounded-lg outline-none text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="">-- No Parent (Root Category Level) --</option>
                  {eligibleParentCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (/{c.slug})
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Enables classification hierarchies (e.g. "Beverages" can parent "Milkshakes" and "Teas").
                </span>
              </div>

              {/* Active Toggle Switch */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-150 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-xs text-slate-950">Active Status State</span>
                  <span className="block text-[10px] text-gray-400">Controls if this menu displays on consumer interfaces</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    formIsActive ? "bg-[#F5C518]" : "bg-gray-200"
                  }`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-xs transform transition-transform duration-200 ${
                    formIsActive ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Button controllers */}
              <div className="flex gap-3 pt-4 border-t border-gray-150 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 hover:text-black border border-gray-205 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  id="btn-submit-category-form"
                  type="submit"
                  className="px-6 py-2 bg-[#F5C518] hover:bg-[#E2B616] text-black font-black text-xs rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 uppercase tracking-widest"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
