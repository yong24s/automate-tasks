const credentials = require("./credentials.js")

const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false })

nightmare
  .cookies.set({
    name: 'GMKT.FRONT.SG',
    value: credentials.sid,
    url: 'https://.qoo10.sg'
  })
  .goto('https://www.qoo10.sg/gmkt.inc/Event/qchance.aspx')
  .evaluate(function () {
    window.frames[0].Attendance.Apply()
    window.frames[0].frames[0].RouletteQ.Apply()

    return 'Logged in as ' + document.querySelector('a.name').innerHTML;
  })
  .end()
  .then(console.log)
  .catch(error => {
    console.error('An error has occurred:', error)
  })
