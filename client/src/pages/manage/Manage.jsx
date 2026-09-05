import './manage.scss';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Manage = () => {
  const navigate = useNavigate();
  const { id: community_id } = useParams();
  const queryClient = useQueryClient();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [errorMember, setErrorMember] = useState("");
  const [successMember, setSuccessMember] = useState("");
  const [searchMember, setSearchMember] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [errorPost, setErrorPost] = useState("");
  const [successPost, setSuccessPost] = useState("");
  const [searchPost, setSearchPost] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);

  // ดึงข้อมูลสมาชิก
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["communityMembers", community_id],
    queryFn: () => makeRequest.get(`/communities/members/${community_id}`).then(res => res.data),
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["communityPosts", community_id],
    queryFn: () => makeRequest.get(`/posts/manage/community/${community_id}`).then(res => res.data),
  });

  useEffect(() => {
    if (members && members.length > 0) {
      // ดึงเฉพาะ user_id ของคนที่ status เป็น "banned"
      const alreadyBannedUsers = members
        .filter(member => member.status === "banned")
        .map(member => member.user_id);

      setSelectedUsers(alreadyBannedUsers);
    }
  }, [members]);

  useEffect(() => {
    if (posts && posts.length > 0) {
      // คัดกรองเอาเฉพาะโพสต์ที่ถูกเปลี่ยนสถานะเป็น "hide" แล้ว
      const alreadyHiddenPosts = posts
        .filter(post => post.status === "hide")
        .map(post => post.post_id);

      setSelectedPosts(alreadyHiddenPosts);
    }
  }, [posts]);

  // ฟังก์ชันแบนสมาชิก
  const banmutation = useMutation({
    mutationFn: (targetUserId) => {
      return makeRequest.post(`/communities/ban`, {
        communityId: community_id,
        userIds: targetUserId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["communityMembers", community_id]);
      setSuccessMember("Ban Successful!");
      setSelectedUsers([]);
      setTimeout(() => {
        navigate(`/desccommu/${community_id}`);
      }, 1500);
    },
    onError: (err) => {
      setErrorMember("Ban Failed");
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMember(err.response.data.error); // จะแสดง error จาก backend
      } else {
        setErrorMember("Ban Failed");
      }
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (targetPostIds) => {
      return makeRequest.post(`/posts/delete/posts-community`, {
        communityId: community_id,
        postIds: targetPostIds
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["communityPosts", community_id]);
      setSuccessPost("Posts Deleted Successfully!");
      setSelectedPosts([]);
      setShowPostModal(false);
      setTimeout(() => {
        navigate(`/desccommu/${community_id}`);
      }, 1500);
    },
    onError: (err) => {
      setErrorPost(err.response?.data?.error || "Delete Post Failed");
      setShowPostModal(false);
    }
  });

  const handleBanMember = async (e) => {
    e.preventDefault();
    setErrorMember("");
    setSuccessMember("");
    setShowMemberModal(true);
  };

  const handleDeletePosts = async (e) => {
    e.preventDefault();
    setErrorPost("");
    setSuccessPost("");
    setShowPostModal(true);
  };

  const confirmBan = () => {
    banmutation.mutate(selectedUsers);
    setShowMemberModal(false); // ปิด Pop-up
  };

  const confirmDeletePosts = () => {
    deletePostMutation.mutate(selectedPosts);
  };

  if (isLoading || loadingPosts) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage">
      <div className="add-item__form">
        <h1 className="add-item__title">Ban Member</h1>
        <form onSubmit={handleBanMember}>
          <div className="form-group">
            <label>Search Members</label>
            <input type="text" placeholder="Search Members" value={searchMember} onChange={(e) => setSearchMember(e.target.value)} />
            <div className="post-list">
              {members
                .filter(member => {
                  const nameToSearch = member.name || member.username || "";
                  return nameToSearch.toLowerCase().includes(searchMember.toLowerCase());
                })
                .map(member => (
                  <label key={member.user_id} className="community-item">
                    <input
                      type="checkbox"
                      className='custom-checkbox'
                      checked={selectedUsers.includes(member.user_id)}
                      onChange={() => {
                        setSelectedUsers(prev =>
                          prev.includes(member.user_id)
                            ? prev.filter(id => id !== member.user_id)
                            : [...prev, member.user_id]
                        );
                      }}
                    />
                    <img src={member.profilePic || defaultPic} alt="" onError={(e) => e.currentTarget.src = defaultPic} />
                    <span>{member.name || member.username}</span>
                  </label>
                ))}
            </div>
          </div>

          <input type="submit" value="Confirm" className="add-item__submit" />
          {errorMember && <span style={{ color: "red", margin: "0px 10px" }}>{errorMember}</span>}
          {successMember && <span style={{ color: "green", margin: "0px 10px" }}>{successMember}</span>}
        </form>
      </div>

      {/*Pop-up Modal */}
      {showMemberModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3>Confirm Action</h3>
            <p>Are you sure to ban <strong>{selectedUsers.length}</strong> selected members?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmBan}>
                {banmutation.isLoading ? "Banning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ส่วนจัดการโพสต์ */}
      <div className="add-item__form">
        <h1 className="add-item__title">Delete Posts</h1>
        <form onSubmit={handleDeletePosts}>
          <div className="form-group">
            <label>Search by Name or Username</label>
            <input
              type="text"
              placeholder="Enter name or username..."
              value={searchPost}
              onChange={(e) => setSearchPost(e.target.value)}
            />
            <div className="post-list">
              {posts
                .filter(post => {
                  // ดึงข้อมูลชื่อและ username จากโพสต์นั้นๆ
                  const authorName = post.users?.name?.toLowerCase() || "";
                  const authorUsername = post.users?.username?.toLowerCase() || "";
                  const keyword = searchPost.toLowerCase();

                  return authorName.includes(keyword) || authorUsername.includes(keyword); // .includes เป็นคำสั่งเช็คว่าในชื่อนั้น มีคำที่เราค้นหาแฝงอยู่หรือไม่
                })
                .map(post => (
                  <label key={post.post_id} className="community-item">
                    <input
                      type="checkbox"
                      className='custom-checkbox'
                      checked={selectedPosts.includes(post.post_id)}
                      onChange={() => {
                        setSelectedPosts(prev =>
                          prev.includes(post.post_id)
                            ? prev.filter(id => id !== post.post_id)
                            : [...prev, post.post_id]
                        );
                      }}
                    />
                    <span>
                      {/* แสดงชื่อเจ้าของโพสต์ตัวหนา ตามด้วยเนื้อหาโพสต์ */}
                      <strong>{post.users?.name || post.users?.username}:</strong> {post.description?.substring(0, 50)}...
                    </span>
                  </label>
                ))}
            </div>
          </div>
          <input type="submit" value="Confirm" className="add-item__submit" />
          {errorPost && <span style={{ color: "red", margin: "0px 10px" }}>{errorPost}</span>}
          {successPost && <span style={{ color: "green", margin: "0px 10px" }}>{successPost}</span>}
        </form>
      </div>

      {/* Pop-up Modal สำหรับ Post */}
      {showPostModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3>Confirm Action</h3>
            <p>Are you sure to delete <strong>{selectedPosts.length}</strong> selected posts?</p>
            <div className="modal-buttons">
              <button type="button" className="btn-cancel" onClick={() => setShowPostModal(false)}>Cancel</button>
              <button type="button" className="btn-confirm" onClick={confirmDeletePosts}>
                {deletePostMutation.loadingPosts ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Manage;