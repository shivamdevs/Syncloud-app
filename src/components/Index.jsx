import React, { useContext } from 'react';
import css from './../styles/Layout.module.css';
import Context from "./../app/Context";
import { Link } from 'react-router-dom';
import Search from './Search';
import { ContextMenuTrigger, ContextMenuItem, ContextMenu } from 'myoasis-contextmenu';
import { logout } from '../firebase/user';
import Tippy, { tippy } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import classNames from 'classnames';

tippy.setDefaultProps({
    arrow: false,
    animation: "shift-away",
    delay: [200, 0],
    theme: "apply",
});

function Index() {
    const { user, userLoading, goto, updateTheme } = useContext(Context);
    console.log(user);
    return (
        <div className={css.layout}>
            <header className={css.header}>
                <div className={css.logo}>
                    <img src="/icons/favicon.svg" alt="" className={css.logoimage} />
                    <span className={css.logotext}>Syncloud</span>
                </div>
                {!userLoading && user && <>
                    <Search />
                    <div className={css.options}>
                        <Tippy content="Settings">
                            <button className="btnround"><i className="far fa-cog"></i></button>
                        </Tippy>
                        <ContextMenuTrigger menu="user-options" exact={false} trigger="click" className={css.user}>
                            <Tippy content="User options">
                                <img src={user.photoURL} alt="" />
                            </Tippy>
                        </ContextMenuTrigger>
                        <ContextMenu className="contextmenu" animation="spring" menu="user-options">
                            <ContextMenuItem className="contextmenuitem" onClick={() => goto("/accounts/profile")}><i className="far fa-user-edit"></i> Edit profile</ContextMenuItem>
                            <ContextMenuItem className="contextmenuitem" onClick={logout}><i className="far fa-power-off"></i> Logout</ContextMenuItem>
                        </ContextMenu>
                    </div>
                </>}
                {!userLoading && !user && <div className={css.options}>
                    <Link to="/accounts" className="btnbig">Signin</Link>
                </div>}
            </header>
            <section className={css.container}>
                <aside className={classNames(css.sidebar, css.sideleft)}>

                </aside>
            </section>
            <footer className={css.footer}>
                <div className={css.context}>
                    <div className={css.contextline}></div>
                </div>
                <div className={css.items}>
                    <ContextMenuTrigger menu="theme-options" trigger="click" exact={false}>
                        <Tippy content="Change Theme">
                            <span className={css.fops}>Theme <i className="fas fa-chevron-up"></i></span>
                        </Tippy>
                    </ContextMenuTrigger>
                    <ContextMenu className="contextmenu negative" animation="spring" menu="theme-options">
                        <ContextMenuItem className="contextmenuitem" onClick={() => updateTheme("light")}><i className="fas fa-sun-bright"></i> Light</ContextMenuItem>
                        <ContextMenuItem className="contextmenuitem" onClick={() => updateTheme("dark")}><i className="fas fa-moon-stars"></i> Dark</ContextMenuItem>
                    </ContextMenu>
                    <ContextMenuTrigger menu="view-options" trigger="click" exact={false}>
                        <Tippy content="View">
                            <span className={css.fops}>View <i className="fas fa-chevron-up"></i></span>
                        </Tippy>
                    </ContextMenuTrigger>
                    <ContextMenu className="contextmenu negative" animation="spring" menu="view-options">
                        <ContextMenuItem className="contextmenuitem"><i className="fas fa-grid-2"></i> Icons</ContextMenuItem>
                        <ContextMenuItem className="contextmenuitem"><i className="fas fa-line-columns"></i> List</ContextMenuItem>
                        <ContextMenuItem className="contextmenuitem"><i className="far fa-bars"></i> Details</ContextMenuItem>
                    </ContextMenu>
                </div>
            </footer>
        </div>
    );
};

export default Index;