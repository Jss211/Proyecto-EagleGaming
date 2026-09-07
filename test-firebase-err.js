
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
const app = initializeApp({ projectId: undefined });
const db = getFirestore(app);
async function test() {
  try { await getDocs(query(collection(db, "productos"))); }
  catch (e) { console.error(e.message); }
}
test();

