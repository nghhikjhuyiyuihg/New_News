
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
 * הגדרות Firebase - אם יש לך מפתחות, הדבק אותם כאן.
 * אם לא, המערכת תשתמש ב-LocalStorage באופן אוטומטי.
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

const isConfigSet = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";

if (isConfigSet) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    articlesRef = collection(db, "articles");
    console.log("Firebase connected.");
  } catch (e) {
    console.error("Firebase failed:", e);
  }
}

// מפתח לשמירה מקומית כגיבוי
const LOCAL_STORAGE_KEY = 'news_articles_backup';

export const getArticlesFromDB = async (): Promise<Article[]> => {
  if (articlesRef) {
    try {
      const q = query(articlesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    } catch (e) {
      console.error("Firestore error:", e);
    }
  }
  
  // fallback ל-LocalStorage
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const subscribeToArticles = (callback: (articles: Article[]) => void) => {
  if (articlesRef) {
    const q = query(articlesRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const articles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      callback(articles);
    }, (error) => {
      console.error("Snapshot error:", error);
      // במקרה של שגיאת הרשאות ב-Firebase, נחזור ללוקאל
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      callback(saved ? JSON.parse(saved) : []);
    });
  }
  
  // אם אין Firebase, נשתמש באירוע storage כדי לעדכן דפים פתוחים אחרים
  const loadLocal = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    callback(saved ? JSON.parse(saved) : []);
  };
  
  window.addEventListener('storage', loadLocal);
  loadLocal(); // טעינה ראשונית
  
  return () => window.removeEventListener('storage', loadLocal);
};

export const addArticleToDB = async (article: Article): Promise<void> => {
  // שמירה מקומית תמיד (כגיבוי או כראשי)
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  const articles: Article[] = saved ? JSON.parse(saved) : [];
  const newArticles = [article, ...articles];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newArticles));
  window.dispatchEvent(new Event('storage')); // עדכון ידני של הסטייט באותו חלון

  if (articlesRef) {
    try {
      const { id, ...data } = article;
      if (id && id.length > 15) { 
        await setDoc(doc(db, "articles", id), data);
      } else {
        await addDoc(articlesRef, data);
      }
    } catch (e) {
      console.error("Firebase add failed:", e);
    }
  }
};

export const updateArticleInDB = async (article: Article): Promise<void> => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    const articles: Article[] = JSON.parse(saved);
    const index = articles.findIndex(a => a.id === article.id);
    if (index !== -1) {
      articles[index] = article;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
      window.dispatchEvent(new Event('storage'));
    }
  }

  if (db && article.id) {
    try {
      const { id, ...data } = article;
      const articleDoc = doc(db, "articles", id);
      await updateDoc(articleDoc, { ...data });
    } catch (e) {
      console.error("Firebase update failed:", e);
    }
  }
};

export const removeArticleFromDB = async (id: string): Promise<void> => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    const articles: Article[] = JSON.parse(saved);
    const newArticles = articles.filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newArticles));
    window.dispatchEvent(new Event('storage'));
  }

  if (db) {
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (e) {
      console.error("Firebase delete failed:", e);
    }
  }
};

export const saveArticlesToDB = async (articles: Article[]): Promise<void> => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
  window.dispatchEvent(new Event('storage'));
  
  if (articlesRef) {
    for (const article of articles) {
      await addArticleToDB(article);
    }
  }
};

export const initDB = async () => {};
