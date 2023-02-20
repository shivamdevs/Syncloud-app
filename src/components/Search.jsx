import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import css from './../styles/Layout.module.css';

function Search() {
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState(false);
    const [result, setResult] = useState([]);

    const input = useRef();
    const section = useRef();

    useEffect(() => {
        setResult([]);
        if (search.trim()) {
            setResult([
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
                { id: "google", name: "Google" },
            ]);
        }
    }, [search]);

    useEffect(() => {
        const handle = ({target}) => {
            if (!section?.current?.contains(target)) setFocused(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);
    return (
        <section className={css.search} ref={section} data-focused={focused}>
            <span className={css.searchicon}>
                <i className="fas fa-search"></i>
            </span>
            <input type="search" placeholder="Search everything..." value={search} ref={input} onFocus={() => setFocused(true)} onChange={({ target }) => setSearch(target.value)} className={css.searchbox} />
            {search && <Tippy content="Clear search"><button className={classNames("btnround", css.searchclear)} onClick={() => { setSearch(""); input?.current?.focus() }}><i className="fas fa-times"></i></button></Tippy>}
            <div className={css.resultbox}>
                <div className={css.results}>
                    {result.map(item => <div key={item.id} className={css.resultitem}>{item.name}</div>)}
                </div>
            </div>
        </section>
    );
};

export default Search;