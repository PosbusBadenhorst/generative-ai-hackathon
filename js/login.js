const toggleLogin = document.querySelector('.title-login')
const toggleRegister = document.querySelector('.title-register')

const toggleLoginButton = toggleLogin.querySelector('button')
const toggleRegisterButton = toggleRegister.querySelector('button')

const formLogin = document.querySelector('.form.login')
const formRegister = document.querySelector('.form.register')

const setToLogin = () => {
    toggleLogin.classList.add('selected')
    toggleRegister.classList.remove('selected')
    formLogin.classList.remove('hidden')
    formRegister.classList.add('hidden')
}

const setToRegister = () => {
    toggleLogin.classList.remove('selected')
    toggleRegister.classList.add('selected')
    formLogin.classList.add('hidden')
    formRegister.classList.remove('hidden')
}

toggleLoginButton.onclick = setToLogin
toggleRegisterButton.onclick = setToRegister
