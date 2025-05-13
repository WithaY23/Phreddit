import {useState, useEffect} from "react";
import timeConverter from "./time_conversion.mjs";
import { addHyperlinks } from "./hyperlink";
import axios from "axios";

export default function LoadPage(props){ 
    const view = props.view;
    const page = props.page;
    const setView = props.setView;
    const setPage = props.setPage;
    //const communities = props.communities;
    //const linkFlairs = props.linkFlairs;
    //const posts = props.posts;
    //const setPostsArr= props.setPostsArr;
    //const comments = props.comments;
    const searchTerms = props.searchTerms;
    const setXposts = props.setXposts;
    const sortType = props.sortType;
    const currentUser = props.currentUser;

    //returning siblings with a wrapper
    return(
        <> 
            <PostList 
                view={view} 
                page={page} 
                setView={setView}
                setPage={setPage}
                searchTerms={searchTerms} 
                setXposts={setXposts} 
                sortType={sortType}
                currentUser={currentUser}/>
        </>
    )
}

function PostList(props){
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);

    const view = props.view;
    const setView = props.setView;
    const page = props.page;
    const setPage = props.setPage;
    const setXposts = props.setXposts;
    const sortType = props.sortType;
    const currentUser = props.currentUser;

    //get membercount if it is on community page
    const memberCount = (view === "Community-Page" && page) ? page.memberCount : null;

    const search_terms_string = props.searchTerms.toLowerCase();
    //setPosts can update posts
    const [All_posts, setAllPosts] = useState([]);

    useEffect(() => {
        async function fetchData(){
            try{
                const [p, c, cm, lf] = await Promise.all([
                    axios.get("http://localhost:8000/posts"),
                    axios.get("http://localhost:8000/comments"),
                    axios.get("http://localhost:8000/communities"),
                    axios.get("http://localhost:8000/linkflairs"),
                ]);

                setPosts(p.data);
                setComments(c.data);
                setCommunities(cm.data);
                setLinkFlairs(lf.data);
            } 
            catch(err){
                setView("Error-Page") //ERROR ADDED
                setPage(err);
            }
        }
        fetchData();
    }, [view, page, search_terms_string, sortType]);

    //side effects| runs after component renders, [model] allows re-run when model changes
    useEffect(() => {
        //build post
        function create_post(post){
            const posted_date = new Date(post.postedDate).getTime();
            const active_date = find_earliest_comment_date(post._id, posts, comments,);

            //get community name | username | timestamp
            const community = communities.find(c => c.postIDs.includes(post._id)); 
            if (!community) {
                console.warn("Post ID not found in any community:", post._id);
            }
            const communityName = community ? community.name : "Unknown";
            const username = post.postedBy.displayName;
            //const timestamp = timeConverter(post.postedDate);
            const post_title = post.title;
            const content = post.content.substring(0, 80) + "...";
            const viewcount = post.views;
            const commentcount = getTotalCommentCount(post.commentIDs, comments);
            const linkflairObj = linkFlairs.find(flair => flair._id === post.linkFlairID);
            const linkflair = linkflairObj ? linkflairObj.content : null;
        
            return {
                postID: post._id,
                community: communityName,
                username,
                post_title,
                content,
                viewcount,
                commentcount,
                linkflair,
                postedDate: posted_date,
                activeDate: active_date,
                voteCount: post.voteCount,
            };
        }

        function separateAndSortPosts(posts, communities, currentUser, sortType, comments){
            const userCommunityIDs = new Set();

            console.log("separateAndSortPosts called");
            console.log("total posts passed in:", posts.length);
            console.log("currentUser:", currentUser?.displayName || "null");

            if(currentUser && currentUser.id){  //safety check both exists
                communities.forEach(c => {      //find the communties of user
                    const isMember = c.members?.some(m => m?._id === currentUser.id);
                    if(isMember){
                        userCommunityIDs.add(c._id.toString());
                    }
                });
                console.log(" user is in communities:", [...userCommunityIDs]);
            }

            const postsInUserCommunities = [];
            const postsNotInUserCommunities = [];

            for(const post of posts){
                const community = communities.find(c => c.postIDs.some(p => (p._id || p) === post._id));
                const postObj = create_post(post);
                if(community && userCommunityIDs.has(community._id.toString())){
                    postsInUserCommunities.push(postObj);
                } 
                else{
                    postsNotInUserCommunities.push(postObj);
                }
            }

            console.log("Posts in user communities:", postsInUserCommunities.length);
            console.log("Posts not in user communities:", postsNotInUserCommunities.length);

            const sortPosts = (arr) => {   //sorting functionality like before
                if (sortType === "newest") return arr.sort((a, b) => b.postedDate - a.postedDate);
                if (sortType === "oldest") return arr.sort((a, b) => a.postedDate - b.postedDate);
                if (sortType === "active") return arr.sort((a, b) => b.activeDate - a.activeDate || b.postedDate - a.postedDate);
                return arr;
            };

            if(!currentUser || !currentUser.id){
                return sortPosts(posts.map(create_post));
            }

            const sortedIn = sortPosts(postsInUserCommunities);
            const sortedOut = sortPosts(postsNotInUserCommunities);

            //only show divider if there are posts in both groups
            if(sortedIn.length > 0 && sortedOut.length > 0){
                return [...sortedIn, { isDivider: true }, ...sortedOut];
            } 
            else{
                return [...sortedIn, ...sortedOut];
            }
        }
        
        let new_posts = []; //array of posts
        
        if(view === "Home-Page"){
            //load all the posts
            new_posts = separateAndSortPosts(posts, communities, currentUser, sortType, comments);
        }
        else if(view === "Community-Page"){
            //create a filter that shows posts only within the community
            posts.forEach(post => {
                const postID = post._id;
                //only add post if it is in that community
                if(page.postIDs.some(p => (p._id || p) === postID)){
                    new_posts.push(create_post(post));
                }
            });
        }
        else if(view === "Search-Page"){
            const search_terms = search_terms_string.split(" ");
            const matchedPosts = [];

            //collect matching posts based on title/content/comments
            posts.forEach(post => {
                const title = post.title.toLowerCase();
                const content = post.content.toLowerCase();

                const found_in_post = search_terms.some(term => title.includes(term) || content.includes(term));
                const found_in_comments = post.commentIDs.some(commentID =>
                    check_comment_and_replies(commentID, search_terms, comments)
                );

                if (found_in_post || found_in_comments) {
                    matchedPosts.push(post);
                }
            });

            //pass matchedPosts into the same sorting & grouping logic
            new_posts = separateAndSortPosts(matchedPosts, communities, currentUser, sortType, comments);
        }
        else{
            setAllPosts([]);
        }
        //take care of sort type here
        if(sortType === "newest"){
            new_posts.sort((a,b) => b.postedDate - a.postedDate);
        }
        else if(sortType === "oldest"){
            new_posts.sort((a,b) => a.postedDate - b.postedDate);
        }
        else if(sortType === "active"){
            new_posts.sort((a,b) => {
                if(b.activeDate !== a.activeDate){
                    return b.activeDate - a.activeDate;
                }
                else{
                    return b.postedDate - a.postedDate;
                }
            });
        }

        setAllPosts(new_posts);
        setXposts(new_posts.length);
        
        
    }, [view, page, communities, linkFlairs, posts, comments, search_terms_string, sortType, setXposts]);

    

    return( 
        //all posts will go under posts_container, <> make a single element
        <>
            <div className="main-content-header" id="x-posts">
                {view !== "Community-Page" ? (
                    <span>{All_posts.length} posts</span>
                ) : (
                    <span>{All_posts.length} posts |  {memberCount} members </span>
                )}
            </div>
            <div className="under-main-content-header" id="posts_container">
                {All_posts.map((post, index) => {
                if(post.isDivider){ //creates a divider
                    return (
                        <div key={`divider-${index}`} className="post-divider">
                            <hr />
                            <div className="divider-label">Posts from other communities</div>
                            <hr />
                        </div>
                    );
                }

            return (
                <div className="post" key={post.postID} onClick={async () => {
                    try {
                        const ps = (await axios.post("http://127.0.0.1:8000/posts/update-posts-views/" + post.postID)).data;
                        props.setView("Post-Page");
                        props.setPage(ps);
                    } catch (err) {
                        setView("Error-Page");
                        setPage(err);
                    }
                }}>
                    <div id="post-1st-line">
                        {post.community} | {post.username} | {timeConverter(post.postedDate)}
                    </div>
                    <div id="post-title-line">{post.post_title}</div>
                    <div id="post-linkflair-line">
                        {post.linkflair ? `[${post.linkflair}]` : ""}
                    </div>
                    <div id="post-content-line">
                        {addHyperlinks(post.content)}
                    </div>
                    <div id="post-viewcount-line">
                        Views: {post.viewcount} | Comments: {post.commentcount} | Likes: {post.voteCount}
                    </div>
                </div>
            );
        })}
            </div>
        </>
    )
}

