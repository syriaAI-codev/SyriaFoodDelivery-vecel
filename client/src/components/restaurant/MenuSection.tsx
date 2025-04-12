import { useState } from 'react';
import { Plus, Edit, Trash, MoreVertical, AlertCircle } from 'lucide-react';
import { MenuItem } from '@shared/schema';

export default function MenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // This would be replaced with actual data fetching in a real implementation
  const isLoaded = true;
  
  const handleAddItem = () => {
    setShowAddForm(true);
    setCurrentItem(null);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setShowEditForm(true);
  };
  
  const handleDeleteItem = (id: number) => {
    console.log('Deleting item with ID:', id);
    // In a real implementation, we would call an API to delete the item
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };
  
  const handleFormClose = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setCurrentItem(null);
  };
  
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">قائمة الطعام</h2>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة عنصر</span>
          </button>
        </div>
        
        {!isLoaded ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="mb-2 h-10 w-10 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">لا توجد عناصر في القائمة</h3>
            <p className="text-sm text-gray-500">
              أضف عناصر الطعام الخاصة بك لتظهر هنا وتصبح متاحة للعملاء
            </p>
            <button
              onClick={handleAddItem}
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة عنصر الآن</span>
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-right">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium">الصورة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">الاسم</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">الوصف</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">السعر</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={item.image || 'https://via.placeholder.com/100?text=Food'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-600">
                      {item.description?.length > 50
                        ? `${item.description.substring(0, 50)}...`
                        : item.description}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.price} ل.س</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isAvailable ? 'متاح' : 'غير متاح'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Menu Item Form Dialog (Add/Edit) */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium">
              {showEditForm ? 'تعديل عنصر' : 'إضافة عنصر جديد'}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  اسم العنصر
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={currentItem?.name || ''}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium">
                  الوصف
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={currentItem?.description || ''}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="mb-1 block text-sm font-medium">
                    السعر (ل.س)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={currentItem?.price || ''}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="mb-1 block text-sm font-medium">
                    الفئة
                  </label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={currentItem?.categoryId || ''}
                  >
                    <option value="">اختر الفئة</option>
                    <option value="1">مقبلات</option>
                    <option value="2">أطباق رئيسية</option>
                    <option value="3">حلويات</option>
                    <option value="4">مشروبات</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isAvailable"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  defaultChecked={currentItem?.isAvailable ?? true}
                />
                <label htmlFor="isAvailable" className="mr-2 text-sm font-medium">
                  متاح للطلب
                </label>
              </div>
              
              <div>
                <label htmlFor="image" className="mb-1 block text-sm font-medium">
                  صورة العنصر
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                >
                  {showEditForm ? 'حفظ التعديلات' : 'إضافة العنصر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}