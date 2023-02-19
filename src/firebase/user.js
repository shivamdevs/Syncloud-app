import { initializeApp } from "firebase/app";
import {
    getAuth,
    signOut
} from "firebase/auth";
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import generate from "generate-unique-id";
import appdata from "../app/Data";

const firebaseConfig = {
    apiKey: "AIzaSyAuT7owM2lF6JqmWUionKIM1vQ2pOHgzRM",
    authDomain: "my-oasis-tech.firebaseapp.com",
    projectId: "my-oasis-tech",
    storageBucket: "my-oasis-tech.appspot.com",
    messagingSenderId: "180046491267",
    appId: "1:180046491267:web:f184a60c760b8c0eb375b6",
    measurementId: "G-WJZGXF8F3L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logout = async () => {
    if (window.localStorage) window.localStorage.removeItem(`${appdata.bucket}searches`);
    await signOut(auth);
};

async function getUniqueFirebaseId(tb, length = 16) {
    return new Promise(async function (resolve, reject) {
        try {
            let found = false, id = null;
            while (!found) {
                id = generate({ length });
                const data = await getDoc(doc(db, tb, id));
                found = !data.exists();
            }
            resolve({ type: "success", data: id });
        } catch (err) {
            console.error(err);
            reject({ type: "error", data: err });
        }
    });
}

export {
    db,
    auth,
    logout,
    getUniqueFirebaseId,
};