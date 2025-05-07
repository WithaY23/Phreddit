import axios from "axios";

export default function timeConverter(original_Date)
{
   
  let original_time = new Date(original_Date).getTime();
  let timeValue = Date.now()- original_time; //get the time difference in ms

  //switch to output string date
  //conversions:
  //1000ms -> s
  //60000ms -> m
  //3600000ms -> h
  //86400000ms -> d
  //2628000000ms -> month
  //31540000000ms -> year

  function timeOutput(inputTime,incrementTime, interval) //return a formatted string based on a boolean comparison
  {
    let timeSpent = Math.floor(inputTime / incrementTime); //convert to respective time value
    return timeSpent == 1 ? `${timeSpent} ${interval} ago` : `${timeSpent} ${interval}s ago` //use ternary to display s
  }
  switch(true)
  {

    case timeValue < 60000: //same minute
    return timeOutput(timeValue,1000,'second') 
      
      break;
    case timeValue <3600000: //same hour
      return timeOutput(timeValue,60000,'minute') 
      break;
    
    case timeValue <86400000: //same day
      return timeOutput(timeValue,3600000,'hour') 
      break;

    case timeValue <2628000000: //same month
      return timeOutput(timeValue,86400000,'day') 
      break;

    case timeValue < 31540000000:
      return timeOutput(timeValue,2628000000,'month') 
      break;

    default: //a year or more, UNCLEAR, HAS LESS THAN AND GREATER THAN A YEAR BUT NOT INCLUDING
      return timeOutput(timeValue,31540000000,'year') 
  
  }

  
}

export async function userCommunityOrdered(communities = "",user)
{
  if (communities = "")
  {
    communities = (await axios.get("http://localhost:8000/communities/")).data //get communities
  }


  // const userJoinedCommunities = []

  
  //check user communities against actual communities, return list with user communities upfront
  const orderedCommunities = communities.toSorted((cmty1, cmty2) =>
    {
      if(cmty1.members.contains(user)) //need to rework database to populate members
      {
        if(cmty2.members.contains(user))
        {
          return new Date(cmty2.startDate) - new Date(cmty1.startDate)
        }
        else
        {
          return -1;
        }
      }
      else if(cmty2.members.contains(user))
      {
        return 1;
      }
      else
      {
        return new Date(cmty2.startDate) - new Date(cmty1.startDate)
      }
    })
  return orderedCommunities
}