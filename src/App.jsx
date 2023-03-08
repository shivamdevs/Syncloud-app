import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from './firebase/user';
import { useAuthState } from "react-firebase-hooks/auth";
import Accounts from "myoasis-accounts";
import Context from "./app/Context";
import Index from "./components/Index";
import Data from "./app/Data";
import snapShot, { unsnapShot } from "./firebase/sync";
import { toast, Toaster } from "react-hot-toast";

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, loading, error] = useAuthState(auth);

    const [local, setLocal] = useState(() => {
        if (window.localStorage) {
            const storage = window.localStorage.getItem(`${Data.bucket}settings`);
            try {
                return storage ? JSON.parse(storage) : {};
            } catch (error) {
                return {};
            }
        }
        return {};
    });
    const [editor, setEditor] = useState(null);
    const [parent, setParent] = useState("default");
    const [uploader, setUploader] = useState([]);

    const [childrenFromParent, setChildrenFromParent] = useState(null);
    const [childrenEverysingle, setChildrenEverysingle] = useState(null);


    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    function updateLocal(key, value) {
        setLocal((old) => {
            const list = {...old};
            list[key] = value;
            return list;
        })
    }

    useEffect(() => {
        if (window.localStorage) window.localStorage.setItem(`${Data.bucket}settings`, JSON.stringify(local));
        document.documentElement.dataset.theme = local["theme"];
    }, [local]);

    useEffect(() => {
        if (user) {
            snapShot(user, (snap) => {
                // console.log(snap);
                setChildrenFromParent(snap.childrenFromParent);
                setChildrenEverysingle(snap.childrenEverysingle);
            }, (err) => {
                toast.error(String(err));
            })
        } else {
            setChildrenFromParent(null);
            setChildrenEverysingle(null);
            unsnapShot();
        }
    }, [user, user?.uid]);

    const context = {

        options: local,

        editor,
        setEditor,

        uploader,
        setUploader,

        parent,
        setParent,

        user,
        userError: error,
        userLoading: loading,

        childrenFromParent,

        childrenEverysingle,

        goto(to, replace = false) {
            const url = new URL(to, window?.location.origin);
            if (url.href === location.href) return;
            navigate(to, { replace: replace });
        },
        back() {
            if (location.key !== "default" && location.pathname !== "/") {
                navigate(-1);
            } else {
                navigate("/", { replace: true });
            }
        },
        updateTheme(theme) {
            if (theme !== "dark") theme = "";
            updateLocal("theme", theme);
        },
        updateDisplay(display) {
            if (display !== "list") display = "";
            updateLocal("display", display);
        },
    };

    return (
        <Context.Provider value={context}>
            <Routes>
                <Route path="/accounts/*" element={<Accounts onUserChange={context.back} />} />
                <Route path="/*" element={<Index />} />
            </Routes>
            <Toaster position="bottom-center" />
        </Context.Provider>
    );
};

export default App;