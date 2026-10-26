import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProductCategory, ProductCondition, RegionGhana } from '../../types';
import { GHANA_REGIONS, CATEGORIES_WITH_META } from '../../data/initialProducts';
import { compressImageFile } from '../../utils/imageCompressor';

export const ProductFormModal: React.FC = () => {
  const {
    isCreateProductModalOpen,
    closeCreateProductModal,
    addProduct,
    updateProduct,
    editingProduct,
    user,
    updateUserProfile
  } = useApp();

  const formScrollRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Mobile Phones & Tablets');
  const [subcategory, setSubcategory] = useState('Mobile Phones');
  const [region, setRegion] = useState<RegionGhana>('Greater Accra');
  const [city, setCity] = useState('East Legon, Accra');
  const [condition, setCondition] = useState<ProductCondition>('Brand New');
  const [stock, setStock] = useState('5');
  const [sku, setSku] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sellerName, setSellerName] = useState(user?.name || 'My GodySell Shop Ghana');
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '+233(0)592836664');
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Brand', value: '' },
    { key: 'Condition', value: 'Brand New' }
  ]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageNotice, setImageNotice] = useState<string | null>(null);

  // Sync when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setPrice(editingProduct.price.toString());
      setCategory(editingProduct.category);
      setSubcategory(editingProduct.subcategory);
      setRegion(editingProduct.region);
      setCity(editingProduct.city);
      setCondition(editingProduct.condition);
      setStock(editingProduct.stock.toString());
      setSku(editingProduct.sku);
      setNegotiable(editingProduct.negotiable);
      setDescription(editingProduct.description);
      setImages(editingProduct.images || []);
      setSellerName(editingProduct.sellerName || user?.name || 'My GodySell Shop Ghana');
      setSellerPhone(editingProduct.sellerPhone || user?.phone || '+233(0)592836664');
      setSpecs(
        Object.entries(editingProduct.specifications || {}).map(([key, value]) => ({
          key,
          value: String(value || '')
        }))
      );
    } else {
      // Default reset
      setTitle('');
      setPrice('');
      setCategory('Mobile Phones & Tablets');
      setSubcategory('Mobile Phones');
      setRegion('Greater Accra');
      setCity('East Legon, Accra');
      setCondition('Brand New');
      setStock('5');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setNegotiable(true);
      setDescription('');
      setImages([]);
      setSellerName(user?.name || 'My GodySell Shop Ghana');
      setSellerPhone(user?.phone || '+233(0)592836664');
      setSpecs([{ key: 'Brand', value: '' }]);
    }
  }, [editingProduct, isCreateProductModalOpen, user]);

  if (!isCreateProductModalOpen) return null;

  // Handle image upload from computer / phone camera with automatic client-side compression
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImage(true);
    setImageNotice(null);
    setSaveError(null);

    try {
      const compressedList: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImageFile(file, {
          maxWidth: 900,
          maxHeight: 900,
          quality: 0.75
        });
        compressedList.push(compressed);
      }
      setImages((prev) => [...prev, ...compressedList].slice(0, 5));
      setImageNotice('Images optimized for cross-device loading.');
      setTimeout(() => setImageNotice(null), 3000);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setSaveError('Failed to process image. Please try a different photo.');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (isSaving) return;
    setSaveError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setSaveError('Please enter an ad title (e.g. Apple iPhone 15 Pro, Toyota Corolla, Sofa Set).');
      formScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      titleInputRef.current?.focus();
      return;
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setSaveError('Please enter a valid price in Ghana Cedis (GH₵).');
      formScrollRef.current?.scrollTo({ top: 80, behavior: 'smooth' });
      priceInputRef.current?.focus();
      return;
    }

    const finalSellerPhone = sellerPhone.trim() || user?.phone || '+233(0)592836664';
    const finalSellerName = sellerName.trim() || user?.name || 'My GodySell Shop Ghana';

    if (!finalSellerPhone) {
      setSaveError('Please enter your phone number so buyers in Ghana can contact you.');
      phoneInputRef.current?.focus();
      return;
    }

    setIsSaving(true);

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const parsedStock = parseInt(stock) || 0;

    const payload = {
      title: trimmedTitle,
      price: numPrice,
      category,
      subcategory,
      region,
      city: city.trim() || 'East Legon, Accra',
      condition,
      stock: parsedStock,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      negotiable,
      description: description.trim() || `${trimmedTitle} available for sale in ${city}, ${region}.`,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80'],
      sellerName: finalSellerName,
      sellerPhone: finalSellerPhone,
      sellerEmail: editingProduct?.sellerEmail || user?.email?.trim().toLowerCase() || 'vendor@godysell.com',
      sellerMemberSince: editingProduct?.sellerMemberSince || 'Sep 2024',
      sellerRating: editingProduct?.sellerRating || 5.0,
      sellerReviewCount: editingProduct?.sellerReviewCount || 1,
      verifiedSeller: true,
      status: (parsedStock > 0 ? 'active' : 'paused') as any,
      featured: false,
      specifications: specsObj
    };

    try {
      let success = false;
      if (editingProduct) {
        success = await updateProduct(editingProduct.id, payload);
      } else {
        success = await addProduct(payload);
      }

      if (!success) {
        throw new Error('Database could not save your listing. Please verify your connection and try again.');
      }

      if (user && finalSellerPhone) {
        updateUserProfile({ phone: finalSellerPhone, name: finalSellerName });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        closeCreateProductModal();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to publish product:', err);
      setSaveError(err.message || 'Failed to save product to central database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategoryData = CATEGORIES_WITH_META.find((c) => c.name === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingProduct ? 'Update Product Listing' : 'Post Ad / List New Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Publish directly to GodySell Ghana marketplace with live inventory tracking
            </p>
          </div>
          <button
            onClick={closeCreateProductModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {saveSuccess ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {editingProduct ? 'Product Updated Successfully!' : 'Ad Successfully Published to GodySell Ghana!'}
            </h4>
            <p className="text-xs text-slate-600">
              Your inventory and live marketplace catalog have been updated in real-time.
            </p>
          </div>
        ) : (
          <form
            ref={formScrollRef}
            noValidate
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ad Title <span className="text-rose-500">*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                required
                placeholder="e.g. Apple iPhone 15 Pro Max 256GB Natural Titanium (Dual SIM)"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (saveError) setSaveError(null);
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as ProductCategory;
                    setCategory(newCat);
                    const found = CATEGORIES_WITH_META.find((c) => c.name === newCat);
                    if (found && found.subcategories[0]) {
                      setSubcategory(found.subcategories[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                >
                  {CATEGORIES_WITH_META.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                >
                  {currentCategoryData?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Currency (GH₵) & Negotiable */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Price in Ghana Cedis (GH₵) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-emerald-800">
                    GH₵
                  </span>
                  <input
                    ref={priceInputRef}
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 13500"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (saveError) setSaveError(null);
                    }}
                    className="w-full pl-14 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="negotiableCheck"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="negotiableCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Price is Negotiable
                </label>
              </div>
            </div>

            {/* Inventory Controls: Stock & SKU */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Stock Keeping Unit (SKU)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IPH15-NAT-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Item Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Foreign Used">Foreign Used (Tokunbo)</option>
                  <option value="Local Used">Local Used</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>
            </div>

            {/* Location in Ghana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Region (Ghana)</label>
                <select
                  value={region}
                  onChange={(e) => {
                    const newRegion = e.target.value as RegionGhana;
                    setRegion(newRegion);
                    const regData = GHANA_REGIONS.find((r) => r.name === newRegion);
                    if (regData && regData.cities[0]) {
                      setCity(regData.cities[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                >
                  {GHANA_REGIONS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">City / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Legon, Spintex, Osu, Adum"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Seller Contact & Ghana Phone Number Section */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Seller Contact &amp; Phone Number
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Buyers across Ghana will call or WhatsApp you directly on this line
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                  Direct Buyer Enquiries
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Seller Phone Number (Ghana) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 pointer-events-none">
                      <Phone className="w-3.5 h-3.5 text-emerald-800" />
                      <span className="text-xs font-bold text-slate-300">|</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      placeholder="+233(0)592836664"
                      value={sellerPhone}
                      onChange={(e) => {
                        setSellerPhone(e.target.value);
                        if (saveError) setSaveError(null);
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700/20 focus:border-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-medium">
                    <span className="text-emerald-700 font-bold">Supported:</span>
                    <span>MTN MoMo</span>
                    <span>•</span>
                    <span>Telecel Cash</span>
                    <span>•</span>
                    <span>WhatsApp</span>
                  </div>
                </div>

                {/* Seller / Shop Name Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Seller / Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 pointer-events-none">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">|</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Godfred Electronics Hub or Godfred Owusu"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700/20 focus:border-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Will appear on your product ad banner and chat inbox
                  </p>
                </div>
              </div>
            </div>

            {/* Photos & Images Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Product Images
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className={`flex items-center gap-2 px-4 py-2 ${isCompressingImage ? 'bg-slate-200 cursor-not-allowed opacity-75' : 'bg-slate-100 hover:bg-slate-200 cursor-pointer'} text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200`}>
                    {isCompressingImage ? (
                      <Loader2 className="w-4 h-4 text-emerald-800 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-emerald-800" />
                    )}
                    <span>{isCompressingImage ? 'Optimizing Image...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isCompressingImage}
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Auto-compressed to load instantly on all devices (max 5 photos)
                  </span>
                  {imageNotice && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {imageNotice}
                    </span>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Key-Value Pairs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Item Specifications (e.g. Brand, Storage, RAM, Year, Color)
                </label>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attribute</span>
                </button>
              </div>

              <div className="space-y-2">
                {specs.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Property (e.g. Storage)"
                      value={item.key}
                      onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      className="w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 256GB)"
                      value={item.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Detailed Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe key features, condition, warranty, accessories included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            {/* Error Message Banner */}
            {saveError && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 shadow-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Cannot Publish Yet</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{saveError}</p>
                </div>
              </div>
            )}

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={closeCreateProductModal}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isCompressingImage}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing to GodySell Ghana...</span>
                  </>
                ) : isCompressingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Optimizing Photos...</span>
                  </>
                ) : (
                  <span>{editingProduct ? 'Update Product' : 'Publish to GodySell Ghana'}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
