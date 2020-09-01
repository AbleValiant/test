//jshint esversion:6

//------------------------------------------------------------------------
//--------------------- function declarations ----------------------------
//------------------------------------------------------------------------
var db = firebase.firestore();

function changeFont(elem, value) {
 elem.style.fontFamily = value;
 fontDropDown.innerText = value;
}

function resizeFont(elem, value) {
 elem.style.fontSize = value + "px";
 elem.style.lineHeight = value + "px";
}

function changeColor(elem, value) {
 elem.style.color = value;
}

function alignText(elem, value) {
 elem.style.textAlign = value;
}

function defaultUpdate() {
 editables.forEach(function(editable) {
   editable.style.fontFamily = "Satisfy";
   editable.style.fontSize = "25px";
   editable.style.color = "white";
   editable.style.textAlign = "center";
 });
 heading.style.fontFamily = "Pacifico";
 heading.style.fontSize = "45px";
 heading.style.color = "#da7474";
 heading.style.textAlign = "center";
}

//------------------------------------------------------------------------
//--------------------- Dom access ----------------------------
//------------------------------------------------------------------------
const editables = document.querySelectorAll(".editable");
const heading = document.querySelector(".editable.heading");
const name = document.getElementById("name");
const birthday = document.getElementById("birthday");
const fontFamilies = document.querySelectorAll(".font-item");
const fontDropDown = document.querySelector(".selected-text");
const fontResizers = document.querySelectorAll(".font-range");
const colorSelectors = document.querySelectorAll(".color-select");
// const randomButton = document.querySelector(".random-color");
const alignButtons = document.querySelectorAll(".align-button");
const saveBtn = document.getElementById("save-btn");
const successPopUp = document.querySelector(".save-success");
const popUpClose = document.getElementById("success-close-btn");
//Mobile-only
const parent = document.querySelector('.parent');
const children = document.querySelectorAll('.child');
const fontCont = document.querySelector('.font-cont');
const sizeCont = document.querySelector('.size-cont');
const colorCont = document.querySelector('.color-cont');
const colorDots = document.querySelectorAll(".color-dot");
const alignCont = document.querySelector('.align-cont');



//------------------------------------------------------------------------
//--------------------- global variables ----------------------------
//------------------------------------------------------------------------
var currentEle;
var isLoggedIn;
var userId;

firebase.auth().onAuthStateChanged(function(user) {
 if (user) {
   userId = user.uid;
   let name = user.displayName;
   isLoggedIn = true;
   if(name == null){
     name = "";
   }
   document.querySelector(".user-name").innerText = "Hello, " + name;
   document.getElementById("user-cont").style.display = "block";
 } else {
   isLoggedIn = false;
 }
});

//------------------------------------------------------------------------
//--------------------- saving and fetching+updating data ----------------------------
//------------------------------------------------------------------------
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
if (!queryString || !urlParams.has('query')) {
 defaultUpdate();
 saveBtn.addEventListener("click", function() {
   if(isLoggedIn){
     this.innerText = "Saving...";
     let updatedData = [];
     editables.forEach(function(editable) {
       let data = {
         text: editable.innerText,
         fontFamily: editable.style.fontFamily,
         fontSize: editable.style.fontSize,
         fontColor: editable.style.color,
         textAlign: editable.style.textAlign
       };
       updatedData.push(data);
     });

     db.collection("invitations").add({
         userId: userId,
         name: name.innerText,
         url: window.location.href,
         birthday: birthday.innerText,
         updateInfo: updatedData
       })
       .then(function() {
         saveBtn.innerText = "Save";
         successPopUp.style.opacity = "1";
         successPopUp.style.transform = "scale(1, 1) translate(-50%, -50%)";
       });
   } else {
     window.location.assign("https://asobi.com.au/signin/?redirect="+window.location.href);
   }
 });
} else {

//getting saved data
 let currentEditable;
 if (urlParams.has('query')) {
   db.collection("invitations").doc(urlParams.get('query')).get()
     .then(function(data) {
       data.data().updateInfo.forEach(function(value, index) {
         currentEditable = editables[index];
         currentEditable.innerText = value.text;
         currentEditable.style.fontFamily = value.fontFamily;
         currentEditable.style.fontSize = value.fontSize;
         currentEditable.style.lineHeight = value.fontSize;
         currentEditable.style.color = value.fontColor;
         currentEditable.style.textAlign = value.textAlign;
       });
     });

//updating saved data
   saveBtn.innerText = "Update";
   saveBtn.addEventListener("click", function() {
     this.innerText = "Updating..";
     let updatedData = [];
     editables.forEach(function(editable) {
       let data = {
         text: editable.innerText,
         fontFamily: editable.style.fontFamily,
         fontSize: editable.style.fontSize,
         fontColor: editable.style.color,
         textAlign: editable.style.textAlign
       };
       updatedData.push(data);
     });

     db.collection("invitations").doc(urlParams.get('query')).set({
         userId: userId,
         name: name.innerText,
         url: window.location.origin + window.location.pathname,
         birthday: birthday.innerText,
         updateInfo: updatedData
       })
       .then(function() {
         saveBtn.innerText = "Update";
         successPopUp.style.opacity = "1";
         successPopUp.style.transform = "scale(1, 1) translate(-50%, -50%)";
       });
   });

 }
}

