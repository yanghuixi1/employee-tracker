const inquirer = require("inquirer");

function displayDepartments() {}

function displayRoles() {}

function displayEmployees() {}

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

askQuestions();