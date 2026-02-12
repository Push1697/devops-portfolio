const express = require("express");
const graphql = require("graphql");
const { graphqlHTTP } = require("express-graphql");

const app = express();
const PORT = 5000;
const userData = require("./MOCK_DATA.json");

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      args: { id: { type: GraphQLInt } },
      resolve() {
        return userData;
      },
    },
    findUserById: {
      type: UserType,
      description: "fetch single user",
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return userData.find((item) => item.id === args.id);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        const newUser = {
          id: userData.length + 1,
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        };
        userData.push(newUser);
        return newUser;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

const normalize = (value) => value.toLowerCase().trim();

const searchUsers = (query) => {
  if (!query) {
    return userData;
  }
  const needle = normalize(query);
  return userData.filter((user) => {
    const haystack = [user.firstName, user.lastName, user.email]
      .filter(Boolean)
      .map((value) => normalize(String(value)))
      .join(" ");
    return haystack.includes(needle);
  });
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.get("/rest/getAllUsers", (req, res) => {
  res.send(userData);
});

app.get("/api/users/search", (req, res) => {
  const query = req.query.q || "";
  res.json(searchUsers(query));
});

app.get("/", (req, res) => {
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>User Search</title>
    <style>
      :root {
        --bg: #f5f0e6;
        --panel: #ffffff;
        --ink: #1b1b1f;
        --accent: #e24d2a;
        --accent-dark: #b73a1e;
        --muted: #6b6f76;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Space Grotesk", "Segoe UI", sans-serif;
        background: radial-gradient(circle at top left, #fff5e1, var(--bg));
        color: var(--ink);
      }
      main {
        max-width: 920px;
        margin: 48px auto;
        padding: 0 20px 48px;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        margin-bottom: 32px;
      }
      h1 {
        font-size: 40px;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .tagline {
        color: var(--muted);
        font-size: 16px;
        margin-top: 8px;
      }
      .panel {
        background: var(--panel);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 20px 40px rgba(17, 24, 39, 0.08);
      }
      form {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      input[type="text"] {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 16px;
      }
      button {
        border: none;
        border-radius: 12px;
        padding: 12px 18px;
        background: var(--accent);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      button:hover {
        background: var(--accent-dark);
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 12px;
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff8f2;
        border-radius: 14px;
        padding: 12px 16px;
        border: 1px solid #f1e2d0;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .title {
        font-weight: 600;
      }
      .chip {
        font-size: 12px;
        color: var(--muted);
      }
      footer {
        margin-top: 20px;
        color: var(--muted);
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>User Search</h1>
          <div class="tagline">Search by first name, last name, or email.</div>
        </div>
        <div class="panel" style="padding: 16px 20px;">
          <div style="font-size: 12px; color: var(--muted);">Total users</div>
          <div id="total" style="font-weight: 700; font-size: 20px;">0</div>
        </div>
      </header>
      <section class="panel">
        <form id="search-form">
          <input id="search-input" type="text" placeholder="Search users..." />
          <button type="submit">Search</button>
        </form>
        <ul id="result-list"></ul>
        <footer>GraphQL ready at <code>/graphql</code>. REST at <code>/rest/getAllUsers</code>.</footer>
      </section>
    </main>
    <script>
      const list = document.getElementById("result-list");
      const form = document.getElementById("search-form");
      const input = document.getElementById("search-input");
      const total = document.getElementById("total");

      const render = (items) => {
        list.innerHTML = "";
        total.textContent = String(items.length);
        if (!items.length) {
          const empty = document.createElement("li");
          empty.textContent = "No users found.";
          list.appendChild(empty);
          return;
        }
        items.forEach((user) => {
          const item = document.createElement("li");
          const meta = document.createElement("div");
          meta.className = "meta";

          const title = document.createElement("div");
          title.className = "title";
          title.textContent = user.firstName + " " + user.lastName;

          const chip = document.createElement("div");
          chip.className = "chip";
          chip.textContent = user.email;

          meta.appendChild(title);
          meta.appendChild(chip);
          item.appendChild(meta);
          list.appendChild(item);
        });
      };

      const loadUsers = async (query = "") => {
        const params = new URLSearchParams({ q: query });
        const response = await fetch("/api/users/search?" + params.toString());
        const items = await response.json();
        render(items);
      };

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await loadUsers(input.value.trim());
      });

      loadUsers();
    </script>
  </body>
</html>`);
});

app.listen(PORT, () => {
  console.log("Server running");
});
