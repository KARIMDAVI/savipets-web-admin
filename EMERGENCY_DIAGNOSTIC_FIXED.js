// EMERGENCY DIAGNOSTIC FIXED - Uses Firebase v9+ modular API
// Copy and paste this ENTIRE script into your browser console on the Live Tracking page

(async function emergencyDiagnosticFixed() {
  console.log('🚨 EMERGENCY DIAGNOSTIC FIXED STARTING...');
  console.log('=====================================');
  
  try {
    // Step 1: Import Firebase v9+ modular SDK
    console.log('\n📦 Step 1: Loading Firebase SDK...');
    
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
    const { 
      getFirestore, 
      collection, 
      query, 
      where, 
      getDocs, 
      doc, 
      getDoc,
      limit,
      orderBy
    } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
    
    // Get or create app
    let app = getApps()[0];
    if (!app) {
      console.log('⚠️ No existing app, creating new one...');
      app = initializeApp({ projectId: 'savipets-72a88' });
    } else {
      console.log('✅ Found existing Firebase app');
    }
    
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Step 2: Check visits collection
    console.log('\n🔍 Step 2: Checking visits collection...');
    try {
      const visitsRef = collection(db, 'visits');
      const activeVisitsQuery = query(
        visitsRef,
        where('status', '==', 'on_adventure'),
        limit(100)
      );
      const visitsSnapshot = await getDocs(activeVisitsQuery);
      
      console.log(`📋 Found ${visitsSnapshot.size} visit(s) with active status`);
      
      if (visitsSnapshot.size === 0) {
        console.warn('⚠️ NO ACTIVE VISITS FOUND!');
        console.log('Checking recent visits (last 10)...');
        const allVisitsQuery = query(
          visitsRef,
          orderBy('scheduledStart', 'desc'),
          limit(10)
        );
        const allVisitsSnapshot = await getDocs(allVisitsQuery);
        console.log(`Total visits checked: ${allVisitsSnapshot.size}`);
        allVisitsSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          console.log(`  - Visit ${docSnap.id}:`, {
            status: data.status,
            sitterId: data.sitterId,
            scheduledStart: data.scheduledStart?.toDate?.()?.toISOString(),
          });
        });
      } else {
        const sitterIds = [];
        visitsSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          const sitterId = data.sitterId;
          if (sitterId) sitterIds.push(sitterId);
          console.log(`✅ Active Visit ${docSnap.id}:`, {
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
            const locationDocRef = doc(db, 'locations', sitterId);
            const locationDoc = await getDoc(locationDocRef);
            
            if (locationDoc.exists()) {
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
                console.error(`   Available data keys:`, Object.keys(data));
                console.error(`   Full data:`, data);
              } else {
                console.log(`✅ Coordinates valid: lat=${lat}, lng=${lng}`);
              }
            } else {
              console.error(`❌ NO LOCATION DOCUMENT for sitter ${sitterId}!`);
              console.error(`   This means location updates are NOT being written to Firestore.`);
              console.error(`   Possible causes:`);
              console.error(`   1. iOS app location permissions not granted`);
              console.error(`   2. LocationService.updateCurrentLocation() is failing`);
              console.error(`   3. Firestore write permissions denied`);
              console.error(`   4. iOS app is not running or in background`);
            }
          } catch (error) {
            console.error(`❌ Error checking location for sitter ${sitterId}:`, error);
            if (error.code === 'permission-denied') {
              console.error(`   PERMISSION DENIED - Check Firestore security rules for locations collection!`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking visits:', error);
      if (error.code === 'permission-denied') {
        console.error('   PERMISSION DENIED - Check Firestore security rules for visits collection!');
      }
      console.error('   Error details:', {
        code: error.code,
        message: error.message,
      });
    }
    
    // Step 4: Check visitTracking collection
    console.log('\n🛤️ Step 4: Checking visitTracking collection...');
    try {
      const visitTrackingRef = collection(db, 'visitTracking');
      const activeTrackingQuery = query(
        visitTrackingRef,
        where('isActive', '==', true),
        limit(100)
      );
      const trackingSnapshot = await getDocs(activeTrackingQuery);
      
      console.log(`Found ${trackingSnapshot.size} active visit tracking document(s)`);
      
      if (trackingSnapshot.size > 0) {
        trackingSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          console.log(`✅ Visit Tracking ${docSnap.id}:`, {
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
      } else {
        console.warn('⚠️ No active visit tracking documents found');
      }
    } catch (error) {
      console.error('❌ Error checking visitTracking:', error);
      if (error.code === 'permission-denied') {
        console.error('   PERMISSION DENIED - Check Firestore security rules!');
      }
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
      name: error.name,
    });
    console.log('\n💡 ALTERNATIVE: Check Firestore Console directly:');
    console.log('   1. Go to Firebase Console → Firestore Database');
    console.log('   2. Check visits collection: Filter by status == "on_adventure"');
    console.log('   3. Check locations collection: Look for document with ID = sitterId');
    console.log('   4. Verify lat and lng fields exist in location document');
  }
})();





