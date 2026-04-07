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

  // const { data: user } = useQuery({
  //   queryKey: ["user", id],
  //   queryFn: () => makeRequest.get(`/${currentUser}`).then(res => res.data),
  // });
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || "");
      setDescription(currentUser.description || "");
      setCity(currentUser.city || "");
      setWebsite(currentUser.website || "");
      setProfileImg(currentUser.profilePic || null);
      setProfilePublicId(currentUser.profile_public_id || null);
      setCoverImg(currentUser.coverPic || null);
      setCoverPublicId(currentUser.cover_public_id || null);
    }
  }, [currentUser]);
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
    if (!file || !(file instanceof File)) return null; // ถ้าไม่ใช่ไฟล์ ไม่ต้องอัปโหลด
    const formData = new FormData();
    formData.append("file", file);
    
    // ใช้ makeRequest แทน fetch เพื่อความสม่ำเสมอ
    const res = await makeRequest.post("/upload/profile", formData); 
    return res.data; // คาดหวัง { url: "...", public_id: "..." }
  };


  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    // 1. ตั้งค่าเริ่มต้นจาก State ปัจจุบัน (ซึ่งอาจเป็น URL เดิม)
    let finalProfileImg = profileimg;
    let finalProfilePublicId = profilePublicId;
    let finalCoverImg = coverimg;
    let finalCoverPublicId = coverPublicId;

    // 2. อัปโหลดเฉพาะเมื่อเป็นไฟล์ใหม่เท่านั้น (instanceof File)
    if (profileimg instanceof File) {
      const res = await uploadFile(profileimg);
      finalProfileImg = res.url;
      finalProfilePublicId = res.public_id;
    }

    if (coverimg instanceof File) {
      const res = await uploadFile(coverimg);
      finalCoverImg = res.url;
      finalCoverPublicId = res.public_id;
    }

    // 3. ส่งไปที่ API
    await makeRequest.put("/update-profile", {
      userId: currentUser?.user_id,
      displayName,
      description,
      city,
      website,
      profileimg: finalProfileImg, // ส่ง string URL ไปตรงๆ
      coverimg: finalCoverImg,
      profilePublicId: finalProfilePublicId,
      coverPublicId: finalCoverPublicId,
    });

    setSuccess("Update profile success");
    setTimeout(() => navigate(`/profile/${currentUser?.user_id}`), 1000);
  } catch (err) {
    console.error(err);
    // ถ้าหลังบ้าน Error 500 เราจะดึงข้อความ error มาโชว์
    setError(err.response?.data?.message || "Internal Server Error: ตรวจสอบ Backend");
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileDetail">Description</label>
            <input type="text" id="profileDetail" placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
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
