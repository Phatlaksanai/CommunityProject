import "./addItem.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//-------------------------------------
import { makeRequest } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const AddItem = () => {
  //----------------------------------------------------------
  const navigate = useNavigate();

  // form data
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState(null);
  const [model, setModel] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [obj, setObj] = useState(null);
  const [blend, setBlend] = useState(null);
  const [fbx, setFbx] = useState(null);
  const [usdz, setUsdz] = useState(null);
  const [gltf, setGltf] = useState(null);
  const [polygonCount, setPolygonCount] = useState("");
  const [hasTextures, setHasTextures] = useState(false);
  const [isRigged, setIsRigged] = useState(false);
  const [isUvMapped, setIsUvMapped] = useState(false);

  // เพิ่ม State ควบคุมการแสดงผล Checkbox
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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      makeRequest.get("/items/categories").then((res) => res.data),
  });

  // ================= UPLOAD FILES TO CLOUDINARY =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError("Please select a JPG or PNG file");
      return;
    }

    setImg(file);
    e.target.value = "";
    setError("");
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
    setError("");
    e.target.value = "";
  };

  // ฟังก์ชันจัดการเมื่อ Checkbox เปลี่ยนแปลงค่า
  const handleFormatChange = (e) => {
    const { name, checked } = e.target;
    setFormats((prev) => ({ ...prev, [name]: checked }));

    // ล้างค่าไฟล์ออกหากยกเลิกการเลือก Checkbox ป้องกันบั๊กการอัปโหลดไฟล์ที่ถูกซ่อนไว้
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

  const handleAdditem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    if (!img || !model) {
      setError("Please upload your image and model files");
      return;
    }

    if (!obj && !blend && !fbx && !usdz && !gltf) {
      setError("Please upload zip model files");
      return;
    }

    try {
      const imgURL = await uploadFile(img);
      const modelURL = await uploadFile(model);
      const objURL = await uploadFile(obj);
      const blendURL = await uploadFile(blend);
      const fbxURL = await uploadFile(fbx);
      const usdzURL = await uploadFile(usdz);
      const gltfURL = await uploadFile(gltf);

      if (!imgURL || !modelURL) {
        setError("Failed to upload file");
        return;
      }

      if (!objURL && !blendURL && !fbxURL && !usdzURL && !gltfURL) {
        setError("Failed to upload model files");
        return;
      }

      const res = await makeRequest.post("/items/additem", {
        modelName,
        description,
        price,
        category_id: categoryId || null,
        img: imgURL.url,
        model: modelURL.url,
        imgPublicId: imgURL.public_id,
        modelPublicId: modelURL.public_id,
        obj: objURL ? objURL.url : null,
        blend: blendURL ? blendURL.url : null,
        fbx: fbxURL ? fbxURL.url : null,
        usdz: usdzURL ? usdzURL.url : null,
        gltf: gltfURL ? gltfURL.url : null,
        objPublicId: objURL ? objURL.public_id : null,
        blendPublicId: blendURL ? blendURL.public_id : null,
        fbxPublicId: fbxURL ? fbxURL.public_id : null,
        usdzPublicId: usdzURL ? usdzURL.public_id : null,
        gltfPublicId: gltfURL ? gltfURL.public_id : null,
        polygon_count: parseInt(polygonCount) || 0,
        has_textures: hasTextures,
        is_rigged: isRigged,
        is_uv_mapped: isUvMapped,
      });

      setSuccess("add item success");
      navigate("/market");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
    }
  };

  return (
    <div className="add-item">
      <div className="add-item__form">
        <h1 className="add-item__title">Add Item</h1>
        <form onSubmit={handleAdditem}>
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
            <label htmlFor="polygonCount">Polygon Count</label>
            <input type="number" id="polygonCount" placeholder="0"
              value={polygonCount}
              onChange={(e) => setPolygonCount(e.target.value)}
              min="0"
            />
          </div>

          {/* เพิ่มส่วน Properties */}
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
              <label >
                <input type="checkbox" className="custom-checkbox" checked={isUvMapped} onChange={(e) => setIsUvMapped(e.target.checked)} />
                <span className="box"></span>
                Is UV Mapped
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Image</label>
            <label htmlFor="image" className="file-input">
              {img ? img.name : "No file selected"}
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
              <option value="" disabled>
                Select Category
              </option>
              {categories?.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.type}
                </option>
              ))}
            </select>
          </div>

          <h4>Model Files</h4>

          <div className="form-group">
            <label>GLB for Web Page Rendering</label>
            <label htmlFor="model" className="file-input">
              {model ? model.name : "No file selected"}
            </label>
            <input
              type="file"
              id="model"
              accept=".glb"
              onChange={handleModelChange(setModel)}
              hidden
            />
          </div>

          {/* สร้าง Checkbox สำหรับให้เลือก Format */}
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

          {/* แสดงช่องอัปโหลดเฉพาะเมื่อ Checkbox ถูกเลือก */}
          {formats.obj && (
            <div className="form-group">
              <label>Zip file for OBJ</label>
              <label htmlFor="obj" className="file-input">
                {obj ? obj.name : "No file selected"}
              </label>
              <input type="file" id="obj" accept=".zip" onChange={handleModelChange(setObj)} hidden />
            </div>
          )}

          {formats.blend && (
            <div className="form-group">
              <label>Zip file for BLEND</label>
              <label htmlFor="blend" className="file-input">
                {blend ? blend.name : "No file selected"}
              </label>
              <input type="file" id="blend" accept=".zip" onChange={handleModelChange(setBlend)} hidden />
            </div>
          )}

          {formats.fbx && (
            <div className="form-group">
              <label>Zip file for FBX</label>
              <label htmlFor="fbx" className="file-input">
                {fbx ? fbx.name : "No file selected"}
              </label>
              <input type="file" id="fbx" accept=".zip" onChange={handleModelChange(setFbx)} hidden />
            </div>
          )}

          {formats.usdz && (
            <div className="form-group">
              <label>Zip file for USDZ</label>
              <label htmlFor="usdz" className="file-input">
                {usdz ? usdz.name : "No file selected"}
              </label>
              <input type="file" id="usdz" accept=".zip" onChange={handleModelChange(setUsdz)} hidden />
            </div>
          )}

          {formats.gltf && (
            <div className="form-group">
              <label>Zip file for GLTF</label>
              <label htmlFor="gltf" className="file-input">
                {gltf ? gltf.name : "No file selected"}
              </label>
              <input type="file" id="gltf" accept=".zip" onChange={handleModelChange(setGltf)} hidden />
            </div>
          )}

          <input type="submit" value="Submit" className="add-item__submit" />
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </form>
      </div>
    </div>
  );
};

export default AddItem;