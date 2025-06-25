document.addEventListener('DOMContentLoaded', () => {
  // Инициализация корзины из localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  updateCartDisplay();

  // Установка начального зеленого фона для баннера
  const headerBanner = document.getElementById('header-banner');
  headerBanner.style.backgroundImage = 'none';
  headerBanner.style.backgroundColor = '#6B8E23';

  // Скрываем все товары при загрузке страницы
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    product.style.display = 'none';

    // Инициализация контролов количества для каждого продукта
    const quantityControls = product.querySelector('.quantity-controls');
    if (quantityControls) {
      const minusBtn = quantityControls.querySelector('.minus');
      const plusBtn = quantityControls.querySelector('.plus');
      const quantityInput = quantityControls.querySelector('.quantity-value');

      minusBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
          quantityInput.value = value - 1;
          minusBtn.disabled = value - 1 <= 1;
        }
      });

      plusBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value < 99) {
          quantityInput.value = value + 1;
          minusBtn.disabled = false;
        }
        if (value + 1 >= 99) {
          plusBtn.disabled = true;
        }
      });

      quantityInput.addEventListener('change', (e) => {
        let value = parseInt(e.target.value);
        if (value < 1) {
          value = 1;
        } else if (value > 99) {
          value = 99;
        }
        e.target.value = value;
        minusBtn.disabled = value <= 1;
        plusBtn.disabled = value >= 99;
      });

      // Добавляем обработчик клавиши Backspace
      quantityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          const cursorPosition = e.target.selectionStart;
          const value = e.target.value;
          
          // Позволяем удалять цифры, только если это не приведет к пустому значению
          if (value.length > 1 || (value.length === 1 && !e.target.selectionEnd)) {
            return; // Разрешаем стандартное поведение
          }
          
          // Если удаление приведет к пустому значению, устанавливаем 1
          e.preventDefault();
          e.target.value = '1';
          e.target.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    }
  });

  // Обработчики корзины
  const cartButton = document.querySelector('.cart-trigger');
  const cartSidebar = document.querySelector('.cart-sidebar');
  const cartOverlay = document.querySelector('.cart-overlay');
  const closeCart = document.querySelector('.close-cart');

  function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartPanel() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartButton.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartPanel);
  cartOverlay.addEventListener('click', closeCartPanel);

  // Обработчик кнопок категорий
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Удаляем активный класс у всех кнопок
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      // Добавляем активный класс нажатой кнопке
      button.classList.add('active');

      // Получаем категорию из data-атрибута
      const category = button.dataset.category;
      const headerImage = button.dataset.image;

      // Обновляем фоновое изображение баннера
      headerBanner.style.backgroundColor = 'transparent';
      headerBanner.style.backgroundImage = `url(${headerImage})`;

      // Показываем товары выбранной категории
      const products = document.querySelectorAll('.product');
      products.forEach(product => {
        if (product.dataset.category === category) {
          product.style.display = 'flex';
        } else {
          product.style.display = 'none';
        }
      });
    });
  });

  // Обработчик кнопок "В корзину"
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const product = e.target.closest('.product');
      const name = product.querySelector('h3').textContent;
      const price = parseInt(product.querySelector('.price').textContent);
      const quantity = parseInt(product.querySelector('.quantity-value').value);
      
      addToCart(name, price, quantity);
    });
  });

  // Функция добавления товара в корзину
  function addToCart(name, price, quantity = 1) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= 99) {
        existingItem.quantity = newQuantity;
      }
    } else {
      cart.push({
        name: name,
        price: price,
        quantity: Math.min(quantity, 99)
      });
    }
    
    updateCart();
  }

  // Функция обновления отображения корзины
  function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItems || !totalPrice || !cartCount) return;

    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price * item.quantity}₽</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn minus" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
            <input type="number" class="quantity-value" value="${item.quantity}" min="1" max="99">
            <button class="quantity-btn plus" ${item.quantity >= 99 ? 'disabled' : ''}>+</button>
          </div>
          <button class="delete-item">×</button>
        </div>
      `;

      // Обработчики изменения количества
      const minusBtn = itemElement.querySelector('.minus');
      const plusBtn = itemElement.querySelector('.plus');
      const quantityInput = itemElement.querySelector('.quantity-value');
      const deleteBtn = itemElement.querySelector('.delete-item');

      quantityInput.addEventListener('input', () => {
        const newValue = parseInt(quantityInput.value) || 1;
        if (newValue > 0 && newValue <= 99) {
          item.quantity = newValue;
          updateCart();
        }
      });

      // Добавляем обработчики кнопок + и -
      plusBtn.addEventListener('click', () => {
        if (item.quantity < 99) {
          item.quantity++;
          updateCart();
        }
      });

      minusBtn.addEventListener('click', () => {
        if (item.quantity > 1) {
          item.quantity--;
          updateCart();
        }
      });

      deleteBtn.addEventListener('click', () => {
        cart.splice(index, 1);
        updateCart();
      });

      cartItems.appendChild(itemElement);
      
      total += item.price * item.quantity;
      count += item.quantity;
    });

    totalPrice.textContent = total;
    cartCount.textContent = count;

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Функция обновления корзины
  function updateCart() {
    updateCartDisplay();
  }

  // Обработчик кнопки оформления заказа
  const orderButton = document.getElementById('order-button');
  const orderFormElement = document.querySelector('.order-form');
  const orderFormOverlay = document.querySelector('.order-form-overlay');
  const closeOrderFormBtn = document.querySelector('.close-order-form');
  const orderItemsList = document.getElementById('order-items-list');
  const orderTotalPrice = document.getElementById('order-total-price');
  const orderForm = document.getElementById('order-form');

  function openOrderForm() {
    orderFormElement.classList.add('active');
    orderFormOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Заполняем список товаров
    orderItemsList.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'order-item';
      itemElement.innerHTML = `
        <span>${item.name}</span>
        <span>${item.quantity} × ${item.price}₽ = ${item.quantity * item.price}₽</span>
      `;
      orderItemsList.appendChild(itemElement);
      total += item.quantity * item.price;
    });
    
    orderTotalPrice.textContent = total;
  }

  function closeOrderForm() {
    orderFormElement.classList.remove('active');
    orderFormOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (orderButton) {
    orderButton.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Добавьте товары в корзину перед оформлением заказа');
        return;
      }
      openOrderForm();
    });
  }

  if (closeOrderFormBtn) {
    closeOrderFormBtn.addEventListener('click', closeOrderForm);
  }

  if (orderFormOverlay) {
    orderFormOverlay.addEventListener('click', closeOrderForm);
  }

  // Обработчик отправки формы заказа
  if (orderForm) {
    orderForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('order-name').value,
        phone: document.getElementById('order-phone').value,
        address: document.getElementById('order-address').value,
        persons: document.getElementById('order-persons').value,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: cart.reduce((sum, item) => sum + item.quantity * item.price, 0)
      };
      
      try {
        const response = await fetch('/submit_order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Спасибо за заказ! Мы свяжемся с вами в ближайшее время для подтверждения.');
          
          // Очищаем корзину
          cart = [];
          localStorage.removeItem('cart');
          updateCartDisplay();
          
          // Закрываем формы
          closeOrderForm();
          closeCartPanel();
        } else {
          alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.');
      }
    });
  }

  // Обработчик кнопки "Заказать звонок"
  const callRequestBtn = document.getElementById('call-request-btn');
  const callRequestForm = document.querySelector('.call-request-form');
  const callRequestOverlay = document.querySelector('.call-request-overlay');
  const closeFormBtn = document.querySelector('.close-form');
  const phoneInput = document.getElementById('phone');

  function openCallForm() {
    callRequestForm.classList.add('active');
    callRequestOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCallForm() {
    callRequestForm.classList.remove('active');
    callRequestOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Получаем элементы формы
  const callForm = document.getElementById('call-form');
  const submitButton = document.getElementById('submitButton');

  // Обработчик отправки формы
  callForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value
    };

    try {
      const response = await fetch('/submit_call_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        alert('Спасибо! Мы перезвоним вам в ближайшее время.');
        phoneInput.value = '';
        closeCallForm();
      } else {
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
    }
  });

  callRequestBtn.addEventListener('click', openCallForm);
  closeFormBtn.addEventListener('click', closeCallForm);
  callRequestOverlay.addEventListener('click', closeCallForm);
}); 


