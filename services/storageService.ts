
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

// חשוב: עליך להחליף את הערכים כאן בערכים האמיתיים מהקונסול של Firebase!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db: any;
let articlesRef: any;

try {
  // בדיקה אם המשתמש שכח להזין את הפרטים
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase Config is not set. Using mock storage.");
    // כאן אפשר להוסיף לוגיקה זמנית או פשוט לתת לאפליקציה לעלות בלי Firebase
  } else {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    articlesRef = collection(db, "articles");
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
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
  if (!articlesRef) return;
  const { id, ...data } = article;
  if (id) {
    await setDoc(doc(db, "articles", id), data);
  } else {
    await addDoc(articlesRef, data);
  }
};

export const updateArticleInDB = async (article: Article): Promise<void> => {
  if (!db) return;
  const { id, ...data } = article;
  if (!id) return;
  const articleDoc = doc(db, "articles", id);
  await updateDoc(articleDoc, { ...data });
};

export const removeArticleFromDB = async (id: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, "articles", id));
};

export const saveArticlesToDB = async (articles: Article[]): Promise<void> => {
  for (const article of articles) {
    await addArticleToDB(article);
  }
};

export const initDB = async () => {};
