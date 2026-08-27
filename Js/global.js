"use strict";

const addTransaction = document.querySelectorAll(".action-button")[0];
const inputsTransaction = document.getElementsByClassName("inputsTransaction");
const transactionList = document.getElementById("transaction-list");
const resumeList = [...document.querySelectorAll("#resume h3")];

const overlay = document.getElementById("overlay");

const newCategory = document.getElementById("new-category");

const modalEdit = document.getElementById("modal-edit");
const saveEdit = document.getElementById("save-edit");
const cancelEdit = document.getElementById("cancel-edit");
let id;

const searchFilter = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");
const dateFilter = document.getElementsByClassName("date-filter");
const filterClear = document.getElementById("filter-clear");

const expenseCategory = document.getElementById("expense-category");
const expenseList = document.getElementById("expense-list");
const expenseListTitle = document.getElementById("category-arrow");
let categoryPageGlobal = 0;
const categoryPerPage = 5;
let currentCategoryInfo = [];
expenseListTitle.addEventListener("click", (e) => {
  if (e.target.closest(".arrow-right")) {
    categoryPageGlobal++;
    renderCategoryHtmlPage(currentCategoryInfo);
  }

  if (e.target.closest(".arrow-left")) {
    categoryPageGlobal--;
    renderCategoryHtmlPage(currentCategoryInfo);
  }
});

const transactionsFoundP = document.querySelector(
  "#transaction-history-title p",
);
const pageButtonDiv = document.getElementById("page");

const transactionObjs = [];
let transactionFiltred = [];
let actualPage = 1;

loadTransactions();

// CREATE TRANSACTION FUNCTION
addTransaction.addEventListener("click", () => {
  let radioCheck = document.querySelector(
    'input[name="revenue-expense"]:checked',
  );

  if (
    !radioCheck.id ||
    !inputsTransaction[0].value ||
    !inputsTransaction[1].value ||
    !inputsTransaction[2].value ||
    !inputsTransaction[3].value
  ) {
    return;
  }

  const transaction = createTransactionObj(
    radioCheck.id,
    inputsTransaction[0].value,
    inputsTransaction[1].value,
    inputsTransaction[2].value,
    inputsTransaction[3].value,
  );

  radioCheck.checked = false;
  inputsTransaction[0].value = "";
  inputsTransaction[1].value = "";
  inputsTransaction[2].value = "";

  transactionObjs.push(transaction);
  renderTransactionList(transactionObjs);
  renderResume(transactionObjs);
  transactionPages(transactionObjs);
  verifyTransactions(transactionObjs);
  calcCategoryValue(transactionObjs);
});

function createTransactionObj(type, name, category, value, date) {
  return {
    id: Date.now(),
    type: type,
    description: name,
    category: category,
    value: value,
    date: date,
  };
}

// RENDER TRANSACTION LIST
function renderTransactionList(arrTransactions) {
  const transactionListHtml = createHtmlList(arrTransactions);
  transactionList.innerHTML = transactionListHtml;

  saveTransactions();
}

function createHtmlList(arrTransactions) {
  let htmlList = "";

  arrTransactions.forEach((transaction) => {
    let categoryColor = categoryObjs.find(
      (c) => c.description === transaction.category,
    ).color;

    htmlList += `<div class="transaction">
                <h4>${transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1)}</h4>
                <h4 class="category-style" style="background-color:${categoryColor}" >${transaction.category}</h4>
                <h4>${transaction.type}</h4>
                <h4>${transaction.value}R$</h4>
                <h4>${transaction.date.split("-").reverse().join("/")}</h4>
                <div>
                  <button class="edit" data-id="${transaction.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="delete"data-id="${transaction.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>`;
  });

  return htmlList;
}

// RENDER RESUME
function renderResume(arrTransactions) {
  let sumRevenue = 0;
  let sumExpense = 0;
  resumeList[1].innerHTML = "0R$";
  resumeList[2].innerHTML = "0R$";

  arrTransactions.filter((t) => {
    if (t.type.toLowerCase() === "receita") {
      sumRevenue += parseFloat(t.value);
      resumeList[1].innerHTML = sumRevenue + "R$";
    } else if (t.type.toLowerCase() === "despesa") {
      sumExpense += parseFloat(t.value);
      resumeList[2].innerHTML = sumExpense + "R$";
    }
  });

  resumeList[3].innerHTML = sumRevenue - sumExpense + "R$";
  transactionsFoundP.innerHTML = `${arrTransactions.length} transações encontradas`;
  saveTransactions();
}

