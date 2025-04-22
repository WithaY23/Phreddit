
// Display community section of navbar, involving create community button and community list
//props --> .view, .page
//view will contain the type of page that the user is on (create community, post page, home page, etc.)
//page will contain the specific instance of a page the user is on, if applicable (community 5's page view)

import {useState, useEffect} from 'react';
import axios from 'axios';
import '../stylesheets/navbar.css';
function HomeButtonContainer(props)
{
  const view = props.view;
  const setView = props.setView;

  function HomeButton()
  {
    return view === "Home-Page" ? 
      
        <div className = "button button-home-container">
        <button id="button-home" className="button-home unstyled-button" style={{backgroundColor:"#FF4500"}}
          onClick={() => setView("Home-Page")}>Home</button>
        </div>
      :
      <div className = "button button-home-container">
        <button id="button-home" className="button-home unstyled-button"
           onClick={() => setView("Home-Page")}>Home</button>
      </div>

  }
  
  return(

    <div className = "black-line-bottom">
      <HomeButton />
    </div>
  )
}
function Communities(props) 
{
  const view = props.view;
  const page = props.page ? props.page : "";
  const userID=  props.userID;
  const setView = props.setView;
  const setPage = props.setPage;

  function CreateCommunityButton() // Make a phreddit color when selected
  {
    return (userID ?
    
    
    ((view === "Create-Community-Page") ? 
    <button className= "button" id ="button-create-community"  //logged-in user is on create community page
    style={{backgroundColor: "#FF4500"}}>Create Community</button>
    :

    <button className= "button" id ="button-create-community"  //logged-in user is not on create community page
      onClick={() => {
        setView("Create-Community-Page")
      }
    }>Create Community</button> )
    : 

    <button className= "button" id ="button-create-community" style={{backgroundColor:'gray'}} //user is not logged in
    >Create Community</button>)
  }

  function CommmunityList(props)
  {
    const communities = [];

    const userCreatedCommunities= []// axios get request to a "userID: created communities" route that returns all the communities the user has created, use as a reference when ordering communities
    //Sort by user's most recent join date
    props.communities.toSorted((cmty1, cmty2) =>
    {
      if(userCreatedCommunities.includes(cmty1))
      {
        if(userCreatedCommunities.includes(cmty2))
        {
          return new Date(cmty2.startDate) - new Date(cmty1.startDate)
        }
        else
        {
          return -1;
        }
      }
      else if(userCreatedCommunities.includes(cmty2))
      {
        return 1;
      }
      else
      {
        return new Date(cmty2.startDate) - new Date(cmty1.startDate)
      }
    }
    )
    props.communities.forEach(community => 
      {
        //pass a reference to each community
        communities.push(
          <Community 
            key={community._id}
            view= {view} 
            page={page} 
            id={community._id} 
            content={community.name}
            setView={setView} 
            setPage={setPage} 
            community={community}
          />)
      })
    return(
      <ul id="community-list">
        {communities}
      </ul>
        
    )

  }
    return(
       
    <div id= "community-section">
      <p id="community-text">Communities</p>
          <CreateCommunityButton />
        <div className="display-communities">
          <CommmunityList view={view} page={page} setView={setView} setPage={setPage} communities={props.communities}/>
        </div>
    </div>
    )
}
function Community(props) //format of each community, display phreddit color if on its page
{
      return (props.view === "Community-Page" && props.page._id === props.id) ?(
        <li key={props.id}>
          <button className='unstyled-button'
            style={{backgroundColor: "#FF4500"}}
            onClick={() => {
              console.log("community-page: " + props.community.name);
              props.setView("Community-Page");
              //set community as the Page so it can be accessed
              props.setPage(props.community);
            }}>
            {props.content}
          </button>
        </li>
      )
      :
      (<li key={props.id}>
          <button className='unstyled-button'
            style={{color: "blue", textDecoration: "underline"}}
            onClick={async () => {
              try{
                const res = await axios.get(`http://127.0.0.1:8000/community/${props.id}`);
                const updatedCommunity = res.data;
                props.setView("Community-Page");
                props.setPage(updatedCommunity); //use fresh version with most recent postIDs
              } 
              catch (err){
                console.error("Failed to fetch updated community", err);
              }
            }}>
            {props.content}
          </button>
      </li>)
}
export default function NavBar(props)
{
  const view = props.view;
  const page = props.page ? props.page : "";
  const [communities, setCommunities] = useState([]);

  // NEW CODE
  const userID = props.userID ? props.userID : "";


  useEffect(() =>
    {
      axios.get('http://127.0.0.1:8000/communities/').then((res) =>
        {
          setCommunities(res.data)
        }).catch((err) =>{
          console.log("Error in navbar communities: ", err)
        })
  }, [view])
  


  const setView = props.setView;
  const setPage = props.setPage;

    return(
    <div className="nav-sidebar">
      <HomeButtonContainer view={view} setView={setView}/>  
      <Communities 
        view={view} 
        page={page} 
        communities={communities}
        setView={setView}
        setPage={setPage}
      /> {/* Pass down the view through props into communities*/}
    </div>

    )
}
