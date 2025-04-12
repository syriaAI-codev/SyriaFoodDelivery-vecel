// تحسين أداء التطبيق

import { useEffect, useState, useCallback } from 'react';

// دالة لتأخير التنفيذ (debounce)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// دالة للتخزين المؤقت (memoization)
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  return useCallback(callback, dependencies);
}

// دالة للتحميل البطيء للصور (lazy loading)
export function useLazyImage(src: string, placeholder: string = '') {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return { imageSrc, isLoaded };
}

// دالة للتحميل البطيء للمكونات (lazy loading components)
export function useLazyComponent<T>(
  factory: () => Promise<{ default: React.ComponentType<T> }>,
  fallback: React.ReactNode = null
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);

  useEffect(() => {
    let isMounted = true;

    factory().then((module) => {
      if (isMounted) {
        setComponent(() => module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [factory]);

  return { Component, fallback };
}

// دالة للتخزين المؤقت للبيانات (data caching)
export function useDataCache<T>(key: string, initialData: T, expiryTimeMs: number = 5 * 60 * 1000) {
  const [data, setData] = useState<T>(() => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        if (now - timestamp < expiryTimeMs) {
          return data;
        }
      } catch (error) {
        console.error('Error parsing cached data:', error);
      }
    }
    return initialData;
  });

  const updateData = useCallback(
    (newData: T) => {
      setData(newData);
      localStorage.setItem(
        key,
        JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        })
      );
    },
    [key]
  );

  const clearCache = useCallback(() => {
    localStorage.removeItem(key);
    setData(initialData);
  }, [key, initialData]);

  return { data, updateData, clearCache };
}

// دالة للتحميل المتزامن للبيانات (parallel data fetching)
export async function fetchDataParallel<T>(urls: string[]): Promise<T[]> {
  try {
    const responses = await Promise.all(urls.map((url) => fetch(url)));
    const data = await Promise.all(responses.map((response) => response.json()));
    return data;
  } catch (error) {
    console.error('Error fetching data in parallel:', error);
    throw error;
  }
}

// دالة لتحسين أداء القوائم الطويلة (virtualized lists)
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  visibleItems: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(items.length, startIndex + visibleItems + 1);

  const visibleItemsData = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
    []
  );

  return {
    visibleItemsData,
    totalHeight,
    offsetY,
    onScroll,
  };
}

// دالة لتحسين أداء الصور (image optimization)
export function getOptimizedImageUrl(url: string, width: number, height: number, quality: number = 80) {
  // تنفيذ هذه الدالة يعتمد على خدمة تحسين الصور المستخدمة
  // هذا مثال باستخدام Cloudinary
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_${quality}/`);
  }
  
  // يمكن إضافة خدمات أخرى هنا
  
  return url;
}

// دالة لتتبع الأداء (performance tracking)
export function trackPerformance(metricName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const now = performance.now();
    return () => {
      const duration = performance.now() - now;
      console.log(`${metricName}: ${duration.toFixed(2)}ms`);
      
      // يمكن إرسال البيانات إلى خدمة تحليلات
      if ('sendBeacon' in navigator) {
        const data = new FormData();
        data.append('metric', metricName);
        data.append('duration', duration.toString());
        navigator.sendBeacon('/api/performance', data);
      }
    };
  }
  
  return () => {};
}

// دالة لتحسين أداء النماذج (form performance)
export function useOptimizedForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);
  
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  return { values, touched, handleChange, handleBlur, reset };
}

// دالة لتحسين أداء الخرائط (map performance)
export function useOptimizedMap(center: [number, number], zoom: number) {
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // تحديث مركز الخريطة فقط عند تغير القيم بشكل كبير
  const debouncedCenter = useDebounce(center, 300);
  
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setView(debouncedCenter, zoom);
    }
  }, [mapInstance, debouncedCenter, zoom]);
  
  return { setMapInstance };
}

export default {
  useDebounce,
  useMemoizedCallback,
  useLazyImage,
  useLazyComponent,
  useDataCache,
  fetchDataParallel,
  useVirtualizedList,
  getOptimizedImageUrl,
  trackPerformance,
  useOptimizedForm,
  useOptimizedMap,
};
