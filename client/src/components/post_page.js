import timeConverter from "./time_conversion.mjs";
import '../stylesheets/post_page.css';
import { getTotalCommentCount } from "./load_page";
import {addHyperlinks} from "./hyperlink";
import axios from "axios";
import { useEffect, useState } from "react";

//USES USERNAME INSTEAD OF CURRENTUSER
//comment container
function CommentSection(props) // props will be used for: comments, page
{
    const comments = props.comments;
    const post = props.page;
    const view = props.view;
    const post_comment_array = comments.filter( //return an array of comment objects replying to the post
        (comment) => post.commentIDs.includes(comment._id)).toSorted( //verify post comments contain that commentID
            (cmt1,cmt2)=>new Date(cmt2.commentedDate) - new Date(cmt1.commentedDate)); //had to add new Date constructor, ERROR: no clue why...
    const formatted_comments= post_comment_array.map(cmt =>
        {
            return <Comment key={cmt._id} username={props.username} comment={cmt} comments ={comments} view={view} changeView={props.changeView} changePage={props.changePage}/>
        })
    
    return (
        
    <div className="comment-section">
        {formatted_comments}
    </div>
        )

    // <Nested_Comment comments ={post_comment_array} /> //will need to recursively create comments and call itself

    

    // Format a comment
    // props will be used for: comment, changeView, changePage
    function Comment(props) 
    {
        // Store important aspects of the comment in relevant variables
        console.log(props.comment);
        const username=  props.username;
        const commentName = props.comment.commentedBy.displayName;
        const timestamp= timeConverter(props.comment.commentedDate);
        const content = props.comment.content;
        const votes = props.comment.voteCount
        const view=  props.view;

        return(
            <div className="comment">
            <span className="comment-username">{commentName}</span>
            <span className="post-timestamp">{timestamp.toLocaleString()}</span>
            <div className="comment-content">{addHyperlinks(content)}</div>
            
            {username ? <VoteDisplay contentType="Comment" content={props.comment} username= {username} view={view}/> : <span className="vote-description">Like Count: {votes}</span> }
            
            {username && <button className="button" onClick={()=>
            {
                props.changeView("Create-Comment-Page-Comment");
                props.changePage(props.comment._id);
            }
            }>Reply</button> }
            
            {props.comment.commentIDs.length !==0 && <NestedComment username = {username} comments={props.comments} subComments={props.comment.commentIDs} changeView={props.changeView} changePage={props.changePage}/>}
            </div>
        )
    }

    //container for indent, represent nested comments
    function NestedComment(props) //props will be used for: comments (general array), subComments (replying to specific comment)
    {

        const comment_objects = props.subComments.map((cmtID)=>{
            return props.comments.find((comment) => comment._id === cmtID)});
        const comments_sorted = comment_objects.toSorted((cmt1,cmt2)=>new Date(cmt2.commentedDate) - new Date(cmt1.commentedDate));

        const comment_formatted= comments_sorted.map(cmt=>
        {
            return <Comment key={cmt._id} comment={cmt} username={props.username} comments={props.comments} changeView={props.changeView} changePage={props.changePage}/>
        })

        return(
            <div className="sub-comment-container">
                {comment_formatted}
            </div>
        )
        
    }


}

//view and comment count container
function Counters(props) //props will be used for: page, comments
{
    const post = props.page; //pass down page object as a prop
    const username = props.username;
    // const [voteCount, setVoteCount] = useState(post.voteCount)
    const voteCount = post.voteCount;
    const comments = props.comments;
    const view = props.view;
    console.log("HI");
    
   return (<div className="counters">
            <span id="view-label">Views: </span>
            <span id="comment-label">Comments: </span>
            <span id="vote-label">Votes: </span>
            <span id="view-count">{post.views}</span>
            <span id="comment-count">{getTotalCommentCount(post.commentIDs,comments)}</span>
            {username ?  <VoteDisplay contentType="Post" content={post} username= {username} view = {view}/> :  <span id="vote-count">
                
                Like Count: {voteCount}</span>}
    </div>)
}

