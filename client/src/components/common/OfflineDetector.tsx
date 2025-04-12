import { useState, useEffect } from 'react';

function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-500 p-2 text-center text-white z-50">
      أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.
    </div>
  );
}

export default OfflineDetector;
