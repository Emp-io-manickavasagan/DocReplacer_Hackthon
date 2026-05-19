import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function configOk() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

let db = null;
let app = null;
if (configOk()) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// ─── Session / User Tracking ────────────────────────────────────────────────
function getSessionId() {
  let sid = sessionStorage.getItem("dr_sid");
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    sessionStorage.setItem("dr_sid", sid);
  }
  return sid;
}

export async function trackPageView(page) {
  if (!db) return;
  try {
    await addDoc(collection(db, "pageviews"), {
      sessionId: getSessionId(),
      page,
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      timestamp: serverTimestamp(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    });
  } catch (_) { /* silent */ }
}

export async function trackDocGeneration(prompt) {
  if (!db) return;
  try {
    await addDoc(collection(db, "doc_generations"), {
      sessionId: getSessionId(),
      prompt: prompt ? prompt.substring(0, 1000) : "",
      timestamp: serverTimestamp(),
    });
  } catch (_) { /* silent */ }
}

// ─── Blog Reading ───────────────────────────────────────────────────────────
export async function getPublishedBlogs() {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "blogs"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error fetching blogs:", e);
    return [];
  }
}

export async function getBlogBySlug(slug) {
  if (!db) return null;
  try {
    const q = query(
      collection(db, "blogs"),
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (e) {
    console.error("Error fetching blog:", e);
    return null;
  }
}

export { db };