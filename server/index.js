import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import db from "./db.js";
import multer from "multer";
import cloudinary from "./cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import crypto from "crypto";
import {Resend} from 'resend'

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://todoapp-hazel-gamma.vercel.app"],
    credentials: true,
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

//REGISTER

app.post("/new-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      `
      SELECT * FROM users WHERE email = ?
    `,
      [email],
    );

    if (rows.length > 0) {
      return res.status(409).json({
        message: "User already registered",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users
      (email, password)
      VALUES(?, ?)  
    `,
      [email, hashPassword],
    );

    res.status(200).json({
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "internal error",
      error: error,
    });
  }
});

//LOGIN

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Create the JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 2 * 24 * 60 * 60 * 1000
    // });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

//LOGOUT

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
});

//RESET PASSWORD

app.post("/reset-password", async (req, res) => {
  try {
    const token = req.cookies?.token;
    const { oldPassword, confirmNewPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    const userId = decoded.id;
    const email = decoded.email;

    const [rows] = await db.query(
      "SELECT * FROM users where id = ? && email = ?",
      [userId, email],
    );

    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "old password is incorrect",
      });
    }

    if (oldPassword === confirmNewPassword) {
      return res.status(400).json({
        message: "Try new password from old one",
      });
    }

    if (isMatch) {
      const hashPassword = await bcrypt.hash(confirmNewPassword, 10);
      await db.query(
        "UPDATE users SET password = ? WHERE id = ? && email = ?",
        [hashPassword, userId, email],
      );

      return res.status(200).json({
        message: "Password Changed",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
});

/* FORGOT PASSWORD - SEND RESET EMAIL */

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send-reset-link", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1. Find the user
    const [users] = await db.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );

    // Avoid revealing whether an account exists
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists, a reset link will be sent.",
      });
    }

    const user = users[0];

    // 2. Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Hash the token before saving it
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. Set token expiry to 15 minutes
    await db.query(
      `UPDATE users
       SET reset_token = ?,
           reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
       WHERE id = ?`,
      [tokenHash, user.id]
    );

    // 5. Build the reset link
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const resetLink =
      `${frontendUrl}/home/forgot-password?token=${resetToken}`;

    // 6. Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: "Todo App <noreplay@todo.app.com>",
      to: [user.email],
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
          <h2>Password Reset</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to choose a new password.</p>

          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 22px;
                    background: #2563eb; color: white;
                    text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>

          <p>This link expires in 15 minutes.</p>
          <p>If you did not request a password reset, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);

      // Clear the token if email delivery was rejected
      await db.query(
        `UPDATE users
         SET reset_token = NULL,
             reset_token_expiry = NULL
         WHERE id = ? AND reset_token = ?`,
        [user.id, tokenHash]
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send the reset email. Please try again.",
      });
    }

    console.log("Reset email accepted by Resend:", data?.id);

    return res.status(200).json({
      success: true,
      message: "If an account exists, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Send reset link error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

//reset-forgot-password

app.post("/forgot-password", async (req, res) => {
  try {
    const { newPassword, confirmPassword, resetToken } = req.body;

    console.log(resetToken);

    // 1. Validate inputs
    if (!newPassword || !confirmPassword || !resetToken) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // 2. Check whether passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 3. Find the user using the reset token
    // Hash the token received from the reset link
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Search using the hashed token and check expiry
    const [rows] = await db.query(
      `SELECT id, email, password
   FROM users
   WHERE reset_token = ?
   AND reset_token_expiry > NOW()`,
      [tokenHash],
    );

    console.log(rows);

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const user = rows[0];

    // 4. Check whether the new password is the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "Please choose a password different from your old one",
      });
    }

    // 5. Hash the new password
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update password and clear the reset token
    await db.query(
      `UPDATE users
   SET password = ?,
       reset_token = NULL,
       reset_token_expiry = NULL
   WHERE id = ?
   AND reset_token = ?
   AND reset_token_expiry > NOW()`,
      [hashPassword, user.id, tokenHash],
    );

    return res.status(200).json({
      message: "Password changed successfully. Please log in.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Something went wrong while resetting your password",
    });
  }
});

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

    const [rows] = await db.query(
      `
            SELECT *
            FROM todolist
            WHERE user_id = ?
        `,
      [user_id],
    );

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

    const [rows] = await db.query(
      `
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
        `,
      [user_id],
    );

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

    if (todoType === "daily") {
      await db.query(
        `
                UPDATE todolist
                SET status = 'done'
                WHERE id = ?
                `,
        [id],
      );
    } else if (todoType === "monthly") {
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
    } else if (todoType === "monthly") {
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
        },
      );

      stream.end(req.file.buffer);
    });

    // Get Cloudinary URL
    const imageUrl = result.secure_url;

    // Save ONLY the image URL to the existing todo
    await db.query("UPDATE todolist SET image_url = ? WHERE id = ?", [
      imageUrl,
      id,
    ]);

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
      [id],
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
        code: "404",
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

    publicId = publicId.substring(0, publicId.lastIndexOf("."));

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log("Cloudinary delete:", result);

    // Remove URL from MySQL
    await db.query("UPDATE todolist SET image_url = NULL WHERE id = ?", [id]);

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
