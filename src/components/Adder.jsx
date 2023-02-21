import React, { useContext } from 'react';
import css from './../styles/Layout.module.css';
import { ContextMenuTrigger, ContextMenuItem, ContextMenu } from 'myoasis-contextmenu';
import Context from '../app/Context';
import { addFolderToLibrary, uploadToLibrary } from '../firebase/sync';
import { toast } from 'react-hot-toast';
import { buildFileTree } from '../app/Function';

function Adder() {
    const { user, parent: currentPath, setEditor, setUploader } = useContext(Context);

    const select = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "*";
        input.oninput = async () => {
            const files = input.files;
            if (files.length) {
                for (const file of files) {
                    uploadToLibrary(user, file, currentPath, {
                        before(snap) {
                            setUploader(old => [{ ...snap , pending: true}, ...old]);
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
                addFolderToLibrary(user, folder, currentPath, {
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
    

    return (
        <>
            <ContextMenuTrigger menu="new-options" exact={false} trigger="click" className={css.newbtnholder}>
                <button className={css.newbtn}><i className="fas fa-plus"></i> New</button>
            </ContextMenuTrigger>
            <ContextMenu className="contextmenu" animation="spring" menu="new-options">
                <ContextMenuItem className="contextmenuitem" onClick={() => setEditor({
                    title: "Create new folder",
                    label: "New foler name",
                    value: "New folder",
                })}><i className="fas fa-fw fa-folder-plus"></i> New folder</ContextMenuItem>
                <span className="line-break"></span>
                <ContextMenuItem className="contextmenuitem" onClick={select}><i className="fas fa-fw fa-file-arrow-up"></i> Upload files</ContextMenuItem>
                <ContextMenuItem className="contextmenuitem" onClick={selectFolder}><i className="fas fa-fw fa-folder-arrow-up"></i> Upload folder</ContextMenuItem>
            </ContextMenu>
        </>
    );
};

export default Adder;