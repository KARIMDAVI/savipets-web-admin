/**
 * useHistoricalRoutes Hook
 * 
 * Hook for fetching and managing historical route data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackingService, type VisitTrackingData } from '@/services/tracking.service';
import { userService } from '@/services/user.service';
import type { User } from '@/types';

export interface HistoricalRoute {
  visitId: string;
  sitterId: string;
  sitterName: string;
  clientId: string;
  visitDate: Date;
  routePoints: VisitTrackingData['routePoints'];
  totalDistance: number;
  isActive: boolean;
}

export const useHistoricalRoutes = (
  sitterId?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const [selectedRoute, setSelectedRoute] = useState<HistoricalRoute | null>(null);

  // Fetch all sitters for the selector
  const { data: sitters = [] } = useQuery({
    queryKey: ['sitters'],
    queryFn: () => userService.getUsersByRole('petSitter'),
  });

  // Fetch historical routes
  // Updated to query from new location (sitters/{sitterId}/routes) with fallback to old location
  const {
    data: routes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['historicalRoutes', sitterId, startDate, endDate],
    queryFn: async () => {
      const { db } = await import('@/config/firebase.config');
      const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
      
      const routes: HistoricalRoute[] = [];
      const routesMap = new Map<string, HistoricalRoute>();
      
      // Query new location (sitters/{sitterId}/routes)
      try {
        if (sitterId) {
          // Query specific sitter's routes
          let routesQuery: any = query(
            collection(db, 'sitters', sitterId, 'routes'),
            orderBy('startedAt', 'desc'),
            limit(100)
          );
          
          if (startDate) {
            routesQuery = query(routesQuery, where('startedAt', '>=', startDate));
          }
          
          if (endDate) {
            routesQuery = query(routesQuery, where('startedAt', '<=', endDate));
          }
          
          const snapshot = await getDocs(routesQuery);
          
          for (const doc of snapshot.docs) {
            const data = doc.data() as any;
            const tracking = await trackingService.getVisitTracking(doc.id, sitterId);
            
            if (tracking) {
              const sitter = sitters.find(s => s.id === sitterId);
              const sitterName = sitter 
                ? `${sitter.firstName} ${sitter.lastName}`
                : 'Unknown Sitter';
              
              routesMap.set(tracking.visitId, {
                visitId: tracking.visitId,
                sitterId: tracking.sitterId,
                sitterName,
                clientId: tracking.clientId,
                visitDate: data.startedAt?.toDate() || new Date(),
                routePoints: tracking.routePoints,
                totalDistance: tracking.totalDistance,
                isActive: tracking.isActive,
              });
            }
          }
        } else {
          // Query all sitters' routes
          const sittersSnapshot = await getDocs(collection(db, 'sitters'));
          
          for (const sitterDoc of sittersSnapshot.docs) {
            const currentSitterId = sitterDoc.id;
            
            try {
              let routesQuery: any = query(
                collection(db, 'sitters', currentSitterId, 'routes'),
                orderBy('startedAt', 'desc'),
                limit(100)
              );
              
              if (startDate) {
                routesQuery = query(routesQuery, where('startedAt', '>=', startDate));
              }
              
              if (endDate) {
                routesQuery = query(routesQuery, where('startedAt', '<=', endDate));
              }
              
              const snapshot = await getDocs(routesQuery);
              
              for (const doc of snapshot.docs) {
                const data = doc.data() as any;
                const tracking = await trackingService.getVisitTracking(doc.id, currentSitterId);
                
                if (tracking && !routesMap.has(tracking.visitId)) {
                  const sitter = sitters.find(s => s.id === currentSitterId);
                  const sitterName = sitter 
                    ? `${sitter.firstName} ${sitter.lastName}`
                    : 'Unknown Sitter';
                  
                  routesMap.set(tracking.visitId, {
                    visitId: tracking.visitId,
                    sitterId: tracking.sitterId,
                    sitterName,
                    clientId: tracking.clientId,
                    visitDate: data.startedAt?.toDate() || new Date(),
                    routePoints: tracking.routePoints,
                    totalDistance: tracking.totalDistance,
                    isActive: tracking.isActive,
                  });
                }
              }
            } catch (error) {
              console.warn(`[useHistoricalRoutes] Error querying routes for sitter ${currentSitterId}:`, error);
            }
          }
        }
      } catch (error) {
        console.warn('[useHistoricalRoutes] Error querying new location, falling back to old location:', error);
      }
      
      // Fallback to old location if new location returned no results (during migration)
      if (routesMap.size === 0) {
        try {
          let q: any = query(
            collection(db, 'visitTracking'),
            orderBy('startedAt', 'desc'),
            limit(100)
          );
          
          if (sitterId) {
            q = query(q, where('sitterId', '==', sitterId));
          }
          
          if (startDate) {
            q = query(q, where('startedAt', '>=', startDate));
          }
          
          if (endDate) {
            q = query(q, where('startedAt', '<=', endDate));
          }
          
          const snapshot = await getDocs(q);
          
          for (const doc of snapshot.docs) {
            const data = doc.data() as any;
            // Only add if not already in map (from new location)
            if (!routesMap.has(doc.id)) {
              const tracking = await trackingService.getVisitTracking(doc.id);
              
              if (tracking) {
                const sitter = sitters.find(s => s.id === tracking.sitterId);
                const sitterName = sitter 
                  ? `${sitter.firstName} ${sitter.lastName}`
                  : 'Unknown Sitter';
                
                routesMap.set(tracking.visitId, {
                  visitId: tracking.visitId,
                  sitterId: tracking.sitterId,
                  sitterName,
                  clientId: tracking.clientId,
                  visitDate: data.startedAt?.toDate() || new Date(),
                  routePoints: tracking.routePoints,
                  totalDistance: tracking.totalDistance,
                  isActive: tracking.isActive,
                });
              }
            }
          }
        } catch (error) {
          console.error('[useHistoricalRoutes] Error querying old location:', error);
        }
      }
      
      // Convert map to array and sort by date
      return Array.from(routesMap.values()).sort((a, b) => 
        b.visitDate.getTime() - a.visitDate.getTime()
      ).slice(0, 100); // Limit to 100 most recent
    },
    enabled: true,
  });

  const selectRoute = useCallback((route: HistoricalRoute | null) => {
    setSelectedRoute(route);
  }, []);

  return {
    routes,
    sitters,
    selectedRoute,
    isLoading,
    refetch,
    selectRoute,
  };
};

