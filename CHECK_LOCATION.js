// CHECK LOCATION FOR SITTER
// Copy and paste this into browser console

(async () => {
  const sitterId = 'cericX6h3sgbn0VfGYgfRWP2NWi2'; // From the visit document
  
  console.log(`🔍 Checking location for sitter: ${sitterId}`);
  
  const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
  const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
  
  let app = getApps()[0];
  if (!app) {
    app = initializeApp({ projectId: 'savipets-72a88' });
  }
  const db = getFirestore(app);
  
  const locationDocRef = doc(db, 'locations', sitterId);
  const locationDoc = await getDoc(locationDocRef);
  
  if (locationDoc.exists()) {
    const data = locationDoc.data();
    console.log('✅ LOCATION DOCUMENT EXISTS!');
    console.log('Data:', data);
    console.log('lat:', data.lat || data.latitude);
    console.log('lng:', data.lng || data.longitude);
    console.log('hasLat:', !!(data.lat || data.latitude));
    console.log('hasLng:', !!(data.lng || data.longitude));
    console.log('lastUpdated:', data.lastUpdated?.toDate?.()?.toISOString());
    console.log('updatedAt:', data.updatedAt?.toDate?.()?.toISOString());
    
    if (!data.lat && !data.latitude) {
      console.error('❌ NO LATITUDE!');
    }
    if (!data.lng && !data.longitude) {
      console.error('❌ NO LONGITUDE!');
    }
  } else {
    console.error('❌ NO LOCATION DOCUMENT EXISTS!');
    console.error('This means the iOS app is NOT writing location updates to Firestore.');
    console.error('Possible causes:');
    console.error('1. iOS app location permissions not granted');
    console.error('2. LocationService.updateCurrentLocation() is failing');
    console.error('3. Firestore write permissions denied');
    console.error('4. iOS app is not running or tracking is not started');
  }
})();







