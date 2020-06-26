exports.pokerCompare = function (req, res) {
  
  let game = req.body;

  let errors = validateGame(game);

  if (errors.length > 0) {
    return res.json({ ok: false, errors: errors });
  }
  
  let player1Count = generateCounter();
  let player2Count = generateCounter();

  initialCount(game.player1Cards, player1Count);
  initialCount(game.player2Cards, player2Count);

  game.communityCards.forEach((card) => {
    communityCount(card, player1Count, game.player1Cards);
    communityCount(card, player2Count, game.player2Cards);
  });

  let player1Hand = evalHand(game.player1Cards, player1Count);
  let player2Hand = evalHand(game.player2Cards, player2Count);

  let winner;
  if (player1Hand.order < player2Hand.order) {
    winner = "Player 1";
  } else if (player1Hand.order > player2Hand.order) {
    winner = "Player 2";
  } else {
    if (player1Hand.highestCardValue > player2Hand.highestCardValue) {
      winner = "Player 1";
    } else if (player1Hand.highestCardValue < player2Hand.highestCardValue) {
      winner = "Player 2";
    } else {
      winner = "Draw";
    }
  }
  
  return res.json({
    ok: true,
    winner: winner,
    player1Hand: player1Hand,
    player2Hand: player2Hand,
  });
}

function validateGame(game) {
  errors = [];

  if (game.communityCards.length !== 5) {
    errors.push("Must have 5 community cards");
  }

  if (game.player1Cards.length !== 2) {
    errors.push("Player's 1 hand must have 2 cards");
  }

  if (game.player2Cards.length !== 2) {
    errors.push("Player's 2 hand must have 2 cards");
  }

  let allCards = game.communityCards.concat(game.player1Cards, game.player2Cards);

  let kinds = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let suits = ['Spades','Hearts','Clubs','Diamonds'];

  for (let card of allCards) {
    if (!kinds.includes(card.kind) || !suits.includes(card.suit)) {
      errors.push("There's some invalid cards in the input");
      return errors;
    }
  }

  let cardsSoFar = [];
  for (let card of allCards) {
    if (cardsSoFar.find(c => c.kind == card.kind && c.suit == card.suit)) {
      errors.push("There's some repeated cards in the input");
      break;
    } else {
      cardsSoFar.push(card);
    }
  }

  return errors;
}

function generateCounter() {
  return {
    suits: {},
    kinds: {},
  };
}

function initialCount(playerCards, counter) {
  playerCards.forEach((card) => {
    if (card.suit in counter.suits) {
      counter.suits[card.suit] += 1;
    } else {
      counter.suits[card.suit] = 1;
    }

    if (card.kind in counter.kinds) {
      counter.kinds[card.kind] += 1;
    } else {
      counter.kinds[card.kind] = 1;
    }
  });
}

function communityCount(card, counter, playerCards) {
  if (card.suit in counter.suits || card.kind in counter.kinds) {
    if (card.suit in counter.suits) {
      counter.suits[card.suit] += 1;
    } else {
      counter.suits[card.suit] = 1;
    }

    if (card.kind in counter.kinds) {
      counter.kinds[card.kind] += 1;
    } else {
      counter.kinds[card.kind] = 1;
    }
  }

  playerCards.push(card);
}

