import * as firebase from './firebase';

export const isFirebaseConfigured = firebase.isFirebaseConfigured;

export const subscribeToListings = (callback) => {
  return firebase.subscribeToListings(callback);
};

export const subscribeToAuthChanges = (callback) => {
  return firebase.subscribeToAuthChanges(callback);
};

export const getCurrentUser = async () => {
  return firebase.auth ? firebase.auth.currentUser : null;
};

export const getUserProfile = (...args) => {
  return firebase.getUserProfile(...args);
};

export const saveUserProfile = (...args) => {
  return firebase.saveUserProfile(...args);
};

export const createListing = (...args) => {
  return firebase.createListing(...args);
};

export const deleteListing = (...args) => {
  return firebase.deleteListing(...args);
};

export const updateListing = (...args) => {
  return firebase.updateListing(...args);
};

export const uploadListingImage = (...args) => {
  return firebase.uploadListingImage(...args);
};

export const logoutUser = (...args) => {
  return firebase.logoutUser(...args);
};

export const signInWithGoogle = (...args) => {
  return firebase.signInWithGoogle(...args);
};
