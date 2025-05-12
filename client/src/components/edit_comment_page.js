import { useEffect, useState } from "react";
import today_date from "./today_date.mjs";
import { verifyHyperlinks } from "./hyperlink";
import '../stylesheets/new_comment_page.css';
import axios from 'axios';


//page to edit a comment, return to relevant profile page view with new comment
// props will be used for: view, changeView, page (id of original comment), changePage, comments
// reply to post if view is "Create-Comment-Page-Post", reply to comment if view is "Create-Comment-Page-Comment"
// get the comments model and, if needed, post model
// update comments model and, if needed, post model
export default function Edit_Comment_Page(props) 
{
    const [textbox,set_textbox] = useState("");
    const [originalComment, setOriginalComment] = useState(null);
    const [loading, setLoading] = useState(true);

    const originalCommentID = props.page;
    const currentUser= props.currentUser;
    const setView= props.setView;

    useEffect(() => {
        const fetchData = async function()
        {
            //DON'T need to get parent data, only for deleting
            // const posts = (await axios.get('http://localhost:8000/posts/')).data;
            // const comments=  (await axios.get('http://localhost:8000/comments/')).data;

            // //find comment's reply subject
            // const post = posts.find((post) => post.commentIDs.includes(originalCommentID));
            // if (post) //its replying to a post, we have that post
            // {

            // }
            // else //replying to a comment
            // {

            // }
            console.log(originalCommentID);
            const comment = (await axios.get("http://localhost:8000/comments/" + originalCommentID)).data
            console.log(comment);
            set_textbox(comment.content);
            setOriginalComment(comment);
            setLoading(false);
        }
        fetchData()
    }, [props.view])
    /*NEW

    */
    
    function validate_input()
    {

        const err = [];
        if(textbox === "")
        {
            err.push("enter comment content");
        }
        else
        {
            const verifyHl =verifyHyperlinks(textbox); //authenticate hyperlinks
            if(!verifyHl.flag)
            {
                verifyHl.message.forEach((e) =>{
                    err.push(e);
                })
            }
        }

        if(err.length !== 0)
        {
            alert(`Error from the following actions: ${err.join(", ")}`)
        }
        else
        {
            //upload comment to relevant data and return user to relevant post page
            update_data();            

        }

    }

    async function update_data()
    {
        try
        {
            // const comments = (await axios.get('http://localhost:8000/comments')).data;
            // const posts = (await axios.get('http://localhost:8000/posts')).data;
            

            const comment = originalComment.hasOwnProperty("postID") ? 
            {
                commentID: originalCommentID,
                content: textbox,
                commentIDs: originalComment.commentIDs,
                commentedBy: currentUser.id,
                commentedDate: originalComment.commentedDate,
                voteUp: originalComment.voteUp,
                voteDown: originalComment.voteDown,
                postID: originalComment.postID
            }
            :
            {
                commentID: originalCommentID,
                content: textbox,
                commentIDs: originalComment.commentIDs,
                commentedBy: currentUser.id,
                commentedDate: originalComment.commentedDate,
                voteUp: originalComment.voteUp,
                voteDown: originalComment.voteDown,
            }
    
            try
            {
                //update database with post
                const newComment = (await axios.post("http://localhost:8000/comments/editcomment", {comment: comment})).data;
                setView("Profile-Page");
            }
            catch(err)
            {
                console.error("Error editing a comment:", err);
            }
    
            
        }
        
       
        catch(err)
        {
            console.log("Error getting data for New comment page ", err)
        }


    function find_comment_post(commentID, comments, posts) //find the post to which a comment belongs
    {
        
        return query_posts_comment(commentID);


        function query_posts_comment(cmtID) //look through the posts to see if the commentID is found
        {
            const post = posts.find(post =>  //look through each post till one is found with comment
                {
                    let flag = false;
                    post.commentIDs.forEach(cID =>  //loop through each post's commentIDs
                        {
                            if(cID === cmtID)
                            {
                                flag= post;
                                return;
                            }
                        });
                    if (flag === post)
                    {
                        return flag;
                    }
                    else
                    {
                        return undefined;
                    }
                });
            if (!post)
                {
                    return find_comment_comment(cmtID); //recursively call the comment to find the nested comment
                }
                else
                {
                    return post;
                }
        
        }
        function find_comment_comment(cmtID) //find post in which a nested comment is contained recursively
        {
            const comment = comments.find((cmt) =>
            {
                return cmt.commentIDs.includes(cmtID)
            })
            
            return query_posts_comment(comment._id);
        }
    }
    }
return loading ? <p>Loading</p> :(
    <div className="under-main-content-header" id="posts_container">
        <div className="new-comment-container">
            <div className="new-comment-header-container">
                <span className="new-requirement" id="comment-requirement">- Required</span>
            </div>
            <div id="new-comment-content-container">
                <label htmlFor="new-comment-content" className="new-requirement">Comment: </label>
                <textarea id="new-comment-content" name="new-comment-content" rows="2" maxLength="500" placeholder="Maximum Of 500 Characters " value={textbox} onChange={e => set_textbox(e.target.value)}>{originalComment.content}</textarea>
            </div>
            <span id="new-comment-submit-container">
                    <button id="new-comment-submit-button" className="button" onClick={validate_input}>Submit Comment</button>
                    <button id="new-comment-delete-button" onClick={async() =>{if(window.confirm("Are you sure you want to delete this comment") === true){await delete_comment(originalCommentID); setView("Profile-Page")}}  }className="button">Delete Comment</button>
            </span>
        </div>
    </div>
  
    )
}

async function delete_comment(commentID) // to delete a comment
{ 
        try{
            await axios.delete(`http://localhost:8000/comments/${commentID}`);  //send request to delete
            console.log("deleted comment success");
        }
        catch(err){
            console.log("fail to delete comment.",err);
        }
}