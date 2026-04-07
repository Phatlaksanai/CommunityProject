import "./editProfile.scss";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const EditProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [profileimg, setProfileImg] = useState(null);
  const [coverimg, setCoverImg] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profilePublicId, setProfilePublicId] = useState(null);
  const [coverPublicId, setCoverPublicId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user", id],
    queryFn: () => makeRequest.get(`/users/${id}`).then(res => res.data),
  });
  useEffect(() => {
    if (user) {
      setDisplayName(user.name);
      setDescription(user.description);
      setCity(user.city);
      setWebsite(user.website);
      setProfileImg(user.profilePic);
      setCoverImg(user.coverPic);
    }
  }, [user]);
  // ================= UPLOAD FILES TO CLOUDINARY =================
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError("กรุณาเลือกไฟล์รูป jpg หรือ png");
      return;
    }

    if (type === "profile") {
      setProfileImg(file);
    } else if (type === "cover") {
      setCoverImg(file);
    }
    e.target.value = "";
    setError("");
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/profile", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  };


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const imgURL = profileimg ? await uploadFile(profileimg) : null;
      const coverURL = coverimg ? await uploadFile(coverimg) : null;

      if (!imgURL || !coverURL) {
        setError("อัพโหลดไฟล์ไม่สำเร็จ");
        return;
      }

      const res = await fetch("/api/update-profile", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          description,
          city,
          website,
          profileimg: imgURL?.url || currentUser.profileimg,
          coverimg: coverURL?.url || currentUser.coverimg,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "update profile failed");
        return;
      }
      setSuccess("update profile success");
      navigate("/download");
    } catch (err) {
      console.error(err);
      setError("เชื่อมต่อ Server ไม่ได้");
    }

  };


  return (
    <div className="edit-profile">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div className="edit-profile__form">
        <h1 className="edit-profile__title">Edit Profile</h1>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input type="text" id="displayName" placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="profileDetail">Description</label>
            <input type="text" id="profileDetail" placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label>Profile Image</label>

            <label htmlFor="image" className="file-input">
              {profileimg ? profileimg.name : "No file selected"}
            </label>

            <input
              type="file"
              id="image"
              accept=".png,.jpg,.jpeg"
              onChange={(e) => handleImageChange(e, "profile")}
              hidden
            />
          </div>

          <div className="form-group">
            <label>Cover Image</label>

            <label htmlFor="cover" className="file-input">
              {coverimg ? coverimg.name : "No file selected"}
            </label>

            <input
              type="file"
              id="cover"
              accept=".png,.jpg,.jpeg"
              onChange={(e) => handleImageChange(e, "cover")}
              hidden
            />
          </div>

          <input type="submit" value="Save Changes" className="add-item__submit" />
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
