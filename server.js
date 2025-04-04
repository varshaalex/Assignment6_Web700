/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Varsha Maria Alex
*  Student ID: 180085235
*  Date: 026-03-2025
*
********************************************************************************/ 
const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");
const app = express();
const expressLayouts = require("express-ejs-layouts");
app.use(express.static("public"));
const HTTP_PORT = process.env.PORT || 8080;

// 404 Page Route
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse form data 
app.use(express.urlencoded({ extended: true }));

// Middleware to set current active route for navLink
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
    next();
  });

// Helper to mark active nav item
app.locals.navLink = function (url, options) {
    const isActive = url === app.locals.activeRoute ? ' active' : '';
    return `<li class="nav-item${isActive}"><a class="nav-link" href="${url}">${options}</a></li>`;
  };
  
  // Helper to compare values (used in radio/select logic)
  app.locals.equal = function (lvalue, rvalue, options) {
    return lvalue == rvalue ? options.fn(this) : options.inverse(this);
  };
  

// Set EJS as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/main");

app.use(async (req, res, next) => {
    try {
        await collegeData.initialize();
        next();
    } catch (err) {
        console.error(`Initialization error: ${err}`);
        res.status(500).send(`Server error: ${err}`);
    }
});

app.get("/", (req, res) => {
    res.redirect("/home");
  });
  
  app.get("/home", (req, res) => {
    res.render("home");
  });
  
  app.get("/about", (req, res) => {
    res.render("about");
  });
  
  app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
  });
  
  app.get("/students/add", (req, res) => {
    res.render("addStudent");
  });
  
// POST /students/add
app.post("/students/add", (req, res) => {
    collegeData
      .addStudent(req.body)
      .then(() => {
        res.redirect("/students"); 
      })
      .catch((err) => {
        res.status(500).render("error", { message: "Error adding student: " + err, navLink: navLink });
      });
  });


// Get all students or by course
app.get("/students", (req, res) => {
    if (req.query.course) {
      collegeData
        .getStudentsByCourse(req.query.course)
        .then((students) =>
          res.render("students", { students: students })
        )
        .catch(() =>
          res.render("students", { message: "no results" })
        );
    } else {
      collegeData
        .getAllStudents()
        .then((students) =>
          res.render("students", { students: students })
        )
        .catch(() =>
          res.render("students", { message: "no results" })
        );
    }
  });
  
// Get all courses
app.get("/courses", (req, res) => {
    collegeData
      .getCourses()
      .then((courses) =>
        res.render("courses", { courses: courses })
      )
      .catch(() =>
        res.render("courses", { message: "no results" })
      );
  });

// Get a student by student number
app.get("/student/:num", (req, res) => {
    collegeData
      .getStudentByNum(req.params.num)
      .then((student) =>
        res.render("student", { student: student })
      )
      .catch(() => res.json({ message: "no results" }));
  });
//Update a student
app.post("/student/update", (req, res) => {
    console.log(req.body);
    collegeData
      .updateStudent(req.body)
      .then(() => {
        res.redirect("/students");
      })
      .catch((err) => res.status(500).send(err));
  });
  
  // Get a course by course code
  app.get("/course/:id", (req, res) => {
    collegeData
      .getCourseById(req.params.id)
      .then((course) =>
        res.render("course", { course: course })
      )
      .catch(() => res.json({ message: "no results" }));
  });


// 404 Page Not Found
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

if (process.env.VERCEL) {
    module.exports = app;
} else {
    app.listen(HTTP_PORT, () => console.log(`Server running at http://localhost:${HTTP_PORT}`));
}
