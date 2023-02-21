import React, { useContext, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Context from '../app/Context';
import css from "./../styles/File.module.css";

function File({ file = {} }) {
    const { goto } = useContext(Context);

    const item = useRef();
    return (
        <div className={css.grid} ref={item}>
            <div className={css.image} data-type={file.type}>
                {file.type === "folder" ? <i className="fas fa-folder"></i> : <i className="fas fa-file"></i>}
            </div>
            <div className={css.name}>{file.name}</div>
            <span className={css.screen} onDoubleClick={() => (file.type === "folder" ? goto(file.id) : toast.error("Preview is not available right now."))}></span>
        </div>
    );
};

export default File;