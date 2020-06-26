# Poker-face

Utility to help poker newbies

Author: [Pedro Basilio de Camargo Neto](https://github.com/artiumdominus)

## How to run

Is expected that you have [node](https://nodejs.org/) installed in your machine

**install dependencies:**
` $ npm install `

**run the app**
` $ npm start `

The app will be running at [http://localhost:3000/](http://localhost:3000/)

## Querying

The communication between back-end and front-end happens in the endpoint: `/poker-compare`.

The server accepts inputs in the following model:
```ruby

Game :: {
  'communityCards' : [Card],
  'player1Cards'   : [Card],
  'player2cards'   : [Card]
}

Card :: {
  'kind' : Kind,
  'suit' : Suit,
}

Kind :: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

Suit :: 'Spades' | 'Hearts' | 'Clubs' | 'Diamonds'

```

And will output an answer in the following model:
```ruby
Results :: ResultsWithWinner | ResultsWithErrors

ResultsWithWinner :: {
  'ok'     : true,
  'winner' : Winner,
  'player1Hand' : Hand,
  'player2Hand' : Hand
}

ResultsWithErrors :: {
  'ok'     : false,
  'errors' : [String]
}

Winner :: 'Player 1' | 'Player 2' | 'Draw'

Hand :: {
  'order' : Integer,
  'name'  : String,
  'cards' : [Card],
  'highestCardValue': Integer
}

```
