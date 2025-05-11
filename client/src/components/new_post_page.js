import { useState, useEffect} from "react";
import today_date from "./today_date.mjs";
import '../stylesheets/new_post_page.css';
import { verifyHyperlinks } from "./hyperlink";
import {userCommunityOrdered} from './time_conversion.mjs';

// props will be used for: view, setView, communities, setCommunities, linkFlairs, setLinkFlairs, posts, changePosts
import axios from "axios";
export default function New_Post_Page(props)
{

    //model variables
    const [communities, setCommunities] = useState([]);
    // const [posts, setPosts] = useState([]); Not used by react components, only JS logic
    const [linkFlairs, setLinkFlairs] = useState([]);
    const [loading, setLoading] = useState(true);


    const currentUser = props.currentUser;
    
    const fetchData = async () =>
        {
            try{
            const c = await axios.get('http://localhost:8000/communities/')
            // const p = await axios.get('http://localhost:8000/posts/')
            const lf = await axios.get('http://localhost:8000/linkflairs/')
            setCommunities(c.data)
            // setPosts(p.data)
            setLinkFlairs(lf.data)
            console.log("Successfully fetched new post page data")
            setLoading(false);
            }
            catch(err)
            {
                console.error("Loading New Post Page data error: ", err)
            }
        }
    useEffect(() =>
        {
            fetchData()
        } , [props.view]) //PUT VIEW INSIDE HERE



    // state variables, load user input
    const [community, set_Community] = useState("");
    const [postTitle,set_Post_Title] = useState("");
    const [linkFlair, set_Link_Flair] = useState("N/A");
    const [postTextbox, set_Post_Textbox] = useState("");
    // const [usernameTextbox, set_Username_Textbox] = useState("");
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
        // if(usernameTextbox === "")
        // {
        //     err.push("enter a username");
        // }        
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
            const p = await axios.get('http://localhost:8000/posts/');
            const c = await axios.get('http://localhost:8000/communities/')
            const lf = await axios.get('http://localhost:8000/linkflairs/')
            console.log(currentUser);
            const u = await axios.get('http://localhost:8000/users/username/'+ currentUser.id);
            
            const posts = p.data;
            const communities = c.data;
            const linkFlairs=  lf.data;
            const user = u.data;
            

            async function push_data(post)
            {
                const cmnty = communities.find((com) => com._id === community)
                console.log("POOOOSSSTTT", post);
                console.log("Communitttyyy", cmnty);
            
                try
                {
                    const newPost = await axios.post('http://localhost:8000/posts/', post);
                    console.log("NEW POST");
                    console.log(newPost.data.success);
                    console.log(newPost.data.post);
                    const updatedCommunity = await axios.post('http://localhost:8000/communities/update-community-postIDs/' + cmnty._id, newPost.data.post)
                    console.log( updatedCommunity.data.success);
                }
                catch(err)
                {
                    console.log("posting post error: ", err)
                }

                //post linkflair, if created, first. Then create and post the post, then update the community 
            }
            if(linkFlair === "N/A") // No linkflair
            {
                const post = { 
                postID: "p" + (posts.length + 1),
                title: postTitle,
                content: postTextbox,
                postedBy: user, 
                postedDate: today_date(),
                commentIDs: [],
                views: 0
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
                const post = 
                {
                    postID: "p" + (posts.length + 1),
                    title: postTitle,
                    content: postTextbox,
                    // linkFlairID: "lf" + (linkFlairs.length + 1),
                    postedBy: user,
                    postedDate: today_date(),
                    commentIDs: [],
                    views: 0
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
                    const post = {
                        postID: "p" + (posts.length + 1),
                        title: postTitle,
                        content: postTextbox,
                        linkFlairID: linkflairReference,
                        postedBy: user,
                        postedDate: today_date(),
                        commentIDs: [],
                        views: 0
                        }
                   await push_data(post);
                }
                catch(err)
                {
                    console.error("Error getting linkflair in new post page: " , err);
                }
            }

            console.log("Returning to home page from new post page")
            props.setView("Home-Page");
            }
            catch(err)
            {
                console.error("Error refreshing data in new post page: ", err);
            }

        

        
    }
/*
<NewPostPage 
setView={setView} 
communities={communitiesArr} 
setCommunities={setCommunitiesArr} 
linkFlairs={linkFlairsArr}
setLinkFlairs={setLinkFlairsArr} 
posts={postsArr} 
changePosts={setPostsArr} />

Needed (get): communities, linkFlairs, posts
(post): communities, linkFlairs, posts
*/
 return (
    loading ? <p>Loading</p> :(
        <div className="under-main-content-header" id="posts_container">
            <div className="new-post-container">
                <div className="new-post-header-container">
                    <h3 className="new-comment-header"> Create Post Page</h3>
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
                    {/* <span id="new-post-username-container">
                        <label htmlFor="new-post-username" className="new-requirement">Username: </label>
                        <UsernameTextbox updateText={set_Username_Textbox} />
                    </span> */}
                    <button id="new-post-submit-button" className="button" onClick={validate_input}>Submit Post</button>
                </span>
            </div>
        </div>)

    
  )



}

function LoadCommunities(props) // props will be used for: communities, set_Community, community
{
    const username = props.currentUser;
    const formatted_Communities = [];
    formatted_Communities.push(<option key={"N/A"} value="N/A">Select a community</option>);

    const communities = userCommunityOrdered(props.communities, username.id)//NEW CODE
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
// function UsernameTextbox(props)
// {
//     return(
//         <input type="text" id="new-post-username" 
//         name="new-post-username" 
//         onChange={(e)=> props.updateText(e.target.value)}/>
//     )
// }