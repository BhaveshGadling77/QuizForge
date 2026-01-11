import { db } from "../config/firebase-config.js";
import { addDoc, collection, getDocs } from "firebase/firestore";

//this is for the storing the users details in the database.
async function createUser(user) {
  try {
    return await addDoc(collection(db, process.env.COLLECTION_USERS), user);
  } catch (e) {
    console.error(e.message);
  }
}

async function getUserList() {
  try {
    const usersRef = collection(db, process.env.COLLECTION_USERS);
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (e) {
    console.log(e.message);
    throw Error(e.message);
  }
}

async function getUser(id) {
  const docRef = doc(db, "cities", "SF");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}
export { createUser, getUserList, getUser };
