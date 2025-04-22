// Content is text, return object with two attributes, flag and message
    // Flag indicates if all hyperlinks are formatted correctly
    // Message provides an error message, if any errors. Empty string if not
import React from 'react';
export function verifyHyperlinks(content) 
{
const regex = /\[.*?\]\(.*?\)/g;
const errorMessages = [
    {
        flag: false,
        message:"all hyperlinks' names must contain content"
    }
    ,
    {
        flag: false,
        message: "all hyperlinks' links must contain content"
    } ,
    {
        flag: false,
        message:  "all hyperlinks' links must contain a 'https://' or 'http://' link"
    }]

const arrMatch = content.match(regex);
//no pattern found
if(!arrMatch){
    return { 
      flag: true,       
      message: [] 
    };
  }

arrMatch.forEach((match) =>
  {
    const splitArr = match.split("]");
    const nameC = splitArr[0];
    const linkC = splitArr[1];

    const name = nameC.slice(1);
    const link = linkC.slice(1,linkC.length-1);
    console.log("match", match)
    console.log("name", name)
    console.log("link", link)
    if(name.length === 0)
    {
        errorMessages[0].flag = true;
    }
    if(link.length === 0)
    {
        errorMessages[1].flag = true;
    }
    else if(link.substring(0,8) !== ('https://') &&  link.substring(0,7) !== ('http://'))
    {
        errorMessages[2].flag = true;
    }
  })

  let errorM = []
  errorMessages.forEach((e) =>{
    if(e.flag){
        errorM.push(e.message)}})
  return {flag: errorM.length === 0, message:errorM}
}



// Content is text expected to turn any formatted hyperlinks, if present, to anchor tags
export function addHyperlinks(content) {
    const regex = /\[(.*?)\]\((.*?)\)/g; // Use capturing groups
    const parts = [];
    let lastIndex = 0;


    for (const match of content.matchAll(regex)) 
    {
        const fullMatch = match[0]; // The entire string match
        const name = match[1]; // The name of the hyperlink
        const href = match[2]; // The URL of the hyperlink


        const matchIndex = match.index; // Determine if there is content before a link that isn't a link

        // Add the text before matching
        if (lastIndex < matchIndex) 
        {
            parts.push(content.substring(lastIndex, matchIndex));
        }

        // Link conversion
        parts.push(
            <a key={matchIndex} href={href} target="_blank" rel="noreferrer">
                {name}
            </a>
        );

        // Update the last index
        lastIndex = matchIndex + fullMatch.length;
    }

    // Add any leftover content
    if (lastIndex < content.length) 
    {
        parts.push(content.substring(lastIndex));
    }

    return <>{parts}</>;
}

/*TESTS
works expectedly
let match1 = "[hyperLink1](https://ahhhhh)[hyperlink2](http://bbbbbb)"
let result1 = verifyHyperlinks(match1);
if (!result1.flag)
{
  console.log(result1.message);
}
let matchErr1 = "[hyperLink1](htt://ahhhh)      [](https://bbbb)"
let resultErr1 = verifyHyperlinks(matchErr1);
console.log("Error checking");
if(!resultErr1.flag)
{
  console.log(resultErr1.message);
}
  */
