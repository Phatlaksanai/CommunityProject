import "./addcommu.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";//-------------------------------------
import { makeRequest } from "../../api/axios";

const AddCommu = () => {
  //----------------------------------------------------------
  const navigate = useNavigate();

  // form data
  const [CommunityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState(null);

  // message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleAddcommu = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!img) {
      setError("Please upload your image and model files");
      return;
    }

    try {
      const imgURL = await uploadFile(img);

      if (!imgURL) {
        setError("Failed to upload file");
        return;
      }

      const res = await makeRequest.post("/communities/addcommu", {
        CommunityName,
        description,
        img: imgURL.url,
        public_id: imgURL.public_id,
      });

      setSuccess("add community success");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
    }
  };


  return (
    <div className="addcommu">
      <div className="add-item__form">
        <h1 className="add-item__title">Create your own Community</h1>
        <form onSubmit={handleAddcommu}>
          <div className="form-group">
            <label htmlFor="itemName">Name</label>
            <input type="text" id="itemName" placeholder="Community Name"
              value={CommunityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="itemDetail">Description</label>
            <input type="text" id="itemDetail" placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <input type="submit" value="Submit" className="add-item__submit" />
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </form>
      </div>
    </div>
  );
};

export default AddCommu;
