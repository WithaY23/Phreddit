[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2tEDYwzN)
# Term Project

Add design docs in *images/*

## Instructions to setup and run project
```
set up server:
cd server
npm install express
npm install mongoose
npm install cors
npm install bcryptjs
npm install express

set up client:
cd client
npm install react
npm install react-scripts
npm install axios

Start MongoDB:
mongosh

To start the server run:
cd server
node server.js

To start the React app run:
cd client
npm start

To initialize data run:
node init.js mongodb://127.0.0.1:27017/phreddit yourEmail yourDisplayName yourPassword
To reset data run:
node init.js mongodb://127.0.0.1:27017/phreddit yourEmail yourDisplayName yourPassword -reset
```

Setup tests:
navigate to project-s25...

npm install --save-dev jest

npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

npm install --save-dev jest supertest

## Yucan Contribution
<yucan>
-Banner  
-Home page
-Community Page
-Search Page
-New community Page
-Register page, Community edit page, Profile Page
-Posts, User schema
-Deletion functionality
-Class /Sequence Diagram

## Ayden Contribution
<ayden>
- Timestamps  
- The Nav Bar  
- The Post Page view  
- The New Post Page view  
- The New Comment Page view 
-Communities, Comments, Linkflair schema
-Communities, Linkflairs constraints
-general server update requests
-Hashing
-Comment, Community, linkflair schema
-Sample data in init.js
-State diagram
