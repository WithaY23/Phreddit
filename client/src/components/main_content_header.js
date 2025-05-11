import timeConverter from "./time_conversion.mjs";
import { addHyperlinks } from "./hyperlink";
import axios from "axios";

export default function All_Post_Line(props){
    const view = props.view;
    //assume page is the community object
    const page = props.page;
    const xposts = props.xposts;
    const searchTerms = props.searchTerms;
    const setSortType = props.setSortType;
    const currentUser = props.currentUser;

    function isMember() {
        if (!currentUser || !page || !page.members) return false;
        return page.members.some(member => (member._id || member) === currentUser.id);
    }
    async function join_community(communityID) {
        try{
            await axios.put(`http://localhost:8000/communities/${communityID}/join`, {
                userID: currentUser.id,
            });
            window.location.reload(); //refreshes the view
        } 
        catch(err){
            console.error("Failed to join community:", err);
            alert("Could not join community.");
        }
    }
    async function leave_community(communityID){
        try{
            await axios.put(`http://localhost:8000/communities/${communityID}/leave`, {
                userID: currentUser.id,
            });
            window.location.reload(); //refreshes the view
        } 
        catch(err){
            console.error("Failed to leave community:", err);
            alert("Could not leave community.");
        }
    }

    if(page !== undefined){
        console.log("Page:", page, "| View:", view);
    }

    // const timestamp = page.startDate ? today_date(page.startDate) : "Unknown Date"; // Prevent error

    if(view === "Home-Page"){
        return(
            <div className="main-content-header" id="all-posts">
                <span id="all-posts-text">All Posts</span>
                <div className="sort-btns">
                    <button className="sort-by-time-btn" onClick={() => setSortType("newest")} id="newest_btn">Newest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("oldest")} id="oldest_btn">Oldest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("active")} id="active_btn">Active</button>
                </div>
            </div>
        );
    }
    if(view === "Community-Page"){
        return(
            <div className="main-content-header" id="all-posts">
                <span id="all-posts-text">
                    <div>{page.name}</div>
                    <div id="community_description">{addHyperlinks(page.description)}</div>
                    <span id="community_timestamp">{timeConverter(page.startDate)} | {page.createdBy?.displayName ?? "Unknown"}
                    {currentUser && (
                        isMember() ? (
                            <button className="join-btn" onClick={() => leave_community(page._id)}>Leave</button>
                        ) : (
                            <button className="join-btn" onClick={() => join_community(page._id)}>Join</button>
                        )
                    )}
                    </span>
                </span>
                <div className="sort-btns">
                    <button className="sort-by-time-btn" onClick={() => setSortType("newest")} id="newest_btn">Newest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("oldest")} id="oldest_btn">Oldest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("active")} id="active_btn">Active</button>
                </div>
            </div>
        );
    }
    if(view === "Create-Community-Page"){
        return(
            <div className="main-content-header" id="all-posts">
                <span id="all-posts-text">Create Community</span>
            </div>
        );
    }
    if(view === "Edit-Community-Page"){
        return(
            <div className="main-content-header" id="all-posts">
                <span id="all-posts-text">Edit Community</span>
            </div>
        );
    }
    if(view === "Search-Page"){
        return(
            <div className="main-content-header" id="all-posts">
                {xposts > 0 ? (
                     <span id="all-posts-text">Results for: "{searchTerms}"</span>
                ) : (
                    <span id="all-posts-text">No results found for: "{searchTerms}"</span>
                )}
                <div className="sort-btns">
                    <button className="sort-by-time-btn" onClick={() => setSortType("newest")} id="newest_btn">Newest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("oldest")} id="oldest_btn">Oldest</button>
                    <button className="sort-by-time-btn" onClick={() => setSortType("active")} id="active_btn">Active</button>
                </div>
            </div>
        );
    }
    else{
        return(
            <div className="main-content-header" id="all-posts">
                
            </div>
        );
    }
}

