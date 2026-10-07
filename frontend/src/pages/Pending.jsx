import React, { useEffect, useState } from 'react'
import Inputs from './Inputs'
import axios from 'axios'

const Pending = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todoPending, setTodoPending] = useState([])

  const [selectedImage, setSelectedImage] = useState('')

  const [imgId, setImgId] = useState('')

  const [imageForm, setImageForm] = useState(false)

  const today = Date.now()


  const getTodos = () => {
    
    axios
      .get(`${API}/todos/today`)
      .then(result => {
        setTodoPending(result.data.todos)
        window.dispatchEvent(new Event('todoUpdated'))
      })
      .catch(error => {
        console.log(error)
      })
  }


  const finishTodos = (id) => {

    axios
      .put(`${API}/todos/${id}/complete`)
      .then(result => {
        getTodos()
      })
      .catch(error => {
        console.log(error)
      })

  }

  const imageHandler =(id)=> {
    const formData = new FormData();

    formData.append("image", selectedImage);

    console.log(selectedImage);
    

    axios
    .put(`${API}/upload-image/${id}`,formData)
      .then((result) => {
      console.log(result.data.message)

      setSelectedImage(null)
      setImgId(null)
      setImageForm(false)

      getTodos()
    })
      .catch((error) => {
      console.log("UPLOAD ERROR:", error)
      console.log(
        "SERVER MESSAGE:",
        error.response?.data?.message || error.message
      )
    })
    
  }




  useEffect(() => {
    getTodos()
  }, [])


  return (
    <div>
      <Inputs onTodoAdded={getTodos} />

      <div className='todo-list-wrapper'>
        {
          todoPending.length > 0 ? (
            todoPending.map((todo, index) => {
              return <div key={index} className='todo-wrapper'>
                <div className='todo'>{todo.todo}</div>
                <div>
                  <button
                    onClick={() => finishTodos(todo.id)}
                  >
                    <i className='fas fa-arrow-right'></i>
                    <span>Finish</span>
                  </button>
                  <button
                    onClick={()=>{
                      setImgId(todo.id)
                      setImageForm(true)
                    }}
                  >
                    <i className='fas fa-paperclip'></i>
                  </button>
                </div>
              </div>
            })
          ) : (
            <div>No data has to be passed today</div>
          )
        }

      </div>
      {
      imageForm && (
        <div className='imageForm'> 
        <input 
          type="file" 
          accept="image/*"
          onChange={(e)=>setSelectedImage(e.target.files[0])}
        />
        
        <div>
          <button 
          type='button'
          onClick={()=>{
            imageHandler(imgId)
            
          }}
        >Add</button>

        <button 
          type='button'
          onClick={()=>{
            setImageForm(false)
          }}
        >close</button>
        </div>
      </div>
      )
    }

    </div>
  )

}

export default Pending
