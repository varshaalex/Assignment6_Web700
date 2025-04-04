/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Varsha Maria Alex
*  Student ID: 180085235
*  Date: 04-04-2025
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");
const app = express();
const expressLayouts = require("express-ejs-layouts");
app.use(express.static("public"));
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1])
        ? route.replace(/\/(?!.*)/, "")
        : route.replace(/\/(.*)/, ""));
    next();
});

app.locals.navLink = function (url, options) {
    const isActive = url === app.locals.activeRoute ? ' active' : '';
    return `<li class="nav-item${isActive}"><a class="nav-link" href="${url}">${options}</a></li>`;
};

app.locals.equal = function (lvalue, rvalue, options) {
    return lvalue == rvalue ? options.fn(this) : options.inverse(this);
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/main");

app.get("/", (req, res) => res.redirect("/home"));
app.get("/home", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));
app.get("/htmlDemo", (req, res) => res.render("htmlDemo"));

app.get("/students/add", (req, res) => {
    collegeData.getCourses().then((data) => {
        res.render("addStudent", { courses: data });
    }).catch(() => res.render("addStudent", { courses: [] }));
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch((err) => {
        res.status(500).render("error", { message: "Error adding student: " + err });
    });
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course).then((students) => {
            res.render("students", { students });
        }).catch(() =>
          res.render("students", { students: [] })
        );
    } else {
        collegeData.getAllStudents().then((students) => {
            res.render("students", { students });
        }).catch(() =>
          res.render("students", { students: [] })
        );
    }
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum).then((data) => {
        viewData.student = data || null;
    }).catch(() => {
        viewData.student = null;
    }).then(collegeData.getCourses).then((data) => {
        viewData.courses = data;
        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.courses = [];
    }).then(() => {
        if (viewData.student == null) {
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData });
        }
    });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch((err) => res.status(500).send(err));
});

app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect("/students");
    }).catch(() => {
        res.status(500).send("Unable to Remove Student / Student not found");
    });
});

app.get("/courses", (req, res) => {
  collegeData.getCourses().then((courses) => {
      res.render("courses", { courses });
  }).catch(() => {
      res.render("courses", { courses: [] });
  });
});

app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body).then(() => {
        res.redirect("/courses");
    }).catch(() => res.status(500).send("Unable to Add Course"));
});

app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    }).catch(() => res.status(500).send("Unable to Update Course"));
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id).then((course) => {
        if (course) res.render("course", { course });
        else res.status(404).send("Course Not Found");
    }).catch(() => res.status(404).send("Course Not Found"));
});

app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id).then(() => {
        res.redirect("/courses");
    }).catch(() => res.status(500).send("Unable to Remove Course / Course not found"));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

if (process.env.VERCEL) {
    module.exports = app;
} else {
    collegeData.initialize().then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server running at http://localhost:${HTTP_PORT}`));
    }).catch(err => {
        console.error("Unable to start server: " + err);
    });
}
