Sage = class Sage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.reveal(game, player_cards)

    if (player_cards.revealed_card) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed_card)} in their hand`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_all()

    delete player_cards.revealed_card
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    let all_player_cards = PlayerCardsModel.find(game._id)
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.revealed_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      let coin_cost = CostCalculator.calculate(game, card, all_player_cards)
      if (coin_cost >= 3) {
        player_cards.hand.push(card)
        player_cards.revealed_card = card
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (!_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    }
  }

}
