import { addDoc, onSnapshot } from "firebase/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "./user";
import generateUniqueId from "generate-unique-id";


const table = {
    library: "syncloud-library",
};

function snapLibrary(user, resolve, reject) {
    const q = query(collection(db, table.library), where("uid", "==", user.uid));
    const snap = onSnapshot(q, resolve, reject);
    return snap;
}

let querysnap = null;

export default function snapShot(user, resolve, reject) {
    if (!querysnap) {
        querysnap = {
            library: {
                event: snapLibrary(user, snap => {
                    if (querysnap.library.values === null || snap.docChanges().length) {
                        querysnap.library.values = snap.docs;
                        callback();
                    }
                }, reject),
                values: null,
            },
        };
    }
    function callback() {
        const result = {
            childrenEverysingle: [],
            childrenFromParent: {},
        };
        if (querysnap.library.values) {
            querysnap.library.values.forEach(item => {
                const data = {...item.data(), id: item.id, docRef: item};
                let parentArray = result.childrenFromParent[data.parent];
                if (!parentArray) parentArray = (result.childrenFromParent[data.parent] = []);

                parentArray.push(data);
                result.childrenEverysingle.push(data);

            });
        } else {
            result.childrenEverysingle = [];
            result.childrenFromParent = {};
        }
        resolve(result);
    }
    callback();
}

export function unsnapShot() {
    querysnap?.library?.event();
    querysnap = null;
}


export async function uploadToLibrary(user, file, parent, { before, success, reject }) {
    const date = Date.now();
    const data = {
        name: (() => {
            const splits = file.name.split(".");
            if (splits.length > 1) splits.pop();
            return splits.join(".");
        })(),
        type: (() => {
            const splits = file.name.split(".");
            return splits[splits.length - 1];
        })(),
    };
    const me = { ...user };
    const unique = generateUniqueId({ length: 32 });
    const post = {
        key: unique,
        uid: me.uid,
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded: date,
        modified: date,
        extension: data.type,
        parent: parent || "default",
    };
    before && before({ ...post });
    try {
        setTimeout(async () => {
            await addDoc(collection(db, table.library), post);
            success && success({ ...post });
        }, Math.min(file.size / 5000, 5000), Math.min(file.size / 100, 100));
    } catch (error) {
        console.error(error);
        reject && reject(error);
    }
}

export async function addFolderToLibrary(user, name, parent, { before, success, reject }) {
    const date = Date.now();
    const me = { ...user };
    const unique = generateUniqueId({ length: 32 });
    const post = {
        key: unique,
        uid: me.uid,
        name: name,
        type: "folder",
        parent: parent || "default",
        uploaded: date,
        modified: date,
    };
    before && before({ ...post });
    try {
        const data = await addDoc(collection(db, table.library), post);
        success && success({ ...post, id: data.id });
    } catch (error) {
        console.error(error);
        reject && reject(error);
    }
}