import { useNavigate } from "react-router-dom";

import './viewPage.css';
import Search from "./Search";
import { useEffect, useState } from "react";

const BackEnd_Post_Search_Url='http://127.0.0.1:3000/posts/search/'

function ViewList(props){
    let navigate = useNavigate();

    const [sugList, setSugList] = useState([]);
    useEffect(()=>{
        // console.log('ViewPage useEffect...')
        props.refreshPostsList();
    })

    function fillSugList(query){
        if(query.length===0){
            console.log('empty query')
          setSugList([]) 
          return ;
        }
        // else console.log('-->',query)
        fetch(BackEnd_Post_Search_Url,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({query:query})
        }).then(response=>response.json()).then((data)=>{

            console.log('elasticsearch results: ',data)

            setSugList((value)=>{
                console.log('setSugList -> ',value,data)
                return [...data]
                // return [...value,...data]
            })
        })
        let match_items = props.postsList.filter((postItem)=>{
          let regex = new RegExp(query,"i");
          return regex.test(postItem['title'])
        })
    
        let newSugList = match_items.map((item)=>{
          return {
            title:item['title'], 
            id:item['postId']
          }
        })
    
        // setSugList(newSugList);
    
      }


    function listItemClickHandler(e){
        // console.log('--clicked',e.currentTarget.id);
        let id = e.currentTarget.id.split('-')[2]
        navigate('/posts/detail/'+id);
    }
    
    let listContents = props.postsList.map((item,i)=>{
        // console.log(item)
        return  <div className="postItem"  key={i} id={'postItem-'+item['postId']}>
                    <div className="done-check" style={{width:'1cm',height:'1.5cm',display:'inline-block',transform:'translateY(-60%)'}}>
                        <input type='checkbox' style={{transform:'translateX(120%)'}}/>
                    </div>
                    <div className="postItem-content" id={'postItem-content-'+item['postId']} onClick={listItemClickHandler}> 
                        <div className="postItem-title"> 
                            {item['title']} 
                        </div>
                        <div className="postItem-meta">
                            Added by <b>{'who else, but you'}</b>, last modified <b>{item['date_last_edited']}</b>.
                        </div>
                    </div>
                </div>
                //</li>
    })

    
    let add_button = <div className="add-wrapper">
            <span className="circle" htmlFor="toogle" onClick={()=>navigate('/new_post')}>
                <img src="https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/2x/btw_ic_speeddial_white_24dp_2x.png" alt="" />
            </span>
        </div>

    return <>
        <div className="search-cont">
            <Search fillSugList={fillSugList} sugList={sugList} />
        </div>
        <div className='postListCont'>
            <div className="post-header">
                {add_button}
                <h1 style={{
                    display:'inline-block',
                    marginLeft:'0.4cm',
                    // height:'100%',
                    // width:'max-content',
                    transform: 'translateY(-50%)'
                }}>
                    My Posts:
                </h1>
            </div>

            <div className="post-body">
                    { listContents.length > 0 && 
                            listContents
                    }
                    { listContents.length == 0 && 
                        <li>'No items in the list..'</li>
                    }
            </div>
            
            
        </div>
    </>
}

export default ViewList;