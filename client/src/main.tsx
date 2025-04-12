import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Define the global callback first
declare global {
  interface Window {
    initMap: () => void;
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        LatLng: any;
        Geocoder: {
          new(): {
            geocode: (
              request: { location?: { lat: number; lng: number }; address?: string },
              callback: (
                results: Array<{
                  formatted_address?: string;
                  geometry?: {
                    location: {
                      lat: () => number;
                      lng: () => number;
                    }
                  }
                }>,
                status: string
              ) => void
            ) => void;
          }
        };
        GeocoderStatus: {
          OK: string;
        };
        GeocoderResult: any;
        places: {
          Autocomplete: {
            new(
              input: HTMLInputElement,
              options?: { componentRestrictions?: { country: string } }
            ): {
              addListener: (event: string, callback: () => void) => void;
              getPlace: () => {
                formatted_address?: string;
                geometry?: {
                  location: {
                    lat: () => number;
                    lng: () => number;
                  }
                }
              };
            };
          };
        };
        DirectionsService: any;
        DirectionsRenderer: any;
      }
    }
  }
  
  namespace google.maps {
    interface GeocoderResult {
      formatted_address?: string;
      geometry?: {
        location: {
          lat: () => number;
          lng: () => number;
        }
      }
    }
    
    enum GeocoderStatus {
      OK = "OK"
    }
  }
}

// We're now setting RTL and lang in the index.html directly
// document.documentElement.dir = "rtl";
// document.documentElement.lang = "ar";

// Initialize Google Maps API script with better error handling
const loadGoogleMapsScript = () => {
  // Define global callback before loading the script
  window.initMap = () => {
    console.log("Google Maps API loaded successfully");
  };
  
  // Set a timeout to check if the API loaded
  setTimeout(() => {
    // If google maps isn't available after timeout, log an error but don't block the app
    if (!(window as any).google?.maps) {
      console.warn("Google Maps failed to load. Check your API key or network connection.");
    }
  }, 5000);
  
  // Create and append script
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    console.error("Failed to load Google Maps API");
  };
  document.head.appendChild(script);
};

// Render app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WebSocketProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </WebSocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Load Google Maps after app render
loadGoogleMapsScript();
