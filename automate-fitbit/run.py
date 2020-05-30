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
		'startTime': '12:00',
		'steps': 12711
	}
  
    r = requests.post('https://api.fitbit.com/1/user/{}/activities.json'.format(credentials.USER_ID), headers=headers, data=data)
    print(r.status_code)
    print(r.text)

if __name__ == '__main__':
    log_running_activity(get_today_date())
