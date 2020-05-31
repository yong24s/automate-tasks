import requests
import credentials
from datetime import date    

'''
    Get today date in yyyy-MM-dd
'''
def get_today_date():
    return date.today().isoformat()

def log_running_activity(date, user_id, access_token):
    headers = {'Authorization': 'Bearer ' + access_token}

    data = {
        'activityId': 12030, # Run acivity
        'activityParentId': 90009,
        'activityParentName': 'Run',
        'calories': 1087,
        'description': 'Running - 5 mph (12 min/mile)',
        'distance': 15,
        'durationMillis': 7200000,
        'date': date,
        'hasStartTime': True,
        'isFavorite': False,
        'name': 'Run',
        'startTime': '06:00',
        'steps': 12711
    }
        
    r = requests.post('https://api.fitbit.com/1/user/{}/activities.json'.format(user_id), headers=headers, data=data)
    print(r.status_code)
    print(r.text)

if __name__ == '__main__':
    today_date = get_today_date()

    for token in credentials.TOKENS:
        user_id = token[1]
        access_token = token[2]
        log_running_activity(today_date, user_id, access_token)
