// 引入Excel导出库CDN（在HTML中已引入，此处为逻辑）
/* global XLSX */

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

// ===================== 个人信息数据 字段更新 =====================
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
    let gender = document.getElementById("gender").value;
    let age = document.getElementById("age").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let idCard = document.getElementById("idCard").value.trim();
    let address = document.getElementById("address").value.trim();

    // 表单校验
    if(!name || !gender || !age || !phone || !idCard || !address){
        alert("所有字段均为必填项，请完整填写");
        return;
    }
    if(phone.length !== 11){
        alert("手机号必须为11位数字");
        return;
    }
    if(idCard.length !== 15 && idCard.length !== 18){
        alert("身份证号必须为15位或18位");
        return;
    }
    if(age < 1 || age > 150){
        alert("请输入合法的年龄");
        return;
    }

    let list = getData();
    let info = {name, gender, age, phone, idCard, address};

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

// ===================== 列表渲染 + 查询功能 优化 =====================
function renderTable(keyword = "") {
    let list = getData();
    let tableBody = document.getElementById("tableBody");
    let emptyTip = document.getElementById("emptyTip");
    let totalCount = document.getElementById("totalCount");

    // 关键词查询 模糊匹配 全字段
    let filterList = list.filter(item => {
        return item.name.includes(keyword) || 
               item.phone.includes(keyword) || 
               item.idCard.includes(keyword) ||
               item.address.includes(keyword);
    });

    // 更新总数
    totalCount.innerText = filterList.length;

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
            <td width="60">${idx+1}</td>
            <td width="100">${item.name}</td>
            <td width="60">${item.gender}</td>
            <td width="60">${item.age}</td>
            <td width="130">${item.phone}</td>
            <td width="180">${item.idCard}</td>
            <td>${item.address}</td>
            <td width="160">
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

// ===================== 新增Excel导出功能 核心 =====================
function exportToExcel() {
    let list = getData();
    if(list.length === 0){
        alert("暂无数据可导出");
        return;
    }

    // 构造Excel表头和数据
    let excelData = [
        ["序号", "姓名", "性别", "年龄", "手机号", "身份证号", "家庭住址"]
    ];

    list.forEach((item, idx) => {
        excelData.push([
            idx+1,
            item.name,
            item.gender,
            item.age,
            item.phone,
            item.idCard,
            item.address
        ]);
    });

    // 创建工作簿和工作表
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(excelData);

    // 设置列宽 适配内容
    let colWidths = [
        {wch: 6},  // 序号
        {wch: 10}, // 姓名
        {wch: 6},  // 性别
        {wch: 6},  // 年龄
        {wch: 13}, // 手机号
        {wch: 20}, // 身份证号
        {wch: 40}  // 家庭住址
    ];
    ws['!cols'] = colWidths;

    // 追加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "个人信息数据");

    // 导出文件
    XLSX.writeFile(wb, "个人信息管理系统数据.xlsx");
}