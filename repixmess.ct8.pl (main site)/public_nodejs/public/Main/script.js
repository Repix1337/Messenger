document.addEventListener("DOMContentLoaded", () => {
  setCookie("SelectedChat", null, 7, "ct8.pl");

  const chatMessages = document.getElementById("chat-messages");
  const textArea = document.getElementById("textarea");
  const konto = document.querySelector(".konto");
  const popup = document.getElementById("popup");
  const messageMenu = document.getElementById("MessageMenu");
  const chatSettings = document.getElementById("chatSettingsMenuContainer");
  const chatroom = document.querySelector(".chatroom");
  const deleteMessageButton = document.getElementById("DeleteMessageButton");
  const editMessageButton = document.getElementById("EditMessageButton");
  const ChatSelector = document.getElementById("Chat-selector");
  const ChatCreateButton = document.getElementById("ChatCreateButton");
  const ChatList = document.getElementById("Chats");
  const ChatCreateForm = document.getElementById("ChatCreateForm");
  const CreateChat = document.getElementById("Create");
  const GoBack = document.getElementById("GoBack");
  const popupPassword = document.getElementById("popupPassword");
  const ChatPasswordInput = document.getElementById("chatPasswordInput");
  const ChatSubmitPassword = document.getElementById("chatSubmitPassword");
  const accountMenu = document.getElementById("accountMenuContainer");

  let currentUser;
  let messageID;
  let loadedMessages = {};
  let loadedChats = {};
  let canEdit = false;
  let Chatcreation = false;
  let loggedIn = getCookie("loggedIn");
  let username = getCookie("username").toLowerCase();
  let avatarPath;
  let owner;

  function removeIframe() {
    loggedIn = getCookie("loggedIn");
    username = getCookie("username").toLowerCase();
    const iframe = document.getElementById("logowanie");

    if (loggedIn.trim() == "true" && iframe) {
      clearInterval(intervalId);
      location.reload();
    } else if (loggedIn.trim() == "true" && !iframe) {
      clearInterval(intervalId);
    }
  }

  const intervalId = setInterval(removeIframe, 500);

  function setCookie(name, value, days, domain) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie =
      name + "=" + value + ";" + expires + ";path=/;domain=" + domain;
    console.log(`Cookie set: ${name}=${value}; domain=${domain}`);
  }

  function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cname) == 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return "";
  }
  function delete_cookie(name, path, domain) {
    if (!name) return;

    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

    if (path) {
      cookieString += ` path=${path};`;
    }

    if (domain) {
      cookieString += ` domain=${domain};`;
    }

    document.cookie = cookieString;
  }

  const socket = new WebSocket("https//repixmess.ct8.pl");

  socket.addEventListener("open", () => {
    console.log("Connected to WebSocket");
    socket.send(JSON.stringify({ type: "loadChats" }));
    if (loggedIn === "true" && username) {
      currentUser = username;
      chatroom.style.display = "block";
      document.querySelectorAll(".side").forEach((element) => {
        element.style.display = "none";
      });

      const accountLink = document.getElementById("accountLink");
      accountLink.textContent = username.toLowerCase();
      document.getElementById("chat-messages").style.display = "none";
      document.getElementById("Chat-selector").style.display = "flex";
      document.querySelector(".side-menu").style.display = "flex";
      document.querySelector(".text").style.display = "flex";
      document.getElementById("chatTitle").style.color = "white";
      socket.send(JSON.stringify({ type: "setAvatar", username }));
    }
  });

  socket.addEventListener("message", (event) => {
    var data = JSON.parse(event.data);

    if (data.type === "loadMessages") {
      handleReceivedMessages(data.messages);
    } else if (data.type === "newMessage") {
      displayNewMessages([data.message]);
    } else if (data.type === "editMessage") {
      updateMessageContentIfNeeded(
        data.message.messageID,
        data.message.message
      );
    } else if (data.type === "deleteMessage") {
      removeMessages([data.messageID]);
    } else if (data.type === "clearMessages") {
      removeMessages(Object.keys(loadedMessages));
    } else if (data.type === "loadChats") {
      handleReceivedChats(data.chatInfo);
    } else if (data.type === "newChat") {
      displayNewChats([data.chat]);
    } else if (data.type === "finalizeNameChange") {
      finalizeNameChange(data.newUsername, data.success);
    } else if (data.type === "finalizeChatNameChange") {
      finalizeChatNameChange(data.newChatName, data.success);
    } else if (data.type === "joinChat") {
      DoesItHavePassword([data.chatInfo]);
    } else if (data.type === "setAvatar") {
      setAvatar([data.avatarpath]);
    } else if (data.type === "chatDeletion") {
      alert("Chat got deleted");
      location.reload();
    } else if (data.type === "passwordCheck") {
      if (data.success) {
        popupPassword.style.display = "none";
        chatroom.style.display = "block";
        document.getElementById("noclick").style.display = "none";
        JoinAChat(data.author);
      } else {
        alert("Incorrect password. Please try again.");
      }
    } else {
      console.error("Unexpected message format:", data);
    }
  });

  socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event);
  });

  socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed:", event);
  });

  function setAvatar(avatarPath) {
    document.getElementById("pfpAccount").src = avatarPath;
  }
  function handleReceivedMessages(messages) {
    const messagesToRemove = [];

    Object.keys(loadedMessages).forEach((messageID) => {
      const receivedMessage = messages.find(
        (message) => message.messageid === messageID
      );

      if (!receivedMessage) {
        messagesToRemove.push(messageID);
      } else {
        updateMessageContentIfNeeded(messageID, receivedMessage.message);
      }
    });

    removeMessages(messagesToRemove);
    displayNewMessages(messages);
  }

  function updateMessageContentIfNeeded(messageID, newMessageContent) {
    const messageElement = document.getElementById(messageID);

    if (!messageElement) return;
    const messageTextContent = Array.from(messageElement.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join(newMessageContent);

    if (messageTextContent !== newMessageContent) {
      messageElement.textContent = newMessageContent;
    }
    canEdit = false;
    messageID = null;
    textArea.value = "";
  }

  function removeMessages(messageIDs) {
    messageIDs.forEach((messageID) => {
      document
        .querySelectorAll(`[data-message-id="${messageID}"]`)
        .forEach((element) => {
          element.remove();
        });
      delete loadedMessages[messageID];
    });
  }
  function displayNewMessages(messages) {
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    messages.forEach((message) => {
      let imagePath;
      let messageID;
      const sender = message.sender;
      const messageText = message.message;
      const nameColor = message.color;
      const chatID = getCookie("SelectedChat");
      let isFromOwner = message.isFromOwner;
      avatarPath = message.avatarpath;
      if (message.imagePath != null) {
        imagePath = message.imagePath;
      } else {
        imagePath = null;
      }
      if (message.messageid != null) {
        messageID = message.messageid;
      } else {
        messageID = message.messageID;
      }
      let timestamp = message.timestamp;

      if (!loadedMessages[messageID] && chatID === message.chatid) {
        createMessageElement(
          sender,
          messageText,
          messageID,
          imagePath,
          timestamp,
          avatarPath,
          nameColor,
          isFromOwner
        );
        loadedMessages[messageID] = true;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  }

  function createMessageElement(
    sender,
    messageText,
    messageID,
    imagePath,
    timestamp,
    avatarPath,
    nameColor,
    isFromOwner
  ) {
    const newMessageLine = document.createElement("div");
    const newMessage = document.createElement("div");
    const newMessageText = document.createElement("div");
    const img = document.createElement("img");
    const newMessageSender = document.createElement("div");
    const newMessageTimestamp = document.createElement("div");
    const newMessageAvatar = document.createElement("img");
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    let hour = String(date.getHours()).padStart(2, "0");
    let minute = String(date.getMinutes()).padStart(2, "0");

    let fulltimestamp = `${year}-${month}-${day} ${hour}:${minute}`;
    newMessageLine.style.width = "100%";
    newMessageLine.classList.add("messageLine");
    newMessageLine.style.marginTop = "10px";
    newMessage.classList.add("message");
    newMessage.dataset.messageId = messageID;
    newMessageText.dataset.messageId = messageID;
    newMessageSender.dataset.messageId = messageID;
    newMessageLine.dataset.messageId = messageID;
    newMessageTimestamp.dataset.messageId = messageID;
    img.dataset.messageId = messageID;
    newMessage.style.width = "300px";
    newMessageTimestamp.style.fontSize = "12px";
    newMessageTimestamp.style.marginTop = "0";
    newMessageTimestamp.textContent = fulltimestamp;
    newMessageTimestamp.style.textAlign = "right";
    newMessageSender.textContent = sender;
    newMessageSender.style.color = nameColor;
    if (sender.toLowerCase() === currentUser.toLowerCase()) {
      newMessageSender.style.display = "none";
      newMessageText.textContent = `${messageText} `;
      newMessage.style.float = "right";
      newMessage.style.textAlign = "right";
      newMessage.style.textAlign = "left";
      if (newMessageText.textContent.trim() != "") {
        newMessage.style.background = "rgb(0,99,255))";
        newMessage.style.background =
          "linear-gradient(332deg, rgba(0,99,255,1) 0%, rgba(0,193,204,1) 100%)";
      }
      newMessage.style.marginRight = "2rem";
      newMessageText.classList.add("MyMessage");
      img.classList.add("MyMessage");
      newMessageTimestamp.classList.add("MyMessage");
    } else {
      newMessageAvatar.src = avatarPath;
      newMessageLine.appendChild(newMessageAvatar);
      newMessageAvatar.style.width = "100px";
      newMessageAvatar.style.height = "100px";
      newMessageAvatar.style.textAlign = "left";
      newMessageAvatar.style.float = "left";
      newMessageAvatar.style.borderRadius = "100px";
      newMessageAvatar.style.marginLeft = "2rem";
      newMessageText.textContent = `${messageText} `;
      newMessage.style.float = "left";
      newMessage.style.textAlign = "left";
    }
    newMessageText.id = messageID;
    chatMessages.appendChild(newMessageLine);
    newMessageLine.appendChild(newMessage);
    newMessage.appendChild(newMessageSender);
    if (imagePath != null) {
      img.src = imagePath;
      img.style.width = "100%";
      img.style.height = "200px";
      img.alt = "Image";
      img.style.borderRadius = "10px";
      newMessage.appendChild(img);
    }
    newMessage.appendChild(newMessageText);
    newMessage.appendChild(newMessageTimestamp);

    if (newMessageText.textContent.trim() === "") {
      newMessage.style.backgroundColor = "rgba(0,0,0,0)";
      newMessage.style.border = "rgba(0,0,0,0)";
    }
    console.log(isFromOwner);
    if (isFromOwner == 1) {
      newMessageSender.textContent = "Owner: " + sender;
      newMessage.style.background = "#700e0e";
    }
    const newMessageHeight = newMessage.offsetHeight;
    newMessageLine.style.height = newMessageHeight + "px";
  }
  function sendMessage(event) {
    event.preventDefault();

    const message = textArea.value.trim();
    const messageID = Date.now().toString() + Date.now().toString();
    const chatid = getCookie("SelectedChat");
    const imageInput = document.getElementById("imageInput");
    const image = imageInput.files[0];
    const timestamp = Date.now();

    if (!message && !image) return;
    console.log(message);
    const formData = new FormData();
    formData.append("sender", currentUser);
    formData.append("message", message);
    formData.append("messageID", messageID);
    formData.append("chatid", chatid);
    formData.append("timestamp", timestamp);

    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");

    if (image) {
      formData.append("image", image);

      progressContainer.style.display = "block";

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://repixmess.ct8.pl/sendMessage", true);

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          progressBar.style.width = percentComplete + "%";
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            socket.send(
              JSON.stringify({
                type: "newMessage",
                message: {
                  sender: currentUser,
                  message,
                  messageID,
                  chatid,
                  imagePath: data.imagePath,
                  timestamp,
                  avatarpath: "",
                  color: "",
                  isFromOwner: "",
                },
              })
            );

            displayNewMessages([
              {
                sender: currentUser,
                message,
                messageID,
                chatid,
                imagePath: data.imagePath,
                timestamp,
                avatarpath: "",
              },
            ]);

            textArea.value = "";
            imageInput.value = "";
          } else {
            console.error(data.error);
          }
        } else {
          console.error("Error sending message:", xhr.statusText);
        }

        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
      };

      xhr.onerror = function () {
        console.error("Error sending message:", xhr.statusText);

        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
      };

      xhr.send(formData);
    } else {
      socket.send(
        JSON.stringify({
          type: "newMessage",
          message: {
            sender: currentUser,
            message,
            messageID,
            chatid,
            timestamp,
            avatarpath: "",
          },
        })
      );

      textArea.value = "";
      imageInput.value = "";
    }
  }

  function clearMessages() {
    if (owner == username) {
      socket.send(
        JSON.stringify({
          type: "clearMessages",
          chatid: getCookie("SelectedChat"),
        })
      );
      textArea.value = "";
    }
  }

  let menuBoundaries = {};

  function updateMenuBoundaries(menu, clickX, clickY) {
    const menuRect = menu.getBoundingClientRect();
    menuBoundaries[menu.id] = {
      left: menuRect.left,
      top: menuRect.top,
      right: menuRect.right,
      bottom: menuRect.bottom,
    };
  }

  function clickMessage(event) {
    if (event.target.classList.contains("MyMessage") || owner == username) {
      const messageId = event.target.dataset.messageId;
      if (!messageId || !loadedMessages[messageId]) return;

      messageID = messageId;
      const clickX = event.clientX;
      const clickY = event.clientY;

      messageMenu.style.left = `${clickX}px`;
      messageMenu.style.top = `${clickY}px`;
      messageMenu.style.display = "block";

      updateMenuBoundaries(messageMenu, clickX, clickY);
    }
  }

  function clickAccount(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;
    const menuWidth = accountMenu.offsetWidth;

    let menuX = clickX - menuWidth;

    if (menuX < 0) {
      menuX = 0;
    }

    accountMenu.style.left = `${clickX}px`;
    accountMenu.style.top = `${clickY}px`;
    accountMenu.style.display = "block";

    updateMenuBoundaries(accountMenu, clickX, clickY);
  }

  function clickChatSettings(event) {
    if (owner == username) {
      const clickX = event.clientX;
      const clickY = event.clientY;
      const menuWidth = chatSettings.offsetWidth;

      chatSettings.style.left = `${clickX - menuWidth}px`;
      chatSettings.style.top = `${clickY}px`;
      chatSettings.style.display = "block";

      updateMenuBoundaries(chatSettings, clickX, clickY);
    }
  }

  function pfpChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("pfpChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function nameChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("nameChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function colorChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("colorChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function chatNameChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("chatNameChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function chatPasswordChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("chatPasswordChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function chatIconChangePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("chatIconChangePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function chatDeletePopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    document.getElementById("chatDeletePopup").style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }
  function deleteSpecificMessage() {
    socket.send(
      JSON.stringify({
        type: "deleteMessage",
        messageID,
      })
    );
    messageMenu.style.display = "none";
  }

  function editMessage() {
    canEdit = true;
    textArea.value = document.getElementById(messageID).textContent;
  }

  function showLogoutPopup() {
    document.querySelectorAll(".menu").forEach((menus) => {
      menus.style.display = "none";
    });
    popup.style.display = "block";
    chatroom.classList.add("blur");
    document.getElementById("noclick").style.display = "block";
  }

  function logout() {
    delete_cookie("loggedIn", "/", ".ct8.pl");
    delete_cookie("username", "/", ".ct8.pl");
    delete_cookie("username", "/", "repixmess.ct8.pl");
    location.reload();
  }

  function GoBackToTheList() {
    loadedMessages = {};
    ChatSelector.style.display = "flex";
    document.querySelector(".chat").style.display = "none";
    document.getElementById("chat-messages").style.display = "none";
    document.querySelectorAll(".messageLine").forEach((element) => {
      element.remove();
    });
    document.getElementById("info").style.display = "block";
    ChatCreateButton.textContent = "Create your very own chat!!!";
    ChatCreateForm.style.display = "none";
    ChatList.style.display = "block";
    Chatcreation = false;
    ChatCreateButton.style.display = "flex";
  }
  function ChatCreationSwap() {
    if (!Chatcreation) {
      ChatCreateForm.style.display = "flex";
      ChatList.style.display = "none";
      Chatcreation = true;
      document.getElementById("info").style.display = "none";
      ChatCreateButton.textContent = "Go Back";
    } else {
      ChatCreateForm.style.display = "none";
      ChatList.style.display = "block";
      Chatcreation = false;
      document.getElementById("info").style.display = "block";
      ChatCreateButton.textContent = "Create your very own chat!!!";
    }
  }
  function ChatCreate(event) {
    event.preventDefault();

    let ChatName = document.getElementById("Name").value;
    let ChatPassword = document.getElementById("password").value;
    let Author = currentUser;
    let ChatID = Date.now() * 16;
    let icon = document.getElementById("chatIcon").files[0];
    let doesithavepassword;
    if (document.getElementById("password").value == "") {
      doesithavepassword = 0;
    } else if (document.getElementById("password").value != "") {
      doesithavepassword = 1;
    }
    console.log(doesithavepassword);
    const formData = new FormData();
    formData.append("icon", icon);

    fetch("https://repixmess.ct8.pl/sendIcon", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          socket.send(
            JSON.stringify({
              type: "newChat",
              chatInfo: {
                name: ChatName,
                password: ChatPassword,
                author: Author,
                chatid: ChatID,
                iconpath: data.iconPath,
                doesithavepassword,
              },
            })
          );
        }
        displayNewChats([
          {
            name: ChatName,
            author: Author,
            chatid: ChatID,
            iconpath: data.iconPath,
          },
        ]);
      });

    document.getElementById("chatTitle").textContent = ChatName;
    ChatSelector.style.display = "none";
    document.querySelector(".chat").style.display = "flex";
    document.getElementById("chat-messages").style.display = "block";
    setCookie("SelectedChat", ChatID, 7, "ct8.pl");
    socket.send(
      JSON.stringify({
        type: "loadMessages",
        chatid: getCookie("SelectedChat"),
      })
    );
    document.querySelectorAll(".messageLine").forEach((element) => {
      element.remove();
    });
    loadedMessages = {};
  }

  function handleReceivedChats(chats) {
    const chatsToRemove = [];

    Object.keys(loadedChats).forEach((chatID) => {
      const receivedChat = chats.find((chat) => chat.chatid === chatID);

      if (!receivedChat) {
        chatsToRemove.push(chatID);
      }
    });

    displayNewChats(chats);
  }
  function displayNewChats(chats) {
    chats.forEach((chat) => {
      const ChatID = chat.chatid;
      const ChatName = chat.name;
      const Author = chat.author;
      const ChatIcon = chat.iconpath;

      if (!loadedChats[ChatID]) {
        createChatElement(ChatID, ChatName, Author, ChatIcon);
        loadedChats[ChatID] = true;
        ChatList.scrollTop = ChatList.scrollHeight;
      }
    });
  }
  function createChatElement(ChatID, ChatName, Author, chatIcon) {
    const newChatLine = document.createElement("div");
    const newChat = document.createElement("div");
    const newChatName = document.createElement("div");
    const newChatAuthor = document.createElement("div");
    const newChatIcon = document.createElement("img");
    newChatIcon.src = chatIcon;
    newChatIcon.style.width = "100px";
    newChatIcon.style.height = "100%";
    newChatIcon.style.textAlign = "right";
    newChatLine.style.width = "100%";
    newChatLine.style.marginBottom = "30px";
    newChatLine.style.display = "flex";
    newChatLine.style.justifyContent = "center";
    newChatLine.style.alignItems = "center";
    newChat.classList.add("ChatElements");
    newChatName.classList.add("ChatName");
    newChatAuthor.classList.add("ChatAuthor");
    newChat.dataset.chatID = ChatID;
    newChatName.dataset.chatID = ChatID;
    newChatAuthor.dataset.chatID = ChatID;
    newChatLine.dataset.chatID = ChatID;
    newChatIcon.dataset.chatID = ChatID;
    newChatIcon.classList.add("icons");
    newChatAuthor.textContent = `Owner:${Author} `;
    newChatAuthor.style.fontSize = "15px";
    newChatAuthor.style.display = "flex";
    newChatAuthor.style.marginTop = "auto";
    newChatAuthor.style.marginLeft = "auto";
    newChatAuthor.style.textAlign = "right";
    newChatName.style.textAlign = "left";
    newChatName.textContent = `${ChatName} `;
    newChatName.style.zIndex = "1";
    newChatAuthor.style.zIndex = "1";
    newChat.id = ChatID;
    ChatList.appendChild(newChatLine);
    newChatLine.appendChild(newChat);
    newChat.appendChild(newChatIcon);
    newChat.appendChild(newChatName);
    newChat.appendChild(newChatAuthor);
    const newChatHeight = newChat.offsetHeight;
    newChatLine.style.height = newChatHeight + "px";
  }
  function DoesItHavePassword(chats) {
    const selectedChatId = getCookie("SelectedChat");

    chats.forEach((fakechat) => {
      fakechat.forEach((chat) => {
        if (chat.chatid == selectedChatId) {
          if (chat.doesithavepassword == 0) {
            JoinAChat(chat.author);
          } else {
            popupPassword.style.display = "block";
            document.getElementById("noclick").style.display = "block";
            chatroom.classList.add("blur");
          }
        }
      });
    });
  }

  function JoinAChat(author) {
    ChatPasswordInput.value = "";
    chatroom.classList.remove("blur");
    ChatSelector.style.display = "none";
    document.querySelector(".chat").style.display = "flex";
    document.getElementById("chat-messages").style.display = "block";
    owner = author;
    if (owner == username) {
      document.getElementById("reset-button").style.display = "flex";
      document.getElementById("chatSettings").style.display = "flex";
    } else {
      document.getElementById("reset-button").style.display = "none";
      document.getElementById("chatSettings").style.display = "none";
    }
    socket.send(
      JSON.stringify({
        type: "loadMessages",
        chatid: getCookie("SelectedChat"),
      })
    );
  }

  function finalizeNameChange(newUsername, success) {
    if (newUsername && success) {
      delete_cookie("username", "/", ".ct8.pl");
      delete_cookie("username", "/", "repixmess.ct8.pl");
      setCookie("username", newUsername, 7, "repixmess.ct8.pl");
      document.getElementById("nameInput").value = "";
      location.reload();
    } else {
      alert("This username is already used by someone. Try again");
    }
  }
  function finalizeChatNameChange(newChatName, success) {
    if (newChatName && success) {
      document.getElementById("chatTitle").textContent = newChatName;
      document.getElementById("nameInput").value = "";
      location.reload();
    } else {
      alert("This Chat name is already used by somebody else  . Try again");
    }
  }
  // Event Listeners
  document.getElementById("messageForm").addEventListener("submit", (event) => {
    if (!canEdit) {
      event.preventDefault();
      sendMessage(event);
    } else if (canEdit) {
      event.preventDefault();
      socket.send(
        JSON.stringify({
          type: "editMessage",
          message: {
            message: textArea.value,
            messageID,
          },
        })
      );
      messageMenu.style.display = "none";
      canEdit = false;
      messageID = null;
    }
  });
  document
    .getElementById("pfpChangeForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      let avatar = document.getElementById("pfpInput").files[0];
      const formData = new FormData();
      formData.append("login", username);
      formData.append("avatar", avatar);

      fetch("https://repixmess.ct8.pl/sendAvatar", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("pfpAccount").src = data.avatarPath;
        });
      document.getElementById("pfpChangePopup").style.display = "none";
      chatroom.classList.remove("blur");
    });
  document
    .getElementById("nameChangeForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      if (document.getElementById("nameInput").value.length < 18) {
        let newUsername = document.getElementById("nameInput").value;
        const formData = new FormData();
        formData.append("oldUsername", username);
        formData.append("newUsername", newUsername);
        socket.send(
          JSON.stringify({
            type: "changeUsername",
            usernames: {
              oldUsername: username,
              newUsername: newUsername,
            },
          })
        );
      } else {
        alert("max length is 18 characters");
      }
    });
  document
    .getElementById("colorChangeForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      let newColor = document.getElementById("colorInput").value;
      const formData = new FormData();
      formData.append("newColor", newColor);
      socket.send(
        JSON.stringify({
          type: "changeColor",
          newColor,
          username,
        })
      );
      location.reload();
    });
  document
    .getElementById("chatNameChangeForm")
    .addEventListener("submit", (event) => {
      if (owner == username) {
        event.preventDefault();
        if (document.getElementById("chatNameChangeInput").value.length < 30) {
          let newChatName = document.getElementById(
            "chatNameChangeInput"
          ).value;
          const formData = new FormData();
          formData.append(
            "oldChatName",
            document.getElementById("chatTitle").textContent
          );
          formData.append("newChatName", newChatName);
          socket.send(
            JSON.stringify({
              type: "changeChatName",
              chatNames: {
                oldChatName: document.getElementById("chatTitle").textContent,
                newChatName: newChatName,
              },
            })
          );
        } else {
          alert("max length is 30 characters");
        }
      }
    });
  document
    .getElementById("chatIconChangeForm")
    .addEventListener("submit", (event) => {
      if (owner == username) {
        event.preventDefault();
        let icon = document.getElementById("chatIconChangeInput").files[0];
        const formData = new FormData();
        formData.append("chatid", getCookie("SelectedChat"));
        formData.append("icon", icon);

        fetch("https://repixmess.ct8.pl/sendIcon", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            document.getElementById("chatIconTop").src = data.iconPath;
          });
        document.getElementById("chatIconChangePopup").style.display = "none";
        chatroom.classList.remove("blur");
      }
    });
  document
    .getElementById("chatDeleteForm")
    .addEventListener("submit", (event) => {
      if (owner == username) {
        event.preventDefault();
        socket.send(
          JSON.stringify({
            type: "chatDelete",
            chatid: getCookie("SelectedChat"),
          })
        );
      }
    });
  document
    .getElementById("chatPasswordChangeForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      let newPassword = document.getElementById(
        "chatPasswordChangeInput"
      ).value;
      socket.send(
        JSON.stringify({
          type: "changePassword",
          newPassword,
          chatid: getCookie("SelectedChat"),
        })
      );
      location.reload();
    });

  document
    .getElementById("reset-button")
    .addEventListener("click", clearMessages);
  konto.addEventListener("click", clickAccount);
  document
    .getElementById("chatSettings")
    .addEventListener("click", clickChatSettings);
  document.getElementById("Logout").addEventListener("click", showLogoutPopup);
  document
    .getElementById("pfpChange")
    .addEventListener("click", pfpChangePopup);
  document
    .getElementById("nameChange")
    .addEventListener("click", nameChangePopup);
  document
    .getElementById("colorChange")
    .addEventListener("click", colorChangePopup);
  document
    .getElementById("chatPasswordChange")
    .addEventListener("click", chatPasswordChangePopup);
  document
    .getElementById("chatIconChange")
    .addEventListener("click", chatIconChangePopup);
  document
    .getElementById("chatNameChange")
    .addEventListener("click", chatNameChangePopup);
  document
    .getElementById("chatDelete")
    .addEventListener("click", chatDeletePopup);
  CreateChat.addEventListener("click", ChatCreate);
  ChatCreateButton.addEventListener("click", ChatCreationSwap);
  document.getElementById("tak").addEventListener("click", logout);
  document.querySelectorAll(".nie").forEach((no) => {
    no.addEventListener("click", () => {
      document.querySelectorAll(".popup").forEach((popups) => {
        popups.style.display = "none";
      });
      chatroom.classList.remove("blur");
    });
  });
  ChatSubmitPassword.addEventListener("click", (event) => {
    event.preventDefault();
    const chatid = getCookie("SelectedChat");
    const password = ChatPasswordInput.value;

    socket.send(
      JSON.stringify({
        type: "checkPassword",
        chatid,
        password,
        author: "",
      })
    );
  });
  GoBack.addEventListener("click", GoBackToTheList);

  chatMessages.addEventListener("click", clickMessage);
  deleteMessageButton.addEventListener("click", deleteSpecificMessage);
  editMessageButton.addEventListener("click", editMessage);
  document.getElementById("imgButton").addEventListener("click", function () {
    document.getElementById("imageInput").click();
  });
  function isClickOutsideMenu(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;

    // Check if the click is outside any visible menu
    return !Object.values(menuBoundaries).some(
      (boundary) =>
        clickX >= boundary.left &&
        clickX <= boundary.right &&
        clickY >= boundary.top &&
        clickY <= boundary.bottom
    );
  }

  function handleDocumentClick(event) {
    if (isClickOutsideMenu(event)) {
      // Hide menus if click is outside
      if (messageMenu.style.display !== "none") {
        messageMenu.style.display = "none";
      }
      if (accountMenu.style.display !== "none") {
        accountMenu.style.display = "none";
      }
      if (chatSettings.style.display !== "none") {
        chatSettings.style.display = "none";
      }
    }
  }

  // Add mouseleave event listeners to hide menus
  messageMenu.addEventListener(
    "mouseleave",
    () => (messageMenu.style.display = "none")
  );
  accountMenu.addEventListener(
    "mouseleave",
    () => (accountMenu.style.display = "none")
  );
  chatSettings.addEventListener(
    "mouseleave",
    () => (chatSettings.style.display = "none")
  );

  // Add click event listener to document to hide menus when clicking outside
  document.addEventListener("click", handleDocumentClick);

  ChatList.addEventListener("click", (event) => {
    if (event.target.dataset.chatID) {
      const clickedElementId = event.target.dataset.chatID;
      setCookie("SelectedChat", clickedElementId, 7, "ct8.pl");

      // Find the parent element containing the '.ChatName' class
      const chatElement = event.target.closest(".ChatElements");
      if (chatElement) {
        const chatNameElementValue =
          chatElement.querySelector(".ChatName").textContent;
        document.getElementById("chatTitle").textContent = chatNameElementValue;
      }

      socket.send(JSON.stringify({ type: "joinChat" }));

      const chaticonElement = document.getElementById("chatIconTop");
      if (!chaticonElement) {
        console.error('Element with ID "chaticon" not found.');
        return;
      }

      const iconsElements = document.querySelectorAll(".icons");
      iconsElements.forEach((iconElement) => {
        if (iconElement.dataset.chatID === clickedElementId) {
          chaticonElement.src = iconElement.src;
          chaticonElement.style.height = "100%";
          chaticonElement.style.width = "100px";
          chaticonElement.style.borderRadius = "100px";
        }
      });
    }
  });

  document.getElementById("noclick").addEventListener("click", (event) => {
    if (
      !event.target.classList.contains("popupcontainerAndElements") ||
      !event.target.id == "phpChangePopup" ||
      !event.target.id == "nameChangePopup" ||
      !event.target.id == "colorChangePopup"
    ) {
      ChatPasswordInput.value = "";
      popupPassword.style.display = "none";
      document.querySelectorAll(".popup").forEach((popups) => {
        popups.style.display = "none";
      });
      document.getElementById("noclick").style.display = "none";
      chatroom.classList.remove("blur");
    }
  });
  document
    .getElementById("popupPassword")
    .addEventListener("click", (event) => {
      event.stopPropagation();
    });

  const left = document.getElementById("left-side");

  const handleMove = (e) => {
    left.style.width = `${(e.clientX / window.innerWidth) * 100}%`;
  };

  document.onmousemove = (e) => handleMove(e);

  document.ontouchmove = (e) => handleMove(e.touches[0]);
  document.querySelectorAll(".title").forEach((log) => {
    log.addEventListener("click", () => {
      let iframe = document.createElement("iframe");
      iframe.src = "https://repix1337.ct8.pl/";
      iframe.height = "100%";
      iframe.width = "100%";
      iframe.id = "logowanie";
      document.body.appendChild(iframe);
      iframe.zIndex = "999999";
      document.querySelectorAll(".side").forEach((element) => {
        element.style.display = "none";
      });
    });
  });
});
