const categoryList = document.getElementById("category-list");
const newCategoryButton = document.getElementById("category-add");
const categoryModal = document.getElementById("modal-category");
const saveCategoryButton = document.getElementById("save-category");
const cancelCategory = document.getElementById("cancel-category");
const categoryOverlay = document.getElementById("overlay");

const categoryPage = document.getElementById("category-page");
let actualCategoryPage = 1;

const categoryModalEdit = document.getElementById("modal-category-edit");
const saveCategoryButtonEdit = document.getElementById("save-category-edit");
const cancelCategoryEdit = document.getElementById("cancel-category-edit");

const searchCategory = document.getElementById("search-category");

let categoryId;
let categoryObjs = [];

loadCategories();

newCategoryButton?.addEventListener("click", categoryAdd);
saveCategoryButton?.addEventListener("click", saveCategoryFunction);
cancelCategory?.addEventListener("click", closeCategoryModal);

function categoryAdd() {
  categoryOverlay.style.display = "flex";
  categoryModal.style.display = "flex";
}

function saveCategoryFunction(categoryEdit) {
  let categoryName = document.getElementById("category-name").value;
  let color = document.getElementById("color").value;
  let icon = document.querySelector('input[name="icon"]:checked')?.dataset.id;

  if (!categoryName || !color || !icon) {
    return;
  }

  let category = createCategory(categoryName, color, icon);
  categoryObjs.push(category);

  clearCategoryForm();
  renderCategoryList(categoryObjs);
  closeCategoryModal();
  createCategoryPage(categoryObjs);
  saveCategoies();

  document.dispatchEvent(
    new CustomEvent("categoriesUpdated", { detail: categoryObjs }),
  );
}

function createCategory(name, color, icon) {
  return {
    id: Date.now(),
    description: name,
    color: color,
    icon: icon,
  };
}

function renderCategoryList(arrCategory) {
  if (!categoryList) return;
  const categoryListHtml = createCategoryHtml(arrCategory);
  categoryList.innerHTML = categoryListHtml;
  verifyCategorys(arrCategory);
}


function createCategoryHtml(arrCategory) {
  let htmlList = "";
  arrCategory.forEach((category) => {
    htmlList += `<div class="category">
              <h4>${category.description}</h4>
              <h4 class="category-style" style="background-color:${category.color}">${category.color}</h4>
            <i class="fa-solid ${category.icon}" ></i>
              <div>
                <button data-id="${category.id}" class="edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button data-id="${category.id}" class="delete"> <i class="fa-solid fa-trash"></i></button>
              </div>
            </div>`;
  });

  return htmlList;
}

function closeCategoryModal() {
  categoryOverlay.style.display = "none";
  categoryModal.style.display = "none";
}

function clearCategoryForm() {
  document.getElementById("category-name").value = "";
  document.getElementById("color").value = "";

  const selectedIcon = document.querySelector('input[name="icon"]:checked');
  if (selectedIcon) {
    selectedIcon.checked = false;
  }
}

//RENDER PAGE
function createCategoryPage(arrCategorys) {
  if (!categoryPage) return;
  let categoryPerPage = countCategoryPage();
  let qtdPage = Math.max(1, Math.ceil(arrCategorys.length / categoryPerPage));
  if (actualCategoryPage > qtdPage) {
    actualCategoryPage = qtdPage;
  }
  createCategoryPageButton(qtdPage, arrCategorys);
}

function createCategoryPageButton(qtdPage, arrCategorys) {
  if (!categoryPage) return;
  categoryPage.innerHTML = "";
  if (arrCategorys.length > 0) {
    for (let i = 1; i <= qtdPage; i++) {
      categoryPage.innerHTML += `<button data-page="${i}">${i}</button>`;
    }
    let pageCategoryButton = [
      ...document.querySelectorAll("#category-page button"),
    ];
    pageCategoryButton.forEach((b) => {
      b.addEventListener("click", () => {
        actualCategoryPage = Number(b.dataset.page);
        renderCategoryPage(actualCategoryPage, arrCategorys);
      });
    });
    renderCategoryPage(actualCategoryPage, arrCategorys);
  }
}

