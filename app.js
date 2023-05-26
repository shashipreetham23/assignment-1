const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
app.use(express.json());
let db = null;
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server Running"));
  } catch (err) {
    console.log(`error:${err.msg}`);
    process.exit(1);
  }
};
initDbAndServer();
const hasPriorityAndStatusProperty = (request) => {
  return request.priority !== undefined && request.status !== undefined;
};
const hasPriorityProperty = (request) => {
  return request.priority !== undefined;
};
const hasStatusProperty = (request) => {
  return request.status !== undefined;
};
const hasCategoryProperty = (request) => {
  return request.category !== undefined;
};
const hasCategoryAndStatusProperty = (request) => {
  return request.category !== undefined && request.status !== undefined;
};
const hasCategoryAndPriorityProperty = (request) => {
  return request.category !== undefined && request.priority !== undefined;
};
const hasSearchProperty = (request) => {
  return request.search_q !== undefined;
};
const ConvertDataToResponse = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    category: obj.category,
    priority: obj.priority,
    status: obj.status,
    dueDate: obj.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let data = null;
  let getTodos = "";
  switch (true) {
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodos = `SELECT * FROM todo WHERE status='${status}';`;
        data = await db.all(getTodos);
        response.send(data.map((each) => ConvertDataToResponse(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodos = `SELECT * FROM todo WHERE priority='${priority}';`;
        data = await db.all(getTodos);
        response.send(data.map((each) => ConvertDataToResponse(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodos = `SELECT * FROM todo WHERE priority='${priority}' AND status='${status}';`;
          data = await db.all(getTodos);
          response.send(data.map((each) => ConvertDataToResponse(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasSearchProperty(request.query):
      getTodos = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      data = await db.all(getTodos);
      response.send(data.map((each) => ConvertDataToResponse(each)));

      break;
    case hasCategoryAndStatusProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodos = `SELECT * FROM todo WHERE category='${category}' AND status='${status}';`;
          data = await db.all(getTodos);
          response.send(data.map((each) => ConvertDataToResponse(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodos = `SELECT * FROM todo WHERE category='${category}';`;
        data = await db.all(getTodos);
        response.send(data.map((each) => ConvertDataToResponse(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndPriorityProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodos = `SELECT * FROM todo WHERE category='${category}' AND priority='${priority}';`;
          data = await db.all(getTodos);
          response.send(data.map((each) => ConvertDataToResponse(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodos = `SELECT * FROM todo;`;
      data = await db.all(getTodos);
      response.send(data.map((each) => ConvertDataToResponse(each)));
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDos = `SELECT * FROM todo WHERE id='${todoId}';`;
  const todo = await db.get(getToDos);
  response.send(ConvertDataToResponse(todo));
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (date === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    if (isValid(new Date(date))) {
      const newDate = format(new Date(date), "YYYY-MM-dd");
      const getDate = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo WHERE due_date='${newDate}';`;
      const todoList = await db.all(getDate);
      response.send(todoList.map((each) => ConvertDataToResponse(each)));
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isValid(new Date(date))) {
          const newDate = format(new Date(date), "YYYY-MM-dd");
          const create = `INSERT INTO todo (id,todo,priority,status,category,due_date)
                                            VALUES (${id},'${todo}','${priority}','${status}', '${category}','${newDueDate}');`;
          await db.run(create);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestDetails = request.body;
  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  let updateTodo;
  switch (true) {
    case requestDetails.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodo = `UPDATE todo 
                             SET todo='${todo}',priority='${priority}',status='${status}',category ='${category}',due_date='${newDueDate}'
                             WHERE id = ${todoId}; `;
        await db.run(updateTodo);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestDetails.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodo = `UPDATE todo 
                             SET todo='${todo}',priority='${priority}',status='${status}',category ='${category}',due_date='${newDueDate}'
                             WHERE id = ${todoId}; `;
        await db.run(updateTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestDetails.todo !== undefined:
      updateTodo = `UPDATE todo 
                            SET todo='${todo}',priority='${priority}',status='${status}',category ='${category}',due_date='${newDueDate}'
                            WHERE id = ${todoId}; `;
      await db.run(updateTodo);
      response.send("Todo Updated");

      break;
    case requestDetails.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodo = `UPDATE todo 
                             SET todo='${todo}',priority='${priority}',status='${status}',category ='${category}',due_date='${newDueDate}'
                             WHERE id = ${todoId}; `;
        await db.run(updateTodo);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestDetails.dueDate !== undefined:
      if (isValid(new Date(date))) {
        const newDate = format(new Date(date), "YYYY-MM-dd");
        updateTodo = `UPDATE todo 
                             SET todo='${todo}',priority='${priority}',status='${status}',category ='${category}',due_date='${newDueDate}'
                             WHERE id = ${todoId}; `;
        await db.run(updateTodo);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE todo WHERE id=${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;
