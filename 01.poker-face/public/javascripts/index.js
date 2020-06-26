var kinds = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
var suits = ['Spades','Hearts','Clubs','Diamonds'];
var suit_entities = {
  'Spades'   : '&spades;',
  'Hearts'   : '<span style="color:crimson">&hearts;</span>',
  'Clubs'    : '&clubs;',
  'Diamonds' : '<span style="color:crimson">&diams;</span>'
};


function initCardDropdown(id) {
  let dropdown = document.getElementById(id);
  
  for (let suit of suits) {
    for (let kind of kinds) {
      let option = document.createElement('option');
      option.value = kind + " " + suit;
      option.innerHTML = kind + " " + suit_entities[suit];
      dropdown.appendChild(option);
    }
  }
}

['community-cards', 'player1-cards', 'player2-cards']
  .forEach((selectId) => initCardDropdown(selectId) );

$('#community-cards')
  .dropdown({
    maxSelections: 5
  })
;

$('#player1-cards')
  .dropdown({
    maxSelections: 2
  })
;

$('#player2-cards')
  .dropdown({
    maxSelections: 2
  })
;

function compareCards(ev) {
  ev.preventDefault();
  
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let responseElement = document.getElementById('response');
      responseElement.classList.remove(...responseElement.classList);
      responseElement.innerHTML = '';

      let response = JSON.parse(this.responseText);
      if (response.ok) {
        responseElement.classList.add("ui","info","message");

        let header = document.createElement('div');
        header.classList.add('header');
        header.innerHTML = 'Winner: <strong>' + response.winner + '</strong>';

        let playersList = document.createElement('ul');
        playersList.classList.add('list');

        let player1Info = document.createElement('li');
        let player1Text = document.createTextNode('Player 1');
        player1Info.appendChild(player1Text);
        let player1Game = document.createElement('ul');
        let player1Hand = document.createElement('li');
        player1Hand.innerHTML = 'Hand: ' + response.player1Hand.name;
        let player1Cards = document.createElement('li');
        player1Cards.innerHTML = 'Cards: ' + renderCards(response.player1Hand.cards);
        player1Game.appendChild(player1Hand);
        player1Game.appendChild(player1Cards);
        player1Info.appendChild(player1Game);

        let player2Info = document.createElement('li');
        let player2Text = document.createTextNode('Player 2');
        player2Info.appendChild(player2Text);
        let player2Game = document.createElement('ul');
        let player2Hand = document.createElement('li');
        player2Hand.innerHTML = 'Hand: ' + response.player2Hand.name;
        let player2Cards = document.createElement('li');
        player2Cards.innerHTML = 'Cards: ' + renderCards(response.player2Hand.cards);
        player2Game.appendChild(player2Hand);
        player2Game.appendChild(player2Cards);
        player2Info.appendChild(player2Game);

        playersList.appendChild(player1Info);
        playersList.appendChild(player2Info);

        responseElement.appendChild(header);
        responseElement.appendChild(playersList);
      } else {
        responseElement.classList.add("ui","negative","message");

        let ul = document.createElement('ul');
        ul.classList.add('list');

        for (let error of response.errors) {
          let li = document.createElement('li');
          li.innerHTML = error;
          ul.appendChild(li);
        }

        responseElement.appendChild(ul);
      }
    }
  }
  xhttp.open('POST', '/poker-compare', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(getGame()));
}

document.getElementById('compare-button').addEventListener('click', compareCards);

function getGame() {
  return {
    communityCards: getCards('#community-cards'),
    player1Cards: getCards('#player1-cards'),
    player2Cards: getCards('#player2-cards')
  };
}

function getCards(selectId) {
  return $(selectId).dropdown('get value').map((textCard) => {
    let splittedCard = textCard.split(' ');
    return {
      kind: splittedCard[0],
      suit: splittedCard[1]
    };
  });
}

function renderCards(cardList) {
  return cardList.map((card) => {
    return ' ' + card.kind + ' ' + suit_entities[card.suit] + ' ';
  })
}
