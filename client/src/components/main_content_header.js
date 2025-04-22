import timeConverter from "./time_conversion.mjs";
import { addHyperlinks } from "./hyperlink";

export default function All_Post_Line(props){
    const view = props.view;
    //assume page is the community object
    const page = props.page;
    const xposts = props.xposts;
    const searchTerms = props.searchTerms;
    const setSortType = props.setSortType;

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
                    <div id="community_timestamp">{timeConverter(page.startDate)}</div>
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