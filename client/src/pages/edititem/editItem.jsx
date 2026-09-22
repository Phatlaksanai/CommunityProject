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
    const [categoryId, setCategoryId] = useState("");

    // message
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imgPublicId, setImgPublicId] = useState(null);

    const { data: items } = useQuery({
        queryKey: ["item", item_id],
        queryFn: () =>
            makeRequest.get(`/items/${item_id}`).then(res => res.data),
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => makeRequest.get("/items/categories").then(r => r.data)
    });

    useEffect(() => {
        if (items) {
            setModelName(items.modelName || "");
            setDescription(items.description || "");
            setPrice(items.price || "");
            setImg(items.img || "");
            setImgPublicId(items.img_public_id || null);
            setCategoryId(items.category_id || "");
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

    const uploadFile = async (file) => {
        if (!file || !(file instanceof File)) return null;
        const formData = new FormData();
        formData.append("file", file);

        const res = await makeRequest.post("/upload/item", formData);
        return res.data;
    };

    const handleUpdateitem = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            let finalImg = img;
            let finalImgPublicId = imgPublicId;

            if (img instanceof File) {
                const res = await uploadFile(img);
                finalImg = res.url;
                finalImgPublicId = res.public_id;
            }

            await makeRequest.put("/items/edit-item", {
                itemId: items?.item_id,
                modelName,
                description,
                price,
                category_id: categoryId,
                img: finalImg,
                imgPublicId: finalImgPublicId,
                
            });

            setSuccess("Update item success");
            navigate(`/profile/${currentUser.user_id}/items`);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to connect to server");
            }
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

                    <div className="category">
                        <label htmlFor="category" className="category__title">
                            Category
                        </label>

                        <select
                            id="category"
                            className="category__select"
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                        >
                            {categories?.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input type="submit" value="Save Changes" className="add-item__submit" />
                    {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                    {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                </form>
            </div>
        </div>
    );
};

export default EditItem;