function VoteDisplay(props) // props uses: contentType (post/comment), content (the actual instance object), username (of the person voting)
{
    const contentType= props.contentType;
    const content= props.content;
    const username = props.username; //FIX: EDITED TO FIT PASSING USERNAME OBJECT
    const [voteCount, setVoteCount] = useState(content.voteCount)
    const [currentVote, setCurrentVote] = useState(0); //currentVote.values = [-1,0,1]

    console.log(content);
    useEffect(() =>
    {

        const vote = content.voteUp.some((name) => name=== username.id)? 1
            : content.voteDown.some((name) => name === username.id)
            ? -1
            : 0;
        console.log(content)
        console.log(username.id);
        console.log("Current vote:", vote);
        setCurrentVote(vote);
    },[props.view, content, username.id]) //onmount



    return(
        <span id="vote-count" className="vote-description">
            {currentVote === 1 ? 
                    <button className="button voted" onClick={() => changeVote(1,setCurrentVote, username, content, contentType, setVoteCount)}> Like</button>
                    : <button className="button"onClick={() => changeVote(1, setCurrentVote, username, content, contentType, setVoteCount)}>Like</button>}
            Like Count: {voteCount}
                    {currentVote === -1 ? 
                    <button className="button voted" onClick={() => changeVote(-1,setCurrentVote, username, content, contentType, setVoteCount)}>Dislike</button> 
                    : <button className="button" onClick={() => changeVote(-1, setCurrentVote, username, content, contentType, setVoteCount)}>Dislike</button>}
        </span>
    )
}

async function changeVote(newVote, setCurrentVote, votername, content, contentType, setVoteCount) // Update vote and UI based on user's action and current vote
{
    //need to: update vote state appearance, update vote count appearance, 
    try
    {
    const voternameObject = (await axios.get(`http://127.0.0.1:8000/users/username/${votername.id}`)).data;
        if(voternameObject.reputation < 50)//MAKE REQUEST
            {
                alert("Sorry, you do not have enough reputation to vote, try creating some new content first!");
            } 
        else
        {
            const id= content._id;  //FIX: EDITED TO FIT VOTING EXPECTED SERVER ID
            if (contentType === "Post") //distinguish between post or comment replying to
            {
                console.log("username value in post like update:", votername);
                //update the posts vote
                const {post, voteStatus} = (await axios.post(`http://127.0.0.1:8000/posts/updatePostVote/${newVote}`,{votername: votername, postID: id})).data; //return the new post and current voteStatus (users new vote) from axios
                console.log("after posting update to post like");
                setCurrentVote(voteStatus);
                setVoteCount(post.voteCount);
            }
            else if(contentType === "Comment")
            {
                const {comment, voteStatus} = (await axios.post(`http://127.0.0.1:8000/comments/updateCommentVote/${newVote}`, {commentID: id, votername: votername})).data;
                //get the comment to return the voteCount
                console.log(comment);
                console.log(voteStatus);
                setCurrentVote(voteStatus);
                setVoteCount(comment.voteCount);
            }
            else
            {
                console.error("Unknown vote on content")
            }
        }
        
        


    }
    catch(err)
    {
        console.error("Could not update users vote", err);
    }

}









