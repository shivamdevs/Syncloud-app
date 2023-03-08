import React, { useContext, useEffect } from 'react';
import css from './../styles/Layout.module.css';
import Context from "./../app/Context";
import { Link, Route, Routes, useParams } from 'react-router-dom';
import Search from './Search';
import { ContextMenuTrigger, ContextMenuItem, ContextMenu } from 'myoasis-contextmenu';
import { logout } from '../firebase/user';
import Tippy, { tippy } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import classNames from 'classnames';
import Editor from './Editor';
import Adder from './Adder';
import Folder from './Folder';

tippy.setDefaultProps({
    arrow: false,
    animation: "shift-away",
    delay: [200, 0],
    theme: "apply",
});

function Index() {
    const { user, userLoading, goto, updateTheme, options, editor } = useContext(Context);
    return (
        <>
            <div className={classNames("no-focus", css.layout)}>
                <header className={css.header}>
                    <div className={css.logo}>
                        <img src="/icons/favicon.svg" alt="" className={css.logoimage} />
                        <span className={css.logotext}>Syncloud</span>
                    </div>
                    {!userLoading && user && <>
                        <Search />
                        <div className={css.options}>
                            <Tippy content={options.theme === "dark" ? "Light mode" : "Dark mode"}>
                                <button className="btnround" onClick={() => updateTheme(options.theme === "dark" ? "" : "dark")}>
                                    {options.theme === "dark" ? <i className="fas fa-sun-bright"></i> : <i className="fas fa-moon-stars"></i>}
                                </button>
                            </Tippy>
                            <Tippy content="Settings">
                                <button className="btnround"><i className="far fa-cog"></i></button>
                            </Tippy>
                            <ContextMenuTrigger menu="user-options" exact={false} trigger="click" className={css.user}>
                                <Tippy content="User options">
                                    <img src={user.photoURL} alt="" tabIndex={0} />
                                </Tippy>
                            </ContextMenuTrigger>
                            <ContextMenu className="contextmenu" animation="spring" menu="user-options">
                                <div className={css.username}>{user.displayName}</div>
                                <small className={css.username}>{user.email}</small>
                                <span className="line-break"></span>
                                <ContextMenuItem className="contextmenuitem" onClick={() => goto("/accounts/profile")}><i className="far fa-user-edit fa-fw"></i> Edit profile</ContextMenuItem>
                                <ContextMenuItem className="contextmenuitem" onClick={logout}><i className="far fa-fw fa-power-off"></i> Logout</ContextMenuItem>
                            </ContextMenu>
                        </div>
                    </>}
                    {!userLoading && !user && <div className={css.options}>
                        <Link to="/accounts" className="btnbig">Signin</Link>
                    </div>}
                </header>
                {user && <section className={css.container}>
                    <aside className={classNames(css.sidebar, css.sideleft)}>
                        <Adder />
                    </aside>
                    <main className={css.main}>
                        <Folder />
                    </main>
                </section>}
            </div>
            <Routes>
                <Route path="/:parent" element={<SetPath />} />
                <Route path="/" element={<SetPath />} />
            </Routes>
            {editor && <Editor />}
        </>
    );
};

export default Index;


function SetPath() {
    const { setParent } = useContext(Context);
    const params = useParams();

    useEffect(() => {
        setParent(params?.parent || "default");
    }, [params?.parent, setParent]);
}