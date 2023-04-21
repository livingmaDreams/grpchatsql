
let grp;
let grpName;

window.addEventListener('DOMContentLoaded',getUsrGroups);

function getUsrGroups(){
  const token = localStorage.getItem('groupChat');
  axios.get('http://13.55.186.26:3000/home/usergrps',{ headers:{"Authorization":token}})
  .then(res =>{
    const grp = res.data.groups;
    for(let i of grp)
    grpBtnCreation(i.name,i.admin)
  })
  .catch(err => console.log(err));
}

document.getElementById('send').addEventListener('click',postMessage);

async function postMessage(event){
  event.preventDefault();
const form = document.querySelector('form');
const frmData = new FormData(form);
let postObj;
if(frmData.get('file').name != ''){
  frmData.append('grpName',grpName);
  postObj= frmData;
}
else{
  const msg = document.getElementById('message').value;
  postObj = {msg,grpName}
}
const token = localStorage.getItem('groupChat');

try{
  await axios.post(`http://13.55.186.26:3000/home/users`,postObj,{ headers:{"Authorization":token}})
  document.getElementById('message').value = '';
  document.getElementById('file').value = '';
}
catch(err){console.log(err)};
 }

document.getElementById('creategroup').addEventListener('click',createGroup);

function createGroup(){
   const parDiv = document.getElementById('group-tab');
   parDiv.style.display='block';
   parDiv.innerHTML=`<p>Create Group</p>
   <input type="text" name="name" id="name" placeholder="Name of the Group">
   <div id="users-list"></div>
   <button id="done" name="done">DONE</button>`;
   axios.get('http://13.55.186.26:3000/home/allusers')
   .then(res =>{
    const userList = res.data.users;
    const parDiv = document.getElementById('users-list');
    for(let i of userList){
      if(i != localStorage.getItem('groupChatName')){
      const inputEle = document.createElement('input');
      inputEle.type='checkbox';
      inputEle.className='user-for-group';
      inputEle.name=i;
      parDiv.appendChild(inputEle);
      const labelEle = document.createElement('label');
      labelEle.setAttribute('for',i);
      labelEle.textContent=i;
      parDiv.appendChild(labelEle);
      }
    }
   })
   .catch(err => console.log(err));
   
   document.getElementById('done').addEventListener('click',()=>{
    const grpName = document.getElementById('name').value;
    const user = document.querySelectorAll('.user-for-group:checked');
    const usr =[];
    if(user){
      for(let i of user)
      usr.push(i.name)
    }
    const token = localStorage.getItem('groupChat');
    axios.post('http://13.55.186.26:3000/home/creategroup',{grpName,user:[...usr]},{ headers:{"Authorization":token}})
    .then(() => { 
      window.alert(`${grpName} has been created`);
      grpBtnCreation(grpName,'true');
    })
    .catch(err => console.log(err));
    parDiv.style.display='none';
   })
}

function grpBtnCreation(grpName,admin){
  const button = document.createElement('button');
  button.textContent=grpName;
  button.id='grp-list';
  button.addEventListener('click',getGroupChat);
  document.getElementById('group').appendChild(button);
  if(admin === 'true'){
  const button1 = document.createElement('button');
  button1.innerHTML='&#9881;';
  button1.id='settings';
  button1.name=grpName;
  button1.addEventListener('click',getGrpSettings);
  document.getElementById('group').appendChild(button1);
  }
}