// RENDER TRANSACTIONS PAGES
function transactionPages(arrTransactions) {
  let itensPerPage = countTransactions();
  let qtdPage = Math.max(1, Math.ceil(arrTransactions.length / itensPerPage));
  if (actualPage > qtdPage) {
    actualPage = qtdPage;
  }
  createPageButton(qtdPage, arrTransactions);
  verifyTransactions(arrTransactions);
}

function countTransactions() {
  const height = screen.height;
  if (height <= 800) {
    return 5;
  } else if (height <= 1200) {
    return 9;
  } else return 12;
}

function createPageButton(page, arrTransactions) {
  pageButtonDiv.innerHTML = "";

  if (arrTransactions.length > 0) {
    for (let i = 1; i <= page; i++) {
      pageButtonDiv.innerHTML += `<button data-page="${i}">${i}</button>`;
    }

    const pagebutton = [...document.querySelectorAll("#page button")];
    pagebutton.forEach((b) => {
      b.addEventListener("click", () => {
        actualPage = Number(event.target.dataset.page);
        renderPage(actualPage, arrTransactions);
      });
    });

    renderPage(actualPage, arrTransactions);
  }
}

function renderPage(page, arrTransactions) {
  let itensPerPage = countTransactions();
  const sliceStart = (page - 1) * itensPerPage;
  const sliceEnd = sliceStart + itensPerPage;
  renderTransactionList(arrTransactions.slice(sliceStart, sliceEnd));
}

//RENDER CATEGORY PAGE
function calcCategoryValue(arrTransactions) {
  const total = arrTransactions.reduce((acc, t) => {
    if (t.type.toLowerCase() === "despesa") {
      acc += Number(t.value);
    }
    return acc;
  }, 0);

  const totalPerCategory = arrTransactions.reduce((acc, t) => {
    if (t.type.toLowerCase() === "despesa") {
      let category = t.category;
      
      if (!acc[category]) {
        acc[category] = 0;
      }

      acc[category] += Number(t.value);
    }
    return acc;
  }, {});

  const categoryInfo = Object.entries(totalPerCategory).map(
    ([category, value]) => {
      const percent = parseInt((value / total) * 100);
      return { category: category, percent: percent, totalValue: value };
    },
  );

  categoryInfo.sort((a, b) => b.totalValue - a.totalValue);
  categoryPageGlobal = 0;
  renderCategoryHtmlPage(categoryInfo);
}

function renderCategoryHtmlPage(categoryInfo) {
  if (categoryInfo.length === 0) {
    expenseCategory.style.display = "none";
  } else {
    expenseCategory.style.display = "flex";
  }

  currentCategoryInfo = categoryInfo;
  expenseList.innerHTML = "";

  const start = categoryPageGlobal * categoryPerPage;
  const end = start + categoryPerPage;

  const categoriesToRender = categoryInfo.slice(start, end);

  categoriesToRender.forEach((c) => {
    let category = categoryObjs.find(
      (category) => category.description === c.category,
    );

    expenseList.innerHTML += `
      <div class="icon expense-card">
        <i style="background-color:${category.color}" class="fa-solid ${category.icon} category-icon"></i>
        <div>
          <h5>${c.category.charAt(0).toUpperCase() + c.category.slice(1)}</h5>
          <div class="expense-category-info">
            <p>${c.totalValue}R$</p>
            <p>${c.percent}%</p>
          </div>
        </div>
      </div>
    `;
  });

  document
    .querySelectorAll(".arrow-right, .arrow-left")
    .forEach((el) => el.remove());

  if (categoryPageGlobal > 0) {
    let leftIcon = document.createElement("i");
    leftIcon.classList.add("fa-solid", "fa-caret-left", "arrow-left");

    expenseListTitle.appendChild(leftIcon);
  }

  if (end < categoryInfo.length) {
    let rightIcon = document.createElement("i");
    rightIcon.classList.add("fa-solid", "fa-caret-right", "arrow-right");

    expenseListTitle.appendChild(rightIcon);
  }

  if (window.FontAwesome) {
    window.FontAwesome.dom.i2svg();
  }
}