export function getTotalCommentCount(commentIDs, commentArray){
    //works at the moment, but need to test against more complicated cases
    let count = 0;
    commentIDs.forEach(commentID => {
        //for each comment, find
        const comment = commentArray.find(c => c._id === commentID); //c.commentID => c._id
        if(!comment) return;

        count += 1; //direct comments
        count += getTotalCommentCount(comment.commentIDs, commentArray);
    });
    return count;
}

function check_comment_and_replies(commentID, search_terms, comments){
    const comment = comments.find(c => c._id === commentID);
    if(!comment) return false;

    if(search_terms.some(term => comment.content.toLowerCase().includes(term))){
        return true;
    }
    //call recursivly
    return comment.commentIDs.some(replyID => check_comment_and_replies(replyID, search_terms, comments));
}

function find_earliest_comment_date(postID, posts, comments){
    //find the posts with post ID inside model
    const found_post = posts.find(p => p._id === postID);
    
    let most_recent_date = new Date(found_post.postedDate).getTime();
  
    found_post.commentIDs.forEach(commentID => {
      //function to check recursively for each comment
      const commentDate = get_most_recent_comment_date(commentID, comments);
      if(commentDate > most_recent_date){
        most_recent_date = commentDate;
      }
    });
    return most_recent_date;
}
  
function get_most_recent_comment_date(commentID, comments){
    //get comment
    const comment = comments.find(c => c._id === commentID);
    if(!comment){
        return 0;
    }
  
    let most_recent_date = new Date(comment.commentedDate).getTime();
    //check for all child replies
    comment.commentIDs.forEach(replyID => {
      const replyDate = get_most_recent_comment_date(replyID, comments);
      if(replyDate > most_recent_date){
        most_recent_date = replyDate;
      }
    });
    return most_recent_date;
}

