import "./editCommu.scss";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";//-------------------------------------
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const EditCommu = () => {
    //---------------------------------------------------------- 
    const navigate = useNavigate();
    const { id: community_id } = useParams();
    const { currentUser } = useContext(AuthContext);

    // form data
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [img, setImg] = useState(null);

    // message
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imgPublicId, setImgPublicId] = useState(null);
    const [modelPublicId, setModelPublicId] = useState(null);

    const { data: commu } = useQuery({
        queryKey: ["community", community_id],
        queryFn: () =>
            makeRequest.get(`/communities/${community_id}`).then(res => res.data),
    });

    useEffect(() => {
        if (commu) {
            setName(commu.name || "");
            setDescription(commu.description || "");
            setImg(commu.cover_img || "");
            setImgPublicId(commu.cover_public_id || null);
        }
    }, [commu]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
            setError("Please select a JPG or PNG file");
            return;
        }

        setImg(file); e.target.value = "";
        setError("");
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await makeRequest.post("/upload/communities", formData);
        return res.data; // คาดหวัง { url: "...", public_id: "..." }
    };


    const handleUpdateCommu = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {

            let finalImg = img;
            let finalImgPublicId = imgPublicId;

            //อัปโหลดเฉพาะเมื่อเป็นไฟล์ใหม่เท่านั้น (instanceof File)
            if (img instanceof File) {
                const res = await uploadFile(img);
                finalImg = res.url;
                finalImgPublicId = res.public_id;
            }

            // ส่งไปที่ API
            await makeRequest.put("/communities/update", {
                communityId: community_id,
                name,
                description,
                img: finalImg,
                imgPublicId: finalImgPublicId,
            });

            setSuccess("Update community success");
            navigate(`/desccommu/${community_id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to server");
        }
    };


    return (
        <div className="edit-commu">
            <div className="add-item__form">
                <h1 className="add-item__title">Edit Community</h1>
                <form onSubmit={handleUpdateCommu}>
                    <div className="form-group">
                        <label htmlFor="CommunityName">Name</label>
                        <input type="text" id="CommunityName" placeholder="Community Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="commuDetail">Description</label>
                        <input type="text" id="commuDetail" placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Image</label>

                        <label htmlFor="image" className="file-input">
                            {img instanceof File ? img.name : "Current image"}
                        </label>

                        <input
                            type="file"
                            id="image"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleImageChange}
                            hidden
                        />
                    </div>

                    <input type="submit" value="Save Changes" className="add-item__submit" />
                    {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                    {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                </form>
            </div>
        </div>
    );
};

export default EditCommu;
