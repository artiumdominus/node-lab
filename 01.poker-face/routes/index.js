var express = require('express');
var router = express.Router();

var poker = require('../controllers/poker.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Poker face', description: 'Poker hand comparing tool' });
});

/* POST poker queries. */
router.post('/poker-compare', poker.pokerCompare);

module.exports = router;
