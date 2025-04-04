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


const Sequelize = require('sequelize');

const sequelize = new Sequelize('neondb', 'neondb_owner', 'npg_7O3apjmoGEMT', {
  host: 'ep-restless-lab-a4qqytcv-pooler.us-east-1.aws.neon.tech',
  dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    logging: false 
});

// Define Models
const Student = sequelize.define("Student", {
    studentNum: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define("Course", {
    courseId: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });

// Exported Functions
module.exports.initialize = () => {
    return sequelize.sync();
};

module.exports.getAllStudents = () => {
    return Student.findAll();
};

module.exports.getStudentsByCourse = (course) => {
    return Student.findAll({ where: { course: course } });
};

module.exports.getStudentByNum = (num) => {
    return Student.findAll({ where: { studentNum: num } })
        .then(data => data.length > 0 ? data[0] : null);
};

module.exports.getCourses = () => {
    return Course.findAll();
};

module.exports.getCourseById = (id) => {
    return Course.findAll({ where: { courseId: id } })
        .then(data => data.length > 0 ? data[0] : null);
};

module.exports.addStudent = (studentData) => {
    studentData.TA = studentData.TA ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }
    return Student.create(studentData);
};

module.exports.updateStudent = (studentData) => {
    studentData.TA = studentData.TA ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }
    return Student.update(studentData, { where: { studentNum: studentData.studentNum } });
};

module.exports.addCourse = (courseData) => {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }
    return Course.create(courseData);
};

module.exports.updateCourse = (courseData) => {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }
    return Course.update(courseData, { where: { courseId: courseData.courseId } });
};

module.exports.deleteCourseById = (id) => {
    return Course.destroy({ where: { courseId: id } });
};

module.exports.deleteStudentByNum = (studentNum) => {
    return Student.destroy({ where: { studentNum: studentNum } });
};
