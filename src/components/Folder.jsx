import React, { useContext, useEffect, useState } from 'react';
import Context from '../app/Context';
import File from './File';
import css from "./../styles/Folder.module.css";
import classNames from 'classnames';
import sortBy from 'sort-by';
import Uploader from './Uploader';
import Tippy from '@tippyjs/react';
import { ContextMenu, ContextMenuItem, ContextMenuTrigger } from 'myoasis-contextmenu';
import { addFolderToLibrary, uploadToLibrary } from '../firebase/sync';
import { toast } from 'react-hot-toast';
import { buildFileTree } from '../app/Function';

function Folder() {
    const { user, setUploader, parent, childrenFromParent, options, uploader, updateDisplay, setEditor } = useContext(Context);

    const [items, setItems] = useState([]);

    const select = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "*";
        input.oninput = async () => {
            const files = input.files;
            if (files.length) {
                for (const file of files) {
                    uploadToLibrary(user, file, parent, {
                        before(snap) {
                            setUploader(old => [{ ...snap, pending: true }, ...old]);
                        },
                        success(snap) {
                            setUploader(old => {
                                const list = [...old];
                                for (const item of list) {
                                    if (item.key === snap.key) {
                                        item.pending = false;
                                        break;
                                    }
                                }
                                return list;
                            });
                        },
                        reject(err) {
                            toast.error(String(err));
                        }
                    });
                }
            }
        };
        input.click();
    };
    const selectFolder = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.directory = true;
        input.multiple = true;
        input.accept = "*";
        input.oninput = async () => {

            function traverseFolder(tree, parent, snapid) {
                for (const key in tree) {
                    if (Object.hasOwnProperty.call(tree, key)) {
                        const item = tree[key];
                        if (item instanceof File) {
                            uploadToLibrary(user, item, parent, {
                                success(snap) {
                                    setUploader(old => {
                                        const list = [...old];
                                        for (const fold of list) {
                                            if (fold.key === snapid) {
                                                fold.pending = fold.pending > 0 ? fold.pending - 1 : 0;
                                                break;
                                            }
                                        }
                                        return list;
                                    });
                                },
                                reject(err) {
                                    toast.error(String(err));
                                }
                            });
                        } else {
                            addFolderToLibrary(user, key, parent, {
                                success(snap) {
                                    traverseFolder(item, snap.id, snapid);
                                },
                                reject(err) {
                                    toast.error(String(err));
                                }
                            });
                        }
                    }
                }
            }

            const files = input.files;
            if (files.length) {
                const tree = buildFileTree(files);
                const folder = Object.keys(tree)[0];
                addFolderToLibrary(user, folder, parent, {
                    before(snap) {
                        setUploader(old => [{ ...snap, pending: files.length, total: files.length }, ...old]);
                    },
                    success(snap) {
                        traverseFolder(tree[folder], snap.id, snap.key);
                    },
                    reject(err) {
                        toast.error(String(err));
                    }
                });
            }
        };
        input.click();
    };

    useEffect(() => {
        if (childrenFromParent && parent) {
            let list = childrenFromParent[parent];
            if (list) {
                const folders = [], files = [];
                for (const item of list) {
                    if (item.type === "folder") {
                        folders.push(item);
                    } else {
                        files.push(item);
                    }
                }
                folders.sort(sortBy("name"));
                files.sort(sortBy("name"));
                list = [...folders, ...files];
                setItems(list);
            } else {
                setItems([]);
            }
        }
    }, [childrenFromParent, parent]);

    return (
        <>
            <div className={css.header}>
                <div className={css.option}>
                    <Tippy content={options.display === "list" ? "Detail view" : "List view"}>
                        <button className="btnround" onClick={() => updateDisplay(options.display === "list" ? "" : "list")}>
                            {options.display === "list" ? <i className="fas fa-line-columns"></i> : <i className="fas fa-list"></i>}
                        </button>
                    </Tippy>
                </div>
            </div>
            <div className={css.mainwrap}>
                <div className={classNames(css.mainbody)}>
                    {options.display === "list" ? <table className={css.detailview}>
                        <thead>
                            <tr className={css.detailhead}>
                                <th></th>
                                <th scope='col'>Name</th>
                                <th scope='col'>Modified</th>
                                <th scope='col'>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => <File key={item.id} file={item} />)}
                        </tbody>
                    </table> : <div className={classNames(css.gridview)}>
                        {items.map(item => <File key={item.id} file={item} />)}
                    </div>}
                    <ContextMenuTrigger menu={`folder-${parent}`} className={css.filter}></ContextMenuTrigger>
                </div>

                <ContextMenu menu={`folder-${parent}`} className="contextmenu">
                    <ContextMenuItem className="contextmenuitem" onClick={() => setEditor({
                        title: "Create new folder",
                        label: "New foler name",
                        value: "New folder",
                    })}><i className="fas fa-fw fa-folder-plus"></i> New folder</ContextMenuItem>
                    <span className="line-break"></span>
                    <ContextMenuItem className="contextmenuitem" onClick={select}><i className="fas fa-fw fa-file-arrow-up"></i> Upload files</ContextMenuItem>
                    <ContextMenuItem className="contextmenuitem" onClick={selectFolder}><i className="fas fa-fw fa-folder-arrow-up"></i> Upload folder</ContextMenuItem>
                </ContextMenu>
                {uploader?.length > 0 && <Uploader />}
            </div>
        </>

    );
};

export default Folder;