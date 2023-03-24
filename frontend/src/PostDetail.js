import { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

import './PostDetail.css'


const Backend_Post_Detail_Url = 'http://127.0.0.1:3000/posts/postById/';
const Backend_Post_Add_Url = 'http://127.0.0.1:3000/posts/add_post/';
const Backend_Post_Edit_Url = 'http://127.0.0.1:3000/posts/edit_post';
const Backend_Post_Delete_Url = 'http://127.0.0.1:3000/posts/delete_post';

export default function PostDetail(props){
    let params = useParams();

    const [editMode, setEditMode] = useState(false);
    const [detailItem, setDetailItem] = useState({});
    
    let navigate = useNavigate();

    useEffect(()=>{
        if(props.new_item){
            setEditMode(true);
        }
        else{
            let dummy_data={postId:'1',title:'Dummy Post',description:'A dummy post is a dummy post because it is a dummy post. Theres nothing wrong with a dummy post in this day and age. Deal with me. Heard me dummy?? ',date:'2080-1-1'}
            setDetailItem(dummy_data)
            setDesc(dummy_data['description'])
            setTitle(dummy_data['title'])
            fetch(Backend_Post_Detail_Url+`${params.id}`,{
                method:'GET'
            }).then(response=>response.json())
            .then(data=>{
                console.log('received detail : ',data)
                setDetailItem(data)
                setDesc(data['description'])
                setTitle(data['title'])
            })
        }

    },[])

    const [desc,setDesc] = useState('');
    const [title,setTitle] = useState('');
    
    function descChangeHandler(e){
        if(editMode){
            setDesc(e.target.value);
        }
    }
    function titleChangeHandler(e){
        if(editMode){
            setTitle(e.target.value);
        }
    }

    function submitHandler(e){
        console.log('Submit clicked!')
        if(props.new_item){
            fetch(Backend_Post_Add_Url,{
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body:JSON.stringify({title:title,detail:desc})
            }).then(response=>{
                // console.log( response.json());
                return response.json()
            
            })
            .then((response)=>{
                console.log('response: ',response.data)
                navigate('/');
            })
        }
        else{
            fetch(Backend_Post_Edit_Url,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({postId:detailItem["postId"],title:title,detail:desc})
            })
            .then((response)=>{
                if(response.status===202){
                    navigate('/');
                }
                else{
                    console.log(response)
                }
            })
        }
    }
    function deleteHandler(e){
        console.log('Delete clicked!')
        if(!props.new_item){
            fetch(Backend_Post_Delete_Url,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({postId:detailItem["postId"],title:title,detail:desc})
            }).then((response)=>{
                if(response.status==202){
                    console.log("Success! Deleted post..")
                    navigate('/')
                }
                console.log(response.status)
            })
        }
    }

    function cancelHandler(e){
        setDesc(detailItem['detail']);
        setTitle(detailItem['title']);
        if(props.new_item){
            navigate('/');
        }
        setEditMode(false);
    }
    
    let edit_button = <button onClick={()=>setEditMode((val)=>!val)}>Edit</button>
    let submit_button = <button onClick={(e)=>submitHandler(e)}>Submit</button>
    let delete_button = <button 
            className={"post-item-delete"+( (!editMode || props.new_item)?" hide":"" )} 
            onClick={(e)=>deleteHandler(e)}
        >Delete</button>
    let cancel_button = <button onClick={(e)=>cancelHandler(e)}>Cancel</button>
    
    return (

        <div className="detailForm-wrap">
            <h2>{props.new_item?'New Post':'Post Detail'}</h2>
      
            <div className="form">
                {/* {editMode && !props.new_item && <> */}
                    {delete_button}
                {/* </>} */}
                <textarea 
                    className="post-title" 
                    id="title" 
                    type="text" 
                    placeholder="Title"  
                    value={title}
                    name="em" 
                    onChange={(e)=>titleChangeHandler(e)}
                />
                <textarea 
                    className="post-desc" 
                    value={desc} onChange={(e)=>descChangeHandler(e)}
                >
                </textarea>
                {!editMode && edit_button}
                {editMode && <>
                    {submit_button}
                    {cancel_button}
                </>}
                <a href="#"> <p> Work hard play fine. </p></a>
            </div>
        </div>
    );
}
