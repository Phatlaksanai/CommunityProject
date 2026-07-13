import "./addItem.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";//-------------------------------------
import { makeRequest } from "../../api/axios";

const AddItem = () => {
  //----------------------------------------------------------
  const navigate = useNavigate();

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

    if (!/\.(glb|zip)$/i.test(file.name)) {
      setError("Please select a glb or zip model file");
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

  const uploadFile = async (file) => {
    if (!file || !(file instanceof File)) return null; // ถ้าไม่ใช่ไฟล์ ไม่ต้องอัปโหลด
    const formData = new FormData();
    formData.append("file", file);

    const res = await makeRequest.post("/upload/item", formData);
    return res.data; // คาดหวัง { url: "...", public_id: "..." }
  };


  const handleAdditem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!category) {
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
        category,
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
      });

      setSuccess("add item success");
      navigate("/market");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // จะแสดง error จาก backend
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

          <div className="form-group">
            <label>Zip file for OBJ </label>

            <label htmlFor="obj" className="file-input">
              {obj ? obj.name : "No file selected"}
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
            <label>Zip file for BLEND</label>

            <label htmlFor="blend" className="file-input">
              {blend ? blend.name : "No file selected"}
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
            <label>Zip file for FBX</label>

            <label htmlFor="fbx" className="file-input">
              {fbx ? fbx.name : "No file selected"}
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
            <label>Zip file for USDZ</label>

            <label htmlFor="usdz" className="file-input">
              {usdz ? usdz.name : "No file selected"}
            </label>

            <input
              type="file"
              id="usdz"
              accept=".zip"
              onChange={handleModelChange(setUsdz)}
              hidden
            />
          </div>

          <div className="form-group">
            <label>Zip file for GLTF</label>

            <label htmlFor="gltf" className="file-input">
              {gltf ? gltf.name : "No file selected"}
            </label>

            <input
              type="file"
              id="gltf"
              accept=".zip"
              onChange={handleModelChange(setGltf)}
              hidden
            />
          </div>

          <input type="submit" value="Submit" className="add-item__submit" />
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </form>
      </div>
    </div>
  );
};

export default AddItem;
