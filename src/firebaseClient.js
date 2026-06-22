let firebasePromise;

function loadFirebase() {
  if (!firebasePromise) {
    firebasePromise = import('./firebase');
  }
  return firebasePromise;
}

function createDeferredSubscription(subscribe) {
  let unsubscribe = null;
  let cancelled = false;

  loadFirebase().then((firebase) => {
    if (cancelled) return;
    unsubscribe = subscribe(firebase);
    if (cancelled && unsubscribe) unsubscribe();
  });

  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
}

export const subscribeToListings = (callback) => createDeferredSubscription(
  (firebase) => firebase.subscribeToListings(callback),
);

export const subscribeToAuthChanges = (callback) => createDeferredSubscription(
  (firebase) => firebase.subscribeToAuthChanges(callback),
);

export const getCurrentUser = async () => {
  const { auth } = await loadFirebase();
  return auth.currentUser;
};

export const getUserProfile = async (...args) => {
  const { getUserProfile: fn } = await loadFirebase();
  return fn(...args);
};

export const saveUserProfile = async (...args) => {
  const { saveUserProfile: fn } = await loadFirebase();
  return fn(...args);
};

export const createListing = async (...args) => {
  const { createListing: fn } = await loadFirebase();
  return fn(...args);
};

export const deleteListing = async (...args) => {
  const { deleteListing: fn } = await loadFirebase();
  return fn(...args);
};

export const updateListing = async (...args) => {
  const { updateListing: fn } = await loadFirebase();
  return fn(...args);
};

export const uploadListingImage = async (...args) => {
  const { uploadListingImage: fn } = await loadFirebase();
  return fn(...args);
};

export const logoutUser = async (...args) => {
  const { logoutUser: fn } = await loadFirebase();
  return fn(...args);
};

export const seedListingsIfEmpty = async (...args) => {
  const { seedListingsIfEmpty: fn } = await loadFirebase();
  return fn(...args);
};

export const signInWithGoogle = async (...args) => {
  const { signInWithGoogle: fn } = await loadFirebase();
  return fn(...args);
};
