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
    const [obj ,setObj] = useState(null);
    const [blend ,setBlend] = useState(null);
    const [fbx ,setFbx] = useState(null);
    const [usdz ,setUsdz] = useState(null);
    const [gltf ,setGltf] = useState(null);

    // message
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imgPublicId, setImgPublicId] = useState(null);
    const [modelPublicId, setModelPublicId] = useState(null);
    const [objPublicId, setObjPublicId] = useState(null);
    const [blendPublicId, setBlendPublicId] = useState(null);
    const [fbxPublicId, setFbxPublicId] = useState(null);
    const [usdzPublicId, setUsdzPublicId] = useState(null);
    const [gltfPublicId, setGltfPublicId] = useState(null);

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
            setObj(items.obj || null);
            setObjPublicId(items.obj_public_id || null);
            setBlend(items.blend || null);
            setBlendPublicId(items.blend_public_id || null);
            setFbx(items.fbx || null);
            setFbxPublicId(items.fbx_public_id || null);
            setUsdz(items.usdz || null);
            setUsdzPublicId(items.usdz_public_id || null);
            setGltf(items.gltf || null);
            setGltfPublicId(items.gltf_public_id || null);
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

    const handleModelChange = (setter) => (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!/\.(glb|.zip)$/i.test(file.name)) {
            setError("Please select a GLB or ZIP file");
            return;
        }
        if (file.size > MAX_MODEL_SIZE) {
            setError("File size must be under 10MB");
            e.target.value = "";
            return;
        }
        setter(file);
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
            let finalObj = obj;
            let finalObjPublicId = objPublicId;
            let finalBlend = blend;
            let finalBlendPublicId = blendPublicId;
            let finalFbx = fbx;
            let finalFbxPublicId = fbxPublicId;
            let finalUsdz = usdz;
            let finalUsdzPublicId = usdzPublicId;
            let finalGltf = gltf;
            let finalGltfPublicId = gltfPublicId;

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

            if (obj instanceof File) {
                const res = await uploadFile(obj);
                finalObj = res.url;
                finalObjPublicId = res.public_id;
            }

            if (blend instanceof File) {
                const res = await uploadFile(blend);
                finalBlend = res.url;
                finalBlendPublicId = res.public_id;
            }

            if (fbx instanceof File) {
                const res = await uploadFile(fbx);
                finalFbx = res.url;
                finalFbxPublicId = res.public_id;
            }

            if (usdz instanceof File) {
                const res = await uploadFile(usdz);
                finalUsdz = res.url;
                finalUsdzPublicId = res.public_id;
            }

            if (gltf instanceof File) {
                const res = await uploadFile(gltf);
                finalGltf = res.url;
                finalGltfPublicId = res.public_id;
            }

            // 3. ส่งไปที่ API
            await makeRequest.put("/items/update-item", {
                itemId: items?.item_id,
                modelName,
                description,
                price,
                category,
                img: finalImg,
                model: finalModel,
                obj: finalObj,
                blend: finalBlend,
                fbx: finalFbx,
                usdz: finalUsdz,
                gltf: finalGltf,
                imgPublicId: finalImgPublicId,
                modelPublicId: finalModelPublicId,
                objPublicId: finalObjPublicId,
                blendPublicId: finalBlendPublicId,
                fbxPublicId: finalFbxPublicId,
                usdzPublicId: finalUsdzPublicId,
                gltfPublicId: finalGltfPublicId,
            });
console.log("Update item success");
            setSuccess("Update item success");
            navigate(`/profile/${currentUser.user_id}/items`);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error); // จะแสดง error จาก backend
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

                    <h4>Model Files</h4>

                    <div className="form-group">
                        <label>GLB for Web Page Rendering</label>

                        <label htmlFor="model" className="file-input">
                            {model instanceof File ? model.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="model"
                            accept=".glb"
                            onChange={handleModelChange(setModel)}
                            hidden
                        />
                    </div>

                    <div className="form-group">
                        <label>Zip File for Obj</label>

                        <label htmlFor="model" className="file-input">
                            {obj instanceof File ? obj.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="obj"
                            accept=".zip"
                            onChange={handleModelChange(setObj)}
                            hidden
                        />
                    </div>

                    <div className="form-group">
                        <label>Zip File for blend</label>

                        <label htmlFor="model" className="file-input">
                            {blend instanceof File ? blend.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="blend"
                            accept=".zip"
                            onChange={handleModelChange(setBlend)}
                            hidden
                        />
                    </div>

                    <div className="form-group">
                        <label>Zip File for Fbx</label>

                        <label htmlFor="model" className="file-input">
                            {fbx instanceof File ? fbx.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="fbx"
                            accept=".zip"
                            onChange={handleModelChange(setFbx)}
                            hidden
                        />
                    </div>

                    <div className="form-group">
                        <label>Zip File for gltf</label>

                        <label htmlFor="model" className="file-input">
                            {gltf instanceof File ? gltf.name : "Current model"}
                        </label>

                        <input
                            type="file"
                            id="gltf"
                            accept=".zip"
                            onChange={handleModelChange(setGltf)}
                            hidden
                        />
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
