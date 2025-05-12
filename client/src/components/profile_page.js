import "../stylesheets/profile_page.css"
import { useState, useEffect } from "react";
import axios from 'axios';
//1.user must be logged in
//2.user clicked on the profile button

export default function ProfilePage(props){
    const view = props.view;
    const setView = props.setView;
    const setPage =  props.setPage;
    const user = props.currentUser;
    const isAdmin = user.isAdmin;
  

    const [communitiesArr,setCommunitiesArr] = useState([]);
    const [reputation, setReputation] = useState(0);
    const [postsArr,setPostsArr] = useState([]);
    const [commentsArr,setCommentsArr] = useState([]);
    const [selected, setSelected] = useState("Posts");
    const [usersArr, setUsersArr] = useState([]);
    
    const [viewingUser, setViewingUser] = useState(user);  
    useEffect(() => {
        //make the logged-in user to always have _id
        setViewingUser(prev => ({ ...prev, _id: prev._id ?? prev.id }));
      }, []);
    const isViewingAdmin = viewingUser.isAdmin;

    useEffect(() => 
    {
        const get_data = async () =>{
            try{
                const comms = await axios.get("http://localhost:8000/communities/");
                const posts = await axios.get("http://localhost:8000/posts/");
                const comments = await axios.get("http://localhost:8000/comments/");
                const rep = await axios.get(`http://localhost:8000/users/${user.id}/reputation`);  //only get reputation

                // Update each state variable with the gathered data
                setCommunitiesArr(comms.data); 
                setPostsArr(posts.data);
                setCommentsArr(comments.data);
                setReputation(rep.data.reputation);  

            } 
            catch(err){
                console.error("Error fetching data:", err);
                setView("Error-Page")
                setPage(err)
            }
        };

        get_data();
    }, [view]);

    useEffect(() => {
        if(isAdmin && selected === "Users" && usersArr.length === 0){
            axios.get("http://localhost:8000/users/")
                .then(res => setUsersArr(res.data))
                .catch(err => console.error("Failed to load users", err));
        }
    }, [selected, isAdmin]);


    async function delete_post(postID){ //delete post request
        try{
            await axios.delete(`http://localhost:8000/posts/${postID}`);  //send request to delete
            console.log("deleted post success");

            //update postArr and comment
            const [new_posts, new_comments] = await Promise.all([
                axios.get("http://localhost:8000/posts/"),
                axios.get("http://localhost:8000/comments/")
            ]);
            setPostsArr(new_posts.data);
            setCommentsArr(new_comments.data);
        }
        catch(err){
            console.log("fail to delete post.",err);
            setView("Error-Page")
            setPage(err)
        }
    }

    function user_posts(){   //to return all user's posts
        const user_posts = postsArr.filter(post => {
            const postedBy = typeof post.postedBy === 'string' ? post.postedBy : post.postedBy._id; //if populated, it will be string Name
            console.log("Comparing postedBy:", postedBy, "with viewingUser._id:", viewingUser._id);
            return postedBy === viewingUser._id;
        });
        
        if(user_posts.length === 0){
            return <p>No posts created yet.</p>;
        }

        return (
            <div className="user-posts-list">
                {user_posts.map(post => (
                    <div key={post._id}>
                        <button className="post-title-btn" 
                            onClick={() => {
                                setView("Edit-Post-Page");
                                setPage(post._id)
                            }}>{post.title}
                        </button>
                        <button className="delete-btn" 
                                onClick={async () => {
                                    const confirm = window.confirm("are you sure you want to delete this post")
                                    if(confirm){
                                        await delete_post(post._id);
                                    }
                                }}>Delete
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    async function delete_community(communityID){
        try{
            await axios.delete(`http://localhost:8000/communities/${communityID}`);  //send request to delete
            console.log("deleted community success");

            //update postArr and comment
            const [new_posts, new_comments, new_communities] = await Promise.all([
                axios.get("http://localhost:8000/posts/"),
                axios.get("http://localhost:8000/comments/"),
                axios.get("http://localhost:8000/communities/")
            ]);
            setPostsArr(new_posts.data);
            setCommentsArr(new_comments.data);
            setCommunitiesArr(new_communities.data);
            setView("Profile-Page");
        }
        catch(err){
            console.log("fail to delete community.",err);
            setView("Error-Page");
            setPage(err)
        }
    }

    function user_communities(){ //to return all user's communities
        const user_communities = communitiesArr.filter(community => {
            //if populated, it will be string Name
            const createdBy = typeof community.createdBy === 'string' ? community.createdBy : community.createdBy._id; 
            return createdBy === viewingUser._id;
        });
        
        if(user_communities.length === 0){
            return <p>No communities created yet.</p>;
        }

        return (
            <div className="user-communities-list">
                {user_communities.map(community => (
                    <div key={community._id}>
                        <button className="post-title-btn" 
                            onClick={() => {
                                setView("Edit-Community-Page");
                                setPage(community._id);
                            }}>{community.name}
                        </button>
                        <button className="delete-btn" 
                                onClick={async () => {
                                    const confirm = window.confirm("are you sure you want to delete this community")
                                    if(confirm){
                                        await delete_community(community._id);
                                    }
                                }}>Delete
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    async function delete_comment(commentID){ // to delete a comment
        try{
            await axios.delete(`http://localhost:8000/comments/${commentID}`);  //send request to delete
            console.log("deleted comment success");

            const new_comments = await axios.get("http://localhost:8000/comments/");
            setCommentsArr(new_comments.data);
        }
        catch(err){
            console.log("fail to delete comment.",err);
            setView("Error-Page");
            setPage(err)
        }
    }

    function user_comments(){ // to return user's comments
        const user_comments = commentsArr.filter(comments => {
            //if populated, it will be string Name
            const commentedBy = typeof comments.commentedBy === 'string' ? comments.commentedBy : comments.commentedBy._id; 
            return commentedBy === viewingUser._id;
        });
        
        if(user_comments.length === 0){
            return <p>No comments created yet.</p>;
        }

        return (
            <div className="user-comments-list">
                {user_comments.map(comment => (
                    <div key={comment._id}>
                        <button className="post-title-btn" 
                            onClick={() => {
                                setView("Edit-Comment-Page");
                                setPage(comment._id);
                            }}>{comment.content.substring(0, 20)}...
                        </button>
                        <button className="delete-btn" 
                                onClick={async () => {
                                    const confirm = window.confirm("are you sure you want to delete this comment")
                                    if(confirm){
                                        await delete_comment(comment._id);
                                    }
                                }}>Delete
                        </button>
                    </div>
                ))}
            </div>
        )
    }
    async function delete_user(userID){
        if(userID === user.id){   //can't delete itself.
            alert("Admins cannot delete themselves.");
            return;
        }
        try{
            await axios.delete(`http://localhost:8000/users/${userID}`);  //send request to delete
            console.log("deleted user success");

            const new_users = await axios.get("http://localhost:8000/users/");
            setUsersArr(new_users.data);
            setView("Profile-Page");
        }
        catch(err){
            console.log("fail to delete user.",err);
            setView("Error-Page")
            setPage(err);
        }
    }

    function phreddit_users(){ //for users
        return (
            <div className="user-list">
                {usersArr.map(u => (
                    <div key={u._id}>
                        <button className="post-title-btn"
                            onClick={async () => {
                                try {
                                    const res = await axios.get(`http://localhost:8000/users/${u._id}/info`);
                                    setViewingUser(res.data);        //update what we show
                                    setReputation(res.data.reputation)
                                    setSelected("Posts");            //switch to post view
                                    setPage(u._id);                  //store reference
                                } 
                                catch(err){
                                    console.error("Failed to load user summary", err);
                                }
                                }}>
                            {u.displayName} | {u.email} | {u.reputation}
                        </button>
                        <button className="delete-btn" 
                                onClick={async () => {
                                    const confirm = window.confirm("are you sure you want to delete this user")
                                    if(confirm){
                                        await delete_user(u._id);
                                    }
                                }}>Delete
                        </button>
                    </div>
                ))}
            </div>
        );
    }

    function formatDate(dateString){
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
    }

    return (
        <>
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-info">
                <div className="row">
                    <span className="label">Username: </span><span className="value">{viewingUser.displayName}</span>
                </div>
                <div className="row">
                    <span className="label">Email:</span><span className="value">{viewingUser.email}</span>
                </div>
                <div className="row">
                    <span className="label">Reputation:</span><span className="value">{reputation}</span>
                </div>
                <div className="row">
                    <span className="label">Member since:</span>
                    <span className="value">
                        {viewingUser.createdDate ? formatDate(viewingUser.createdDate) : "Unknown"}
                    </span>
                </div>
            </div>

            <div className="btn-container">
                <button className={`section-btn ${selected === "Posts" ? "active" : ""}`} id="posts-btn"
                        onClick={() => setSelected("Posts")}>Posts</button>

                <button className={`section-btn ${selected === "Communities" ? "active" : ""}`} id="communities-btn"
                        onClick={() => setSelected("Communities")}>Communities</button>

                <button className={`section-btn ${selected === "Comments" ? "active" : ""}`} id="comments-btn"
                        onClick={() => setSelected("Comments")}>Comments</button>

                {isViewingAdmin && (
                    <button className={`section-btn ${selected === "Users" ? "active" : ""}`} id="users-btn"
                        onClick={() => setSelected("Users")}>Users</button>
                )}

                {isAdmin && viewingUser.displayName !== user.displayName && (
                <button onClick={async () => {
                    try{
                        const res = await axios.get(`http://localhost:8000/users/${user.id}/info`); //refetch info
                        setViewingUser(res.data);
                        setReputation(res.data.reputation);
                        setSelected("Users");
                        setPage(user.id);
                    } 
                    catch(err){
                        console.error("Failed to reload admin info", err);
                    }
                }}>Back to My Profile</button>
                )}

            </div>
            
            

            <div className="content-container">
                {selected === "Posts" && user_posts()}
                {selected === "Communities" && user_communities()}
                {selected === "Comments" && user_comments()}
                {selected === "Users" && isAdmin && phreddit_users()}
            </div>
        </div>
        </>
    )
}