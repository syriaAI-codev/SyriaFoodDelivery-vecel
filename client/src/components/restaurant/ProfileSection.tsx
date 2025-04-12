import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSection() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    description: '',
    address: '',
    openingTime: '09:00',
    closingTime: '22:00',
    deliveryFee: '0',
    minOrderAmount: '0',
    estimatedDeliveryTime: '30-45',
    cuisineType: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This is just a placeholder - in a real implementation we would submit to the API
      // await updateRestaurantProfile(formData);
      console.log('Restaurant profile updated:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">معلومات المطعم</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            تعديل
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                اسم المطعم
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="cuisineType" className="mb-1 block text-sm font-medium">
                نوع المطبخ
              </label>
              <input
                id="cuisineType"
                name="cuisineType"
                type="text"
                value={formData.cuisineType}
                onChange={handleChange}
                placeholder="شرقي، غربي، سوري، إلخ..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="openingTime" className="mb-1 block text-sm font-medium">
                وقت الافتتاح
              </label>
              <input
                id="openingTime"
                name="openingTime"
                type="time"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="closingTime" className="mb-1 block text-sm font-medium">
                وقت الإغلاق
              </label>
              <input
                id="closingTime"
                name="closingTime"
                type="time"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="deliveryFee" className="mb-1 block text-sm font-medium">
                رسوم التوصيل (ل.س)
              </label>
              <input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="minOrderAmount" className="mb-1 block text-sm font-medium">
                الحد الأدنى للطلب (ل.س)
              </label>
              <input
                id="minOrderAmount"
                name="minOrderAmount"
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="estimatedDeliveryTime" className="mb-1 block text-sm font-medium">
                وقت التوصيل المقدر (دقائق)
              </label>
              <input
                id="estimatedDeliveryTime"
                name="estimatedDeliveryTime"
                type="text"
                value={formData.estimatedDeliveryTime}
                onChange={handleChange}
                placeholder="مثال: 30-45"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              العنوان
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              وصف المطعم
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div className="flex justify-end space-x-2 space-x-reverse">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'جار الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">اسم المطعم</h3>
              <p>{user?.name || 'غير متوفر'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">البريد الإلكتروني</h3>
              <p>{user?.email || 'غير متوفر'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">رقم الهاتف</h3>
              <p>{user?.phone || 'غير متوفر'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">نوع المطبخ</h3>
              <p>{formData.cuisineType || 'غير متوفر'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">ساعات العمل</h3>
              <p>
                {formData.openingTime} - {formData.closingTime}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">رسوم التوصيل</h3>
              <p>{parseInt(formData.deliveryFee, 10) === 0 ? 'مجاني' : `${formData.deliveryFee} ل.س`}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">الحد الأدنى للطلب</h3>
              <p>{`${formData.minOrderAmount} ل.س`}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">وقت التوصيل المقدر</h3>
              <p>{`${formData.estimatedDeliveryTime} دقيقة`}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">العنوان</h3>
            <p>{formData.address || 'غير متوفر'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">وصف المطعم</h3>
            <p>{formData.description || 'لا يوجد وصف متاح.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}