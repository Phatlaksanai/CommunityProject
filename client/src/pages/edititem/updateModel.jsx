import "./updateModel.scss";
import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import ScrollToTop from "../../ScrollToTop";

const UpdateModel = () => {
    const navigate = useNavigate();
    const { id: item_id } = useParams();
    const { currentUser } = useContext(AuthContext);

    // 🌟 1. ตั้งค่าเริ่มต้นให้เป็นโหมด New Version ทันทีที่เข้าหน้านี้
    const [selectedVersionId, setSelectedVersionId] = useState("NEW");
    const [isNewVersion, setIsNewVersion] = useState(true);

    const [version, setVersion] = useState("");
    const [summary, setSummary] = useState("");
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    const [previewImg1, setPreviewImg1] = useState(null);
    const [previewImg2, setPreviewImg2] = useState(null);

    // form data
    const [model, setModel] = useState(null);
    const [obj, setObj] = useState(null);
    const [blend, setBlend] = useState(null);
    const [fbx, setFbx] = useState(null);
    const [usdz, setUsdz] = useState(null);
    const [gltf, setGltf] = useState(null);
    const [polygonCount, setPolygonCount] = useState("");
    const [hasTextures, setHasTextures] = useState(false);
    const [isRigged, setIsRigged] = useState(false);
    const [isUvMapped, setIsUvMapped] = useState(false);

    const [formats, setFormats] = useState({
        obj: false,
        blend: false,
        fbx: false,
        usdz: false,
        gltf: false,
    });

    // message
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modelPublicId, setModelPublicId] = useState(null);
    const [objPublicId, setObjPublicId] = useState(null);
    const [blendPublicId, setBlendPublicId] = useState(null);
    const [fbxPublicId, setFbxPublicId] = useState(null);
    const [usdzPublicId, setUsdzPublicId] = useState(null);
    const [gltfPublicId, setGltfPublicId] = useState(null);

    const { data: items } = useQuery({
        queryKey: ["item", item_id],
        queryFn: () => makeRequest.get(`/items/${item_id}`).then(res => res.data),
    });

    const { data: versions } = useQuery({
        queryKey: ["versions"],
        queryFn: () => makeRequest.get(`/items/${item_id}/versions`).then(r => r.data)
    });

    // 🌟 2. ฟังก์ชันรีเซ็ตฟอร์มเป็น New Version (คลีนข้อมูลฝั่งขวาออกทั้งหมด)
    const handleResetToNewVersion = () => {
        setSelectedVersionId("NEW");
        setIsNewVersion(true);

        setVersion("");
        setSummary("");

        setPreviewImg1(null);
        setPreviewImg2(null);
        setImg1(null);
        setImg2(null);

        setPolygonCount("");

        setHasTextures(false);
        setIsRigged(false);
        setIsUvMapped(false);

        setModel(null);
        setObj(null);
        setBlend(null);
        setFbx(null);
        setUsdz(null);
        setGltf(null);

        setFormats({
            obj: false,
            blend: false,
            fbx: false,
            usdz: false,
            gltf: false,
        });

        setModelPublicId(null);
        setObjPublicId(null);
        setBlendPublicId(null);
        setFbxPublicId(null);
        setUsdzPublicId(null);
        setGltfPublicId(null);

        setError("");
        setSuccess("");
    };

    const MAX_MODEL_SIZE = 10 * 1024 * 1024;

    const handleModelChange = (setter) => (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!/\.(glb|zip)$/i.test(file.name)) {
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

    const handleImageChange = (setter) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
            setError("Please select a JPG or PNG file");
            return;
        }
        setter(file);
        e.target.value = "";
        setError("");
    };

    const handleFormatChange = (e) => {
        const { name, checked } = e.target;
        setFormats((prev) => ({ ...prev, [name]: checked }));

        if (!checked) {
            if (name === "obj") setObj(null);
            if (name === "blend") setBlend(null);
            if (name === "fbx") setFbx(null);
            if (name === "usdz") setUsdz(null);
            if (name === "gltf") setGltf(null);
        }
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

        let finalImg1 = previewImg1;
        let finalImg2 = previewImg2;

        if (img1) {
            const res1 = await uploadFile(img1);
            finalImg1 = res1.url;
        }
        if (img2) {
            const res2 = await uploadFile(img2);
            finalImg2 = res2.url;
        }

        // เช็คว่ามีรูปครบทั้ง 2 ช่องหรือไม่ (นับรวมรูปเก่า + รูปอัปเดตใหม่)
        if (!finalImg1 || !finalImg2) {
            setError("Please provide reference images for the update in both slots 1 and 2.");
            return;
        }

        if (!obj && !blend && !fbx && !usdz && !gltf) {
            setError("Please upload zip model files");
            return;
        }

        try {
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

            await makeRequest.put("/items/update-version", {
                itemId: items?.item_id,
                updateModelsId: selectedVersionId === "NEW" ? null : selectedVersionId,
                version,
                summary,
                img1: finalImg1,
                img2: finalImg2,
                model: (model instanceof File) ? finalModel : undefined,
                modelPublicId: (model instanceof File) ? finalModelPublicId : undefined,

                obj: !formats.obj ? null : (obj instanceof File ? finalObj : undefined),
                objPublicId: !formats.obj ? null : (obj instanceof File ? finalObjPublicId : undefined),

                blend: !formats.blend ? null : (blend instanceof File ? finalBlend : undefined),
                blendPublicId: !formats.blend ? null : (blend instanceof File ? finalBlendPublicId : undefined),

                fbx: !formats.fbx ? null : (fbx instanceof File ? finalFbx : undefined),
                fbxPublicId: !formats.fbx ? null : (fbx instanceof File ? finalFbxPublicId : undefined),

                usdz: !formats.usdz ? null : (usdz instanceof File ? finalUsdz : undefined),
                usdzPublicId: !formats.usdz ? null : (usdz instanceof File ? finalUsdzPublicId : undefined),

                gltf: !formats.gltf ? null : (gltf instanceof File ? finalGltf : undefined),
                gltfPublicId: !formats.gltf ? null : (gltf instanceof File ? finalGltfPublicId : undefined),
                polygon_count: parseInt(polygonCount) || 0,
                has_textures: hasTextures,
                is_rigged: isRigged,
                is_uv_mapped: isUvMapped,
                isNewVersion,
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
        <div className="update-model">
            <ScrollToTop />
            <div className="L">
                {/* ปุ่มสร้างเวอร์ชันใหม่ */}
                <div className="version" onClick={handleResetToNewVersion}>
                    <input
                        type="radio"
                        className="custom-radio"
                        checked={selectedVersionId === "NEW"}
                        readOnly
                    />
                    <span>New Version</span>
                </div>
                
                {/* รายการเวอร์ชันที่มีอยู่ */}
                {versions?.map((item) => (
                    <div
                        key={item.update_models_id}
                        className="version"
                        onClick={() => {
                            setSelectedVersionId(item.update_models_id);
                            setIsNewVersion(false);

                            // ดึง Text และ Number
                            setVersion(item.version || "");
                            setSummary(item.update_summary || "");

                            setPreviewImg1(item.imgs && item.imgs[0] ? item.imgs[0].img : null);
                            setPreviewImg2(item.imgs && item.imgs[1] ? item.imgs[1].img : null);
                            setImg1(null);
                            setImg2(null);

                            setPolygonCount(item.polygon_count || "");

                            // ดึง Checkbox Properties
                            setHasTextures(!!item.has_textures);
                            setIsRigged(!!item.is_rigged);
                            setIsUvMapped(!!item.is_uv_mapped);

                            // ดึงไฟล์กลับมาแสดง
                            setModel(item.model || null);
                            setObj(item.obj || null);
                            setBlend(item.blend || null);
                            setFbx(item.fbx || null);
                            setUsdz(item.usdz || null);
                            setGltf(item.gltf || null);

                            // เซ็ต Formats เช็คบ็อกซ์ให้ติ๊กถูกเฉพาะตัวที่มีไฟล์
                            setFormats({
                                obj: !!item.obj,
                                blend: !!item.blend,
                                fbx: !!item.fbx,
                                usdz: !!item.usdz,
                                gltf: !!item.gltf,
                            });

                            // คืนค่า Public ID
                            setModelPublicId(item.model_public_id || null);
                            setObjPublicId(item.obj_public_id || null);
                            setBlendPublicId(item.blend_public_id || null);
                            setFbxPublicId(item.fbx_public_id || null);
                            setUsdzPublicId(item.usdz_public_id || null);
                            setGltfPublicId(item.gltf_public_id || null);

                            setError("");
                            setSuccess("");
                        }}
                    >
                        <input
                            type="radio"
                            className="custom-radio"
                            checked={selectedVersionId === item.update_models_id}
                            readOnly
                        />
                        <span>version : {item.version}</span>
                    </div>
                ))}
            </div>
            <div className="R">
                <div className="add-item__form">
                    {isNewVersion && <h1 className="add-item__title">Add New Version</h1>}
                    {!isNewVersion && <h1 className="add-item__title">Update Model</h1>}
                    <form onSubmit={handleUpdateitem}>

                        <div className="form-group">
                            <label htmlFor="itemName">Version</label>
                            <input type="text" id="itemName" placeholder="Version"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="itemDetail">Summary</label>
                            <input type="text" id="itemDetail" placeholder="Summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                required />
                        </div>

                        <div className="form-group">
                            <label>Reference Image 1</label>
                            <label htmlFor="image1" className="file-input">
                                {img1 ? img1.name : (previewImg1 ? "Current Image 1" : "No file selected")}
                            </label>
                            <input
                                type="file"
                                id="image1"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleImageChange(setImg1)}
                                hidden
                            />
                        </div>

                        <div className="form-group">
                            <label>Reference Image 2</label>
                            <label htmlFor="image2" className="file-input">
                                {img2 ? img2.name : (previewImg2 ? "Current Image 2" : "No file selected")}
                            </label>
                            <input
                                type="file"
                                id="image2"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleImageChange(setImg2)}
                                hidden
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="polygonCount">Polygon Count</label>
                            <input type="number" id="polygonCount" placeholder="0"
                                value={polygonCount}
                                onChange={(e) => setPolygonCount(e.target.value)}
                                min="0"
                            />
                        </div>

                        <div className="format-selection">
                            <label className="format-selection__title">Model Properties</label>
                            <div className="checkbox-container">
                                <label>
                                    <input type="checkbox" className="custom-checkbox" checked={hasTextures} onChange={(e) => setHasTextures(e.target.checked)} />
                                    <span className="box"></span>
                                    Has Textures
                                </label>
                                <label>
                                    <input type="checkbox" className="custom-checkbox" checked={isRigged} onChange={(e) => setIsRigged(e.target.checked)} />
                                    <span className="box"></span>
                                    Is Rigged
                                </label>
                                <label>
                                    <input type="checkbox" className="custom-checkbox" checked={isUvMapped} onChange={(e) => setIsUvMapped(e.target.checked)} />
                                    <span className="box"></span>
                                    Is UV Mapped
                                </label>
                            </div>
                        </div>

                        <h4>Model Files</h4>

                        <div className="form-group">
                            <label>GLB for Web Page Rendering</label>

                            <label htmlFor="model" className="file-input">
                                {model instanceof File ? model.name : (model ? "Current model" : "No file selected")}
                            </label>

                            <input
                                type="file"
                                id="model"
                                accept=".glb"
                                onChange={handleModelChange(setModel)}
                                hidden
                            />
                        </div>

                        <div className="format-selection">
                            <label className="format-selection__title">Select Downloadable Formats</label>
                            <div className="checkbox-container">
                                <label><input type="checkbox" className="custom-checkbox" name="obj" checked={formats.obj} onChange={handleFormatChange} /> OBJ</label>
                                <label><input type="checkbox" className="custom-checkbox" name="blend" checked={formats.blend} onChange={handleFormatChange} /> BLEND</label>
                                <label><input type="checkbox" className="custom-checkbox" name="fbx" checked={formats.fbx} onChange={handleFormatChange} /> FBX</label>
                                <label><input type="checkbox" className="custom-checkbox" name="usdz" checked={formats.usdz} onChange={handleFormatChange} /> USDZ</label>
                                <label><input type="checkbox" className="custom-checkbox" name="gltf" checked={formats.gltf} onChange={handleFormatChange} /> GLTF</label>
                            </div>
                        </div>

                        {formats.obj && (
                            <div className="form-group">
                                <label>Zip File for Obj</label>
                                <label htmlFor="obj" className="file-input">
                                    {obj instanceof File ? obj.name : (obj ? "Current model" : "No file selected")}
                                </label>
                                <input type="file" id="obj" accept=".zip" onChange={handleModelChange(setObj)} hidden />
                            </div>
                        )}

                        {formats.blend && (
                            <div className="form-group">
                                <label>Zip File for blend</label>
                                <label htmlFor="blend" className="file-input">
                                    {blend instanceof File ? blend.name : (blend ? "Current model" : "No file selected")}
                                </label>
                                <input type="file" id="blend" accept=".zip" onChange={handleModelChange(setBlend)} hidden />
                            </div>
                        )}

                        {formats.fbx && (
                            <div className="form-group">
                                <label>Zip File for Fbx</label>
                                <label htmlFor="fbx" className="file-input">
                                    {fbx instanceof File ? fbx.name : (fbx ? "Current model" : "No file selected")}
                                </label>
                                <input type="file" id="fbx" accept=".zip" onChange={handleModelChange(setFbx)} hidden />
                            </div>
                        )}

                        {formats.usdz && (
                            <div className="form-group">
                                <label>Zip File for USDZ</label>
                                <label htmlFor="usdz" className="file-input">
                                    {usdz instanceof File ? usdz.name : (usdz ? "Current model" : "No file selected")}
                                </label>
                                <input type="file" id="usdz" accept=".zip" onChange={handleModelChange(setUsdz)} hidden />
                            </div>
                        )}

                        {formats.gltf && (
                            <div className="form-group">
                                <label>Zip File for gltf</label>
                                <label htmlFor="gltf" className="file-input">
                                    {gltf instanceof File ? gltf.name : (gltf ? "Current model" : "No file selected")}
                                </label>
                                <input type="file" id="gltf" accept=".zip" onChange={handleModelChange(setGltf)} hidden />
                            </div>
                        )}

                        {isNewVersion && <input type="submit" value="Add Version" className="add-item__submit" />}
                        {!isNewVersion && <input type="submit" value="Save Changes" className="add-item__submit" />}
                        {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                        {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateModel;