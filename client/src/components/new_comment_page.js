import { useState } from "react";
import today_date from "./today_date.mjs";
import { verifyHyperlinks } from "./hyperlink";
import '../stylesheets/new_comment_page.css';
import axios from 'axios';


//page to make a new comment, return to relevant postpage view with new comment
// props will be used for: view (type of reply comment, detailed in General.md), changeView, page (id of reply content), changePage, posts, changePosts, comments, changeComments
// reply to post if view is "Create-Comment-Page-Post", reply to comment if view is "Create-Comment-Page-Comment"
// get the comments model and, if needed, post model
// update comments model and, if needed, post model
export default function New_Comment_Page(props) 
{
    const [textbox,set_textbox] = useState("");
    // const [username,set_username] = useState("");

    const replySubject = props.view;
    const ID = props.page;
    const currentUser= props.currentUser;
    // const posts= props.posts;
    // const comments= props.comments;

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
        // if(username === "")
        // {
        //     err.push("enter a username");
        // }
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
            const comments = (await axios.get('http://localhost:8000/comments')).data;
            const posts = (await axios.get('http://localhost:8000/posts')).data;
            

            const comment = 
            {
                commentID: "comment" + (comments.length + 1),
                content: textbox,
                commentIDs: [],
                commentedBy: currentUser.id,
                commentedDate: today_date(new Date()),
            }
    
            try
            {
                const newComment = (await axios.post("http://127.0.0.1:8000/comments", comment)).data.comment;
                if(replySubject === "Create-Comment-Page-Post") //it is a post comment
                {
                    //update the post object to include the comment
                    /*OLD
                    const post = model.data.posts.find((post) => post.postID == props.id);
                    post.commentIDs.push(comment.commentID);
                    props.updateFunction(model);
                    */
    
                    const post = posts.find((post) => post._id === ID);
                    // post.commentIDs.push(comment.commentID);
    
                    // let otherPostsArr= structuredClone(posts); //create deep copy, likely not efficient given below method
                    // const shallowPostArr = [...posts].filter((p) => p.postID !== post.postID); //FINICKY CODE, relies on recreating shallow instances and replacing data
                    // shallowPostArr.push(post);
                    // props.changePosts(shallowPostArr);
                    try
                    {
                        const updateValue = (await axios.post("http://localhost:8000/posts/update-posts-commentIDs/" + post._id, newComment)).data;
                        // load new view
                        console.log(updateValue.success);
                        const updatedPost = updateValue.post;
                        props.changeView("Post-Page");
                        props.changePage(updatedPost); //DOUBLE CHECK, COMMON ERROR; UNSURE IF THIS OBJECT SHOULD BE PASSED
                    }
                    catch(err)
                    {
                        console.error("Error updating post comments: ", err)
                        props.changeView("Error-Page");
                        props.changePage(err)

                    }
                    
                }
                else // It is a nested comment, find page it belongs to
                {
                    /*OLD
                    const cmt= model.data.comments.find((comment) => comment.commentID == props.id);
                    cmt.commentIDs.push(comment.commentID);
                    */
                    
        
                    
                    const cmt = comments.find((comment) => comment._id === ID);
                    // cmt.commentIDs.push(comment.commentID);
                    // const shallowCommentArray = [...comments].filter((c) => c.commentID !== cmt.commentID); //FINICKY CODE, relies on recreating shallow instances
                    // shallowCommentArray.push(cmt);
                    // shallowCommentArray.push(comment);
                    // props.changeComments(shallowCommentArray);
                    try
                    {
                        await axios.post("http://localhost:8000/comments/update-comments-commentIDs/" + cmt._id, newComment)
                    }
                    catch(err)
                    {
                        console.error("Error updating comment subcomments: ", err)
                        props.changeView("Error-Page");
                        props.changePage(err)

                    }
        
                    const post = find_comment_post(ID, comments, posts);
                    
                    props.changeView("Post-Page");
                    props.changePage(post);
                    // load new view
                }
            
            
            
            
            }
            catch(err)
            {
                console.error("Error creating a new comment:", err);
                props.changeView("Error-Page");
                props.changePost(err)
            }
    
            
        }

       /*OLD
       const comment =
        {
            commentID: model.data.comments.length + 1,
            content: textbox,
            commentIDs: [],
            commentedBy: username,
            commentedDate: today_date(new Date()),
        }

        props.updateFunction(model.data.comments.push(comment));
        */
        
       
        catch(err)
        {
            console.log("Error getting data for New comment page ", err)
            props.changeView("Error-Page");
            props.changePage(err)

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
return (
    <div className="under-main-content-header" id="posts_container">
        <div className="new-comment-container">
            <div className="new-comment-header-container">
                <span className="new-requirement" id="comment-requirement">- Required</span>
            </div>
            <div id="new-comment-content-container">
                <label htmlFor="new-comment-content" className="new-requirement">Comment: </label>
                <textarea id="new-comment-content" name="new-comment-content" rows="2" maxLength="500" placeholder="Maximum Of 500 Characters " value={textbox} onChange={e => set_textbox(e.target.value)}></textarea>
            </div>
            <span id="new-comment-submit-container">
                    <button id="new-comment-submit-button" className="button" onClick={validate_input}>Submit Comment</button>
            </span>
        </div>
    </div>
  
)
}