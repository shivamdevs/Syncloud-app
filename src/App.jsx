import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from './firebase/user';
import { useAuthState } from "react-firebase-hooks/auth";
import Accounts from "myoasis-accounts";
import Context from "./app/Context";
import Index from "./components/Index";

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    useEffect(() => {
    }, [user]);

    const context = {

        user,
        userError: error,
        userLoading: loading,

        goto(to, replace = false) {
            const url = new URL(to, window?.location.origin);
            if (url.pathname === location.pathname) return;
            navigate(to, { replace: replace });
        },
        back() {
            if (location.key !== "default" && location.pathname !== "/") {
                navigate(-1);
            } else {
                navigate("/", { replace: true });
            }
        },
    };

    return (
        <Context.Provider value={context}>
            <Routes>
                <Route path="/accounts/*" element={<Accounts onUserChange={context.back} />} />
                <Route path="/*" element={<Index />} />
            </Routes>
        </Context.Provider>
    );
};

export default App;