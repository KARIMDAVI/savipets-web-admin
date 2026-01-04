// EMERGENCY DIAGNOSTIC V2 - Uses app's Firebase instance
// Copy and paste this ENTIRE script into your browser console on the Live Tracking page

(async function emergencyDiagnosticV2() {
  console.log('🚨 EMERGENCY DIAGNOSTIC V2 STARTING...');
  console.log('=====================================');
  
  try {
    // Step 1: Access Firebase from the app's modules
    console.log('\n📦 Step 1: Accessing Firebase from app...');
    
    // Try to get Firebase from the app's config
    // The app uses: import { db } from '@/config/firebase.config'
    // We need to access it through the app's module system
    
    // Method 1: Try to access via window if exposed
    if (window.__FIREBASE_DB__) {
      console.log('✅ Found Firebase DB on window');
      var db = window.__FIREBASE_DB__;
    } else {
      // Method 2: Use the app's Firebase directly via dynamic import
      // Since we're in the browser, we can't directly import, but we can check the network tab
      console.log('⚠️ Firebase not on window, trying alternative method...');
      
      // Check if we can access it via the app's React Query cache or state
      console.log('💡 Checking React DevTools or app state...');
      
      // Method 3: Direct Firestore access via the app's instance
      // We'll use the Firebase SDK directly with the project config
      const firebaseConfig = {
        projectId: 'savipets-72a88', // From the URL
      };
      
      // Import Firebase modules
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
      const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
      
      // Try to get existing app or create minimal one
      let app;
      try {
        // Try to get existing app
        const { getApps } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
        const apps = getApps();
        if (apps.length > 0) {
          app = apps[0];
          console.log('✅ Found existing Firebase app');
        } else {
          // Create minimal app (won't work for auth, but might work for read-only)
          console.log('⚠️ No existing app, creating minimal app (read-only)...');
          app = initializeApp({ projectId: 'savipets-72a88' });
        }
        var db = getFirestore(app);
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw error;
      }
    }
    
    // Step 2: Check visits collection
    console.log('\n🔍 Step 2: Checking visits collection...');
    try {
      const visitsRef = db.collection('visits');
      const activeVisitsQuery = visitsRef.where('status', '==', 'on_adventure');
      const visitsSnapshot = await activeVisitsQuery.get();
      
      console.log(`📋 Found ${visitsSnapshot.size} visit(s) with active status`);
      
      if (visitsSnapshot.size === 0) {
        console.warn('⚠️ NO ACTIVE VISITS FOUND!');
        console.log('Checking all visits (last 10)...');
        const allVisitsSnapshot = await visitsRef.orderBy('scheduledStart', 'desc').limit(10).get();
        console.log(`Total visits checked: ${allVisitsSnapshot.size}`);
        allVisitsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`  - Visit ${doc.id}:`, {
            status: data.status,
            sitterId: data.sitterId,
            scheduledStart: data.scheduledStart?.toDate?.()?.toISOString(),
          });
        });
      } else {
        const sitterIds = [];
        visitsSnapshot.forEach(doc => {
          const data = doc.data();
          const sitterId = data.sitterId;
          sitterIds.push(sitterId);
          console.log(`✅ Active Visit ${doc.id}:`, {
            status: data.status,
            sitterId: sitterId,
            clientId: data.clientId,
            scheduledStart: data.scheduledStart?.toDate?.()?.toISOString(),
            scheduledEnd: data.scheduledEnd?.toDate?.()?.toISOString(),
          });
        });
        
        // Step 3: Check locations for these sitters
        console.log(`\n📍 Step 3: Checking locations for ${sitterIds.length} sitter(s)...`);
        for (const sitterId of sitterIds) {
          if (!sitterId) {
            console.warn(`⚠️ Skipping empty sitterId`);
            continue;
          }
          
          try {
            const locationDoc = await db.collection('locations').doc(sitterId).get();
            
            if (locationDoc.exists) {
              const data = locationDoc.data();
              const lat = data.lat || data.latitude;
              const lng = data.lng || data.longitude;
              const lastUpdated = data.lastUpdated?.toDate?.() || data.updatedAt?.toDate?.();
              
              console.log(`✅ Location for sitter ${sitterId}:`, {
                lat: lat,
                lng: lng,
                hasLat: !!lat,
                hasLng: !!lng,
                lastUpdated: lastUpdated?.toISOString(),
                visitId: data.visitId,
                accuracy: data.accuracy,
              });
              
              if (!lat || !lng) {
                console.error(`❌ MISSING COORDINATES for sitter ${sitterId}!`);
                console.error(`   Data keys:`, Object.keys(data));
              } else {
                console.log(`✅ Coordinates valid: lat=${lat}, lng=${lng}`);
              }
            } else {
              console.error(`❌ NO LOCATION DOCUMENT for sitter ${sitterId}!`);
              console.error(`   This means location updates are NOT being written to Firestore.`);
              console.error(`   Check iOS app logs for location update errors.`);
            }
          } catch (error) {
            console.error(`❌ Error checking location for sitter ${sitterId}:`, error);
            if (error.code === 'permission-denied') {
              console.error(`   PERMISSION DENIED - Check Firestore security rules!`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking visits:', error);
      if (error.code === 'permission-denied') {
        console.error('   PERMISSION DENIED - Check Firestore security rules for visits collection!');
      }
    }
    
    // Step 4: Check visitTracking collection
    console.log('\n🛤️ Step 4: Checking visitTracking collection...');
    try {
      const visitTrackingRef = db.collection('visitTracking');
      const activeTrackingQuery = visitTrackingRef.where('isActive', '==', true);
      const trackingSnapshot = await activeTrackingQuery.get();
      
      console.log(`Found ${trackingSnapshot.size} active visit tracking document(s)`);
      
      if (trackingSnapshot.size > 0) {
        trackingSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`✅ Visit Tracking ${doc.id}:`, {
            visitId: data.visitId,
            sitterId: data.sitterId,
            isActive: data.isActive,
            hasLastLocation: !!(data.lastLocation),
            lastLocation: data.lastLocation ? {
              lat: data.lastLocation.latitude || data.lastLocation.lat,
              lng: data.lastLocation.longitude || data.lastLocation.lng,
            } : null,
            routePointsCount: data.routePoints?.length || 0,
          });
        });
      }
    } catch (error) {
      console.error('❌ Error checking visitTracking:', error);
    }
    
    console.log('\n=====================================');
    console.log('✅ DIAGNOSTIC COMPLETE');
    console.log('\n📋 SUMMARY:');
    console.log('1. Check if visits have status "on_adventure"');
    console.log('2. Check if locations/{sitterId} documents exist');
    console.log('3. Check if locations have lat/lng fields');
    console.log('4. If locations missing: Check iOS app location permissions');
    console.log('5. If permission denied: Check Firestore security rules');
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC FAILED:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    console.log('\n💡 ALTERNATIVE: Check Firestore Console directly:');
    console.log('   1. Go to Firebase Console → Firestore Database');
    console.log('   2. Check visits collection: status == "on_adventure"');
    console.log('   3. Check locations collection: document ID = sitterId');
  }
})();





