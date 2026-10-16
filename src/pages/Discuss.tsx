import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getFirestorePosts } from "../services/discussService";

const INIT_POSTS = [
  {
    id: 1,
    author: "Aarav Shah",
    avatar: "🦊",
    time: "2h ago",
    text: "Anyone else struggling with Python list comprehension bugs? They're sneaky! 🐍",
    likes: 24,
    comments: [
      {
        author: "Priya",
        text: "Yes! The conditional part always trips me up 😅",
      },
    ],
  },
  {
    id: 2,
    author: "Priya Nair",
    avatar: "🐼",
    time: "5h ago",
    text: "Just hit 50 solves! The JavaScript async/await challenges are 🔥 worth it",
    likes: 41,
    comments: [],
  },
  {
    id: 3,
    author: "Sneha M",
    avatar: "🦋",
    time: "1d ago",
    text: "Pro tip: Always check array bounds first when you see a runtime error 💡",
    likes: 67,
    comments: [],
  },
];

function Av({
  emoji,
  size = 42,
}: {
  emoji: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--card2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}

interface DiscussProps {
  user: any;
}

function Discuss({ user }: DiscussProps) {
      const [posts, setPosts] = useState<any[]>(INIT_POSTS);
      const [loading, setLoading] = useState(true);
      const [newPost, setNewPost] = useState("");
      const [commenting, setCommenting] = useState<string | number | null>(null);
      const [commentVal, setCommentVal] = useState("");
      const [groupModal, setGroupModal] = useState(null);
    
      // Load posts from Firestore in real-time order
      useEffect(() => {
  async function loadPosts() {
    try {
      const firestorePosts = await getFirestorePosts();

      setPosts(
        firestorePosts.length > 0
          ? firestorePosts
          : INIT_POSTS
      );
    } catch (e) {
      console.error("Load posts error:", e);
      setPosts(INIT_POSTS);
    } finally {
      setLoading(false);
    }
  }

  loadPosts();
}, []);
    
      async function addPost() {
        if (!newPost.trim()) return;
        const postData = {
          author: user.name,
          avatar: user.avatar || "🚀",
          uid: user.uid,
          time: "just now",
          text: newPost,
          likes: 0,
          likedBy: [],
          comments: [],
          createdAt: new Date().toISOString(),
        };
        try {
          const ref = await addDoc(collection(db, "posts"), postData);
          setPosts((p) => [{ ...postData, id: ref.id }, ...p]);
        } catch (e) {
          console.error("Post save error:", e);
          setPosts((p) => [{ ...postData, id: Date.now() }, ...p]);
        }
        setNewPost("");
      }
    
      async function like(id: string | number) {
        const alreadyLiked = posts.find(p => p.id === id)?.likedBy?.includes(user.uid);
        setPosts((p) =>
          p.map((post) =>
            post.id === id
              ? {
                  ...post,
                  likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
                  likedBy: alreadyLiked
                    ? (post.likedBy || []).filter((u: any) => u !== user.uid)
                    : [...(post.likedBy || []), user.uid],
                }
              : post
          )
        );
        try {
          const postRef = doc(db, "posts", String(id));
          const snap = await getDoc(postRef);
          if (snap.exists()) {
            const likedBy = snap.data().likedBy || [];
            if (likedBy.includes(user.uid)) {
              await updateDoc(postRef, {
                likes: snap.data().likes - 1,
                likedBy: likedBy.filter((u: any) => u !== user.uid),
              });
            } else {
              await updateDoc(postRef, {
                likes: snap.data().likes + 1,
                likedBy: [...likedBy, user.uid],
              });
            }
          }
        } catch (e) { console.error("Like error:", e); }
      }
      async function addComment(id: string | number) {
        if (!commentVal.trim()) return;
        const newComment = {
          author: user.name,
          avatar: user.avatar || "💬",
          uid: user.uid,
          text: commentVal,
          createdAt: new Date().toISOString(),
        };
        // Save to Firestore
        try {
          const postRef = doc(db, "posts", String(id));
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            const existing = postSnap.data().comments || [];
            await updateDoc(postRef, { comments: [...existing, newComment] });
          }
        } catch (e) { console.error("Comment save error:", e); }
        setPosts((p) =>
          p.map((post) =>
            post.id === id
              ? { ...post, comments: [...(post.comments || []), newComment] }
              : post
          )
        );
        setCommentVal("");
        setCommenting(null);
      }
    
      return (
        <div
          className="page"
          style={{
            paddingTop: 90,
            padding: "90px 24px 60px",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          {groupModal && (
            <div className="modal-overlay" onClick={() => setGroupModal(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 24,
                    marginBottom: 8,
                  }}
                >
                  👥 Connect with {groupModal}
                </div>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 24,
                  }}
                >
                  Start a group chat or add them to an existing group.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn-lime"
                    style={{ flex: 1 }}
                    onClick={() => setGroupModal(null)}
                  >
                    Create Group Chat 💬
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setGroupModal(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <h1
            style={{ fontFamily: "var(--display)", fontSize: 38, marginBottom: 6 }}
          >
            Discuss 💬
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Share bugs, tips, and help others debug!
          </p>
          <div className="card" style={{ marginBottom: 22 }}>
            <textarea
              rows={3}
              placeholder="Share a tip, ask a question, or post your debugging experience..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1.5px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                color: "var(--text)",
                fontSize: 14,
                resize: "none",
                transition: "border-color .2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}
            >
              <button className="btn-lime btn-sm" onClick={addPost}>
                Post 🚀
              </button>
            </div>
          </div>
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>
              Loading posts... ⏳
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>
              No posts yet. Be the first to share! 🚀
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="post">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Av emoji={post.avatar} size={40} />
                <div>
                  <button
                    style={{
                      background: "none",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "var(--text)",
                    }}
                    onClick={() => setGroupModal(post.author)}
                  >
                    {post.author}
                  </button>
                  <div
                    style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}
                  >
                    {post.time}
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                {post.text}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{
                    background: post.likedBy?.includes(user.uid)
                      ? "rgba(255,75,203,.25)" : "rgba(255,75,203,.1)",
                    color: "var(--pink)",
                    border: post.likedBy?.includes(user.uid)
                      ? "1px solid rgba(255,75,203,.6)" : "1px solid rgba(255,75,203,.2)",
                    borderRadius: 50,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    transform: post.likedBy?.includes(user.uid) ? "scale(1.05)" : "scale(1)",
                    transition: "all .2s",
                  }}
                  onClick={() => like(post.id)}
                >
                  {post.likedBy?.includes(user.uid) ? "❤️" : "🤍"} {post.likes}
                </button>
                <button
                  style={{
                    background: "var(--card2)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 50,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  onClick={() =>
                    setCommenting(commenting === post.id ? null : post.id)
                  }
                >
                  💬 {(post.comments || []).length}
                </button>
              </div>
              {(post.comments || []).length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {(post.comments || []).map((c: any, i: number) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 10, marginBottom: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--card2)",
                          border: "1.5px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {c.avatar || "💬"}
                      </div>
                      <div
                        style={{
                          background: "var(--card2)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: "8px 12px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 12,
                            color: "var(--text)",
                            marginBottom: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{
                            background: "linear-gradient(90deg,var(--cyan),var(--purple))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 900,
                          }}>
                            {c.author}
                          </span>
                          {c.createdAt && (
                            <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 11,
                              WebkitTextFillColor: "var(--muted)" }}>
                              · {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                          {c.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {commenting === post.id && (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input
                    placeholder="Write a comment..."
                    value={commentVal}
                    onChange={(e) => setCommentVal(e.target.value)}
                    style={{
                      flex: 1,
                      background: "var(--card2)",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      color: "var(--text)",
                      fontSize: 13,
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                  />
                  <button
                    className="btn-lime btn-sm"
                    onClick={() => addComment(post.id)}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
    );
}
    export default Discuss;
