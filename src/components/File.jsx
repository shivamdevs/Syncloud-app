import { ContextMenu, ContextMenuItem, ContextMenuTrigger } from 'myoasis-contextmenu';
import React, { useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Context from '../app/Context';
import { formatBytes, getDisplayDate } from '../app/Function';
import css from "./../styles/File.module.css";

function File({ file = {} }) {
    const { goto, options } = useContext(Context);

    const location = useLocation();

    const item = useRef();

    const redirected = (() => {
        if (location.hash) {
            const hash = location.hash.slice(1);
            if (hash === file.id) return true;
        }
        return false;
    })();

    if (options.display === "list") {
        return (
            <>
                <ContextMenuTrigger menu={`file-list-${file.id}-${file.key}`} id={`file-${file.id}`}>
                    <tr className={css.list} data-redirected={redirected}>
                        <td className={css.image} data-type={file.type}>
                            {file.type === "folder" ? <i className="fas fa-folder"></i> : <i className="fas fa-file"></i>}
                            <span className={css.screen} onDoubleClick={() => (file.type === "folder" ? goto(file.id) : null)}></span>
                        </td>
                        <td className={css.name}>{file.name}</td>
                        <td className={css.modify}>{getDisplayDate(file.modified)}</td>
                        <td className={css.size}>{file.size ? formatBytes(file.size) : "—"}</td>
                    </tr>
                    <ContextMenu className="contextmenu" menu={`file-list-${file.id}-${file.key}`}>
                        {file.type === "folder" && <>
                            <ContextMenuItem className="contextmenuitem" onClick={() => goto(file.id)}><i className="fas fa-fw fa-folder-open"></i> Open</ContextMenuItem>
                            <ContextMenuItem className="contextmenuitem" onClick={() => window.open(file.id)}><i className="fas fa-fw fa-up-right-from-square"></i> Open in a new tab</ContextMenuItem>
                            <span className="line-break"></span>
                        </>}
                        <ContextMenuItem className="contextmenuitem" onClick={null}><i className="fas fa-fw fa-file-pen"></i> Rename</ContextMenuItem>
                        <ContextMenuItem className="contextmenuitem" onClick={null}><i className="fas fa-fw fa-trash"></i> Delete</ContextMenuItem>
                    </ContextMenu>
                </ContextMenuTrigger>
            </>
        );
    }
    return (
        <>
            <ContextMenuTrigger menu={`file-${file.id}-${file.key}`} id={`file-${file.id}`} className={css.grid} data-redirected={redirected} innerref={item}>
                <div className={css.image} data-type={file.type}>
                    {file.type === "folder" ? <i className="fas fa-folder"></i> : <i className="fas fa-file"></i>}
                </div>
                <div className={css.name}>{file.name}</div>
                <span className={css.screen} onDoubleClick={() => (file.type === "folder" ? goto(file.id) : null)}></span>
            </ContextMenuTrigger>
            <ContextMenu className="contextmenu" menu={`file-${file.id}-${file.key}`}>
                {file.type === "folder" && <>
                    <ContextMenuItem className="contextmenuitem" onClick={() => goto(file.id)}><i className="fas fa-fw fa-folder-open"></i> Open</ContextMenuItem>
                    <ContextMenuItem className="contextmenuitem" onClick={() => window.open(file.id)}><i className="fas fa-fw fa-up-right-from-square"></i> Open in a new tab</ContextMenuItem>
                    <span className="line-break"></span>
                </>}
                <ContextMenuItem className="contextmenuitem" onClick={null}><i className="fas fa-fw fa-file-pen"></i> Rename</ContextMenuItem>
                <ContextMenuItem className="contextmenuitem" onClick={null}><i className="fas fa-fw fa-trash"></i> Delete</ContextMenuItem>
            </ContextMenu>
        </>
    );
};

export default File;