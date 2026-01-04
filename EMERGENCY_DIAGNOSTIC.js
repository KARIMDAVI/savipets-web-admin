// EMERGENCY DIAGNOSTIC SCRIPT
// Copy and paste this ENTIRE script into your browser console on the Live Tracking page

(async function emergencyDiagnostic() {
  console.log('🚨 EMERGENCY DIAGNOSTIC STARTING...');
  console.log('=====================================');
  
  try {
    // Step 1: Check if Firebase is available
    console.log('\n📦 Step 1: Checking Firebase...');
    const firebaseConfig = window.__FIREBASE_CONFIG__ || window.firebase?.app?.options;
    if (!firebaseConfig) {
      console.error('❌ Firebase config not found!');
      console.log('Trying to access Firebase from imports...');
    } else {
      console.log('✅ Firebase config found');
    }
    
    // Step 2: Try to access Firestore directly
    console.log('\n📊 Step 2: Checking Firestore...');
    
    // Get Firestore instance (try multiple ways)
    let db;
    try {
      // Try to get from window if available
      if (window.firebase?.firestore) {
        db = window.firebase.firestore();
        console.log('✅ Got Firestore from window.firebase');
      } else {
        // Try to import dynamically
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
        
        // Try to get existing app
        const apps = getApps();
        if (apps.length > 0) {
          db = getFirestore(apps[0]);
          console.log('✅ Got Firestore from existing app');
        } else {
          console.error('❌ No Firebase app found');
          throw new Error('No Firebase app');
        }
      }
    } catch (error) {
      console.error('❌ Failed to get Firestore:', error);
      console.log('\n💡 SOLUTION: Check if you can access Firestore from the app code');
      return;
    }
    
    // Step 3: Check visits collection
    console.log('\n🔍 Step 3: Checking visits collection...');
    try {
      const visitsRef = db.collection('visits');
      const activeVisitsQuery = visitsRef.where('status', '==', 'on_adventure');
      const visitsSnapshot = await activeVisitsQuery.get();
      
      console.log(`📋 Found ${visitsSnapshot.size} visit(s) with active status`);
      
      if (visitsSnapshot.size === 0) {
        console.warn('⚠️ NO ACTIVE VISITS FOUND!');
        console.log('Checking all visits...');
        const allVisitsSnapshot = await visitsRef.limit(10).get();
        console.log(`Total visits in collection: ${allVisitsSnapshot.size}`);
        allVisitsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`  - Visit ${doc.id}: status="${data.status}", sitterId="${data.sitterId}"`);
        });
      } else {
        visitsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`✅ Active Visit ${doc.id}:`, {
            status: data.status,
            sitterId: data.sitterId,
            clientId: data.clientId,
            scheduledStart: data.scheduledStart?.toDate?.()?.toISOString(),
            scheduledEnd: data.scheduledEnd?.toDate?.()?.toISOString(),
          });
        });
      }
    } catch (error) {
      console.error('❌ Error checking visits:', error);
    }
    
    // Step 4: Check locations collection
    console.log('\n📍 Step 4: Checking locations collection...');
    try {
      // Get sitter IDs from active visits
      const visitsRef = db.collection('visits');
      const activeVisitsQuery = visitsRef.where('status', '==', 'on_adventure');
      const visitsSnapshot = await activeVisitsQuery.get();
      
      const sitterIds = [];
      visitsSnapshot.forEach(doc => {
        const sitterId = doc.data().sitterId;
        if (sitterId) sitterIds.push(sitterId);
      });
      
      console.log(`Found ${sitterIds.length} sitter ID(s) to check:`, sitterIds);
      
      if (sitterIds.length === 0) {
        console.warn('⚠️ No sitter IDs found from active visits!');
      } else {
        for (const sitterId of sitterIds) {
          try {
            const locationDoc = await db.collection('locations').doc(sitterId).get();
            
            if (locationDoc.exists) {
              const data = locationDoc.data();
              console.log(`✅ Location for sitter ${sitterId}:`, {
                lat: data.lat || data.latitude,
                lng: data.lng || data.longitude,
                hasLat: !!(data.lat || data.latitude),
                hasLng: !!(data.lng || data.longitude),
                lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || data.updatedAt?.toDate?.()?.toISOString(),
                visitId: data.visitId,
              });
              
              if (!data.lat && !data.latitude) {
                console.error(`❌ NO LATITUDE for sitter ${sitterId}!`);
              }
              if (!data.lng && !data.longitude) {
                console.error(`❌ NO LONGITUDE for sitter ${sitterId}!`);
              }
            } else {
              console.error(`❌ NO LOCATION DOCUMENT for sitter ${sitterId}!`);
              console.log(`   This means location updates are NOT being written to Firestore.`);
            }
          } catch (error) {
            console.error(`❌ Error checking location for sitter ${sitterId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking locations:', error);
    }
    
    // Step 5: Check visitTracking collection
    console.log('\n🛤️ Step 5: Checking visitTracking collection...');
    try {
      const visitTrackingRef = db.collection('visitTracking');
      const activeTrackingQuery = visitTrackingRef.where('isActive', '==', true);
      const trackingSnapshot = await activeTrackingQuery.get();
      
      console.log(`Found ${trackingSnapshot.size} active visit tracking document(s)`);
      
      trackingSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Visit Tracking ${doc.id}:`, {
          visitId: data.visitId,
          sitterId: data.sitterId,
          isActive: data.isActive,
          hasLastLocation: !!(data.lastLocation),
          routePointsCount: data.routePoints?.length || 0,
        });
      });
    } catch (error) {
      console.error('❌ Error checking visitTracking:', error);
    }
    
    console.log('\n=====================================');
    console.log('✅ DIAGNOSTIC COMPLETE');
    console.log('\n📋 SUMMARY:');
    console.log('1. Check if visits have status "on_adventure"');
    console.log('2. Check if locations/{sitterId} documents exist');
    console.log('3. Check if locations have lat/lng fields');
    console.log('4. Check browser console for subscription logs');
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC FAILED:', error);
    console.error('Stack:', error.stack);
  }
})();





