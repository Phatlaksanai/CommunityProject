import './descProject.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LeftDP from "../../components/leftDP/leftDP"

const DescProject = () => {
    const { id } = useParams();
    const [Project, setProject] = useState(null);
    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${id}`);
                const data = await res.json();
                setProject(data);
            } catch (err) {
                setError("โหลดข้อมูลไม่สำเร็จ");
            }
        };
        fetchProject();
    }, [id]);

    return (
        <div className="descProject">
            <div className="descProjectleft">
                <LeftDP project={Project}/>
            </div>
        </div>
    );
}

export default DescProject;