const client = init();

function init() {
	return supabase.createClient(
		'https://zjesbzduygemrdprcvvq.supabase.co',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXNiemR1eWdlbXJkcHJjdnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQ5OTUyNDMsImV4cCI6MTk4MDU3MTI0M30.wtkQQpQMKYsjYyxG8PA4bcGY5OHEcVaywHuAYoIQLh0'
	);
}

const form = document.querySelector('form')

async function supabaseLogin(obj) {
	client.auth.signInWithPassword({
		email: obj.email,
		password: obj.password
	})
		.then((response) => {
			if (response.error == null) {
				const button = document.getElementById('submit-btn')
				button.innerHTML = 'Logging In'
				redirect(obj)
			}

			else {
				alert("Incorrect password. Please try again")
				document.getElementById("pass").value = "";
			}
		})
}

async function redirect(obj) {
	await client
		.from('Users')
		.select('Role')
		.eq('Email', obj.email)
		.then((response) => {
			if (response.data[0].Role === "Donor") {
				window.location.href = "donorpage.html"
			}
			else if(response.data[0].Role === "Admin") {
				window.location.href = "admin.html"
			}
			else {
				window.location.href = "volunteerpage.html"
			}
		}
	)
}


function logIn() {
	form.addEventListener("submit", (event) => {
		event.preventDefault()
		const formData = new FormData(form)
		const email = formData.get("email")
		const password = formData.get("pass")
		client
			.from('Users')
			.select('Email')
			.eq('Email', email)
			.then((response) => {
				if (response.data.length == 0) {
					alert("Email does not exist. Please sign up")
					console.log(response)
					console.log(email)
					setTimeout(() => {
						window.location.href = "signup.html"
					}, 3000)
				}
				else {
					supabaseLogin({ email, password })
				}
			})
	})
}

function donorPage(obj) {
	console.log(obj)
	const welcome = document.getElementById('welcome')
	const displayEmail = document.getElementById('email')
	const displayName = document.getElementById('name')
	const displayAmount = document.getElementById('amountdonated')
	const displayPoints = document.getElementById('points')
	client
		.from('Users')
		.select('id,First_Name , Last_Name')
		.eq('Email', obj.email)
		.then((response) => {
			welcome.innerHTML = "Welcome " + response.data[0].First_Name.charAt(0).toUpperCase() + response.data[0].First_Name.slice(1),
				displayName.innerHTML = `Name: ${response.data[0].First_Name} ${response.data[0].Last_Name}`,
				displayEmail.innerHTML = `Email: ${obj.email}`

			client
				.from('Donors')
				.select('amount_donated,points')
				.eq('id', response.data[0].id)
				.then((response) => {
					displayAmount.innerHTML = `Amount Donated: $${response.data[0].amount_donated}`,
						displayPoints.innerHTML = `Points: ${response.data[0].points}`
				})
		})

}

function volunteerPage(obj) {
	console.log(obj)
	const welcome = document.getElementById('welcome')
	const displayEmail = document.getElementById('email')
	const displayName = document.getElementById('name')
	const displaySpecialization = document.getElementById('specialization')
	const displayRequest = document.getElementById('request')
	client
		.from('Users')
		.select('id,First_Name , Last_Name')
		.eq('Email', obj.email)
		.then((response) => {
			welcome.innerHTML = "Welcome " + response.data[0].First_Name.charAt(0).toUpperCase() + response.data[0].First_Name.slice(1),
				displayName.innerHTML = `Name: ${response.data[0].First_Name} ${response.data[0].Last_Name}`,
				displayEmail.innerHTML = `Email: ${obj.email}`

			client
				.from('Volunteers')
				.select('Duty, Department')
				.eq('id', response.data[0].id)
				.then((response) => {
					console.log(response)
					displaySpecialization.innerHTML = `Specialization: ${response.data[0].Department}`
					// console.log(response.data[0].Duty)
					if (response.data[0].Duty !== null) {
						displayRequest.innerHTML = `Request: ${response.data[0].Duty}`
					}
					else {
						displayRequest.innerHTML = `Request: None`
					}
				})
		})
}


const logoutBtn = document.getElementById('logout-btn')
// logoutBtn.addEventListener('click', logOut)

function logOut() {
	client.auth.signOut()
		.then(() => {
			window.location.href = "index.html"
		})
}

if (window.location.href.includes('login.html')) {
	logIn()
}
if (window.location.href.includes('donorpage.html')) {
	client.auth.onAuthStateChange((event, session) => {
		if (session) {
			donorPage(session.user)
		}
	})
}
if (window.location.href.includes('volunteerpage.html')) {
	client.auth.onAuthStateChange((event, session) => {
		if (session) {
			volunteerPage(session.user)
		}
	})
}