import { useState, useEffect} from "react";
import today_date from "./today_date.mjs";
import '../stylesheets/new_post_page.css';
import { verifyHyperlinks } from "./hyperlink";
import {userCommunityOrdered} from './time_conversion.mjs';
import axios from "axios";

export default function EditPostPage(props) //post id, user id, view, setView
{

    //model variables
    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);

    const currentUser = props.currentUser;
    const postID = props.page;


    const fetchData = async () =>
        {
            try{
            const c = await axios.get('http://localhost:8000/communities/')
            const lf = await axios.get('http://localhost:8000/linkflairs/')
            setCommunities(c.data)
            setLinkFlairs(lf.data)
            console.log("Successfully fetched new post page data")
            }
            catch(err)
            {
                console.error("Loading New Post Page data error: ", err)
            }
        }
    useEffect(() =>
        {
            fetchData()
        } , [props.view])



    // state variables, load user input
    const [community, set_Community] = useState("");
    const [postTitle,set_Post_Title] = useState("");
    const [linkFlair, set_Link_Flair] = useState("N/A");
    const [postTextbox, set_Post_Textbox] = useState("");
    const [linkFlairTextbox, set_Link_Flair_Textbox] = useState(""); // Only loaded when user chooses to create new linkflair

    function validate_input()
    {

        // maintain track of errors, provide accurate feedback
        const err = [];

        //check input variables, stored as state
        if(community === "")
        {
            err.push("choose a community");
        }

        if(linkFlair === "create") // optional, needs input if choose to create
            {
                const linkFlairTextbox = document.getElementById("linkflair-input").value;
                if(linkFlairTextbox === "")
                {
                    err.push("enter name for new linkflair");
                }
            }
        if(postTitle === "")
            {
                err.push("enter the post's title"); // NO HYPERLINKS ADDED; NEED TO DO
            }
        if(postTextbox === "")
        {
            err.push("enter the post's content"); // NO HYPERLINKS ADDED; NEED TO DO
        }
        else 
        {
        const verifyHl =verifyHyperlinks(postTextbox); //authenticate hyperlinks
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
            //upload post and return user to home page
            update_data();            

        }
    }

    async function update_data()
    {
        // await fetchData(); //are the communities and linkflairs up to date? likely not
        try
        {
            const currentP = await axios.get(`http://localhost:8000/posts/${postID}`);
            const ps = await axios.get('http://localhost:8000/posts/');
            const c = await axios.get('http://localhost:8000/communities/')
            const lf = await axios.get('http://localhost:8000/linkflairs/')
            const u = await axios.get('http://localhost:8000/users/username/'+ currentUser.id);
            
            const old_post = currentP.data;
            const posts = ps.data;
            const communities = c.data;
            const linkFlairs=  lf.data;
            const user = u.data;
            

            async function push_data(post)
            {
                const cmnty = communities.find((com) => com._id === community) //object of community user chose
                const oldCommunity = communities.find((com) =>  //find the old community that the previous post belonged to
                {
                    const c =  com.postIDs.find((post) => post === postID);
                    if (c !== undefined)
                    {
                        return c;
                    }
                    else {return undefined}
                })
                console.log("POOOOSSSTTT", post);
                console.log("Communitttyyy", cmnty);
                
                try
                {
                    const newPost = (await axios.post('http://localhost:8000/posts/update/editpost', {post: post})).data;
                    console.log("NEW POST");
                    console.log(newPost.success);
                    console.log(newPost.post);
                    //find if the same community is used, update both old and new community if no
                    if(cmnty.postIDs.find((pID) => pID === postID)) //COMMON ERROR, ensure both postIDs are accurate
                    {
                    }
                    else
                    {
                        const previousCommunity = (await axios.post('http://localhost:8000/communities/update/removepost',{postID: postID, communityID: oldCommunity._id})).data
                        const updatedCommunity = (await axios.post('http://localhost:8000/communities/update-community-postIDs/' + cmnty._id, newPost.post)).data
                        console.log(previousCommunity.success);
                        console.log(updatedCommunity.success);
                    }
                }
                catch(err)
                {
                    console.log("updating post error: ", err)
                }

                //post linkflair, if created, first. Then create and post the post, then update the community 
            }
            if(linkFlair === "N/A") // No linkflair
            {
                const post = { 
                postID: postID,
                title: postTitle,
                content: postTextbox,
                postedBy: user, 
                postedDate: old_post.postedDate,
                commentIDs: old_post.commentIDs,
                views: old_post.views,
                voteUp: old_post.voteUp,
                voteDown: old_post.voteDown
                }

                await push_data(post);
            }
            else if (linkFlair === "create") // Creating a new linkflair
            {
                


                // { // link flair 1
                //     linkFlairID: 'lf1',
                //     content: 'The jerkstore called...', 
                // },
                const linkFlairTextbox = document.getElementById("linkflair-input").value;
                const linkFlair =
                {
                    linkFlairID: "lf" + (linkFlairs.length + 1),
                    content: linkFlairTextbox
                }


                // const shallowLinkFlairArr = [...(linkFlairs)]; //FINICKY CODE, relies on recreating shallow instance and adding data
                // shallowLinkFlairArr.push(linkFlair);
                // setLinkFlairs(shallowLinkFlairArr);
                const post = {
                    postID: postID,
                    title: postTitle,
                    content: postTextbox,
                    postedBy: user,
                    postedDate: old_post.postedDate,
                    commentIDs: old_post.commentIDs,
                    views: old_post.views,
                     voteUp: old_post.voteUp,
                    voteDown: old_post.voteDown

                }
                try
                {
                    const linkFlairID = (await axios.post("http://localhost:8000/linkflairs/", linkFlair)).data;
                    post.linkFlairID = linkFlairID.linkflair;
                    await push_data(post);
                }
                catch(err)
                {
                    console.error("Failed to update data in creating new linkflair: ", err);
                }
                
            }
            else // Using an existing linkflair
            {
                try
                {
                    const linkflairReference = (await axios.get("http://localhost:8000/linkflairs/" + linkFlair)).data;
                    console.log("After linkflair reference in edit post page")
                    const post = {
                        postID: postID,
                        title: postTitle,
                        content: postTextbox,
                        linkFlairID: linkflairReference,
                        postedBy: user,
                        postedDate: old_post.postedDate,
                        commentIDs: old_post.commentIDs,
                        views: old_post.views,
                        voteUp: old_post.voteUp,
                        voteDown: old_post.voteDown
                        }
                   await push_data(post);
                }
                catch(err)
                {
                    console.error("Error getting linkflair in new post page: " , err);
                }
            }

            console.log("Returning to profile page from edit post page")
            props.setView("Profile-Page");
            }
            catch(err)
            {
                console.error("Error refreshing data in new post page: ", err);
            }

        

        
    }

    async function delete_post() //delete post request
    {
        try{
            await axios.delete(`http://localhost:8000/posts/${postID}`);  //send request to delete
            console.log("deleted post success");
        }
        catch(err){
            console.log("fail to delete post.",err);
        }
    }

 return (
        <div className="under-main-content-header" id="posts_container">
            <div className="new-post-container">
                <div className="new-post-header-container">
                    <h3 className="new-comment-header"> Edit Post Page</h3>
                    <span className="new-requirement" id="post-requirement">- Required</span>
                </div>
                <div id="community-selection-container">
                    <label htmlFor="community-selection" className="new-requirement">Community: </label>
                    <LoadCommunities communities={communities} set_Community={set_Community} community={community} currentUser={currentUser}/>
                </div>
                <div id="new-post-title-container">
                    <label htmlFor="post-title-input" id="new-post-title-label" className="new-requirement">Post title: </label>
                    <PostTitleTextBox updateText={set_Post_Title} postTitle={postTitle}/>
                </div>
                <div id="linkflair-title-container">
                    <label htmlFor="linkflair-selection">Linkflair title: </label>
                    <LoadLinkFlairs linkFlairs={linkFlairs} set_Link_Flair={set_Link_Flair} linkFlair={linkFlair}/>
                    {linkFlair === "create" && <LoadLinkFlairInput linkFlairTextbox={linkFlairTextbox} set_Link_Flair_Textbox={set_Link_Flair_Textbox}/>}
                </div>
                <div id="new-post-content-container">
                    <label htmlFor="new-post-content" className="new-requirement">Post: </label>
                    <PostContentTextBox updateText={set_Post_Textbox}/>
                </div>
                <span id="new-post-submit-container">
                    <button id="new-post-submit-button" className="button" onClick={validate_input}>Submit Post</button>
                    <button id="delete-button"className="button" onClick={
                        async() => {if (window.confirm("Are you sure you want to delete this post?")=== true)
                            {delete_post()}}}
                        >Delete Post</button>
                </span>
            </div>
        </div>

    
  )



}

