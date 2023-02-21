import React, { useContext, useEffect, useState } from 'react';
import Context from '../app/Context';
import File from './File';
import css from "./../styles/Folder.module.css";
import classNames from 'classnames';

function Folder() {
    const { parent, childrenFromParent } = useContext(Context);

    const [items, setItems] = useState([]);

    useEffect(() => {
        if (childrenFromParent && parent) {
            const list = childrenFromParent[parent];
            if (list) {
                setItems(list);
            } else {
                setItems([]);
            }
        }
    }, [childrenFromParent, parent]);
    return (
        <div className={classNames(css.gridview, "selecto-wrapper")}>
            {items.map(item => <File key={item.id} file={item} />)}
        </div>
    );
};

export default Folder;