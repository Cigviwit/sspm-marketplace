import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
} from 'firebase/storage';
import { INITIAL_LISTINGS } from './data';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase conditionally
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app, `gs://${firebaseConfig.storageBucket}`) : null;

const googleProvider = app ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// Auth Functions
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("Firebase is not configured.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      console.warn("Popup blocked or closed, falling back to redirect sign-in...");
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
};

// Call this once on app load to complete a pending redirect sign-in
export const handleRedirectResult = async () => {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    return null;
  }
};

export const logoutUser = () => {
  if (auth) return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
  if (auth) return onAuthStateChanged(auth, callback);
  return () => {};
};

// Firestore User Functions
export const getUserProfile = async (email) => {
  if (!db || !email) return null;
  const userDocRef = doc(db, 'users', email.toLowerCase());
  const userSnapshot = await getDoc(userDocRef);
  if (userSnapshot.exists()) {
    return userSnapshot.data();
  }
  return null;
};

export const saveUserProfile = async (email, profileData) => {
  if (!db || !email) return;
  const userDocRef = doc(db, 'users', email.toLowerCase());
  await setDoc(userDocRef, {
    ...profileData,
    email: email.toLowerCase(),
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// Firestore Listings Functions
export const getListings = async () => {
  if (!db) return [];
  const listingsColRef = collection(db, 'listings');
  const q = query(listingsColRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const createListing = async (listingData) => {
  if (!db) return null;
  const listingsColRef = collection(db, 'listings');
  const docRef = await addDoc(listingsColRef, {
    ...listingData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const deleteListing = async (listingId) => {
  if (!db) return;
  const listingDocRef = doc(db, 'listings', listingId);
  await deleteDoc(listingDocRef);
};

export const updateListing = async (listingId, updateData) => {
  if (!db) return;
  const listingDocRef = doc(db, 'listings', listingId);
  await setDoc(listingDocRef, updateData, { merge: true });
};

// Storage Image Upload
export const uploadListingImage = async (base64String, fileName) => {
  if (!storage || !base64String) return null;
  
  const UPLOAD_TIMEOUT_MS = 15000;

  try {
    // Clean file name
    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const storageRef = ref(storage, `listings/${cleanName}`);

    // Race the upload against a timeout so a silent hang never blocks the form
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out')), UPLOAD_TIMEOUT_MS)
    );
    
    // Upload base64 string
    await Promise.race([uploadString(storageRef, base64String, 'data_url'), timeoutPromise]);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage upload failed, falling back to inline base64 image:", error);
    return base64String;
  }
};

// Subscribe to real-time listings changes
export const subscribeToListings = (callback) => {
  if (!db) return () => {};
  const listingsColRef = collection(db, 'listings');
  const q = query(listingsColRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(listings);
  }, (error) => {
    console.error("Error subscribing to listings:", error);
  });
};

// Seed listings if Firestore is empty
export const seedListingsIfEmpty = async () => {
  if (!db) return;
  try {
    const listingsColRef = collection(db, 'listings');
    const snapshot = await getDocs(listingsColRef);
    if (snapshot.empty) {
      console.log("Seeding default listings...");
      for (const listing of INITIAL_LISTINGS) {
        await addDoc(listingsColRef, {
          title: listing.title,
          price: listing.price,
          condition: listing.condition,
          category: listing.category,
          image: listing.image,
          seller: listing.seller,
          location: listing.location,
          description: listing.description,
          postedAgo: listing.postedAgo,
          sellerEmail: "demo@sspm.edu.in",
          sellerUid: "demo-uid",
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error("Failed to seed listings:", error);
  }
};