function renderCategoryPage(page, arrCategorys) {
  let categoryPerPage = countCategoryPage();

  let startSlice = (page - 1) * categoryPerPage;
  let finalSlice = startSlice + categoryPerPage;

  renderCategoryList(arrCategorys.slice(startSlice, finalSlice));
}

function countCategoryPage() {
  let height = screen.height;
  if (height <= 800) {
    return 7;
  } else if (height <= 1200) {
    return 9;
  } else return 12;
}

//EDIT BUTTONS
document.addEventListener("click", (b) => {
  const editButton = b.target.closest(".edit");
  const deleteButton = b.target.closest(".delete");

  if (editButton && editButton.closest("#category-list")) {
    categoryOverlay.style.display = "flex";
    categoryModalEdit.style.display = "flex";
    categoryId = Number(editButton.dataset.id);
    let categoryEdit = categoryObjs.find((c) => c.id === categoryId);
    saveCategoryButtonEdit.addEventListener("click", () => {
      editCategoryFunction(categoryEdit);
    });

    cancelCategoryEdit.addEventListener("click", () => {
      categoryOverlay.style.display = "none";
      categoryModalEdit.style.display = "none";
    });
  } else if (deleteButton && deleteButton.closest("#category-list")) {
    categoryId = Number(deleteButton.dataset.id);
    let categoryDelete = categoryObjs.findIndex((c) => c.id === categoryId);
    categoryObjs.splice(categoryDelete, 1);

    saveCategoies();
    renderCategoryList(categoryObjs);
    createCategoryPage(categoryObjs);
    filterFunction();
  }
});

function editCategoryFunction(categoryEdit) {
  let categoryName = document.getElementById("category-name-edit").value;
  let color = document.getElementById("color-edit").value;
  let icon = document.querySelector('input[name="icon-edit"]:checked')?.dataset
    .id;

  categoryEdit.description = categoryName || categoryEdit.description;
  categoryEdit.color = color || categoryEdit.color;
  categoryEdit.icon = icon || categoryEdit.icon;

  categoryOverlay.style.display = "none";
  categoryModalEdit.style.display = "none";

  saveCategoies();
  renderCategoryList(categoryObjs);
  createCategoryPage(categoryObjs);
  filterFunction();
}

function verifyCategorys(arrCategory) {
  if (arrCategory.length === 0) {
    categoryList.innerHTML = `<p>Nenhuma categoria encontrada</p>`;
    categoryList.style.display = "flex";
  } else {
    categoryList.style.display = "block";
  }
}

//FILTER
searchCategory?.addEventListener("input", filterFunction);

function filterFunction() {
  const text = searchCategory.value.toLowerCase();
  if (text === "") {
    renderCategoryList(categoryObjs);
    createCategoryPage(categoryObjs);
  }
  let filtred = categoryObjs.filter((c) =>
    c.description.toLowerCase().startsWith(text),
  );
  renderCategoryList(filtred);
  createCategoryPage(filtred);
}

//LOCAL STORAGE

window.addEventListener("storage", (e) => {
  if (e.key === "categories" && categoryList) {
    categoryObjs = getCategoriesFromStorage();

    if (searchCategory && searchCategory.value !== "") {
      filterFunction();
    } else {
      renderCategoryList(categoryObjs);
      createCategoryPage(categoryObjs);
    }
  }
});

function getCategoriesFromStorage() {
  const saved = localStorage.getItem("categories");
  return saved ? JSON.parse(saved) : [];
}

function saveCategoies() {
  localStorage.setItem("categories", JSON.stringify(categoryObjs));
}

function loadCategories() {
  const saveCategorys = localStorage.getItem("categories");
  if (!saveCategorys) {
    return;
  }
  categoryObjs.push(...JSON.parse(saveCategorys));
  renderCategoryList(categoryObjs);
  createCategoryPage(categoryObjs);
}
