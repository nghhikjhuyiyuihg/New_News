
import { initializeApp, getApps, getApp } from "firebase/app";
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
 * הגדרות Firebase - עליך להחליף את אלו בנתונים מה-Firebase Console שלך!
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db: any = null;
let articlesRef: any = null;

// בדיקה אם המשתמש עדיין לא הגדיר את Firebase
const isConfigSet = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isConfigSet) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    articlesRef = collection(db, "articles");
    console.log("Firebase initialized successfully.");
  } catch (e) {
    console.error("Firebase failed to initialize:", e);
  }
} else {
  console.warn("Firebase config is missing. App will run in read-only mode with default data.");
}

export const getArticlesFromDB = async (): Promise<Article[]> => {
  if (!articlesRef) return [];
  try {
    const q = query(articlesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
  } catch (e) {
    console.error("Error fetching articles:", e);
    return [];
  }
};

export const subscribeToArticles = (callback: (articles: Article[]) => void) => {
  if (!articlesRef) {
    // אם אין Firebase, פשוט נחזיר רשימה ריקה כדי שהאפליקציה תשתמש ב-DEFAULT_ARTICLES
    callback([]);
    return () => {};
  }
  
  const q = query(articlesRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    callback(articles);
  }, (error) => {
    console.error("Snapshot error:", error);
  });
};

export const addArticleToDB = async (article: Article): Promise<void> => {
  if (!articlesRef) {
    console.error("Cannot add article: Firebase not configured.");
    return;
  }
  try {
    const { id, ...data } = article;
    if (id && id.length > 5) { // Check if it's a real ID or a random temp one
      await setDoc(doc(db, "articles", id), data);
    } else {
      await addDoc(articlesRef, data);
    }
  } catch (e) {
    console.error("Error adding article:", e);
    throw e;
  }
};

export const updateArticleInDB = async (article: Article): Promise<void> => {
  if (!db) return;
  try {
    const { id, ...data } = article;
    if (!id) return;
    const articleDoc = doc(db, "articles", id);
    await updateDoc(articleDoc, { ...data });
  } catch (e) {
    console.error("Error updating article:", e);
  }
};

export const removeArticleFromDB = async (id: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "articles", id));
  } catch (e) {
    console.error("Error removing article:", e);
  }
};

export const saveArticlesToDB = async (articles: Article[]): Promise<void> => {
  if (!articlesRef) return;
  for (const article of articles) {
    await addArticleToDB(article);
  }
};

export const initDB = async () => {
  // פונקציה תואמת לאחור, כיום הכל קורה ב-subscribe
};
