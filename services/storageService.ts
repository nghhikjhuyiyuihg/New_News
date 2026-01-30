
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { Article } from '../types';

/**
 * מדריך קצר להגדרת Firebase:
 * 1. היכנס ל-https://console.firebase.google.com/
 * 2. צור פרויקט חדש (למשל TrueNews)
 * 3. הוסף אפליקציית Web וקבל את ה-firebaseConfig
 * 4. בתפריט הצדדי בחר Build -> Firestore Database ולחץ על Create Database
 * 5. בלשונית Rules, שנה ל- allow read, write: if true; (רק לפיתוח ראשוני!)
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const articlesRef = collection(db, "articles");

export const getArticlesFromDB = async (): Promise<Article[]> => {
  try {
    const q = query(articlesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
  } catch (e) {
    console.error("Error fetching articles:", e);
    return [];
  }
};

// Real-time listener version - world-class synchronization
export const subscribeToArticles = (callback: (articles: Article[]) => void) => {
  const q = query(articlesRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    callback(articles);
  }, (error) => {
    console.error("Snapshot error:", error);
  });
};

export const addArticleToDB = async (article: Article): Promise<void> => {
  const { id, ...data } = article;
  // If we have an ID from the client, we use it, otherwise Firestore generates one
  if (id) {
    await setDoc(doc(db, "articles", id), data);
  } else {
    await addDoc(articlesRef, data);
  }
};

export const updateArticleInDB = async (article: Article): Promise<void> => {
  const { id, ...data } = article;
  if (!id) return;
  const articleDoc = doc(db, "articles", id);
  await updateDoc(articleDoc, { ...data });
};

export const removeArticleFromDB = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "articles", id));
};

export const saveArticlesToDB = async (articles: Article[]): Promise<void> => {
  for (const article of articles) {
    await addArticleToDB(article);
  }
};

// Helper for initial IDB removal if needed, but here we just export placeholder init
export const initDB = async () => {};