function evalHand(playerCards, counter) {
  let cardValues = {
    'A'  : 14,
    '2'  : 2,
    '3'  : 3,
    '4'  : 4,
    '5'  : 5,
    '6'  : 6,
    '7'  : 7,
    '8'  : 8,
    '9'  : 9,
    '10' : 10,
    'J'  : 11,
    'Q'  : 12,
    'K'  : 13,
  }

  let handSoFar = {
    order: 10,
    name: 'HighCard',
    cards: playerCards,
    highestCardValue: Math.max.apply(Math, playerCards.map(c => cardValues[c.kind])),
  }

  let cards;

  for (let suit in counter.suits) {
    if (counter.suits[suit] >= 5) {
      // Royal Straight Flush -> return
      cards = playerCards.filter(card => card.suit === suit);
      if (
        cards.find(card => card.kind === 'A') &&
        cards.find(card => card.kind === 'K') &&
        cards.find(card => card.kind === 'Q') &&
        cards.find(card => card.kind === 'J') &&
        cards.find(card => card.kind === '10')
      ) {
        return {
          order: 1,
          name: 'Royal Straight Flush',
          cards: ['A','K','Q','J','10'].map(kind => {
            return {
              suit: suit,
              kind: kind
            };
          }),
          highestCardValue: Infinity
        }
      }

      // Straight Flush -> return
      let straightFlush;
      cards.sort((a, b) => cardValues[a.kind] - cardValues[b.kind]);
      for (let i = 0; i <= cards.length-5; ++i) {
        straightFlush = true;
        for (let j = i+1; j < i+5; ++j) {
          if (cardValues[cards[j].kind] !== cardValues[cards[j-1].kind] + 1) {
            straightFlush = false;
            break;
          }
        }
        if (straightFlush) {
          return {
            order: 2,
            name: 'Straight Flush',
            cards: cards.slice(i, i+5),
            highestCardValue: Infinity,
          }
        }
      }
      // Flush
      handSoFar = {
        order: 5,
        name: 'Flush',
        cards: playerCards.filter(card => card.suit === suit).slice(0, 5),
        highestCardValue: (() => {
          let otherCards = playerCards.filter(card => card.suit !== suit);
          if (otherCards.length === 0) {
            return 0;
          }
          return Math.max.apply(Math, otherCards.map(c => cardValues[c.kind]));
        })()
      }
    }
  }

  // Straight
  if (handSoFar.order > 6) {
    let straight;
    cards = [...playerCards]
    cards = cards.sort((a, b) => cardValues[a.kind] - cardValues[b.kind]).reverse()
    for (let i = 0; i <= cards.length-5; ++i) {
      straight = true;
      for (let j = i+1; j < i+5; ++j) {
        if (cardValues[cards[j].kind] !== cardValues[cards[j-1].kind] + 1) {
          straight = false;
          break;
        }
      }
      if (straight) {
        handSoFar = {
          order: 6,
          name: 'Straight',
          cards: cards.slice(i, i+5),
          highestCardValue: cards[i]
        }
        break;
      }
    }
  }

  for (let kind in counter.kinds) {
    if (counter.kinds[kind] === 4) {
      // Four of a kind -> return
      cards = playerCards.filter(card => card.kind === kind);
      return {
        order: 3,
        name: 'Four of a kind',
        cards: cards,
        highestCardValue: cardValues[cards[0].kind]
      };
    } else if (counter.kinds[kind] === 3) {
      // Full House
      cards = playerCards.filter(card => card.kind === kind);
      for (let kind2 in counter.kinds) {
        if (counter.kinds[kind2] >= 2 && kind !== kind2) {
          if ((handSoFar.order === 4 && handSoFar.highestCardValue < cardValues[cards[0].kind] ) || handSoFar.order > 4) {
            handSoFar = {
              order: 4,
              name: 'Full House',
              cards: cards.concat(playerCards.filter(card => card.kind === kind2).slice(0,2)),
              highestCardValue: cardValues[cards[0].kind]
            }
          }
        }
      }

      // Three of a kind
      if ((handSoFar.order === 7 && handSoFar.highestCardValue < cardValues[cards[0].kind] ) || handSoFar.order > 4) {
        handSoFar = {
          order: 7,
          name: 'Three of a kind',
          cards: cards,
          highestCardValue: cardValues[cards[0].kind]
        }
      }
    } else if (counter.kinds[kind] === 2) {
      // Two Pairs
      cards = playerCards.filter(card => card.kind === kind);
      for (let kind2 in counter.kinds) {
        if (counter.kinds[kind2] == 2 && kind !== kind2) {
          if ((handSoFar.order === 8 && handSoFar.highestCardValue < cardValues[cards[0].kind] ) || handSoFar.order > 8) {
            handSoFar = {
              order: 8,
              name: 'Two Pairs',
              cards: cards.concat(playerCards.filter(card => card.kind === kind2)),
              highestCardValue: cardValues[cards[0].kind]
            }
          }
        }
      }

      // One Pair
      if ((handSoFar.order === 9 && handSoFar.highestCardValue < cardValues[cards[0].kind] ) || handSoFar.order > 9) {
        handSoFar = {
          order: 9,
          name: 'One Pair',
          cards: cards,
          highestCardValue: cardValues[cards[0].kind]
        }
      }
    }
  }

  return handSoFar;
}
