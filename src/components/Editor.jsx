import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import React, { useContext, useEffect } from 'react';
import Context from '../app/Context';
import css from "./../styles/Editor.module.css";

function Editor() {
    const { editor, setEditor } = useContext(Context);

    useEffect(() => {
        const items = [];
        document.querySelectorAll(".no-focus").forEach(focus => {
            focus.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])').forEach(item => {
                item.dataset.tabindex = item.getAttribute("tabindex") ?? "nil";
                item.setAttribute("tabindex", -1);
                items.push(item);
            });
        });
        return () => {
            items.forEach(item => {
                if (!document.contains(item)) return;
                if (item.dataset.tabindex === "nil") {
                    item.removeAttribute("tabindex");
                } else {
                    item.setAttribute("tabindex", item.dataset.tabindex);
                }
                delete item.dataset.tabindex;
            });
        }
    }, []);
    return (
        <section className={css.editor}>
            <div className={css.main}>
                <div className={css.header}>
                    <div className={css.title}>{editor.title}</div>
                    <Tippy content="Close">
                        <button className={classNames("btnround", css.button)} onClick={() => setEditor(null)}><i className="fas fa-times"></i></button>
                    </Tippy>
                </div>
                <input type="text" required className={css.input} autoFocus placeholder={`${editor.label}...`} />
            </div>
        </section>
    );
};

export default Editor;