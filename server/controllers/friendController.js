const db = require("../config/db");

exports.getAllUserForAdd = async (req, res) => {
  const userId = req.params.userId;
  try {
    // ได้ความสัมพันเพื่อนเราทั้งหมด
    const { data: friendshipData, error: friendshipError } = await db
      .from("friendships")
      .select(`
        requester_id, 
        receiver_id
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (friendshipError) throw friendshipError;
    // ส่งเพื่อนทั้งหมดเก็บใน friendIds
    const friendIds = friendshipData.map((f) =>
      f.requester_id == userId ? f.receiver_id : f.requester_id,
    );
    // เพิ่มตัวเราเข้าไปใน array
    const excludeIds = [...friendIds, userId];

    const { data, error } = await db
      .from("users")
      .select("*")
      .not("user_id", "in", `(${excludeIds.join(",")})`) // แปลง array เป็น string
      .eq("isdelete", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFriendsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await db
      .from("friendships")
      .select(`
        *,
        requester:requester_id (user_id, name, username, profilePic, isdelete),
        receiver:receiver_id (user_id, name, username, profilePic, isdelete)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .neq("status", "declined")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const friendsList = data
      .map((friend) => {
        const friendInfo = friend.requester_id == userId ? friend.receiver : friend.requester;
        if (!friendInfo) return null;

        return {
          ...friendInfo,
          status: friend.status,
          friendship_id: friend.id,
          createdAt: friend.created_at,
        };
      })

      .filter(friend => friend !== null && friend.isdelete === 'active');

    return res.status(200).json(friendsList);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addfriend = async (req, res) => {
  const { receiver_id } = req.body;
  const requesterId = req.user.user_id;
  try {
    if (!receiver_id) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }
    const { error } = await db
      .from("friendships")
      .insert([
        {
          requester_id: requesterId,
          receiver_id: receiver_id,
          status: "pending",
        },
      ]);

    if (error) throw error;

    return res
      .status(200)
      .json({ message: "Friend request sent successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.acceptFriend = async (req, res) => {
  const { requester_id } = req.body;
  const receiverId = req.user.user_id;

  try {
    const { error } = await db
      .from("friendships")
      .update({ status: "accepted" })
      .eq("requester_id", requester_id)
      .eq("receiver_id", receiverId);

    if (error) throw error;

    return res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// rightBar
exports.getFriendRequests = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const { data, error } = await db
      .from("friendships")
      .select(
        `
        *,
        requester:requester_id (user_id, name, username, profilePic)
      `,
      )
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const friendsList = data.map((friend) => {
      if (!friend.requester) return null;
      return {
        ...friend.requester,
        status: friend.status,
        friendship_id: friend.friendship_id,
        createdAt: friend.created_at,
      };
    });

    return res.status(200).json(friendsList);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getContacts = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await db
      .from("friendships")
      .select(
        `
        *,
        requester:requester_id (user_id, name, username, profilePic),
        receiver:receiver_id (user_id, name, username, profilePic)
      `,
      )
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedContacts = data.map(friend => {
      return friend.requester_id == userId ? friend.receiver : friend.requester;
    });

    return res.status(200).json(formattedContacts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.declineFriend = async (req, res) => {
  const { targetId } = req.body;
  const myId = req.user.user_id;

  try {
    const { error } = await db
      .from("friendships")
      .delete()
      .or(`and(requester_id.eq.${targetId},receiver_id.eq.${myId}),and(requester_id.eq.${myId},receiver_id.eq.${targetId})`);

    if (error) throw error;

    return res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// Profile เพื่อน
exports.getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await db
      .from('users')
      .select('user_id, username, name, profilePic, coverPic, description, city, website')
      .eq('user_id', id)
      .eq("isdelete", "active")
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

