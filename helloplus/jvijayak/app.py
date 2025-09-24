from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# This is our "database" for this simple example
# In a real app, you would store this securely
valid_username = "user"
valid_password = "password"

@app.route('/')
def login_page():
    # This function renders the login form
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    # Get the username and password from the submitted form
    username = request.form.get('username')
    password = request.form.get('password')

    # Check if the credentials match our hardcoded values
    if username == valid_username and password == valid_password:
        # If they match, redirect to the success page
        return redirect(url_for('success_page'))
    else:
        # If not, redirect back to the login page
        return "Invalid credentials. <a href='/'>Try again</a>"

@app.route('/success')
def success_page():
    # This is the "blank page" you requested
    return "<h1>Login Successful!</h1>"

if __name__ == '__main__':
    # Run the Flask app on localhost:5000
    app.run(debug=True)