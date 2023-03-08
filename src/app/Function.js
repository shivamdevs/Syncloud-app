import Data from "./Data";

export const randomNumber = (min = 0, max = 9) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const randomString = (length = 5) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
};

export const setTitle = (...titles) => {
    let title = "";
    titles.forEach(one => one && (title += one + " • "));
    title += Data.title;
    document.title = title;
};


export function getDisplayDate(time, show = false) {
    const today = new Date();
    const onday = new Date(time);
    const datefrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateto = new Date(onday.getFullYear(), onday.getMonth(), onday.getDate());
    const diff = datefrom.getTime() - dateto.getTime();
    const print = {
        date: `${String(onday.getDate()).padStart(2, "0")}-${String(onday.getMonth() + 1).padStart(2, "0")}-${onday.getFullYear()}`,
        time: `${onday.getHours() % 12 || 12}:${String(onday.getMinutes()).padStart(2, "0")} ${onday.getHours() < 12 ? "am" : "pm"}`,
        short: `${onday.getDate()}-${onday.getMonth() + 1}`,
    };
    if (datefrom.getTime() === dateto.getTime()) {
        return (show ? "Today" : print.time);
    } else if (diff <= (24 * 60 * 60 * 1000)) {
        return "Yesterday";
    } else {
        return print.date;
    }
}

export function buildFileTree(fileList) {
    const tree = {};

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const path = file.webkitRelativePath || file.relativePath || file.name;
        const pathParts = path.split('/');

        let currentNode = tree;
        for (let j = 0; j < pathParts.length; j++) {
            const part = pathParts[j];
            if (!currentNode[part]) {
                currentNode[part] = j === pathParts.length - 1 ? file : {};
            }
            currentNode = currentNode[part];
        }
    }

    return tree;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}









export function deepMatchingScore(sentence1, sentence2) {
    const words1 = sentence1.split(" ");
    const words2 = sentence2.split(" ");
    const scores = [];
    for (let i = 0; i < words1.length; i++) {
        scores[i] = [];
        for (let j = 0; j < words2.length; j++) {
            scores[i][j] = 0;
        }
    }
    for (let i = 0; i < words1.length; i++) {
        for (let j = 0; j < words2.length; j++) {
            if (words1[i] === words2[j]) {
                scores[i][j] = 1;
            } else {
                const distance = levenshteinDistance(words1[i], words2[j]);
                scores[i][j] = 1 - (distance / Math.max(words1[i].length, words2[j].length));
            }
        }
    }
    let totalScore = 0;
    for (let i = 0; i < words1.length; i++) {
        const maxScore = Math.max(...scores[i]);
        totalScore += maxScore;
    }
    const matchingScore = totalScore / words1.length;
    return matchingScore;
}

function levenshteinDistance(s, t) {
    if (s.length === 0) return t.length;
    if (t.length === 0) return s.length;

    const d = [];
    for (let i = 0; i <= s.length; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (let j = 0; j <= t.length; j++) {
        d[0][j] = j;
    }
    for (let j = 1; j <= t.length; j++) {
        for (let i = 1; i <= s.length; i++) {
            if (s[i - 1] === t[j - 1]) {
                d[i][j] = d[i - 1][j - 1];
            } else {
                d[i][j] = Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]) + 1;
            }
        }
    }
    return d[s.length][t.length];
}