//USES USERNAME INSTEAD OF CURRENTUSER
// props will be used for: changeView, page (post object), comments, communities, linkFlair (removed changeComments)
export default function Post_Page(props)
{
    const [post, setPost] = useState(undefined)
    const [community, setCommunity] = useState(undefined);
    const [linkflair, setLinkflair] = useState(""); //only use the necessary linkflair
    const [comments,setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const postID = props.page._id;
    const username = props.username ? props.username : "";
    const setView = props.setView;
    const setPage= props.setPage;


    useEffect(() =>{
        const getDBData = async () =>{
            try
            {
                // const cmty = await axios.get("http://localhost:8000/communities"); //utilize virtual field to get community
                const pst = (await axios.get("http://localhost:8000/posts/" + postID)).data;
                const cmty = pst.community;
                if(pst.hasOwnProperty('linkFlairID'))
                {
                    const lf = (await axios.get("http://localhost:8000/linkflairs/" + pst.linkFlairID._id)).data; //should only get one linkflair, add to server.js
                    setLinkflair(lf);
                }
                else
                {
                    setLinkflair("")
                }
                const com =  (await axios.get("http://localhost:8000/comments/")).data
                setPost(pst);
                setCommunity(cmty);
                setComments(com);
                setLoading(false);
            }
            catch(err)
            {
                console.error("Error getting data inside post page: ", err);
                setView("Error-Page") //ERROR ADDED
                setPage(err);
            }
        }
        getDBData();
    },[props.view,postID, setPage, setView]);
    // function get_community_post_name(communities,post)
    // {
    // let comm = "";
    // communities.forEach((community)=>
    // {
    //     if(community.postIDs.includes(post._id))
    //         {
    //             comm = community.name;  
    //         };
    // })
    // if(comm !== "")
    // {
    //     return comm;
    // }

    // alert("Post does not seem to be associated with a community");
    // return undefined;
    // }


    /*OLD
     const model = props.model;
     const post = model.data.posts.find(post => post == props.page); //props.page contains postID, find post
     const community = get_community_post_name(model,post);
     const linkflair = post.hasOwnProperty("linkFlairID") ? model.data.linkflair.find(lf => lf.linkFlairID == post.linkFlairID) : "";
    */
    
   if (loading)
   {
    return (<p>Loading</p>)
   }
   else
   {
    // const community_name = get_community_post_name(communities,post);


    const linkFlair = post.hasOwnProperty("linkFlairID") ? linkflair : ""; //change to post.linkFlairID
    return(
    <div style={{margin: "10px 0px 0px 5px"}}>
            
        
        <div className="post-description">
        <span id="community-name">{community.name}</span>

            <span id="post-timestamp">{timeConverter(post.postedDate).toLocaleString()}</span>

            <div id="post-username">{post.postedBy.displayName}</div>

            <h2 id="post-title">{post.title}</h2>

        {linkFlair !== "" && <div className="link-flair">{linkFlair.content}</div>}
        </div>
        <div id="post-content">
            {addHyperlinks(post.content)} 
        </div>


        <Counters page= {post} comments={comments} username={username} view={props.view}/>
        {username && <button className="button comment-button" onClick={()=>
            {
                props.changeView("Create-Comment-Page-Post");
                props.changePage(post._id)
            }
        }>Add a comment</button> }
        <CommentSection username={username} comments={comments} view={props.view} page={post} changeView={props.changeView} changePage={props.changePage}/>
        
    </div>
    )
   }
    
    // return(
        
    // <div style={{margin: "10px 0px 0px 5px"}}>
    //     {/* {loading ? (<p>Loading</p>
    //     ): 
    //     ( */}
            
    //     <>
        
    //     <div className="post-description">
    //     <span id="community-name">{community_name}</span>

    //         <span id="post-timestamp">{timeConverter(post.postedDate).toLocaleString()}</span>

    //         <div id="post-username">{post.postedBy}</div>

    //         <h2 id="post-title">{post.title}</h2>

    //     {linkFlair !== "" && <div className="link-flair">{linkFlair.content}</div>}
    //     </div>
    //     <div id="post-content">
    //         {addHyperlinks(post.content)} 
    //     </div>


    //     <Counters page= {post} comments={comments}/>
    //     <button className="button comment-button" onClick={()=>
    //         {
    //             props.changeView("Create-Comment-Page-Post");
    //             props.changePage(post._id)
    //         }
    //     }>Add a comment</button>
    //     <CommentSection comments={comments} page={post} changeView={props.changeView} changePage={props.changePage}/>
    //     </>    
    // </div>
    // )

    

}