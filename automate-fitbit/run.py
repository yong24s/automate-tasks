import requests
import credentials
from datetime import date    

'''
    Get today date in yyyy-MM-dd
'''
def get_today_date():
    return date.today().isoformat()

def log_running_activity(date):
    headers = {'Authorization': 'Bearer ' + credentials.ACCESS_TOKEN}

    # Run
    # data = {'activityId': 90009, 'distance': 5, 'startTime': '06:00:00', 'durationMillis': 1*60*60*1000, 'date': date}

    # Rope Jumping
    # data = {'activityId': 15550, 'startTime': '08:30:00', 'durationMillis': 1*60*60*1000, 'date': date}
    
    # Run 8mph (7.5 min/mile)
    # data = {'activityId': 12090, 'distance': 10, 'startTime': '08:30:00', 'durationMillis': 1*60*60*1000, 'date': date}

    # Walk with speed 90013; Walk without speed 17160
    # data = {'activityId': 17160, 'startTime': '06:00:00', 'durationMillis': 2*60*60*1000, 'date': date}
    
#    data = {'activityId': 90013, 'distance':10, 'startTime': '06:00:00', 'durationMillis': 1*60*60*1000, 'date': date}

    data = {'activityId': 90009, 'distance': 5, 'startTime': '10:00:00', 'durationMillis': '299000', 'date': date}
    r = requests.post('https://api.fitbit.com/1/user/{}/activities.json'.format(credentials.USER_ID), headers=headers, data=data)
    print(r.status_code)
    print(r.text)

if __name__ == "__main__":
    log_running_activity(get_today_date())
