function getSession() {
	try {
		return JSON.parse(localStorage.getItem('librarySession') || 'null')
	} catch {
		return null
	}
}

function setSession(session) {
	if (session) {
		localStorage.setItem('librarySession', JSON.stringify(session))
	} else {
		localStorage.removeItem('librarySession')
	}
}

function submitAuth(url, payload) {
	return $.ajax({
		url,
		method: 'POST',
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify(payload),
	})
}

$(function initializeAuthPage() {
	const loginForm = $('#login-form')
	const signupForm = $('#signup-form')
	const message = $('#auth-message')

	function showMessage(text, type = 'info') {
		if (!message.length) {
			return
		}

		message
			.removeClass('is-error is-success')
			.addClass(type === 'error' ? 'is-error' : 'is-success')
			.text(text)
	}

	if (loginForm.length) {
		loginForm.on('submit', function handleLogin(event) {
			event.preventDefault()
			const username = String($('#username').val() || '').trim()
			const password = String($('#password').val() || '')

			submitAuth('/api/login', { username, password })
				.done((payload) => {
					setSession(payload)
					window.location.href = '/'
				})
				.fail((xhr) => {
					showMessage(xhr.responseJSON?.error || 'Login failed.', 'error')
				})
		})
	}

	if (signupForm.length) {
		signupForm.on('submit', function handleSignup(event) {
			event.preventDefault()
			const username = String($('#username').val() || '').trim()
			const password = String($('#password').val() || '')
			const confirmPassword = String($('#confirm-password').val() || '')

			if (password !== confirmPassword) {
				showMessage('Passwords do not match.', 'error')
				return
			}

			submitAuth('/api/signup', { username, password })
				.done((payload) => {
					setSession(payload)
					window.location.href = '/'
				})
				.fail((xhr) => {
					showMessage(xhr.responseJSON?.error || 'Signup failed.', 'error')
				})
		})
	}

	const session = getSession()
	if (session?.token) {
		showMessage('You are already signed in.', 'success')
	}
})
