import {
  doc,
  runTransaction,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase.js";

const VISITOR_KEY = "docreplacer_visitor_id";
const SYNC_KEY = "docreplacer_profile_synced";

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

function statsRef() {
  return doc(db, "stats", "aggregates");
}

function userRef(visitorId) {
  return doc(db, "users", visitorId);
}

/**
 * Call once when the doc builder app loads (/app).
 * First-ever browser: creates user row and bumps uniqueVisitors.
 * Returning: bumps visitCount and lastVisitAt.
 */
export async function recordSessionVisit() {
  if (!db) return;
  const visitorId = getVisitorId();
  const synced = (() => {
    try {
      return localStorage.getItem(SYNC_KEY);
    } catch {
      return null;
    }
  })();

  try {
    if (!synced) {
      await runTransaction(db, async (transaction) => {
        const uref = userRef(visitorId);
        const snap = await transaction.get(uref);
        if (!snap.exists()) {
          transaction.set(uref, {
            visitorId,
            createdAt: serverTimestamp(),
            lastVisitAt: serverTimestamp(),
            visitCount: 1,
            promptCount: 0,
            buildDocxCount: 0,
            downloadCount: 0,
          });
          transaction.set(
            statsRef(),
            { uniqueVisitors: increment(1) },
            { merge: true }
          );
        } else {
          transaction.update(uref, {
            lastVisitAt: serverTimestamp(),
            visitCount: increment(1),
          });
        }
      });
      try {
        localStorage.setItem(SYNC_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      await updateDoc(userRef(visitorId), {
        lastVisitAt: serverTimestamp(),
        visitCount: increment(1),
      });
    }
  } catch (e) {
    console.warn("[tracking] recordSessionVisit failed", e);
  }
}

export async function trackPromptSubmitted() {
  if (!db) return;
  try {
    await updateDoc(userRef(getVisitorId()), {
      promptCount: increment(1),
      lastPromptAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[tracking] trackPromptSubmitted failed", e);
  }
}

export async function trackBuildDocx() {
  if (!db) return;
  try {
    await updateDoc(userRef(getVisitorId()), {
      buildDocxCount: increment(1),
      lastBuildDocxAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[tracking] trackBuildDocx failed", e);
  }
}

/**
 * @param {{ rating?: number | null; comment?: string }} opts
 */
export async function trackDownloadWithFeedback(opts = {}) {
  if (!db) return;
  const visitorId = getVisitorId();
  const rating =
    typeof opts.rating === "number" && opts.rating >= 1 && opts.rating <= 5
      ? opts.rating
      : null;
  const comment =
    typeof opts.comment === "string" ? opts.comment.trim().slice(0, 2000) : "";

  try {
    await updateDoc(userRef(visitorId), {
      downloadCount: increment(1),
      lastDownloadAt: serverTimestamp(),
      lastDownloadRating: rating,
      lastDownloadComment: comment || null,
    });
  } catch (e) {
    console.warn("[tracking] trackDownload user update failed", e);
  }

  try {
    await addDoc(collection(db, "downloadFeedback"), {
      visitorId,
      rating,
      comment: comment || null,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("[tracking] downloadFeedback log failed", e);
  }
}
