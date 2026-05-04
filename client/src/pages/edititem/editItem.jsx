import "./editItem.scss";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";//-------------------------------------
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const EditItem = () => {
    //---------------------------------------------------------- 
    const navigate = useNavigate();
    const { id: item_id } = useParams();
    const { currentUser } = useContext(AuthContext);

    // form data
    const [modelName, setModelName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [img, setImg] = useState(null);
    const [model, setModel] = useState(null);
    const [category, setCategory] = useState("");

    // message
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imgPublicId, setImgPublicId] = useState(null);
    const [modelPublicId, setModelPublicId] = useState(null);

    const { data: items } = useQuery({
        queryKey: ["item", item_id],
        queryFn: () =>
            makeRequest.get(`/items/${item_id}`).then(res => res.data),
    });

    useEffect(() => {
        if (items) {
            setModelName(items.modelName || "");
            setDescription(items.description || "");
            setPrice(items.price || "");
            setImg(items.img || "");
            setImgPublicId(items.img_public_id || null);
            setModel(items.model || null);
            setModelPublicId(items.model_public_id || null);
            setCategory(items.category || "");
        }
    }, [items]);

    // ================= UPLOAD FILES TO CLOUDINARY =================
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

    const MAX_MODEL_SIZE = 10 * 1024 * 1024;

    const handleModelChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!/\.(glb|gltf)$/i.test(file.name)) {
            setError("Please select a GLB or GLTF file");
            return;
        }
        if (file.size > MAX_MODEL_SIZE) {
            setError("File size must be under 10MB");
            setModel(null); // เคลียร์ของเก่า
            e.target.value = "";
            return;
        }
        setModel(file);
        e.target.value = "";
        setError("");
    };

    const uploadFile = async (file) => {
        if (!file || !(file instanceof File)) return null; // ถ้าไม่ใช่ไฟล์ ไม่ต้องอัปโหลด
        const formData = new FormData();
        formData.append("file", file);

        // ใช้ makeRequest แทน fetch เพื่อความสม่ำเสมอ
        const res = await makeRequest.post("/upload/item", formData);
        return res.data; // คาดหวัง { url: "...", public_id: "..." }
    };


    const handleUpdateitem = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {

            let finalImg = img;
            let finalImgPublicId = imgPublicId;
            let finalModel = model;
            let finalModelPublicId = modelPublicId;

            // 2. อัปโหลดเฉพาะเมื่อเป็นไฟล์ใหม่เท่านั้น (instanceof File)
            if (img instanceof File) {
                const res = await uploadFile(img);
                finalImg = res.url;
                finalImgPublicId = res.public_id;
            }

            if (model instanceof File) {
                const res = await uploadFile(model);
                finalModel = res.url;
                finalModelPublicId = res.public_id;
            }

            // 3. ส่งไปที่ API
            await makeRequest.put("/update-item", {
                itemId: items?.item_id,
                modelName,
                description,
                price,
                category,
                img: finalImg,
                model: finalModel,
                imgPublicId: finalImgPublicId,
                modelPublicId: finalModelPublicId,
            });

            setSuccess("Update item success");
            navigate(`/profile/${currentUser.user_id}/items`);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to server");
        }
    };


    return (
        <div className="edit-item">
            <div className="add-item__form">
                <h1 className="add-item__title">Edit Item</h1>
                <form onSubmit={handleUpdateitem}>
                    <div className="form-group">
                        <label htmlFor="itemName">Item Name</label>
                        <input type="text" id="itemName" placeholder="Item Name"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDetail">Item Detail</label>
                        <input type="text" id="itemDetail" placeholder="Item Detail"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input type="text" id="price" placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
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

                    <div className="form-group">
                        <label>Model</label>

                        <label htmlFor="model" className="file-input">
                            {model instanceof File ? model.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="model"
                            accept=".glb,.gltf"
                            onChange={handleModelChange}
                            hidden
                        />
                    </div>

                    <div className="category">
                        <label htmlFor="category" className="category__title">
                            Category
                        </label>

                        <select
                            id="category"
                            className="category__select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="" disabled>
                                Select Category
                            </option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Characters">Characters</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Sports">Sports</option>
                            <option value="Food&Drink">Food & Drink</option>
                        </select>
                    </div>

                    <input type="submit" value="Save Changes" className="add-item__submit" />
                    {error && <span style={{ color: "red" , margin: "0px 10px" }}>{error}</span>}
                    {success && <span style={{ color: "green" , margin: "0px 10px" }}>{success}</span>}
                </form>
            </div>
        </div>
    );
};

export default EditItem;
