import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
};

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function() {  
  let r = Math.random();
  if (r < 0.5) {
    // 50% post
    const payload = JSON.stringify({ user_id: randomInt(1,2), amount: Math.random()*100, description: 'k6 load via nginx' });
    const res = http.post('http://localhost:8080/api/orders', payload, { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'created': (r) => r.status === 200 || r.status === 201 });
  } else if (r < 0.8) {
    // 30% get
    const res = http.get('http://localhost:8080/api/orders');
    check(res, { 'list ok': (r) => r.status === 200 });
  } else {
      // 20% Get specific user (simulating different read pattern)
      const userId = randomInt(1, 2);
      const res = http.get(`http://localhost:8080/api/users/${userId}`);
      check(res, { 'user found': (r) => r.status === 200 });
  }
  sleep(0.05);
}
