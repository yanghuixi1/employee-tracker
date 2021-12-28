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

function displayEmployees() {
  conn.query(
    `SELECT e.id, e.first_name, e.last_name, title, department, salary, CONCAT(f.first_name, " ", f.last_name) AS manager FROM
      (SELECT c.id, first_name, last_name, title, name AS department, salary, manager_id FROM
        (SELECT a.id, first_name, last_name, title, salary, department_id, manager_id
          FROM employee a JOIN role b ON a.role_id=b.id)
            AS c JOIN department AS d ON c.department_id=d.id) AS e LEFT OUTER JOIN employee AS f ON e.manager_id=f.id
              ORDER BY e.id`,
    function (err, results) {
      printFormattedResults(results);
    }
  );
}

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
    });
}

function askRoleQuestions() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role?",
        name: "title",
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
