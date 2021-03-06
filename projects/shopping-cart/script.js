const endpointComputer = 'https://api.mercadolibre.com/sites/MLB/search?q=';
const endpointComputerItem = 'https://api.mercadolibre.com/items/';
const chaveLocalStorage = 'carrinho';

// Faz requisição para API buscando todos os computadores;
const requestAPIComputer = async (produto) => {
  const response = await fetch(`${endpointComputer}${produto}`);
  const data = await response.json();
  
  return data.results;
};

// Faz requisição para API buscando item computador;
const requestAPIItem = async (item) => {
  const response = await fetch(`${endpointComputerItem}${item}`);
  const data = await response.json();
  
  return data;
};

// Remove item do carrinho do LocalStorage;
const removeLocalStorage = async (item) => {
  // variável pega carrinho do Local Storage
  let carrinho = await JSON.parse(localStorage.getItem(chaveLocalStorage));
  if (carrinho !== null) {
    carrinho.forEach((element, index) => {
      if (element === item) {
        carrinho.splice(index, 1);
      }
    });
  } else {
    carrinho = [];
  }
  localStorage.setItem(chaveLocalStorage, JSON.stringify(carrinho));
};

// Subtrai item preço total;
const subPrice = async (price) => {
  const getSpanPrice = document.querySelector('.price');
  getSpanPrice.innerText = (parseFloat(getSpanPrice.innerText) - price).toFixed(2);
};

// Remove item do carrinho ao ser clicado;
async function cartItemClickListener(event) {
  const { id } = event.target.dataset;
  event.target.remove();
  removeLocalStorage(id);
  const item = await requestAPIItem(id);
  subPrice(item.price);
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.dataset.id = sku;
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

// Adiciona item do carrinho no local storage;
const addLocalStorage = async (item) => {
  let carrinho = await JSON.parse(localStorage.getItem(chaveLocalStorage));
  if (carrinho !== null) {
    carrinho.push(item);
  } else {
    carrinho = [item];
  }
  localStorage.setItem(chaveLocalStorage, JSON.stringify(carrinho));
};

// Soma preço total;
const sumPrice = async (price) => {
  const getSpanPrice = document.querySelector('.price');
  getSpanPrice.innerText = (parseFloat(getSpanPrice.innerText) + price);
};

// Adiciona item no carrinho ao clicar no botão 'Adicinar no carrinho';
const addCard = async (event) => {
  const id = event.target.parentNode;
  const dataItem = await requestAPIItem(id.dataset.id);
  const getOlCard = document.getElementsByClassName('cart__items');
  getOlCard[0].appendChild(createCartItemElement(dataItem));
  await addLocalStorage(id.dataset.id);
  sumPrice(dataItem.price);
};

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.dataset.id = sku;
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const button = createCustomElement('button', 'item__add', 'Adicionar ao Carrinho!');
  button.addEventListener('click', addCard);
  section.appendChild(button);

  return section;
}

// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }

// Imprime lista de itens com cards;
const createListItems = (data, section) => {
  data.forEach(async (product) => {
    const card = await createProductItemElement(product);
    section.appendChild(card);
  });
};

// Os itens do carrinho permanacem ao carregar a página;
const loadingCart = async () => {
  // variável pega carrinho do Local Storage
  const carrinho = await JSON.parse(localStorage.getItem(chaveLocalStorage));
  if (carrinho !== null) {
    const cars = carrinho.map((id) => requestAPIItem(id));
    await Promise.all(cars).then((itens) => {
      itens.forEach((item) => {
        const getOlLoading = document.querySelector('.cart__items');
        getOlLoading.appendChild(createCartItemElement(item));
      });
    });
  }
};

// O preço total permanace ao carregar a página;
const loadingCartPrice = async () => {
// variável pega carrinho do Local Storage
  const carrinho = await JSON.parse(localStorage.getItem(chaveLocalStorage));
  if (carrinho !== null) {
    const cars = carrinho.map((id) => requestAPIItem(id));
    await Promise.all(cars).then((itens) => {
      itens.forEach((item) => {
        const getPrice = document.querySelector('.price');
        const total = parseFloat(getPrice.innerText) + item.price;
        getPrice.innerText = total;
      });
    });
  }
};

// Limpa Local Storage ao clicar no botão "limpar carrinho"
const clearLocalStorage = () => {
  localStorage.removeItem(chaveLocalStorage);
};

// Limpa preço ao clicar no botão "limpar carrinho"
const clearPriceTotal = () => {
  const getTagPrice = document.querySelector('.price');
  getTagPrice.innerText = 0;
};

// Evento botão limpar carrinho
const clearCart = () => {
  const getButton = document.querySelector('.empty-cart');
  getButton.addEventListener('click', () => {
    const getOl = document.querySelector('.cart__items');
    while (getOl.firstChild) {
      getOl.removeChild(getOl.firstChild);
    }
    clearLocalStorage();
    clearPriceTotal();
  });
};

const loading = (option) => {
  const getClassItems = document.querySelector('.items');
    const getClassLoading = document.querySelector('.container-loading');
    const classItems = document.querySelector('.items');
  switch (option) {
    case 'inicio':
      getClassItems.style = 'display: none';
      break;
    case 'fim': 
      getClassLoading.remove();
      classItems.style = 'display: ';
      break;
    default:
      break;
  }
};

// Função principal
window.onload = async function onload() {
  loading('inicio');
  clearCart();
  const data = await requestAPIComputer('computador');
  loading('fim');
  const sectionItems = document.querySelector('.items');
  await createListItems(data, sectionItems);
  await loadingCart();
  await loadingCartPrice();
 };