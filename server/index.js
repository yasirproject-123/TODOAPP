import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://todoapp-hazel-gamma.vercel.app"
    ],
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/todos", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT *
            FROM todolist
        `);

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
    const [rows] = await db.query(`
            SELECT *
            FROM todolist
            WHERE
                (
                    type = 'daily'
                    AND specialDate <= CURDATE()
                    AND status = 'pending'
                )
                OR
                (
                    type = 'monthly'
                    AND (
                        specialDate <= CURDATE()
                        
                    )
                )
        `);
        

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
    const { todo, type, specialDate } = req.body;

    if (specialDate !== null) {
      
      await db.query(
        `INSERT INTO todolist (todo, type, specialDate) VALUES (?, ?,?)`,
        [todo, type, specialDate],
      );
    }else{
      await db.query(
        `INSERT INTO todolist (todo, type) VALUES (?, ?)`,
        [todo, type],
      );
    }


    res.json({
      message: "New To To added",
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running at http://localhost:${PORT}`);
});
