import {useState, useEffect} from "react";
import {verifyHyperlinks} from "./hyperlink";
import axios from "axios";

export default function EditCommunity(props){
    // const setCommunities = props.setCommunities;
    const setView = props.setView;
    const setPage = props.setPage;
    const communityID = props.page;  //community id
    // const currentUser = props.currentUser;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [nameError, setNameError] = useState("");
    const [descError, setDescError] = useState("");

    useEffect(() => {
        async function fetchCommunity(){
            try{
                const res = await axios.get(`/community/${communityID}`);
                setName(res.data.name);
                setDescription(res.data.description);
            }
            catch(err){
                console.error("Failed to load community info", err);
            }
        }
        fetchCommunity();
    }, [communityID]);
   
    //make sure input is valid when clicking the engender community button
    function check_valid(){
        let valid = true;
        //alert(`start checking!`);

        //check name
        if(name.trim() === ""){
            setNameError("Community name is required.");
            valid = false;
        }
        else if(name.length > 100){
            setNameError("Community name cannot exceed 100 characters.");
            valid = false;
        }
        //no error
        else{
            setNameError("");
        }

        //check description
        if(description.trim() === ""){
            setDescError("Community description is required.");
            valid = false;
        }
        else if(description.length > 500){
            setDescError("Community description cannot exceed 500 characters.");
            valid = false;
        }
        else{
            const result = verifyHyperlinks(description);
            if (!result.flag) {
                setDescError(result.message);
                valid = false;
            } else {
                setDescError("");
            }
        }
        return valid;
    }

    async function fix_community(){
        if (!check_valid()) return;
        try{
            await axios.put(`/communities/${communityID}`,{
                name: name.trim(),
                description: description.trim()
            });
    
            alert("Community updated successfully.");
            setView("Profile-Page");  // Go back to profile or wherever you want
        } 
        catch(err){
            setView("Error-Page") //ERROR ADDED
            setPage(err);
        }
    }

    async function delete_community(){
        try{
            await axios.delete(`/communities/${communityID}`);
            alert("Community deleted successfully.");
            setView("Profile-Page");  //after this, ProfilePage will fetch fresh data
        } 
        catch(err){
            setView("Error-Page") //ERROR ADDED
            setPage(err);
        }
    }

    return (
        <div className="under-main-content-header" id="posts_container">
            <h1>Edit Community</h1>
            <label htmlFor="new_community_name">
                Community Name:
                {name === "" && <span className="redstar">*</span>}
            </label>
            <br/>
            <textarea 
                id="new_community_name" 
                placeholder="Enter Community Name (Max 100 Characters)"
                value={name}
                onChange={(input) => setName(input.target.value)}
            />
            <div className="error_msg">{nameError}</div>
            <br/>
            <br/>
    
            <label htmlFor="new_community_description">
                Community Description:
                {description === "" && <span className="redstar">*</span>}
            </label>
            <br/>
            <textarea 
                id="new_community_description" 
                placeholder="Enter Community Description (Max 500 Characters)"
                value={description}
                onChange={(input) => setDescription(input.target.value)}
            />
            <div className="error_msg">{descError}</div>
            <br/>
            <br/>
    
            <button className="button" id="engender_community_btn" onClick={fix_community}>Fix Community</button>
            <button className="delete-btn" 
                    onClick={async () => {
                        const confirm = window.confirm("are you sure you want to delete this community")
                        if(confirm){
                            await delete_community();
                        }
                    }}>Delete
            </button>
      </div>
    );
}