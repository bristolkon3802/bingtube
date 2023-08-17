import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".video__comment-delete");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const spanText = document.createElement("span");
  spanText.innerText = ` ${text}`;
  const spanIcon = document.createElement("span");
  spanIcon.innerText = "❌";
  spanIcon.className = "video__comment-delete";
  newComment.appendChild(icon);
  newComment.appendChild(spanText);
  newComment.appendChild(spanIcon);
  videoComments.prepend(newComment);
  spanIcon.addEventListener("click", handleCommentDelete);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "" || text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  const { newCommentId } = await response.json();
  if (response.status === 201) {
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleCommentDelete = async (e) => {
  const {
    dataset: { id },
  } = e.target.parentElement;

  const response = await fetch(`/api/videos/${id}/comment/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 200) {
    e.target.parentNode.remove();
  }
};

if (deleteBtn) {
  deleteBtn.forEach((btn) =>
    btn.addEventListener("click", handleCommentDelete)
  );
}
