import './descProject.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";
import LeftDP from "../../components/Left/leftDP/leftDP"
import Posts from "../../components/PageItems/posts/posts"
import ScrollToTop from "../../ScrollToTop";

const DescProject = () => {
    const { id } = useParams();
    const [Project, setProject] = useState(null);
    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            try {
                const res = await makeRequest.get(`/projects/${id}`);
                setProject(res.data);
            } catch (err) {
                setError("Failed to load project data");
            }
        };
        fetchProject();
    }, [id]);

    return (
        <div className="descProject">
            <ScrollToTop />
            <div className="descProjectleft">
                {Project && <LeftDP project={Project.project_id} />}
            </div>
            <div className="descProjectRight">
                {Project && <Posts project={Project.project_id} />}
            </div>
        </div>
    );
}

export default DescProject;