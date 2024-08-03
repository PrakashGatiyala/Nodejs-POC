const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

app.use(express.json());

const BLOCKED_DURATION = 2 * 60 * 1000;
const MAX_REQUESTS = 5;
const REQUEST_INTERVAL = 1 * 60 * 1000;

let requests = {};


app.get("/", (req, res) => {
  res.send("Welcome to the Contact Application");
});

function isUserExistsWithSamePhoneNumber(phone) {
  let contactsList = convertCSVto2DArray();
  let isuserExists = false;
  contactsList.forEach((contact) => {
    if (contact.includes(phone)) {
      isuserExists = true;
    }
  });
  return isuserExists;
}

app.post("/contacts", (req, res) => {  

  const { firstName, lastName, email, phone } = req.body;
  if (isUserExistsWithSamePhoneNumber(phone)) {
    console.log("Inside");
    return res
      .status(409)
      .send(`User already exists with ${phone}, Call Update request instead`);
  }
  /* Rate Limitor */ 
  const ip = req.socket.remoteAddress;

  if (!requests[ip]) {
    requests[ip] = { requestTimeStamp: [], blocked: false, blockedUntil: null };
  }
  let userRequestInfo = requests[ip];

  if (userRequestInfo.blocked) {
    if (Date.now() < userRequestInfo.blockedUntil) {
      
      return res.status(423).send(
        `Access locked for ${
          (userRequestInfo.blockedUntil - Date.now()) / 1000
        } seconds`
      );      
    } else {
      userRequestInfo.blocked = false;
      userRequestInfo.blockedUntil = null;
    }
  }

  userRequestInfo.requestTimeStamp = userRequestInfo.requestTimeStamp.filter(
    (item) => Date.now() - item < REQUEST_INTERVAL
  );

  if (userRequestInfo.requestTimeStamp.length >= MAX_REQUESTS) {
    userRequestInfo.blocked = true;
    userRequestInfo.blockedUntil = Date.now() + BLOCKED_DURATION;
    
    return res.status(429).send("Too many requests");
  }
  userRequestInfo.requestTimeStamp.push(Date.now());

  /* End of Rate limitor */

  const id = `${phone}-${email}`;
  const createAt = Date.now();
  const contact = `${id},${firstName},${lastName},${email},${phone},${createAt}\n`;
  fs.appendFileSync("contacts.csv", contact);
  return res.status(200).send(`Contact Created Successfully!\n ${contact}`);
});

const contactIndex = {
  id: 0,
  firstName: 1,
  lastName: 2,
  email: 3,
  phone: 4,
  createAt: 5,
};

function convertCSVto1DArray() {
  const contactsData = fs.readFileSync("contacts.csv").toString();
  const contactsList = contactsData.split("\n");
  return contactsList;
}

function convertCSVto2DArray() {
  const contactsList = convertCSVto1DArray();
  let list = contactsList.map((contact) => {
    return contact.split(",");
  });
  list = list.slice(0, list.length - 1);

  return list;
}

app.get("/contacts", (req, res) => {
  if (Object.keys(req.query).length === 1) {
    if (
      !Object.keys(req.query).includes("sort") &&
      !Object.keys(req.query).includes("order")
    )
      return res
        .status(400)
        .send("Invalid query params, It should be either order/sort");
  }
  if (Object.keys(req.query).length === 2) {
    if (
      !(
        Object.keys(req.query).includes("sort") &&
        Object.keys(req.query).includes("order")
      )
    )
      return res
        .status(400)
        .send("Invalid query params, It should be order and sort");
  }
  const order = req.query.order || "asc";
  const sort = req.query.sort || "firstName";

  if (!(sort in contactIndex)) {
    return res
      .status(400)
      .send(
        "invalid sort query parameter, You can sort on either one of id, firstName, lastName, email, phone, createAt"
      );
  }
  if (order !== "asc" && order !== "desc") {
    return res
      .status(400)
      .send(`Invalid Order query parameter, It should be either asc/desc`);
  }
  const sortIndex = contactIndex[sort];

  let list = convertCSVto2DArray();
  list.sort((a, b) => {
    const aValue = a[sortIndex];
    const bValue = b[sortIndex];

    if (aValue === "undefined") return 1;
    if (bValue === "undefined") return -1;

    if (order === "desc") {
      return bValue.localeCompare(aValue);
    }

    return aValue.localeCompare(bValue);
  });

  return res.status(200).send(list);
});

function UpdateContactFile(contactsList) {
  fs.writeFileSync("contacts.csv", "");
  contactsList.forEach((contact) => {
    const contactInfo = `${contact[0]},${contact[1]},${contact[2]},${contact[3]},${contact[4]},${contact[5]}\n`;
    fs.appendFileSync("contacts.csv", contactInfo);
  });
}

app.delete("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  console.log(req.params);
  let contactsList = convertCSVto2DArray();
  let isUserExists = true;
  contactsList = contactsList.filter((contact) => {
    if (contact.includes(contactId)) isUserExists = false;
    return !contact.includes(contactId);
  });
  if (isUserExists) {
    res.status(404).send(`User with id ${contactId} does not exists`);
  }

  UpdateContactFile(contactsList);

  return res.status(200).send("contact deleted successfully!");
});

app.patch("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  const { firstName, lastName, email, phone } = req.body;
  let contactsList = convertCSVto2DArray();
  let findIndex = contactsList.findIndex((contact) => {
    return contact[0] === contactId;
  });
  if (findIndex === -1) {
    return res
      .status(404)
      .send("Requested ID does not exists, Can not updated");
  }
  let contactInfo = contactsList[findIndex];
  if (firstName) contactInfo[1] = firstName;
  if (lastName) contactInfo[2] = lastName;
  if (email) contactInfo[3] = email;
  if (phone) contactInfo[4] = phone;

  contactsList[findIndex] = contactInfo;
  UpdateContactFile(contactsList);

  return res.status(200).send("Contact updated successsfully!");
});

function freqOfStrCount(arr, str) {
  let count = 0;
  arr.forEach((item) => {
    count += item.split(str).length;
  });
  return count;
}

app.get("/contacts/search", (req, res) => {
  const query = req.query;
  if (Object.keys(query).length !== 1 || !Object.keys(query).includes("q")) {
    return res
      .status(400)
      .send(`Search format should be /contacts/search/q=searchString`);
  }
  const searchStr = query.q;
  let list = convertCSVto2DArray();
  list.sort((a, b) => {
    return freqOfStrCount(b, searchStr) - freqOfStrCount(a, searchStr);
  });

  return res.status(200).send(list);
});

app.get("/contacts/:id", (req, res) => {
  const contactId = req.params.id;
  let contactsList = convertCSVto2DArray();
  let findIndex = contactsList.findIndex((contact) => {
    return contact[0] === contactId;
  });
  if (findIndex === -1) {
    return res
      .status(404)
      .send("Requested ID does not exists, Kindly register your contact first");
  }

  return res.status(200).send(contactsList[findIndex]);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
