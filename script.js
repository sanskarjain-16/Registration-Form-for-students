const API = 'http://localhost:3000/submit';

const rules = {
  name:         { el: 'name',         err: 'nameErr',    test: v => v.trim().length >= 2,                     msg: 'Please enter a valid full name.' },
  studentClass: { el: 'studentClass', err: 'classErr',   test: v => v.trim().length >= 1,                     msg: 'Class is required.' },
  age:          { el: 'age',          err: 'ageErr',     test: v => +v >= 3 && +v <= 25 && v !== '',          msg: 'Age must be between 3 and 25.' },
  subject:      { el: 'subject',      err: 'subjectErr', test: v => v !== '',                                  msg: 'Please select a subject.' },
  email:        { el: 'email',        err: 'emailErr',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),    msg: 'Enter a valid email address.' },
};

function validate() {
  let valid = true;
  for (const [, r] of Object.entries(rules)) {
    const el  = document.getElementById(r.el);
    const err = document.getElementById(r.err);
    if (!r.test(el.value)) {
      err.textContent = r.msg;
      el.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      el.classList.remove('error');
    }
  }
  return valid;
}

// Live clear on input
for (const [, r] of Object.entries(rules)) {
  document.getElementById(r.el).addEventListener('input', () => {
    document.getElementById(r.err).textContent = '';
    document.getElementById(r.el).classList.remove('error');
  });
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

document.getElementById('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  const payload = {
    name:    document.getElementById('name').value.trim(),
    class:   document.getElementById('studentClass').value.trim(),
    subject: document.getElementById('subject').value,
    age:     parseInt(document.getElementById('age').value),
    email:   document.getElementById('email').value.trim(),
  };

  try {
    const res  = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      showToast('✓ Registration successful!', 'success');
      document.getElementById('regForm').reset();
    } else {
      showToast(data.error || 'Something went wrong.', 'fail');
    }
  } catch {
    showToast('Cannot reach server. Is it running?', 'fail');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Register Student';
  }
});
