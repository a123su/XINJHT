// ===================== 账户相关 本地存储 =====================
// 注册用户
function registerUser() {
    let username = document.getElementById("regUser").value.trim();
    let pwd = document.getElementById("regPwd").value.trim();
    let pwd2 = document.getElementById("regPwd2").value.trim();

    if(!username || !pwd){
        alert("用户名和密码不能为空");
        return;
    }
    if(pwd !== pwd2){
        alert("两次输入密码不一致");
        return;
    }

    let userList = JSON.parse(localStorage.getItem("userList")) || [];
    // 判断用户名是否已存在
    let hasUser = userList.some(item => item.username === username);
    if(hasUser){
        alert("该用户名已被注册");
        return;
    }

    userList.push({username,pwd});
    localStorage.setItem("userList",JSON.stringify(userList));
    alert("注册成功，请前往登录");
    window.location.href = "login.html";
}

// 登录
function login() {
    let username = document.getElementById("loginUser").value.trim();
    let pwd = document.getElementById("loginPwd").value.trim();

    if(!username || !pwd){
        alert("请输入用户名和密码");
        return;
    }

    let userList = JSON.parse(localStorage.getItem("userList")) || [];
    let loginOk = userList.find(item => item.username === username && item.pwd === pwd);

    if(loginOk){
        // 记录登录状态
        localStorage.setItem("isLogin","true");
        localStorage.setItem("loginUser",username);
        window.location.href = "index.html";
    }else{
        alert("用户名或密码错误");
    }
}

// 退出登录
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    window.location.href = "login.html";
}

// 校验登录状态（未登录跳转登录页）
function checkLogin() {
    if(localStorage.getItem("isLogin") !== "true"){
        window.location.href = "login.html";
    }
}

// ===================== 个人信息数据 =====================
function getData() {
    let data = localStorage.getItem("userInfoList");
    return data ? JSON.parse(data) : [];
}

function setData(arr) {
    localStorage.setItem("userInfoList", JSON.stringify(arr));
}

// 保存信息（新增/编辑共用）
function saveInfo() {
    let editId = document.getElementById("editId").value;
    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let remark = document.getElementById("remark").value.trim();

    if(!name || !phone){
        alert("姓名、联系电话为必填项");
        return;
    }

    let list = getData();
    let info = {name,phone,email,remark};

    if(editId === ""){
        list.push(info);
    }else{
        list[Number(editId)] = info;
    }
    setData(list);
    alert("数据保存成功");
    window.location.href = "index.html";
}

// 删除数据
function delData(index) {
    if(!confirm("确定删除该条信息？此操作不可恢复！")) return;
    let list = getData();
    list.splice(index,1);
    setData(list);
    renderTable();
}

// 编辑数据（跳转到新增页面）
function editData(index) {
    let list = getData();
    let item = list[index];
    localStorage.setItem("editIndex",index);
    window.location.href = "add.html";
}

// ===================== 列表渲染 + 查询功能 =====================
function renderTable(keyword = "") {
    let list = getData();
    let tableBody = document.getElementById("tableBody");
    let emptyTip = document.getElementById("emptyTip");

    // 关键词查询 模糊匹配
    let filterList = list.filter(item => {
        return item.name.includes(keyword) || item.phone.includes(keyword) || item.email.includes(keyword);
    });

    if(filterList.length === 0){
        tableBody.innerHTML = "";
        emptyTip.style.display = "block";
        return;
    }
    emptyTip.style.display = "none";

    let html = "";
    filterList.forEach((item,idx)=>{
        html += `
        <tr>
            <td>${idx+1}</td>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>${item.email || "无"}</td>
            <td>${item.remark || "无"}</td>
            <td>
                <button class="btn btn-success" onclick="editData(${idx})">编辑</button>
                <button class="btn btn-danger" onclick="delData(${idx})">删除</button>
            </td>
        </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// 执行查询
function searchData() {
    let key = document.getElementById("searchKey").value.trim();
    renderTable(key);
}

// 清空查询
function clearSearch() {
    document.getElementById("searchKey").value = "";
    renderTable("");
}