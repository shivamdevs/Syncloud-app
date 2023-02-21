import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import reactStringReplace from 'react-string-replace';
import Context from '../app/Context';
import { deepMatchingScore } from '../app/Function';
import css from './../styles/Layout.module.css';

function Search() {
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState(false);
    const [result, setResult] = useState([]);
    const { childrenEverysingle: files } = useContext(Context);

    const input = useRef();
    const section = useRef();

    useEffect(() => {
        setResult([]);
        if (files && search.trim()) {
            let res = files.map(snap => { return { match: Number((deepMatchingScore(search.trim(), snap.name) * 100).toFixed(0)), data: snap}});
            res.sort((a, b) => b.match - a.match);
            res = res.filter(snap => snap.match > 30);
            setResult(res.map(snap => snap.data));
        }
    }, [files, search]);

    useEffect(() => {
        const handle = ({ target }) => {
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
                    <div className={css.resultwarn}>Search 5-6 characters to get strong results...</div>
                    {result.map(item => <div key={item.id} className={css.resultitem}>
                        <div className={css.resulticon} data-type={item.type}>
                            {item.type === "folder" ? <i className="fas fa-folder"></i> : <i className="fas fa-file"></i>}
                        </div>
                        <div className={css.resulttext}>{(search ? reactStringReplace(item.name, search, (match, i) => <span className={css.resultbold} key={i}>{match}</span>) : item.name)}</div>
                    </div>)}
                    {search && result?.length === 0 && <div className={css.resultnull}>No match found</div>}
                </div>
            </div>
        </section>
    );
};

export default Search;