function LoadCommunities(props) // props will be used for: communities, set_Community, community
{
    const username = props.currentUser;
    const formatted_Communities = [];
    formatted_Communities.push(<option key={"N/A"} value="N/A">Select a community</option>);

    const communities = userCommunityOrdered(props.communities, username.id) //NEW CODE
    communities.forEach((cmt) => 
    {
        formatted_Communities.push(<option value={cmt._id} key={cmt._id}> {cmt.name}</option>);
    });

    return (<select name="communities" id="communities-selection" value={props.community} onChange={(e)=> props.set_Community(e.target.value)}>
        {formatted_Communities}
    </select>
    )
}

function LoadLinkFlairs(props) // props will be used for: linkFlairs
{
    const formatted_LinkFlairs = [];
    formatted_LinkFlairs.push(<option value="N/A" key="N/A">Select a linkflair</option>);

    props.linkFlairs.forEach((lF) => {
        formatted_LinkFlairs.push(<option value={lF._id}  key={lF._id}>{lF.content} </option>)
    })
    formatted_LinkFlairs.push(<option value="create" key="create">Create a linkflair</option>);
    return( <select name="linkflair-input" id="linkflair-selection"  value={props.linkFlair} onChange= //ISSUE WITH LINKFLAIR, GETTING BY document.getelementbyid()
    {(e) =>
    {
        props.set_Link_Flair(e.target.value)
    }
    
    }>
        {formatted_LinkFlairs}
    </select>

    )
}

function LoadLinkFlairInput(props) // creating new linkflair component
{
    return(<>
    <label id="linkflair-input_label" htmlFor="linkflair-input" className="new-requirement"/>
    <input type="text" id="linkflair-input" value={props.linkFlairTextbox} name="linkflair-input" placeholder="Maximum Of 30 Characters" maxLength={30} onChange={(e)=> props.set_Link_Flair_Textbox(e.target.value)}/>
    </>)
}

function PostTitleTextBox(props)
{

    return (
        <textarea id="post-title-input" name="post-title-input" 
        placeholder="Maximum Of 100 Characters" maxLength={100} value={props.postTitle}
        rows="1" onChange={(e) => props.updateText(e.target.value)}></textarea>
    )
}

function PostContentTextBox(props)
{
    return(
        <textarea id="new-post-content" 
        name="new-post-content" rows="2" 
        onChange={(e)=> props.updateText(e.target.value)}></textarea>
    )
}
