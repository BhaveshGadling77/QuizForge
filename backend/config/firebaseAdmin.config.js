import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

export const adminAuth = getAuth(adminApp);