//------------------------------------------------------------------------
//--------------------- Event listeners ----------------------------
//------------------------------------------------------------------------

editables.forEach(function(editable) {
 editable.contentEditable = "true";

 editable.addEventListener("click", function() {
   if (currentEle != null) {
     currentEle.classList.remove("focused");
   }
   currentEle = this;
   currentEle.classList.add("focused");

  parent.style.transform = "translateX(-50%)";
  let current = document.querySelector(".mob-active");
  if (current != null) {
    current.classList.remove("mob-active");
  }
  children.forEach(function(child) {
    child.style.display = "none";
  });

   changeFont(fontDropDown, this.style.fontFamily);
   fontResizers.forEach(function(fontResizer){
     fontResizer.value = editable.style.fontSize.replace(/px/, "");
   });
   document.querySelectorAll(".active").forEach(function(button){
     button.classList.remove("active");
   });
   document.getElementById(this.style.textAlign).classList.add("active");
   document.getElementById(this.style.textAlign + "-mob").classList.add("active");
 });

 // randomButton.addEventListener("click", () => {
 //   changeColor(editable, `rgb(${Math.random()* 255}, ${Math.random()* 255}, ${Math.random()* 255})`);
 // });

});


// tools event listeners

fontFamilies.forEach(function(font) {
 font.addEventListener("click", function() {
   if (currentEle != null) {
     changeFont(currentEle, this.getAttribute("data-font-family"));
   }
 });
});

fontResizers.forEach(function(fontResizer){
  fontResizer.addEventListener("input", function() {
    if (currentEle != null) {
      resizeFont(currentEle, this.value);
    }
  });
});

colorSelectors.forEach(function(colorSelector){
  colorSelector.addEventListener("input", function() {
    if (currentEle != null) {
      changeColor(currentEle, this.value);
    }
  });
});

alignButtons.forEach(function(button) {
 button.addEventListener("click", function() {
   let current = document.querySelectorAll(".active");
   current.forEach(function(current){
     current.classList.remove("active");
   });
   this.classList.add("active");
   if (currentEle != null) {
     alignText(currentEle, this.id);
   }
 });
});

document.getElementById("print-btn").addEventListener("click", function(){
   if(isLoggedIn){
     window.print();
   } else {
     window.location.assign("https://asobi.com.au/signin/?redirect="+window.location.href);
   }
});

document.getElementById('logout').addEventListener("click", function (){
   firebase.auth().signOut().then(function (){
     window.location.assign("/birthday-invitation");
   });
 });

//lest priority
popUpClose.addEventListener("click", function() {
 successPopUp.opacity = "0";
 successPopUp.style.transform = "scale(0, 0)";
});

//Mobile-event-listeners
document.querySelector(".mob-font").addEventListener("click", function() {
  let current = document.querySelector(".mob-active");
  if (current != null) {
    current.classList.remove("mob-active");
  }
  this.classList.add("mob-active");
  parent.style.transform = "translate(-50%, -200%)";
  children.forEach(function(child) {
    child.style.display = "none";
  })
  setTimeout(function() {
    fontCont.style.display = "block";
  }, 300);
});

document.querySelector(".mob-size").addEventListener("click", function() {
  let current = document.querySelector(".mob-active");
  if (current != null) {
    current.classList.remove("mob-active");
  }
  this.classList.add("mob-active");
  parent.style.transform = "translate(-50%, -100%)";
  children.forEach(function(child) {
    child.style.display = "none";
  })
  sizeCont.style.display = "block";
});

document.querySelector(".mob-color").addEventListener("click", function() {
  let current = document.querySelector(".mob-active");
  if (current != null) {
    current.classList.remove("mob-active");
  }
  this.classList.add("mob-active");
  parent.style.transform = "translate(-50%, -100%)";
  children.forEach(function(child) {
    child.style.display = "none";
  })
  colorCont.style.display = "block";
});

colorDots.forEach(function(dot){
  dot.addEventListener("click", function(){
    if(currentEle != null){
      currentEle.style.color = this.id;
    }
  });
});

document.querySelector(".mob-align").addEventListener("click", function() {
  let current = document.querySelector(".mob-active");
  if (current != null) {
    current.classList.remove("mob-active");
  }
  this.classList.add("mob-active");
  parent.style.transform = "translate(-50%, -100%)";
  children.forEach(function(child) {
    child.style.display = "none";
  })
  alignCont.style.display = "block";
});
