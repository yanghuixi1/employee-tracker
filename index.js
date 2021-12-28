const inquirer = require("inquirer");
const cTable = require("console.table");
// Import and require mysql2
const mysql = require("mysql2");
const fs = require("fs");

// Connect to database
const conn = mysql.createConnection({
  host: "localhost",
  // MySQL username,
  user: "root",
  // MySQL password
  password: "",
});

function printFormattedResults(results) {
  console.log("\n");
  let table = cTable.getTable(results);
  console.log(table);
  askQuestions();
}

function displayDepartments() {
  conn.query(`SELECT * FROM department ORDER BY id`, function (err, results) {
    printFormattedResults(results);
  });
}

function displayRoles() {}

function displayRoles() {
  conn.query(
    `SELECT role.id, title AS title, salary AS salary, name AS department
        FROM role JOIN department ON role.department_id=department.id
          ORDER BY role.id`,
    function (err, results) {
      printFormattedResults(results);
    }
  );
}

function insertDepartment(departmentName) {
  conn.query(`INSERT INTO department (name) VALUES (\'${departmentName}\');`);
}

function askDepartmentQuestions() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName",
      },
    ])
    .then((answers) => {
      insertDepartment(answers.departmentName);
      askQuestions();
    });
}

function askRoleQuestions() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role?",
        name: "salary",
      },
      {
        type: "input",
        message: "Which department does the role belong to?",
        name: "department",
      },
    ])
    .then((answers) => {
      askQuestions();
    });
}

function askEmployeeQuestions() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "firstName",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "lastName",
      },
      {
        type: "input",
        message: "What is the employee's role?",
        name: "employeeRole",
      },
      {
        type: "input",
        message: "Who is the employee's manager?",
        name: "manager",
      },
    ])
    .then((answers) => {
      askQuestions();
    });
}

function askUpdateEmployeeQuestions() {}

function askQuestions() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Departments",
          "View Roles",
          "View Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
        ],
        name: "action",
      },
    ])
    .then((answers) => {
      if (answers.action === "View Departments") {
        displayDepartments();
      } else if (answers.action == "View Roles") {
        displayRoles();
      } else if (answers.action == "View Employees") {
        displayEmployees();
      } else if (answers.action == "Add Department") {
        askDepartmentQuestions();
      } else if (answers.action == "Add Role") {
        askRoleQuestions();
      } else if (answers.action == "Add Employee") {
        askEmployeeQuestions();
      } else if (answers.action == "Update Employee Role") {
        askUpdateEmployeeQuestions();
      }
    });
}

conn.query("CREATE DATABASE IF NOT EXISTS company");
conn.query("USE company");
let commands = fs.readFileSync("./db/schema.sql").toString().split(";");
let cleanCommands = commands.map((cmd) => cmd.replace(/\n/g, ""));
cleanCommands.pop();
for (let i = 0; i < cleanCommands.length; i++) {
  conn.query(cleanCommands[i]);
}

askQuestions();