function getGrpSettings(event){
  const grpName = event.target.previousElementSibling.textContent;
  const parDiv = document.getElementById('setting-tab');
   parDiv.style.display='block';
   parDiv.innerHTML=`<p>Group</p>
   <input type="text" name="name" id="name" value="${grpName}" disabled>
   <p>Admin</p>
   <div id="users-admin-list"></div>
   <p>Users</p>
   <div id="users-grp-list"></div>
   <button id="done" name="done">DONE</button>`;
   axios.get(`http://13.55.186.26:3000/home/users?grpname=${grpName}`)
   .then(res =>{
    const userList = res.data.users;
    const admin = res.data.admin;
    const allUsers = res.data.allusers;

    const parDiv = document.getElementById('users-grp-list');
    for(let i of allUsers){
      const inputEle = document.createElement('input');
      inputEle.type='checkbox';
      inputEle.className='user-for-group';
      inputEle.name=i;
      if(userList.includes(i))
      inputEle.checked=true;
      parDiv.appendChild(inputEle);
      const labelEle = document.createElement('label');
      labelEle.setAttribute('for',i);
      labelEle.textContent=i;
      parDiv.appendChild(labelEle);
    }
    const parDiv1 = document.getElementById('users-admin-list');
    for(let i of allUsers){
      const inputEle = document.createElement('input');
      inputEle.type='checkbox';
      inputEle.className='user-for-groupadmin';
      inputEle.name=i;
      if(admin.includes(i))
      inputEle.checked=true;
      parDiv1.appendChild(inputEle);
      const labelEle = document.createElement('label');
      labelEle.setAttribute('for',i);
      labelEle.textContent=i;
      parDiv1.appendChild(labelEle);
    }
    
   })
   .catch(err => console.log(err));
   
   document.getElementById('done').addEventListener('click',()=>{
    console.log('hi');
    const grpName = document.getElementById('name').value;
    const user = document.querySelectorAll('.user-for-group:checked');
    const admin = document.querySelectorAll('.user-for-groupadmin:checked')
    const usr =[];
    const admn=[];
    if(user){
      for(let i of user)
      usr.push(i.name)
    }
    if(admin){
      for(let i of admin)
      admn.push(i.name)
    }
    const obj={};
    obj.name = grpName;
    obj.user = usr;
    obj.admin = admn;
    const token = localStorage.getItem('groupChat');
    axios.post('http://13.55.186.26:3000/home/updategroup',obj,{ headers:{"Authorization":token}})
    .then(() => { 
      window.alert(`${grpName} has been updated`);
    })
    .catch(err => console.log(err));
    parDiv.style.display='none';
    window.location.reload();
   })
}

function getGroupChat(event){
  if(document.getElementById('grp-active') && document.getElementById('grp-active').textContent != event.target.textContent)
  document.getElementById('grp-active').id='grp-list';
  if(event.target.id == 'grp-list')
    event.target.id='grp-active';
    
    clearInterval(grp);
    document.getElementById('chat-room').innerHTML='';
    grpName = event.target.textContent;
    const token = localStorage.getItem('groupChat');
    let msgCount= 0;
    
    grp = setInterval(()=>{
      axios.get(`http://13.55.186.26:3000/home/grpmsg?groupname=${grpName}&msgcount=${msgCount}`,{ headers:{"Authorization":token}})
      .then(res => {
       const msg = res.data.Msg;
       msgCount = res.data.msgCount;
       if(msg){
        for(let i of msg)
        printMessages(`${i.name} : `,i.message);
       }
      
      })
      .catch(err => console.log(err)); 
    },500);
};   

function printMessages(name,message){
  const div = document.createElement('div');
  div.id = 'user-messages-list';
  if(message.includes('.jpg'))
  div.innerHTML = `<span>${name}</span><span><img src=${message} alt="image" ></span>`;
  else if(message.includes('.pdf'))
  div.innerHTML = `<span>${name}</span><span><a href=${message}>${message}</a></span>`;
  else
  div.innerHTML = `<span>${name}</span><span>${message}</span>`;
  document.getElementById('chat-room').appendChild(div);
}

document.getElementById('logout').addEventListener('click',logOut);

function logOut(){
  const token = localStorage.getItem('groupChat');
  axios.get('http://13.55.186.26:3000/home/logout',{ headers:{"Authorization":token}})
  .then(res => {
    localStorage.setItem('groupChat','');
    window.location.href='http://13.55.186.26:3000/login';
  })
  .catch(err => console.log(err));
}

