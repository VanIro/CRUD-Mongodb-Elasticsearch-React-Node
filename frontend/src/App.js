import './App.css';



import {useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ViewList from './ViewPage';
import PostDetail from './PostDetail'


const Url_getAll = 'http://127.0.0.1:3000/posts/'

function App() {
  const[posts, setPosts] = useState([]);
  useEffect(()=>{
    let dummy_data = [
      {postId:'1',title:'Dummy Post',description:'A dummy post is a dummy post because it is a dummy post. Theres nothing wrong with a dummy post in this day and age. Deal with me. Heard me dummy?? ',date:'2080-1-1'}
    ]
    setPosts(dummy_data)
  },[])

  function refreshPostsList(){
    fetch(Url_getAll,{
      method:"GET",
      // mode:"cors",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(response=>response.json())
    .then(data=>{
      setPosts(data);
    })
  }

  return (
      <Routes>
        <Route exact element={<ViewList postsList={posts} refreshPostsList={refreshPostsList}/>} path="/" />
        <Route exact element={<PostDetail new_item={false}/>} path="/posts/detail/:id" />
        <Route exact element={<PostDetail new_item={true}/>} path="/new_post" />
        {/* <Route exact Component={Login} path="/login" /> */}
      </Routes>
  );
}

export default App;
