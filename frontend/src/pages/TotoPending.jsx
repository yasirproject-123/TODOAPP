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

  const deleteTodo = (id) => {
    axios
      .delete(`${API}/deleteTodo/${id}`)
      .then((result) => {
        // alert(result.data.message)
        getTodos();
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
      <div className="dailyForm">
        <h3 className="input">Up Comings </h3>
      </div>

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
                  <button onClick={() => deleteTodo(todo.id)} style={{color:"red", background:'#f8eded', borderColor:"#fac1c1"}}>
                    <i className="fas fa-trash" style={{color:"red"}}></i>
                    <span>Delete</span>
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
                  <div 
                    className="attachments"
                  
                  >
                    <div>
                      <label className="image-upload">
                        <i className="fas fa-folder-open" style={{color:'#0084ff'}}></i>
                        <p>{!selectedImage ? 'Select image': selectedImage.name
                        }</p>

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
                      {todo.image_url ?(
                        <img
                          src={todo.image_url}
                          alt="attachment"
                        />
                      ):
                        <label className="image-upload">
                            <i className="fas fa-image" style={{color:'#0084ff'}}></i>
                        <p style={{fontFamily:'calibri'}}>No image</p>
                        </label>
                      }
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
