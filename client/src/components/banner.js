import '../stylesheets/banner.css'
import { useState } from 'react';
import axios from 'axios';

export default function Banner(props){
    const currentUser = props.currentUser;
    const setCurrentUser = props.setCurrentUser;
    const view = props.view;
    const setView = props.setView;
    const setPage = props.setPage;
    const setSearchTerms = props.setSearchTerms;

    //hold local input
    const [input, setInput] = useState("");

    //handle what happen when use types onto the search box
    function handle_input(e){
        //if enter is pressed, setView to search and setSearchTerm to text
        if(e.key === "Enter"){
            //if input is not empty
            if(input.trim() !== ""){
                setSearchTerms(input.trim());
                setView("Search-Page");  
            }

        }
    }
    if(view === "Create-Post-Page"){
        return(
            <div id="header" className="header">
                <button id="phreddit" className="unstyled-button header_text" onClick={() => setView("Home-Page")}>phreddit</button>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="text" 
                            id="search_box" 
                            placeholder="Search Phreddit..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handle_input}/>
                    </form>

                {currentUser && (
                <>
                    <button id="button-profile" className="profile_btn" onClick={() => setView("Profile-Page")}>
                        Profile
                    </button>
                    <button id="button-logout" className="profile_btn" 
                        onClick={async () => {
                            try{//request to end session
                                const res = await axios.post("http://localhost:8000/users/logout", {}, {withCredentials:true}); //{} no data to send
                                console.log(res.data.success);
                                setCurrentUser(null);  //clear user
                                setView("Welcome-Page");
                            }
                            catch(error){
                                console.error("error logout", error);
                                setView("Error-Page") //ERROR ADDED
                                setPage(error);
                            }
                        }}>
                        Logout
                    </button>
                </>
                )}

                <button id="button-create-post" className="create_post_btn" style={{backgroundColor:"#FF4500"}} onClick={()=> 
                        {
                            setView("Create-Post-Page");
                        }
                        }>Create Post</button>
            </div>
        );
    }
    else{
        return(
        <div id="header" className="header">
            <button id="phreddit" className="header_text unstyled-button" 
            onClick={() => {
                if(currentUser){
                    setView("Home-Page");
                }
                else{
                    setView("Welcome-Page");
                }
                
            }}>phreddit</button>
            
            <form onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="text" 
                    id="search_box" 
                    placeholder="Search Phreddit..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handle_input}/>
            </form>

            {currentUser ? (
            <>
                <button id="button-profile" className="profile_btn" onClick={() => setView("Profile-Page")}>
                    Profile
                </button>
                <button id="button-logout" className="profile_btn" 
                    onClick={async () => {
                        try{//request to end session
                            const res = await axios.post("http://localhost:8000/users/logout", {}, {withCredentials:true}); //{} no data to send
                            console.log(res.data.success);
                            setCurrentUser(null);  //clear user
                            setView("Welcome-Page");
                        }
                        catch(error){
                            console.error("error logout", error);
                            setView("Error-Page") //ERROR ADDED
                            setPage(error);
                        }
                    }}>
                    Logout
                </button>
            </>
            ): (
                <button id="button-profile" className="profile_btn" style={{backgroundColor: 'gray'}}>
                    Profile
                </button>

            )
        }

            <button id="button-create-post" className="create_post_btn" onClick={()=> 
                    {
                        setView("Create-Post-Page");
                    }
                    }>Create Post</button>
        </div>
        );
    }
};
