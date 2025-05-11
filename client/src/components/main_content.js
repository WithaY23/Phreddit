import NavBar from './navbar.js';
import LoadPage from './load_page.js';
import CreateCommunityPage from './create_community.js';
//import Model from '../models/model.js'
import AllPostLine from './main_content_header.js';
import {useEffect, useState} from 'react';
import PostPage from './post_page.js';
import NewCommentPage from './new_comment_page.js';
import Banner from './banner.js';
import NewPostPage from './new_post_page.js';
import ProfilePage from './profile_page.js';

import WelcomePage from './WelcomePage.js';
import LoginPage from './login_page.js'
import axios from 'axios';
import EditPostPage from './edit_post_page.js';

//const model = new Model();

export default function Main_Content()
{
    // Create unique use-state variable for the model, only re-render necessary parts
    const [communitiesArr,setCommunitiesArr] = useState([]);
    const [linkFlairsArr,setLinkFlairsArr] = useState([]);
    const [postsArr,setPostsArr] = useState([]);
    const [commentsArr,setCommentsArr] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Display the view that is presented and, if applicable, the relevant instance of page
    // Default
    const [view,setView]=  useState("Welcome-Page");
    const [page,setPage] = useState(undefined);
    //for search page: search term
    const [searchTerms, setSearchTerms] = useState("");
    //num posts
    const [xposts, setXposts] = useState("");
    //create a sort type for new old active: default newest
    const [sortType, setSortType] = useState("newest");
    //load before doing anything
    const [loading, setLoading] = useState(true);

    const noBannerPages = ["Welcome-Page", "Login-Page"];

    useEffect(() => {
        axios.get("http://localhost:8000/users/session", { withCredentials: true })
            .then((res) => {
                console.log("Session found:", res.data);
                setCurrentUser(res.data);
                setView("Home-Page");  // or "Profile-Page" if you prefer
            })
            .catch(() => {
                console.log("No session found---");
                setView("Welcome-Page");
            })
            .finally(() => {
                setLoading(false); //finish loading
            });
    }, []);

    useEffect(() => 
    {
        const get_data = async () =>{
            try {
                const comms = await axios.get("http://localhost:8000/communities/");
                const lFs = await axios.get("http://localhost:8000/linkflairs/");
                const posts = await axios.get("http://localhost:8000/posts/");
                const comments = await axios.get("http://localhost:8000/comments/");

                // Update each state variable with the gathered data
                setCommunitiesArr(comms.data); //
                setLinkFlairsArr(lFs.data);
                setPostsArr(posts.data);
                setCommentsArr(comments.data);

            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        get_data();
    }, [view]);
    function display()
    {
        switch (view) 
        {
            case "Home-Page":
                return (<>
                <AllPostLine 
                    view={view} 
                    page={page} 
                    xposts={xposts}
                    searchTerms={searchTerms}
                    sortType={sortType}       
                    setSortType={setSortType}/>
                <LoadPage 
                    view={view} 
                    page={page} 
                    setView={setView}
                    setPage={setPage}
                    communities={communitiesArr} 
                    linkFlairs={linkFlairsArr} 
                    posts={postsArr} 
                    setPostsArr={setPostsArr}
                    comments={commentsArr} 
                    searchTerms={searchTerms}
                    setXposts={setXposts}
                    sortType={sortType}/>
                    {/* finicky code based off of model */}
                </>);
            case "Post-Page":
                console.log("Before Post_Page, postsArr")
                console.log(postsArr)
                 return (
                 <PostPage 
                 changeView={setView} 
                 view={view}
                 page={page} 
                 changePage={setPage} 
                 comments={commentsArr} 
                 communities={communitiesArr} 
                 linkFlairs={linkFlairsArr} 
                 username={currentUser}
                 /> //removed changeComments={setCommentsArr}

                 );
            case "Create-Comment-Page-Post":
            case "Create-Comment-Page-Comment":
                return(
                    <NewCommentPage 
                    view={view} 
                    changeView={setView} /*return to post page*/ 
                    page={page} /*id of parent reply content*/ 
                    changePage={setPage} 
                    posts={postsArr} 
                    changePosts={setPostsArr} 
                    comments={commentsArr} 
                    changeComments={setCommentsArr} 
                    currentUser={currentUser}
                    />
                ); 
            case "Create-Post-Page":
                return <NewPostPage 
                    currentUser={currentUser}
                    setView={setView} 
                    view = {view}
                    communities={communitiesArr} 
                    setCommunities={setCommunitiesArr} 
                    linkFlairs={linkFlairsArr}
                    setLinkFlairs={setLinkFlairsArr} 
                    posts={postsArr} 
                    changePosts={setPostsArr} />
            case "Community-Page":
                return (
                    <>
                        <AllPostLine 
                            view={view} 
                            page={page} 
                            xposts={xposts}
                            searchTerms={searchTerms}
                            sortType={sortType}       
                            setSortType={setSortType}/>
                        <LoadPage 
                            view={view} 
                            page={page} 
                            setView={setView}
                            setPage={setPage}
                            communities={communitiesArr} 
                            linkFlairs={linkFlairsArr} 
                            posts={postsArr} 
                            setPostsArr={setPostsArr}
                            comments={commentsArr} 
                            searchTerms={searchTerms}
                            setXposts={setXposts}
                            sortType={sortType}/>
                    </>
                );
            case "Search-Page":
                return (
                    <>
                        <AllPostLine 
                            view={view} 
                            page={page} 
                            xposts={xposts}
                            searchTerms={searchTerms}
                            sortType={sortType}       
                            setSortType={setSortType}/>
                        <LoadPage 
                            view={view} 
                            page={page} 
                            setView={setView}
                            setPage={setPage}
                            communities={communitiesArr} 
                            linkFlairs={linkFlairsArr} 
                            posts={postsArr} 
                            setPostsArr={setPostsArr}
                            comments={commentsArr} 
                            searchTerms={searchTerms}
                            setXposts={setXposts}
                            sortType={sortType}
                            />
                    </>
                );
            case "Create-Community-Page":
                return(
                    <>
                    <AllPostLine 
                            view={view} 
                            page={page} 
                            xposts={xposts}
                            searchTerms={searchTerms}
                            sortType={sortType}       
                            setSortType={setSortType}
                    />
                    <CreateCommunityPage 
                        communities={communitiesArr}
                        setCommunities={setCommunitiesArr}
                        setView={setView}
                        setPage={setPage}
                    />
                    </>
                );
            case "Welcome-Page":
                return (
                    <WelcomePage view={view} setView={setView} />
                )
            case "Login-Page":
                return(
                    <LoginPage view={view} setView={setView} setCurrentUser={setCurrentUser}/>
                )
            case "Profile-Page":
                return(
                    <ProfilePage view={view} setView={setView} setPage={setPage} currentUser={currentUser}/>
                )
            case "Edit-Post-Page":
                return(
                    <EditPostPage view={view} setView={setView} page={page} currentUser={currentUser} />
                )
            default:
                alert("AHHHHH");
                console.log("AHHHHHHHHHH");
                break;
        }
    }

    if(loading){
        return (
            <div>loading...</div>
        )
    }

    return (
        <>
            {!noBannerPages.includes(view) && (
                <>
                    <Banner view={view} setView={setView} setSearchTerms={setSearchTerms} currentUser={currentUser} 
                        setCurrentUser={setCurrentUser}/>
                    <div className="below-header">
                        <NavBar view={view} page={page} communities={communitiesArr} setView={setView} setPage={setPage} currentUser={currentUser}/>
                        <div className="main-content">
                            {display()}
                        </div>
                    </div>
                </>
            )}
            {noBannerPages.includes(view) && (
                <div className="main-content">
                    {display()}
                </div>
            )}
        </>
        )
}
    
