import React, { useEffect, useState } from "react";
import axios from "axios";

const TotoPending = () => {
  const API = "https://todoapp-backend-4yfx.onrender.com";
  // const API = "http://localhost:3000"

  const [todos, setTodos] = useState([]);
  const [attachmentId, setAttachmentId] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  const today = new Date();

  const getTodos = () => {
    axios
      .get(`${API}/todos`, { withCredentials: true })
      .then((result) => {
        setTodos(result.data.todos);
        window.dispatchEvent(new Event("todoUpdated"));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //UPDATE SECTION

  const [editingMode, setEditingMode] = useState(false)

  const [updatingTodo, setUpdatingTodo] = useState({
    todoId:"",
    todo:"",
    specialDate:""
  })

  const getUpdateTodo = (todoId, todo, specialDate) => {

    setEditingMode(true)

    setUpdatingTodo({
      todoId:todoId,
      todo:todo,
      specialDate:specialDate
    })
    
  }

  const updateTodo = (e) => {
    e.preventDefault()

    const todoId = updatingTodo.todoId
    const todo = updatingTodo.todo;
    const specialDate = updatingTodo.specialDate
    
    axios
      .put(`${API}/update-todo/${todoId}`, {todo, specialDate})
      .then((result)=>{
        setUpdatingTodo({
          todoId:"",
          todo:"",
          specialDate:""
        })
        setEditingMode(false)
        getTodos();
      })
      .catch((error)=>{
        
        console.log(error.response?.data?.message || error.message);
      })

    
  }


  //IMAGE SECTION

  const imageHandler = (id) => {
    if (!selectedImage) {
      return alert("Select a File");
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    axios
      .put(`${API}/upload-image/${id}`, formData)
      .then((result) => {
        console.log(result.data.message);

        setSelectedImage("");
        getTodos();
      })
      .catch((error) => {
        console.log("UPLOAD ERROR:", error);
        console.log(
          "SERVER MESSAGE:",
          error.response?.data?.message || error.message,
        );
      });
  };

  const deleteImage = (id) => {
    axios
      .delete(`${API}/delete-image/${id}`)
      .then((result) => {
        console.log(result.data.message);
        alert(result.data.message);

        getTodos();
      })
      .catch((error) => {
        // console.log("UPLOAD ERROR:", error);
        // console.log(
        //   "SERVER MESSAGE:",
        //   error.response?.data?.message || error.message,
        // );
        alert(error.response.data.message + "" + error.response.data.code);
      });
  };

  useEffect(() => {
    getTodos();
  }, []);

  const pendinTodos = todos.filter((todo) => todo.status === "pending");
  // const filteredTodos = todoPending.filter((todo) => {
  //     const dueDate = new Date(todo.specialDate);

  //     const daysLeft = Math.ceil(
  //         (dueDate - today) / (1000 * 60 * 60 * 24)
  //     );

  //     return daysLeft <= 0 && todo.status === 'pending';
  // });

  return (
    <div>
      <form onSubmit={updateTodo} className="dailyForm">
        
        {editingMode ? (
          
            <div className="input">

            <input
              type="text"
              placeholder="Todo"
              required
              value={updatingTodo.todo}
              onChange={(e) => {setUpdatingTodo({...updatingTodo, todo:e.target.value})}}
              />
            <input
              type="date"
              title="Date"
              required
              value={updatingTodo.specialDate}
              onChange={(e) => {setUpdatingTodo({...updatingTodo,specialDate:e.target.value})}}
              />
            </div>
            
              
          ):<h3 className="input">Up Comings </h3>
          
        }
        {
          editingMode && (
            <button type="submit">Update</button>
          )
        }
      </form>

      <div className="todo-list-wrapper">
        {pendinTodos.length > 0 ? (
          pendinTodos.map((todo, index) => {
            return (
              <div key={index} className="todo-wrapper">
                <div className="todo">
                  <div>{todo.todo}</div>
                  <p>{`Due on : ${todo.specialDate}`}</p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      getUpdateTodo(todo.id, todo.todo, todo.specialDate);
                      
                    }}
                    style={{
                      color: "#ff026b",
                      background: "#faebf1",
                      borderColor: "#fcbdd7",
                    }}
                  >
                    <i className="fas fa-edit" style={{ color: "#ff026b" }}></i>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setAttachmentId(
                        attachmentId === todo.id ? null : todo.id,
                      );
                    }}
                  >
                    <i className="fas fa-paperclip"></i>
                  </button>
                </div>
                {attachmentId === todo.id && (
                  <div className="attachments">
                    <div>
                      <label className="image-upload">
                        <i
                          className="fas fa-folder-open"
                          style={{ color: "#0084ff" }}
                        ></i>
                        <p>
                          {!selectedImage ? "Select image" : selectedImage.name}
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setSelectedImage(e.target.files[0]);
                          }}
                        />
                      </label>
                      <button onClick={() => imageHandler(todo.id)}>Add</button>
                    </div>

                    <div>
                      {todo.image_url ? (
                        <img src={todo.image_url} alt="attachment" />
                      ) : (
                        <label className="image-upload">
                          <i
                            className="fas fa-image"
                            style={{ color: "#0084ff" }}
                          ></i>
                          <p style={{ fontFamily: "calibri" }}>No image</p>
                        </label>
                      )}
                      <button
                        onClick={() => {
                          deleteImage(todo.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div>No Pending Data Found</div>
        )}
      </div>
    </div>
  );
};

export default TotoPending;
