document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!email.includes('@gmail.com')) {
        errorMessage.textContent = 'Vui lòng nhập email Gmail hợp lệ';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    errorMessage.classList.add('hidden');
    document.getElementById('code-form').classList.remove('hidden');
});

document.getElementById('resend-code').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!email.includes('@gmail.com')) {
        errorMessage.textContent = 'Vui lòng nhập email Gmail hợp lệ';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    errorMessage.classList.add('hidden');
    alert('Mã xác thực đã được gửi lại!');
});

document.getElementById('verify-code').addEventListener('click', () => {
    const code = document.getElementById('code').value;
    const errorMessage = document.getElementById('error-message');
    
    if (code.length !== 6) {
        errorMessage.textContent = 'Mã code phải có 6 ký tự';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    errorMessage.classList.add('hidden');
    alert('Đăng nhập thành công!');
});
