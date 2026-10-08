import React, { useEffect, useState } from "react";
import Inputs from "./Inputs";
import axios from "axios";

const Pending = () => {
  const API = "https://todoapp-backend-4yfx.onrender.com";

  const [todoPending, setTodoPending] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");

  const [attachmentsBg, setAttachmentsBg] = useState(null);
  const [attachmentId, setAttachmentId] = useState(null);



  const getTodos = () => {
    axios
      .get(`${API}/todos/today`)
      .then((result) => {
        setTodoPending(result.data.todos);
        window.dispatchEvent(new Event("todoUpdated"));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const finishTodos = (id) => {
    axios
      .put(`${API}/todos/${id}/complete`)
      .then((result) => {
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
        error.response?.data?.message || error.message
      );
    });
};
  const deleteImage =(id)=> {

    axios
      .delete(`${API}/delete-image/${id}`)
      .then((result)=>{
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
        alert(error.response.data.message + "" + error.response.data.code)
      });
  }


  useEffect(() => {
    getTodos();
    const savedBg = localStorage.getItem("bg");
    setAttachmentsBg(JSON.parse(savedBg))
  }, []);

  return (
    <div>
      <Inputs onTodoAdded={getTodos} />

      <div className="todo-list-wrapper">
        {todoPending.length > 0 ? (
          todoPending.map((todo, index) => {
            return (
              <div key={index} className="todo-wrapper">
                <div className="todo">{todo.todo}</div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <button onClick={() => finishTodos(todo.id)}>
                    <i
                      className="fas fa-arrow-right"
                      style={{ textShadow: "1px 1px 0 #383838" }}
                    ></i>
                    <span>Finish</span>
                  </button>
                  <button
                    onClick={() => {
                      setAttachmentId(
                        attachmentId === todo.id ? null : todo.id,
                      );
                    }}
                  >
                    <i
                      className="fas fa-paperclip"
                    ></i>
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
          <div>No data has to be passed today</div>
        )}
      </div>
    </div>
  );
};

export default Pending;
