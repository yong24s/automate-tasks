import webbrowser
import credentials

if __name__ == "__main__":
    webbrowser.open('https://www.fitbit.com/oauth2/authorize?response_type=token&client_id={}&redirect_uri=http://127.0.0.1:8080&expires_in=31536000&scope=activity heartrate'.format(credentials.CLIENT_ID))
