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
  // Output a viewer-friendly version of a SQL table
  console.log("\n");
  let table = cTable.getTable(results);
  console.log(table);
  askQuestions();
}

function displayDepartments() {
  // Fetch all department data from the database
  conn.query(`SELECT * FROM department ORDER BY id`, function (err, results) {
    printFormattedResults(results);
  });
}

function displayEmployees() {
  // Fetch employee data, getting additional fields through joining with role and department tables
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
  // Fetch role data, getting additional fields through joining with the department table
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
  // Add new department to the department table
  conn.query(`INSERT INTO department (name) VALUES ('${departmentName}');`);
  askQuestions();
}

function insertRole(title, salary, department) {
  conn.query(
    // Get the ID of the requested department
    `SELECT id from department WHERE name='${department}'`,
    function (err, results) {
      if (results.length === 0) {
        // Early exit if no department with this name exists
        console.log(
          `\n\nThere is no department with the name '${department}'. Please add that department try again.\n`
        );
        askQuestions(); // Return to question loop
      } else {
        // Add role to role table, with foreign key into department table
        let departmentId = results[0].id;
        conn.query(`INSERT INTO role (title, salary, department_id) VALUES
      ('${title}', ${salary}, ${departmentId})
      `);
        askQuestions(); // Return to question loop
      }
    }
  );
}

function insertEmployee(firstName, lastName, employeeRole, manager) {
  conn.query(
    // Get the ID of the requested role
    `SELECT id FROM role WHERE title='${employeeRole}'`,
    function (err, roleResults) {
      if (roleResults.length === 0) {
        // Early exit if role doesn't exist
        console.log(
          `\nThere is no role with the name '${employeeRole}'. Please add that role and try again.\n`
        );
        askQuestions(); // Return to question loop
      } else {
        let roleId = roleResults[0].id;
        // Check if the user didn't provide a manager
        if (manager === "") {
          // If so, set the role ID foreign key, but set the manager as null
          conn.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
          ('${firstName}', '${lastName}', ${roleId}, NULL)`);
          askQuestions(); // Return to question loop
        } else {
          // Otherwise, split the the manager into first and last name
          let managerSplit = manager.split(" ");
          conn.query(
            // Check if a manager with this first and last name exists
            `SELECT id FROM employee WHERE first_name='${managerSplit[0]}' AND last_name='${managerSplit[1]}'`,
            function (err, managerResults) {
              if (managerResults.length === 0) {
                // Early exit if the manager doesn't exist
                console.log(
                  `\nThere is no manager with the name '${manager}'. Please add that manager and try again.\n`
                );
                askQuestions(); // Return to question loop
              } else {
                // If the manager does exist, set both the role ID and manager ID foreign keys
                let managerId = managerResults[0].id;
                conn.query(
                  `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
            ('${firstName}', '${lastName}', ${roleId}, ${managerId})`
                );
                askQuestions(); // Return to question loop
              }
            }
          );
        }
      }
    }
  );
}

function updateEmployeeRole(employee, role) {
  // Split the employee name into first and last name
  let employeeSplit = employee.split(" ");
  conn.query(
    // Get the ID of the requested role
    `SELECT id FROM role WHERE title='${role}'`,
    function (err, roleResults) {
      if (roleResults.length === 0) {
        // Early exit if role doesn't exist
        console.log(
          `\nThere is no role with the name '${role}'. Please add that role and try again.\n`
        );
        askQuestions(); // Return to question loop
      } else {
        let roleId = roleResults[0].id;
        // Change the role ID of the requested employee to the ID of new one
        conn.query(
          `UPDATE employee SET role_id=${roleId}
            WHERE first_name='${employeeSplit[0]}' AND last_name='${employeeSplit[1]}'`
        );
        askQuestions(); // Return to question loop
      }
    }
  );
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
      insertRole(answers.title, answers.salary, answers.department);
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
      insertEmployee(
        answers.firstName,
        answers.lastName,
        answers.employeeRole,
        answers.manager
      );
    });
}

function askUpdateEmployeeQuestions() {
  conn.query(
    'SELECT CONCAT(first_name, " ", last_name) AS name FROM employee',
    function (err, results) {
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employees role do you want to update?",
            choices: Object.values(results),
            name: "employeeToUpdate",
          },
        ])
        .then((employeeAnswers) => {
          let employeeToUpdate = employeeAnswers.employeeToUpdate;
          inquirer
            .prompt({
              type: "input",
              message: `What is ${employeeToUpdate}'s new role?`,
              name: "updatedRole",
            })
            .then((roleAnswers) =>
              updateEmployeeRole(employeeToUpdate, roleAnswers.updatedRole)
            );
        });
    }
  );
}

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

// Parse the schema file and process it line-by-line against the database
let commands = fs.readFileSync("./db/schema.sql").toString().split(";");
let cleanCommands = commands.map((cmd) => cmd.replace(/\n/g, ""));
cleanCommands.pop();
for (let i = 0; i < cleanCommands.length; i++) {
  conn.query(cleanCommands[i]);
}

askQuestions(); // Begin question loop
