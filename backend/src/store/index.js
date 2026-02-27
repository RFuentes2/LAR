/**
 * Store Index
 * Exports the active store implementation.
 */

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.NODE_ENV === 'production';

if (useFirestore) {
    console.log('📦 Using Firestore Store');
    module.exports = require('./firestoreStore');
} else {
    console.log('📦 Using Memory Store');
    module.exports = require('./memoryStore');
}
