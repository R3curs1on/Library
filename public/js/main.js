const appState = {
	session: null,
}

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
		appState.session = session
	} else {
		localStorage.removeItem('librarySession')
		appState.session = null
	}
}

function isAdmin() {
	return appState.session?.user?.role === 'admin'
}

function escapeHtml(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function parseSessionPayload(payload) {
	if (payload?.user && payload?.token) {
		return payload
	}

	const stored = getSession()
	return stored?.token ? stored : null
}

async function refreshSession() {
	const stored = getSession()
	if (!stored?.token) {
		appState.session = null
		return null
	}

	try {
		const response = await $.ajax({
			url: '/api/session',
			method: 'GET',
			dataType: 'json',
			headers: {
				Authorization: `Bearer ${stored.token}`,
			},
		})
		appState.session = {
			...stored,
			user: response.user,
		}
		setSession(appState.session)
		return appState.session
	} catch {
		setSession(null)
		return null
	}
}

function renderBookCard(book) {
	const image = book.img || 'https://placehold.co/300x420?text=No+Image'
	const tags = Array.isArray(book.Tags) ? book.Tags.slice(0, 3) : []

	return `
		<article class="book-card" data-book-id="${escapeHtml(book.id)}">
			<div class="image-container">
				<img class="book-cover" src="/${encodeURI(image.replace(/^\//, ''))}" alt="${escapeHtml(book.Name)}">
			</div>
			<div class="book-body">
				<h3 class="book-title">${escapeHtml(book.Name)}</h3>
				<p class="book-author">by ${escapeHtml(book.Author)}</p>
				<div class="book-badges">
					<span class="badge">${escapeHtml(book.Category || 'Unknown')}</span>
					<span class="badge">★ ${escapeHtml(book.Rating || 0)}</span>
					<span class="badge">${escapeHtml(book.AvailableCopies || 0)} available</span>
				</div>
				<p class="book-detail">Publisher: ${escapeHtml(book.Publisher || 'Unknown')}</p>
				<p class="book-description">${escapeHtml(book.Description || '')}</p>
				<div class="book-badges">
					${tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join('')}
				</div>
				<div class="book-admin-actions"></div>
			</div>
		</article>
	`
}

function updateAuthUI() {
	const session = getSession()
	const loggedIn = Boolean(session?.token)

	$('[data-auth="login"]').toggleClass('is-hidden', loggedIn)
	$('[data-auth="logout"]').toggleClass('is-hidden', !loggedIn)
	$('[data-auth="user"]').toggleClass('is-hidden', !loggedIn).text(
		loggedIn ? `Signed in as ${session.user?.username || 'member'}` : '',
	)
}

function apiRequest(url, options = {}) {
	const session = appState.session || getSession()
	const ajaxOptions = {
		url,
		method: options.method || 'GET',
		data: options.data || undefined,
		contentType: options.contentType,
		dataType: 'json',
		headers: {
			...(options.headers || {}),
		},
	}

	if (session?.token) {
		ajaxOptions.headers.Authorization = `Bearer ${session.token}`
	}

	return $.ajax(ajaxOptions)
}

function toggleCatalogSection(show) {
	const catalog = $('#catalog-section')
	if (!catalog.length) {
		return
	}
	catalog.toggleClass('is-hidden', !show)
}

function renderAdminDeleteButton(bookId) {
	return `<button class="delete-button js-delete-book" type="button" data-book-id="${escapeHtml(bookId)}">Delete</button>`
}

function decorateAdminControls() {
	const adminPanel = $('#admin-book-panel')
	adminPanel.toggleClass('is-hidden', !isAdmin())

	$('.book-card[data-book-id]').each(function decorateCard() {
		const card = $(this)
		const actions = card.find('.book-admin-actions')
		if (!actions.length) {
			return
		}
		actions.empty()
		if (isAdmin()) {
			actions.append(renderAdminDeleteButton(card.data('book-id')))
		}
	})
}

function bindAdminBookForm() {
	const form = $('#admin-book-form')
	if (!form.length) {
		return
	}

	form.on('submit', function handleAddBook(event) {
		event.preventDefault()
		if (!isAdmin()) {
			window.alert('Admin access required.')
			return
		}

		const payload = Object.fromEntries(new FormData(this).entries())
		payload.Tags = String(payload.Tags || '')
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)

		apiRequest('/api/books', {
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ book: payload }),
		})
			.done(() => {
				window.location.reload()
			})
			.fail((xhr) => {
				window.alert(xhr.responseJSON?.error || 'Could not add book.')
			})
	})
}

