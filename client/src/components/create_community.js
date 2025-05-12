import {useState} from "react";
import {verifyHyperlinks} from "./hyperlink";
import axios from "axios";

export default function Create_Community(props){
    const setCommunities = props.setCommunities;
    const setView = props.setView;
    const setPage = props.setPage;
    const currentUser = props.currentUser;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [nameError, setNameError] = useState("");
    const [descError, setDescError] = useState("");
   
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

        //alert("Create Community Successed!");
        return valid;
    }

    function engender_community(){
        if(!check_valid()) return;
        //is valid, create a community
        
        axios.get("http://localhost:8000/communities")
            .then(res =>{
                const latest_communities = res.data;
                setCommunities(latest_communities); //update front end with newest data fetched before adding 

                const new_community = {
                    //communityID: "community" + (communities.length + 1),
                    name: name.trim(),
                    description: description.trim(),
                    postIDs: [],
                    startDate: new Date(),
                    members: [currentUser.id],
                    createdBy: currentUser.id
                };

                return axios.post("http://localhost:8000/communities", new_community);
            })
            .then(res => {       //wait for the response
                setCommunities(prev => [...prev, res.data]); //update frontend with newest data including the newest community added
                setView("Home-Page");})
            .catch(err => {
                setView("Error-Page") //ERROR ADDED
                setPage(err);
            });
    }

    return (
        <div className="under-main-content-header" id="posts_container">
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
    
            <button className="button" id="engender_community_btn" onClick={engender_community}>Engender Community</button>
      </div>
    );
}