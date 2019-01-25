const credentials = require("./credentials.js")

const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

nightmare
  .goto('https://vitality.aia.com.sg/en/my-aia/login.html')
  .type('#aia1615612124', credentials.username)
  .type('#aia1223969016', credentials.password)
  .click('#btn1613811883')
  .wait(1000)
  .goto('https://vitality.aia.com.sg/en/vitality/fitness-devices.html')
  .wait(10000)
  .evaluate(function() {
    time = $('p.bt3.pTime')[0].innerText;
    latest_activity = $('ul.recent_points')[0].children[0].innerText;

    return time + '\n\n' + latest_activity;
  })
  .end()
  .then(console.log)  
  .catch(error => {
    console.error('An error has occurred:', error)
  })