function bindDeleteButtons() {
	$(document).on('click', '.js-delete-book', function handleDeleteBook() {
		if (!isAdmin()) {
			window.alert('Admin access required.')
			return
		}

		const bookId = $(this).data('book-id')
		if (!bookId || !window.confirm('Delete this book?')) {
			return
		}

		apiRequest(`/api/books/${encodeURIComponent(bookId)}`, { method: 'DELETE' })
			.done(() => {
				window.location.reload()
			})
			.fail((xhr) => {
				window.alert(xhr.responseJSON?.error || 'Could not delete book.')
			})
	})
}

function renderSearchResults(payload) {
	const container = $('#search-results')
	if (!container.length) {
		return
	}

	const results = payload?.results || []
	const suggestions = payload?.suggestions || []

	if (!results.length) {
		toggleCatalogSection(false)
		container.html(`
			<div class="search-results-panel">
				<p class="text">No books matched your search.</p>
			</div>
		`)
		return
	}

	toggleCatalogSection(false)

	container.html(`
		<div class="search-results-panel">
			<div class="filter-header">
				<h2 class="section-title">Search results</h2>
				<p class="filter-count">${results.length} result(s)</p>
			</div>
			${suggestions.length ? `<div class="suggestions-row">${suggestions.map((item) => `<button class="suggestion-chip" type="button" data-suggestion="${String(item.label).replace(/"/g, '&quot;')}">${String(item.label).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</button>`).join('')}</div>` : ''}
			<div class="books">${results.map(renderBookCard).join('')}</div>
		</div>
	`)
}

function bindSearch() {
	const form = $('.js-search-form')
	if (!form.length) {
		return
	}

	form.on('submit', function handleSearch(event) {
		event.preventDefault()
		const query = String($('#search-input').val() || '').trim()

		if (!query) {
			const booksGrid = $('#books-grid')
			if (booksGrid.length) {
				$('#search-results').empty()
				toggleCatalogSection(true)
			}
			return
		}

		apiRequest(`/api/search?q=${encodeURIComponent(query)}`)
			.done((payload) => {
				if ($('#search-results').length) {
					renderSearchResults(payload)
					return
				}

				window.location.href = `/books?q=${encodeURIComponent(query)}`
			})
			.fail((xhr) => {
				window.alert(xhr.responseJSON?.error || 'Search failed.')
			})
	})

	$(document).on('click', '[data-suggestion]', function handleSuggestion() {
		$('#search-input').val($(this).data('suggestion'))
		form.trigger('submit')
	})
}

function bindLogout() {
	$(document).on('click', '[data-auth="logout"]', function handleLogout() {
		apiRequest('/api/logout', { method: 'POST' })
			.always(() => {
				setSession(null)
				updateAuthUI()
				window.location.href = '/login'
			})
	})
}

function enhanceBooksPage() {
	const booksGrid = $('#books-grid')
	if (!booksGrid.length) {
		return
	}

	const query = new URLSearchParams(window.location.search).get('q') || ''
	if (query) {
		toggleCatalogSection(false)
		apiRequest(`/api/search?q=${encodeURIComponent(query)}`).done((payload) => {
			renderSearchResults(payload)
		})
	} else {
		toggleCatalogSection(true)
	}
}

$(function initializeApp() {
	refreshSession().finally(() => {
		updateAuthUI()
		decorateAdminControls()
		bindSearch()
		bindLogout()
		bindAdminBookForm()
		bindDeleteButtons()
		enhanceBooksPage()
	})
})
