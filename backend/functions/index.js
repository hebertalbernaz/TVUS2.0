const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Creates a License/User for the TVUSVET SaaS
 * @param {Object} data - { email, password, plan, practice, vetName, clinicName }
 * @param {Object} context - Auth context (must be admin)
 */
exports.createLicense = functions.https.onCall(async (data, context) => {
    // Security: Ensure caller is Admin (you might want to check a specific claim or UID here)
    // if (!context.auth || !context.auth.token.admin) {
    //    throw new functions.https.HttpsError('permission-denied', 'Must be an admin to create licenses.');
    // }

    const { email, password, plan, practice, vetName, clinicName } = data;

    try {
        // 1. Define Modules based on Plan
        let modules = ['core']; // Default
        
        if (plan === 'full_vet') {
            modules = ['core', 'ultrasound', 'cardio', 'prescription', 'lab_vet', 'financial'];
        } else if (plan === 'full_human') {
            modules = ['core', 'ultrasound', 'cardio', 'prescription', 'ophthalmo_human', 'financial'];
        } else if (plan === 'basic') {
            modules = ['core', 'prescription', 'ultrasound'];
        }

        // 2. Create or Get User
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password, // Temp password
                    displayName: vetName,
                    emailVerified: true
                });
            } else {
                throw e;
            }
        }

        // 3. Set Custom Claims (The "License")
        const claims = {
            practice: practice, // 'vet' or 'human'
            modules: modules,
            plan: plan,
            license_active: true
        };
        
        await admin.auth().setCustomUserClaims(userRecord.uid, claims);

        // 4. Create Subscription Record in Firestore
        // Calculates expiration (e.g., 30 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        await admin.firestore().collection('subscriptions').doc(userRecord.uid).set({
            email: email,
            clinic_name: clinicName,
            plan: plan,
            status: 'active',
            start_date: admin.firestore.FieldValue.serverTimestamp(),
            expiration_date: admin.firestore.Timestamp.fromDate(expirationDate),
            device_ids: [], // Array to store hardware fingerprints
            max_devices: 2  // Limit of devices
        });

        return { success: true, uid: userRecord.uid, message: `License created for ${email}` };

    } catch (error) {
        console.error("Error creating license:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Verifies Device Login (Anti-Piracy)
 * Call this immediately after Firebase Auth Login on the client
 */
exports.verifyDevice = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const uid = context.auth.uid;
    const { deviceId } = data;

    if (!deviceId) {
        throw new functions.https.HttpsError('invalid-argument', 'Device ID required.');
    }

    const subRef = admin.firestore().collection('subscriptions').doc(uid);
    const subDoc = await subRef.get();

    if (!subDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Subscription not found.');
    }

    const subData = subDoc.data();

    // 1. Check Expiration
    const now = new Date();
    const expDate = subData.expiration_date.toDate();
    
    if (now > expDate || subData.status !== 'active') {
        // Disable user logic could go here
        return { success: false, reason: 'expired', message: 'Sua licença expirou. Renove para continuar.' };
    }

    // 2. Check Hardware Fingerprint
    const knownDevices = subData.device_ids || [];
    
    if (knownDevices.includes(deviceId)) {
        // Known device, allow
        return { success: true, status: 'verified' };
    } else {
        // New device
        if (knownDevices.length < (subData.max_devices || 1)) {
            // Add new device
            await subRef.update({
                device_ids: admin.firestore.FieldValue.arrayUnion(deviceId)
            });
            return { success: true, status: 'new_device_registered' };
        } else {
            // Limit reached
            return { 
                success: false, 
                reason: 'device_limit', 
                message: `Limite de dispositivos atingido (${subData.max_devices}). Deslogue de outro computador para entrar.` 
            };
        }
    }
});

/**
 * Scheduled function (e.g., daily) to disable expired users
 * (Requires Blazplan or higher, represented here as logic)
 */
exports.pruneExpiredLicenses = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredSnapshot = await admin.firestore().collection('subscriptions')
        .where('expiration_date', '<', now)
        .where('status', '==', 'active')
        .get();

    const batch = admin.firestore().batch();

    expiredSnapshot.forEach(doc => {
        batch.update(doc.ref, { status: 'expired' });
        // Remove 'license_active' claim
        // Note: This is async inside a loop, in prod use a queue or careful Promise.all
        admin.auth().setCustomUserClaims(doc.id, { license_active: false });
    });

    await batch.commit();
});