// EDIT BUTTONS
document.addEventListener("click", (b) => {
  const editButton = b.target.closest(".edit");
  const deleteButton = b.target.closest(".delete");

  if (editButton && editButton.closest("#transaction-list")) {
    overlay.style.display = "flex";
    modalEdit.style.display = "flex";
    id = Number(editButton.dataset.id);

    saveEdit.addEventListener("click", () => {
      let inputsTransactionEdit = document.getElementsByClassName(
        "inputsTransaction-edit",
      );
      let radioCheckEdit = document.querySelector(
        'input[name="revenue-expense-edit"]:checked',
      );
      let transactionEdit = transactionObjs.find((t) => t.id === id);

      transactionEdit.type = radioCheckEdit?.id || transactionEdit.type;
      transactionEdit.description =
        inputsTransactionEdit[0].value || transactionEdit.description;
      transactionEdit.category =
        inputsTransactionEdit[1].value || transactionEdit.category;
      transactionEdit.value =
        inputsTransactionEdit[2].value || transactionEdit.value;
      transactionEdit.date =
        inputsTransactionEdit[3].value || transactionEdit.date;

      overlay.style.display = "none";
      modalEdit.style.display = "none";

      if (isFilterActive()) {
        apllyFilter();
      } else {
        transactionPages(transactionObjs);
        renderResume(transactionObjs);
        calcCategoryValue(transactionObjs);
      }
    });

    cancelEdit.addEventListener("click", () => {
      overlay.style.display = "none";
      modalEdit.style.display = "none";
    });
  } else if (deleteButton && deleteButton.closest("#transaction-list")) {
    id = Number(deleteButton.dataset.id);
    let transactionDelete = transactionObjs.findIndex((t) => t.id === id);
    transactionObjs.splice(transactionDelete, 1);

    if (isFilterActive()) {
      apllyFilter();
    } else {
      renderResume(transactionObjs);
      transactionPages(transactionObjs);
      calcCategoryValue(transactionObjs);
    }
  }
});

//NEW CATEGORY
let categorys = [...document.querySelectorAll(".categorys")];

newCategory.addEventListener("click", categoryAdd);
document.addEventListener("categoriesUpdated", (e) => {
  renderSelect(e.detail);
});

renderSelect(getCategoriesFromStorage());

window.addEventListener("storage", (e) => {
  if (e.key === "categories") {
    renderSelect(getCategoriesFromStorage());
  }
});

function getCategoriesFromStorage() {
  const saved = localStorage.getItem("categories");
  return saved ? JSON.parse(saved) : [];
}

function renderSelect(arrCategory) {
  categorys.forEach((e) => {
    e.innerHTML = "";

    let defaultOp = document.createElement("option");
    defaultOp.value = "";
    defaultOp.disabled = true;
    defaultOp.selected = true;
    defaultOp.hidden = true;
    defaultOp.innerText = "Categoria";
    e.appendChild(defaultOp);

    arrCategory.forEach((category) => {
      let categoryOp = document.createElement("option");
      categoryOp.dataset.id = category.id;
      categoryOp.value = category.description;
      categoryOp.innerText =
        category.description.charAt(0).toUpperCase() +
        category.description.slice(1);
      e.appendChild(categoryOp);
    });
  });
}

// FILTERS
searchFilter.addEventListener("input", apllyFilter);
searchButton.addEventListener("click", apllyFilter);

function isFilterActive() {
  return (
    searchFilter.value !== "" ||
    typeFilter.value !== "" ||
    categoryFilter.value !== "" ||
    dateFilter[0].value !== "" ||
    dateFilter[1].value !== ""
  );
}

function apllyFilter() {
  const text = searchFilter.value.toLowerCase();
  const startDate = dateFilter[0].value;
  const endDate = dateFilter[1].value;
  transactionFiltred = transactionObjs.filter((t) => {
    return (
      (text === "" || t.description.toLowerCase().startsWith(text)) &&
      (typeFilter.value === "" || t.type === typeFilter.value) &&
      (categoryFilter.value === "" || t.category === categoryFilter.value) &&
      ((startDate === "" && endDate === "") ||
        (startDate !== "" && endDate === "" && t.date >= startDate) ||
        (startDate === "" && endDate !== "" && t.date <= endDate) ||
        (startDate !== "" &&
          endDate !== "" &&
          t.date >= startDate &&
          t.date <= endDate))
    );
  });
  transactionPages(transactionFiltred);
  renderResume(transactionFiltred);
  verifyTransactions(transactionFiltred);
}

filterClear.addEventListener(
  "click",
  () => transactionPages(transactionObjs),
  renderResume(transactionObjs),
);

function verifyTransactions(arrTransactions) {
  if (arrTransactions.length === 0) {
    transactionList.innerHTML = `<p>Nenhuma transação encontrada</p>`;
    transactionList.style.display = "flex";
  } else {
    transactionList.style.display = "block";
  }
}

// LOCAL STORAGE
function saveTransactions() {
  localStorage.setItem("transactionObjs", JSON.stringify(transactionObjs));
}

function loadTransactions() {
  const saveTransactions = localStorage.getItem("transactionObjs");
  if (!saveTransactions) {
    return;
  }
  transactionObjs.push(...JSON.parse(saveTransactions));
  renderResume(transactionObjs);
  transactionPages(transactionObjs);
  calcCategoryValue(transactionObjs);
}
