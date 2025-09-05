export const imageData = [
  require('../assets/products/1.png'),
  require('../assets/products/2.png'),
  require('../assets/products/3.png'),
  require('../assets/products/4.png'),
  require('../assets/products/5.png'),
  require('../assets/products/6.png'),
  require('../assets/products/7.png'),
  require('../assets/products/8.png'),
  require('../assets/products/9.png'),
  require('../assets/products/10.png'),
  require('../assets/products/11.png'),
  require('../assets/products/12.png'),
  require('../assets/products/13.png'),
  require('../assets/products/14.png'),
  require('../assets/products/15.png'),
  require('../assets/products/16.png'),
];

export const wavyData =
  'M 0 2000 0 500 Q 62.5 280 125 500 t 125 0 125 0 125 0 125 0 125 0 125 0 125 0 125 0 125 0 125 0   125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0  125 0 125 0 125 0 v1000 z';

export const orders = [
  {
    orderId: 'ORDER21312',
    items: [
      {id: 'a', item: {name: 'Milk'}, count: 2},
      {id: 'b', item: {name: 'Tea'}, count: 1},
    ],
    totalPrice: 25.0,
    createdAt: '2024-08-10T10:00:00Z',
    status: 'delivered',
  },
  {
    orderId: 'ORDER21212',
    items: [
      {id: 'c', item: 'Burger', count: 1},
      {id: 'd', item: 'Fries', count: 3},
    ],
    totalPrice: 15.0,
    createdAt: '2024-08-11T11:30:00Z',
    status: 'available',
  },
];
