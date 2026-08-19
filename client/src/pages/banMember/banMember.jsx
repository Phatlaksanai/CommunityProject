import './banMember.scss';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const BanMember = () => {
  const navigate = useNavigate();
  const { id: community_id } = useParams();
  const queryClient = useQueryClient();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);

  // ดึงข้อมูลสมาชิก
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["communityMembers", community_id],
    queryFn: () => makeRequest.get(`/communities/members/${community_id}`).then(res => res.data),
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

  // ฟังก์ชันแบนสมาชิก
  const mutation = useMutation({
    mutationFn: (targetUserId) => {
      return makeRequest.post(`/communities/ban`, {
        communityId: community_id,
        userIds: targetUserId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["communityMembers", community_id]);
      setSuccess("Ban Successful!");
      setSelectedUsers([]);
      setTimeout(() => {
        navigate(`/desccommu/${community_id}`);
      }, 1500);
    },
    onError: (err) => {
      setError("Ban Failed");
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // จะแสดง error จาก backend
      } else {
        setError("Ban Failed");
      }
    }
  });

  const handleBanMember = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const confirmBan = () => {
    mutation.mutate(selectedUsers);
    setShowModal(false); // ปิด Pop-up
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="banMember">
      <div className="add-item__form">
        <h1 className="add-item__title">Ban Member</h1>
        <form onSubmit={handleBanMember}>
          <div className="form-group">
            <label>Search Members</label>
            <input type="text" placeholder="Search Members" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="post-list">
              {members
                .filter(member => {
                  const nameToSearch = member.name || member.username || "";
                  return nameToSearch.toLowerCase().includes(search.toLowerCase());
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
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </form>
      </div>

      {/*Pop-up Modal */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3>Confirm Action</h3>
            <p>Are you sure to ban <strong>{selectedUsers.length}</strong> selected members?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmBan}>
                {mutation.isLoading ? "Banning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanMember;