const parent = document.querySelector(".card-container");
const parent2 = document.getElementById("ok");
const add = document.querySelector("#add-form-data");
const buttonAdd = document.getElementById("btn-add");
const submit = document.getElementById("btn-add-submit");
const postTitle = document.getElementById("txt-title");
const postbody = document.getElementById("txt-body");
const post = document.getElementById("post");
const updatebtn = document.querySelector(".btn-update");
const deleteBtn = document.querySelector(".btn-delete");
const h2 = document.getElementById("h2");
modal = document.getElementById("userModal");
modalContent = document.getElementById("modalUserDetail");

let isEdit = false;
let editid = null;
let Alldata = [];

document.getElementById("closeModal").addEventListener("click", closeUserModal);
document
  .querySelector(".modal-content")
  .addEventListener("click", (e) => e.stopPropagation());
window.addEventListener("click", (e) => e.target === modal && closeUserModal());

async function getApi() {
  try {
    let data = await fetch("https://jsonplaceholder.typicode.com/posts");
    let res = await data.json();
    let storedPosts = JSON.parse(localStorage.getItem("posts")) || [];

    Alldata = [...storedPosts, ...res];
    renderSinglePost(Alldata);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getApi();
});

buttonAdd.addEventListener("click", () => {
  isEdit = false;
  add.style.display = "block";
  parent.style.display = "none";
});

post.addEventListener("click", () => {
  add.style.display = "none";
  parent.style.display = "block";
});

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  const title = postTitle.value.trim();
  const body = postbody.value.trim();

  if (title == "" || body == "") {
    alert("Our field are required");
  } else {
    const obj = {
      userId: Math.floor(Math.random() * 10) + 1,
      title,
      body,
    };
    if (isEdit) {
      try {
        if (editid <= 100) {
          const res = await fetch(
            `https://jsonplaceholder.typicode.com/posts/${editid}`,
            {
              method: "PUT",
              headers: {
                "Content-type": "application/json",
              },
              body: JSON.stringify({
                userId,
                title,
                body,
              }),
            }
          );

          const result = await res.json();

          updateData(result);
          renderSinglePost(Alldata);
        } else {
          let updatepost = JSON.parse(localStorage.getItem("posts")) || [];
          const updatedata = updatepost.find((post) => post.id === editid);
          if (updatedata) {
            updatedata.title = title;
            updatedata.body = body;
            updateData(updatedata);
            getApi();
          }
        }

        alert("Data Updated Successfully : ");
      } catch (e) {
        console.error("Update error", e);
      }
    } else {
      await addData(obj);

      alert("Data Add SuccessFully");
    }
    postTitle.value = "";
    postbody.value = "";
    add.style.display = "none";
    parent.style.display = "block";
  }
  getApi();
});

async function addData(obj) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    const result = await res.json();
    addPostLocally(result);
  } catch (e) {}
}

function addPostLocally(newPost) {
  let storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  const customPost = { ...newPost, id: Date.now() };
  storedPosts.unshift(customPost);
  localStorage.setItem("posts", JSON.stringify(storedPosts));
  Alldata.unshift(customPost);
}

async function renderSinglePost(post) {
  parent2.innerHTML = "";
  post.forEach(async (post) => {
    const postCard = document.createElement("div");
    postCard.classList.add("card");
    let userName;
    try {
      let data = await fetch(
        `https://jsonplaceholder.typicode.com/users/${post.userId}`
      );
      let res = await data.json();
      userName = res.name;

      if (res) {
        postCard.addEventListener("click", () => userDataFetch(res));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    postCard.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p id="user-name-card"><strong>User Name:</strong> ${userName}</p>
      <button class="btn-delete" > Delete </button>
      <button class="btn-update"> Update </button>
    `;

    postCard.querySelector(".btn-update").addEventListener("click", (e) => {
      add.style.display = "block";
      parent.style.display = "none";
      postTitle.value = post.title;
      postbody.value = post.body;
      h2.innerHTML = "Edit data";
      isEdit = true;
      editid = post.id;
      userId = post.userId;
      e.stopPropagation();
    });

    postCard.querySelector(".btn-delete").addEventListener("click", (e) => {
      deleteData(post.id);
      postCard.remove();
      e.stopPropagation();
    });

    parent2.appendChild(postCard);
  });
}

async function deleteData(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
  });
  let deletepost = JSON.parse(localStorage.getItem("posts")) || [];

  deletepost = deletepost.filter((d) => d.id != id);

  localStorage.setItem("posts", JSON.stringify(deletepost));
  Alldata = Alldata.filter((d) => d.id != id);
}

async function userDataFetch(data) {
  modalContent.innerHTML = `
     <div class="user-card">
      <div class="user-header">

        <h2 class="user-name">${data.name}</h2>
        <hr>
        <p class="user-email"><strong>E-mail:</strong>${data.email}</p>

      </div>
      <div class="user-body">
        <p><strong>City:</strong> ${data.address.city}  </p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Company:</strong> ${data.company.name}</p>
      </div>
    </div>`;
  modal.style.display = "flex";
}

function closeUserModal() {
  modal.style.display = "none";
}

function updateData(updateData) {
  let updatepost = JSON.parse(localStorage.getItem("posts")) || [];
  updatepost = updatepost.map((d) => (d.id == updateData.id ? updateData : d));
  localStorage.setItem("posts", JSON.stringify(updatepost));
  Alldata = Alldata.map((d) => (d.id == updateData.id ? updateData : d));
}

function renderUpdatedUI() {
  parent2.innerHTML = "";
  renderSinglePost(Alldata);
}
