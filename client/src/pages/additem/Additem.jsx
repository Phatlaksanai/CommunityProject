import "./addItem.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";//-------------------------------------

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

  // message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= UPLOAD FILES TO CLOUDINARY =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError("กรุณาเลือกไฟล์รูป jpg หรือ png");
      return;
    }

    setImg(file); e.target.value = "";
    setError("");
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setError("กรุณาเลือกไฟล์ .glb หรือ .gltf");
      return;
    }

    setModel(file); e.target.value = "";
    setError("");
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/item", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  };


  const handleAdditem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!img || !model) {
      setError("กรุณาเลือกรูปและไฟล์โมเดล");
      return;
    }

    try {
      const imgURL = await uploadFile(img);
      const modelURL = await uploadFile(model);

      if (!imgURL || !modelURL) {
        setError("อัพโหลดไฟล์ไม่สำเร็จ");
        return;
      }

      const res = await fetch("/api/items/additem", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelName,
          description,
          price,
          category,
          img: imgURL.url,
          model: modelURL.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "add item failed");
        return;
      }



      setSuccess("add item success");
      navigate("/download");
    } catch (err) {
      console.error(err);
      setError("เชื่อมต่อ Server ไม่ได้");
    }
  };


  return (
    <div className="add-item">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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

          <div className="form-group">
            <label>Model</label>

            <label htmlFor="model" className="file-input">
              {model ? model.name : "No file selected"}
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

          <input type="submit" value="Submit" className="add-item__submit" />
        </form>
      </div>
    </div>
  );
};

export default AddItem;
