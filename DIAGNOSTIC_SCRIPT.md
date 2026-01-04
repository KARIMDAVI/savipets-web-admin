# 🔍 Live Tracking Diagnostic Script

## Run This in Browser Console (Right Now)

Copy and paste this into your browser console on the Live Tracking page:

```javascript
// Immediate diagnostic check
console.log('🔍 DIAGNOSTIC: Starting check...');

// Check if Firebase is loaded
if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
  console.error('❌ Firebase not loaded!');
} else {
  console.log('✅ Firebase is loaded');
}

// Check Firestore directly
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';

(async () => {
  try {
    // You'll need to import your Firebase config - check the network tab for the config
    const db = getFirestore();
    const q = query(collection(db, 'visits'), where('status', 'in', ['on_adventure', 'in_adventure']));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Found ${snapshot.docs.length} visit(s) with active status`);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`📋 Visit ${doc.id}:`, {
        status: data.status,
        sitterId: data.sitterId,
        scheduledStart: data.scheduledStart?.toDate?.()?.toISOString(),
      });
    });
    
    // Check locations collection
    if (snapshot.docs.length > 0) {
      const sitterIds = snapshot.docs.map(doc => doc.data().sitterId).filter(Boolean);
      console.log(`🔍 Checking locations for ${sitterIds.length} sitter(s):`, sitterIds);
      
      for (const sitterId of sitterIds) {
        const locDoc = await getDocs(query(collection(db, 'locations'), where('__name__', '==', sitterId)));
        if (locDoc.docs.length > 0) {
          const locData = locDoc.docs[0].data();
          console.log(`📍 Location for ${sitterId}:`, {
            lat: locData.lat || locData.latitude,
            lng: locData.lng || locData.longitude,
            lastUpdated: locData.lastUpdated?.toDate?.()?.toISOString(),
          });
        } else {
          console.warn(`⚠️ No location document found for sitter ${sitterId}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
})();
```

## Or Check Firestore Console Directly

1. Go to Firebase Console → Firestore Database
2. Check `visits` collection:
   - Filter: `status == "on_adventure"`
   - Look for visits with `sitterId` field
3. Check `locations` collection:
   - Look for document with ID = `{sitterId}`
   - Check if `lat` and `lng` fields exist
   - Check `lastUpdated` timestamp

## Deploy Updated Code

To see the new logging, you need to rebuild and deploy:

```bash
cd web-admin
npm run build
cd ..
firebase deploy --only hosting
```







