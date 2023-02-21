import React, { useContext, useEffect, useState } from 'react';
import Context from '../app/Context';
import css from './../styles/Uploader.module.css';
import LoadSVG from './LoadSVG';


function Uploader() {

    const [extend, setExtend] = useState(true);
    const { uploader, setUploader } = useContext(Context);

    const [length, setLength] = useState(0);

    useEffect(() => {
        let result = 0;
        uploader.forEach(item => {
            if (item.pending) result++;
        });
        setLength(result);
    }, [uploader]);

    return (
        <div className={css.uploader}>
            <section className={css.body}>
                <header className={css.header}>
                    <div className={css.title}>
                        Uploading ({length})
                    </div>
                    <button className="btnround" onClick={() => setExtend(!extend)}>
                        {extend ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-up"></i>}
                    </button>
                    <button className="btnround" onClick={() => setUploader([])}>
                        <ii className="fas fa-times"></ii>
                    </button>
                </header>
                {extend && <div className={css.main}>
                    {uploader.map(item => {
                        return (
                            <div className={css.item} key={item.key}>
                                <div className={css.image}>
                                    {item.type === "folder" ? <i className="fas fa-folder"></i> : <i className="fas fa-file"></i>}
                                </div>
                                <div className={css.name}>{item.name}</div>
                                {item.type === "folder" && <div className={css.count}>{item.total - item.pending} of {item.total}</div>}
                                <div className={css.icon}>
                                    {item.pending ? <LoadSVG stroke={15} size={15} /> : <i className="fas fa-circle-check"></i>}
                                </div>
                            </div>
                        );
                    })}
                </div>}
            </section>
        </div>
    );
};

export default Uploader;