import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import db from "./db.js";
import multer from "multer";
import cloudinary from "./cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://todoapp-hazel-gamma.vercel.app",
      
    ],
    credentials: true
  }),
);
app.use(express.json());


app.get("/auth/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      authenticated: true,
      user: decoded,
    });
  } catch (error) {
    return res.status(401).json({
      authenticated: false,
    });
  }
});

app.post("/new-user", async(req, res) => {
  try {

    const {email, password} = req.body

    const [rows] = await db.query(`
      SELECT * FROM users WHERE email = ?
    `,[email])

    if (rows.length > 0) {
      return res.status(409).json({
        message:"User already registered"
      })
    }

  const hashPassword = await bcrypt.hash(password, 10)

    await db.query(`
      INSERT INTO users
      (email, password)
      VALUES(?, ?)  
    `,
    [email, hashPassword]
  )

  res.status(200).json({
    message:"user registered successfully",

  })
    
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message:'internal error',
      error:error
    })
  }
})

app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    // Find the user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = rows[0];

    // Verify the password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create the JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 1000
    // });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
})

app.get("/todos", async (req, res) => {

  try {
    // 1. Get the JWT from the cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Verify token and retrieve user information
    let user;

    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Get the logged-in user's ID
    const user_id = user.id;

    const [rows] = await db.query(`
            SELECT *
            FROM todolist
            WHERE user_id = ?
        `,[user_id]);

    res.json({
      success: true,
      todos: rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get todos",
    });
  }
});

app.get("/todos/today", async (req, res) => {
  try {
    // 1. Get the JWT from the cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Verify token and retrieve user information
    let user;

    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Get the logged-in user's ID
    const user_id = user.id;

    const [rows] = await db.query(`
            SELECT *
            FROM todolist
            WHERE user_id = ?
                AND(
                (
                    type = 'daily'
                    AND specialDate <= CURDATE()
                    AND status = 'pending'
                    
                )
                OR
                (
                    type = 'monthly'
                    AND specialDate <= CURDATE()
                    )
                  )
        `,[user_id]);
        

    res.json({
      success: true,
      todos: rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get today's todos",
    });
  }
});

app.post("/newTodo", async (req, res) => {
  try {

    // 1. Get the JWT from the cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Verify token and retrieve user information
    let user;

    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Get the logged-in user's ID
    const user_id = user.id;

    const { todo, type, specialDate } = req.body;

      
      await db.query(
        `INSERT INTO todolist (todo, type, specialDate, user_id) VALUES (?, ?, ? ,?)`,
        [todo, type, specialDate, user_id],
      );


    res.json({
      message: "New Todo added",
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

app.put("/todos/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
            SELECT type, specialDate
            FROM todolist
            WHERE id = ?
            `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const todoType = rows[0].type;
    const specialDate = rows[0].specialDate;
    
    if (todoType ==='daily') {
      await db.query(
        `
                UPDATE todolist
                SET status = 'done'
                WHERE id = ?
                `,
        [id],
      );
    } else if (todoType === 'monthly') {

      await db.query(
        `
                UPDATE todolist
                SET specialDate = DATE_ADD(specialDate, INTERVAL 1 MONTH),
                lastCompleted = ?
                WHERE id = ?
                `,
        [specialDate, id],
      );
    }

    res.json({
      success: true,
      message: "Todo completed",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to complete todo",
    });
  }
});

app.put("/retreive-todo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
            SELECT type
            FROM todolist
            WHERE id = ?
            `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const todoType = rows[0].type;

    if (todoType === "daily") {
      await db.query(
        `
                UPDATE todolist
                SET status = 'pending'
                WHERE id = ?
                `,
        [id],
      );
    } else if (todoType === 'monthly') {
      await db.query(
        `
                UPDATE todolist
                SET lastCompleted = null
                WHERE id = ?
                `,
        [id],
      );
    }

    res.json({
      success: true,
      message: "Todo Retreived",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to Retreive todo",
    });
  }
});

app.delete("/deleteTodo/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query("DELETE FROM todolist WHERE id = ?", [id]);

    res.json({
      message: "Todo list has been deleted",
    });
  } catch (error) {
    res.json({
      message: error,
    });
  }
});

//image uploader

const upload = multer({
  storage: multer.memoryStorage(),
});

app.put("/upload-image/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No image selected",
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "todo-images",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    // Get Cloudinary URL
    const imageUrl = result.secure_url;

    // Save ONLY the image URL to the existing todo
    await db.query(
      "UPDATE todolist SET image_url = ? WHERE id = ?",
      [imageUrl, id]
    );

    res.json({
      message: "Image uploaded successfully",
      image_url: imageUrl,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
});

app.delete("/delete-image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get image URL from database
    const [rows] = await db.query(
      "SELECT image_url FROM todolist WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    const imageUrl = rows[0].image_url;

    if (!imageUrl) {
      return res.status(404).json({
        message: "No image attached to this todo",
        code:"404"
      });
    }

    // Extract Cloudinary public_id
    const urlParts = imageUrl.split("/");

    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) {
      return res.status(400).json({
        message: "Invalid Cloudinary URL",
      });
    }

    // Everything after /upload/vXXXXXXXX/
    let publicIdParts = urlParts.slice(uploadIndex + 2);

    // Remove file extension
    let publicId = publicIdParts.join("/");

    publicId = publicId.substring(
      0,
      publicId.lastIndexOf(".")
    );

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log("Cloudinary delete:", result);

    // Remove URL from MySQL
    await db.query(
      "UPDATE todolist SET image_url = NULL WHERE id = ?",
      [id]
    );

    res.json({
      message: "Image deleted successfully",
    });

  } catch (error) {
    console.error("IMAGE DELETE ERROR:", error);

    res.status(500).json({
      message: "Image deletion failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running at http://localhost:${PORT}`);
});
