import { addDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { collection, query, where } from "firebase/firestore";
import app from "./app.data";
import { db } from "./user";
import uniqid from 'uniqid';
import CryptoJS from "crypto-js";
import generateUniqueId from "generate-unique-id";


const table = {
    connect: "chat-connects",
    message: "chat-messages",
};

function snapHistory(user, resolve, reject) {
    const q = query(collection(db, table.connect), where(user.uid, "==", user.uid));
    const snap = onSnapshot(q, resolve, reject);
    return snap;
}

function snapUsers(resolve, reject) {
    const snap = onSnapshot(collection(db, "users"), resolve, reject);
    return snap;
}

let querysnap = null;

export default function snapShot(user, resolve, reject) {
    if (!querysnap) {
        querysnap = {
            history: {
                event: snapHistory(user, snap => {
                    if (querysnap.history.values === null || snap.docChanges().length) {
                        querysnap.history.values = snap.docs;
                        callback();
                    }
                }, reject),
                values: null,
            },
            users: {
                event: snapUsers(snap => {
                    if (querysnap.users.values === null || snap.docChanges().length) {
                        querysnap.users.values = snap.docs;
                        callback();
                    }
                }, reject),
                values: null,
            },
        };
    }
    function callback() {
        const result = {
            connections: {},
            messageHistory: [],
            connectedUsers: [],
            usersList: [],
            usersListByUid: {},
        };
        if (querysnap.history.values) {
            querysnap.history.values.forEach(shots => {
                const data = shots.data();

                const frienduid = (() => {
                    if (user.uid === data.users[0]) return data.users[1];
                    if (user.uid === data.users[1]) return data.users[0];
                })();

                result.connections[frienduid] = shots.id;
                result.connections[shots.id] = frienduid;
                result.connectedUsers.push(frienduid);

                data.updated && result.messageHistory.push({
                    id: shots.id,
                    uid: frienduid,
                    sender: (data.sender === user.uid),
                    recent: data.updated,
                    content: data.content,
                    encrypt: data.encrypt,
                });
            });
            result.messageHistory = result.messageHistory.sort((a, b) => a.recent - b.recent).reverse();
        } else {
            result.connections = null;
            result.messageHistory = null;
            result.connectedUsers = null;
        }
        if (querysnap.users.values) {
            querysnap.users.values.forEach((users) => {
                const data = users.data();
                result.usersList.push(data);
                result.usersListByUid[data.uid] = data;
            });
        } else {
            result.usersList = null;
            result.usersListByUid = null;
        }
        resolve(result);
    }
    callback();
}

export function unsnapShot() {
    querysnap?.history?.event();
    querysnap?.users?.event();
    querysnap = null;
}

function snapChats(bind, resolve, reject) {
    const q = query(collection(db, table.message), where("connect", "==", bind));
    const snap = onSnapshot(q, { includeMetadataChanges: true }, resolve, reject);
    return snap;
}
let querychatsnap = null;

export function snapMessageChannel(bond, resolve, reject) {
    if (!querychatsnap) {
        if (!bond) {
            unsnapMessageChannel();
            return callback();
        }
        querychatsnap = {
            event: snapChats(bond, (snap) => {
                if (querychatsnap.values === null || snap.docChanges().length) {
                    querychatsnap.values = [];
                    if (!snap.empty) {
                        snap.docs.forEach((chats) => {
                            const data = chats.data();
                            querychatsnap.values.push({ ...data, id: chats.id });
                        });
                    }
                    callback();
                }
            }, reject),
            values: null,
        };
    }
    function callback() {
        resolve(querychatsnap?.values);
    }
    callback();
}
export function unsnapMessageChannel() {
    querychatsnap?.event();
    querychatsnap = null;
}



let bufferMessages = {};

if (window.sessionStorage) {
    let buffer = window.sessionStorage.getItem(`${app.bucket}buffer`);
    if (buffer !== null) {
        try {
            buffer = JSON.parse(buffer);
            bufferMessages = buffer;
        } catch (error) { }
    }
}

export function setBufferMesage(key, value) {
    if (value) {
        bufferMessages[key] = value;
    } else {
        delete bufferMessages[key];
    }
    if (window.sessionStorage) window.sessionStorage.setItem(`${app.bucket}buffer`, JSON.stringify(bufferMessages));
}
export function getBufferMesage(key) {
    return bufferMessages[key];
}

let friendBonding = null;

export async function createFriendBond(user, friend) {
    if (friendBonding) return "Still creating previous id";
    friendBonding = true;
    const date = (() => {
        const d = new Date();
        return {
            now: d.getTime(),
            date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
            print: `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "am" : "pm"}`,
        };
    })();
    const me = { ...user };
    const bond = { ...friend };
    const addbond = {
        users: [
            me.uid,
            bond.uid,
        ],
        created: date.now,
    };
    addbond[me.uid] = me.uid;
    addbond[bond.uid] = bond.uid;
    try {
        const getkey = await addDoc(collection(db, table.connect), addbond);
        friendBonding = null;
        return getkey;
    } catch (error) {
        console.error(error);
        friendBonding = null;
        return error;
    }
}

export async function sendMessage(message, connect, user, friend, before, reject) {
    const date = (() => {
        const d = new Date();
        return {
            now: d.getTime(),
            date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
            print: `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "am" : "pm"}`,
        };
    })();
    const me = { ...user };
    const bond = { ...friend };
    const encrypt = uniqid();
    const unique = generateUniqueId({ length: 32 });
    const post = {
        id: unique,
        key: unique,
        sent: date.print,
        groupby: date.date,
        sortby: date.now,
        content: CryptoJS.AES.encrypt(message, encrypt).toString(),
        sender: me.uid,
        connect: connect,
        encrypt: encrypt,
    };
    before({...post});
    try {
        if (!post.connect) {
            const getKey = await createFriendBond(me, bond);
            if (getKey.id) {
                post.connect = getKey.id;
            } else {
                return reject(getKey);
            }
        }
        const updates = {
            content: post.content,
            updated: post.sortby,
            sender: post.sender,
            encrypt: post.encrypt,
        }
        await updateDoc(doc(db, table.connect, post.connect), updates);
        await addDoc(collection(db, table.message), post);
    } catch (error) {
        console.error(error);
        reject(error);
    }
}