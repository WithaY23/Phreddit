import timeConverter from "./time_conversion.mjs";
import '../stylesheets/post_page.css';
import { getTotalCommentCount } from "./load_page";
import {addHyperlinks} from "./hyperlink";
import axios from "axios";
import { useEffect, useState } from "react";


//comment container
function CommentSection(props) // props will be used for: comments, page
{
    const comments = props.comments;
    const post = props.page;
    const post_comment_array = comments.filter( //return an array of comment objects replying to the post
        (comment) => post.commentIDs.includes(comment._id)).toSorted( //verify post comments contain that commentID
            (cmt1,cmt2)=>new Date(cmt2.commentedDate) - new Date(cmt1.commentedDate)); //had to add new Date constructor, ERROR: no clue why...
    const formatted_comments= post_comment_array.map(cmt =>
        {
            return <Comment key={cmt._id} comment={cmt} comments ={comments} changeView={props.changeView} changePage={props.changePage}/>
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
        const username = props.comment.commentedBy;
        const timestamp= timeConverter(props.comment.commentedDate);
        const content = props.comment.content;

        return(
            <div className="comment">
            <span className="comment-username">{username}</span>
            <span className="post-timestamp">{timestamp.toLocaleString()}</span>
            <div className="comment-content">{addHyperlinks(content)}</div>
            <button className="button" onClick={()=>
            {
                props.changeView("Create-Comment-Page-Comment");
                props.changePage(props.comment._id);
            }
            }>Reply</button>
            {props.comment.commentIDs.length !==0 && <NestedComment comments={props.comments} subComments={props.comment.commentIDs} changeView={props.changeView} changePage={props.changePage}/>}
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
            return <Comment key={cmt._id} comment={cmt} comments={props.comments} changeView={props.changeView} changePage={props.changePage}/>
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
    const comments = props.comments;
    console.log("HI");
   return (<div className="counters">
            <span id="view-label">Views: </span>
            <span id="comment-label">Comments: </span>
            <span id="view-count">{post.views}</span>
            <span id="comment-count">{getTotalCommentCount(post.commentIDs,comments)}</span>
    </div>)
}








// props will be used for: changeView, page (post object), comments, communities, linkFlair (removed changeComments)
export default function Post_Page(props)
{
    const [post, setPost] = useState(undefined)
    const [community, setCommunity] = useState(undefined);
    const [linkflair, setLinkflair] = useState(""); //only use the necessary linkflair
    const [comments,setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const postID = props.page._id;
    
    useEffect(() =>{
        const getDBData = async () =>{
            try
            {
                // const cmty = await axios.get("http://127.0.0.1:8000/communities"); //utilize virtual field to get community
                const pst = (await axios.get("http://127.0.0.1:8000/posts/" + postID)).data;
                const cmty = pst.community;
                if(pst.hasOwnProperty('linkFlairID'))
                {
                    const lf = (await axios.get("http://127.0.0.1:8000/linkflairs/" + pst.linkFlairID._id)).data; //should only get one linkflair, add to server.js
                    setLinkflair(lf);
                }
                else
                {
                    setLinkflair("")
                }
                const com =  (await axios.get("http://127.0.0.1:8000/comments/")).data
                setPost(pst);
                setCommunity(cmty);
                setComments(com);
                setLoading(false);
            }
            catch(err)
            {
                console.error("Error getting data inside post page: ", err);
            }
        }
        getDBData();
    },[props.view,postID]);
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

            <div id="post-username">{post.postedBy}</div>

            <h2 id="post-title">{post.title}</h2>

        {linkFlair !== "" && <div className="link-flair">{linkFlair.content}</div>}
        </div>
        <div id="post-content">
            {addHyperlinks(post.content)} 
        </div>


        <Counters page= {post} comments={comments}/>
        <button className="button comment-button" onClick={()=>
            {
                props.changeView("Create-Comment-Page-Post");
                props.changePage(post._id)
            }
        }>Add a comment</button>
        <CommentSection comments={comments} page={post} changeView={props.changeView} changePage={props.changePage}/>
        
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