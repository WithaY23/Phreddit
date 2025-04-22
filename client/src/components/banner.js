import '../stylesheets/banner.css'
import { useState } from 'react';

export default function Banner(props){
    const view = props.view;
    const setView = props.setView;
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
            <button id="phreddit" className="header_text unstyled-button" onClick={() => setView("Home-Page")}>phreddit</button>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="text" 
                        id="search_box" 
                        placeholder="Search Phreddit..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handle_input}/>
                </form>
            <button id="button-create-post" className="create_post_btn" onClick={()=> 
                    {
                        setView("Create-Post-Page");
                    }
                    }>Create Post</button>
        </div>
        );
    }
};
