import { db } from "../config/firebase-config";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

//this is for the storing the users details in the database.
async function createUser(user) {
    try {
        await addDoc(collection(db, 'users'), user)
    } catch(e) {
        console.error(e.message)
    }
}

export { createUser }
