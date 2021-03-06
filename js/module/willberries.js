//cart
const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const showAll = document.querySelectorAll('.show-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.show-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const showAcsessories = document.querySelectorAll('.show-acsessories');
const showClothing = document.querySelectorAll('.show-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.card-table__total');
const cartClearBtn = document.querySelector('.cart-clear');
const cartCount = document.querySelector('.cart-count');

const getGoods = async () => {
  const result = await fetch('db/db.json');
  if (!result.ok) {
    throw 'Error ' + result.status
  }
  return await result.json();
};

const cart = {
  cartGoods: [{
      id: '099',
      name: 'Watch Dior',
      price: 999,
      count: 2,
    },
    {
      id: '090',
      name: 'Shoes',
      price: 500,
      count: 3,
    }
  ],
  countQuantity() {
    cartCount.textContent = this.cartGoods.reduce((sum, item) => {
      return sum + item.count;
    }, 0);
  },
  renderCart() {
    cartTableGoods.textContent = '';
    this.cartGoods.forEach(({
      id,
      name,
      price,
      count
    }) => {
      const trGood = document.createElement('tr');
      trGood.className = 'cart-item';
      trGood.dataset.id = id;
      trGood.innerHTML = `
			      <td>${name}</td>
						<td>${price}$</td>
						<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
						<td>${count}</td>
						<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
						<td>${price * count}$</td>
						<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
      cartTableGoods.append(trGood);
    });
    const totalPrice = this.cartGoods.reduce((sum, item) => {
      return sum + (item.price * item.count);
    }, 0);
    cartTableTotal.textContent = totalPrice + '$';
  },
  deleteGood(id) {
    this.cartGoods = this.cartGoods.filter(item => id !== item.id);
    this.renderCart();
    this.countQuantity();
  },
  minusGood(id) {
    for (const item of this.cartGoods) {
      if (item.id === id) {
        if (item.count <= 1) {
          this.deleteGood(id);
        } else {
          item.count--;
        }
        break;
      }
    }
    this.renderCart();
    this.countQuantity();
  },
  plusGood(id) {
    for (const item of this.cartGoods) {
      if (item.id === id) {
        item.count++;
        break;
      }
    }
    this.renderCart();
    this.countQuantity();
  },
  addCartGoods(id) {
    const goodItem = this.cartGoods.find(item => item.id === id);
    if (goodItem) {
      this.plusGood(id);
    } else {
      getGoods()
        .then(data => data.find(item => item.id === id))
        .then(({
          id,
          name,
          price
        }) => {
          this.cartGoods.push({
            id,
            name,
            price,
            count: 1
          });
          cart.countQuantity();
        });
    }
  },
  clearCart() {
    this.cartGoods.length = 0;
    this.countQuantity();
    this.renderCart();
  }
};

cart.countQuantity();

document.body.addEventListener('click', e => {
  const addToCart = e.target.closest('.add-to-cart');
  if (addToCart) {
    cart.addCartGoods(addToCart.dataset.id);
  }
});

cartClearBtn.addEventListener('click', cart.clearCart.bind(cart));

cartTableGoods.addEventListener('click', e => {
  const target = e.target;
  if (target.classList.contains('cart-btn-delete')) {
    // cart.deleteGood(target.dataset.id);
    const id = target.closest('.cart-item').dataset.id;
    cart.deleteGood(id);
  }
  if (target.classList.contains('cart-btn-minus')) {
    const id = target.closest('.cart-item').dataset.id;
    cart.minusGood(id);
  }
  if (target.classList.contains('cart-btn-plus')) {
    const id = target.closest('.cart-item').dataset.id;
    cart.plusGood(id);
  }
})

const openModal = () => {
  cart.renderCart();
  modalCart.classList.add('show');
};

const closeModal = () => {
  modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);

modalCart.addEventListener('click', e => {
  const target = e.target;
  if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
    closeModal();
  }
});



//goods

const createCard = function ({
  label,
  name,
  img,
  description,
  id,
  price
}) {
  const card = document.createElement('div');
  card.className = 'col-lg-3 col-sm-6';

  card.innerHTML = `
				<div class="goods-card">
				${label ? `<span class="label">${label}</span>` : ''}
					<img src="db/${img}" alt="${name}" class="goods-image">
					<h3 class="goods-title">${name}</h3>
					<p class="goods-description">${description}</p>
					<button class="button goods-card-btn add-to-cart" data-id=${id}>
						<span class="button-price">$${price}</span>
					</button>
				</div>
	`;
  return card;
};

const renderCards = function (data) {
  longGoodsList.textContent = '';
  const cards = data.map(createCard);
  longGoodsList.append(...cards);

  document.body.classList.add('show-goods');
};
const showAllFunc = (e) => {
  e.preventDefault();
  getGoods().then(renderCards);
}

showAll.forEach(function (elem) {
  elem.addEventListener('click', showAllFunc);
})



const filterCards = function (field, value) {
  getGoods().then(data => data.filter(good => good[field] === value))
    .then(renderCards);
};

showAcsessories.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    filterCards('category', 'Accessories');
  });
})

showClothing.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    filterCards('category', 'Clothing');
  });
})

navigationLink.forEach(function (link) {
  link.addEventListener('click', e => {
    e.preventDefault();
    const field = link.dataset.field;
    const value = link.textContent;
    filterCards(field, value);
  });
});

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
  method: 'POST',
  body: dataUser,
});

modalForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(modalForm);
  formData.append('cart', JSON.stringify(cart.cartGoods));
  postData(formData)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      alert("Your order was successfully sent. We will contact you soon!");
    })
    .catch(error => {
      alert('Unforfunately there is error, please fill again form');
      console.log(error);
    })
    .finally(() => {
      closeModal();
      modalForm.reset();
      cart.cartGoods.length = 0;
      cart.clearCart();
    })
});