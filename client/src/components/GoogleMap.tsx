import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type Position = {
  lat: number;
  lng: number;
};

type GoogleMapProps = {
  deliveryLocation?: Position;
  driverLocation?: Position;
  restaurantLocation?: Position;
  height?: string;
  zoom?: number;
  showRoute?: boolean;
  className?: string;
};

export default function GoogleMap({
  deliveryLocation,
  driverLocation,
  restaurantLocation,
  height = '300px',
  zoom = 14,
  showRoute = false,
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const defaultLocation = { lat: 33.5138, lng: 36.2765 }; // Damascus, Syria
    
    // Get center location
    let centerLocation = defaultLocation;
    if (deliveryLocation) {
      centerLocation = deliveryLocation;
    } else if (restaurantLocation) {
      centerLocation = restaurantLocation;
    } else if (driverLocation) {
      centerLocation = driverLocation;
    }

    // Create map
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: centerLocation,
        zoom: zoom,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      setMap(mapInstance);

      // Create directions renderer if we're showing route
      if (showRoute) {
        const renderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeWeight: 5,
            strokeOpacity: 0.7,
          },
        });
        renderer.setMap(mapInstance);
        setDirectionsRenderer(renderer);
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل الخريطة',
        description: 'حدث خطأ أثناء تحميل خريطة Google. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
      });
    }

    return () => {
      setMap(null);
      setDirectionsRenderer(null);
    };
  }, [mapRef, map, zoom, deliveryLocation, restaurantLocation, driverLocation, showRoute, toast]);

  // Update markers when locations change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Restaurant marker
    if (restaurantLocation) {
      const restaurantMarker = new window.google.maps.Marker({
        position: restaurantLocation,
        map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: 'المطعم',
      });
      newMarkers.push(restaurantMarker);
    }

    // Delivery location marker
    if (deliveryLocation) {
      const deliveryMarker = new window.google.maps.Marker({
        position: deliveryLocation,
        map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: 'موقع التوصيل',
      });
      newMarkers.push(deliveryMarker);
    }

    // Driver location marker
    if (driverLocation) {
      const driverMarker = new window.google.maps.Marker({
        position: driverLocation,
        map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: 'موقع السائق',
      });
      newMarkers.push(driverMarker);
    }

    setMarkers(newMarkers);

    // Calculate and display route if needed
    if (showRoute && directionsRenderer && 
        ((restaurantLocation && deliveryLocation) || 
         (restaurantLocation && driverLocation) || 
         (driverLocation && deliveryLocation))) {
      
      const directionsService = new window.google.maps.DirectionsService();
      
      // Determine origin and destination
      let origin, destination;
      
      if (driverLocation) {
        origin = driverLocation;
        destination = deliveryLocation || restaurantLocation;
      } else {
        origin = restaurantLocation;
        destination = deliveryLocation;
      }
      
      if (origin && destination) {
        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && directionsRenderer) {
              directionsRenderer.setDirections(result);
            }
          }
        );
      }
    }

    // Auto-zoom to fit all markers
    if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        if (marker.getPosition()) {
          bounds.extend(marker.getPosition() as google.maps.LatLng);
        }
      });
      map.fitBounds(bounds);
      
      // Add a bit of padding
      const listener = map.addListener('idle', () => {
        map.setZoom(map.getZoom() as number - 0.5);
        window.google.maps.event.removeListener(listener);
      });
    } else if (newMarkers.length === 1 && newMarkers[0].getPosition()) {
      map.setCenter(newMarkers[0].getPosition() as google.maps.LatLng);
      map.setZoom(zoom);
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [map, restaurantLocation, deliveryLocation, driverLocation, markers, directionsRenderer, showRoute, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className={className}
    />
  );
}